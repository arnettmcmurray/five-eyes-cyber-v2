# Implementation Plan — Five Eyes v2
_Updated: 2026-03-23 | Planning mode active — design strategy pass complete_

---

## Mode: Planning Only

Implementation is paused. The prior functional pass is complete and committed (`b6363e2`).
Next work is a design/styling pass executed against the strategy document.

**Strategy document:** `docs/design/2026-03-23-layout-style-strategy.md`

---

## Completed Functional Work

| Pass | Commit | What |
|------|--------|------|
| Local-proof bootstrap | b6363e2 | Seeded learners, access, groups, modules, progress, KB items/chunks |
| Tier enforcement | b6363e2 | Individual vs Professional enforced at backend + frontend |
| KB Grounding A–C | b6363e2 | Stateless KB retrieval, TTX KB refs, Help panel, remediation, reference materials |
| Module expansion T1–T3 | b6363e2 | t1-phishing (5 tasks, 15q), t2-bec (3+5, 12q), t3-mfa (3+4, 12q) |
| Admin controls | b6363e2 | Grant/Revoke access, live health ping, groups tab, TTX KB refs admin UI |
| Public site | b6363e2 | All pages, PublicLayout, NeuralBackground, LoginPage/RegisterPage, OTP flow |

---

## Deferred Implementation (Not Yet Built)

| Area | Notes |
|------|-------|
| Group-based TTX entitlement | `packageGroupAssignments` exists but no TTX-specific field. Individual blocked regardless of group. Schema addition when needed. |
| AI-assisted chat/guidance layer | Concept defined (session memory, quiz context, wrong-answer guidance, TTX assistance). No route, service, or DB table. Future — Professional+ when built. Do not confuse with KB/question/chat (stateless retrieval, Individual+). |
| Admin account management | 4 emails hardcoded. Low priority. |

---

## Next Pass: Design / Styling

Execution order from `docs/design/2026-03-23-layout-style-strategy.md`:

### Batch 1 — Token Foundation
Verify CSS variables in `src/index.css`. Confirm Tailwind config alignment. Confirm Inter + Barlow Condensed loaded. Prerequisite for all other batches.

### Batch 2 — Public Shell
PublicLayout + NeuralBackground → Nav + Footer → LandingPage → About → Capabilities → Packages → Enterprise → Login/Register → Legal.

### Batch 3 — NavShell + Shared App Components
Sidebar, topbar, theme toggle, shared card/badge/button primitives.

### Batch 4 — Learner Shell
LearnDashboard → LearnModule (full flow) → FreeTierGate → KB Help panel.

### Batch 5 — Admin Shell
AdminDashboard → AdminProgress → KB admin pages → TTX admin pages.

### Batch 6 — TTX Shell
TtxConduct → TtxParticipate → TtxAAR → access-blocked screen.

---

## Stitch Usage Plan

Use Stitch for visual exploration on:
1. LandingPage hero (highest visual ambiguity)
2. PackagesPage tier cards
3. LearnDashboard module grid
4. AdminDashboard KPI cards
5. TtxParticipate full-screen view

Stitch must be constrained to the token set and tone defined in the strategy doc.
See Section 7 of the strategy document for full constraints and review criteria.

---

## Local Environment (Unchanged)

| Service | Address |
|---------|---------|
| Postgres | localhost:5433, DB five_eyes_v2 |
| Backend | localhost:3001 |
| Frontend | localhost:5173 |
| Mailpit | localhost:8025 / SMTP 1025 |
| Admin login | /admin/login |
| Learner login | /login |
