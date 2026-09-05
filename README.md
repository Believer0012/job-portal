# Job Portal Management System

## Overview

A full-stack job portal with two areas built on one shared backend:

- **Admin Portal** — authenticated job management: create, edit, view, delete jobs, change job status, and a dashboard summarizing job/application counts. Admins sign in with a JWT access token plus an HTTP-only refresh-token cookie.
- **User Portal** — a public site for browsing published jobs (landing page, featured jobs, category browsing, search/filter/sort/pagination, job details) plus authenticated job applications: a signed-in `USER` can apply to a published job once, with duplicate applications rejected server-side.

Both portals share the same Express/PostgreSQL backend and the same Redux Toolkit store on the frontend — each domain (auth, dashboard, admin jobs, public jobs, applications) has its own slice, thunk, and API module, all going through a single `apiClient` to the REST API.

This is a machine-test submission. It does not include a user dashboard, resume upload, application history, notifications, or an admin applications/users screen — those are explicitly out of scope for this build.

## Technology Stack

**Frontend** (`apps/web`)
- React 19 + TypeScript
- Vite (build/dev server)
- Redux Toolkit + React Redux
- React Router (v7)
- React Hook Form + Zod (form validation)
- Plain CSS (`src/App.css`, `src/index.css`) — no CSS framework (no Tailwind) is used
- lucide-react (icons)

**Backend** (`apps/api`)
- Node.js + Express 5 + TypeScript
- Prisma ORM (PostgreSQL)
- JWT (`jsonwebtoken`) for access tokens, with a separate hashed, rotating refresh token
- bcrypt (password hashing)
- Zod (request validation)
- helmet, cors, cookie-parser, morgan

**Database**
- PostgreSQL, managed with Prisma migrations and a Prisma seed script

## Project Structure

```
apps/
  web/                  React + Vite frontend
    src/
      app/              Redux store + typed hooks
      features/         Redux slices, one folder per domain
        auth/
        dashboard/
        jobs/           Admin job state
        publicJobs/     Public job-browsing state
        applications/   Job application state
      lib/               apiClient (all HTTP calls) + shared formatting helpers
      components/        Admin + public layout/shared components
      pages/
        admin/           Admin-only pages (behind ProtectedRoute)
        public/           Public landing/jobs/job-details pages
        auth/             Shared login page
  api/                  Express + Prisma backend
    src/
      routes/            Express routers
      controllers/       Request/response glue only
      services/          Business logic
      repositories/      Prisma queries
      validators/        Zod schemas
      middleware/         Auth, role, and validation middleware

prisma/
  schema.prisma          Database schema
  migrations/             Committed Prisma migrations
  seed.ts                 Idempotent seed script

scripts/
  db-setup.ts             One-command local database setup

.github/
  workflows/
    ci.yml                Install, build both apps, lint frontend
```

**Backend request flow:**

```
Route → Auth/Role middleware (where required) → Controller → Service → Repository → Prisma
```

**Frontend data flow:**

```
Page/Component → Redux thunk → feature API module (e.g. jobApi, publicJobApi, applicationApi) → apiClient → REST API → Redux state → selectors → UI
```

No page or component calls `fetch`/`axios` directly — all HTTP calls go through `apps/web/src/lib/api-client.ts`.

## Requirements

- **Node.js** — a current LTS release (this project was built and verified with Node v22.15.0; anything Node 20+ should work given the dependencies in use).
- **npm** (workspaces are used — this is an npm-workspaces monorepo, not a standalone package).
- **PostgreSQL** — a locally running PostgreSQL server. **Docker is not required.** A `docker-compose.yml` is included at the repo root purely as an *optional* convenience if you'd rather run Postgres in a container; it is not part of the documented setup below and is not necessary to run the project.

## Installation

```bash
git clone <repository-url>
cd job-portal
npm install
```

This installs dependencies for the root workspace and both `apps/web` and `apps/api` in one step.

