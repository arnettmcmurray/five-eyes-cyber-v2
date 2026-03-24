# Five Eyes — Full Build Status Checklist
_Last updated: 2026-03-24 | Canonical source of truth | Smoke pass complete_

---

## ⚠️ Governance Rule

**This file is the canonical truth source for Five Eyes v2.**

It must be read and updated before any of the following:
- Implementation work
- Planning or design decisions
- Styling/design execution
- Bootstrap / local-proof changes
- Auth / access / packages changes
- KB / retrieval / remediation changes
- TTX changes
- AWS staging pushes or deployment prep
- Merge / deploy decisions

If anything in the codebase or other docs conflicts with this checklist, this checklist governs. Update it to reflect reality — not aspirations.

Related truth docs (must stay aligned with this file):
- `out/current-state.md` — runtime product state and account truth
- `docs/implementation_plan.md` — next steps and execution order

---

## Section 1 — Core Product Truth

| Item | Status | Notes |
|------|--------|-------|
| KB is primary truth source (not AI) | DONE | Product wording corrected. KB Help = real. AI guidance = future. |
| Tier model: free / individual / professional / paid | DONE | Enforced at DB, backend, and frontend |
| TTX backend gate: blocks free + individual | DONE | Fixed 2026-03-23 — was only blocking individual |
| No fake AI claims in public copy | DONE | "AI-Powered Defense" and "AI-assisted training" removed 2026-03-23 |
| Admin is control center (not a side panel) | DONE | Grant/revoke access, live health, groups, KB governance |
| Entitlement model: explicit overrides win | DONE | access_overrides → priority 1; group/module fallbacks are latent |
| Latent bug: module assignment → professional (if override revoked) | WORKING BUT THIN | Access service Priority 2. No active impact. Deferred. |
| Latent bug: group package tier field ignored (hardcoded professional) | WORKING BUT THIN | Access service Priority 3. No active impact. Deferred. |

---

## Section 2 — Auth / Access / Packages

| Item | Status | Notes |
|------|--------|-------|
| Learner OTP login (email → Mailpit → session) | DONE | Works end-to-end locally |
| Admin login (scrypt hash, 8-hour token) | DONE | `/admin/login` |
| Session token validation (Bearer, expiry) | DONE | learner_sessions table |
| Access overrides: grant / revoke via admin UI | DONE | POST / DELETE `/admin/access` |
| Individual tier: training + KB help, no TTX | DONE | Enforced backend + frontend |
| Professional tier: training + KB help + TTX | DONE | Enforced backend + frontend |
| Free tier: access gate only, no training | DONE | FreeTierGate component + requirePaidAccess middleware |
| Packages page: honest tier feature listing | DONE | AI-assisted removed; tiers listed accurately |
| Group-based TTX entitlement (per-group TTX field) | NOT BUILT | No product decision made. Deferred explicitly. |
| RBAC for admin roles (author / reviewer / publisher / campaign manager) | NOT BUILT | Future. Currently all admins have full access. |
| Admin accounts: dynamic (not hardcoded emails) | NOT BUILT | 4 emails hardcoded. Deferred — low priority. |
| Session refresh / sliding expiry | NOT BUILT | OTP sessions have fixed 24h expiry. Deferred. |

---

## Section 3 — Learner Experience

