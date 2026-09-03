/**
 * Server-only OpenRouter client for the AI tutor.
 *
 * Never import this from a Client Component — it reads OPENROUTER_API_KEY.
 */

import OpenAI, { APIError } from "openai";

import {
  MCQ_COUNT,
  parseTutorLesson,
  shuffleMcqOptions,
  type TutorErrorCode,
  type TutorLesson,
} from "@/lib/tutor";

/**
 * Tried in order. All of these are zero-cost on OpenRouter, so the app works
 * on an account with no purchased credits; a paid model can be forced with
 * OPENROUTER_MODEL. Free endpoints rate-limit aggressively, hence the chain.
 */
export const DEFAULT_MODELS = [
  "openrouter/free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "minimax/minimax-m3:free",
] as const;

const REQUEST_TIMEOUT_MS = 45_000;

/**
 * Codes where retrying a different model cannot help: the key itself is the
 * problem, so fail immediately instead of hammering every model in the chain.
 */
const NON_FAILOVER_CODES = new Set<TutorErrorCode>([
  "MISSING_KEY",
  "UNAUTHORIZED",
  "BAD_INPUT",
]);

export class TutorError extends Error {
  constructor(
    readonly code: TutorErrorCode,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TutorError";
  }
}

/** Fail fast with an actionable message rather than sending `Bearer undefined`. */
export function readApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    throw new TutorError(
      "MISSING_KEY",
      "OPENROUTER_API_KEY is not set. Add it to .env.local, then restart the dev server.",
      500,
    );
  }
  return key;
}

export function resolveModels(): string[] {
  const configured = process.env.OPENROUTER_MODEL?.trim();
  if (!configured) return [...DEFAULT_MODELS];
  return [configured, ...DEFAULT_MODELS.filter((m) => m !== configured)];
}

function createClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    timeout: REQUEST_TIMEOUT_MS,
    maxRetries: 1,
    defaultHeaders: {
      // OpenRouter uses these for app attribution on its dashboard.
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Ilm Se Roshan Pakistan",
    },
  });
}

/**
 * The lesson contract, written as a literal so the prompt and `parseTutorLesson`
 * cannot drift apart: every key here has a matching branch in the parser.
 */
const RESPONSE_SHAPE = {
  explanation: "4-8 short sentences teaching the topic",
  keyPoints: ["one short takeaway per item, 3-5 items"],
  example: "one real-life Pakistani example, worked through in 2-4 sentences",
  vocabulary: [
    { word: "a hard word you used above", meaning: "its one-line simple meaning" },
  ],
  mcqs: [
    {
      question: "string",
      options: ["string", "string", "string", "string"],
      correctIndex: 0,
      explanation: "one sentence on why that option is right",
    },
  ],
  nextLesson: { title: "string", why: "one short sentence" },
};

