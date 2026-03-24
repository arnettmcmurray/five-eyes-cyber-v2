# Session Note — Logic Pass + Design Planning
_Date: 2026-03-23_

---

## Logic Pass — What Was Fixed

### Bug: TTX backend access gate incomplete
**File:** `backend/src/routes/ttx/participate.ts`
**Problem:** `requireTtxAccess` checked `if (tier === 'individual')` — only blocking `individual`. A `free`-tier learner (no package) could call `/ttx/participate/:id/join` and be admitted if they had a session token and knew the session ID.
**Fix:** Changed to `if (tier !== 'professional' && tier !== 'paid')` — blocks everyone except the two tiers that include TTX access. Error response now includes the actual tier value for debugging.

### Minor: Access-overrides POST comment stale
**File:** `backend/src/routes/admin/access-overrides.ts`
**Problem:** Comment on POST route listed `'free'|'paid'` as valid tiers. The actual `validTiers` array was already correct (`['free', 'individual', 'professional', 'paid']`).
**Fix:** Comment updated to match the array.

### Minor: requirePaidAccess error message vestigial
**File:** `backend/src/routes/learn/modules.ts`
**Problem:** Error for `free`-tier learners said "Complete the assessment to request access" — referencing a removed onboarding flow that no longer exists.
**Fix:** Updated to "A training package is required to access modules. Contact your administrator to request access."

---

## What Was Explicitly Deferred

### Access service Priority 2: module assignment → professional (latent bug)
`getLearnerTier()` Priority 2: if a learner has any module assignment, returns `'professional'`. With explicit overrides in place (Priority 1), this never fires for current bootstrap users. But if an `individual` learner's override is revoked, they'd be silently upgraded via their module assignments.
**Decision:** Defer. No active impact. Fix when admin override management is formalized.

### Access service Priority 3: group package tier ignored (latent bug)
`getLearnerTier()` Priority 3: returns `'professional'` for any learner in a group with a package assignment, regardless of the package's actual `tier` field. No `packageGroupAssignments` are seeded, so this never fires.
**Decision:** Defer. No active impact. Fix when group-package assignments are used in production.

### Group-based TTX entitlement
No TTX-specific entitlement field on packages or group assignments. Current behavior: Professional tier = TTX access, everything else = no TTX. This is correct and honest product behavior.
**Decision:** Explicitly out of scope. No schema change needed until a group-based TTX product decision is made.

### AI-assisted guidance layer
No route, service, or DB table exists. Concept is documented. Will be gated at Professional+ when built.
**Decision:** Future. Do not build until scoped separately.

### Admin hardcoded emails
4 admin emails hardcoded in source. Adding admins requires a code change.
**Decision:** Defer. Low priority. No evaluation impact.

---

## Design Planning Status

A layout/style strategy document was produced in the prior session (also 2026-03-23) and is ready for use:

**Document:** `docs/design/2026-03-23-layout-style-strategy.md`

Covers:
- Shared design system direction (typography, spacing, color hierarchy, surfaces, motion, NeuralBackground scope, status/badge language)
- Public shell layout strategy (nav, footer, hero, all pages, NeuralBackground integration, image treatment)
- Learner shell layout strategy (dashboard, module flow states, KB Help panel, remediation, reference materials, FreeTierGate)
- Admin shell layout strategy (KPI cards, learner table, groups tab, KB admin, TTX admin, NavShell context, light mode)
- TTX shell layout strategy (conduct view, participate view, AAR, operational register, access-blocked screen)
- Styling execution order (Batches 1–6 with dependencies)
- Stitch strategy (constraints, which screens, accept vs override, review criteria)

---

## Current Product State After This Pass

- All three real tiers (free, individual, professional) are correctly enforced at backend and frontend
- TTX backend gate now correctly blocks free tier in addition to individual
- Error messages are honest and do not reference removed features
- Four latent/future issues are explicitly documented and deferred
- Design strategy is ready for styling execution
- No styling has been started

---

## Next

Begin styling execution:
1. Batch 1: Token foundation (`src/index.css` + Tailwind config)
2. Batch 2: Public shell (PublicLayout, Nav, Footer, all public pages)
3. Stitch for visual exploration on 5 designated screens (constrained by strategy doc Section 7)
