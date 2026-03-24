# Current State — Five Eyes v2
_Last updated: 2026-03-23 | Implementation complete through T3 modules + admin controls. Now in PLANNING MODE — design strategy pass._

---

## Local-Proof Accounts (Persistent)

| Account | Email | Access | Module State |
|---------|-------|--------|--------------|
| Eva Restricted | `eva.restricted@fiveeyes.dev` | No package → Access gate | No training |
| Alex Morgan | `alex.individual@fiveeyes.dev` | Individual — training + KB/chat, no TTX | t1 in progress |
| Sam Reeves | `sam.professional@fiveeyes.dev` | Professional — training + KB/chat + TTX | t1 completed 80%, t2 + t3 assigned |
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

| Area | Issue | Severity |
|------|-------|----------|
| Group-based TTX entitlement | Schema has `packageGroupAssignments` but no TTX-specific entitlement field. All Individual blocked from TTX regardless of group. | Low |
| AI-assisted guidance layer | Concept defined but no route, service, or DB table exists yet. Will be gated at Professional+ when built. `guidance_sessions` / `guidance_messages` schema not yet added (Phase D). | Future |
| Admin accounts | 4 emails hardcoded in source. Adding new admins requires code change. | Low |
| Eva's OTP | Eva can request an OTP and log in — she just hits the access gate immediately. This is correct behavior. | — |
| Bootstrap KB items FTS | Bootstrap seeded 7 content_chunks + 6 topics + 12 topic_relationships for local-proof accounts. Help search works for bootstrap learners. | Fixed |
| Group-based TTX entitlement (UI) | Admin can link KB refs to TTX steps/injects via `TtxScenarioEdit.tsx` UI panel. Group-based TTX entitlement still not implemented in schema — all Individual tier blocked. | Low |

---

## Data Summary (Bootstrap-owned rows)

| Table | Bootstrap rows | Notes |
|-------|---------------|-------|
| learning_modules | 3 | t1, t2-bec, t3-mfa — all published |
| kb_items | 22 | t1: 5 training-content; t2-bec: 3 training + 5 reference; t3-mfa: 3 training + 4 reference; legacy t2: 2 |
| kb_revisions | 22 | one per KB item |
| lesson_content_links | 22 | t1: 5 primary; t2-bec: 3 primary + 5 supplementary; t3-mfa: 3 primary + 4 supplementary; legacy t2: 2 |
| quiz_candidates (promoted) | 41 | 15 for t1, 2 for legacy t2, 12 for t2-bec, 12 for t3-mfa |
| content_chunks | 22 | one chunk per KB item — FTS works for all 3 modules |
| topics | 9 | phishing, freight-security, link-verification, incident-response, ransomware, mobile-scams, bec-fraud, password-security, mfa |
| topic_relationships | 32 | seeded by bootstrap |
| ttx_scenario_kb_refs | 0 | schema exists, no local-proof data seeded yet |
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
