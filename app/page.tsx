import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRightIcon,
  BoltIcon,
  BookIcon,
  CapIcon,
  ChartIcon,
  GlobeIcon,
  QuizIcon,
  SignalIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/icons";
import { SUBJECTS, type Subject } from "@/lib/tutor";

export const metadata: Metadata = {
  title: "Ilm Se Roshan Pakistan — AI Learning Companion",
  description:
    "Free AI tutor for Pakistani students. Any topic explained in simple English and Roman Urdu, with practice MCQs, quizzes, and a progress report.",
};

const SUBJECT_BLURBS: Record<Subject, string> = {
  Mathematics: "Fractions, algebra, geometry — step by step.",
  Science: "Physics, chemistry aur biology ke concepts.",
  English: "Grammar, tenses, essays aur vocabulary.",
  Urdu: "Grammar, nazm, aur likhne ki mashq.",
  Islamiat: "Salah, Seerat aur akhlaq ke asaan sabaq.",
};

const STEPS = [
  {
    title: "Topic likhein",
    body: "Pendulum, Newton's Laws, Algebra — jo samajh nahi aa raha wohi likhein.",
  },
  {
    title: "AI samjhata hai",
    body: "Simple English aur Roman Urdu mein, Pakistani examples ke saath.",
  },
  {
    title: "Practice karein",
    body: "3 MCQs turant, phir quiz aur progress report se apni kami dekhein.",
  },
] as const;

const FEATURES = [
  {
    Icon: SparkIcon,
    title: "Live AI tutoring",
    body: "Har jawab AI se banta hai — koi ratta-maar list nahi.",
  },
  {
    Icon: QuizIcon,
    title: "Interactive quizzes",
    body: "Subject-wise questions, turant sahi-ghalat ka feedback.",
  },
  {
    Icon: ChartIcon,
    title: "Progress report",
    body: "Strong areas, weak areas aur agla lesson — sab ek jagah.",
  },
  {
    Icon: GlobeIcon,
    title: "Urdu + English",
    body: "Mushkil hisse Roman Urdu mein, baaki simple English mein.",
  },
  {
    Icon: SignalIcon,
    title: "Low-bandwidth friendly",
    body: "Halka page, koi video nahi — slow internet par bhi chalta hai.",
  },
  {
    Icon: BoltIcon,
    title: "Bilkul free",
    body: "Free AI models par chalta hai, koi login ya fees nahi.",
  },
] as const;

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="border-b border-hairline bg-linear-to-b from-pk-50 to-background dark:from-pk-950/60">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-pk-200 bg-surface px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-pk-800 shadow-clay dark:border-pk-800 dark:text-pk-200">
            <SparkIcon className="h-4 w-4" />
            AI Learning Companion
          </p>

          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Ilm Se Roshan Pakistan
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted sm:text-xl">
            Har bacha, har topic, har waqt. Koi bhi sawal likhein aur AI se simple
            English aur Roman Urdu mein samjhein.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tutor"
              className="inline-flex items-center gap-2 rounded-xl bg-pk-900 px-6 py-3 font-semibold text-white shadow-clay transition-all duration-200 hover:bg-pk-800 hover:shadow-clay-lg active:translate-y-px"
            >
              <BookIcon className="h-5 w-5" />
              Start Learning
            </Link>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-surface px-6 py-3 font-semibold shadow-clay transition-all duration-200 hover:border-pk-400 hover:shadow-clay-lg active:translate-y-px"
            >
              <QuizIcon className="h-5 w-5" />
              Take Quiz
            </Link>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-surface px-6 py-3 font-semibold shadow-clay transition-all duration-200 hover:border-pk-400 hover:shadow-clay-lg active:translate-y-px"
            >
              <ChartIcon className="h-5 w-5" />
              View Report
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="subjects-heading"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="text-center">
          <h2
            id="subjects-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Choose a subject
          </h2>
          <p className="mt-2 text-muted">
            Card par click karein — tutor us subject ke saath khul jayega.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((subject) => (
            <li key={subject}>
              <Link
                href={`/tutor?subject=${encodeURIComponent(subject)}`}
                className="group flex h-full cursor-pointer flex-col rounded-2xl border border-hairline bg-surface p-5 shadow-clay transition-all duration-200 hover:-translate-y-0.5 hover:border-pk-400 hover:shadow-clay-lg active:translate-y-0"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-pk-50 text-pk-800 transition-colors duration-200 group-hover:bg-pk-100 dark:bg-pk-950 dark:text-pk-200">
                  <CapIcon className="h-6 w-6" />
                </span>
                <h3 className="mt-3.5 text-lg font-semibold">{subject}</h3>
                <p className="mt-1 text-sm text-muted">
                  {SUBJECT_BLURBS[subject]}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-pk-800 dark:text-pk-200">
                  Start learning
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="steps-heading"
        className="border-y border-hairline bg-surface"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2
            id="steps-heading"
            className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Kaise chalta hai?
          </h2>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-hairline bg-background p-5"
              >
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 place-items-center rounded-full bg-pk-900 font-mono text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
      >
        <h2
          id="features-heading"
          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Why Ilm Se Roshan Pakistan?
        </h2>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="flex gap-3.5 rounded-2xl border border-hairline bg-surface p-5 shadow-clay"
            >
              <span className="mt-0.5 shrink-0 text-pk-700 dark:text-pk-300">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-pk-200 bg-pk-50 px-6 py-10 text-center shadow-clay dark:border-pk-800 dark:bg-pk-950/60">
          <TargetIcon className="mx-auto h-8 w-8 text-pk-700 dark:text-pk-300" />
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Aaj hi ek topic seekhein
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">
            Ek minute lagta hai. Topic likhein, samjhein, aur 3 questions se check
            karein ke yaad hua ya nahi.
          </p>
          <Link
            href="/tutor"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pk-900 px-6 py-3 font-semibold text-white shadow-clay transition-all duration-200 hover:bg-pk-800 hover:shadow-clay-lg active:translate-y-px"
          >
            Mujhe Samjhao
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
