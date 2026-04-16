# Five Eyes Staging Handoff

## What this app is

This is the Five Eyes staging app for learner training, KB-backed search/help, governance review, and admin control. It is a staging handoff, not a full production launch.

## Stack

- Frontend: Vite + React in `src/`
- Backend: Express + TypeScript in `backend/src/`
- Database: PostgreSQL 16 with Drizzle SQL migrations in `backend/drizzle/`
- Email:
  - local: Mailpit over SMTP
  - AWS staging: SES
- AI provider: OpenAI only

## Auth

- Admin auth is password-only
- Learner auth is OTP-only
- Admin and learner sessions are separate
- Admin accounts are blocked from learner OTP flow

## Canonical admin accounts

- Top admin: `darren`
- Emergency admin account: `platform-recovery`

Both are seeded as normal admin accounts. `platform-recovery` is the break-glass account and should have its password changed immediately after handoff.

## Local setup

1. Copy env files:
```bash
cp backend/.env.example backend/.env
cp .env.example .env
```
2. Start local services:
```bash
docker compose up -d db mailpit
```
3. Build backend once:
```bash
cd backend && npm run build
```
4. Run migrations:
```bash
cd backend && npm run db:migrate
```
5. Run bootstrap:
```bash
cd backend && npm run bootstrap
```
6. Start backend:
```bash
cd backend && npm run dev
```
7. Start frontend:
```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Local URLs:

- frontend: `http://127.0.0.1:5173`
- backend: `http://127.0.0.1:3001`
- Mailpit: `http://127.0.0.1:8025`

## Local environment variables

### Frontend `.env`

```env
VITE_API_BASE=http://localhost:3001
VITE_API_KEY=dev-local-key
```

### Backend `backend/.env`

```env
DATABASE_URL=postgresql://five_eyes_user:five_eyes_dev@localhost:5433/five_eyes_v2
API_KEY=dev-local-key
ADMIN_PASSWORD=changeme
OPENAI_API_KEY=
PORT=3001
CORS_ORIGIN=http://localhost:5173
APP_BASE_URL=http://localhost:5173
TRUST_PROXY=1
SMTP_HOST=localhost
SMTP_PORT=1025
SES_FROM_ADDRESS=
AWS_REGION=us-east-1
DB_SSL=false
```

## AWS staging setup

### Required AWS pieces

- ECR repository for the backend image
- ECS Fargate service for the backend
- RDS PostgreSQL 16
- ALB in front of ECS
- S3 + CloudFront for the frontend
- Secrets Manager for runtime secrets
- SES for OTP and outbound app email

### Required backend secrets in AWS Secrets Manager

- `DATABASE_URL`
- `API_KEY`
- `ADMIN_PASSWORD`
- `OPENAI_API_KEY`
- `SES_FROM_ADDRESS`

### Required backend non-secret env vars in ECS

- `PORT=3001`
- `AWS_REGION=us-east-1`
- `TRUST_PROXY=1`
- `DB_SSL=true`
- `CORS_ORIGIN=<frontend staging url>`
- `APP_BASE_URL=<frontend staging url>`

### Required frontend build vars for staging

```env
VITE_API_BASE=https://<backend-domain>
VITE_API_KEY=<same value as backend API_KEY>
```

### AWS deploy order

1. Build backend image:
```bash
docker build -t five-eyes-backend ./backend
```
2. Push image to ECR
3. Register ECS task definition using:
   - `deploy-ecs.sh`
   - `task-def.json`
4. Run backend migrations against the staging database:
```bash
cd backend
npm run build
DB_SSL=true DATABASE_URL=<rds-url> npm run db:migrate
```
5. Start or update the ECS service
6. Build the frontend with staging `VITE_API_BASE` and `VITE_API_KEY`
7. Upload frontend build output to S3 / refresh CloudFront
8. Test health and auth before handoff

## Migrations

Run locally:
```bash
cd backend
npm run build
npm run db:migrate
```

Run for AWS staging:
```bash
cd backend
npm run build
DB_SSL=true DATABASE_URL=<rds-url> npm run db:migrate
```

The migration command now restores the old Drizzle baseline automatically if the schema already exists but the migration journal is empty.

## Seeding and bootstrap

- Startup seeding:
  - if `ADMIN_PASSWORD` is set, backend startup reconciles the seeded admin accounts
- Bootstrap:
```bash
cd backend && npm run bootstrap
```

Bootstrap is idempotent. It seeds:

- Darren as canonical top admin
- `platform-recovery` as emergency admin
- local learner accounts
- published modules
- KB content and links
- learner progress
- TTX scenarios

## OpenAI setup

- Local:
  - set `OPENAI_API_KEY` in `backend/.env`
- AWS:
  - store `OPENAI_API_KEY` in Secrets Manager
  - inject it into the ECS task

If `OPENAI_API_KEY` is empty, the app still runs. Learner KB chat and TTX AI assist will be unavailable.

## What not to break

- Do not change admin auth to OTP
- Do not change learner auth to password
- Do not merge admin and learner routes
- Do not expose non-learner-visible KB content to learners
- Do not add hidden login bypasses
- Do not add a second AI provider without changing the code intentionally

## Common issues

- `db:migrate` fails:
  - run `cd backend && npm run build && npm run db:migrate`
- OTP email does not show locally:
  - confirm Mailpit is running on `http://localhost:8025`
- Backend starts but frontend cannot connect:
  - check `VITE_API_BASE`
  - check `CORS_ORIGIN`
- AWS backend cannot reach the DB:
  - check `DATABASE_URL`
  - check `DB_SSL=true`
  - check ECS to RDS network rules
- OTP email fails in AWS:
  - check `SES_FROM_ADDRESS`
  - check SES identity verification
  - check ECS task role permissions

## Smoke test checklist

- `GET /health` returns `status=ok`
- admin login works for `darren`
- admin login works for `platform-recovery`
- admin OTP request is blocked
- learner OTP request and verify work
- learner modules load
- a learner module opens
- learner KB search works
- governance summary loads for admin
- learner token cannot access admin routes
- admin token cannot access learner routes

## Verified local truth

This repo was smoke-tested locally on the dev stack with:

- Docker Postgres
- Mailpit
- backend running on `127.0.0.1:3001`
- frontend running on `127.0.0.1:5173`

Verified:

- backend health
- Darren admin login
- break-glass login
- learner OTP request/verify
- learner modules
- learner KB search
- governance summary
- route separation

## Warning

Never commit real API keys, real database passwords, or real AWS secret values.
