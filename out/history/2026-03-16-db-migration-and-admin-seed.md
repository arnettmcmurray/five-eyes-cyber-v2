# DB Migration + Admin Seed (2026-03-16)

## DB Push
- Ran `backend/scripts/db-push.sh`
- All new tables applied cleanly: learner_sessions, otp_requests, auth_users, admin_users, admin_sessions, content_blocks, access_overrides, assessment_leads
- packages table updated: price_cents, tier, public columns live

## Admin Accounts Seeded
Four real admin accounts seeded (email as username):
- arnettmcmurray@gmail.com
- michaelm@fiveyesltd.com
- dmott@fiveyesltd.com
- support@fiveyesltd.com

All use ADMIN_PASSWORD from .env. No generic 'admin' user — stale one deleted on startup.
server.ts seeds on startup (idempotent — skips if username already exists).

## Confirmed Working
- All 4 admin logins return token ✓
- GET /admin/profile with token returns { username } ✓
- POST /auth/otp/request returns 204 ✓
- POST /access/assessment/start returns 204, creates assessment_leads row ✓
- admin_sessions table recording sessions (5 after smoke test) ✓
- assessment_leads row visible in DB ✓
