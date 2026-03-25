# Implementation Plan — Five Eyes v2
_Updated: 2026-03-24 | Logic pass complete. T4+T5 seeded. Question depth expanded (+29q). Learner routes wired. Styling pass in progress (public shell done)._

**Canonical truth:** `docs/design/full-build-status-checklist.md` — read before any implementation, planning, or deploy decision.

---

## Current Mode: Planning Only

Implementation and styling are paused. The logic pass is complete. The next session should begin styling execution against the design strategy document.

**Design strategy document:** `docs/design/2026-03-23-layout-style-strategy.md`

---

## Completed Functional Work

| Pass | What |
|------|------|
| Local-proof bootstrap | Seeded learners, access, groups, modules, progress, KB items/chunks |
| Tier enforcement | Individual vs Professional enforced at backend + frontend |
| KB Grounding A–C | Stateless KB retrieval, TTX KB refs, Help panel, remediation, reference materials |
| TTX local-proof seed | BEC scenario + 3 KB refs seeded in bootstrap — KB Reference panel now testable |
| Module expansion T1–T3 | t1-phishing (5 tasks, 15q), t2-bec (3+5, 12q), t3-mfa (3+4, 12q) |
| Admin controls | Grant/Revoke access, live health ping, groups tab, TTX KB refs admin UI |
| Public site | All pages, PublicLayout, NeuralBackground, LoginPage/RegisterPage, OTP flow |

## Completed Logic Pass (2026-03-23)

| Fix | File |
|-----|------|
| TTX backend gate: free tier now blocked (was only blocking individual) | `backend/src/routes/ttx/participate.ts` |
| Access-overrides POST comment corrected (was listing wrong valid tiers) | `backend/src/routes/admin/access-overrides.ts` |
| requirePaidAccess error message updated (removed vestigial "assessment" text) | `backend/src/routes/learn/modules.ts` |

---

## Explicitly Deferred (Documented in out/current-state.md)

| Area | Reason |
|------|--------|
| Access service Priority 2 latent bug | No active impact. Fires only if override revoked for user with module assignments. Deferred until admin override management is formalized. |
| Access service Priority 3 latent bug | No active impact. No packageGroupAssignments seeded. Deferred until group-package assignments used in production. |
| Group-based TTX entitlement | No product decision made. Current behavior (Professional-only TTX) is correct and honest. |
| AI-assisted guidance layer | Future feature. No route/service/DB. Will be scoped separately. |
| Admin hardcoded emails | Low priority. Requires code change to add admins. No evaluation impact. |

---

## Design Planning Status

Design strategy is complete. Document at `docs/design/2026-03-23-layout-style-strategy.md` covers:
- Shared design system (typography, spacing, color hierarchy, surfaces, motion, badges)
- Public shell layout strategy
- Learner shell layout strategy
- Admin shell layout strategy
- TTX shell layout strategy
- Styling execution order (Batches 1–6)
- Stitch usage strategy with constraints and review criteria

---

## Next Pass: Design / Styling Execution

Execute in this order:

### Batch 1 — Token Foundation (prerequisite)
Verify CSS variables in `src/index.css`. Confirm Tailwind config alignment. Confirm Inter + Barlow Condensed loaded.

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

Use Stitch for visual exploration on these screens only, with locked constraints (see strategy doc Section 7):
1. LandingPage hero
2. PackagesPage tier cards
3. LearnDashboard module grid
4. AdminDashboard KPI cards
5. TtxParticipate full-screen view

Stitch output is spatial reference only — not a final design. Never override the token set.

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
