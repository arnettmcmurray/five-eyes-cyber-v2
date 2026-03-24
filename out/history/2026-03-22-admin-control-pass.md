# Admin Control Pass — 2026-03-22

## What was done

Four tasks completed in a single pass.

### A1 — Grant Access UI
`AdminProgress.tsx` now loads access overrides in parallel with the learner list.
Per-row access column shows:
- "Activate Individual" button when no paid override exists
- "Active" badge + "Revoke" link when tier=paid

Calls real backend endpoints:
- `POST /admin/access { learnerId, tier:'paid' }` — grant
- `DELETE /admin/access/:learnerId` — revoke

State updates in-place after each call. No page reload needed.

### A2 — Live System Status
`AdminDashboard.tsx` calls `GET /health` on mount. The `/health` endpoint runs `SELECT 1` against the DB and returns `{ status:'ok', db:'ok' }` or 503.

Backend API and Database rows now show real green (pulse) or red (no animation, "Unreachable") based on actual response. Never shows green when the backend is unreachable.

### B1 — Learner KB Search nav removed
Removed `{ to: '/kb/search', label: 'Search KB' }` from `learnerLinks` in `NavShell.tsx`.

### B2 — Groups tab
Added "Groups" tab to `AdminProgress` that calls `GET /admin/progress/groups`. Shows group name, member count, completions, and average score.

## Access transition proof

With this change the full loop is unblocked:
1. Eva logs in → hits access gate (no paid override)
2. Admin opens `/admin/progress` → sees Eva with "Activate Individual" button
3. Admin clicks button → `POST /admin/access { learnerId: eva_id, tier:'paid' }` succeeds → button becomes Active
4. Eva refreshes browser (clears in-memory tier cache) → `GET /access/tier` returns `{tier:'paid'}` → NavWrapper renders `<Outlet>` → full platform access

## API surface added

```typescript
api.admin.access.list()                    // GET /admin/access
api.admin.access.grant(learnerId, tier)    // POST /admin/access
api.admin.access.revoke(learnerId)         // DELETE /admin/access/:learnerId
api.adminProgress.groups()                 // GET /admin/progress/groups
api.health.get()                           // GET /health
```