### 1. Environment setup

Copy the example environment file and fill in real local values:

```bash
cp .env.example .env
```

Edit `.env` with your local PostgreSQL credentials and secrets (see [Environment Variables](#environment-variables) below). The backend loads this single root-level `.env` file — there is no separate `.env` per app.

### 2. Database setup

With PostgreSQL running and `.env` filled in:

```bash
npm run db:setup
```

### 3. Start the app

```bash
npm run dev
```

## Environment Variables

All variables are read from a single `.env` file at the repository root (see `.env.example`). **Never commit `.env`** — it is already listed in `.gitignore`.

### Required

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string Prisma uses for the app (must include the target database name). |
| `JWT_SECRET` | Signing secret for access tokens (must be at least 32 characters). |
| `JWT_REFRESH_SECRET` | Signing secret for refresh tokens (must be at least 32 characters, and different from `JWT_SECRET`). |
| `SEED_ADMIN_EMAIL` | Email for the seeded ADMIN account, used by `npm run db:setup` / the Prisma seed. |
| `SEED_ADMIN_PASSWORD` | Password for the seeded ADMIN account. |

### Optional (documented defaults shown)

| Variable | Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Standard Node environment flag. |
| `PORT` | `5000` | Port the Express API listens on. |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin for the frontend. |
| `JWT_EXPIRES_IN` | `15m` | Access token lifetime. |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime. |
| `REFRESH_COOKIE_NAME` | `jobportal_refresh_token` | Name of the HTTP-only refresh-token cookie. |
| `REFRESH_COOKIE_MAX_AGE_MS` | `604800000` (7 days) | Max age of the refresh-token cookie, in milliseconds. |
| `DATABASE_ADMIN_URL` | derived from `DATABASE_URL` | Connection string used by `db:setup` to check/create the target database (connects to the `postgres` maintenance database). |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | derived from `DATABASE_URL` | Used by `db:setup` to build `DATABASE_ADMIN_URL` if it isn't set explicitly. |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` | *(unset — no user is seeded)* | If **both** are set, the seed script also creates/updates one `USER`-role account, useful for manually testing the job-application flow. |

The frontend also reads one optional Vite env var, `VITE_API_URL` (defaults to `http://localhost:5000/api` if unset) — set it only if the API isn't running on the default local port.

## Database Setup

`npm run db:setup` (root script, see `scripts/db-setup.ts`) requires a running PostgreSQL server and does the following, in order:

1. Connects to the PostgreSQL server and creates the target database (from `DATABASE_URL`) if it doesn't already exist.
2. Runs `prisma migrate deploy` to apply all committed migrations.
3. Runs `prisma generate` to (re)generate the Prisma Client.
4. Runs `prisma db seed`, which executes `prisma/seed.ts`.

This is safe to re-run — it does not drop or reset any existing data. It does **not** run `prisma migrate reset`, and this README does not instruct you to run that command.

### Migrations

- The schema lives in `prisma/schema.prisma`.
- Migrations are committed under `prisma/migrations/` and are applied via `prisma migrate deploy` (through `npm run db:setup`), not via an interactive `migrate dev`.

## Seed Data

`prisma/seed.ts` is idempotent (it uses `upsert` throughout, keyed by unique fields), so running it again is safe and will not create duplicates. It seeds:

- One **ADMIN** account, using `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`.
- One optional **USER** account, only if `SEED_USER_EMAIL` and `SEED_USER_PASSWORD` are both set in `.env` — useful for manually testing the "apply for a job" flow.
- A fixed set of job categories and experience levels.
- A handful of sample jobs across `PUBLISHED`, `DRAFT`, and `CLOSED` statuses (so the public portal, which only shows published jobs, and the admin listing, which shows all statuses, can both be exercised).

No application records are seeded. Credentials are configured entirely through `.env` — none are hardcoded in source, and none are printed here beyond the variable names above.

## Running the Application

Actual scripts, from the root `package.json`:

| Command | Description |
|---|---|
| `npm run dev` | Runs the API and web dev servers together (`concurrently`). |
| `npm run dev:web` | Frontend only (Vite dev server). |
| `npm run dev:api` | Backend only (`tsx watch`). |
| `npm run db:setup` | See [Database Setup](#database-setup). |
| `npm run build:web` | Production build of the frontend. |
| `npm run build:api` | Compiles the backend with `tsc`. |
| `npm run lint` | Runs each workspace's `lint` script. |

Confirmed local ports/paths:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000 (base path `/api`)
- **Health check:** `GET http://localhost:5000/api/health`

## Admin Manual Test Flow

This is a suggested manual verification checklist, not a record of a test run performed as part of this documentation change:

1. Open the frontend and go to `/login`.
2. Sign in with the seeded admin credentials (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).
3. Confirm you land on `/admin/dashboard` and stats load.
4. Open `/admin/jobs` and confirm the listing loads.
5. Create a job (`/admin/jobs/create`) and confirm it appears in the listing.
6. Edit the job (`/admin/jobs/:id/edit`) and confirm changes are saved.
7. Open its details page (`/admin/jobs/:id`).
8. Change its status (e.g. Draft → Published) from the listing.
9. Try search, category/experience/employment-type/status filters, sorting, and pagination on the listing.
10. Delete the job and confirm it's removed and the listing/pagination adjusts correctly.

## User Manual Test Flow

Also a suggested checklist, not a claim that it was executed here:

1. Open `/` (landing page) and confirm featured jobs and categories load from real data.
2. Go to `/jobs` and try search, category, experience, employment type, and location filters, plus sorting and pagination.
3. Open a published job's details page (`/jobs/:id`).
4. Click **Apply Now** while logged out — you should be sent to `/login`.
5. Log in with a `USER` account (seed one via `SEED_USER_EMAIL`/`SEED_USER_PASSWORD` if needed).
6. Confirm you're returned to the same job details page.
7. Click **Apply Now** again.
8. Confirm a success message appears and the button changes to an "Applied" state.
9. Try applying again (e.g. after a refresh) and confirm the duplicate is rejected with a friendly message, not a raw error.

## API Documentation

| Method & Path | Access |
|---|---|
| `GET /api/health` | Public |
| `POST /api/auth/login` | Public |
| `POST /api/auth/refresh` | Public (uses the HTTP-only refresh cookie) |
| `POST /api/auth/logout` | Public (clears the refresh cookie / revokes the token) |
| `GET /api/auth/me` | Authenticated (any role) |
| `GET /api/jobs` | Public — published jobs only |
| `GET /api/jobs/:id` | Public — published jobs only (404 for draft/closed/unknown) |
| `POST /api/jobs/:id/apply` | Authenticated, **USER** role only |
| `GET /api/admin/dashboard/stats` | Authenticated, **ADMIN** role only |
| `GET /api/admin/jobs` | Authenticated, **ADMIN** role only |
| `GET /api/admin/jobs/:id` | Authenticated, **ADMIN** role only |
| `POST /api/admin/jobs` | Authenticated, **ADMIN** role only |
| `PUT /api/admin/jobs/:id` | Authenticated, **ADMIN** role only |
| `DELETE /api/admin/jobs/:id` | Authenticated, **ADMIN** role only |
| `PATCH /api/admin/jobs/:id/status` | Authenticated, **ADMIN** role only |

> Note: the backend also exposes `POST /api/auth/register`. It is not used by any current frontend flow (there is no signup UI) and is not part of the documented user journeys above.

## Authentication

- Login issues a short-lived **JWT access token** (returned in the response body, kept in memory/Redux on the client — never in `localStorage`) and a **refresh token** delivered only as an **HTTP-only cookie**.
- Refresh tokens are stored server-side as a **hash**, not the raw value, and are **rotated** on every use (`POST /api/auth/refresh` issues a new refresh token and revokes the old one).
- Logout revokes the current refresh token and clears the cookie.
- Role-based authorization (`ADMIN` vs `USER`) is enforced with Express middleware (`requireAuth`, `requireRole`) on every protected route — the frontend's own route guards (e.g. `ProtectedRoute`) are a UX convenience, not the security boundary.

## Architecture / Design Decisions

- **Redux Toolkit** is the single source of truth for all server-derived state on the frontend (auth, dashboard, admin jobs, public jobs, applications) — no component keeps its own duplicate copy of server data.
- **Separate `jobs` (admin) and `publicJobs` slices**: admin job state carries CRUD/status/delete async state that has no meaning for public browsing, so the two were kept independent rather than overloading one slice.
- **Backend layering** is consistently Route → (auth/role middleware) → Controller → Service → Repository → Prisma; controllers never touch Prisma directly.
- **Zod** validates all external input on the backend (query, params, and body) and drives the frontend's React Hook Form validation for the job and login forms.
- **Published-only public access** is enforced in the service/repository layer (`listPublic`/`findPublishedById` hard-code `status: PUBLISHED`), not just hidden in the UI.
- **Application authorization** (`USER` role, published-job check, duplicate check) is enforced entirely server-side; the frontend UI only reflects it.
- **Unique `(userId, jobId)` constraint** on `Application` (in `prisma/schema.prisma`) is the ultimate backstop against duplicate applications, in addition to an application-layer pre-check.

## Error / Security Notes

- Password hashes are never included in any API response (Prisma queries use an explicit `select`/`include` that omits `passwordHash`).
- Refresh tokens are HTTP-only cookies, never exposed to JavaScript or stored in `localStorage`.
- Public job endpoints select an explicit whitelist of fields — no author identity (name/email/role) or internal admin data is returned.
- `POST /api/jobs/:id/apply` requires the `USER` role; an authenticated `ADMIN` gets a `403`, not a broken form.
- Draft/closed jobs return `400` from the apply endpoint even if requested directly, regardless of what the UI shows.
- Duplicate applications return a friendly `409` message, not a raw database/unique-constraint error.
- All admin routes require both authentication and the `ADMIN` role at the middleware level.
- All list/detail/create/update input is validated server-side with Zod, independent of any frontend validation.

## Build / Validation Commands

Actual commands, verified against this repository's `package.json` files:

```bash
npm run build --workspace=apps/web   # frontend production build (tsc -b && vite build)
npm run build --workspace=apps/api   # backend build (tsc)
npm run lint --workspace=apps/web    # frontend lint (eslint .)
npm run db:setup                     # database setup (see above)
```

## Known Issues

- `apps/web` has one pre-existing lint finding: `react-refresh/only-export-components` in `src/components/admin/JobForm.tsx`, caused by that file exporting both the `JobForm` component and its Zod schema (`jobFormSchema`). This does **not** affect the production build, which passes cleanly — it has been left as-is rather than restructuring a working, tested form component solely to silence a lint rule.
- `apps/api`'s `lint` script (`eslint .`) currently has no ESLint config file in that workspace, so it exits with a configuration error rather than a normal lint result. This existed prior to this documentation pass and has not been changed here; the CI workflow and this README therefore only run/document frontend linting.

## Deployment Notes

Nothing in this repository has been deployed as part of this submission — the notes below describe an intended target architecture only, not a configured or verified deployment:

- **Frontend:** a static host such as Vercel (Vite's production build output is a static `dist/` bundle).
- **Backend:** a Node host such as Render or Railway (the `build`/`start` scripts in `apps/api/package.json` — `tsc` then `node dist/server.js` — are already deploy-shaped).
- **Database:** a managed PostgreSQL provider such as Neon.

Any real deployment would need its own environment variables configured on the hosting provider (see [Environment Variables](#environment-variables)) — none of the values in `.env.example` are suitable for production use.