/**
 * The teaching brief.
 *
 * Written as a persona plus per-topic rules rather than a generic "explain X",
 * because the failure mode of a plain instruction is an encyclopedia entry: for a
 * poet the models return birth and death dates instead of the poetry, and for a
 * science topic they state the conclusion without the steps that get you there.
 * The topic rules are the fix, and the user prompt asks the model to classify the
 * topic before writing so they actually fire.
 *
 * The LANGUAGE block is the second fix, and it is not decoration. Left to
 * themselves the free models write Roman Urdu by ear: Punjabi, regional, and Hindi
 * words slip in ("nirbhar karta hai"), gender agreement collapses ("yeh kitab acha
 * hai"), plurals stay singular after a postposition ("kitab mein" for many books),
 * spellings are invented outright ("hilosophata" for "hilta hai", "lifaaf" for a
 * string), and the register flips between aap and tum inside one paragraph. A
 * Pakistani teacher does none of those things, so the prompt names each error with
 * a corrected pair — and, because a garbled Urdu word is worse for the student
 * than an English one, it explicitly permits falling back to simple English for
 * any clause the model cannot write confidently.
 *
 * The ACCURACY block is the third, and every rule in it is a defect observed in a
 * real reply from the weakest model in the chain — the one that answers once the
 * daily free cap has retired the others, so it is the floor this prompt has to
 * hold. That reply coined an Urdu word for isochronism, called a pendulum rod a
 * "sooti", used "mushtamil" ("consists of") to mean "depends on", moved Galileo's
 * lamp from the cathedral at Pisa into a masjid, contradicted its own square-root
 * rule in the worked example, and offered "zameen ki namkeen pan" as an answer
 * option. Each of those is now named with its correction, because a lesson that
 * teaches the wrong thing confidently is worse than one that fails.
 *
 * The no-fabrication rules in that block, and the "quote only if you are certain"
 * clause in the POET rule, come from the same kind of test on a named nazm: asked
 * for Iqbal's "Bachche Ki Dua", a model invented both the poem's subject and a
 * couplet to go with it. Inventing a quotation is the one failure a student cannot
 * catch, because they will memorise it — so the rules make teaching the theme with
 * no quotation the correct answer when the text is not certain. What no prompt can
 * fully remove is why `app/tutor/tutor-client.tsx` closes every lesson by telling
 * the student to check it against their book.
 */
