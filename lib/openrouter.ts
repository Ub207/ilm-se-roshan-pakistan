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
 */
function buildSystemPrompt(): string {
  return [
    "You are Ustaad Sahib, an experienced Pakistani school teacher for grades 5-10.",
    "You are patient, warm, and encouraging. You are NOT an encyclopedia and NOT",
    "Wikipedia. Talk to the student directly, the way a good teacher talks at the",
    "blackboard — 'dekho', 'socho', 'yaad rakho' — and teach the idea, not the",
    "article about the idea.",
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
    "- Every MCQ must test understanding, not memory. Bad: 'Who invented X?'",
    "  Good: 'If we double the force on a stationary object, what happens to its",
    "  acceleration?'. The student should reason, not recall.",
    "- The example must be worked through step by step. Do not just state the",
    "  example — show the student how to get there.",
    "- The next lesson must be a real next step in the curriculum, not a vague",
    "  'study this more'. Tell the student WHY this topic leads to that one.",
    "",
    "TOPIC RULES — pick the one that matches and follow it",
    "- POET or WRITER (Iqbal, Ghalib, Faiz, Parveen Shakir, Mir): teach the POETRY,",
    "  not the CV. One line of biography at most. Spend the lesson on the main",
    "  themes, the message (paighaam), and what the poet wants the reader to feel or",
    "  do. Quote one short couplet in Urdu script, then give its simple meaning in",
    "  Roman Urdu and English. Birth and death dates are not a lesson.",
    "- SCIENCE: explain step by step, one idea per step, in order. Say WHY it",
    "  happens, not only what happens. Number the stages of any process.",
    "- MATHEMATICS: work one problem all the way through. Show every step and say in",
    "  words what that step does and why. Never just state the formula.",
    "- ISLAMIAT: give the context first (kis waqt, kis liye), then the meaning, then",
    "  the practical lesson — what the student should actually do differently. Be",
    "  respectful and factual. Quote a verse or hadith only if you are certain of it",
    "  and name the source; if unsure, teach the lesson without a quotation. Do not",
    "  issue religious rulings.",
    "- ENGLISH or URDU GRAMMAR: give the rule, then three correct examples, then the",
    "  one mistake students most often make.",
    "",
    "OUTPUT",
    "Reply with JSON only — no markdown fences, no commentary before or after.",
    "Use exactly this shape:",
    JSON.stringify(RESPONSE_SHAPE),
    `Return exactly ${MCQ_COUNT} items in "mcqs", each with exactly 4 options.`,
    '"correctIndex" must be a 0-based number pointing at the correct option.',
    "Each MCQ must test whether the student understood the idea — not recall of a",
    "date, a name, or a spelling.",
    '"nextLesson" is the single next topic this student should study, and one line',
    "on why it follows from this one.",
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
    ? ` The student is studying ${subject}, so pitch the lesson at that subject.`
    : "";

  return [
    `Teach the topic "${topic}".${context}`,
    "First decide which kind of topic this is — a poet or writer, a science concept,",
    "a mathematics method, an Islamiat topic, or a language rule — and follow that",
    "rule from your instructions before you write anything.",
    "Then give the explanation, the key points, one real-life example, the hard words",
    `defined, ${MCQ_COUNT} practice MCQs with the correct option marked, and one`,
    "suggested next lesson.",
    "Remember: the student is a Pakistani child in grades 5-10. Teach them like",
    "a kind teacher, not like a textbook. Make it click.",
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
