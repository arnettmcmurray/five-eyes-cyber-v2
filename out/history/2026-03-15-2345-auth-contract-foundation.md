# Task 15: OTP/Password Auth Contract Foundation (2026-03-15)

## What was done
- **Schema** (`backend/src/db/schema/auth.ts`):
  - `auth_users`: id, learnerId (FK → learners, unique), handle (unique), passwordHash (nullable), otpEnabled, timestamps
  - `otp_requests`: id, handle, code (6-digit string), purpose ('login'|'reset'), used (bool), expiresAt, createdAt
- **Routes** (`backend/src/routes/auth/auth.ts`) — all return 501 Not Implemented:
  - `POST /auth/register` — create auth_users row for existing learner handle
  - `POST /auth/login/password` — validate password hash
  - `POST /auth/otp/request` — generate+store OTP, out-of-band delivery deferred
  - `POST /auth/otp/verify` — validate OTP, mark used
  - `POST /auth/password/reset` — set new password hash
- Mounted `/auth` in `app.ts`
- Added `auth.ts` to `db-push.sh` FILES list
- Exported from `schema/index.ts`

## What is NOT done (by design)
- No session tokens / JWT / cookie design
- No bcrypt dependency
- No OTP delivery channel (email/SMS)
- No frontend auth UI
- DB tables not pushed yet (run `db-push.sh` when ready)

## Typechecks
- Frontend: clean
- Backend: clean
