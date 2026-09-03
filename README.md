# Ilm Se Roshan Pakistan

An AI learning companion for Pakistani school students (grades 5–10). Ask about
any topic and the app generates a plain-language explanation, three practice
MCQs, and a suggested next lesson. A local quiz bank scores real attempts, and
the assessment page turns that history into strong areas, weak areas, and the
topic to study next.

Student-facing copy is deliberately Roman Urdu mixed with English — the register
Pakistani students actually read.

## Quick start

```bash
npm install
cp .env.example .env.local     # then paste a real OpenRouter key
npm run dev                    # http://localhost:3000
```

The tutor is the only feature that needs a key. Home, quiz, and assessment work
offline.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | Server-side key for the tutor. Create one at [openrouter.ai/keys](https://openrouter.ai/keys). |
| `OPENROUTER_MODEL` | No | Pins one model instead of the free fallback chain. A paid model needs credits on the account. |
| `NEXT_PUBLIC_SITE_URL` | No | Sent as `HTTP-Referer` for OpenRouter dashboard attribution. Set to the deployed URL in production. |

`.env.local` is git-ignored. `.env.example` is the committed template — it holds
placeholders only.

## Commands

```bash
npm run dev       # Turbopack dev server on :3000
npm run build     # Compiles, typechecks, and prerenders every route
npm run lint      # ESLint 9 flat config
npm start         # Serve the production build
npx next typegen  # Regenerate route types without a full build
```

`npm run build` is the fastest complete check: it compiles, runs TypeScript, and
prerenders all routes in one pass. There is no test framework in this repo.

Next 16 allows only **one `next dev` per project directory** — a second
invocation prints the running server's PID instead of picking another port.

## Routes

| Route | Rendering | What it does |
| --- | --- | --- |
| `/` | Static | Hero, five subject cards linking into the tutor, how-it-works, feature grid. |
| `/tutor` | Dynamic | Reads `?subject=` and `?topic=`, then calls the AI tutor. |
| `/quiz` | Static shell | Pick a scope, answer five questions, see a scored result and review. |
| `/assessment` | Static shell | Roll-up of stored attempts: score, strong/weak areas, next lesson. |
| `/api/tutor` | Dynamic | `POST` generates a lesson. `GET` is a dev-only config check that 404s in production. |

## Architecture

**AI tutor.** `app/api/tutor/route.ts` validates the body, applies an in-memory
rate limit, and delegates to `lib/openrouter.ts`, which walks a chain of
zero-cost OpenRouter models until one returns a usable lesson. `lib/tutor.ts`
holds the shared contract — subjects, the `TutorLesson` shape, and
`parseTutorLesson`, which revalidates every model response (including tolerating
a `correctIndex` returned as `"B"` or `"2"`) so a malformed reply becomes a typed
error instead of a broken screen. Pages never read the key; only the route
handler does.

**Quiz and progress.** `lib/quiz.ts` is a deterministic 25-question bank (five
per subject) with a local answer key, so scoring is honest and the quiz still
works when the free tier is rate limited. Attempts are tagged per answer with
subject and topic, saved to `localStorage` by `lib/progress.ts`, and aggregated
by `summarise()` into the assessment report. There is no account system, so
progress is per-browser by design; every read revalidates the stored shape so a
hand-edited entry cannot crash the report.

**Server/client split.** Pages that need URL params or metadata stay Server
Components and pass values into a sibling `*-client.tsx`. The assessment page
reads `localStorage` through `useSyncExternalStore`, which keeps the first client
render matching the server's output and picks up writes from other tabs.

**Styling.** Tailwind v4, CSS-first: no `tailwind.config.js`. Tokens — including
the Pakistan green `pk-*` scale and the `shadow-clay` depth pair — are declared
in `app/globals.css` under `@theme`. Icons are SVG components in
`components/icons.tsx`; no emoji, no icon dependency.

## Deploying to Vercel

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project** and import the repo. The Next.js preset is
   detected automatically; leave build command and output directory at their
   defaults.
3. Under **Settings → Environment Variables**, add `OPENROUTER_API_KEY` for
   Production, Preview, and Development. Optionally add `NEXT_PUBLIC_SITE_URL`
   (your `https://<project>.vercel.app` URL) and `OPENROUTER_MODEL`.
4. Deploy, then check `/tutor` on the deployment — it is the only route that
   exercises the key. `GET /api/tutor` returns 404 in production by design.
5. Re-deploy after changing environment variables; Next inlines them at build
   time.

The in-memory rate limiter in `app/api/tutor/route.ts` is per-instance. On
serverless each instance keeps its own counter, so swap in a shared store
(Upstash, Vercel KV) before exposing this to real traffic.
