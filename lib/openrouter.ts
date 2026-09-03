/**
 * Server-only OpenRouter client for the AI tutor.
 *
 * Never import this from a Client Component — it reads OPENROUTER_API_KEY.
 */

import OpenAI, { APIError } from "openai";

import {
  MCQ_COUNT,
  parseTutorLesson,
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

function buildSystemPrompt(): string {
  return [
    "You are an AI tutor for Pakistani school students (grades 5-10).",
    "Explain clearly in simple English, mixing in Roman Urdu for the tricky parts,",
    "and use everyday Pakistani examples (cricket, roti, bazaar, rickshaw).",
    "Reply with JSON only — no markdown fences, no commentary.",
    "Use exactly this shape:",
    JSON.stringify({
      explanation: "4-8 short sentences explaining the topic",
      mcqs: [
        {
          question: "string",
          options: ["string", "string", "string", "string"],
          correctIndex: 0,
          explanation: "one sentence on why that option is right",
        },
      ],
      nextLesson: { title: "string", why: "one short sentence" },
    }),
    `Return exactly ${MCQ_COUNT} items in "mcqs", each with exactly 4 options.`,
    '"correctIndex" must be a 0-based number pointing at the correct option.',
  ].join(" ");
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
  const context = subject ? ` The student is studying ${subject}.` : "";
  return `Teach the topic "${topic}".${context} Give the explanation, ${MCQ_COUNT} practice MCQs, and one suggested next lesson.`;
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
    max_tokens: 1800,
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

  return lesson;
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
