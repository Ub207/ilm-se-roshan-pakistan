import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRightIcon,
  BoltIcon,
  BookIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  GlobeIcon,
  HeartIcon,
  QuizIcon,
  SignalIcon,
  SparkIcon,
  SUBJECT_ICONS,
  TargetIcon,
} from "@/components/icons";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { SITE_TAGLINE } from "@/lib/site";
import { SUBJECTS, MCQ_COUNT, type Subject } from "@/lib/tutor";

export const metadata: Metadata = {
  title: `Ilm Se Roshan Pakistan — ${SITE_TAGLINE}`,
  description:
    "Free AI tutor for Pakistani students. Any topic explained in simple English and Roman Urdu, with practice MCQs, quizzes, and a progress report.",
};

/** Derived from the real bank and lesson shape so the hero can never overstate. */
const HERO_STATS = [
  { value: String(SUBJECTS.length), label: "Subjects" },
  { value: String(QUIZ_QUESTIONS.length), label: "Quiz questions" },
  { value: "5–10", label: "Grades" },
  { value: "Free", label: "Koi login nahi" },
] as const;

const SUBJECT_BLURBS: Record<Subject, string> = {
  Mathematics: "Fractions, algebra, geometry — step by step.",
  Science: "Physics, chemistry aur biology ke concepts.",
  English: "Grammar, tenses, essays aur vocabulary.",
  Urdu: "Grammar, nazm, aur likhne ki mashq.",
  Islamiat: "Salah, Seerat aur akhlaq ke aasan sabaq.",
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
    body: `${MCQ_COUNT} MCQs turant, phir quiz aur progress report se apni kami dekhein.`,
  },
] as const;

