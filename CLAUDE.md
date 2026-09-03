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

The most important thing to know before editing: **there is no AI, backend, or data layer.** Every "AI" response is a hardcoded `if`/`else` branch inside the component that renders it.

- `app/page.tsx` — landing page, Server Component. Hero linking to the three feature routes, a local `subjects` array rendered as cards, and a static feature list.
- `app/tutor/page.tsx` (`/tutor`) — Client Component. `explainTopic()` lowercases the typed topic and string-matches it against three hardcoded lessons (`fractions`, `photosynthesis`, `salah`), with a fallback message listing those options.
- `app/quiz/page.tsx` (`/quiz`) — Client Component. One hardcoded multiple-choice question; correctness is literally `selected === "B"`.
- `app/assesstment/page.tsx` (`/assesstment`) — Server Component. Fully static progress report (score, strong areas, weak areas, recommended next lesson).
- `app/layout.tsx` — root layout; loads Geist via `next/font/google` and imports `globals.css`.

Implications:

- Every route prerenders as static (`○` in build output). Nothing is dynamic, so adding real content means introducing this project's first data fetch or Route Handler.
- `package.json` contains no AI/model client and no cloud SDK — only `next`, `react`, `react-dom`, and tooling. Wiring real AI is greenfield work, not an edit to existing plumbing.
- The subject cards on the landing page carry `cursor-pointer` but have no handler or link, so they appear clickable and do nothing.

### Content language

Student-facing copy is Roman Urdu mixed with English — button text `Mujhe Samjhao`, fallback `Demo ke liye Fractions, Photosynthesis ya Salah likhein`. Match that register when adding lessons or UI copy.

## Conventions specific to this setup

- **Typed route props are global, not imported.** `app/layout.tsx` uses `LayoutProps<"/">`; pages use `PageProps<'/route'>`. These are generated into `.next/types` by `next dev`, `next build`, or `next typegen` and are globally available — importing them is wrong. `params` and `searchParams` are Promises and must be awaited (or read with React's `use` in a Client Component).
- **Tailwind v4, CSS-first.** There is no `tailwind.config.js` and there should not be one. Tailwind enters via `@import "tailwindcss"` in `app/globals.css`, and theme tokens are declared there inside `@theme inline`; `postcss.config.mjs` registers `@tailwindcss/postcss`. Add design tokens to `globals.css`.
- `globals.css` hardcodes `body { font-family: Arial, Helvetica, sans-serif }`, which overrides the Geist CSS variables the root layout sets. Geist applies only where a `font-sans` / `font-mono` utility is used.
- Import alias is `@/*` → repo root, per `tsconfig.json`.

## Known defects

- `app/page.tsx:44` links to `/assessment`, but the directory is `app/assesstment/`, so the real route is the misspelled `/assesstment`. The "View Report" link 404s. Fix by renaming the directory and the link together, or by correcting the `href`.

## AGENTS.md is generated

`AGENTS.md` holds a managed block between `<!-- BEGIN:nextjs-agent-rules -->` and `<!-- END:nextjs-agent-rules -->` that `next dev` rewrites on every start — deleting it from a diff only recreates the uncommitted change, so commit it alongside your work. Because `AGENTS.md` hosts that block, the generator skips `CLAUDE.md` entirely (see `node_modules/next/dist/server/lib/generate-agent-files.js:99`), so this file is safe to hand-edit.
