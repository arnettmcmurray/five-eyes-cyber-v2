# Gate 2 — Data Integrity and Input Validation Hardening (2026-03-16)

## Fixes Applied

### 1. `routes/admin/packages.ts` — Critical DELETE bug + audit fields
- **DELETE /admin/packages/:id/modules/:moduleId**: was `eq(packageModules.packageId, req.params.id)` — deleted ALL modules from a package when removing one. Fixed: `and(eq(packageModules.packageId, req.params.id), eq(packageModules.moduleId, req.params.moduleId))`.
- POST /: `createdBy` now from `req.adminUsername` (not client body)
- POST /:id/groups: `assignedBy` now from `req.adminUsername` (not client body)

### 2. `routes/admin/assignments.ts` — Audit field
- POST /: `assignedBy` now from `req.adminUsername` (not client body); removed from required field check

### 3. `routes/admin/content-blocks.ts` — Audit field
- POST /: `createdBy` now from `req.adminUsername` (not client body); removed from required field check (`!slug || !title` only)

### 4. `routes/admin/access-overrides.ts` — Audit field + date validation
- POST /: `grantedBy` now from `req.adminUsername` (not client body); removed from required field check
- `expiresAt` validated before `new Date(expiresAt)`: `isNaN(expiresAtDate.getTime())` → 400 with clear message
- `onConflictDoUpdate` also uses `grantedBy: adminUsername`

### 5. `routes/ttx/scenarios.ts` — Enum validation + parent ownership
- POST injects: `injectType` validated against `['legal', 'media', 'technical', 'customer', 'other']` → 400 on invalid
- PATCH injects: same enum validation on update
- POST injects: `targetRoles` validated as array before `JSON.stringify`; PATCH same
- POST steps: verifies section exists before inserting step (404 if section not found)
- POST injects: verifies step exists before inserting inject (404 if step not found)

### 6. `routes/ttx/sessions.ts` — Enum validation + date validation
- POST /: `scheduledAt` validated with `isNaN(d.getTime())` → 400 if invalid
- PATCH action-items: `status` validated against `['open', 'closed', 'retesting']` → 400 on invalid
- POST/PATCH action-items: `dueAt` validated via shared `parseDateField()` helper → 400 if invalid

### 7. `validation/kb.schemas.ts` — Ingest size caps
- `ingestManualSchema.content`: added `.max(500_000)` (500K chars)
- `ingestFileSchema.rawContent`: added `.max(1_000_000)` (1M chars)

## Confirmed Clean

| Check | Verdict |
|-------|---------|
| All audit trail fields (`assignedBy`, `createdBy`, `grantedBy`) from `req.adminUsername` | ✓ Fixed |
| DELETE /admin/packages/:id/modules/:moduleId — correct AND condition | ✓ Fixed |
| `expiresAt` date inputs validated before construction | ✓ Fixed |
| `scheduledAt` on session creation validated | ✓ Fixed |
| `dueAt` on action items validated | ✓ Fixed |
| `injectType` enum enforced on create and update | ✓ Fixed |
| `targetRoles` type (array) validated before stringify | ✓ Fixed |
| `status` on action items enum-enforced on update | ✓ Fixed |
| Session state machine (planned → active → ended) enforced server-side | ✓ Already correct |
| TTX cascade deletes on schema | ✓ Already correct |
| Ingest content size limits added | ✓ Fixed |
| `npx tsc --noEmit` — no errors | ✓ Clean |

## Remaining Gaps (require schema migration or provider integration)

1. **`ttxSessions.currentInjectId` has no FK constraint** — if an inject is deleted, `currentInjectId` becomes a dangling reference. Requires a schema migration to add the FK. Low-severity for current use (injects are not deleted during active sessions), but worth a migration before launch.

2. **`createItemSchema.createdBy` and other `performedBy`/`uploadedBy` fields in KB schemas are client-supplied strings** — not validated against actual admin usernames. The KB routes are all behind `requireAdmin`, so the caller is authenticated, but the audit string isn't pulled from `req.adminUsername`. Lower priority than access/assignment audit fields (KB is internal tooling, not access control), but should be addressed before launch.

3. **Module progress `score` field accepts any number** — no min/max validation in `learn/modules.ts` practice route. Consider clamping to 0–100.
