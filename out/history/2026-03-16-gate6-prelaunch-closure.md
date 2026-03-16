# Gate 6 — Pre-launch App-Scope Closure (2026-03-16)

## Changes Applied

### 1. Helmet security headers (`app.ts`)

Added `helmet()` middleware as the first middleware after `express()`, before CORS and body-parser.

Configuration:
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: { defaultSrc: ["'none'"] },  // pure JSON API — no resources
  },
  crossOriginEmbedderPolicy: false,           // not applicable for a JSON API
  crossOriginResourcePolicy: { policy: 'same-site' },
}));
```

Headers set on every response:
- `Content-Security-Policy: default-src 'none'; ...` (+ helmet defaults for frame/form/object)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: no-referrer`
- `X-XSS-Protection: 0` (disabled — intentional, browsers have dropped support)
- `X-Powered-By` suppressed (Helmet default)

HSTS is included now. It has no effect on plain HTTP connections but will be enforced by browsers as soon as TLS is active at the reverse proxy. No need to wait.

### 2. Admin login timing oracle (`admin-auth.service.ts`)

**Before:** `if (!admin || !verifyPassword(password, admin.passwordHash))` — if username doesn't exist, `verifyPassword` (scrypt) is never called, making unknown-user lookups measurably faster.

**After:** Always run `verifyPassword` against a dummy hash when the admin record isn't found:
```typescript
const DUMMY_HASH = '00000000000000000000000000000000:' + '0'.repeat(128);
const valid = admin && verifyPassword(password, admin.passwordHash);
if (!admin) verifyPassword(password, DUMMY_HASH); // constant-time dummy run
if (!valid) throw new Error('Invalid credentials');
```

Both "wrong password" and "unknown username" now return the same error message and take approximately the same time (scrypt always runs).

### 3. 413 body-too-large global error handler (`app.ts`) — carried from Gate 5

Global error handler now checks `err.status` / `err.statusCode` before falling through to 500:
```typescript
const status = err.status ?? err.statusCode ?? 500;
if (status === 413) {
  res.status(413).json({ error: 'Request body too large' });
  return;
}
```

## Audit: Items Reviewed and Confirmed Safe

| Item | Verdict |
|------|---------|
| OTP service — reveals handle existence? | No. Always calls `findOrCreate`; same 204 response regardless. |
| OTP code in stdout | Intentional placeholder for email/SMS delivery. Not a bug — known gap. |
| Assessment token in stdout | Removed in Gate 4. |
| Request logger — query params? | No. Uses `req.path` (not `req.url`), so `?token=` / `?x-api-key=` never logged. |
| SSE token in query param (`?token=`) | Necessary for EventSource compat (cannot set headers). Token not logged. |
| Admin login error message — reveals username? | Fixed: same error for unknown user and wrong password. |
| `verifyOtp` — reveals handle existence? | No. Returns "Invalid or expired code" for both bad code and unknown handle. |
| CORS defaults | `CORS_ORIGIN` falls back to `localhost:5173` in dev. Startup warning issued if not set. |
| DB errors on public paths | Sanitized in Gate 4. Assessment funnel returns only 'Internal server error'. |

## TypeScript

`npx tsc --noEmit` — clean (backend).

## Confirmed Working

| Check | Verdict |
|-------|---------|
| `helmet()` headers on all responses | ✓ verified via curl -I |
| `X-Powered-By` absent | ✓ |
| Admin login — valid credentials | ✓ token returned |
| Admin login — wrong password | ✓ 401 `Invalid credentials` |
| Admin login — unknown username | ✓ 401 `Invalid credentials` (same message, scrypt runs) |
| `tsc --noEmit` | ✓ clean |

## Remaining External Blockers

See `out/launch-readiness.md` — External/Infra Blockers section.
Critical: OTP email delivery, HTTPS/TLS, CORS_ORIGIN in production.
