# Implementation Plan — Post Tier-Enforcement Pass
_Date: 2026-03-23_

---

## Current State

Tier enforcement is now real. Individual and Professional are distinct at the DB, backend, and frontend levels. Reload-free activation works.

---

## Tier Model (Enforced Truth)

| Tier | DB value | Training | KB/question/chat | AI-assisted guidance | TTX |
|------|----------|----------|------------------|---------------------|-----|
| No package | `free` / no override | ✗ gate | ✗ | ✗ | ✗ |
| Individual | `individual` | ✓ | ✓ | ✗ default | ✗ default |
| Professional | `professional` | ✓ | ✓ | ✓ (when built) | ✓ |
| Legacy paid | `paid` | ✓ | ✓ | ✓ (when built) | ✓ |

---

## What Was Completed This Pass

| Task | Status |
|------|--------|
| T1 — Real tier enforcement (Individual vs Professional) | ✅ Done |
| T1 — TTX blocked for Individual at backend + frontend | ✅ Done |
| T1 — KB/Q&A help kept for Individual | ✅ Done |
| T2 — Reload-free access activation | ✅ Done |
| T3 — Docs updated | ✅ Done |

---

## Completed in Prior Passes

| Task | Status |
|------|--------|
| A1 — Admin Grant Access UI (Individual + Professional buttons) | ✅ Done |
| A2 — Admin System Status: live `/health` ping | ✅ Done |
| B1 — Learner Search KB nav removed | ✅ Done |
| B2 — Admin Groups tab in AdminProgress | ✅ Done |

---

## What Remains (Deferred)

| Area | Notes |
|------|-------|
| Group-based TTX entitlement | `packageGroupAssignments` has no TTX-specific field. Individual blocked from TTX regardless of group membership. Requires schema addition when needed. |
| AI-assisted chat/guidance layer | Concept: session memory, module/quiz context, wrong-answer guidance, TTX assistance. No route or service exists. Future — will be gated at Professional+ when built. Do not confuse with KB/question/chat (stateless retrieval, available now for Individual). |
| Admin account management | 4 emails hardcoded in source. Low priority. |
| Individual vs Professional content depth | Both tiers currently get identical module content. Distinction will matter when AI-assisted guidance layer is built. |

---

## Files Changed This Pass

| File | Action |
|------|--------|
| `backend/src/services/access/access.service.ts` | Added `'individual' | 'professional'` to `AccessTier` |
| `backend/src/routes/admin/access-overrides.ts` | Accept all four tier values |
| `backend/src/routes/ttx/participate.ts` | Added `requireTtxAccess` — blocks Individual at API level |
| `backend/scripts/bootstrap-local-proof.ts` | Alex=`'individual'`, Sam=`'professional'`, upsert on re-run |
| `src/hooks/useLearnerTier.ts` | Extended type, added `refresh()` |
| `src/App.tsx` | Pass `refresh` to FreeTierGate |
| `src/components/FreeTierGate.tsx` | Added "Check access" button via `onCheckAccess` prop |
| `src/pages/TtxParticipate.tsx` | Added `'ttx-blocked'` screen, tier check after auth |
| `src/pages/AdminProgress.tsx` | Individual/Professional grant buttons, tier badge |
| `src/api/client.ts` | Updated tier types on grant and AccessOverride |
