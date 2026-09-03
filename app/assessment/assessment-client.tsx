"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  QuizIcon,
  TargetIcon,
  WarningIcon,
} from "@/components/icons";
import {
  clearAttempts,
  getAttemptsSnapshot,
  getServerAttemptsSnapshot,
  subscribeAttempts,
  summarise,
  type TopicStat,
} from "@/lib/progress";
import { gradeLabel } from "@/lib/quiz";

export default function AssessmentClient() {
  // `localStorage` is unreadable during the server render, so history arrives via
  // an external store instead of an effect: the first client render still matches
  // the server's empty output, and clearing history re-renders on its own.
  // The store hands back a cached array, so `summarise` runs only on real change.
  const attempts = useSyncExternalStore(
    subscribeAttempts,
    getAttemptsSnapshot,
    getServerAttemptsSnapshot,
  );
  const summary = useMemo(() => summarise(attempts), [attempts]);

  if (summary.total === 0) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface p-6 text-center shadow-clay sm:p-8">
        <QuizIcon className="mx-auto h-8 w-8 text-pk-700 dark:text-pk-300" />
        <h2 className="mt-3 text-lg font-semibold">Abhi koi record nahi hai</h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
          Ek quiz mukammal karein — uske baad score, strong areas, weak areas aur
          agla lesson yahan aa jayega.
        </p>
        <Link
          href="/quiz"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-pk-900 px-5 py-2.5 font-semibold text-white shadow-clay transition-all duration-200 hover:bg-pk-800 hover:shadow-clay-lg active:translate-y-px"
        >
          Quiz shuru karein
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-hairline bg-surface p-5 shadow-clay sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Overall score</h2>
            <p className="mt-1 text-sm text-muted">{gradeLabel(summary.percent)}</p>
          </div>
          <p className="text-4xl font-bold tracking-tight">
            {summary.percent}
            <span className="text-xl font-semibold text-muted">%</span>
          </p>
        </div>

        <div
          aria-hidden="true"
          className="mt-4 h-2.5 overflow-hidden rounded-full bg-pk-100 dark:bg-pk-950"
        >
          <div
            className="h-full rounded-full bg-pk-700 transition-all duration-300 dark:bg-pk-400"
            style={{ width: `${summary.percent}%` }}
          />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-hairline p-3">
            <dt className="text-muted">Sahi jawab</dt>
            <dd className="mt-0.5 text-lg font-semibold">
              {summary.correct} / {summary.total}
            </dd>
          </div>
          <div className="rounded-xl border border-hairline p-3">
            <dt className="text-muted">Quiz attempts</dt>
            <dd className="mt-0.5 text-lg font-semibold">{summary.attempts}</dd>
          </div>
          <div className="rounded-xl border border-hairline p-3">
            <dt className="text-muted">Aakhri quiz</dt>
            <dd className="mt-0.5 text-lg font-semibold">
              {summary.lastAttemptAt
                ? new Date(summary.lastAttemptAt).toLocaleDateString()
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <TopicList
          title="Strong areas"
          empty="Abhi koi topic strong nahi — thori mashq aur."
          topics={summary.strong}
          tone="strong"
        />
        <TopicList
          title="Needs improvement"
          empty="Shabash — koi weak area nahi mila."
          topics={summary.weak}
          tone="weak"
        />
      </div>

      <section className="rounded-2xl border border-pk-200 bg-pk-50 p-5 shadow-clay sm:p-6 dark:border-pk-800 dark:bg-pk-950/60">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-pk-700 dark:text-pk-300">
          <TargetIcon className="h-4 w-4" />
          Recommended next lesson
        </p>
        <h2 className="mt-1.5 text-lg font-semibold">
          {summary.nextLesson
            ? summary.nextLesson.topic
            : "Naya topic try karein"}
        </h2>
        <p className="mt-1 text-sm text-foreground/80">
          {summary.nextLesson
            ? `${summary.nextLesson.subject} — is topic mein ${summary.nextLesson.correct}/${summary.nextLesson.total} sahi hue. Tutor se dobara samjhein.`
            : "Sab topics theek ja rahe hain. Koi naya topic tutor se poochhein."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href={
              summary.nextLesson
                ? `/tutor?subject=${encodeURIComponent(summary.nextLesson.subject)}&topic=${encodeURIComponent(summary.nextLesson.topic)}`
                : "/tutor"
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-pk-900 px-5 py-2.5 font-semibold text-white shadow-clay transition-all duration-200 hover:bg-pk-800 hover:shadow-clay-lg active:translate-y-px"
          >
            <BookIcon className="h-5 w-5" />
            Tutor se parhein
          </Link>
          <Link
            href="/quiz"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-hairline bg-surface px-5 py-2.5 font-semibold transition-colors duration-200 hover:border-pk-400"
          >
            <QuizIcon className="h-5 w-5" />
            Quiz dobara
          </Link>
        </div>
      </section>

      <ResetHistory onCleared={clearAttempts} />
    </div>
  );
}

type TopicListProps = {
  title: string;
  empty: string;
  topics: TopicStat[];
  tone: "strong" | "weak";
};

function TopicList({ title, empty, topics, tone }: TopicListProps) {
  const isStrong = tone === "strong";

  return (
    <section className="rounded-2xl border border-hairline bg-surface p-5 shadow-clay sm:p-6">
      <h2
        className={`flex items-center gap-2 font-semibold ${isStrong ? "text-pk-800 dark:text-pk-200" : "text-amber-700 dark:text-amber-300"}`}
      >
        {isStrong ? (
          <CheckIcon className="h-5 w-5" />
        ) : (
          <WarningIcon className="h-5 w-5" />
        )}
        {title}
      </h2>

      {topics.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {topics.map((stat) => (
            <li
              key={`${stat.subject}/${stat.topic}`}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <span className="min-w-0">
                <span className="font-medium">{stat.topic}</span>{" "}
                <span className="text-muted">· {stat.subject}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-muted">
                {stat.correct}/{stat.total} · {stat.percent}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ResetHistory({ onCleared }: { onCleared: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      {confirming ? (
        <>
          <p className="text-sm text-muted">
            Poori history delete kar dein? Yeh wapas nahi aayegi.
          </p>
          <button
            type="button"
            onClick={() => {
              onCleared();
              setConfirming(false);
            }}
            className="min-h-11 rounded-xl border border-red-400 px-4 py-2 text-sm font-semibold text-red-700 transition-colors duration-200 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/60"
          >
            Haan, delete karein
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="min-h-11 rounded-xl border border-hairline px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:border-pk-400"
          >
            Rehne dein
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="min-h-11 text-sm font-medium text-muted underline decoration-hairline underline-offset-4 transition-colors duration-200 hover:text-foreground"
        >
          Progress history clear karein
        </button>
      )}
    </div>
  );
}