const FEATURES = [
  {
    Icon: SparkIcon,
    title: "Live AI tutoring",
    body: "Har lesson AI live banata hai — pehle se likha hua jawab nahi.",
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

/**
 * Features say what the app has; benefits say what the student walks away with.
 * Kept deliberately separate so the page answers "why bother?" as well as "what
 * is it?".
 */
const BENEFITS = [
  {
    Icon: SparkIcon,
    title: "Samajh aati hai, ratta nahi",
    body: "Har concept rozmarra ki misaal se — cricket, roti, bazaar, rickshaw. Definition yaad karne ki zaroorat nahi rehti.",
  },
  {
    Icon: ClockIcon,
    title: "Apni raftaar, apna waqt",
    body: "Raat 11 baje bhi tutor hazir hai. Koi class timing, koi appointment, koi tuition fees nahi.",
  },
  {
    Icon: TargetIcon,
    title: "Kamzori ka khud pata chal jata hai",
    body: "Report batati hai kaun sa topic weak hai aur agla kya parhna hai — andaza lagane ki zaroorat nahi.",
  },
  {
    Icon: SignalIcon,
    title: "Har phone, har connection",
    body: "Halka page, koi video nahi. Sasta Android aur slow internet par bhi poora lesson khulta hai.",
  },
] as const;

/** Illustration only — a static preview of the shape /assessment produces. */
const SAMPLE_REPORT = [
  { topic: "Fractions", subject: "Mathematics", percent: 90 },
  { topic: "Photosynthesis", subject: "Science", percent: 75 },
  { topic: "Tenses", subject: "English", percent: 40 },
] as const;

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="border-b border-hairline bg-linear-to-b from-pk-50 to-background dark:from-pk-950/60">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-pk-200 bg-surface px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-pk-800 shadow-clay dark:border-pk-800 dark:text-pk-200">
            <SparkIcon className="h-4 w-4" />
            Ilm Se Roshan Pakistan
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            AI-Powered Learning for{" "}
            <span className="text-pk-800 dark:text-pk-300">
              Every Student in Pakistan
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted sm:text-xl">
            Har bacha, har topic, har waqt. Koi bhi sawaal likhein aur AI se
            simple English aur Roman Urdu mein samjhein — phir practice questions
            se check karein ke yaad hua ya nahi.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tutor" className="btn btn-lg btn-primary">
              <BookIcon className="h-5 w-5" />
              Start Learning
            </Link>
            <Link href="/quiz" className="btn btn-lg btn-secondary">
              <QuizIcon className="h-5 w-5" />
              Take Quiz
            </Link>
            <Link href="/assessment" className="btn btn-lg btn-quiet">
              <ChartIcon className="h-5 w-5" />
              View Report
            </Link>
          </div>

          <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="card px-3 py-4">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-2xl font-bold tracking-tight text-pk-800 dark:text-pk-300">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-muted">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* IMPACT — Why this matters */}
      <section
        aria-labelledby="impact-heading"
        className="border-b border-hairline bg-surface"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
            <div>
              <p className="eyebrow">
                <HeartIcon className="h-4 w-4" />
                Kyun zaroori hai?
              </p>
              <h2
                id="impact-heading"
                className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl"
              >
                Pakistan mein 2.2 crore bache school se bahar hain
              </h2>
              <p className="mt-3 max-w-prose leading-relaxed text-muted">
                Jo bache school mein hain un ke liye bhi — ek teacher ke saamne
                40-50 bache hain, tuition mehnga hai, aur kamzori ka pata tab
                chalta hai jab exam mein number kam aate hain.
              </p>
              <p className="mt-3 max-w-prose leading-relaxed text-muted">
                Yeh app us khali jagah ko bharti hai: koi bhi topic poochein,
                AI se samjhein, practice karein, aur apni kami khud dekh lein.
                Bilkul free, bina login ke, har phone par.
              </p>
            </div>

            <ul className="space-y-3">
              {[
                { stat: "22M+", label: "Out-of-school children in Pakistan" },
                { stat: "40:1", label: "Average teacher-to-student ratio" },
                { stat: "PKR 5,000+", label: "Monthly tuition fees most families cannot afford" },
                { stat: "0", label: "Login required to use Ilm Se Roshan Pakistan" },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-4 rounded-card border border-hairline bg-background p-4"
                >
                  <span className="shrink-0 text-xl font-bold tracking-tight tabular-nums text-pk-800 sm:text-2xl dark:text-pk-300">
                    {item.stat}
                  </span>
                  <span className="text-sm leading-relaxed text-muted">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="subjects-heading"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="text-center">
          <p className="eyebrow justify-center">
            <BookIcon className="h-4 w-4" />
            Subjects
          </p>
          <h2
            id="subjects-heading"
            className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Choose a subject
          </h2>
          <p className="mx-auto mt-2 max-w-2xl leading-relaxed text-muted">
            Card par click karein — tutor us subject ke saath khul jayega.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((subject) => {
            const Icon = SUBJECT_ICONS[subject];

            return (
              <li key={subject}>
                <Link
                  href={`/tutor?subject=${encodeURIComponent(subject)}`}
                  className="card card-pad card-lift group flex h-full flex-col"
                >
                  <span className="medallion transition-colors duration-200 group-hover:bg-pk-100 dark:group-hover:bg-pk-900">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-3.5 text-lg font-semibold">{subject}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {SUBJECT_BLURBS[subject]}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-pk-800 dark:text-pk-200">
                    Start learning
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        aria-labelledby="steps-heading"
        className="border-y border-hairline bg-surface"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="text-center">
            <p className="eyebrow justify-center">
              <BoltIcon className="h-4 w-4" />
              How it works
            </p>
            <h2
              id="steps-heading"
              className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Kaise chalta hai?
            </h2>
          </div>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-card border border-hairline bg-background p-5"
              >
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 place-items-center rounded-full bg-pk-900 font-mono text-sm font-bold text-white shadow-clay"
                >
                  {index + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="text-center">
          <p className="eyebrow justify-center">
            <SparkIcon className="h-4 w-4" />
            Features
          </p>
          <h2
            id="features-heading"
            className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Sab kuch ek hi jagah
          </h2>
          <p className="mx-auto mt-2 max-w-2xl leading-relaxed text-muted">
            AI tutoring, practice quizzes aur progress tracking — ek halke se page
            mein, bina kisi login ke.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, body }) => (
            <li key={title} className="card card-pad flex gap-3.5">
              <span className="mt-0.5 shrink-0 text-pk-700 dark:text-pk-300">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* BENEFITS */}
      <section
        aria-labelledby="benefits-heading"
        className="border-y border-hairline bg-surface"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <p className="eyebrow">
              <TargetIcon className="h-4 w-4" />
              Benefits
            </p>
            <h2
              id="benefits-heading"
              className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Student ko asal mein kya milta hai?
            </h2>
            <p className="mt-2 max-w-prose leading-relaxed text-muted">
              Pakistan mein ek teacher ke zimme darjanon bache hote hain, aur
              tuition har ghar ka budget nahi. Yeh app woh khali jagah bharti hai.
            </p>

            <ul className="mt-7 space-y-5">
              {BENEFITS.map(({ Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="medallion shadow-clay">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Static preview of the real /assessment output — shows, not tells. */}
          <div className="card-accent rounded-panel p-5 sm:p-7">
            <div className="flex items-baseline justify-between gap-3">
              <p className="eyebrow">
                <ChartIcon className="h-4 w-4" />
                Report ka namoona
              </p>
              <p className="text-xs text-muted">Example</p>
            </div>

            <ul className="mt-4 space-y-3.5">
              {SAMPLE_REPORT.map((row) => (
                <li key={row.topic} className="rounded-card bg-surface p-3.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 font-medium">
                      {row.topic}{" "}
                      <span className="text-muted">· {row.subject}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {row.percent}%
                    </span>
                  </div>
                  <div aria-hidden="true" className="track mt-2">
                    <div
                      className="track-fill"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-start gap-2 text-sm text-foreground/80">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-pk-700 dark:text-pk-300" />
              Weak topic seedha AI Tutor se jur jata hai, taake agla step clear
              ho.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-panel border border-pk-200 bg-linear-to-b from-pk-50 to-pk-100/50 px-6 py-10 text-center shadow-clay sm:px-10 sm:py-14 dark:border-pk-800 dark:from-pk-950/60 dark:to-pk-950/30">
          <span className="medallion mx-auto h-12 w-12 bg-surface">
            <TargetIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-3.5 text-2xl font-bold tracking-tight sm:text-3xl">
            Aaj hi ek topic seekhein
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl leading-relaxed text-muted">
            Ek minute lagta hai. Topic likhein, samjhein, aur {MCQ_COUNT} questions
            se check karein ke yaad hua ya nahi. Koi login, koi fees nahi.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tutor" className="btn btn-lg btn-primary">
              Mujhe Samjhao
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link href="/quiz" className="btn btn-lg btn-secondary">
              <QuizIcon className="h-5 w-5" />
              Pehle quiz try karein
            </Link>
          </div>
          <p className="mx-auto mt-5 max-w-md text-xs leading-relaxed text-muted">
            Mathematics, Science, English, Urdu, aur Islamiat — paanchon subjects
            covered hain. AI tutor Roman Urdu aur simple English mein samjhata hai.
          </p>
        </div>
      </section>
    </main>
  );
}
