---
name: archimedes
description: Scaffolds a production Next.js app with Bun, shadcn/ui, better-auth, Drizzle ORM, and SQLite. Use when creating a new full-stack app or initializing this stack.
---

# Archimedes

Scaffold Next.js with Bun, shadcn/ui, better-auth, Drizzle, and SQLite. File bodies live in [reference.md](reference.md).

## Workflow

Tick each step. Done means the criterion holds.

1. **Create the app** — `bun create next-app@latest <name> --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-bun` then `cd`. Done when App Router + Tailwind exist.
2. **Init shadcn** — `bunx --bun shadcn@latest init -d` (drop `-d` if the user named a style). Done when `components.json` exists.
3. **Install** — `bun add better-auth drizzle-orm` and `bun add -D drizzle-kit @types/bun`. Done when both appear in `package.json`.
4. **Env** — `.env.local` with `BETTER_AUTH_SECRET` from `openssl rand -base64 32`, `BETTER_AUTH_URL=http://localhost:3000`, `DB_FILE_NAME=sqlite.db`. Gitignore `*.db` and `*.db-journal`. Done when the secret is a real value.
5. **Drizzle** — Write `src/db/index.ts`, `src/db/schema/index.ts`, placeholder `src/db/schema/auth.ts`, and `drizzle.config.ts`. Done when `db` exports a `bun:sqlite` Drizzle client wired to `./schema`.
6. **better-auth** — Write `src/lib/auth.ts` (email/password + drizzle sqlite adapter + session `cookieCache`). `bunx @better-auth/cli@latest generate --output src/db/schema/auth.ts`. Done when that file has `user`, `session`, `account`, and `verification`.
7. **Auth route** — `src/app/api/auth/[...all]/route.ts` via `toNextJsHandler`. Done when GET and POST export from that file.
8. **Auth client** — `src/lib/auth-client.ts` exporting `signIn`, `signUp`, `signOut`, `useSession`.
9. **Push schema** — `bunx drizzle-kit push`. Done when `sqlite.db` exists. Use `generate` + `migrate` for production.
10. **Scripts** — Add `db:push`, `db:generate`, `db:migrate`, `db:studio` to `package.json`.

## Verify

`bun run dev`. Done when `http://localhost:3000` loads, `/api/auth/ok` responds, and `sqlite.db` is on disk.

## After

OAuth, protected routes, auth pages, new tables, Turso: [examples.md](examples.md).
