# Current State

## Completed (all batches)

### Batch 1-15 (see history/)
KB/ingestion, modules, topics, quiz candidates, learner identity, progress, assignments, packages, admin views.

### Batch 16-25 (see history/2026-03-15-batch-16-25.md + below)
16. ✓ Learner OTP flow — real implementation; Bearer token session; /learn/identify removed
17. ✓ Admin password auth — scrypt; admin_sessions; requireAdmin; AdminLogin; ADMIN_PASSWORD seed
18. ✓ Temporary learner identity removed — api.learn.* no learnerId params; Bearer header everywhere
19. ✓ Role-based backend access — /kb/* + /admin/* behind requireAdmin; /learn/* behind requireLearner
20. ✓ Admin profile/settings — change-password; AdminProfile.tsx
21. ✓ Pricing/package control — priceCents/tier/public columns on packages; PATCH /admin/packages/:id
22. ✓ Landing/library/news content blocks — content_blocks table; full CRUD at /admin/content-blocks
23. ✓ Paid/free access gating — ENFORCED: AccessService derives tier from overrides → direct assignments → group/package memberships; requirePaidAccess middleware applied to ALL /learn/* routes; free learners get 403; /access/tier endpoint; admin override CRUD at /admin/access
24. ✓ Email assessment funnel — assessment_leads table; /access/assessment/start (idempotent, logs token); /access/assessment/:token GET (form + marks started); /access/assessment/:token POST (saves answers, marks completed); does NOT create learner access
25. ✓ Admin content-control tightened — packages pricing/tier/public editable; content_blocks CRUD done; all behind requireAdmin

## Access Tier Logic
free → 403 on all /learn/* routes (paid access required)
paid = ANY of:
  1. access_overrides row for learnerId (with valid expiry)
  2. direct module_assignments row for learnerId
  3. learner in a group with any package_group_assignment

## TTX (feature/ttx-core branch)
- Branch: `feature/ttx-core` — active, NOT merged to main
- Schema: 9 tables applied (ttx_scenarios, ttx_scenario_sections, ttx_scenario_steps, ttx_injects, ttx_sessions, ttx_session_participants, ttx_session_events, ttx_after_action_reviews, ttx_action_items)
- Routes: /ttx/scenarios (full CRUD + sections/steps/injects) + /ttx/sessions (admin Bearer) + /ttx/participate (learner Bearer)
- Full end-to-end loop tested: scenario → session → injects → decisions → AAR → export ✓
- Manual-first. No AI generation.
- Frontend UI: /ttx/scenarios (list+create), /ttx/scenarios/:id (edit+sections+steps+injects), /ttx/sessions (list+create), /ttx/sessions/:id (facilitator console), /ttx/sessions/:id/aar (AAR+action items), /ttx/sessions/:id/participate (participant join+submit)
- Participant auth: learner OTP → Bearer token → /ttx/participate/* (requireLearner + requireParticipant middleware)
- SSE: TtxConsole + TtxParticipant both use EventSource; token passed as ?token= query param; API key as ?x-api-key= query param
- Global API key middleware updated to accept x-api-key as query param (for SSE EventSource compat)
- Polling removed from participant view — SSE only
- Smoke tested end-to-end (2026-03-16): OTP → join → start → deliver inject → respond → admin sees event → end → AAR → action item → finalize → export ✓
- SSE verified via curl: initial state event + live broadcast of session_started ✓
- All auth/access break tests passed: role separation clean, state machine guards hold
- Security fix: sessions.ts SSE learner token check now enforces expiry (gt(expiresAt, now))
- UI loop verified end-to-end (facilitator + participant, AAR, export) ✓
- AI assist layer implemented (see below)

## TTX AI Assist Layer (Batch 27 — 2026-03-15)
- POST /ttx/assist/scenario { title, objective } → draft { sections[{ title, steps[{ prompt, facilitatorNotes, injects[] }] }] }
- POST /ttx/assist/injects { stepPrompt, scenarioContext?, count? } → { injects[{ body, injectType, targetRoles, suggestedTimingMinutes }] }
- Both behind requireAdmin; gracefully errors if ANTHROPIC_API_KEY not set in backend/.env
- TtxScenarioEdit.tsx: "✦ Draft structure with AI" button on meta (requires objective), shows collapsible draft panel per section with "Add section" to apply; "✦ Suggest injects" button per step, shows suggestions with "Use" to pre-fill inject form
- Manual-first: all AI output is suggestion only — facilitator reviews/edits/saves
- SDK: @anthropic-ai/sdk@0.78.0 installed in backend, model claude-opus-4-6
- Requires: ANTHROPIC_API_KEY in backend/.env (placeholder added, key not committed)
- Hardened response validation: JSON.parse errors → "unparseable response — try again"; missing shape → specific message
- Anthropic SDK error extraction: `extractError()` pulls inner `error.message` from APIError body, removes verbose JSON blob
- ANTHROPIC_API_KEY set in backend/.env; backend running
- All failure paths smoke tested and passing (see history/2026-03-15-ttx-ai-assist-smoke-v2.md)
- Live API test blocked by account credits; all other paths verified clean

### AI Assist Boundaries (tightened)
- Admin/facilitator only — both endpoints behind requireAdmin; no participant-facing AI
- Logging: `[ttx-assist]` log line per request: timestamp, adminUsername, endpoint, truncated input
- Fails cleanly: missing ANTHROPIC_API_KEY returns 500 with message; client shows inline aiError
- Review required: all AI output is suggestions; nothing auto-saves

### New Scenario → AI Draft Flow
- TtxScenarios.tsx: after create, if objective present, navigates to `/ttx/scenarios/:id?draft=ai`
- TtxScenarioEdit.tsx: on load with `?draft=ai`, auto-triggers draftScenarioWithAI; clears query param from URL
- `autoDraftTriggered` ref prevents double-fire on re-render

### AI Session Badges
- `aiCreated` Set tracks entity IDs created via AI assist this session (not persisted)
- Sections, steps, injects created from AI draft show `✦ AI` badge
- Injects added via "Use" from inject suggestions also tracked via `injectFromAI` ref

## Gate 1 — Auth/Access Hardening (2026-03-16)
- Deleted `routes/learn/identify.ts` — dead unauthenticated learner-creation endpoint (was not mounted, but a landmine)
- `server.ts`: fail-fast startup if `API_KEY` not set (was silently bypassed — `if (apiKey && ...)` short-circuit)
- `sessions.ts` SSE endpoint simplified: removed dead learner token branch + expiry-skipping admin re-check; requireAdmin upstream already validates — was dead/misleading code
- Removed stale "learnerId from body" comment in `learn/modules.ts` (code correctly uses req.learnerId from middleware)
- All auth/access paths audited and confirmed correct (see history/2026-03-16-gate1-auth-hardening.md)

### Remaining Auth/Access Gaps
- OTP delivery stdout-only — requires email/SMS integration before launch
- CORS_ORIGIN must be set to production domain in deployment env
- Assessment access tokens have no expiry (low severity)
- Admin accounts need individual password change after initial seed

## TTX Polish (2026-03-16)
- TtxSessions: action label is status-aware (Setup/Console/View); "Copy join link" per non-ended session row
- TtxConsole: participant URL bar with Copy button (non-ended sessions); SSE dot clickable to reconnect
- TtxParticipant: SSE dot clickable to reconnect; OTP hint neutral ("Enter it below." not dev-facing); waiting-for-inject message now context-aware
- TtxAAR: fixed broken export link → "Download export JSON ↓" button (blob download from loaded state)

## Working Endpoints

### Auth (no learner session needed)
- POST /auth/otp/request { handle } → 204 (logs code)
- POST /auth/otp/verify { handle, code } → { token, learnerId, handle }
- POST /auth/logout → 204 (invalidates learner session)
- POST /auth/admin/login { username, password } → { token, username }

### Access (no learner session for assessment; Bearer for /tier)
- GET  /access/tier → { tier, learnerId }
- POST /access/assessment/start { email } → 204
- GET  /access/assessment/:token → form + status
- POST /access/assessment/:token { answers } → { ok, message }

### Learner (Bearer + paid tier)
- GET  /learn/modules
- GET  /learn/modules/:id
- GET  /learn/modules/:id/prerequisites
- GET  /learn/modules/:id/help?q=
- GET  /learn/modules/:id/attempts
- POST /learn/modules/:id/practice

### Admin KB (Bearer — admin session)
- /kb/items, /kb/modules, /kb/topics, /kb/ingest, /kb/quiz-candidates, /kb/revisions, /kb/search, /kb/links

### Admin management (Bearer — admin session)
- /admin/progress/*
- /admin/assignments CRUD
- /admin/packages CRUD (pricing + public flag)
- /admin/content-blocks CRUD (kind: landing|library-link|news)
- /admin/profile + /admin/profile/change-password + /admin/profile/logout
- /admin/access CRUD (grant/revoke tier overrides)

## Gate 4 — Deployment Readiness and Operational Safety (2026-03-16)
- ✓ Env audit consolidated in server.ts: REQUIRED (fail-fast) vs OPTIONAL (warn) clearly separated
- ✓ ADMIN_PASSWORD missing + no admins in DB → fail-fast at startup
- ✓ CORS_ORIGIN, ANTHROPIC_API_KEY, TRUST_PROXY unset → startup warnings
- ✓ trust proxy configurable from TRUST_PROXY env var (required for correct rate limiter IP behind ALB)
- ✓ Health endpoint: GET /health now checks DB (SELECT 1); 200 ok / 503 degraded
- ✓ Request logger: now logs status code + duration (no secrets in output)
- ✓ Public 500 paths in access.ts: sanitized to 'Internal server error'; real errors logged server-side
- ✓ Assessment token removed from stdout log
- ✓ Frontend API key/base URL from VITE_API_KEY / VITE_API_BASE env vars (falls back to dev defaults)
- ✓ .env.example files updated (backend: required/optional/feature sections; frontend: new file)
- TypeScript: tsc --noEmit clean (backend + frontend)

### Remaining Gate 4 Gaps (infra/ops)
- HTTPS/TLS — handled at reverse proxy/ALB layer; not in app scope
- HSTS / security headers — need Helmet.js or reverse proxy headers
- OTP delivery — stdout only; needs email/SMS provider (biggest auth gap before launch)
- Assessment token delivery — stdout only; needs email
- Log shipping — stdout/stderr; needs CloudWatch/Datadog shipper + structured JSON logging
- DB pool limits not exposed as env var (defaults to pg max 10)

## Gate 3 — Abuse Protection and Request Hardening (2026-03-16)
- ✓ Rate limiting: express-rate-limit@8.1.3 installed
  - /auth/*: 10 req/15min (OTP request, verify, admin login)
  - /access/assessment/start: 5 req/15min
  - /kb/ingest/*: 20 req/15min
  - /ttx/participate/*: 60 req/1min
  - /ttx/assist/*: 10 req/15min
- ✓ Body size: global 10mb → 100kb; /kb/ingest gets own 2mb limit
- ✓ Input length caps on all public-facing auth/access inputs
- ✓ Assessment answers: plain object enforced, max 20 keys
- ✓ All KB audit fields (createdBy/performedBy/uploadedBy/fetchedBy) now from req.adminUsername
- ✓ Practice answers array capped at 100 items

### Remaining Gate 3 Gaps (infra/WAF needed)
- trust proxy not set — IP rate limiting may target proxy IP in production
- In-memory rate limiters — don't survive restarts or horizontal scale (needs Redis)
- No global rate limit — WAF/reverse-proxy layer needed for coverage of admin routes
- Unauthenticated routes can return DB error strings on DB failure (service-layer gap)
- No HTTPS enforcement (TLS/HSTS is reverse-proxy concern)

## Gate 2 — Data Integrity and Input Validation Hardening (2026-03-16)
- ✓ DELETE /admin/packages/:id/modules/:moduleId critical bug fixed (was deleting ALL modules)
- ✓ All audit trail fields (assignedBy, createdBy, grantedBy) pulled from req.adminUsername — not client body
  - assignments.ts, packages.ts, content-blocks.ts, access-overrides.ts
- ✓ expiresAt (access-overrides) and scheduledAt/dueAt (TTX sessions/action items) validated before new Date()
- ✓ injectType enum enforced (legal|media|technical|customer|other) on POST and PATCH injects
- ✓ targetRoles type-checked (must be array) before JSON.stringify
- ✓ action item status enum enforced (open|closed|retesting) on PATCH
- ✓ Parent ownership checks: POST steps verifies section exists; POST injects verifies step exists
- ✓ KB ingest content size caps: manual 500K chars, file 1M chars
- TypeScript: npx tsc --noEmit clean

### Remaining Data Integrity Gaps
- ttxSessions.currentInjectId — no FK constraint (dangling ref if inject deleted; schema migration needed)
- KB schema audit fields (createdBy/performedBy/uploadedBy) are client-supplied strings, not from req.adminUsername
- Module practice route: score field unclamped (no 0–100 validation)

## Batch 26 — Security Pass (2026-03-16)
26. ✓ Admin credentials secured — out/admin-credentials.md in out/.gitignore
27. ✓ Full paid learner path — OTP → session → modules → prerequisites → help → practice → admin progress view
28. ✓ Admin assignment flow — assign module, publish, lock via prerequisite, learner sees locked state correctly
29. ✓ Package-based access — group→package path grants paid; removing member reverts to free + 403
30. ✓ Session security tightened — POST /auth/logout, POST /admin/profile/logout; changePassword invalidates all sessions; role separation verified

## Smoke Tests (Gate 5 — 2026-03-16)
All passing — see out/history/2026-03-16-smoke-tests.md:
- Admin auth: login, protected access, role separation, bad-token rejection ✓
- Learner auth: OTP request → 204; rate limiter fires at limit; OTP verify → token ✓
- Free learner → 403 on /learn/modules ✓
- Admin grants paid override (grantedBy from token) → 200 on /learn/modules ✓
- Admin revokes via DELETE /admin/access/:learnerId → tier reverts to free ✓
- GET /learn/modules/:id, POST /learn/modules/:id/practice, admin progress view ✓
- KB ingest manual → createdBy from token ✓
- TTX: create scenario, create session, learner blocked from admin routes ✓
- AI assist: learner blocked 401; admin gets Anthropic API error (credits) not 500 ✓
- Security: no/wrong API key → 401; oversized body → 413 (fixed); health → 200 ✓
- All 4 admin accounts: individual passwords set (out/admin-credentials.md) ✓

## Gate 5 Bug Fixed
- **413 exposed as 500**: global error handler now checks `err.status`/`err.statusCode`; body-parser 413 surfaces correctly

## AWS Deployment Prep (2026-03-16)

### App changes
- SES email delivery wired: `backend/src/lib/email.ts` — SES when `SES_FROM_ADDRESS` set, stdout fallback in dev
- OTP delivery: sends SES email when handle contains `@`; stdout for non-email handles
- Assessment token delivery: sends SES email with `APP_BASE_URL`-based link
- `backend/Dockerfile` — multi-stage, non-root user, HEALTHCHECK via `/health`
- `backend/.dockerignore` added
- `backend/.env.example` updated: `SES_FROM_ADDRESS`, `AWS_REGION`, `APP_BASE_URL`
- Startup warns if `SES_FROM_ADDRESS` or `APP_BASE_URL` unset

### AWS docs
- `out/aws-architecture.md` — target shape: ECS Fargate + RDS + ALB + CloudFront/S3 + SES + Secrets Manager
- `out/aws-env-secrets.md` — full Secrets Manager / Parameter Store / task definition map
- `out/aws-deployment-sequence.md` — step-by-step with CLI commands and verification checks
- TypeScript: tsc --noEmit clean

## Deployment Handoff (2026-03-16)
- out/launch-readiness.md — app-ready checklist + external blockers + launch sequence
- out/deployment-handoff.md — env vars, AWS config, launch order, post-deploy test plan
- out/provider-checklist.md — OTP/email, secrets, TLS, Redis, logging checklist

**App is at in-code production ceiling. All remaining work is infra/provider/ops.**

## Gate 6 — Pre-launch App-Scope Closure (2026-03-16)
- ✓ Helmet security headers: CSP default-src 'none', HSTS, X-Content-Type-Options nosniff, X-Frame-Options, Referrer-Policy no-referrer, X-XSS-Protection 0
- ✓ X-Powered-By suppressed (Helmet removes automatically)
- ✓ Admin login timing oracle closed: dummy scrypt run when username not found prevents timing-based enumeration
- ✓ Global error handler: 413 body-too-large now surfaces correctly (was 500)
- ✓ Launch readiness document written: out/launch-readiness.md (three sections: ready, external blockers, launch sequence)
- TypeScript: tsc --noEmit clean (backend)

## Schema (push with db-push.sh)
All tables applied (2026-03-16):
- learner_sessions, otp_requests, auth_users
- admin_users, admin_sessions
- content_blocks
- access_overrides, assessment_leads
- packages columns: price_cents, tier, public

## Ports
- Backend: http://localhost:3001 | Frontend: http://localhost:5173 | DB: 5433
- API key: dev-local-key
- ADMIN_PASSWORD env must be set before first start

## Local Proof & UI Polish Pass (2026-03-16)

Full browser walkthrough + presentability pass — all core flows verified locally. See out/local-proof-status.md.

### Flows verified end-to-end
Admin login → KB list/filter/ingest → KB item detail → KB search → Topics → Modules → Progress → Assignments → Learner OTP → Learner hub → TTX scenarios → TTX sessions → TTX console → TTX participant → TTX AAR ✓

### Fixes applied
- AdminLogin: broken redirect `/kb-admin` → `/kb`
- KBAdmin: "Learner" nav opens new tab (preserves admin session); "Logout" no-wrap; slug truncated in list
- KBSearch: full admin nav bar added; FTS → "Full-text", Quiz-aid → "Quiz assist"; max-w-5xl
- TopicManager: full admin nav bar added (was a dead end)
- ModuleManager: back-link text → "← Back to KB"
- KBItemDetail: "Contentv1" heading spacing fixed (gap between label and version badge)
- AdminProgress: React key warning fixed (Fragment keying in both ByLearner + ByModule maps)
- AdminAssignments: replaced all hardcoded fetch() with api.assignments.*; added subtitle
- AdminProfile: "Back to KB" changed to Link element (proper keyboard/right-click behavior)
- LearnHub: removed dev-facing "check server logs" OTP hint; duplicate module in recommended banner fixed
- TtxConsole: participant URL is clickable link + Copy button; Log Event button tooltip when fields missing
- TtxScenarioEdit: inject type badge on own line, separated from body text

### Proof artifacts
- out/local-proof-status.md — flow status table, presentation-ready screens, known gaps

## Operational Data Setup & UI Polish Pass 2 (2026-03-16)

### Module content linked and verified
- Phishing 101: 1 primary (Phishing Awareness), 1 reference (MFA item)
- Spear Phishing 201: prereq set to Phishing 101; testlearner assigned to both; locktest only to 201 → confirmed locked
- 3 quiz candidates approved for Phishing 101; practice POST returns score 2/2, 100% with remediation ✓
- Module chain: Phishing 101 → next_module_id = Spear Phishing 201 ✓

### Bugs fixed
- `learn.service.ts`: quiz candidates disappeared after promote — `checkPractice` + `getModuleContent` only checked `status = 'approved'`; fixed with `or(eq(status,'approved'), eq(status,'promoted'))` in both queries
- `KBAdmin.tsx`: `Field` component updated to accept optional `hint` prop; URL tab uses hint text; actor display is read-only span
- `KBItemDetail.tsx`: actor display is read-only span (matches KBAdmin pattern)
- `ModuleManager.tsx`: content panel header shows item count; actor fields use logged-in admin; empty state guidance text added
- `AdminProgress.tsx`: nav dead end fixed — added KB/Modules/Assignments links + Logout
- `AdminAssignments.tsx`: nav dead end fixed — added KB/Modules/Progress links + Logout
- `LearnModule.tsx`: pointless ternary removed on "Back to Learning Hub" text
- Admin passwords: arnettmcmurray and darren.mott had stale seed passwords; both changed via change-password API (see out/admin-credentials.md)

### Admin credentials
All 4 accounts verified with individual passwords (2026-03-16). See out/admin-credentials.md.

## Security & Data Integrity Pass 2 (2026-03-16)

### KB audit fields now always from token
- `quiz-candidates.ts`: `reviewedBy` for approve/reject from `req.adminUsername`
- `lessons.ts`: `addedBy` for module link creation from `req.adminUsername`
- `modules.ts`: `createdBy` for module creation from `req.adminUsername`

### Schema fixes
- `ttxSessions.currentInjectId`: added FK `.references(() => ttxInjects.id, { onDelete: 'set null' })` — deleting inject no longer leaves dangling reference
- `assessmentLeads`: added `tokenExpiresAt` column; new tokens expire after 72h; GET/POST return 410 for expired tokens

### UI / API additions
- `TtxSessions`: session list now shows participant count column (extra count query in backend list endpoint)
- `ModuleManager`: content panel header shows item count `(n items)`

## Batch 28 — Dev Polish & Field Additions (2026-03-16)

- Email delivery: SMTP relay path via nodemailer; `SMTP_HOST` + `SMTP_PORT` env vars; Mailpit quick-start documented
- Module `estimatedMinutes` field: schema, service, backend route, frontend form + list + learner hub card
- LearnHub: completed module cards show "Next →" button when `nextModuleId` set; uncompleted cards show `n min`
- Module content panel header shows item count
- local-proof-status.md updated: module study/practice rows now ✅ (data set up in prior session)

## Resume Notes
- Free learner → 403 on /learn/* — must have assignment or override to get paid tier
- Assessment flow is pre-auth marketing only; never creates a learner_sessions row
- api.learn.* uses Bearer header (no learnerId param); api.modules.*/api.items.* uses adminReq
- TTX: read out/ttx-mvp-direction.md before starting; branch feature/ttx-core; no merge until end-to-end working
