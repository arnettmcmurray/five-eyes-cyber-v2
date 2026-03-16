# 2026-03-16 — Operational Data Setup & UI Polish Pass 2

## Goal
Close remaining admin data-linking/content setup gaps so the product is operationally complete locally.

## Changes

### Backend bug fix — quiz candidates vanish after promote
**File:** `backend/src/services/learn/learn.service.ts`

`getModuleContent` and `checkPractice` both queried `status = 'approved'` only.
After a candidate is promoted, status becomes `promoted`, silently removing it from the practice pool.

Fix: added `or(eq(quizCandidates.status, 'approved'), eq(quizCandidates.status, 'promoted'))` in both queries.
Also imported `or` from `drizzle-orm`.

### Module content linked
- Phishing 101: linked Phishing Awareness (primary, order 0) + MFA item (reference, order 1)
- Phishing 101: 3 quiz candidates approved
- Spear Phishing 201: prerequisite set to Phishing 101
- testlearner assigned to both modules; locktest assigned only to Spear Phishing 201 → confirmed locked
- Practice POST verified: 2/2, 100%, full per-question breakdown with remediation data
- Module chain: Phishing 101 next_module_id → Spear Phishing 201

### KBAdmin.tsx — Field hint + actor display
- `Field` component updated: accepts optional `hint?: string`, renders as `<p class="text-xs text-gray-400">` above children
- URL ingest tab: Field now uses hint prop for "Fetches the page content…" guidance
- Actor ("Ingested by") changed from editable input → read-only span; defaults to logged-in admin

### KBItemDetail.tsx — actor display
- Actor changed from editable input → read-only span matching KBAdmin pattern

### ModuleManager.tsx — content panel count + actor fields + empty state
- Content panel header: `Content: {title} ({n} items)` count added
- `addedBy` / `createdBy` use `getAdminUsername() ?? 'admin'` instead of hardcoded `'admin'`
- Empty state: actionable guidance with monospace + Add item hint

### AdminProgress.tsx — nav header
- Was a dead end with no navigation
- Added full nav header: ← KB / Modules / Assignments / Progress + Logout button with logged-in username

### AdminAssignments.tsx — nav header
- Same fix: ← KB / Modules / Progress links + Logout

### LearnModule.tsx — pointless ternary
- `{passed ? 'Back to Learning Hub' : 'Back to Learning Hub'}` → plain text

### Admin password fixes
- `arnettmcmurray@gmail.com` was on seed password → changed to `arnett-five-eyes-2026` via change-password API
- `darren.mott@fiveeyesltd.com` was on seed password → changed to `darren-five-eyes-2026` via change-password API
- All 4 accounts verified; see out/admin-credentials.md

## TypeScript
`npx tsc --noEmit` clean on both frontend and backend after all changes.

## Commits
- `e1e0c48` — Fix content linking, quiz flow, actor fields, and admin nav dead ends
- `a75cb92` — Fix Field hint prop, actor display, and module dropdown in KB admin UI
