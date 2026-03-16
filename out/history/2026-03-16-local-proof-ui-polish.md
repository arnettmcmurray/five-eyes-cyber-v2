# Local Proof & UI Polish Pass (2026-03-16)

## Objective
Full local browser walkthrough and presentability pass across all core product flows. Fix visible friction only — no new features.

## Flow Status

| Flow | Result |
|------|--------|
| Admin login | ✅ Works — fixed broken redirect to `/kb` |
| KB admin — list, filter, ingest | ✅ Works |
| KB item detail — view, edit, revisions, workflow | ✅ Works |
| KB search — full-text + quiz assist | ✅ Works |
| Topics — list, create | ✅ Works |
| Modules — list, create, edit, content, prereqs | ✅ Works |
| Admin progress — by learner, by module | ✅ Works |
| Admin assignments — assign learner to module | ✅ Works |
| Learner OTP login | ✅ Works |
| Learner hub — module list with progress state | ✅ Works |
| TTX scenarios — list, create, edit, AI draft | ✅ Works |
| TTX sessions — list, create | ✅ Works |
| TTX console — facilitator | ✅ Works |
| TTX participant | ✅ Works |
| TTX AAR | ✅ Works |

## Fixes

### Auth / Navigation
- **AdminLogin.tsx**: Fixed broken redirect after login — `navigate('/kb-admin')` → `navigate('/kb')`
- **AdminProfile.tsx**: Back link changed from `<button onClick>` to `<Link to="/kb">` for proper keyboard/right-click behavior

### Admin Nav Consistency
- **KBAdmin.tsx**: "Learner" nav link opens `/learn` in new tab (preserves admin session); "Log out" → "Logout" (no-wrap); slug truncated in list rows with title tooltip
- **KBSearch.tsx**: Added full admin nav bar (was a dead end — only had back link)
- **TopicManager.tsx**: Added full admin nav bar (was a dead end)
- **ModuleManager.tsx**: Back-link text standardised to "← Back to KB"

### Labels
- **KBSearch.tsx**: `FTS` → `Full-text`, `Quiz-aid` → `Quiz assist`

### Layout / Presentation
- **KBItemDetail.tsx**: "Contentv1" heading fixed — `Content` and version badge now in flex row with `gap-1.5`
- **AdminAssignments.tsx**: Added subtitle "Assign learners to modules to grant access and track progress."
- **TtxScenarioEdit.tsx**: Inject type badge on its own flex row, body text below (was inline/run-together)

### React / Logic Bugs
- **AdminProgress.tsx**: Fixed React key prop warning — both `.map()` callbacks used bare `<>` fragment with no key. Changed to `<Fragment key={...}>` (imported Fragment).
- **LearnHub.tsx**: Fixed duplicate module in recommended banner when it's already in the in-progress list.
- **AdminAssignments.tsx**: Replaced all hardcoded `fetch('/api/...')` calls with `api.assignments.*` from api/client.ts.

### UX Polish
- **LearnHub.tsx**: Removed dev-facing "Check server logs for the code during development" OTP step hint. Replaced with "Your code was sent. Check your inbox or contact your administrator."
- **TtxConsole.tsx**: Participant URL is now a clickable `<a>` link with a Copy button. Log Event button shows tooltip hint when actor/body fields are empty.

## Commits
- `0187f44` — "Polish UI: nav consistency, dev notes, inject display, React key fixes" (main batch)
- `cf47356` — "Fix AdminProfile back link — use Link instead of button"

## Known Gaps (not bugs — admin data entry needed)
1. Module content not linked — Phishing 101 exists but no KB items added to content list (admin task via Content panel in Modules)
2. No practice questions linked to modules — quiz candidates exist on KB items but need linking (admin task)
3. Email handle display — handles with `@`/`.` normalized to alphanumeric (cosmetically odd in tables, not a bug)
4. Single admin user — only one admin in DB; multi-admin workflows untested

## Artifacts
- `out/local-proof-status.md` — presentation-ready flow status table
