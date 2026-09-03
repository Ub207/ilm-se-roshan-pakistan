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
  error: string;
};

export type TutorApiResponse = TutorSuccess | TutorFailure;

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
