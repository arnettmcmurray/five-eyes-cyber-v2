# Deployment Handoff Docs (2026-03-16)

Created three handoff documents to close out in-code work and hand off to infra/ops:

## Files Created

### `out/launch-readiness.md`
Three sections:
- **Ready in App** — full list of completed gates: auth, security headers, input hardening, audit trails, data integrity, deployment readiness, TTX
- **External/Infra Blockers** — prioritised table (Critical/High/Medium/Low): OTP delivery, assessment email, TLS, CORS_ORIGIN, Redis, log shipping, DB pool
- **Launch Sequence** — numbered steps: pre-launch env/TLS/email, post-launch password changes, scale-up Redis/logging

### `out/deployment-handoff.md`
- App status and branch
- Services and ports (local dev)
- All required env vars with descriptions and defaults
- Required external providers with exact integration points in code
- AWS / reverse proxy config needed
- Numbered launch order
- Post-deploy test checklist

### `out/provider-checklist.md`
Checkbox-style checklist for ops/infra team:
- OTP / email delivery (blocks learner login)
- Assessment token delivery
- API keys/secrets to generate
- CORS_ORIGIN
- TLS/HTTPS + TRUST_PROXY
- Optional: Anthropic API key, Redis, log shipping

## Sensitive File Audit (pre-commit)

| File | Status |
|------|--------|
| `backend/.env` | Gitignored by `.gitignore` ✓ |
| `out/admin-credentials.md` | Gitignored by `out/.gitignore` ✓ |
| `.playwright-mcp/` | Untracked; will be excluded from commit |
| `backend/.env.example` | Safe to commit — no real secrets, only placeholders |
| `.env.example` (frontend) | Safe to commit — placeholder values only |
