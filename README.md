# Ilm Se Roshan Pakistan

**AI-Powered Learning for Every Student in Pakistan.**

An AI learning companion for Pakistani school students (grades 5–10). Type any
topic and get a plain-language explanation, three practice MCQs, and a suggested
next lesson — then a scored quiz and a progress report that names your weak
areas and what to study next.

Student-facing copy is deliberately Roman Urdu mixed with English, the register
Pakistani students actually read.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.4-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.2.8-087EA4?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-6467F2)](https://openrouter.ai)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/new)

**[Live Demo](#live-demo)** · **[How It Works](#how-it-works)** · **[Architecture](#system-architecture)** · **[Installation](#installation)**

---

## Project Overview

| | |
| --- | --- |
| **What it is** | A free, no-login web app that explains any school topic with AI and then checks whether the student actually understood it. |
| **Who it is for** | Students in grades 5–10 across Pakistan, especially where a teacher's attention is split across dozens of children and paid tuition is out of reach. |
| **Core loop** | Ask → understand → practise → see your weak areas → study the right next thing. |
| **Subjects** | Mathematics, Science, English, Urdu, Islamiat. |
| **Status** | Working end-to-end. Live AI tutor, 25-question local quiz bank, derived progress report. |

Four routes, one job each:

| Route | What it does |
| --- | --- |
| `/` | Positioning, five subject entry points, how it works, features, benefits, CTA. |
| `/tutor` | The AI feature. Any topic → a six-section lesson: explanation, key points, worked example, hard words defined, 3 practice MCQs, next lesson. |
| `/quiz` | Pick a scope, answer five scored questions, get instant feedback and a review. |
| `/assessment` | Roll-up of every stored attempt: score, strong areas, weak areas, next lesson. |

## Problem Statement

Pakistan has one of the largest out-of-school populations in the world, and the
children who *are* in school often face:

- **Crowded classrooms.** One teacher, dozens of students, no time for the child
  who did not follow the lesson the first time.
- **Tuition as the only fallback.** Private coaching is the default remedy for a
  weak topic, and it is priced out of most household budgets.
- **A language gap.** Textbooks and exams are frequently in English while the
  language of the home is Urdu, so the concept is lost inside the vocabulary.
- **Rote learning.** Students memorise definitions to pass, without ever being
  able to explain the idea in their own words.
- **No feedback loop.** A student rarely finds out *which* topic is weak until an
  exam says so, and by then the syllabus has moved on.
- **Constrained devices.** The available device is often a low-end Android phone
  on a slow, metered connection — video-heavy platforms are unusable.

The result: a student who is stuck stays stuck, and nobody notices in time.

## Solution

A single, very light web app that closes the loop a crowded classroom cannot.

1. **Explain on demand.** The student types whatever they did not understand.
   The AI answers in simple English mixed with Roman Urdu, using everyday
   Pakistani examples — cricket, roti, bazaar, rickshaw — so the concept lands
   before the vocabulary does. Every lesson arrives in six sections: the
   explanation, key points, a worked example, the hard words defined, practice
   questions, and what to study next.
2. **Check immediately.** Every lesson ships with three practice MCQs, answered
   in place, each with an explanation of *why* that option is right.
3. **Score honestly.** A local 25-question bank scores real attempts against a
   local answer key, so grading never depends on the AI being available.
4. **Point at the gap.** Every answer is tagged with its subject and topic. The
   assessment page turns that history into strong areas, weak areas, and one
   recommended next lesson that deep-links straight back into the tutor.

No account, no fee, no video. The whole thing is a few hundred kilobytes of HTML
and CSS with one AI call behind a server route.

## Key Features

| Feature | Detail |
| --- | --- |
| **Live AI tutoring** | Any topic, not a fixed list. Six sections per lesson — explanation, key points, a worked example, hard words defined, 3 MCQs, next lesson — generated per request. |
| **Bilingual register** | Simple English with Roman Urdu for the hard parts, matching how students actually talk about school. |
| **Urdu that a teacher would say** | The prompt enforces standard Pakistani school Urdu: correct *muzakkar/muannas* and *wahid/jama* agreement, the respectful aap form throughout, verb-final word order, and no regional, Punjabi, or slang words. |
| **Per-subject teaching rules** | A poet gets the poetry and its message, not birth dates. Science and maths are worked step by step. Islamiat keeps the durood and stays out of *maslak* disputes. Urdu as a subject uses formal textbook terms. |
| **Practice that teaches** | Each MCQ reveals why the right option is right. Options are shuffled server-side, so "always pick A" does not work. |
| **Interactive quizzes** | Five questions per round, scoped to one subject or all five, with instant per-answer feedback and an end-of-round review. |
| **Honest scoring** | The quiz bank and answer key are local, so scoring is deterministic and keeps working when the AI's free tier is rate limited. |
| **Progress report** | Score, attempt count, strong areas, weak areas, and one recommended next lesson — derived from real attempts, not hardcoded. |
| **Deep links everywhere** | Subject cards, weak topics, and the recommended lesson all open the tutor pre-filled via `?subject=` and `?topic=`. |
| **Model failover** | Three zero-cost OpenRouter models are tried in order, so one rate-limited endpoint does not break the demo. |
| **Graceful degradation** | If the AI is unavailable the student gets a plain-language message and a link to the quiz, which needs no network. |
| **Honest about the AI** | Every lesson closes by saying it was generated by AI and asking the student to check any date, couplet, or name against their own book — the right affordance for a free-tier model, and the right study habit anyway. |
| **Accessible by construction** | Skip link, visible focus ring, `aria-live` status regions, `aria-current` on the active nav item, 44px touch targets, and correctness never signalled by colour alone. |
| **Dark mode** | Follows `prefers-color-scheme`, with the palette kept at AA contrast in both themes. |
| **Reduced motion** | All animation and transition durations collapse under `prefers-reduced-motion`. |
| **Privacy by default** | No accounts, no analytics, no database. Progress lives in the browser's `localStorage` and never leaves the device. |
| **Low bandwidth** | Static HTML for three of four routes, no images, no video, no icon library — SVG icons are inlined. |

## Technology Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16.3.4** (App Router, Turbopack) | Server Components for instant static pages, one Route Handler for the only server-side secret. |
| UI runtime | **React 19.2.8** | `useSyncExternalStore` for reading `localStorage` without an effect. |
| Language | **TypeScript 5** (`strict`) | The AI returns untyped JSON; the type system is where that gets contained. |
| Styling | **Tailwind CSS v4** (CSS-first) | Theme tokens live in `app/globals.css` under `@theme` — there is no `tailwind.config.js`. |
| Type face | **Lexend** (headings) + **Geist** (body/mono) | Lexend was designed to raise reading proficiency, which is exactly this audience. |
| AI gateway | **OpenRouter** via the **`openai` SDK v7** | One OpenAI-compatible endpoint in front of many models, so failover is a loop over model names. |
| Icons | Local inline SVG (`components/icons.tsx`) | A few hundred bytes, zero runtime, no emoji. |
| Lint | **ESLint 9** flat config (`eslint-config-next`) | Catches React 19 rules such as `react-hooks/set-state-in-effect`. |
| Hosting | **Vercel** | Zero-config for the Next.js preset; the tutor route runs as a serverless function. |

There is intentionally **no database, no auth provider, and no analytics**. Every
dependency that is not `next`, `react`, `react-dom`, or `openai` is a dev tool.

## System Architecture

```
                          ┌──────────────────────────────┐
   Browser                │  Server (Vercel / next dev)  │        Upstream
 ───────────              └──────────────────────────────┘      ────────────

 /  ──────────────── Server Component, static ─┐
 /quiz  ─────────── static shell + client ─────┤   no network, no secrets
 /assessment  ───── static shell + client ─────┘

 /tutor  ────────── Server Component reads ?subject= & ?topic=
      │                    │
      │                    └─> tutor-client.tsx  (form, states, MCQs)
      │                                │
      │  POST { topic, subject }        │
      └────────────────────────────────>│
                                        v
                         app/api/tutor/route.ts
                         1. rate limit  (before body parse)
                         2. validate topic / subject
                         3. delegate ──> lib/openrouter.ts
                                              │  reads OPENROUTER_API_KEY
                                              │  walks the model chain
                                              └──────────────> OpenRouter API
                                                                    │
                         lib/tutor.ts  <── raw JSON ────────────────┘
                         parseTutorLesson() = the trust boundary
                         shuffleMcqOptions() = answer position
                                        │
                         { ok, model, topic, explanation, keyPoints,
                           example, vocabulary, mcqs, nextLesson }
                                        │
      <─────────────────────────────────┘

 localStorage  <──  lib/progress.ts  <──  quiz attempts (per answer:
   "irp.quiz-attempts.v1"                 subject, topic, correct)
        │
        └──> summarise()  ──>  score · strong areas · weak areas · next lesson
```

### Where the important decisions live

| File | Responsibility |
| --- | --- |
| `app/api/tutor/route.ts` | The only place the API key is readable. Rate limits, validates input, translates typed errors into student-facing messages. |
| `lib/openrouter.ts` | Server-only OpenRouter client. Model failover chain, timeout, and mapping of HTTP 401/402/403/408/429 to typed error codes. |
| `lib/tutor.ts` | Shared contract and trust boundary. Subjects, `TutorLesson`, `parseTutorLesson`, the error-message table, option shuffling. Imported by both server and client. |
| `lib/quiz.ts` | Deterministic 25-question bank (five per subject) plus the local answer key and round builder. |
| `lib/progress.ts` | `localStorage` store — parse-on-read, cached snapshot for `useSyncExternalStore`, and `summarise()` for the report. |
| `lib/site.ts` | Site name, tagline, nav links, repository URL. Shared by header, footer, and metadata. |
| `components/site-header.tsx` | Sticky nav. The one Client Component in the chrome, because the active item needs `usePathname`. |
| `components/mcq-option.tsx` | One answer choice, shared by the tutor and the quiz so both read identically. |
| `app/globals.css` | The entire design system: `pk-*` green scale, clay shadows, light/dark tokens, focus ring, reduced motion, and the shared component vocabulary (`.btn`, `.card`, `.eyebrow`, `.medallion`, `.track`) every route styles itself from. |

### Server / client split

Pages that need URL params or metadata stay Server Components and pass plain
values into a sibling `*-client.tsx`. That keeps `useSearchParams()` — which
suspends — out of the critical path, so the tutor form paints immediately.

The assessment page reads `localStorage` through `useSyncExternalStore`, so the
first client render matches the server's empty output, clearing history
re-renders without imperative state, and a write in another tab is picked up for
free.

### Design system

`app/globals.css` is the whole design system — there is no UI dependency and no
`tailwind.config.js`. Three layers:

| Layer | Contents |
| --- | --- |
| `@theme` | The `pk-*` scale, anchored on the flag green `#01411C` at `pk-900`. A three-step radius scale (`control` 14px, `card` 20px, `panel` 24px) so a button and the card holding it never look like two different kits. One shared easing, `--ease-clay`, deliberately overshoot-free — this is a school app, not a toy. |
| `@theme inline` | Light/dark tokens (`background`, `surface`, `hairline`, `muted`) and `--shadow-clay`, an inset top highlight plus two cast shadows tinted with the flag green rather than neutral black, re-mixed per colour scheme. |
| `@layer components` | The vocabulary every route styles itself from: `.btn` (+ `-lg`, `-primary`, `-secondary`, `-outline`, `-quiet`), `.card` (+ `-pad`, `-accent`, `-lift`), `.eyebrow`, `.medallion`, `.track` / `.track-fill`. |

The component layer exists because the four routes had already drifted — three
radii and two hover treatments for the same primary action. One class per intent
makes a system-wide change a one-line edit, and because the utilities layer beats
the components layer, a local exception (the amber weak-area bars on the report)
is still just a utility.

Two fonts: **Lexend** for `h1`–`h4`, **Geist** for body and mono. Lexend was
designed to raise reading proficiency, which is precisely this audience. The
heading rule lives in `@layer base` so `font-sans` / `font-mono` can still win.

Accessibility is in the system rather than bolted on: `.btn` starts at a 44px
minimum target, one `:focus-visible` ring is declared globally, and a
`prefers-reduced-motion` block collapses every duration in the app — safe to do
wholesale because no state is conveyed by motion.

## How It Works

### 1. The student asks

From the home page they either click a subject card — which opens
`/tutor?subject=Science` — or go straight to the tutor and type a topic. The
topic field is capped at 120 characters and shows a live counter.

### 2. The server generates a lesson

`POST /api/tutor` with `{ "topic": "Pendulum", "subject": "Science" }`:

1. **Rate limit first**, before the body is even parsed, so a stuck client cannot
   drain the AI quota — 12 requests per minute per IP.
2. **Validate** the topic (non-empty, trimmed, truncated) and the subject
   (unknown values are dropped rather than forwarded).
3. **Generate**, walking the model chain until one model returns a usable lesson.
4. **Validate again.** The model's JSON is re-parsed field by field. A malformed
   reply becomes a typed error, never a broken screen.
5. **Shuffle** each question's options so the answer is not always first.

Success is a flat payload — not nested under a `lesson` key, so a client narrows
on `ok` and then reads the fields directly:

```json
{
  "ok": true,
  "model": "openrouter/free",
  "topic": "Pendulum",
  "explanation": "Pendulum ek aisi cheez hai jo...",
  "keyPoints": [
    "Pendulum aage peeche jhoolta hai kyunke gravity usay wapas kheenchti hai.",
    "Ek poore chakkar ka waqt time period kehlata hai."
  ],
  "example": "Ghar ki deewar par lagi purani ghari ka pendulum...",
  "vocabulary": [
    { "word": "Time period", "meaning": "Ek poora jhoola mukammal karne ka waqt." }
  ],
  "mcqs": [
    {
      "question": "Pendulum ka time period kis par depend karta hai?",
      "options": ["Bob ka wazan", "String ki lambai", "Bob ka rang", "Hawa"],
      "correctIndex": 1,
      "explanation": "Time period sirf lambai aur gravity par depend karta hai."
    }
  ],
  "nextLesson": { "title": "Simple Harmonic Motion", "why": "..." }
}
```

`explanation` and `mcqs` are the guaranteed teaching payload. `keyPoints`,
`example`, and `vocabulary` are requested on every call and validated when they
arrive, but they degrade to empty rather than failing the request — a free model
that skipped the glossary has still produced a usable lesson, and the UI simply
omits that section instead of costing the student the whole thing.

Failure is the same envelope inverted — `{ ok: false, code, error }` — where
`code` is one of `BAD_INPUT`, `MISSING_KEY`, `NO_CREDITS`, `RATE_LIMITED`,
`UNAUTHORIZED`, `TIMEOUT`, `BAD_SHAPE`, `UPSTREAM`, and `error` is already
translated for the student. A `detail` field carrying the raw upstream text is
added **in development only**, so a deployed app never shows a judge (or a child)
a message about account credits.

### 3. The student practises

The three MCQs answer in place. Picking an option locks the question and reveals
the correct row with an explanation. Correctness is never carried by colour
alone — there is an icon and a text label too.

### 4. The quiz scores them

`/quiz` builds a five-question round from the local bank, scoped to one subject
or all five. Rounds are built on interaction rather than during render, because
`buildRound` shuffles and a server render would not match the client. Each answer
is stored with its subject and topic.

### 5. The report closes the loop

`summarise()` groups every stored answer by `subject/topic`, splits at 70% into
strong and weak, sorts strong descending and weak ascending, and takes the
weakest topic as the recommended next lesson — which links straight back into the
tutor with both params filled in. History is capped at the 25 most recent
attempts and every read re-validates the stored shape, so a hand-edited entry
cannot crash the report.

## AI Integration

**Gateway.** OpenRouter, called through the official `openai` SDK by pointing
`baseURL` at `https://openrouter.ai/api/v1`. Requests send `HTTP-Referer` and
`X-Title` for dashboard attribution.

**Model chain.** Tried in order, all zero-cost so the app runs on an account with
no purchased credits:

```ts
export const DEFAULT_MODELS = [
  "openrouter/free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "minimax/minimax-m3:free",
] as const;
```

`OPENROUTER_MODEL` prepends a model of your choice to that list. Free endpoints
rate-limit aggressively and have a daily cap, which is exactly why the chain
exists — during testing, all three models took turns answering.

**Prompting.** One system prompt in `lib/openrouter.ts` does the teaching work,
sent with `response_format: { type: "json_object" }`, `temperature: 0.4`,
`max_tokens: 3000`, and a 45-second timeout. It has five parts, and each one
exists because of a failure seen in testing:

| Block | What it fixes |
| --- | --- |
| **Persona** | "You are Ustaad Sahib… you are NOT an encyclopedia." Left generic, the models return the article *about* the idea instead of the lesson. |
| **LANGUAGE** | Free models write Roman Urdu by ear. The block names each error with a corrected pair: gender agreement (*yeh kitab acchi hai*, not *acha hai*), oblique plurals (*kitabon mein*, not *kitab mein*), the respectful aap form with `-ein` imperatives (*karein*, *dekhein*), verb-final word order, and a banned list of regional, Punjabi, and slang words. |
| **HOW TO TEACH** | Forces short bilingual sentences, a definition for every hard word, everyday Pakistani grounding (cricket, roti, the bazaar, load-shedding), rhetorical questions, and numbered steps. |
| **TOPIC RULES** | Per-subject instructions the user prompt asks the model to select before writing: a poet gets the poetry and its *paighaam* rather than birth dates; science and mathematics are worked step by step; Islamiat keeps the durood ("Nabi Kareem ﷺ"), gives context before ruling nothing — no fatwa, no maslak disputes; Urdu as a subject uses formal textbook terms (*ism*, *fail*, *sifat*, *wahid*, *jama*); literature teaches themes and the *sabaq*, not the author's life story. |
| **OUTPUT + self-check** | Maps each of the six student-visible sections to its JSON key, forbids empty or placeholder sections, and ends with a re-read pass: fix agreement, drop regional words, confirm every imperative is in the aap form. |

The response shape is declared once as a TypeScript literal (`RESPONSE_SHAPE`)
and `JSON.stringify`-ed into the prompt, so the contract the model is shown and
the contract `parseTutorLesson` enforces cannot drift apart.

**Never trust the model.** Everything a model returns passes through
`parseTutorLesson`, which:

- requires a non-empty top-level `explanation` — this is the only hard field;
- requires each MCQ to have a question and exactly four non-empty options;
- tolerates `correctIndex` arriving as `1`, `"B"`, or `"2"` and normalises it;
- accepts either key name for a glossary entry (`word`/`term`,
  `meaning`/`definition`), because models label those inconsistently;
- joins an `example` that arrived as an array instead of discarding it;
- caps `keyPoints`, `vocabulary`, and `mcqs` so one chatty reply cannot flood the
  page, and drops unusable items rather than failing the lesson;
- defaults a missing `nextLesson` instead of rendering `undefined`;
- returns `null` on anything unusable, which the route turns into a typed error.

**Failure handling.** Errors are classified before they are retried. A 429 or a
malformed reply moves to the next model; `MISSING_KEY`, `UNAUTHORIZED`, and
`BAD_INPUT` fail immediately, because no other model can fix a bad key. OpenRouter
can also answer HTTP 200 with `{ error: { message } }` and no `choices` array at
all — that case is detected and its message surfaced into the server log instead
of throwing a `TypeError` mid-failover.

**Key handling.** `OPENROUTER_API_KEY` is read only inside `lib/openrouter.ts`,
which is imported only by the Route Handler. No page, layout, or Client Component
can reach it, and it is never inlined into the bundle.

**Known limits of the free tier.** Every rule in the ACCURACY block was written
against a real reply, and the prompt measurably lifts output quality — but a
zero-cost model is still a zero-cost model. Testing the same topic repeatedly
showed three residual failure modes:

| Observed | Mitigation |
| --- | --- |
| Invented Roman Urdu spellings and mis-used words (a pendulum rod called a *sooti*, *mushtamil* used to mean "depends on"). | Named with corrections in the prompt, plus explicit permission to fall back to simple English for any clause the model cannot write confidently. Reduced, not eliminated. |
| Fabricated quotations and poem contents when asked about a specific named nazm. | The POET and LITERATURE rules now forbid quoting unless certain and require teaching the theme instead. Verified fixed on both models tested. |
| Worked examples that contradicted the rule stated above them. | A self-check step requiring the example's numbers to agree with the rule. Verified fixed. |

Because the first of those cannot be fully prompted away, every lesson closes with
a line telling the student that the lesson was generated by AI and to check a date,
couplet, or name against their own book before an exam. That is the honest design
for a study aid, and it teaches the right habit regardless.

## Screenshots

No captures are committed — the repository deliberately ships zero binaries, and
the [live demo](#live-demo) is the real thing rather than a picture of it. To add
them, create `docs/screenshots/`, capture the six screens below, then paste the
matching embed line under each heading you want to show:

```markdown
![Home](docs/screenshots/home.png)
```

| Screen | Suggested file | What to capture |
| --- | --- | --- |
| Home | `docs/screenshots/home.png` | Hero with the positioning line plus the five subject cards. |
| AI Tutor | `docs/screenshots/tutor.png` | A generated lesson: explanation, key points, example, hard words, three MCQs, next lesson. |
| Tutor — practice | `docs/screenshots/tutor-answered.png` | One MCQ answered, with the correct row and its explanation revealed. |
| Quiz | `docs/screenshots/quiz.png` | Mid-round: a scored question with instant feedback. |
| Report | `docs/screenshots/assessment.png` | Score ring, strong areas, weak areas with their mastery bars, recommended next lesson. |
| Dark mode | `docs/screenshots/dark.png` | Any route with the OS set to dark, to show the second palette. |

> Capture at 1440×900 for desktop shots and 390×844 (iPhone-class) for at least
> one mobile shot — a low-end phone is the target device, so showing the mobile
> layout is worth more than another desktop view.

## Installation

**Prerequisites**

| | |
| --- | --- |
| Node.js | 20.9 or newer (developed on 24.18) |
| npm | 10 or newer (developed on 11.16) |
| OpenRouter key | Free — create one at <https://openrouter.ai/keys> |

```bash
git clone https://github.com/Ub207/ilm-se-roshan-pakistan.git
cd ilm-se-roshan-pakistan
npm install
cp .env.example .env.local   # then paste your key into OPENROUTER_API_KEY
npm run dev
```

Open <http://localhost:3000>.

Without a key, `/`, `/quiz`, and `/assessment` still work fully — only `/tutor`
reports that the AI is not configured, which is the same graceful-degradation
path a rate-limited key takes.

## Local Development

| Command | What it does |
| --- | --- |
| `npm run dev` | Turbopack dev server on `:3000`. |
| `npm run build` | Production build — compiles, typechecks, and prerenders every route. |
| `npm start` | Serves the build produced by `npm run build`. |
| `npm run lint` | ESLint 9 flat config (`next/core-web-vitals` + TypeScript). |
| `npx next typegen` | Regenerates route types without a full build. |

`npm run build` is the fastest complete check: it type-checks and prerenders in
one pass, so a type error and a render error surface together.

**Project layout**

```
app/
  layout.tsx            root chrome: fonts, metadata, header, footer, skip link
  page.tsx              home — hero, subjects, how it works, features, benefits, CTA
  globals.css           the whole design system (Tailwind v4 @theme, no config file)
  error.tsx             route-level error boundary
  not-found.tsx         404
  api/tutor/route.ts    the only server route; the only reader of the API key
  tutor/                page.tsx (server, reads params) + tutor-client.tsx
  quiz/                 page.tsx (server) + quiz-client.tsx
  assessment/           page.tsx (server) + assessment-client.tsx
components/
  site-header.tsx       sticky nav with an active state
  site-footer.tsx       brand, feature links, subject deep links, privacy line
  mcq-option.tsx        one answer choice, shared by tutor and quiz
  icons.tsx             inline SVG set
lib/
  tutor.ts              shared contract + runtime validation (server & client safe)
  openrouter.ts         server-only AI client with model failover
  quiz.ts               25-question bank, answer key, round builder
  progress.ts           localStorage store + summarise()
  site.ts               site name, tagline, nav links, repo URL
```

**Notes that will save you an hour**

- Next 16 allows only **one `next dev` per project directory**. A second call
  prints the running server's PID instead of picking a new port.
- Dev logs land in `.next/dev/logs/next-development.log` — the AI failover chain
  logs every model it tried and why each one failed.
- Typed route props (`PageProps<'/tutor'>`, `LayoutProps<"/">`) are **global**;
  importing them is an error. `params` and `searchParams` are Promises.
- Tailwind v4 is CSS-first. Add tokens to `@theme` in `app/globals.css`; do not
  create a `tailwind.config.js`.

## Environment Variables

Copy `.env.example` to `.env.local`. `.env.local` is git-ignored; `.env.example`
holds placeholders only.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `OPENROUTER_API_KEY` | **Yes** (for `/tutor`) | — | Server-side OpenRouter credential. Read only in `lib/openrouter.ts`. Never exposed to the browser. |
| `OPENROUTER_MODEL` | No | unset | Prepends one model to the failover chain. A paid model needs credits on the account. |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Sent as `HTTP-Referer` for OpenRouter dashboard attribution. Set to the deployed URL in production. |

Only `NEXT_PUBLIC_SITE_URL` carries the `NEXT_PUBLIC_` prefix, and it is a public
URL by definition. The key has no prefix, is read in one server-only module, and
cannot reach a Client Component.

## Deployment

**Vercel** (recommended — zero config for the Next.js preset):

1. Push to GitHub.
2. On Vercel, **Add New → Project** and import the repository. The Next.js preset
   is detected; leave the build command and output directory alone.
3. Add the environment variables under **Settings → Environment Variables**:
   - `OPENROUTER_API_KEY` — your key, for Production **and** Preview.
   - `NEXT_PUBLIC_SITE_URL` — the deployed URL, e.g. `https://ilm-se-roshan-pakistan.vercel.app`.
4. Deploy. `/`, `/quiz`, and `/assessment` are served as static HTML; `/api/tutor`
   runs as a serverless function.

```bash
# or from the CLI
npm i -g vercel
vercel            # preview deployment
vercel --prod     # production
```

**Anywhere else.** Any Node host works: `npm ci && npm run build && npm start`
behind a reverse proxy, with the same two environment variables set. Nothing in
the app is Vercel-specific — no edge config, no KV, no image optimisation service.

**Deployment checklist**

- [ ] `OPENROUTER_API_KEY` set on the host, not in the repo.
- [ ] `NEXT_PUBLIC_SITE_URL` matches the real origin.
- [ ] `.env.local` is not in the commit (`git check-ignore -v .env.local`).
- [ ] `npm run build` passes locally first.
- [ ] `GET /api/tutor` returns **404** in production — the health endpoint is
      development-only on purpose, so a deployed app does not advertise which
      model chain and configuration it is running.

**One caveat worth knowing before a demo.** The model chain is all free-tier, and
OpenRouter caps free-model requests per day per account. When that cap is hit
every model in the chain returns 429, and the tutor shows its rate-limited
message with a link to the quiz instead of failing blank. If you are demoing to a
schedule, either add a few credits to the OpenRouter account or set
`OPENROUTER_MODEL` to a cheap paid model for the day.

## Future Roadmap

| Stage | Item | Why it matters |
| --- | --- | --- |
| Next | **Urdu-script mode** | A toggle between Roman Urdu and نستعلیق for students who read Urdu script more comfortably than Roman. |
| Next | **Streamed explanations** | Stream the lesson token by token so the first sentence appears in ~1s instead of after the whole JSON object. |
| Next | **Wider quiz bank** | 25 questions is enough to prove the loop; a real bank needs grade-tagged coverage per board chapter. |
| Later | **Grade selector** | Grades 5–10 currently share one prompt. Passing the grade would tighten vocabulary and worked examples. |
| Later | **Offline-first PWA** | A service worker would make the quiz and report usable with no connection at all — the common case on a metered phone. |
| Later | **Optional accounts** | Progress is device-local by design. An opt-in sync would let a student switch phones without losing their report. |
| Later | **Teacher view** | One class code, an aggregate weak-topic list, and no student-level surveillance. |
| Later | **Voice input and TTS** | Ask by speaking and hear the explanation — the biggest accessibility win for a student who reads slowly. |
| Later | **Real evaluation harness** | A fixed topic set scored against rubric checks, so a prompt change can be measured instead of eyeballed. |

## Team

| Name | Role | Links |
| --- | --- | --- |
| **Ub207** | Project lead — product, engineering, design | [GitHub](https://github.com/Ub207) |

**Submission:** Alibaba Cloud Hackathon — Ilm Se Roshan Pakistan.

## Live Demo

**🔗 <https://ilm-se-roshan-pakistan.vercel.app>**

What to try, in order, in about ninety seconds:

1. On the home page, click the **Science** card — it opens the tutor with the
   subject already selected.
2. Type **Pendulum** and press **Mujhe Samjhao**. Read the explanation, then
   answer one of the three practice questions and watch the reveal.
3. Go to **Quiz**, pick **All subjects**, and answer five questions.
4. Open **Report** to see the score, the strong and weak areas derived from those
   answers, and the recommended next lesson — click it to land back in the tutor
   with the topic pre-filled.

If the tutor reports that the AI's free quota is exhausted, that is the daily
OpenRouter free-tier cap, not a bug: the quiz and the report are fully local and
keep working, which is exactly what the fallback path is designed to prove.

## GitHub Repository

**<https://github.com/Ub207/ilm-se-roshan-pakistan>**

```bash
git clone https://github.com/Ub207/ilm-se-roshan-pakistan.git
```

Issues and pull requests are welcome. Two ground rules if you contribute:

- `npm run lint` and `npm run build` must both pass — the build is the type check.
- Student-facing copy stays in the same register: simple English with Roman Urdu
  for the hard parts. It is not a stylistic quirk, it is the accessibility feature.

---

Built for students who are stuck, and for the teachers who do not have time to
notice. **Ilm se roshan Pakistan.**