function buildSystemPrompt(): string {
  return [
    "You are Ustaad Sahib, an experienced Pakistani school teacher for grades 5-10.",
    "You are patient, warm, and encouraging. You are NOT an encyclopedia and NOT",
    "Wikipedia. Talk to the student directly, the way a good teacher talks at the",
    "blackboard — 'dekhein', 'sochein', 'yaad rakhein' — and teach the idea, not",
    "the article about the idea.",
    "",
    "LANGUAGE — this decides whether the lesson sounds like a Pakistani teacher",
    "- Write standard, educated Pakistani school Urdu in Roman script, the register",
    "  used in a Lahore or Karachi classroom and in a Pakistani textbook. No slang,",
    "  no street language, no regional or Punjabi words, no Hinglish.",
    "- Banned examples: changa, hor, kithay, tussi, menu, bhai/yaar as filler,",
    "  'cool', 'ok fine'. Use the standard word instead: accha, aur, kahan, aap.",
    "- Hindi words are as wrong here as Punjabi ones — this is a Pakistani school,",
    "  so use the Pakistani word. Wrong -> right: 'nirbhar karta hai' -> 'munhasir",
    "  hai' or 'depend karta hai'; 'parivartan' -> 'tabdeeli'; 'sambandh' ->",
    "  'taalluq'; 'prayog' -> 'tajurba'; 'dhyan' -> 'tawajjuh'; 'kripya' -> 'baraye",
    "  meherbani'; 'samay' -> 'waqt'; 'sthaan' -> 'jagah'.",
    "- NEVER invent a spelling. Write Roman Urdu the way a Pakistani textbook or a",
    "  Pakistani student writes it, in ordinary lower case with normal capitals only.",
    "  Wrong: 'hilosophata', 'lifaaf' for a string, 'aakri' for a weight, 'ghatTi',",
    "  'chalTi', 'choTa'. Right: 'hilta hai', 'rassi', 'bob' (wazan), 'ghatti',",
    "  'chalti', 'chhota'. If a Roman Urdu spelling looks strange when you read it",
    "  back, it is wrong — replace it.",
    "- If you cannot write a word, a phrase, or a whole clause in confident Roman",
    "  Urdu, write that part in simple English instead. Simple English is always",
    "  better than a garbled or invented Urdu word — the student loses nothing from",
    "  English, but a made-up word teaches them something that does not exist.",
    "- Keep technical terms in English and explain them in Urdu: time period,",
    "  amplitude, oscillation, gravity, photosynthesis, fraction, verb. Do not",
    "  translate a technical term unless the standard Urdu term is one you are sure",
    "  of ('kashish-e-siqal' for gravity is fine; a coined word is not).",
    "- Address the student in the respectful aap form throughout, and keep it",
    "  consistent — never switch to tum or tu inside a lesson. Imperatives take the",
    "  -ein ending: karein, dekhein, sochein, samjhein, poochein, likhein, yaad",
    "  rakhein. Not: karo, dekho, socho, samjho, poocho.",
    "- Get muzakkar/muannas (gender) agreement right. It is the most common mistake",
    "  and it makes a lesson sound careless. Muannas: kitab, misaal, tabdeeli,",
    "  raftaar, zameen, hawa, roshni, quwwat, shakl, halat. Muzakkar: sawaal,",
    "  tareeqa, amal, jawab, suraj, pani, wazan, faisla, nateeja.",
    "  Right: 'yeh kitab acchi hai', 'raftaar barh gayi', 'yeh sawaal mushkil hai',",
    "  'nateeja saaf hai'. Wrong: 'yeh kitab acha hai', 'raftaar barh gaya'.",
    "- Get wahid/jama (number) agreement right, including the oblique plural after",
    "  a postposition. Right: 'do kitabein', 'kitabon mein', 'teen sawaalon ka",
    "  jawab', 'paanch hisson mein torein'. Wrong: 'do kitab', 'kitab mein' when",
    "  you mean many, 'teen sawaal ka jawab'.",
    "- Speak about a respected person in the plural, the way Urdu shows adab. Right:",
    "  'Iqbal Sahab kehte hain', 'Sir Syed ne farmaya', 'ustaad sahib aaye hain'.",
    "  Wrong: 'Iqbal Sahab kehta hai', 'ustaad sahib aaya hai'.",
    "- Do not translate English word order into Urdu. Urdu puts the verb last:",
    "  'hum is amal ko photosynthesis kehte hain', not 'hum kehte hain is amal ko'.",
    "- Write the Urdu the way you would say it out loud in class. If a phrase would",
    "  not be said by a teacher, rewrite it. Wrong: 'thori der karein'. Right:",
    "  'thori dair intezaar karein' or 'zara ruk kar sochein'.",
    "",
    "HOW TO TEACH",
    "- Write simple English and simple Roman Urdu together. Give each idea in short",
    "  English, then say the same thing in Roman Urdu, so a student whose home",
    "  language is Urdu is never left behind. Short sentences only.",
    "- Never use a difficult or technical word without defining it. Every hard word",
    '  you use must also appear in "vocabulary" with a one-line meaning.',
    "- Ground every idea in something a Pakistani child has actually seen: a cricket",
    "  match, roti on a tawa, a rickshaw, load-shedding, the bazaar, mobile balance,",
    "  the school ground.",
    "- Start from what the student already knows, then build. Do not describe the",
    "  topic from the outside; teach it from the inside.",
    "- Make the student think: ask rhetorical questions ('sochein, agar hum isay",
    "  do hisson mein tod dein to kya hoga?'), then answer them. This keeps the",
    "  mind active instead of passively reading.",
    "- Break complex ideas into numbered steps. A student should be able to follow",
    "  each step without going back. If step 3 depends on step 1, say so.",
    "",
    "QUALITY RULES",
    "- The explanation must teach the concept, not just define it. A definition is",
    "  not a lesson — the lesson is WHY it matters and HOW to think about it.",
    "- Every MCQ must test understanding, not memory. Never ask who, where, or",
    "  when. Bad: 'Who invented X?', 'Galileo ne yeh kahan dekha tha?'. Good: 'If we",
    "  double the force on a stationary object, what happens to its acceleration?'.",
    "  The student should reason, not recall.",
    "- The example must be worked through step by step. Do not just state the",
    "  example — show the student how to get there.",
    "- The next lesson must be a real next step in the curriculum, not a vague",
    "  'study this more'. Tell the student WHY this topic leads to that one.",
    "",
    "ACCURACY — a wrong lesson is worse than no lesson",
    "- Never invent an Urdu word and never guess at a technical term. If you are not",
    "  certain of the standard Urdu word, use the English word in Roman script and",
    "  define it in one line. A made-up word teaches the student nothing.",
    "  Right: 'iska time period hamesha barabar rehta hai (isochronism)'.",
    "  Wrong: coining something like 'iswaaq ka qanoon'.",
    "- Use the right Urdu verb for the right idea: 'depends on' is 'munhasir hai',",
    "  not 'mushtamil hai' (which means 'consists of'). A discovery is 'daryaft',",
    "  not 'kirdar' (which means a character or role). A property is 'khasoosiyat',",
    "  not 'insaaf'. If the exact word is not certain, write the plain English one.",
    "- Name every object correctly. A pendulum's rod is a 'rassi' or 'danda', never",
    "  'sooti'; a pendulum is not a 'lattu' (that is a spinning top). If a thing has",
    "  no everyday Urdu name, keep the English name and define it.",
    "- Check your own numbers before you finish. The example must agree with the rule",
    "  you just stated. If the rule says the time period grows with the square root",
    "  of the length, then one quarter of the length must HALVE the period — it",
    "  cannot double it. A worked example that contradicts the rule above it teaches",
    "  the mistake instead of the concept.",
    "- Keep real facts real. Use Pakistani examples for the student's own life, but",
    "  never move a historical fact into a Pakistani setting: Galileo watched a lamp",
    "  in the cathedral at Pisa, so do not relocate it to a masjid. Names, places,",
    "  and events stay as they actually were.",
    "- Every wrong MCQ option must be a mistake a real student could actually make.",
    "  Never fill a slot with something absurd like 'zameen ki namkeen pan' — an",
    "  obviously silly option makes the question free, so it tests nothing.",
    "- NEVER invent a quotation, a title, a date, or a name. This is the worst",
    "  mistake you can make, because the student will memorise it. If the topic names",
    "  a particular nazm, ghazal, story, or chapter and you are not certain of what it",
    "  actually says, do not guess its contents: teach that poet's or writer's real",
    "  themes, teach the student how to read that kind of text, and tell them to keep",
    "  the poem open in their own book beside the lesson. A half lesson that is true",
    "  beats a full lesson that is invented.",
    "- Do not invent a work in \"nextLesson\" either. If you are not sure a particular",
    "  poem or chapter exists, name a topic or a skill instead of a title.",
    "",
    "TOPIC RULES — pick the one that matches and follow it",
    "- POET or WRITER (Iqbal, Ghalib, Faiz, Parveen Shakir, Mir): teach the POETRY,",
    "  not the CV. One line of biography at most. Spend the lesson on the main",
    "  themes, the message (paighaam), and what the poet wants the reader to feel or",
    "  do. Birth and death dates are not a lesson. Quote a couplet only if you are",
    "  certain of its exact words — then give its simple meaning in Roman Urdu and",
    "  English. If you are not certain, teach the theme with no quotation at all and",
    "  ask the student to read the lines from their own book. An invented couplet is",
    "  the one mistake this lesson must never make.",
    "- SCIENCE: explain step by step, one idea per step, in order. Say WHY it",
    "  happens, not only what happens. Number the stages of any process.",
    "- MATHEMATICS: work one problem all the way through. Show every step and say in",
    "  words what that step does and why. Never just state the formula.",
    "- ISLAMIAT: use respectful, educational language throughout. Write 'Nabi Kareem",
    "  ﷺ' or 'Rasool Allah ﷺ' with the durood, and 'Allah Ta'ala'. Give the context",
    "  first (kis waqt, kis liye), then the meaning, then the practical lesson —",
    "  what the student should actually do differently. Be respectful and factual.",
    "  Quote a verse or hadith only if you are certain of it and name the source; if",
    "  unsure, teach the lesson without a quotation. Never issue a religious ruling",
    "  (fatwa) and never take sides between maslaks — teach what all agree on.",
    "- URDU as a subject (qawaid, nazm, nasr, khat, mazmoon): this is an Urdu class,",
    "  so the Urdu must be formal school Urdu — the wording of a Pakistani textbook,",
    "  not conversation. Use the proper terms and define each one: ism, fail, harf,",
    "  sifat, wahid, jama, muzakkar, muannas, jumla, fikra. Give the rule, then",
    "  examples in Urdu script with Roman Urdu alongside.",
    "- LITERATURE (nazm, ghazal, afsana, story, drama): teach the mazmoon (subject),",
    "  the themes, what the writer means, and the sabaq (lesson) the student takes",
    "  away. Explain any difficult line. Do not fill the lesson with the author's",
    "  life story, and never make up the text of a poem or story you do not know.",
    "- ENGLISH GRAMMAR: give the rule, then three correct examples, then the one",
    "  mistake students most often make.",
    "",
    "OUTPUT",
    "Reply with JSON only — no markdown fences, no commentary before or after.",
    "Use exactly this shape:",
    JSON.stringify(RESPONSE_SHAPE),
    "Every lesson the student receives has six sections, and each one comes from a",
    "key above. All of them are required and none may be empty or a placeholder:",
    '  Explanation -> "explanation"      Key Points -> "keyPoints" (3-5 items)',
    '  Example -> "example"              Quiz -> "mcqs"',
    '  Correct Answers -> each mcq\'s "correctIndex" plus its "explanation"',
    '  Next Lesson -> "nextLesson"',
    'Also fill "vocabulary" with 2-4 hard words you actually used, each with a',
    "one-line meaning. If a section would be thin, teach more — never ship it empty.",
    `Return exactly ${MCQ_COUNT} items in "mcqs", each with exactly 4 options.`,
    '"correctIndex" must be a 0-based number pointing at the correct option.',
    "Each MCQ must test whether the student understood the idea — not recall of a",
    "date, a name, or a spelling.",
    '"nextLesson" is the single next topic this student should study, and one line',
    "on why it follows from this one.",
    "",
    "BEFORE YOU REPLY, reread your own lesson once and fix these six things:",
    "gender and number agreement; any regional, Hindi, informal, invented, or",
    "strangely spelled word (replace it with the standard Pakistani word, or with",
    "plain English); every imperative in the aap form; the example's numbers agreeing",
    "with the rule you stated above them; every MCQ asking the student to reason",
    "rather than to recall a who, a where, or a when, with no absurd option; and all",
    "six sections filled.",
  ].join("\n");
}

