# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js routes, layouts, and server components. Stick to colocation; each route folder owns its UI, loaders, and mutations.
- `components/`: Reusable client components; prefer headless logic in `hooks/` and visual primitives under `components/ui/`.
- `lib/`: Cross-cutting utilities (API clients, auth helpers, Drizzle schema). Add subfolders when a domain grows beyond a single file.
- `tests/` and `playwright.config.ts`: Browser-level Playwright suites. Keep fixtures in `tests/fixtures/` and selectors alongside the specs.
- `public/`: Static assets served as-is.
- `lib/db/migrate.ts` and `drizzle.config.ts`: Database migrations; generated SQL lives in `artifacts/`.

## Build, Test, and Development Commands
- `pnpm dev`: Launches the Next.js dev server with Turbopack.
- `pnpm build`: Runs Drizzle migrations (via `tsx lib/db/migrate`) then compiles the Next.js app for production.
- `pnpm start`: Serves the built app.
- `pnpm lint`: Runs `ultracite check` for linting and formatting drift detection.
- `pnpm exec tsx lib/db/migrate.ts`: Apply pending Drizzle migrations locally.
- VS Code task `Quality`: Sequentially runs `pnpm lint` and `pnpm exec tsc --noEmit`.

## Coding Style & Naming Conventions
- Language: TypeScript with React Server/Client Components; keep files `.tsx` unless they export pure utilities (`.ts`).
- Styling: Tailwind CSS (class merging via `tailwind-merge`). Co-locate component styles; avoid global overrides.
- Linting: Rely on Ultracite (`pnpm lint`) and auto-fixes via `pnpm format`. Configure additional Biome rules in `biome.jsonc` if needed.
- Naming: Use descriptive PascalCase for components (`ChatComposer.tsx`), camelCase for hooks (`useChatStream.ts`), and kebab-case for route segments (`app/(dashboard)/datasets/page.tsx`).

## Testing Guidelines
- Framework: Playwright (@playwright/test). Store specs under `tests/` with `.spec.ts` suffix.
- Run locally: `PLAYWRIGHT=true pnpm exec playwright test` or the VS Code “Tests” task.
- Recordings: Commit playwright traces only when debugging CI failures; otherwise exclude from PRs.
- Add regression coverage for UI flows touching persistency or auth. For logic extraction, prefer colocated unit tests using Vitest in future contributions.

## Commit & Pull Request Guidelines
- Commits: Follow concise, present-tense summaries (e.g., `Add quickstart data grid example`). Group related changes; avoid “WIP”.
- PRs: Provide context, screenshots for UI updates, and link Vercel previews when available. Mention migration effects and provide rollback notes if schema changes.
- CI: Ensure `pnpm lint`, `pnpm exec tsc --noEmit`, and Playwright tests pass before requesting review.

## Security & Configuration Tips
- Environment: Copy `.env.example` to `.env.local`; never commit secrets. Use Vercel project-level variables for deployment.
- Tokens and API keys used with `@ai-sdk/gateway` should be managed via Vercel secure storage; do not hardcode fallback keys under `lib/`.
