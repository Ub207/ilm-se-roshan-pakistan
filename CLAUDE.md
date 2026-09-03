# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Turbopack dev server on :3000
npm run build     # Production build: compiles, typechecks, and prerenders every route
npm run lint      # ESLint 9 flat config (eslint-config-next core-web-vitals + typescript)
npm start         # Serve the production build
npx next typegen  # Regenerate route types / next-env.d.ts without a full build
```

`npm run build` is the fastest complete check — it compiles with Turbopack, runs TypeScript, and prerenders all routes, so it catches type errors and render errors in one pass.

There is no test framework, no `test` script, and no test file in this repo. `npm test` does not exist; testing would have to be set up from scratch.

### Dev server behavior

- Next 16 permits only **one `next dev` per project directory**. A second invocation refuses to start and prints the existing server's PID instead of picking another port — use the running server, or `taskkill /PID <pid> /F` first.
- Dev logs go to `.next/dev/logs/next-development.log`.
- Turbopack can cache a broken module from a mid-save write and keep reporting a stale error (e.g. `The default export is not a React Component in "/page"`) when the file on disk is valid. Confirm the source is fine with `npm run build`, then stop the server, `rm -rf .next/dev`, and restart.

## Architecture

"Ilm Se Roshan Pakistan" is a hackathon-MVP App Router site — an AI learning companion aimed at Pakistani school students.

Two things shape most edits:

1. **The tutor is the only live AI path.** Everything else is deterministic local data. Quiz questions come from a hardcoded bank, and the assessment report is derived from `localStorage`, not a server.
2. **There is no database and no account system.** Student progress lives in one `localStorage` key, per browser.

### The AI tutor

- `lib/openrouter.ts` — server-only OpenRouter client. Never import it from a Client Component; it reads `OPENROUTER_API_KEY`. `generateLesson` walks `DEFAULT_MODELS` (all zero-cost: `openrouter/free` → `nvidia/nemotron-3-super-120b-a12b:free` → `minimax/minimax-m3:free`) until one returns a usable lesson, so a rate-limited or malformed free-tier reply fails over instead of surfacing. `OPENROUTER_MODEL` prepends a forced model. `NON_FAILOVER_CODES` short-circuits the chain for key problems, where retrying cannot help.
- `lib/tutor.ts` — the shared contract, imported by both server and client: `SUBJECTS`/`isSubject`, `TutorLesson`, the `TutorApiResponse` union, `MAX_TOPIC_LENGTH`, `MCQ_COUNT`, and `parseTutorLesson`. That parser is the trust boundary — it revalidates every model response (tolerating `correctIndex` sent as `"B"` or `"2"`, enforcing exactly 4 options) so a bad reply becomes a typed error, not a broken render.
- `app/api/tutor/route.ts` — `force-dynamic`. Validates the body, applies a 12-request/60s in-memory limit keyed on `x-forwarded-for` **before** parsing the body, and returns `{ ok: true, model, ...lesson }` or `{ ok: false, code, error }`. The `GET` handler is a dev-only config check (key presence and model chain, never the key itself) and 404s in production. The limiter is per-instance, so serverless needs a shared store for real traffic.

Success payloads are **flat**, not nested under a `lesson` key — clients narrow on `payload.ok` and then read `payload.explanation` / `payload.mcqs` / `payload.nextLesson` directly, and read `payload.error` on failure.

### Quiz and progress

- `lib/quiz.ts` — 25-question bank, five per subject, each with a local `correctIndex` and explanation. This exists so scoring is honest and the quiz works when the free tier is rate limited. `buildRound(scope)` shuffles a copy (never mutates the bank) and draws one question per subject for a mixed round.
- `lib/progress.ts` — the `localStorage` layer plus `summarise()`. Attempts are stored under `irp.quiz-attempts.v1`, capped at 25, and **every read revalidates the shape** so a stale or hand-edited entry cannot crash the report. `summarise()` aggregates answers by `${subject}/${topic}` and splits them at `STRONG_THRESHOLD` (70%); the weakest topic becomes `nextLesson`.

`getAttemptsSnapshot` caches its parsed array against the raw string. Keep that: `useSyncExternalStore` loops forever if `getSnapshot` returns a fresh object each call — which is why `summarise()` runs in a `useMemo` in the component, not inside the snapshot getter.

### Routes

- `app/page.tsx` — landing page, Server Component. Hero, five subject cards each linking to `/tutor?subject=<Subject>`, how-it-works steps, feature grid.
- `app/tutor/page.tsx` + `tutor-client.tsx` — the page is an **async Server Component** reading `?subject=` and `?topic=`; the client sibling owns the form and fetch. Split this way on purpose: `useSearchParams()` would suspend the whole route.
- `app/quiz/page.tsx` + `quiz-client.tsx` — a `setup → playing → done` machine. Rounds are shuffled inside event handlers, never during render, so hydration stays stable.
- `app/assessment/page.tsx` + `assessment-client.tsx` — reads history via `useSyncExternalStore`, not an effect (`react-hooks/set-state-in-effect` is enforced here and will reject the effect-plus-`setState` version).
- `app/error.tsx`, `app/not-found.tsx` — route-level error boundary and 404.
- `components/icons.tsx` — all icons are inline SVG components. No emoji as icons, no icon dependency. `components/mcq-option.tsx` is the one answer row shared by tutor and quiz, so both read identically.

### Content language

Student-facing copy is Roman Urdu mixed with English — button text `Mujhe Samjhao`, headings like `Apna imtihan lein`. Match that register when adding lessons or UI copy. Expect cSpell "unknown word" noise on it; that is intentional.


## Conventions specific to this setup

- **Typed route props are global, not imported.** `app/layout.tsx` uses `LayoutProps<"/">`; pages use `PageProps<'/route'>`. These are generated into `.next/types` by `next dev`, `next build`, or `next typegen` and are globally available — importing them is wrong. `params` and `searchParams` are Promises and must be awaited (or read with React's `use` in a Client Component).
- **Tailwind v4, CSS-first.** There is no `tailwind.config.js` and there should not be one. Tailwind enters via `@import "tailwindcss"` in `app/globals.css`, and theme tokens are declared there inside `@theme inline`; `postcss.config.mjs` registers `@tailwindcss/postcss`. Add design tokens to `globals.css`.
- `globals.css` sets `font-family` on `body` from the Geist CSS variables the root layout provides, so the theme font applies without needing a `font-sans` utility on every element.
- Import alias is `@/*` → repo root, per `tsconfig.json`. `noUncheckedIndexedAccess` is **off**, so `array[0]` types as non-`undefined` — index access still needs a runtime guard where the value can genuinely be missing.
- `.gitignore` ignores `.env*` but re-includes `!.env.example`. Keep that negation, or the committed env template silently disappears.

## Environment

`OPENROUTER_API_KEY` is required for `/tutor`; the rest of the app runs without it. `OPENROUTER_MODEL` and `NEXT_PUBLIC_SITE_URL` are optional. See `.env.example` and `README.md`.

## AGENTS.md is generated

`AGENTS.md` holds a managed block between `<!-- BEGIN:nextjs-agent-rules -->` and `<!-- END:nextjs-agent-rules -->` that `next dev` rewrites on every start — deleting it from a diff only recreates the uncommitted change, so commit it alongside your work. Because `AGENTS.md` hosts that block, the generator skips `CLAUDE.md` entirely (see `node_modules/next/dist/server/lib/generate-agent-files.js:99`), so this file is safe to hand-edit.
