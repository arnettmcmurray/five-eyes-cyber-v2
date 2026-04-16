# Operator Packet

## Files to copy for local setup

- `backend/.env.example` -> `backend/.env`
- `.env.example` -> `.env`

## Backend env

Set these in `backend/.env`:

```env
DATABASE_URL=postgresql://five_eyes_user:five_eyes_dev@localhost:5433/five_eyes_v2
API_KEY=dev-local-key
ADMIN_PASSWORD=changeme
OPENAI_API_KEY=
CORS_ORIGIN=http://localhost:5173
APP_BASE_URL=http://localhost:5173
TRUST_PROXY=1
SMTP_HOST=localhost
SMTP_PORT=1025
AWS_REGION=us-east-1
SES_FROM_ADDRESS=
PORT=3001
```

## Frontend env

Set these in `.env`:

```env
VITE_API_BASE=http://localhost:3001
VITE_API_KEY=dev-local-key
```

## Local run steps

1. Start local services:
```bash
docker compose up -d db mailpit
```
2. Run backend build:
```bash
cd backend && npm run build
```
3. Run migrations:
```bash
cd backend && npm run db:migrate
```
4. Run bootstrap:
```bash
cd backend && npm run bootstrap
```
5. Start backend:
```bash
cd backend && npm run dev
```
6. Start frontend:
```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

## Login accounts

- Canonical top admin:
  - Username: `darren`
  - Password: value of `ADMIN_PASSWORD`
- Emergency admin account:
  - Username: `platform-recovery`
  - Password: value of `ADMIN_PASSWORD`
  - Change immediately after handoff

Learner OTP test account:
- `sam.professional@fiveeyes.dev`

## Minimal smoke sequence

1. `GET /health` returns `status=ok`
2. Login as `darren`
3. Load governance/admin pages
4. Request OTP for `sam.professional@fiveeyes.dev`
5. Verify OTP and load learner modules
6. Open a module
7. Run learner KB search

## Common problems

- `db:migrate` fails on an older local DB:
  - rerun `cd backend && npm run build && npm run db:migrate`
  - the migration command now backfills the old Drizzle baseline automatically
- OTP email not visible:
  - confirm Mailpit is running at `http://localhost:8025`
- Admin login fails:
  - confirm `ADMIN_PASSWORD` matches the current seeded value
- Learner KB search fails:
  - confirm backend is running the latest code and restart `npm run dev`
