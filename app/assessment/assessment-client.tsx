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
      <div className="card p-6 text-center sm:p-8">
        <span className="medallion mx-auto h-12 w-12">
          <QuizIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-3.5 text-lg font-semibold">
          Abhi koi record nahi hai
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted">
          Ek quiz mukammal karein — uske baad score, strong areas, weak areas aur
          agla lesson yahan aa jayega.
        </p>
        <Link href="/quiz" className="btn btn-lg btn-primary mt-5">
          Quiz shuru karein
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-rise space-y-4">
      <section className="card card-pad">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Overall score</h2>
            <p className="mt-1 text-sm text-muted">
              {gradeLabel(summary.percent)}
            </p>
          </div>
          <p className="text-4xl font-bold tracking-tight tabular-nums">
            {summary.percent}
            <span className="text-xl font-semibold text-muted">%</span>
          </p>
        </div>

        <div aria-hidden="true" className="track mt-4">
          <div
            className="track-fill"
            style={{ width: `${summary.percent}%` }}
          />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-control border border-hairline p-3">
            <dt className="text-muted">Sahi jawab</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
              {summary.correct} / {summary.total}
            </dd>
          </div>
          <div className="rounded-control border border-hairline p-3">
            <dt className="text-muted">Quiz attempts</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
              {summary.attempts}
            </dd>
          </div>
          <div className="rounded-control border border-hairline p-3">
            <dt className="text-muted">Aakhri quiz</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
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

      <section
        aria-labelledby="next-lesson-heading"
        className="card-accent card-pad rounded-panel"
      >
        <p className="eyebrow">
          <TargetIcon className="h-4 w-4" />
          Recommended next lesson
        </p>
        <h2 id="next-lesson-heading" className="mt-1.5 text-lg font-semibold">
          {summary.nextLesson
            ? summary.nextLesson.topic
            : "Naya topic try karein"}
        </h2>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-foreground/80">
          {summary.nextLesson
            ? `${summary.nextLesson.subject} — is topic mein ${summary.nextLesson.correct}/${summary.nextLesson.total} sahi hue. Tutor se dobara samjhein.`
            : "Sab topics theek ja rahe hain. Koi naya topic tutor se poochein."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href={
              summary.nextLesson
                ? `/tutor?subject=${encodeURIComponent(summary.nextLesson.subject)}&topic=${encodeURIComponent(summary.nextLesson.topic)}`
                : "/tutor"
            }
            className="btn btn-primary"
          >
            <BookIcon className="h-5 w-5" />
            Tutor se parhein
          </Link>
          <Link href="/quiz" className="btn btn-secondary">
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
  const headingId = `topic-list-${tone}`;

  return (
    <section aria-labelledby={headingId} className="card card-pad">
      <h2
        id={headingId}
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
        <p className="mt-2 text-sm leading-relaxed text-muted">{empty}</p>
      ) : (
        <ul className="mt-3.5 space-y-3">
          {topics.map((stat) => (
            <li key={`${stat.subject}/${stat.topic}`}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="font-medium">{stat.topic}</span>{" "}
                  <span className="text-muted">· {stat.subject}</span>
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
                  {stat.correct}/{stat.total} · {stat.percent}%
                </span>
              </div>
              {/*
                Mastery per topic, so a 40% and an 80% weak area do not look
                alike at a glance. Decoration over the numbers on the same row,
                hence aria-hidden. The utilities layer beats `.track-fill`'s
                green, which is how the weak column turns amber.
              */}
              <div
                aria-hidden="true"
                className={`track mt-1.5 ${isStrong ? "" : "bg-amber-100 dark:bg-amber-950"}`}
              >
                <div
                  className={`track-fill ${isStrong ? "" : "bg-amber-500 dark:bg-amber-400"}`}
                  style={{ width: `${stat.percent}%` }}
                />
              </div>
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
    // The wrapper stays mounted across both states, so it can be the live
    // region: swapping the trigger for the confirmation would otherwise be a
    // silent change for a screen reader.
    <div aria-live="polite" className="flex flex-wrap items-center gap-3 pt-2">
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
            className="btn border border-red-400 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/60"
          >
            Haan, delete karein
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="btn btn-quiet"
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
