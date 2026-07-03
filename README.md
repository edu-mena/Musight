# GiraSightin — Frontend

React 19 + TypeScript + Vite frontend for GiraSightin. The backend (PHP + MySQL) lives outside this repo — see `BACKEND_PROMPT.md`.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in VITE_API_URL and (optionally) VITE_GROQ_API_KEY
npm run dev
```

Environment variables are validated at startup with Zod (`src/lib/env.ts`) — the app fails fast with a clear error if `VITE_API_URL` is missing or malformed.

⚠️ **`VITE_GROQ_API_KEY` is bundled into the client-side JS in production.** Anyone can extract it from the browser's network/devtools. Treat it as a known limitation, not a secret — see the "Weza AI key" note below before relying on it in production.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck (`tsc -b`) and build for production |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:ui` | Run Vitest with the browser UI |
| `npm run format` | Format the codebase with Prettier |
| `npm run format:check` | Check formatting without writing (used in CI) |

## Tooling

- **Validation** — [Zod](https://zod.dev) schemas in `src/lib/validation/`, paired with [react-hook-form](https://react-hook-form.com) for flat forms (Login, Register, WriterApplicationModal) and schema-validated submit handlers for multi-section forms (PublishArticle, PublishDebate, profile editors) where a full RHF rewrite of the accordion/tab UI wasn't worth the risk.
- **Testing** — [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com). Component tests live next to their source file (`*.test.tsx`), schema tests next to their schema (`*.test.ts`).
- **Error tracking** — [Sentry](https://sentry.io) (`src/lib/sentry.ts`), enabled only in production and only when `VITE_SENTRY_DSN` is set.
- **Formatting/linting** — Prettier + ESLint (`eslint-config-prettier` disables stylistic rules that would conflict with Prettier).
- **Git hooks** — Husky runs `lint-staged` on commit (ESLint --fix + Prettier on staged files).
- **CI** — GitHub Actions (`.github/workflows/ci.yml`) runs format-check, lint, tests, and build on every push/PR to `master`.

## Known security note: the Weza AI key

`src/services/aiService.ts` calls the Groq API directly from the browser using `VITE_GROQ_API_KEY`. Because Vite inlines `VITE_*` variables into the production bundle, this key is visible to anyone who opens devtools — it is **not secret in production**. The safe fix is to move this call behind the PHP backend (proxy the request server-side, keep the key out of the client), matching how `VITE_API_URL` requests already work. Until that's done, treat the Groq key as low-trust: rotate it if abused, and don't reuse it for anything with a paid quota you can't afford to lose.
