# Tasks 23-25 Enforcement Pass (2026-03-15)

## Task 23: Paid/Free Access Gating — Enforced

**AccessService** (`backend/src/services/access/access.service.ts`):
- `getLearnerTier(learnerId)` → 'free' | 'paid'
- Priority: access_overrides (with expiry check) → direct module_assignments → group → package_group_assignments → 'free'

**requirePaidAccess middleware** (inline in `routes/learn/modules.ts`):
- Applied via `router.use(requireLearner, requirePaidAccess)`
- Free learners: 403 `{ error: '...', tier: 'free' }`

**`GET /access/tier`** — real implementation (reads Bearer token → learnerId → tier)

**`/admin/access`** CRUD (real, not stubs):
- `GET /admin/access` — list overrides
- `POST /admin/access` — upsert override (learnerId, tier, grantedBy, reason, expiresAt?)
- `DELETE /admin/access/:learnerId` — revoke

## Task 24: Email Assessment Funnel — Minimal Real Implementation

**Routes** (`/access/assessment/*`):
- `POST /access/assessment/start { email }` — idempotent; creates assessment_leads; logs token to stdout
- `GET  /access/assessment/:token` — returns hardcoded 5-question form; marks 'started'
- `POST /access/assessment/:token { answers }` — saves answers as JSON string; marks 'completed'
- Does NOT create learner_sessions or grant any access
- follow_up_enabled=true by default on all leads (ready for email reminders)

## Task 25: Admin Content-Control — Complete (from prior sub-batch)
- content_blocks CRUD at /admin/content-blocks (kind: landing|library-link|news)
- packages.priceCents / packages.tier / packages.public columns
- PATCH /admin/packages/:id

## TTX Direction Doc
- `out/ttx-mvp-direction.md` — derived from reference/TTX_examples/deep-research-report.md
- Covers: roles, scenario structure (section/step/inject), backend objects, manual vs AI split, build constraints
- NOT implemented. Branch: feature/ttx-core

## Typechecks: frontend + backend clean
