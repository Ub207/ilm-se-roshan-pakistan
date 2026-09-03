/**
 * Shared tutor types + runtime validation.
 *
 * Safe to import from both Server and Client Components: no `process.env`
 * access and no server-only imports live here.
 */

export const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Urdu",
  "Islamiat",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export function isSubject(value: string): value is Subject {
  return (SUBJECTS as readonly string[]).includes(value);
}

/** A single generated multiple-choice question. */
export type TutorMcq = {
  question: string;
  /** Exactly four answer choices. */
  options: string[];
  /** Index into `options` of the correct choice, 0-3. */
  correctIndex: number;
  /** Why that choice is correct, for the reveal panel. */
  explanation: string;
};

/** The full lesson payload the model is asked to produce. */
export type TutorLesson = {
  topic: string;
  explanation: string;
  mcqs: TutorMcq[];
  nextLesson: { title: string; why: string };
};

export type TutorErrorCode =
  | "BAD_INPUT"
  | "MISSING_KEY"
  | "NO_CREDITS"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "TIMEOUT"
  | "BAD_SHAPE"
  | "UPSTREAM";

export type TutorSuccess = TutorLesson & {
  ok: true;
  /** Which model actually answered, after any fallback. */
  model: string;
};

export type TutorFailure = {
  ok: false;
  code: TutorErrorCode;
  /** Student-facing, already translated. Safe to render as-is. */
  error: string;
  /** Raw upstream text. Development only — never sent in production. */
  detail?: string;
};

export type TutorApiResponse = TutorSuccess | TutorFailure;

/**
 * What the student reads when a lesson fails.
 *
 * Upstream messages are written for developers ("429 Rate limit exceeded:
 * free-models-per-day. Add 10 credits...") and leak account billing detail, so
 * they never reach the browser in production — the route logs them and sends one
 * of these instead, in the same Roman-Urdu register as the rest of the app.
 */
const TUTOR_ERROR_MESSAGES: Record<TutorErrorCode, string> = {
  BAD_INPUT: "Topic theek nahi laga. Ek chhota, saaf topic likhein — jaise Pendulum.",
  MISSING_KEY:
    "Tutor abhi configure nahi hua. Admin ko batayein ke API key set karni hai.",
  NO_CREDITS:
    "AI ka aaj ka free quota khatam ho gaya. Tab tak Quiz aur Report chalte rahenge — kal dobara try karein.",
  RATE_LIMITED:
    "Bohat requests aa gayi hain. Ek minute rukein, phir dobara try karein.",
  UNAUTHORIZED:
    "AI service ne request qubool nahi ki. Admin ko API key check karni hogi.",
  TIMEOUT:
    "AI ne waqt par jawab nahi diya. Dobara try karein — aksar doosri koshish chal jati hai.",
  BAD_SHAPE:
    "AI ka jawab adhoora aaya. Dobara try karein, ya topic thora simple likhein.",
  UPSTREAM:
    "AI service se baat nahi ho saki. Thori der baad dobara koshish karein.",
};

/** Never throws: an unknown code falls back to the generic upstream message. */
export function studentErrorMessage(code: TutorErrorCode): string {
  return TUTOR_ERROR_MESSAGES[code] ?? TUTOR_ERROR_MESSAGES.UPSTREAM;
}

/** Longest topic we forward upstream, to bound prompt size and cost. */
export const MAX_TOPIC_LENGTH = 120;

export const MCQ_COUNT = 3;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function parseMcq(raw: unknown): TutorMcq | null {
  if (!isRecord(raw)) return null;

  const question = cleanString(raw.question);
  const explanation = cleanString(raw.explanation) ?? "";
  if (!question) return null;

  if (!Array.isArray(raw.options)) return null;
  const options = raw.options.map(cleanString);
  if (options.length !== 4 || options.some((option) => option === null)) {
    return null;
  }

  // Models sometimes answer with "B" or "2" instead of a 0-based index.
  const correctIndex = normaliseCorrectIndex(raw.correctIndex);
  if (correctIndex === null) return null;

  return {
    question,
    options: options as string[],
    correctIndex,
    explanation,
  };
}

function normaliseCorrectIndex(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value >= 0 && value <= 3 ? value : null;
  }
  if (typeof value === "string") {
    const letter = value.trim().toUpperCase();
    const fromLetter = ["A", "B", "C", "D"].indexOf(letter);
    if (fromLetter !== -1) return fromLetter;

    const asNumber = Number(letter);
    if (Number.isInteger(asNumber) && asNumber >= 0 && asNumber <= 3) {
      return asNumber;
    }
  }
  return null;
}

/**
 * Validate a parsed JSON blob from the model into a `TutorLesson`.
 * Returns `null` when the shape is unusable so the caller can fail loudly
 * instead of rendering `undefined` into the page.
 */
export function parseTutorLesson(
  raw: unknown,
  topic: string,
): TutorLesson | null {
  if (!isRecord(raw)) return null;

  const explanation = cleanString(raw.explanation);
  if (!explanation) return null;

  const mcqSource = Array.isArray(raw.mcqs) ? raw.mcqs : [];
  const mcqs = mcqSource
    .map(parseMcq)
    .filter((mcq): mcq is TutorMcq => mcq !== null)
    .slice(0, MCQ_COUNT);

  const nextLessonRaw = isRecord(raw.nextLesson) ? raw.nextLesson : {};
  const nextLesson = {
    title: cleanString(nextLessonRaw.title) ?? "Revise this topic once more",
    why:
      cleanString(nextLessonRaw.why) ??
      "Practising the same topic again fixes the basics before moving on.",
  };

  return { topic, explanation, mcqs, nextLesson };
}

/**
 * Fisher-Yates over one question's options, with `correctIndex` following the
 * answer to its new slot.
 *
 * Every model tested puts the correct choice first, so an unshuffled lesson is
 * answerable with "always pick A" — the practice questions only teach something
 * once the position is random. Kept out of `parseTutorLesson` so validation stays
 * deterministic; the OpenRouter client applies this after a lesson validates.
 */
export function shuffleMcqOptions(mcq: TutorMcq): TutorMcq {
  const answer = mcq.options[mcq.correctIndex];
  const options = [...mcq.options];

  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { ...mcq, options, correctIndex: options.indexOf(answer) };
}