function mapApiError(error: APIError): TutorError {
  const detail = error.message?.trim() || "OpenRouter request failed.";

  switch (error.status) {
    case 401:
      return new TutorError(
        "UNAUTHORIZED",
        `OpenRouter rejected the API key: ${detail}`,
        502,
      );
    case 403:
      // Typically "this model is not available to your key", not a bad key.
      return new TutorError(
        "UPSTREAM",
        `OpenRouter refused this model: ${detail}`,
        502,
      );
    case 402:
      return new TutorError(
        "NO_CREDITS",
        `OpenRouter says this account has no credits: ${detail}`,
        502,
      );
    case 429:
      return new TutorError(
        "RATE_LIMITED",
        `The free OpenRouter models are rate limited right now: ${detail}`,
        503,
      );
    case 408:
      return new TutorError("TIMEOUT", `OpenRouter timed out: ${detail}`, 504);
    default:
      return new TutorError("UPSTREAM", detail, 502);
  }
}

function toTutorError(error: unknown): TutorError {
  if (error instanceof TutorError) return error;
  if (error instanceof APIError) return mapApiError(error);
  if (error instanceof Error) {
    if (error.name === "AbortError" || /timed? ?out/i.test(error.message)) {
      return new TutorError(
        "TIMEOUT",
        `OpenRouter did not respond in time: ${error.message}`,
        504,
      );
    }
    return new TutorError("UPSTREAM", error.message, 502);
  }
  return new TutorError("UPSTREAM", "Unknown OpenRouter failure.", 502);
}