| Item | Status | Notes |
|------|--------|-------|
| LearnDashboard: module list, progress, tier badge | DONE | Alex sees 1, Sam sees 3 |
| LearnModule: forward-only flow (overview → briefing → checkpoint → debrief) | DONE | Fully functional |
| Module overview: reference materials collapsible section | DONE | Shows faq/glossary/policy/threat-brief KB items |
| Briefing task: KB Help panel (Individual+, collapsible) | DONE | Pull-tab, FTS search, results with title/excerpt/topics |
| Checkpoint: no KB Help (correctly absent) | DONE | Intentional — prevents answer-spoonfeeding |
| Debrief: KB Help panel + remediation cards | DONE | Wrong answers show KB cards with gold left border |
| Remediation: KB items surfaced after wrong answers | DONE | remediationItems[] → cards in debrief |
| FreeTierGate: blocked users see gate, not locked blur | DONE | Lock icon + CTA |
| Module prerequisites enforced | DONE | Locked state, prereq check at API |
| Module progress: started / completed / score | DONE | learner_progress table |
| Practice attempt history (scores only, no answers) | DONE | GET `/learn/modules/:id/attempts` |
| t1-phishing: 5 tasks, 15 questions, full KB | DONE | Fully seeded |
| t2-bec-payment: 3+5 tasks, 12 questions, KB | DONE | Fully seeded |
| t3-account-security-mfa: 3+4 tasks, 12 questions, KB | DONE | Fully seeded |
| Learner-visible module catalog (open catalog if no assignments) | WORKING BUT THIN | Shows all published if no assignments. Works but not a curated store. |
| Phishing simulation (campaign, track, assign remediation) | NOT BUILT | Planned future feature. Do not build until KB truth is stable. |
| Smarter KB-backed game / competition | NOT BUILT | Current SecurityGame.tsx is hardcoded toy mechanics. Redesign deferred. |
| AI-assisted guidance layer (session memory, context-aware) | NOT BUILT | Future. No route/service/DB. Gated at Professional+ when built. |

---

## Section 4 — Admin Control Center

| Item | Status | Notes |
|------|--------|-------|
| AdminDashboard: KPI cards, live health status | DONE | Real /health ping, live counts |
| AdminProgress: learner table with tier badges | DONE | Shows all 3 learners with access state |
| AdminProgress: grant Individual / Professional | DONE | POST /admin/access — badge updates immediately |
| AdminProgress: revoke access | DONE | DELETE /admin/access/:learnerId |
| AdminProgress: Groups tab | DONE | Shows transport-ops (2), freight-security (1) |
| KB admin: ingest, revise, publish pipeline | DONE | Full governance flow |
| KB admin: FTS search over published items | DONE | GET /kb/search |
| KB admin: topic management | DONE | TopicManager |
| KB admin: module management | DONE | ModuleManager |
| TTX admin: scenario create/edit | DONE | TtxScenarios, TtxScenarioEdit |
| TTX admin: KB refs panel (link KB items to scenario/step) | DONE | FTS search, add/remove, scope to step |
| TTX admin: session management | DONE | TtxSessions |
| TTX admin: AAR view | DONE | TtxAAR |
| TTX admin: zero-KB-refs warning in TtxScenarioEdit | NOT BUILT | Optional small addition. Scenario can launch without any KB refs — no admin signal. |
| Admin analytics: scorecard / readiness / trend reports | NOT BUILT | Future. Current admin is operational control only. |
| Admin: job scheduler / automation console | NOT BUILT | Future. Required for phishing campaigns and media ingestion. |
| Admin: audit log (who changed what, when) | NOT BUILT | Future. Required before campaigns go live. |
| Content author / reviewer / publisher role separation | NOT BUILT | Future. All admins currently have full KB access. |

---

## Section 5 — KB / Retrieval / Remediation

| Item | Status | Notes |
|------|--------|-------|
| KB items: ingest, revise, publish | DONE | Full lifecycle |
| FTS retrieval: `GET /learn/modules/:id/help?q=` | DONE | Stateless, module-scoped, learner-safe shape |
| FTS retrieval: content_chunks + topics + topic_relationships | DONE | 22 items, 9 topics, 32 relationships seeded |
| Remediation items: wrong answers surface KB cards | DONE | remediationItems[] in quiz results |
| Reference materials: overview shows policy/faq/glossary items | DONE | lesson_content_links with supplementary type |
| TTX KB refs: schema + admin UI + participant view | DONE | ttx_scenario_kb_refs table wired |
| TTX KB refs: local-proof data seeded | ✅ DONE | 3 KB refs seeded (bootstrap). Verified in participant KB Reference panel 2026-03-24. |
| Hybrid retrieval (FTS + embeddings) | NOT BUILT | Future. FTS baseline is sufficient for now. Plan upgrade path when KB is larger. |
| Learner visibility filter (learner_visible field on KB items) | NOT BUILT | All published items currently treated as learner-visible. Future: explicit field + filter. |
| KB metadata: audience/role, workflow stage, freshness tier | NOT BUILT | Future. Required for phishing campaigns and advanced filtering. |
| Two-cabinet model (raw intake vs learner-safe published) | NOT BUILT | Future. Required before media/news ingestion. |
| Media/news ingestion pipeline (curated intelligence feed) | NOT BUILT | Deferred. Requires two-cabinet model + review queue + licensing checks first. |
| Retrieval evaluation / groundedness metrics | NOT BUILT | Deferred. Not needed until KB is larger and AI layer is being built. |

