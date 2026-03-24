# TTX End-to-End Smoke Pass — 2026-03-24

## What Was Tested

Full end-to-end smoke of the TTX participant path after the bootstrap TTX seed was added:

1. `npx tsx backend/scripts/bootstrap-local-proof.ts` — clean first run, idempotent second run
2. DB verified: 3 rows in `ttx_scenario_kb_refs`, 1 scenario (`bec-freight-payment-hijack`)
3. Admin UI: scenario visible in TTX Scenarios list; KB References panel shows all 3 items with title/excerpt/topic badges
4. Admin: created TTX session "BEC Smoke Test — 2026-03-24", initialized to `active`
5. Sam (`sam.professional@fiveeyes.dev`) logged in via OTP, joined session as Finance Director
6. Participant view: session header, role, KB Reference Material panel — all correct

---

## Bugs Found and Fixed

### Bug 1 — Bootstrap learner handle typo (critical)

**Root cause:** All 3 bootstrap learner handles used `fiveyesdev` (one `e`) but the email domain `fiveeyes.dev` normalizes to `fiveeyesdev` (double `e`) via `handle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')`.

When Sam tried to log in, OTP `findOrCreate` found no handle match → created a new learner record with no access override → FreeTierGate shown instead of dashboard.

**Fix:**
- Corrected all 3 handles in `backend/scripts/bootstrap-local-proof.ts`:
  - `evarestrictedfiveyesdev` → `evarestrictedfiveeyesdev`
  - `alexindividualfiveyesdev` → `alexindividualfiveeyesdev`
  - `samprofessionalfiveyesdev` → `samprofessionalfiveeyesdev`
- Direct DB `UPDATE` to fix the existing mismatched records
- `DELETE` of the spurious OTP-created learner (cascaded session delete)

**Impact:** All 3 bootstrap accounts now work correctly after bootstrap re-run.

---

### Bug 2 — SSE state event shape mismatch (crash in participant view)

**Root cause:** Backend SSE `/ttx/participate/:id/stream` sent the initial state as:
```json
{ "type": "state", "session": { ...sessionRow, "participants": [...], "events": [...] } }
```
`participants` and `events` were nested inside `session`.

The frontend `handleSseEvent` handler in `TtxParticipate.tsx` reads them at top level:
```typescript
setView(prev => prev ? { ...prev, session: data.session, participants: data.participants, events: data.events } : prev)
```
This made `participants` and `events` `undefined` in state, which then crashed on `participants.find()`.

**Fix** in `backend/src/routes/ttx/participate.ts`:
```typescript
// BEFORE
res.write(`data: ${JSON.stringify({ type: 'state', session: { ...detail[0], participants, events } })}\n\n`);

// AFTER
res.write(`data: ${JSON.stringify({ type: 'state', session: detail[0], participants, events })}\n\n`);
```

---

## Smoke Result

Participant view loaded correctly after both fixes:
- Session: "BEC Smoke Test — 2026-03-24" / "BEC Freight Payment Hijack"
- Role: Finance Director, Status: active
- KB Reference Material section (3 items):
  - "Where BEC Happens in the Freight Payment Cycle" (BEC and Payment Fraud, Freight Security)
  - "BEC Indicator Library: How to Recognize a Payment Fraud Attempt" (BEC and Payment Fraud)
  - "BEC in Freight: Factoring Fraud, Invoice Redirection, and Executive Impersonation" (BEC and Payment Fraud, Freight Security)
- Net Topology: `samprofessionalfiveeyesdev`

---

## Checklist Updates

- Section 5: TTX KB refs local-proof data → ✅ DONE
- Section 6: BEC scenario seeded → ✅ DONE
- Section 6: TTX run (admin UI) → ✅ DONE
- Section 6: SSE real-time updates → ✅ DONE (noted fix)