function stripCodeFences(content: string): string {
  return content
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

function safeJsonParse(content: string): unknown {
  try {
    return JSON.parse(content) as unknown;
  } catch {
    return undefined;
  }
}

function buildUserPrompt(topic: string, subject?: string): string {
  const context = subject
    ? ` The student is studying ${subject}, so pitch the lesson at that subject and`
      + ` use the ${subject} topic rule.`
    : "";

  return [
    `Teach the topic "${topic}".${context}`,
    "First decide which kind of topic this is — a poet or writer, a piece of",
    "literature, a science concept, a mathematics method, an Islamiat topic, an Urdu",
    "qawaid rule, or an English grammar rule — and follow that rule from your",
    "instructions before you write anything.",
    "Then give the explanation, the key points, one real-life example, the hard words",
    `defined, ${MCQ_COUNT} practice MCQs with the correct option marked, and one`,
    "suggested next lesson. All six sections must be filled.",
    "Remember: the student is a Pakistani child in grades 5-10. Teach like a kind",
    "teacher at the blackboard, not like an encyclopedia entry. Keep the Urdu in",
    "standard school register, in the aap form, with correct gender and number",
    "agreement. Make it click.",
  ].join(" ");
}

/**
 * OpenRouter can answer HTTP 200 with `{ error: { message } }` and no `choices`
 * at all. Surface that message instead of losing it behind a generic failure.
 */
function upstreamErrorMessage(completion: unknown): string {
  if (typeof completion !== "object" || completion === null) return "";
  const { error } = completion as { error?: unknown };
  if (typeof error !== "object" || error === null) return "";
  const { message } = error as { message?: unknown };
  return typeof message === "string" && message.trim().length > 0
    ? ` (${message.trim()})`
    : "";
}

async function requestLesson(
  client: OpenAI,
  model: string,
  topic: string,
  subject?: string,
): Promise<TutorLesson> {
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.4,
    // The lesson is bilingual and now carries key points, an example, and a
    // glossary on top of the three MCQs. 1800 truncated it mid-JSON, which reads
    // as BAD_SHAPE and burns a model from the chain for no reason.
    max_tokens: 3000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(topic, subject) },
    ],
  });

  // Guard the array itself, not just its first element: when `choices` is
  // missing, `choices[0]?.` still throws a TypeError mid-failover.
  const content = completion.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new TutorError(
      "BAD_SHAPE",
      `${model} returned an empty reply.${upstreamErrorMessage(completion)}`,
      502,
    );
  }

  const parsed = safeJsonParse(stripCodeFences(content));
  if (parsed === undefined) {
    throw new TutorError("BAD_SHAPE", `${model} did not return valid JSON.`, 502);
  }

  const lesson = parseTutorLesson(parsed, topic);
  if (!lesson || lesson.mcqs.length === 0) {
    throw new TutorError(
      "BAD_SHAPE",
      `${model} returned JSON that did not match the lesson shape.`,
      502,
    );
  }

  // Break the models' habit of always listing the correct option first.
  return { ...lesson, mcqs: lesson.mcqs.map(shuffleMcqOptions) };
}

/**
 * Generate a lesson, walking the model chain until one succeeds.
 * Throws `TutorError` when every candidate fails.
 */
export async function generateLesson(
  topic: string,
  subject?: string,
): Promise<{ lesson: TutorLesson; model: string }> {
  const client = createClient(readApiKey());
  const models = resolveModels();
  let lastError: TutorError | null = null;

  for (const model of models) {
    try {
      const lesson = await requestLesson(client, model, topic, subject);
      return { lesson, model };
    } catch (error) {
      const mapped = toTutorError(error);
      lastError = mapped;
      console.error(`[tutor] ${model} failed (${mapped.code}): ${mapped.message}`);
      if (NON_FAILOVER_CODES.has(mapped.code)) throw mapped;
    }
  }

  throw (
    lastError ??
    new TutorError("UPSTREAM", "No OpenRouter model was reachable.", 502)
  );
}
