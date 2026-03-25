# Current State — Five Eyes v2
_Last updated: 2026-03-24 | T4 + T5 modules seeded. Question depth expanded: +29 (round 1) +33 (round 2) = 62 new questions. T1 ~26q, T2 ~26q, T3 ~25q, T4 ~24q, T5 ~24q. ~130 total promoted questions. Learner routes wired: /learn/library, /learn/scorecard, /learn/ttx. TypeScript clean._

**Canonical truth:** `docs/design/full-build-status-checklist.md`

---

## Local-Proof Accounts (Persistent)

| Account | Email | Access | Module State |
|---------|-------|--------|--------------|
| Eva Restricted | `eva.restricted@fiveeyes.dev` | No package → Access gate | No training |
| Alex Morgan | `alex.individual@fiveeyes.dev` | Individual — training + KB/chat, no TTX | t1 in progress |
| Sam Reeves | `sam.professional@fiveeyes.dev` | Professional — training + KB/chat + TTX | t1 completed 80%, t2+t3+t4+t5 assigned |
| Admin | `arnettmcmurray@gmail.com` | Admin console | — |

See `docs/local-proof-access.md` for login instructions, OTP flow, and pages to inspect.

---

## Tier Model (Product Truth)

| Tier | DB value | Training | KB/question/chat | AI-assisted guidance | TTX |
|------|----------|----------|------------------|---------------------|-----|
| Registered (no package) | `free` / no override | ✗ gate | ✗ | ✗ | ✗ |
| Individual | `individual` | ✓ | ✓ | ✗ default | ✗ default |
| Professional | `professional` | ✓ | ✓ | ✓ (when built) | ✓ |
| Legacy paid | `paid` | ✓ | ✓ | ✓ (when built) | ✓ |
| Admin | admin session | — | — | — | admin console |

### Feature Classification (honest current state)

**KB/question/chat access** — `GET /learn/modules/:id/help?q=...`
Stateless KB retrieval. Calls `retrievalSvc.retrieve()` — vector/FTS search against KB items. Returns title, excerpt, topic labels. No memory, no session context, no AI response generation. This is the learner-facing KB search. Available to Individual and above.

**AI-assisted chat/guidance** — *does not exist yet*
The product concept: session-persistent memory, module/quiz context awareness, context-aware responses to wrong answers, guidance during TTX where entitlement allows. No route, no service, no DB table for this exists in the current codebase. Future entitlement — will be gated at Professional and above when built. Not faked anywhere.

**TTX access** — `POST|GET /ttx/participate/:id/{join,view,respond,stream}`
Blocked for Individual at the backend (`requireTtxAccess` middleware → 403 with honest message) and frontend (tier check before join form shows `ttx-blocked` screen). Group/package-based TTX entitlement is a noted gap — not yet implemented in the schema.

---

## What Works

### Admin
- Login: `arnettmcmurray@gmail.com` + `ADMIN_PASSWORD` — scrypt hash, 8-hour token, lands at `/kb`
- Control center (`/admin`): KPI cards pull live data — learner count (3), module count (3), pending jobs
- System Status: now pings real `/health` endpoint — shows Healthy/Connected or Unreachable if DB down
- Learner Progress (`/admin/progress`): shows Eva, Alex, Sam with company/role/completion stats
  - **Access column**: shows Active badge (paid) or "Activate Individual" button (no override)
  - **Grant Access**: click "Individual" or "Professional" → calls `POST /admin/access` → badge updates immediately (no reload needed)
  - **Revoke**: click "Revoke" → calls `DELETE /admin/access/:learnerId` → reverts to grant button
  - **Groups tab**: shows Transport Operations (2 members), Freight Security (1 member)
- Module view: t1 (5 tasks, 15 questions), t2-bec (3 primary + 5 reference, 12 questions), t3-mfa (3 primary + 4 reference, 12 questions) — all 3 published
- KB admin pipeline: full ingest + revisions + publish flow works
- TTX: scenario/session/conduct/participate/AAR all implemented
- NavShell: back-to-public "← Public site" link in sidebar footer; light/dark theme toggle in top bar (sun/moon icon, persists to localStorage)
- NeuralBackground: canvas particle network (gold/amber, mouse interaction) renders on all public pages and auth pages (`/login`, `/register`, etc.)

### Learner
- OTP login: works end-to-end with Mailpit (check `http://localhost:8025`)
- LearnDashboard: real module list — Alex sees 1, Sam sees 3
- LearnModule: forward-only flow (overview → briefing → checkpoint → debrief) — fully operational
- t1 module: 5 study tasks, 15 practice questions, full KB articles, reference materials
- t2 module (BEC and Payment Protection): 3 study tasks + 5 reference items, 12 practice questions
- t3 module (Account Security and MFA): 3 study tasks + 4 reference items, 12 practice questions
- Access gate: Eva hits "Choose a Package" correctly
- **KB Help panel**: collapsible help search (Individual+) in briefing + debrief screens — calls `GET /learn/modules/:id/help?q=...`, shows KB title/excerpt/topic cards. NOT available during checkpoint to prevent answer-spoonfeeding.
- **Remediation display**: after wrong answers, debrief shows KB item cards (title + excerpt + topics) from `remediationItems[]`. Falls back to plain topic links if no FTS chunks found. Question-specific explanation is primary; KB excerpt is fallback.
- **Reference materials**: module overview shows faq/glossary-term/policy/threat-brief KB items as collapsible "Reference Materials" section.

