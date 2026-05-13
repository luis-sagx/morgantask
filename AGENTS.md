# AGENTS.md — Morgan Task

## Project Structure

Monorepo with two independent packages:

| Package | Manager | Port | Entry |
|---|---|---|---|
| `morgantask_backend/` | **pnpm** (v9.15.0 via corepack) | 4000 | `src/index.ts` |
| `morgantask_frontend/` | **pnpm** (v10.33.0) | 5173 | `src/main.tsx` |

**Critical**: both packages use `pnpm install`. Do not use `npm install`.

## Backend Architecture (Hexagonal/Clean)

```
src/
  domain/        → entities, ports (interfaces)
  application/   → usecases (business logic)
  infrastructure/ → models, repositories, DI container, config, security
  interfaces/    → controllers, middleware, routes
```

- `src/server.ts` wires everything: loads env, connects DB, mounts routes at `/api/auth` and `/api/projects`
- `src/index.ts` calls `server.listen()`
- DI container lives at `infrastructure/container.ts`

## Developer Commands

```bash
# Backend
cd morgantask_backend
pnpm run dev        # nodemon + ts-node, port 4000
pnpm run test       # jest --passWithNoTests
pnpm run lint       # eslint "src/**/*.ts"
pnpm run lint:fix   # eslint --fix

# Frontend
cd morgantask_frontend
pnpm run dev       # vite, port 5173
pnpm run test      # vitest (watch mode)
pnpm run lint      # eslint . --ext ts,tsx
```

### Running a single test

```bash
# Backend (Jest)
npx jest --testPathPattern=AuthUseCases

# Frontend (Vitest)
pnpm vitest run src/views/auth/LoginView.test.tsx
```

## Docker Compose

```bash
docker compose up --build
```

- MongoDB maps to host port **27019** (not default 27017)
- Backend `.env` is mounted from `./morgantask_backend/.env`
- Frontend env vars are set inline in compose (no `.env` file mounted)

## Testing

### Backend (Jest)
- Config: `jest.config.js` — preset `ts-jest`, env `node`
- Pattern: `**/__tests__/**/*.test.ts`
- Uses `mongodb-memory-server` for in-memory MongoDB (no real DB needed for unit tests)
- Tests live in `src/__tests__/`

### Frontend (Vitest)
- Config: `vite.config.ts` — env `jsdom`, globals enabled
- Setup: `src/test/setup.ts` (mocks `ResizeObserver`)
- Coverage thresholds: **85%** across statements, branches, functions, lines
- Test files: `*.test.tsx` colocated with components

## Path Alias

Frontend uses `@` → `./src` alias (configured in `vite.config.ts`). Backend has no path alias.

## Env Files

- Backend: copy `.env.local` → `.env` in `morgantask_backend/`
- Frontend: uses `.env.local` in `morgantask_frontend/` (VITE_API_URL)
- `.env` is gitignored; `.env.local` is committed as template

## Tech Stack

- **Backend**: Express, TypeScript, MongoDB/Mongoose, JWT, bcrypt, Morgan
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router, React Query (TanStack), Zod, react-hook-form
- **Infra**: Docker Compose (MongoDB 7 + Node 20 Alpine)
