# Gate 1 — Auth/Access Hardening (2026-03-16)

## Audit Findings

### Fixed

**1. Dead unauthenticated route — `routes/learn/identify.ts`**
- `POST /learn/identify { handle }` created learners with no authentication
- Was NOT mounted in `app.ts` (confirmed via grep) — dead code
- Risk: future accidental mount would bypass all learner auth and allow arbitrary learner creation
- Fix: deleted the file

**2. API_KEY gate silently bypassed when env var not set**
- In `app.ts`: `if (apiKey && ...)` — if `API_KEY` not in env, condition short-circuits, all traffic passes through without a key check
- Fix: added fail-fast startup check in `server.ts` — server refuses to start if `API_KEY` is not set
- `API_KEY=dev-local-key` confirmed set in backend/.env

**3. Sessions SSE endpoint had dead learner token branch + missing expiry check**
- `GET /ttx/sessions/:id/stream` is inside `ttxSessionsRouter` mounted behind `requireAdmin` in `app.ts`
- Endpoint re-validated token with an isAdmin check that skipped `expiresAt` — an expired admin token would be accepted by the re-check (though requireAdmin upstream already caught it)
- Entire learner branch (`if (!isAdmin)`) was dead code — learners can never reach this endpoint through requireAdmin
- Fix: removed all token re-validation from SSE handler; admin is already verified by requireAdmin and identity is on `req.adminUsername`
- Removed now-unused imports: `adminSessions`, `learnerSessions`, `learners`, `gt`, `and` from sessions.ts

**4. Stale comment in `routes/learn/modules.ts`**
- Comment said "learnerId from body (set by client alongside answers)" — code correctly uses `req.learnerId` from requireLearner middleware
- Fix: removed misleading comment

### Confirmed Clean

| Check | Verdict |
|-------|---------|
| Learner session auth (`requireLearner`) — token validated DB-side with expiry | ✓ Correct |
| Admin session auth (`requireAdmin`) — token validated DB-side with expiry, timingSafeEqual for passwords | ✓ Correct |
| Paid/free gating — `requireLearner + requirePaidAccess` applied via `router.use()` to ALL `/learn/modules` routes | ✓ Correct |
| TTX facilitator routes — all behind `requireAdmin` in app.ts | ✓ Correct |
| TTX participant routes — `requireLearner + requireParticipant` inline in participate.ts | ✓ Correct |
| TTX participant SSE — own `requireLearner` inline + participant membership check | ✓ Correct |
| Identity from server-side token only — no client-trusted learnerId/role in protected routes | ✓ Correct |
| OTP: marks code `used=true` after verify; expiry enforced | ✓ Correct |
| Admin `changePassword` invalidates ALL sessions | ✓ Correct |
| Learner `logout` deletes session token | ✓ Correct |
| Role separation: admin token rejected on learner routes, learner token rejected on admin routes | ✓ Correct |
| Access tier derived entirely server-side (overrides → direct assignments → group/package) | ✓ Correct |
| No ADMIN_PASSWORD-level auth shortcut paths remain | ✓ Correct |

## Remaining Production Gaps (not fixable without infra/integration work)

1. **OTP delivery is stdout-only** — `console.log` in `LearnerAuthService.requestOtp()`. Production requires email or SMS delivery. The `// TODO` comment is in place. This is the single biggest auth gap for launch.

2. **CORS_ORIGIN defaults to `http://localhost:5173`** — If `CORS_ORIGIN` is not set in production env, only localhost is whitelisted. Must be explicitly set to the production frontend domain in deployment.

3. **Assessment access token has no expiry** — Assessment links (`randomBytes(24).toString('hex')`) are valid indefinitely. Low severity for a marketing funnel, but worth noting.

4. **Admin accounts share startup password** — `ADMIN_PASSWORD` seeds all 4 admin accounts with the same initial password. Each admin should set their own password via change-password after first login. No code change needed — process gap only.

5. **`/auth/register`, `/auth/login/password`, `/auth/password/reset` stubs** — Return 501. Not functional but expose route structure. Can be removed or left as-is.
