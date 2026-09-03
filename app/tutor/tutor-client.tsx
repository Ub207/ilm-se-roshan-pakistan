"use client";

import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";

import {
  ArrowRightIcon,
  BoltIcon,
  BookIcon,
  CheckIcon,
  GlobeIcon,
  QuizIcon,
  RetryIcon,
  SparkIcon,
  SpinnerIcon,
  TargetIcon,
  WarningIcon,
} from "@/components/icons";
import { McqOption, OPTION_LETTERS } from "@/components/mcq-option";
import {
  MAX_TOPIC_LENGTH,
  MCQ_COUNT,
  SUBJECTS,
  studentErrorMessage,
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

/** What went wrong, in a shape the error panel can render without re-deriving. */
type LoadError = {
  message: string;
  /** Raw upstream text — the API sends this in development only. */
  detail?: string;
  /** True when the AI is unavailable rather than the request being wrong. */
  offerQuiz: boolean;
};

/**
 * Starter topics, keyed by subject. A Mathematics student offered
 * "Photosynthesis" gets nothing out of these chips, so the list follows the
 * dropdown; `""` is the "Any subject" mix. Written the way a Pakistani teacher
 * would name the chapter, so the topics are recognisable from a school syllabus.
 */
const SUGGESTIONS: Record<Subject | "", readonly string[]> = {
  "": ["Pendulum", "Newton's Laws", "Algebra basics", "Photosynthesis", "Tenses"],
  Mathematics: [
    "Fractions",
    "Algebra basics",
    "Pythagoras theorem",
    "Percentage",
  ],
  Science: [
    "Photosynthesis",
    "Newton's Laws",
    "Water cycle",
    "Human digestive system",
  ],
  English: [
    "Tenses",
    "Active and passive voice",
    "Parts of speech",
    "Essay writing",
  ],
  Urdu: ["Ism, fail aur harf", "Wahid aur jama", "Allama Iqbal ki nazm", "Khat likhna"],
  Islamiat: [
    "Namaz ki ahmiyat",
    "Seerat-un-Nabi",
    "Akhlaq-e-hasana",
    "Zakat ka maqsad",
  ],
};

/**
 * One labelled block of the lesson, so Explanation, Key points, Example, Quiz and
 * Correct answers all read identically. The label is an `h3` under the lesson's
 * `h2` topic heading, which keeps the six sections navigable by screen reader.
 */
function LessonSection({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="card card-pad">
      <h3 className="eyebrow">
        <Icon className="h-4 w-4" />
        {label}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Models write the explanation as one blob or as blank-line-separated paragraphs. */
function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function TutorClient({
  initialTopic,
  initialSubject,
}: TutorClientProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState<Subject | "">(initialSubject ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [lesson, setLesson] = useState<LoadedLesson | null>(null);
  const [error, setError] = useState<LoadError | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  /** Lets a stuck student open the answer list before attempting all three. */
  const [revealAll, setRevealAll] = useState(false);
  /** Kept so the error panel's retry button knows what to ask for again. */
  const [lastTopic, setLastTopic] = useState("");

  async function requestLesson(nextTopic: string) {
    const trimmed = nextTopic.trim();
    if (!trimmed) {
      setStatus("error");
      setError({
        message: "Pehle koi topic likhein — masalan Pendulum.",
        offerQuiz: false,
      });
      return;
    }

    setStatus("loading");
    setError(null);
    setLesson(null);
    setAnswers({});
    setRevealAll(false);
    setLastTopic(trimmed);

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
        setError({
          message: payload.error,
          detail: payload.detail,
          // A wrong topic is the student's to fix; everything else is our side.
          offerQuiz: payload.code !== "BAD_INPUT",
        });
        return;
      }

      setLesson(payload);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError({
        message: studentErrorMessage("UPSTREAM"),
        detail: "fetch() to /api/tutor threw — is the server running?",
        offerQuiz: true,
      });
    }
  }

  const isLoading = status === "loading";
  const answeredCount = Object.keys(answers).length;
  const showAnswers =
    revealAll || (lesson !== null && answeredCount === lesson.mcqs.length);

  return (
    <div className="space-y-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void requestLesson(topic);
        }}
        className="card card-pad"
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label
                htmlFor="topic"
                className="block text-sm font-medium text-foreground"
              >
                Topic
              </label>
              <span
                aria-hidden="true"
                className="font-mono text-xs text-muted tabular-nums"
              >
                {topic.length}/{MAX_TOPIC_LENGTH}
              </span>
            </div>
            <input
              id="topic"
              name="topic"
              type="text"
              value={topic}
              maxLength={MAX_TOPIC_LENGTH}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Pendulum, Newton's Laws, Algebra..."
              className="min-h-12 w-full rounded-control border border-hairline bg-background px-3.5 py-2.5 text-base transition-colors duration-150 ease-clay placeholder:text-muted hover:border-pk-400 focus:border-pk-500"
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
              className="min-h-12 w-full rounded-control border border-hairline bg-background px-3.5 py-2.5 text-base transition-colors duration-150 ease-clay hover:border-pk-400 focus:border-pk-500"
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

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <button type="submit" disabled={isLoading} className="btn btn-lg btn-primary">
            {isLoading ? (
              <>
                <SpinnerIcon className="h-5 w-5 animate-spin" />
                Sabaq ban raha hai...
              </>
            ) : (
              <>
                <SparkIcon className="h-5 w-5" />
                Mujhe Samjhao
              </>
            )}
          </button>
          <p className="text-sm text-muted">
            AI samjhata hai, phir {MCQ_COUNT} practice questions deta hai.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Try
          </span>
          {SUGGESTIONS[subject].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setTopic(suggestion);
                void requestLesson(suggestion);
              }}
              className="inline-flex min-h-11 items-center rounded-full border border-hairline px-4 text-sm text-muted transition-colors duration-150 ease-clay hover:border-pk-400 hover:bg-pk-50 hover:text-pk-800 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-pk-950 dark:hover:text-pk-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite" aria-busy={isLoading} className="space-y-8">
        {status === "error" && error && (
          <div
            role="alert"
            className="animate-rise rounded-card border border-red-300 bg-red-50 p-5 text-red-900 shadow-clay sm:p-6 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100"
          >
            <div className="flex gap-3.5">
              <WarningIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold">Lesson nahi ban saka</p>
                <p className="mt-1 max-w-prose text-sm leading-relaxed">
                  {error.message}
                </p>
                {error.detail && (
                  <p className="mt-2 break-words font-mono text-xs opacity-70">
                    {error.detail}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {lastTopic && (
                <button
                  type="button"
                  onClick={() => void requestLesson(lastTopic)}
                  className="btn border border-red-400 bg-surface text-red-800 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950"
                >
                  <RetryIcon className="h-4 w-4" />
                  Dobara koshish karein
                </button>
              )}
              {error.offerQuiz && (
                <Link href="/quiz" className="btn btn-secondary">
                  <QuizIcon className="h-4 w-4" />
                  Tab tak quiz khel lein
                </Link>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="card card-pad">
            <div className="flex items-center gap-3">
              <SpinnerIcon className="h-5 w-5 animate-spin text-pk-700 dark:text-pk-300" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Ustaad Sahib aap ka sabaq tayyar kar rahe hain...
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Thori dair intezaar karein — tafseel, misaal aur {MCQ_COUNT}{" "}
                  sawaal aa rahe hain.
                </p>
              </div>
            </div>

            {/*
              Shaped like the lesson that is coming — a paragraph, then key
              points, then answer rows — so the wait previews the result instead
              of showing four anonymous bars. `animate-pulse` is switched off by
              the `prefers-reduced-motion` block in globals.css.
            */}
            <div aria-hidden="true" className="mt-5 space-y-5">
              <div className="space-y-2.5">
                {[100, 96, 88, 71].map((width) => (
                  <div
                    key={width}
                    className="h-3.5 animate-pulse rounded-full bg-pk-100 dark:bg-pk-950"
                    style={{ width: `${width}%` }}
                  />
                ))}
              </div>

              <div className="space-y-2.5">
                {[62, 54, 58].map((width, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <span className="h-3.5 w-3.5 shrink-0 animate-pulse rounded-full bg-pk-200 dark:bg-pk-900" />
                    <span
                      className="h-3.5 animate-pulse rounded-full bg-pk-100 dark:bg-pk-950"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-2">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="h-11 animate-pulse rounded-control bg-pk-50 dark:bg-pk-950/60"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {status === "ready" && lesson && (
          <section
            aria-labelledby="lesson-heading"
            className="animate-rise space-y-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="lesson-heading"
                className="text-xl font-semibold sm:text-2xl"
              >
                {lesson.topic}
              </h2>
              {/* Which model actually taught this — the lesson is generated live,
                  not read from a fixture, and the student can see that. */}
              <p className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1 font-mono text-xs text-muted">
                <SparkIcon className="h-3.5 w-3.5" />
                {lesson.model}
              </p>
            </div>

            <LessonSection icon={BookIcon} label="Explanation">
              <div className="max-w-prose space-y-3 leading-relaxed text-foreground/90">
                {toParagraphs(lesson.explanation).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </LessonSection>

            {lesson.vocabulary.length > 0 && (
              <LessonSection icon={GlobeIcon} label="Mushkil alfaaz — hard words">
                <dl className="grid gap-2.5 sm:grid-cols-2">
                  {lesson.vocabulary.map((term) => (
                    <div
                      key={term.word}
                      className="rounded-control border border-hairline p-3"
                    >
                      <dt className="font-medium">{term.word}</dt>
                      <dd className="mt-0.5 text-sm leading-relaxed text-muted">
                        {term.meaning}
                      </dd>
                    </div>
                  ))}
                </dl>
              </LessonSection>
            )}

            {lesson.keyPoints.length > 0 && (
              <LessonSection icon={SparkIcon} label="Key points">
                <ul className="max-w-prose space-y-2">
                  {lesson.keyPoints.map((point, index) => (
                    <li key={index} className="flex gap-2.5 leading-relaxed">
                      <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-pk-700 dark:text-pk-300" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </LessonSection>
            )}

            {lesson.example && (
              <LessonSection icon={BoltIcon} label="Example">
                <p className="max-w-prose leading-relaxed text-foreground/90">
                  {lesson.example}
                </p>
              </LessonSection>
            )}

            <section aria-labelledby="practice-heading" className="card card-pad">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 id="practice-heading" className="eyebrow">
                  <QuizIcon className="h-4 w-4" />
                  Quiz
                </h3>
                <p className="text-sm text-muted tabular-nums">
                  {answeredCount} / {lesson.mcqs.length} attempted
                </p>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Har sawaal ka jawab chunein — sahi jawab foran samjha diya jayega.
              </p>
              <div aria-hidden="true" className="track mt-3">
                <div
                  className="track-fill"
                  style={{
                    width: `${(answeredCount / lesson.mcqs.length) * 100}%`,
                  }}
                />
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
                        <p className="mt-2.5 max-w-prose rounded-control bg-pk-50 px-3.5 py-2.5 text-sm leading-relaxed text-pk-900 dark:bg-pk-950 dark:text-pk-100">
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

            {/* The per-question reveal already teaches; a summary shown before any
                attempt would just be an answer key. It unlocks once every question
                is attempted, or on request for a student who is genuinely stuck. */}
            <LessonSection icon={CheckIcon} label="Correct answers">
              {showAnswers ? (
                <ol className="space-y-3">
                  {lesson.mcqs.map((mcq, index) => (
                    <li key={index} className="max-w-prose text-sm leading-relaxed">
                      <span className="font-mono font-semibold text-pk-800 dark:text-pk-200">
                        {index + 1}. {OPTION_LETTERS[mcq.correctIndex]}
                      </span>{" "}
                      <span className="font-medium">
                        {mcq.options[mcq.correctIndex]}
                      </span>
                      {mcq.explanation && (
                        <span className="text-muted"> — {mcq.explanation}</span>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <>
                  <p className="max-w-prose text-sm leading-relaxed text-muted">
                    Pehle khud koshish karein — har sawaal attempt karne ke baad
                    poori list yahan khul jayegi.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRevealAll(true)}
                    className="btn btn-quiet mt-3.5"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Phir bhi sab jawab dikhayein
                  </button>
                </>
              )}
            </LessonSection>

            <section className="card-accent card-pad">
              <h3 className="eyebrow">
                <TargetIcon className="h-4 w-4" />
                Next lesson
              </h3>
              <p className="mt-1.5 text-lg font-semibold">
                {lesson.nextLesson.title}
              </p>
              <p className="mt-1 max-w-prose text-sm leading-relaxed text-foreground/80">
                {lesson.nextLesson.why}
              </p>
              <button
                type="button"
                onClick={() => {
                  setTopic(lesson.nextLesson.title);
                  void requestLesson(lesson.nextLesson.title);
                }}
                className="btn btn-outline mt-3.5"
              >
                Yeh bhi samjhao
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </section>

            {/*
              The lesson is generated live by a free model, and in testing those
              models do sometimes get a date, a quotation, or a poem's subject
              wrong. Saying so once, at the bottom, is more honest than a silent
              claim of authority — and it teaches the habit the student needs
              anyway: check it against the textbook. Muted and last on purpose,
              so it reads as a footnote rather than a warning about the app.
            */}
            <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted">
              <WarningIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Yeh sabaq AI ne abhi banaya hai. Aksar sahi hota hai, lekin
                kabhi kabhi koi tareekh, shair ya naam ghalat ho sakta hai — imtihan
                se pehle apni kitab ya ustaad se ek baar check kar lein.
              </span>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
