/**
 * Quiz history in `localStorage`, and the roll-up the report page renders.
 *
 * There is no account system, so progress is per-browser by design. Every read
 * revalidates the stored shape: a stale or hand-edited entry must not be able to
 * crash the report.
 */

import { isSubject, type Subject } from "@/lib/tutor";

export type AttemptAnswer = {
  questionId: string;
  subject: Subject;
  topic: string;
  correct: boolean;
};

export type QuizAttempt = {
  id: string;
  /** Subject filter the round was taken with, or "All subjects". */
  scope: string;
  /** ISO timestamp. */
  at: string;
  answers: AttemptAnswer[];
};

const STORAGE_KEY = "irp.quiz-attempts.v1";

/** Keep history bounded so the key cannot grow without limit. */
const MAX_ATTEMPTS = 25;

/** At or above this percentage a topic counts as a strong area. */
export const STRONG_THRESHOLD = 70;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAnswer(raw: unknown): AttemptAnswer | null {
  if (!isRecord(raw)) return null;
  const { questionId, subject, topic, correct } = raw;
  if (typeof questionId !== "string" || questionId.length === 0) return null;
  if (typeof subject !== "string" || !isSubject(subject)) return null;
  if (typeof topic !== "string" || topic.length === 0) return null;
  if (typeof correct !== "boolean") return null;
  return { questionId, subject, topic, correct };
}

function parseAttempt(raw: unknown): QuizAttempt | null {
  if (!isRecord(raw)) return null;
  const { id, scope, at, answers } = raw;
  if (typeof id !== "string" || typeof scope !== "string") return null;
  if (typeof at !== "string" || Number.isNaN(Date.parse(at))) return null;
  if (!Array.isArray(answers)) return null;

  const parsed = answers
    .map(parseAnswer)
    .filter((answer): answer is AttemptAnswer => answer !== null);
  if (parsed.length === 0) return null;

  return { id, scope, at, answers: parsed };
}

export function loadAttempts(): QuizAttempt[] {
  if (typeof window === "undefined") return EMPTY_ATTEMPTS;
  try {
    return parseAttempts(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // Private-mode denials and corrupt JSON both land here; an empty history is
    // the right fallback either way.
    return EMPTY_ATTEMPTS;
  }
}

const EMPTY_ATTEMPTS: QuizAttempt[] = [];

function parseAttempts(raw: string | null): QuizAttempt[] {
  if (!raw) return EMPTY_ATTEMPTS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_ATTEMPTS;
    return parsed
      .map(parseAttempt)
      .filter((attempt): attempt is QuizAttempt => attempt !== null);
  } catch {
    return EMPTY_ATTEMPTS;
  }
}

const listeners = new Set<() => void>();

/** Cached so `getAttemptsSnapshot` is referentially stable between writes. */
let snapshotRaw: string | null = null;
let snapshotValue: QuizAttempt[] = EMPTY_ATTEMPTS;

function notify(): void {
  for (const listener of listeners) listener();
}

/**
 * `useSyncExternalStore` plumbing. Reading storage this way — rather than in an
 * effect that calls `setState` — keeps the render path free of cascading renders
 * and picks up writes from other tabs for free.
 */
export function subscribeAttempts(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function getAttemptsSnapshot(): QuizAttempt[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshotValue = parseAttempts(raw);
  }
  return snapshotValue;
}

/** Server render (and hydration) has no storage, so history starts empty. */
export function getServerAttemptsSnapshot(): QuizAttempt[] {
  return EMPTY_ATTEMPTS;
}

export function saveAttempt(attempt: QuizAttempt): void {
  if (typeof window === "undefined") return;

  try {
    const next = [...loadAttempts(), attempt].slice(-MAX_ATTEMPTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    notify();
  } catch {
    // Storage full or blocked — the quiz result on screen is still correct.
  }
}

export function clearAttempts(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    notify();
  } catch {
    // Nothing useful to do if removal is blocked.
  }
}

export type TopicStat = {
  topic: string;
  subject: Subject;
  correct: number;
  total: number;
  /** Rounded 0-100. */
  percent: number;
};

export type ProgressSummary = {
  attempts: number;
  correct: number;
  total: number;
  percent: number;
  strong: TopicStat[];
  weak: TopicStat[];
  /** Weakest topic, i.e. what to study next. `null` when nothing is weak. */
  nextLesson: TopicStat | null;
  lastAttemptAt: string | null;
};

export const EMPTY_SUMMARY: ProgressSummary = {
  attempts: 0,
  correct: 0,
  total: 0,
  percent: 0,
  strong: [],
  weak: [],
  nextLesson: null,
  lastAttemptAt: null,
};

/** Aggregate every stored answer by topic to produce the report. */
export function summarise(attempts: QuizAttempt[]): ProgressSummary {
  if (attempts.length === 0) return EMPTY_SUMMARY;

  const byTopic = new Map<string, TopicStat>();
  let correct = 0;
  let total = 0;

  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      total += 1;
      if (answer.correct) correct += 1;

      const key = `${answer.subject}/${answer.topic}`;
      const stat = byTopic.get(key) ?? {
        topic: answer.topic,
        subject: answer.subject,
        correct: 0,
        total: 0,
        percent: 0,
      };
      stat.total += 1;
      if (answer.correct) stat.correct += 1;
      stat.percent = Math.round((stat.correct / stat.total) * 100);
      byTopic.set(key, stat);
    }
  }

  const stats = [...byTopic.values()];
  const strong = stats
    .filter((stat) => stat.percent >= STRONG_THRESHOLD)
    .sort((a, b) => b.percent - a.percent);
  const weak = stats
    .filter((stat) => stat.percent < STRONG_THRESHOLD)
    .sort((a, b) => a.percent - b.percent);

  const lastAttemptAt = attempts
    .map((attempt) => attempt.at)
    .sort()
    .at(-1) ?? null;

  return {
    attempts: attempts.length,
    correct,
    total,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
    strong,
    weak,
    nextLesson: weak[0] ?? null,
    lastAttemptAt,
  };
}