---

## Section 6 — TTX

| Item | Status | Notes |
|------|--------|-------|
| Scenario model: sections / steps / injects | DONE | Full schema |
| Scenario editor: create/edit via admin | DONE | TtxScenarioEdit |
| Session: planned / active / hotwash / complete states | DONE | ttx_exercise_runs |
| Facilitator conduct view (full-screen) | DONE | TtxConduct |
| Participant view: decision timeline + KB refs panel | DONE | TtxParticipate |
| Participant view: SSE for real-time updates | ✅ DONE | /ttx/participate/:id/stream — SSE shape bug (participants/events nested in session) found and fixed 2026-03-24 smoke pass |
| AAR: session replay + action items | DONE | TtxAAR |
| TTX access: Professional+ only, free + individual blocked | DONE | requireTtxAccess middleware fixed 2026-03-23 |
| Local-proof BEC scenario seeded (with KB refs) | ✅ DONE | Bootstrapped + smoke verified 2026-03-24. Handle typo in all 3 bootstrap accounts fixed (fiveyesdev → fiveeyesdev). |
| Local-proof TTX run seeded (for end-to-end participate test) | ✅ DONE (admin UI) | Run created via admin UI during smoke pass 2026-03-24. No bootstrap seed needed — this is correct behaviour. |
| Zero-KB-refs admin warning in TtxScenarioEdit | NOT BUILT | Optional. Low priority. |
| Group-based TTX entitlement | NOT BUILT | Deferred explicitly. |
| Multiplayer / concurrent participant scaling | DEFERRED ON PURPOSE | Keep single-session, facilitator-led model. Not overbuilt. |

---

## Section 7 — Public Site / Brand / Shell

| Item | Status | Notes |
|------|--------|-------|
| All public pages: landing, about, capabilities, enterprise, packages, register, login, privacy, terms | DONE | Fully functional routes |
| NeuralBackground: canvas particle network (gold/amber, mouse interaction) | DONE | Renders on all public pages |
| PublicLayout: nav + footer with fiveeyesltd.com links | DONE | Full structure in place |
| Login / Register: OTP flow end-to-end | DONE | Works with Mailpit |
| Contact form: real API call | DONE | POST /public/contact |
| NavShell: back-to-public link + light/dark theme toggle | DONE | Persists to localStorage |
| Public page wording: honest (no fake AI claims) | DONE | Fixed 2026-03-23 |
| Owned image assets: dashboard/ and ttx/ | DONE | 21 images in /public/assets/ |
| Design strategy document (4-shell layout/style plan) | DONE | `docs/design/2026-03-23-layout-style-strategy.md` |
| Public shell: styling execution pass | NOT BUILT | Planning complete. Execution not started. No Unsplash. |
| Learner shell: styling execution pass | NOT BUILT | NavShell + LearnDashboard + LearnModule need visual polish |
| Admin shell: styling execution pass | NOT BUILT | AdminDashboard + AdminProgress + KB admin need visual polish |
| TTX shell: styling execution pass | NOT BUILT | Full-screen conduct + participate need visual polish |
| Stitch integration for visual exploration (5 screens) | NOT BUILT | Planned. Awaiting styling execution start. |
| Mobile nav: hamburger overlay for public pages | WORKING BUT THIN | Structure exists but not fully polished |

---

## Section 8 — Analytics / Charts / Scorecards

