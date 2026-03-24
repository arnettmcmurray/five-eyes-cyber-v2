# Tier Enforcement Pass — 2026-03-23

## Summary

Real tier distinction between Individual and Professional enforced at backend + frontend.
Reload-free access activation added.

---

## Tier Model Now Enforced

| Tier | DB value | Training | KB/Q&A help | TTX |
|------|----------|----------|-------------|-----|
| No package | no override / `free` | ✗ | ✗ | ✗ |
| Individual | `individual` | ✓ | ✓ | ✗ (default) |
| Professional | `professional` | ✓ | ✓ | ✓ |
| Legacy | `paid` | ✓ | ✓ | ✓ |

---

## Task 1 — Tier Enforcement

### Backend changes

**`access.service.ts`**: Extended `AccessTier` type to `'free' | 'individual' | 'professional' | 'paid'`. The override priority path returns the actual stored tier string.

**`access-overrides.ts`**: Validation now accepts `['free', 'individual', 'professional', 'paid']`.

**`ttx/participate.ts`**: Added `requireTtxAccess` middleware. Blocks `'individual'` tier at the backend — `POST /ttx/participate/:id/join` returns 403 with message: "TTX access requires Professional package or group-based TTX entitlement."

### Frontend changes

**`TtxParticipate.tsx`**: Added `'ttx-blocked'` screen. After OTP auth (or on mount if authenticated), if learner is not yet a participant, checks tier via `GET /access/tier`. If Individual, shows TTX blocked screen with honest message and "View Packages" link. Backend also enforces this — blocked at both layers.

**`AdminProgress.tsx`**: Grant buttons now offer Individual and Professional separately. Active tier badge shows the tier name. Individual badge has an "↑ Pro" upgrade button.

**`bootstrap-local-proof.ts`**: Changed to `onConflictDoUpdate` for access overrides. Alex: `tier: 'individual'`. Sam: `tier: 'professional'`. Bootstrap re-run confirmed — tiers updated in DB.

---

## Task 2 — Reload-Free Activation

**`useLearnerTier.ts`**: Added `refresh()` function that clears the module-level cache and re-fetches from `GET /access/tier`. Returns `{ tier, loading, refresh }`.

**`App.tsx`**: `NavWrapper` passes `refresh` to `FreeTierGate`.

**`FreeTierGate.tsx`**: Added `onCheckAccess` prop. Shows "Access granted? Check now" button. Clicking it calls `refresh()` → tier re-fetched → if now `'individual'` or `'professional'`, NavWrapper renders `<Outlet />` immediately without a page reload.

---

## What "AI training" means here

No dedicated AI training route exists in the current codebase. The module learning flow is KB-based content. The help/Q&A within modules is the knowledge-based question/chat — accessible to all paid tiers including Individual. Future AI coaching routes will be gated at `professional+` when built.

---

## Group-based TTX entitlement

**Current gap**: `packageGroupAssignments` table exists but has no TTX-specific field. All Individual tier learners are blocked from TTX regardless of group membership. Noted in current-state.md. Not faked.

---

## Files changed

- `backend/src/services/access/access.service.ts`
- `backend/src/routes/admin/access-overrides.ts`
- `backend/src/routes/ttx/participate.ts`
- `backend/scripts/bootstrap-local-proof.ts`
- `src/hooks/useLearnerTier.ts`
- `src/App.tsx`
- `src/components/FreeTierGate.tsx`
- `src/pages/TtxParticipate.tsx`
- `src/pages/AdminProgress.tsx`
- `src/api/client.ts`
