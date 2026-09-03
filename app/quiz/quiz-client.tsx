"use client";

import Link from "next/link";
import { useState } from "react";

import {
  ArrowRightIcon,
  ChartIcon,
  CheckIcon,
  CrossIcon,
  RetryIcon,
  TargetIcon,
} from "@/components/icons";
import { McqOption, OPTION_LETTERS } from "@/components/mcq-option";
import { saveAttempt, type AttemptAnswer } from "@/lib/progress";
import {
  ALL_SUBJECTS,
  QUIZ_SCOPES,
  buildRound,
  gradeLabel,
  type QuizQuestion,
  type QuizScope,
} from "@/lib/quiz";

type Phase = "setup" | "playing" | "done";

export default function QuizClient() {
  const [scope, setScope] = useState<QuizScope>(ALL_SUBJECTS);
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});

  /**
   * Rounds are built here rather than during render: `buildRound` shuffles, so
   * rendering it on the server and again on the client would not match.
   */
  function start(nextScope: QuizScope) {
    setScope(nextScope);
    setQuestions(buildRound(nextScope));
    setIndex(0);
    setPicks({});
    setPhase("playing");
  }

  function finish() {
    const answers: AttemptAnswer[] = questions.map((question, position) => ({
      questionId: question.id,
      subject: question.subject,
      topic: question.topic,
      correct: picks[position] === question.correctIndex,
    }));

    saveAttempt({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      scope,
      at: new Date().toISOString(),
      answers,
    });
    setPhase("done");
  }

  const correctCount = questions.filter(
    (question, position) => picks[position] === question.correctIndex,
  ).length;

  if (phase === "setup") {
    return (
      <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-clay sm:p-6">
        <fieldset>
          <legend className="text-base font-semibold">Subject chunein</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUIZ_SCOPES.map((option) => {
              const active = scope === option;
              return (
                <label
                  key={option}
                  className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pk-600 ${
                    active
                      ? "border-pk-900 bg-pk-900 text-white"
                      : "border-hairline hover:border-pk-400 hover:bg-pk-50 dark:hover:bg-pk-950"
                  }`}
                >
                  <input
                    type="radio"
                    name="quiz-scope"
                    value={option}
                    checked={active}
                    onChange={() => setScope(option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => start(scope)}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-pk-900 px-5 py-2.5 font-semibold text-white shadow-clay transition-all duration-200 hover:bg-pk-800 hover:shadow-clay-lg active:translate-y-px"
        >
          Quiz shuru karein
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  if (phase === "playing") {
    const question = questions[index];
    // Defensive: a subject with no bank entries would leave the round empty.
    if (!question) return null;

    const chosen = picks[index];
    const answered = chosen !== undefined;
    const isLast = index === questions.length - 1;
    const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;

    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <p className="font-medium">
              Sawal {index + 1} / {questions.length}
            </p>
            <p className="text-muted">{scope}</p>
          </div>
          <div
            aria-hidden="true"
            className="mt-2 h-2 overflow-hidden rounded-full bg-pk-100 dark:bg-pk-950"
          >
            <div
              className="h-full rounded-full bg-pk-700 transition-all duration-300 dark:bg-pk-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-clay sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-pk-700 dark:text-pk-300">
            {question.subject} · {question.topic}
          </p>

          <fieldset className="mt-2">
            <legend className="text-lg font-semibold">
              {question.question}
            </legend>
            <div className="mt-3.5 grid gap-2">
              {question.options.map((option, optionIndex) => (
                <McqOption
                  key={optionIndex}
                  name={`quiz-${question.id}`}
                  optionIndex={optionIndex}
                  option={option}
                  chosen={chosen}
                  correctIndex={question.correctIndex}
                  onSelect={() =>
                    setPicks((prev) =>
                      prev[index] === undefined
                        ? { ...prev, [index]: optionIndex }
                        : prev,
                    )
                  }
                />
              ))}
            </div>
          </fieldset>

          <div aria-live="polite">
            {answered && (
              <p className="mt-3.5 flex gap-2.5 rounded-xl bg-pk-50 px-3.5 py-2.5 text-sm text-pk-900 dark:bg-pk-950 dark:text-pk-100">
                <span className="mt-0.5 shrink-0">
                  {chosen === question.correctIndex ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CrossIcon className="h-4 w-4" />
                  )}
                </span>
                <span>
                  <strong className="font-semibold">
                    {chosen === question.correctIndex
                      ? "Sahi jawab! "
                      : `Sahi jawab ${OPTION_LETTERS[question.correctIndex]} tha. `}
                  </strong>
                  {question.explanation}
                </span>
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={!answered}
            onClick={() => (isLast ? finish() : setIndex(index + 1))}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-pk-900 px-5 py-2.5 font-semibold text-white shadow-clay transition-all duration-200 hover:bg-pk-800 hover:shadow-clay-lg active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isLast ? "Result dekhein" : "Agla sawal"}
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const firstWrong = questions.find(
    (question, position) => picks[position] !== question.correctIndex,
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-pk-200 bg-pk-50 p-5 text-center shadow-clay sm:p-6 dark:border-pk-800 dark:bg-pk-950/60">
        <p className="text-xs font-semibold uppercase tracking-wide text-pk-700 dark:text-pk-300">
          Result — {scope}
        </p>
        <p className="mt-2 text-5xl font-bold tracking-tight">
          {correctCount}
          <span className="text-2xl font-semibold text-muted">/{total}</span>
        </p>
        <p className="mt-1 text-lg font-semibold">{percent}%</p>
        <p className="mt-1 text-muted">{gradeLabel(percent)}</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => start(scope)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-pk-900 px-5 py-2.5 font-semibold text-white shadow-clay transition-all duration-200 hover:bg-pk-800 hover:shadow-clay-lg active:translate-y-px"
          >
            <RetryIcon className="h-5 w-5" />
            Dobara koshish karein
          </button>
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-hairline bg-surface px-5 py-2.5 font-semibold transition-colors duration-200 hover:border-pk-400"
          >
            Naya subject
          </button>
          <Link
            href="/assessment"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-hairline bg-surface px-5 py-2.5 font-semibold transition-colors duration-200 hover:border-pk-400"
          >
            <ChartIcon className="h-5 w-5" />
            Report dekhein
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="review-heading"
        className="rounded-2xl border border-hairline bg-surface p-5 shadow-clay sm:p-6"
      >
        <h2 id="review-heading" className="text-lg font-semibold">
          Review
        </h2>
        <ol className="mt-3 space-y-3">
          {questions.map((question, position) => {
            const pick = picks[position];
            const ok = pick === question.correctIndex;

            return (
              <li
                key={question.id}
                className="flex items-start gap-2.5 rounded-xl border border-hairline p-3.5"
              >
                <span
                  className={`mt-0.5 shrink-0 ${ok ? "text-pk-700 dark:text-pk-300" : "text-red-600 dark:text-red-400"}`}
                >
                  {ok ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <CrossIcon className="h-5 w-5" />
                  )}
                  <span className="sr-only">{ok ? "Sahi" : "Ghalat"}</span>
                </span>
                <div className="min-w-0">
                  <p className="font-medium">
                    {position + 1}. {question.question}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Sahi jawab: {OPTION_LETTERS[question.correctIndex]} —{" "}
                    {question.options[question.correctIndex]}
                    {!ok && pick !== undefined && (
                      <> · Aap ne {OPTION_LETTERS[pick]} chuna</>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {question.subject} · {question.topic}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {firstWrong && (
        <section className="rounded-2xl border border-hairline bg-surface p-5 shadow-clay sm:p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-pk-700 dark:text-pk-300">
            <TargetIcon className="h-4 w-4" />
            Yahan kami rah gayi
          </p>
          <h2 className="mt-1.5 text-lg font-semibold">{firstWrong.topic}</h2>
          <p className="mt-1 text-sm text-muted">
            AI Tutor se yeh topic dobara samjhein, phir quiz repeat karein.
          </p>
          <Link
            href={`/tutor?subject=${encodeURIComponent(firstWrong.subject)}&topic=${encodeURIComponent(firstWrong.topic)}`}
            className="mt-3.5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-pk-700 px-4 py-2 text-sm font-semibold text-pk-800 transition-colors duration-200 hover:bg-pk-50 dark:border-pk-400 dark:text-pk-200 dark:hover:bg-pk-950"
          >
            Tutor se samjhein
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      )}
    </div>
  );
}
