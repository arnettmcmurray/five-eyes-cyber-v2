# Gate 3 — Abuse Protection and Request Hardening (2026-03-16)

## Gate 2 Final Fixes (completed in this pass)

### KB audit fields — all shifted from client body to `req.adminUsername`
- `kb/items.ts` (POST /kb/items): `createdBy` now from `req.adminUsername`
- `kb/ingestion.ts` (POST /kb/ingest/manual, /file, /url): `createdBy`, `uploadedBy`, `fetchedBy` from `req.adminUsername`; GET /jobs scoped to `req.adminUsername`
- `kb/workflow.ts` (POST workflow actions): `performedBy` from `req.adminUsername`
- `kb/revisions.ts` (POST revision, rollback): `createdBy`, `performedBy` from `req.adminUsername`
- `kb.schemas.ts`: removed `createdBy`, `performedBy`, `uploadedBy`, `fetchedBy` from all schemas (Zod strips them if sent)

### Practice answers size cap
- `learn/modules.ts` POST /practice: answers array capped at 100 items (400 on exceed)
- Note: score is always computed server-side (correct count / total); it's inherently 0–100; no additional clamping needed.

---

## Gate 3 Fixes Applied

### 1. Rate limiting — `express-rate-limit@8.1.3` installed

New file: `src/middleware/ratelimit.ts`

| Limiter | Window | Limit | Applied to |
|---------|--------|-------|------------|
| `authRateLimit` | 15 min | 10 req/IP | ALL `/auth/*` (OTP request, verify, admin login) |
| `assessmentRateLimit` | 15 min | 5 req/IP | POST `/access/assessment/start` only |
| `ingestRateLimit` | 15 min | 20 req/IP | ALL `/kb/ingest/*` |
| `participateRateLimit` | 1 min | 60 req/IP | ALL `/ttx/participate/*` |
| `assistRateLimit` | 15 min | 10 req/IP | ALL `/ttx/assist/*` |

All limiters return `429 { error: 'Too many requests. Please try again later.' }` — no internal counters or retry-after headers exposed beyond the standard `RateLimit-*` headers (draft-8).

### 2. Body size limits tightened

- **Global**: reduced from `10mb` → `100kb` (covers all routes except ingest)
- **`/kb/ingest`**: gets its own `express.json({ limit: '2mb' })` before the router (allows raw content up to 1M chars ≈ ~1.5MB with JSON encoding overhead)
- Oversized bodies now return Express's built-in `413 Payload Too Large` before the route handler runs

### 3. Auth input length caps

- `POST /auth/otp/request`: handle capped at 200 chars
- `POST /auth/otp/verify`: handle ≤ 200 chars, code ≤ 10 chars (6-digit OTP)
- `POST /auth/admin/login`: username ≤ 100 chars, password ≤ 200 chars
- `POST /access/assessment/start`: email ≤ 320 chars
- `POST /access/assessment/:token`: answers object ≤ 20 keys; must be plain object (array rejected)

### 4. Validation hardening

- Assessment answers: `typeof answers !== 'object' || Array.isArray(answers)` — rejects arrays passed as answers object
- Assessment answers: `Object.keys(answers).length > 20` — rejects oversized answer payloads

---

## Confirmed Working

| Check | Verdict |
|-------|---------|
| Rate limit on OTP request/verify | ✓ authRateLimit (10/15min) |
| Rate limit on admin login | ✓ authRateLimit (10/15min) |
| Rate limit on assessment start | ✓ assessmentRateLimit (5/15min) |
| Rate limit on KB ingest | ✓ ingestRateLimit (20/15min) |
| Rate limit on TTX participate | ✓ participateRateLimit (60/1min) |
| Rate limit on TTX AI assist | ✓ assistRateLimit (10/15min) |
| 413 on oversized body (global routes) | ✓ 100kb limit |
| 413 on oversized body (ingest) | ✓ 2mb limit |
| Global error handler: no stack traces | ✓ returns 'Internal server error' only |
| Auth input lengths bounded | ✓ handle, code, username, password, email |
| Assessment answers type-checked | ✓ plain object, max 20 keys |
| `npx tsc --noEmit` clean | ✓ |

---

## Remaining Gate 3 Gaps (require infra/WAF/reverse-proxy)

1. **IP-based rate limiting is bypassable behind a proxy** — `express-rate-limit` uses `req.ip` which may be the proxy IP if `trust proxy` is not configured. In production behind a load balancer/Cloudflare, set `app.set('trust proxy', 1)` (or appropriate count) so the real client IP is used. Not set yet.

2. **Rate limiters are in-memory** — state is per-process and resets on restart. In production with multiple Node processes or horizontal scaling, a Redis store is required for shared state. `ioredis` + `rate-limit-redis` would be the standard fix.

3. **No global rate limit** — only targeted routes are limited. A sufficiently distributed attacker can flood non-rate-limited admin routes (e.g., `/kb/items`, `/ttx/scenarios`). A WAF or reverse-proxy-level global rate limit is the right layer for this.

4. **Auth/access routes leak service error messages on DB failure** — `err.message` is returned on catch blocks. If the DB is down, a caller at `/auth/otp/request` would receive the DB connection error string. Proper fix: catch and reclassify errors in service layer or wrap in a sanitizer before returning to unauthenticated callers.

5. **No HTTPS enforcement** — TLS termination and HSTS headers are reverse-proxy concerns. The app itself has no redirect or enforcement.

6. **`/health` endpoint is unauthenticated and unthrottled** — currently returns `{ status: 'ok', ts: ... }`. Low severity, but could be scraped for uptime profiling.
