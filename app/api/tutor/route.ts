import { generateLesson, resolveModels, TutorError } from "@/lib/openrouter";
import {
  MAX_TOPIC_LENGTH,
  isSubject,
  studentErrorMessage,
  type TutorErrorCode,
  type TutorFailure,
  type TutorSuccess,
} from "@/lib/tutor";

/** POST is never cached by Next, but be explicit for the GET health check too. */
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;

const isDev = process.env.NODE_ENV !== "production";

/**
 * Per-instance limiter. Enough to stop a stuck client from draining the
 * OpenRouter quota in dev; on serverless each instance keeps its own counter,
 * so swap in a shared store (Upstash, Vercel KV) for real production traffic.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

/**
 * `detail` carries the raw upstream text — useful while developing, but it names
 * models and account limits, so it is dropped in production and the student only
 * ever sees the translated `error`.
 */
function fail(code: TutorErrorCode, status: number, detail?: string): Response {
  const body: TutorFailure = {
    ok: false,
    code,
    error: studentErrorMessage(code),
    ...(isDev && detail ? { detail } : {}),
  };

  return Response.json(body, { status });
}

export async function POST(request: Request): Promise<Response> {
  if (isRateLimited(clientKey(request))) {
    return fail("RATE_LIMITED", 429, "Local rate limit: 12 requests per minute.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_INPUT", 400, "Request body must be valid JSON.");
  }

  const record =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const rawTopic = record.topic;
  if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
    return fail(
      "BAD_INPUT",
      400,
      'Send a non-empty `topic` string, for example { "topic": "Pendulum" }.',
    );
  }

  const topic = rawTopic.trim().slice(0, MAX_TOPIC_LENGTH);
  const rawSubject = record.subject;
  const subject =
    typeof rawSubject === "string" && isSubject(rawSubject)
      ? rawSubject
      : undefined;

  try {
    const { lesson, model } = await generateLesson(topic, subject);
    return Response.json({ ok: true, model, ...lesson } satisfies TutorSuccess);
  } catch (error: unknown) {
    if (error instanceof TutorError) {
      // Always logged in full, regardless of what the browser is told.
      console.error(`[tutor] request failed (${error.code}): ${error.message}`);
      return fail(error.code, error.status, error.message);
    }

    console.error("[tutor] unexpected failure", error);
    return fail(
      "UPSTREAM",
      500,
      "Unexpected server error while generating the lesson.",
    );
  }
}

/**
 * Development-only config check: confirms the key is loaded and shows the model
 * chain, without revealing the key. Returns 404 in production so a deployed app
 * does not advertise its configuration.
 */
export async function GET(): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  return Response.json({
    apiKeyLoaded: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
    models: resolveModels(),
    overrideEnv: "OPENROUTER_MODEL",
  });
}
