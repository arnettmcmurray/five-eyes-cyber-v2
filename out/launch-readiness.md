# Launch Readiness (2026-03-16)

## Ready in App

### Auth / Access
- OTP-based learner auth: 6-digit codes, 10-min expiry, marked used after verify ✓
- Learner sessions: Bearer tokens, 30-day expiry, invalidated on logout ✓
- Admin auth: scrypt password hashing with `timingSafeEqual`; timing oracle on nonexistent username closed (dummy scrypt run) ✓
- Admin sessions: 8-hour expiry, invalidated on logout and password change ✓
- Role separation: learner Bearer vs admin Bearer — all routes tested ✓
- Paid/free access gating enforced on all `/learn/*` routes ✓
- Rate limiting: auth 10/15min, OTP 10/15min, assessment start 5/15min, ingest 20/15min, TTX participate 60/1min, AI assist 10/15min ✓

### Security Headers (Helmet)
- `Content-Security-Policy: default-src 'none'` + frame/form/object protections ✓
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` ✓
- `X-Content-Type-Options: nosniff` ✓
- `X-Frame-Options: SAMEORIGIN` ✓
- `Referrer-Policy: no-referrer` ✓
- `X-Powered-By` suppressed ✓

### Input / Body Hardening
- Global body limit 100kb; `/kb/ingest` raised to 2mb ✓
- Oversized body → 413 (not 500) ✓
- Auth input length caps: handle 200, code 10, username 100, password 200 ✓
- Assessment email ≤ 320 chars; answers plain object, max 20 keys ✓
- Practice answers array capped at 100 items ✓
- KB ingest content caps: manual 500K chars, file 1M chars ✓

### Audit Trails
- All admin-action audit fields (`grantedBy`, `createdBy`, `uploadedBy`, `performedBy`, `assignedBy`) injected from `req.adminUsername` — not client-supplied ✓
- Zod `validateBody` strips unknown fields server-side ✓

### Data Integrity
- `expiresAt`, `scheduledAt`, `dueAt` validated before `new Date()` ✓
- `injectType` enum enforced (legal|media|technical|customer|other) ✓
- Action item status enum enforced (open|closed|retesting) ✓
- Parent ownership checks: steps verify section exists; injects verify step exists ✓
- TTX package delete bug fixed (was deleting ALL modules) ✓

### Deployment Readiness
- Fail-fast startup if `API_KEY` missing or no admins + no `ADMIN_PASSWORD` ✓
- `CORS_ORIGIN`, `TRUST_PROXY`, `ANTHROPIC_API_KEY` — startup warnings if unset ✓
- Trust proxy configurable via `TRUST_PROXY` env var ✓
- Health endpoint `GET /health` checks DB (`SELECT 1`) → 200 ok / 503 degraded ✓
- Request logger: method + path (no query params) + status + duration ✓
- Public 500 paths sanitized: assessment funnel returns `'Internal server error'` only ✓
- Assessment token not logged ✓
- Frontend API key/base from Vite env vars ✓
- `.env.example` files complete for both backend and frontend ✓

### TTX
- Full manual loop tested end-to-end: scenario → session → injects → decisions → AAR → action items → export ✓
- AI assist admin-only; fails cleanly if `ANTHROPIC_API_KEY` unset ✓
- SSE token accepted via `?token=` query param (EventSource compat); `req.path` logger does not log query params ✓

---

## External / Infra Blockers

These cannot be closed in application code. Each requires AWS/ops/provider work.

| Item | Priority | Notes |
|------|----------|-------|
| **OTP delivery** | Critical | Set `SES_FROM_ADDRESS` for production SES delivery, or `SMTP_HOST`/`SMTP_PORT` for SMTP relay (e.g. Mailpit in dev). Stdout fallback active when neither is set. |
| **Assessment token delivery** | Critical | Same delivery chain as OTP — `SES_FROM_ADDRESS` or `SMTP_HOST`/`SMTP_PORT`. |
| **HTTPS / TLS** | Critical | App serves plain HTTP. TLS must terminate at ALB or Nginx. `Strict-Transport-Security` header is set but inactive until HTTPS is live. |
| **CORS_ORIGIN** | Critical | Must be set to production frontend URL in deployment env. Defaults to `localhost:5173`. |
| **API_KEY rotation** | High | No hot-reload; requires server restart. Acceptable at current scale. |
| **Redis-backed rate limiters** | High | In-memory limiters reset on restart and don't work across multiple instances. Swap to `rate-limit-redis` before horizontal scaling. |
| **Log shipping** | Medium | `console.log`/`console.error` → stdout/stderr only. Wire to CloudWatch Logs or Datadog. Consider structured JSON (pino) for log parsing. |
| **DB connection pool** | Medium | `pg.Pool` default max 10. Add `DATABASE_POOL_MAX` env var before load testing. |
| **HSTS preload** | Low | HSTS header present but not submitted to browser preload lists. Submit after HTTPS confirmed stable. |
| **Admin individual passwords** | Done | Set via `change-password` after first deploy; see `out/admin-credentials.md`. |

---

## Launch Sequence

### Pre-launch (infra/ops — do first)
1. **Set all REQUIRED env vars** on the target server:
   - `DATABASE_URL` — production PostgreSQL connection string
   - `API_KEY` — strong random secret (e.g. `openssl rand -hex 32`)
   - `ADMIN_PASSWORD` — initial seed password (change immediately after first login)
   - `CORS_ORIGIN` — production frontend URL (e.g. `https://app.fiveeyesltd.com`)
   - `TRUST_PROXY=1` — if behind ALB or Nginx
2. **TLS**: configure ALB HTTPS listener or Nginx TLS termination pointing to `:3001`
3. **OTP/email**: wire SES (or provider) to `routes/auth/auth.ts` → `authSvc.requestOtp` — replace `console.log` in `learner-auth.service.ts:39`
4. **Assessment email**: same provider, wire `POST /access/assessment/start` token delivery
5. **Run DB push**: `bash scripts/db-push.sh` on production DB (all schema applied)
6. **Verify health**: `curl https://api.fiveeyesltd.com/health` → `{ status: 'ok', db: 'ok' }`

### Post-launch (first 24h)
7. **Change admin passwords**: each admin logs in with seed password, calls `POST /admin/profile/change-password`
8. **Set ANTHROPIC_API_KEY** if TTX AI assist is needed (optional feature)
9. **Monitor logs** for `[FATAL]`, `[WARN]`, rate-limit 429s, and 5xx errors

### Scale-up (before horizontal scaling)
10. Switch rate limiters to Redis backend (`rate-limit-redis`)
11. Set `DATABASE_POOL_MAX` env var based on DB tier limits
12. Add CloudWatch/Datadog log shipper

---

*Last updated: 2026-03-16*
