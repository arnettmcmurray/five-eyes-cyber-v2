# KB / Retrieval / Content Grounding Pass — 2026-03-23

## What Was Done

Three phases of the KB / Retrieval / Content Flow Audit & Build Plan were executed to close gaps between what was promised (KB-grounded learner experience) and what was actually wired up.

---

## Phase A — Frontend Dead-Code Gaps (LearnModule.tsx only)

**A1 — KB Help panel wired**
- `GET /learn/modules/:id/help?q=...` existed in the backend but was never called from the frontend.
- Added `HelpPanel` component to `LearnModule.tsx` — collapsible, Enter-key support, shows KB title/excerpt/topic cards.
- Available in BriefingScreen and DebriefScreen. Explicitly NOT in CheckpointScreen to prevent answer-spoonfeeding.

**A2 — Remediation display fixed**
- Backend returned `remediationItems[]` (title + 300-char excerpt + topics) after wrong answers. Frontend was discarding it.
- Added `RemediationSection` component — renders KB item cards. Falls back to plain topic search links if no items (empty FTS).
- Fixed explanation priority: question-specific `explanation` is now primary; KB excerpt is fallback. Was backwards before.

**A3 — References section added**
- `faq`, `glossary-term`, `policy`, `threat-brief` type KB items were being fetched into `references[]` by backend but never displayed.
- Added `ReferencesSection` to module overview screen — collapsible, shows type badge, title, excerpt, topics.

---

## Phase B — Backend Retrieval Truth Fixes

**B1 — Bootstrap KB items seeded with content_chunks + topics**
- Bootstrap script bypasses the ingestion pipeline → no `content_chunks`, `topics`, or `topic_relationships` created.
- Seeded: 6 topics, 12 topic_relationships, 7 content_chunks (one per bootstrap KB item, full content).
- FTS now works for local-proof learners (Alex, Sam) on the help endpoint.
- Used `ON CONFLICT (slug) DO NOTHING` + slug-based ID resolution to handle pipeline-created same-slug topics safely.

**B2 — Module-scoped retrieval added**
- `KBRetrievalService.retrieve()` now accepts `moduleId` (optional).
- When provided: searches chunks scoped to items linked via `lesson_content_links` first.
- Falls back to global search if scoped returns 0 hits.
- `GET /learn/modules/:id/help` now passes `moduleId` to scope results to the current module.

**B3 — `learnerVisible` enforced**
- `kb_items.learner_visible` (default `false`) was never checked in learner-facing queries.
- Added `eq(kbItems.learnerVisible, true)` filter to `getModuleStudy()` in `learn.service.ts`.
- Added `AND ki.learner_visible = true` to the FTS query in `retrieval.service.ts`.
- Bootstrap explicitly sets `learnerVisible: true` on all 7 items — no disruption.

---

## Phase C — TTX KB Grounding (structural link, no AI guidance)

**C1 — `ttx_scenario_kb_refs` table added**
- TTX schema had zero FK or soft reference to `kb_items`, `topics`, or `kb_revisions`.
- Added `ttx_scenario_kb_refs` table: `(id, scenario_id FK, step_id nullable FK, inject_id nullable FK, kb_item_id, added_by, added_at)`.
- Schema pushed to DB via `npm run db:push`.
- Admin endpoints added to `scenarios.ts`: `GET|POST|DELETE /ttx/scenarios/:id/kb-refs`.
  - POST validates KB item is published. Returns enriched ref (title + excerpt + topics).
  - GET returns all refs for a scenario, enriched.
  - DELETE scoped to scenarioId + refId.

**C2 — KB refs surfaced in participant view**
- `GET /ttx/participate/:sessionId/view` now returns `kbRefs[]`.
- Fetches all KB refs for the scenario, filters to: scenario-level refs (no stepId/injectId) + refs matching the current step.
- Enriches with KB item title, 300-char excerpt, and topics.
- Added `TtxKbRef` type to `src/api/client.ts`, added `kbRefs: TtxKbRef[]` to `TtxParticipateView`.
- Added "KB Reference Material" section to TTX participant side panel — renders when `kbRefs.length > 0`.

---

## What Remains (not in this pass)

- Phase D: `guidance_sessions` + `guidance_messages` tables (AI guidance prerequisites, schema only)
- Phase E: AI-assisted guidance layer (future, Professional-gated)
- Admin UI for linking KB items to TTX scenarios (currently API-only)
- Group-based TTX entitlement (not in scope here)

---

## TypeScript Status

Both `npx tsc --noEmit` (frontend) and `cd backend && npx tsc --noEmit` (backend) pass clean after all changes.

---

## Addendum — Local-Proof TTX Seed (same date, later pass)

The `ttx_scenario_kb_refs` table still had 0 rows because the bootstrap script seeded no TTX data. Added to `bootstrap-local-proof.ts`:

- **ttx_scenarios**: `bec-freight-payment-hijack` (ID `jj000001`)
- **ttx_scenario_sections**: Initial Compromise (ID `jj000002`)
- **ttx_scenario_steps**: Payment Redirection Request (ID `jj000003`)
- **ttx_scenario_kb_refs** (3 rows, scenario-scoped):
  - `jj000004` → `aa000001` (freight-bec-map)
  - `jj000005` → `aa000002` (bec-indicator-library)
  - `jj000006` → `aa000005` (bec-in-freight threat-brief)

IDs use `jj` prefix — `cc` prefix was already reserved for group members.

Bootstrap verified: clean first run, idempotent second run. DB confirmed 3 rows in `ttx_scenario_kb_refs`, scenario present by slug.
