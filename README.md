# Five Eyes Staging Operator README

## What this app is

This is the staging build of the Five Eyes training platform. It provides learner training modules, KB-backed help and search, governance-controlled knowledge management, and an admin control center. This is not a full production launch.

## System breakdown

- Frontend: Vite + React single-page app in `src/`
- Backend: Express + TypeScript API in `backend/src/`
- Database: PostgreSQL 16 with Drizzle migrations in `backend/drizzle/`
- Auth:
  - Admin: password-only, backed by `admin_users`
  - Learner: OTP-only, backed by `auth_users`, `otp_requests`, and `learner_sessions`
- KB / governance:
  - Learner help/search only returns published, learner-visible KB content
  - Admin KB/governance routes are protected by admin auth
- AWS staging pieces:
  - Frontend build served separately from backend
  - Backend container runs on ECS/Fargate
  - PostgreSQL runs on RDS
  - OTP and assessment email use SES in staging, SMTP/Mailpit locally
  - Runtime secrets come from AWS Secrets Manager

## How to run locally

1. Start local services:
```bash
docker compose up -d db mailpit
```
2. Backend env:
```bash
cp backend/.env.example backend/.env
```
3. Frontend env:
```bash
cp .env.example .env
```
4. Run backend migrations:
```bash
cd backend && npm run db:migrate
```
5. Seed/bootstrap:
```bash
cd backend && npm run bootstrap
```
6. Start the backend:
```bash
cd backend && npm run dev
```
7. Start the frontend:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`. Backend runs on `http://localhost:3001`. Mailpit runs on `http://localhost:8025`.

## Required environment variables

### Backend required

- `DATABASE_URL`
- `API_KEY`
- `ADMIN_PASSWORD` for first run or whenever seeded admin accounts need to be created

### Backend optional but important

- `OPENAI_API_KEY` for learner chat and TTX AI assist
- `SES_FROM_ADDRESS` for AWS SES
- `AWS_REGION` for SES
- `SMTP_HOST` and `SMTP_PORT` for local Mailpit
- `CORS_ORIGIN`
- `APP_BASE_URL`
- `TRUST_PROXY`
- `DB_SSL=true` for RDS / AWS staging

### Frontend required

- `VITE_API_BASE`
- `VITE_API_KEY`

## How auth works

### Admin

- Admins use `/admin/login`
- Admin auth is password-only
- Admin sessions are stored in `admin_sessions`
- Admin routes require a valid admin bearer token
- Admin accounts are blocked from learner OTP flow by database lookup, not by a hard-coded personal email list

### Learner

- Learners use `/login`
- Learners register or request OTP by email
- Learners verify the OTP to get a learner session
- Learner routes require a valid learner bearer token
- Learners never use password auth

## How to run migrations

```bash
cd backend
npm run build
npm run db:migrate
```

For AWS staging, run migrations before or during deployment as a controlled release step. Do not assume container startup applies schema automatically.

## How seeding / bootstrap works

- Startup seeding:
  - When `ADMIN_PASSWORD` is set, backend startup reconciles seeded admin accounts in `admin_users`
  - This enforces one canonical top admin and one neutral break-glass admin
- Bootstrap script:
  - `cd backend && npm run bootstrap`
  - Seeds local-proof learner data, modules, KB content links, progress data, TTX demo data, and reconciles seeded admin accounts when `ADMIN_PASSWORD` is present
- Bootstrap is idempotent and does not wipe the database

## How AWS staging works

- Build backend image from `backend/Dockerfile`
- Push image to ECR
- Register ECS task definition using secret ARNs for:
  - `DATABASE_URL`
  - `API_KEY`
  - `ADMIN_PASSWORD`
  - `OPENAI_API_KEY`
  - `SES_FROM_ADDRESS`
- Set non-secret task env vars:
  - `PORT=3001`
  - `AWS_REGION`
  - `TRUST_PROXY=1`
  - `DB_SSL=true`
  - `CORS_ORIGIN`
  - `APP_BASE_URL`
- Run migrations against the staging database
- Start ECS service behind ALB
- Build frontend with staging `VITE_API_BASE` and `VITE_API_KEY`

## What not to break

- Admin auth must stay password-only
- Learner auth must stay OTP-only
- Admin and learner routes must stay separate
- Learner KB access must stay limited to published, learner-visible content
- Governance routes must remain admin-only
- KB-first remains the primary behavior; AI is support only
- Do not add bypass logins or hidden recovery logic

## Common mistakes

- Forgetting `DB_SSL=true` in AWS staging
- Starting the backend against a fresh database before running migrations
- Forgetting to set `CORS_ORIGIN` to the frontend domain in staging
- Forgetting that `VITE_API_KEY` is public browser config, not a secret
- Trying to use an admin username in the learner OTP flow
- Committing real API keys or real database credentials

## Smoke test checklist

- `GET /health` returns `status=ok` and `db=ok`
- Admin login works at `/admin/login`
- Learner OTP request and verify work at `/login`
- Admin routes reject unauthenticated learner access
- Learner routes reject missing or invalid learner sessions
- `/admin`, `/kb`, and `/ttx` do not redirect-loop
- Learner dashboard loads modules
- Learner KB search/help returns published learner-visible content only
- Governance admin routes load under admin auth
- Darren exists in `admin_users` with `is_top_admin=true`
- `platform-recovery` exists in `admin_users` with `is_break_glass=true`
- No `arnettmcmurray` dependency remains in runtime auth or startup logic
- No stale second-provider env or secret dependency remains

## Where admin truth is defined

- Schema: `backend/src/db/schema/admin-auth.ts`
- Migration: `backend/drizzle/0002_admin_truth_flags.sql`
- Seeded account list: `backend/src/config/admin-accounts.ts`
- Startup reconciliation: `backend/src/server.ts`
- Bootstrap reconciliation: `backend/scripts/bootstrap-local-proof.ts`

## How to add your own OpenAI API key

- Local:
  - Set `OPENAI_API_KEY` in `backend/.env`
- AWS staging:
  - Store the key in AWS Secrets Manager
  - Inject it into the ECS task as `OPENAI_API_KEY`

The app only uses OpenAI. Do not add a second AI provider unless the code is deliberately changed to support it.

## Warning

Never commit real API keys, database passwords, or AWS secret values into code, env examples, docs, or task definitions.
