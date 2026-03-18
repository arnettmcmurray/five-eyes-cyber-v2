# Deployment Handoff (2026-03-16)

## App Status

Production-hardened. All in-code gates complete (Gates 1–6). Ready for infra deployment pending external providers (OTP email, TLS).

**Branch:** `feature/ttx-core` — contains all backend + frontend work. Has not been merged to `main`.

## Services / Ports (local)

| Service | Port | Notes |
|---------|------|-------|
| Backend (Express) | 3001 | `npm run dev` in `backend/` |
| Frontend (Vite) | 5173 | `npm run dev` in project root |
| PostgreSQL | 5433 | Docker or local; see `DATABASE_URL` |

## Required Env Vars

Copy `backend/.env.example` → `backend/.env` and fill in values.

### REQUIRED (server will not start without these)

| Var | Description |
|-----|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `API_KEY` | Global API key; all requests must supply via `x-api-key` header. Use `openssl rand -hex 32`. |

### REQUIRED FOR FIRST RUN

| Var | Description |
|-----|-------------|
| `ADMIN_PASSWORD` | Seeds all admin accounts on first start. Server fails fast if unset and no admins exist in DB. Change individual passwords after first login. |

### OPTIONAL — must be set for production

| Var | Default | Description |
|-----|---------|-------------|
| `CORS_ORIGIN` | `http://localhost:5173` | Production frontend URL. Critical — must match deployed frontend domain. |
| `TRUST_PROXY` | (unset) | Number of proxy hops in front of the server (e.g. `1` for ALB or Nginx). Required for correct client IP in rate limiters. |
| `PORT` | `3001` | Backend listen port. |

### OPTIONAL — feature-specific

| Var | Description |
|-----|-------------|
| `ANTHROPIC_API_KEY` | Required for TTX AI assist (`/ttx/assist/*`). All other features work without it. |

### Frontend env vars

Copy `.env.example` → `.env` in project root (Vite).

| Var | Default | Description |
|-----|---------|-------------|
| `VITE_API_BASE` | `http://localhost:3001` | Backend API URL visible to browser. |
| `VITE_API_KEY` | `dev-local-key` | Must match backend `API_KEY`. Bundled into JS at build time — not a real secret. |

## Required External Providers

### 1. OTP / Email delivery — CRITICAL (blocks learner login)

OTP codes are currently printed to stdout only. No learner can log in without this.

**Where to integrate:** `backend/src/services/auth/learner-auth.service.ts:39`
Replace:
```typescript
console.log(`[OTP] handle=${normalized} code=${code} expires=${expiresAt.toISOString()}`);
```
With a call to your email/SMS provider (AWS SES, SendGrid, Twilio, etc.).

### 2. Assessment token delivery — CRITICAL (blocks assessment funnel)

Assessment access tokens are stdout-only.

**Where to integrate:** `backend/src/routes/access/access.ts` — POST `/assessment/start` and GET `/assessment/:token` (the link must be emailed to the user).

### 3. TLS — CRITICAL (HTTPS required before production traffic)

App serves plain HTTP on port 3001. TLS must terminate at:
- AWS ALB with HTTPS listener forwarding to port 3001, or
- Nginx proxy with TLS cert (e.g. ACM or Let's Encrypt)

Set `TRUST_PROXY=1` when behind ALB or Nginx.

## What Must Be Configured in AWS / Reverse Proxy

| Component | Config needed |
|-----------|---------------|
| ALB | HTTPS listener on 443 → forward to :3001; health check on `GET /health` (expect 200) |
| Security group | Allow 443 inbound; block 3001 from public internet |
| RDS / PostgreSQL | `DATABASE_URL` with production credentials |
| ECS task / EC2 | All env vars from above as task env or Secrets Manager references |
| Route 53 | DNS A/CNAME record for API domain |
| CORS_ORIGIN | Set to exact frontend origin (e.g. `https://app.fiveeyesltd.com`) |

## Launch Order

1. Provision PostgreSQL (RDS or equivalent). Note connection string.
2. Set all REQUIRED env vars in deployment environment.
3. Deploy backend container/instance.
4. Run schema push: `bash backend/scripts/db-push.sh` (or run once on startup).
5. Verify health: `curl https://<api-domain>/health` → `{"status":"ok","db":"ok"}`
6. Configure TLS at ALB or Nginx.
7. Wire OTP email provider (blocks learner login until done).
8. Wire assessment token email provider.
9. Build and deploy frontend: `npm run build` — set `VITE_API_BASE` and `VITE_API_KEY` before build.
10. Test end-to-end (see below).

## What Must Be Tested Immediately After Deployment

| Test | Expected |
|------|----------|
| `GET /health` | `{"status":"ok","db":"ok"}` |
| `POST /auth/admin/login` | Returns token |
| `GET /admin/access` with admin token | 200 |
| `POST /auth/otp/request` | 204 + OTP email received |
| `POST /auth/otp/verify` | Returns learner token |
| `GET /access/tier` with learner token | `{"tier":"free",...}` |
| Free learner `GET /learn/modules` | 403 |
| Admin grants paid override | tier becomes paid |
| Paid learner `GET /learn/modules` | 200 with module list |
| No API key | 401 |
| Wrong API key | 401 |
| Oversized body (>100kb) | 413 |
| Security headers present | `X-Content-Type-Options: nosniff`, etc. |
