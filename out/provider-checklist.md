# Provider / Secrets Checklist (2026-03-16)

Complete this before production launch. Items marked CRITICAL block core functionality.

---

## CRITICAL — OTP / Email Delivery

**Blocks:** All learner login. No learner can authenticate without this.

- [ ] Choose provider: AWS SES, SendGrid, Mailgun, Twilio (SMS), or equivalent
- [ ] Obtain API credentials for chosen provider
- [ ] Integrate in `backend/src/services/auth/learner-auth.service.ts:39`
  - Replace `console.log([OTP] ...)` with provider send call
  - Send to learner's email/phone; code is `code`, expires in 10 minutes
- [ ] Test: `POST /auth/otp/request { handle: "user@example.com" }` → OTP arrives in inbox

---

## CRITICAL — Assessment Token Delivery

**Blocks:** Assessment funnel (marketing/pre-auth email capture).

- [ ] Use same provider as OTP (above)
- [ ] Integrate in `backend/src/routes/access/access.ts`
  - POST `/assessment/start`: email the assessment link `https://<domain>/assessment/<token>`
  - Optionally: GET `/assessment/:token` reminder link
- [ ] Test: `POST /access/assessment/start { email: "..." }` → email received with assessment link

---

## CRITICAL — API Keys / Secrets (generate before deploy)

| Secret | How to generate | Where to set |
|--------|----------------|--------------|
| `API_KEY` | `openssl rand -hex 32` | Backend env var + `VITE_API_KEY` in frontend build |
| `ADMIN_PASSWORD` | Choose strong password | Backend env var; seed only; change immediately after first login |
| `DATABASE_URL` | From RDS/PostgreSQL provisioning | Backend env var |

**Never commit these.** `backend/.env` is in `.gitignore`. Use AWS Secrets Manager, SSM Parameter Store, or equivalent.

---

## CRITICAL — CORS Origin

- [ ] Set `CORS_ORIGIN=https://<your-frontend-domain>` in backend env
  - Example: `CORS_ORIGIN=https://app.fiveeyesltd.com`
  - If unset: defaults to `http://localhost:5173` — all production browser requests will be blocked

---

## HIGH — TLS / HTTPS

- [ ] Provision TLS cert (AWS ACM, Let's Encrypt, or existing wildcard)
- [ ] Configure ALB HTTPS listener (port 443 → forward to :3001) or Nginx TLS proxy
- [ ] Set `TRUST_PROXY=1` in backend env (required for correct IP in rate limiters behind proxy)
- [ ] Verify `Strict-Transport-Security` header is visible in browser DevTools after HTTPS live

---

## OPTIONAL — TTX AI Assist (Anthropic)

- [ ] Create Anthropic account at console.anthropic.com
- [ ] Add billing / purchase credits
- [ ] Generate API key
- [ ] Set `ANTHROPIC_API_KEY=<key>` in backend env
- [ ] Test: `POST /ttx/assist/scenario { title, objective }` as admin → draft returned
- Without this: TTX AI assist returns 500 with clear message; all other features unaffected

---

## MEDIUM — Redis (before horizontal scaling only)

Not needed for single-instance launch. Required before running multiple backend instances.

- [ ] Provision Redis (ElastiCache, Redis Cloud, etc.)
- [ ] Install `rate-limit-redis` package in backend
- [ ] Replace in-memory `express-rate-limit` stores with Redis store
- Without this: rate limiter state is lost on restart; doesn't coordinate across instances

---

## MEDIUM — Log Shipping

Not a launch blocker; ops visibility.

- [ ] Configure ECS/EC2 to ship stdout/stderr to CloudWatch Logs or Datadog
- Optional: install `pino` for structured JSON logs (requires refactor of `console.log` calls)

---

## NOT NEEDED AT LAUNCH

- HSTS preload list submission (do after HTTPS is stable for 30+ days)
- DB connection pool tuning (`DATABASE_POOL_MAX`) — default 10 is fine for initial load
