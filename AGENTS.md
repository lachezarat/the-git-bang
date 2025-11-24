# Agent Guidelines

## Commands

- **Test:** `pnpm test` (All) or `pnpm exec vitest path/to/file` (Single file)
- **Typecheck:** `pnpm typecheck` (Run `tsc`)
- **Lint/Format:** `pnpm format.fix` (Prettier)
- **Build:** `pnpm build` (Client & Server)
- **Dev:** `pnpm dev` (Vite + Express)

## Code Style & Conventions

- **Frameworks:** React 18, React Router 6, TailwindCSS 3, Radix UI, Express, Zod.
- **Formatting:** Prettier default. Use `cn()` for conditional classes.
- **Components:** Functional components with TypeScript. Keep components small; break down complex UI into smaller files (see `.builder/rules/organize-ui.mdc`).
- **Imports:** Use `@/` alias for client, `@shared/` for shared types. Group imports (builtin, external, internal).
- **Types:** Strict TypeScript. Share types in `shared/` if used by both ends. Avoid `any`.
- **Naming:** PascalCase for components (`MyComponent.tsx`), camelCase for functions/vars. `useHook` for hooks.
- **Async:** Use `async/await` with `try/catch` blocks.
- **Routing:** Define routes in `client/App.tsx`. API routes in `server/routes/` and register in `server/index.ts`.
