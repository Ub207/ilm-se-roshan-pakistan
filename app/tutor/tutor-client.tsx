"use client";

import { useState } from "react";

import { McqOption, OPTION_LETTERS } from "@/components/mcq-option";
import {
  MAX_TOPIC_LENGTH,
  SUBJECTS,
  type Subject,
  type TutorApiResponse,
  type TutorLesson,
} from "@/lib/tutor";

type TutorClientProps = {
  initialTopic: string;
  initialSubject: Subject | null;
};

type Status = "idle" | "loading" | "ready" | "error";

type LoadedLesson = TutorLesson & { model: string };

const SUGGESTIONS = [
  "Pendulum",
  "Newton's Laws",
  "Algebra basics",
  "Photosynthesis",
  "Tenses in English",
] as const;

export default function TutorClient({
  initialTopic,
  initialSubject,
}: TutorClientProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState<Subject | "">(initialSubject ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [lesson, setLesson] = useState<LoadedLesson | null>(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});

  async function requestLesson(nextTopic: string) {
    const trimmed = nextTopic.trim();
    if (!trimmed) {
      setStatus("error");
      setError("Pehle koi topic likhein — for example Pendulum.");
      return;
    }

    setStatus("loading");
    setError("");
    setLesson(null);
    setAnswers({});

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: trimmed,
          ...(subject ? { subject } : {}),
        }),
      });

      const payload: TutorApiResponse = await response.json();

      if (!payload.ok) {
        setStatus("error");
        setError(payload.error);
        return;
      }

      setLesson(payload);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError(
        "Server se baat nahi ho saki. Check that the dev server is running, then try again.",
      );
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="space-y-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void requestLesson(topic);
        }}
        className="rounded-2xl border border-hairline bg-surface p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <div>
            <label
              htmlFor="topic"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Topic
            </label>
            <input
              id="topic"
              name="topic"
              type="text"
              value={topic}
              maxLength={MAX_TOPIC_LENGTH}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Pendulum, Newton's Laws, Algebra..."
              className="w-full rounded-xl border border-hairline bg-background px-3.5 py-2.5 text-base placeholder:text-muted focus:border-pk-500"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value as Subject | "")
              }
              className="w-full rounded-xl border border-hairline bg-background px-3.5 py-2.5 text-base focus:border-pk-500"
            >
              <option value="">Any subject</option>
              {SUBJECTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-pk-900 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-pk-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Soch raha hoon..." : "Mujhe Samjhao"}
          </button>
          <p className="text-sm text-muted">
            AI explains it, then gives you 3 practice questions.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Try
          </span>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setTopic(suggestion);
                void requestLesson(suggestion);
              }}
              className="rounded-full border border-hairline px-3 py-1 text-sm text-muted transition-colors hover:border-pk-400 hover:text-pk-800 disabled:opacity-50 dark:hover:text-pk-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite" aria-busy={isLoading} className="space-y-8">
        {status === "error" && (
          <div
            role="alert"
            className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 sm:p-6 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100"
          >
            <p className="font-semibold">Lesson nahi ban saka</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-sm sm:p-6">
            <p className="text-sm font-medium text-muted">
              AI aap ka lesson tayyar kar raha hai...
            </p>
            <div className="mt-4 space-y-2.5">
              {[0, 1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-3.5 animate-pulse rounded-full bg-pk-100 dark:bg-pk-950"
                  style={{ width: `${100 - row * 12}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {status === "ready" && lesson && (
          <>
            <article className="rounded-2xl border border-hairline bg-surface p-4 shadow-sm sm:p-6">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold sm:text-2xl">
                  {lesson.topic}
                </h2>
                <p className="font-mono text-xs text-muted">{lesson.model}</p>
              </header>
              <div className="mt-3 space-y-3 leading-relaxed text-foreground/90">
                {lesson.explanation
                  .split(/\n{2,}/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </article>

            <section
              aria-labelledby="practice-heading"
              className="rounded-2xl border border-hairline bg-surface p-4 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="practice-heading" className="text-lg font-semibold">
                  Practice questions
                </h2>
                <p className="text-sm text-muted">
                  {Object.keys(answers).length} / {lesson.mcqs.length} attempted
                </p>
              </div>

              <ol className="mt-4 space-y-6">
                {lesson.mcqs.map((mcq, questionIndex) => {
                  const chosen = answers[questionIndex];
                  const answered = chosen !== undefined;

                  return (
                    <li key={questionIndex}>
                      <fieldset>
                        <legend className="font-medium">
                          {questionIndex + 1}. {mcq.question}
                        </legend>
                        <div className="mt-2.5 grid gap-2">
                          {mcq.options.map((option, optionIndex) => (
                            <McqOption
                              key={optionIndex}
                              name={`tutor-question-${questionIndex}`}
                              optionIndex={optionIndex}
                              option={option}
                              chosen={chosen}
                              correctIndex={mcq.correctIndex}
                              onSelect={() =>
                                setAnswers((prev) =>
                                  prev[questionIndex] === undefined
                                    ? { ...prev, [questionIndex]: optionIndex }
                                    : prev,
                                )
                              }
                            />
                          ))}
                        </div>
                      </fieldset>

                      {answered && (
                        <p className="mt-2.5 rounded-xl bg-pk-50 px-3.5 py-2.5 text-sm text-pk-900 dark:bg-pk-950 dark:text-pk-100">
                          <strong className="font-semibold">
                            {chosen === mcq.correctIndex
                              ? "Shabash! "
                              : `Correct answer: ${OPTION_LETTERS[mcq.correctIndex]}. `}
                          </strong>
                          {mcq.explanation}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="rounded-2xl border border-pk-200 bg-pk-50 p-4 sm:p-6 dark:border-pk-800 dark:bg-pk-950/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-pk-700 dark:text-pk-300">
                Next lesson
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                {lesson.nextLesson.title}
              </h2>
              <p className="mt-1 text-sm text-foreground/80">
                {lesson.nextLesson.why}
              </p>
              <button
                type="button"
                onClick={() => {
                  setTopic(lesson.nextLesson.title);
                  void requestLesson(lesson.nextLesson.title);
                }}
                className="mt-3 inline-flex rounded-xl border border-pk-700 px-4 py-2 text-sm font-semibold text-pk-800 transition-colors hover:bg-pk-100 dark:border-pk-400 dark:text-pk-200 dark:hover:bg-pk-900"
              >
                Yeh parhao
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
