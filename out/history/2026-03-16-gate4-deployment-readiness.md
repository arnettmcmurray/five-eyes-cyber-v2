# Gate 4 — Deployment Readiness and Operational Safety (2026-03-16)

## Changes Applied

### 1. Env var audit — `server.ts` consolidated and hardened

**Required (fail-fast on startup):**
- `API_KEY` — existing check preserved; moved to top of module with clear label
- `DATABASE_URL` — validated at module load in `db/client.ts`; if we reach server.ts it was present
- `ADMIN_PASSWORD` (conditional) — if unset AND no admin accounts exist in DB → `process.exit(1)` with [FATAL] message. If unset but admins already exist → continues with `[WARN]`.

**Optional with startup warnings:**
- `CORS_ORIGIN` — warns if not set (defaults to localhost, wrong for production)
- `ANTHROPIC_API_KEY` — warns if not set (TTX AI assist will 500; all other features unaffected)
- `TRUST_PROXY` — warns if not set; configures `app.set('trust proxy', ...)` from env if present

**Other improvements:**
- Startup error messages now have `[FATAL]`/`[WARN]`/`[CONFIG]` prefixes for log filtering
- Admin seed errors log `err.message` not the full error object
- `start()` rejection caught → `process.exit(1)` with message

### 2. Trust proxy — configurable from `TRUST_PROXY` env

`app.set('trust proxy', N)` applied in `server.ts` when `TRUST_PROXY` is set. Required for rate limiter IP detection to use real client IP behind Nginx/ALB/Cloudflare. Without it, all requests appear to come from the proxy IP.

### 3. Health endpoint — DB check added

`GET /health` now executes `SELECT 1` against the DB:
- DB up → `200 { status: 'ok', db: 'ok', ts: ... }`
- DB down → `503 { status: 'degraded', db: 'unreachable', ts: ... }`

Load balancers and orchestrators (ECS health checks, ALB target groups, k8s readiness probes) should target `/health` and route away from a 503 instance.

### 4. Request logger — now includes status code and duration

Before: `timestamp METHOD /path`
After: `timestamp METHOD /path STATUS_CODE Nms`

Uses `res.on('finish', ...)` so status is captured after the handler runs. No body, headers, or query params logged (no secret leakage risk).

### 5. Error detail — public/unauthenticated paths sanitized

All `catch` blocks in `routes/access/access.ts` now return `{ error: 'Internal server error' }` with the real error logged server-side via `console.error`. This prevents DB connection errors or internal stack details from reaching the assessment funnel (unauthenticated, public-facing):
- `GET /access/tier` — sanitized
- `POST /access/assessment/start` — sanitized
- `GET /access/assessment/:token` — sanitized
- `POST /access/assessment/:token` — sanitized

Assessment token no longer included in the stdout log (was `token=${existing.accessToken}`, now removed).

### 6. Frontend API key — configurable via Vite env

`src/api/client.ts`:
- `BASE` now reads `import.meta.env['VITE_API_BASE']` (falls back to `localhost:3001`)
- `API_KEY` now reads `import.meta.env['VITE_API_KEY']` (falls back to `dev-local-key`)
- Comment clarifies this is a weak gate visible to browser users — not a secret

### 7. `.env.example` files — updated for both backend and frontend

**backend/.env.example** — reorganized with REQUIRED / REQUIRED-FOR-FIRST-RUN / OPTIONAL / FEATURE-SPECIFIC sections. Added `TRUST_PROXY` and `ANTHROPIC_API_KEY` entries with explanatory comments.

**`.env.example`** (frontend root) — new file; documents `VITE_API_BASE` and `VITE_API_KEY`. Includes comment that these are client-visible at build time.

---

## Confirmed Working

| Check | Verdict |
|-------|---------|
| API_KEY missing → fail-fast | ✓ `process.exit(1)` |
| DATABASE_URL missing → fail-fast at module load | ✓ `throw new Error()` |
| ADMIN_PASSWORD missing + no admins → fail-fast | ✓ `process.exit(1)` |
| ADMIN_PASSWORD missing + admins exist → warn + continue | ✓ |
| CORS_ORIGIN unset → startup warning | ✓ |
| TRUST_PROXY set → `app.set('trust proxy', N)` applied | ✓ |
| TRUST_PROXY unset → startup warning | ✓ |
| Health 200 when DB up | ✓ |
| Health 503 when DB unreachable | ✓ |
| Request logger: no secrets in output | ✓ |
| Public 500 paths: sanitized error messages | ✓ |
| Assessment token not logged | ✓ |
| Frontend API key from env var | ✓ |
| `npx tsc --noEmit` clean (backend + frontend) | ✓ |

---

## Remaining Gate 4 Gaps (require infra/AWS/ops setup)

1. **HTTPS / TLS termination** — not in app scope. Must be handled at the reverse proxy or load balancer layer (Nginx TLS, ALB HTTPS listener, Cloudflare). App currently serves plain HTTP.

2. **HSTS / security headers** — no `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, or `Content-Security-Policy` headers. These belong in the reverse proxy or in a Helmet.js middleware layer (not currently installed).

3. **OTP delivery** — still `console.log` only. Production requires an email/SMS provider (SES, Twilio, etc.). This is the single biggest auth gap before launch. Token is delivered via stdout only.

4. **Assessment token delivery** — same as above; currently stdout-only. No email delivery.

5. **Log shipping** — `console.log`/`console.error` go to stdout/stderr. Production requires a log shipper to CloudWatch Logs, Datadog, etc. Structured JSON logging (e.g., pino) would help parsing but is not implemented.

6. **Secret rotation handling** — no logic to handle `API_KEY` rotation without a full restart. Acceptable for current scale, but worth noting.

7. **DB connection pooling limits** — `pg.Pool` with defaults (max 10). Under load, connections may exhaust. `DATABASE_POOL_MAX` env var not exposed yet.

8. **Frontend `.env` not created** — `.env.example` exists but the actual `.env` file must be created by the operator. `VITE_API_KEY` must match the backend `API_KEY`.