### TTX
- TTX has structural KB grounding now: `ttx_scenario_kb_refs` table links scenarios/steps/injects to KB items.
- `GET /ttx/participate/:id/view` returns `kbRefs[]` — scenario-level + current-step KB items, enriched with title/excerpt/topics.
- Participant side panel shows "KB Reference Material" section when kbRefs exist.
- Admin KB ref management: `GET|POST|DELETE /ttx/scenarios/:id/kb-refs` — link published KB items to a scenario (optionally scoped to a step or inject).
- Admin UI: KB References panel at bottom of `TtxScenarioEdit.tsx` — FTS search, select item, scope to step, add/remove refs.

### Public Site
- All pages: landing, about, capabilities, enterprise, packages, register, login, privacy, terms
- Contact form: real API call
- Register + Login: fully functional OTP flow

---

## What Is Broken, Missing, or Fake

### Fixed This Pass

| Area | Fix | File |
|------|-----|------|
| TTX backend gate incomplete | `requireTtxAccess` only blocked `individual`, not `free`. Free-tier users could join TTX at the API level. Fixed to block everyone except `professional` and `paid`. | `backend/src/routes/ttx/participate.ts` |
| Access-overrides comment stale | POST route comment listed `'free'\|'paid'` as valid tiers; actual validTiers array was correct. Comment updated to match. | `backend/src/routes/admin/access-overrides.ts` |
| requirePaidAccess error message vestigial | Message said "Complete the assessment to request access" — referencing a removed flow. Updated to honest message. | `backend/src/routes/learn/modules.ts` |

### Explicitly Deferred

| Area | Issue | Decision |
|------|-------|----------|
| Access service Priority 2 (latent bug) | If an `individual` learner's override is revoked, they fall through to "has module assignment → professional" and are silently upgraded. Override check (Priority 1) prevents this for all current bootstrap users. | **Defer** — no active impact. Fix when admin override management is formalized. |
| Access service Priority 3 (latent bug) | Group→package tier lookup hardcodes `'professional'` regardless of `packages.tier`. No `packageGroupAssignments` are seeded, so this never fires. | **Defer** — no active impact. Fix when group-package assignments are used in production. |
| Group-based TTX entitlement | `packageGroupAssignments` has no TTX-specific field. All non-Professional learners blocked from TTX regardless of group. Current behavior is correct and honest. | **Explicitly out of scope** — no schema change needed until a group-based TTX entitlement product decision is made. |
| AI-assisted guidance layer | No route, service, or DB table. Concept only. Will be gated at Professional+ when built. | **Future** — do not build until scoped separately. |
| Admin accounts hardcoded | 4 admin emails hardcoded in source. Workaround: code change. | **Defer** — low priority, no evaluation impact. |

### Not Issues (Correct Behavior)

| Area | Notes |
|------|-------|
| Eva's OTP | Eva can log in via OTP and hits the access gate immediately. This is the designed free-tier experience. |
| Alex blocked from TTX | Alex is Individual tier. TTX correctly blocked at backend and frontend. |
| Sam can access TTX | Sam is Professional tier. Access correctly granted. |

---

## Data Summary (Bootstrap-owned rows)

| Table | Bootstrap rows | Notes |
|-------|---------------|-------|
| learning_modules | 5 | t1, t2-bec, t3-mfa, t4-invoice-fraud, t5-ransomware — all published |
| kb_items | ~28 | t1: 5; t2-bec: 8; t3-mfa: 7; t4: 3; t5: 3; legacy t2: 2 |
| kb_revisions | ~28 | one per KB item |
| lesson_content_links | ~32 | see module seed scripts for breakdown |
| quiz_candidates (promoted) | ~130 | t1: ~26, t2-bec: ~26, t3-mfa: ~25, t4: ~24, t5: ~24, legacy t2: 2 |
| content_chunks | 22 | one chunk per KB item — FTS works for all 3 modules |
| topics | 9 | phishing, freight-security, link-verification, incident-response, ransomware, mobile-scams, bec-fraud, password-security, mfa |
| topic_relationships | 32 | seeded by bootstrap |
| ttx_scenario_kb_refs | 3 | BEC scenario (bec-freight-payment-hijack) → freight-bec-map, bec-indicator-library, bec-in-freight. Run bootstrap to populate. |
| ttx_scenarios | 1 | bec-freight-payment-hijack — 1 section, 1 step |
| learners | 3 | eva, alex, sam |
| access_overrides | 2 | alex=individual, sam=professional; eva=none |
| groups | 2 | transport-ops, freight-security |
| group_members | 3 | eva+alex in transport-ops, sam in freight-security |
| module_assignments | 4 | alex→t1, sam→t1+t2-bec+t3-mfa |
| learner_progress | 3 | alex t1 started, sam t1 completed, sam t2 started |
| practice_attempts | 1 | sam t1 attempt (12/15, 80%, passed) |
| admin_users | 4 | seeded from ADMIN_PASSWORD on server startup |

---

## Key Files

| Asset | Path |
|-------|------|
| Bootstrap script | `backend/scripts/bootstrap-local-proof.ts` |
| npm script | `npm run --prefix backend bootstrap` |
| Local-proof access doc | `docs/local-proof-access.md` |
| Learner module flow | `src/pages/LearnModule.tsx` |
| Access gate | `src/components/FreeTierGate.tsx` |
| Packages page | `src/pages/public/PackagesPage.tsx` |
| NavShell (back-to-public) | `src/components/layouts/NavShell.tsx` |
| App routes | `src/App.tsx` |
| Auth routes | `backend/src/routes/auth/auth.ts` |
| Access overrides route | `backend/src/routes/admin/access-overrides.ts` |
| Learn service | `backend/src/services/learn/learn.service.ts` |

---

## Local Environment

| Service | Address |
|---------|---------|
| Postgres | localhost:5433, DB five_eyes_v2 |
| Backend | localhost:3001 |
| Frontend | localhost:5173 |
| Mailpit | localhost:8025 / SMTP 1025 |
| Admin login | /admin/login |
| Learner login | /login |