| Item | Status | Notes |
|------|--------|-------|
| Live KPI cards (learner count, module count, health) | DONE | AdminDashboard |
| Learner progress visibility per learner | DONE | AdminProgress table |
| Practice attempt scores visible to admin | DONE | Shown in progress table |
| Org-level readiness scorecard | NOT BUILT | Future. One of the highest-value admin features. |
| 30/90 day trend data | NOT BUILT | Future. Requires event log / time-series data. |
| Drill-down: KPI → cohort → individual → evidence | NOT BUILT | Future. Requires richer data model. |
| Campaign outcomes dashboard | NOT BUILT | Future. Requires phishing campaign feature first. |
| Repeat offender / readiness behavior signals | NOT BUILT | Future. |

---

## Section 9 — AWS / Deployment / Staging

| Item | Status | Notes |
|------|--------|-------|
| Local development environment (Postgres, backend, frontend, Mailpit) | DONE | Works. See docs/local-proof-access.md |
| .env.example documented | DONE | In repo |
| AWS staging plan documented | DONE | docs/aws/ |
| OTP email delivery for staging (SES or equivalent) | NOT BUILT | Local uses Mailpit. Staging needs real SMTP. |
| Secrets management (staging vs prod) | NOT BUILT | Not yet formalized beyond .env |
| CI/CD pipeline | NOT BUILT | No GitHub Actions or equivalent configured |
| Production AWS deployment | NOT BUILT | Staging plan exists; production not started |
| Logging / observability (structured logs, error tracking) | NOT BUILT | Console logs only. No APM, no structured log pipeline. |
| DB migrations for staging/prod | PARTIAL | Drizzle migration files exist. No automated run on deploy. |

> ⚠️ Before any AWS staging push: re-read this section and update it. Do not push to staging with NOT BUILT items in secrets management or OTP delivery.

---

## Section 10 — Future Systems Planned (Agreed, On the Board)

These are agreed roadmap items. They should not be started until the checklist sections above are stable. No item here should be built ahead of its dependencies.

| Item | Depends On |
|------|-----------|
| AI-assisted guidance layer (session memory, module context, wrong-answer guidance) | KB truth stable; retrieval metrics defined |
| Hybrid retrieval (FTS + embeddings) | Larger KB; chunking coherence improved |
| Phishing simulation (campaign, track, remediation trigger, scorecard) | Admin automation primitives; KB metadata (role/workflow/freshness) |
| Media / news ingestion (curated intelligence feed) | Two-cabinet KB model; review queue; licensing checks |
| KB-backed game redesign (scenario-driven, not hardcoded) | KB metadata complete; admin self-service for scenario content |
| Org-level readiness scorecard / admin analytics | Event log / learner event stream; time-series data model |
| Admin RBAC (author / reviewer / publisher / campaign manager) | Admin role model design; not needed until team grows |
| Admin audit log (who changed what, when) | Required before phishing campaigns go live |
| Job scheduler / automation console | Required before phishing campaigns or media ingestion |

---

## Section 11 — Deferred / Not Built Yet (Explicitly)

| Item | Decision |
|------|----------|
| Access service Priority 2 latent bug (module assignment → professional if override revoked) | Defer. No active impact. Fix when admin override management is formalized. |
| Access service Priority 3 latent bug (group package tier field ignored) | Defer. No packageGroupAssignments seeded. Fix when used in production. |
| Group-based TTX entitlement (per-group TTX access field) | Explicitly out of scope. No product decision made. |
| Admin emails hardcoded (4 in source) | Defer. Low priority. No evaluation impact. |
| Session refresh / sliding expiry | Defer. OTP sessions are fixed 24h. Acceptable for now. |
| Multiplayer / concurrent TTX scaling | Deferred on purpose. Keep single-session, facilitator-led model. |
| Broad styling pass | Defer until product logic is stable. Strategy is ready; execution not started. |
| Fancy AI memory layer | Defer until grounded context inputs (KB, retrieval metrics) are mapped. |
| Any feature that outruns the KB spine | Standing rule — see guardrails. |

---

## Guardrails (Permanent)

1. KB is primary truth. AI is assistive, not the primary brain.
2. Admin should be able to change more without calling devs over time.
3. No fake AI wording. KB Help = real. AI-assisted guidance = future.
4. Avoid drift, fake features, and pretty lies.
5. No feature that outruns the KB spine.
6. Before any AWS push or deploy decision — read Section 9 and update it.
