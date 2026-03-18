# Batch 26 — Security Pass (2026-03-16)

## Admin Credentials Secured
- `out/admin-credentials.md` excluded via `out/.gitignore`
- Verified: `git check-ignore` confirms file is ignored

## Full Paid Learner Path (smoke test)
- OTP request → verify → session token ✓
- Tier via direct module_assignment = 'paid' ✓
- GET /learn/modules returns module list with lock/progress state ✓
- GET /learn/modules/:id returns module + studyItems/references/practiceQuestions ✓
- GET /learn/modules/:id/prerequisites → [] (none set) ✓
- GET /learn/modules/:id/help?q= → { query, confidence, band, hits } ✓
- POST /learn/modules/:id/practice → { score, total, percentage, results, remediationItems } ✓
- learner_progress row created with status='started' ✓
- Admin progress view: GET /admin/progress/learners/:id shows module progress ✓
- Admin module view: GET /admin/progress/modules/:id shows learner list ✓

## Admin Assignment Flow
- POST /admin/assignments assigns module to learner ✓
- Module must be published for learner to see it (GET /kb/modules/:id/publish) ✓
- Second module with prerequisite shows `locked: true` until first completed ✓
- GET /learn/modules/:id/prerequisites shows prerequisite + completed status ✓

## Package-Based Access
- Group + group_members + package_group_assignments → tier='paid' ✓
- Removing group_member → tier reverts to 'free', /learn/modules → 403 ✓
- All 3 access paths confirmed: override, direct assignment, package-group

## Session/Security Tightening

### New: Logout endpoints
- POST /auth/logout — invalidates learner session token (deletes from DB) ✓
- POST /admin/profile/logout — invalidates admin session token ✓

### Fixed: changePassword invalidates all sessions
- `AdminAuthService.changePassword` now deletes all admin_sessions for the user after hash update ✓
- Verified: old token 401s after password change ✓

### Role separation verified
- Learner Bearer token hitting /admin/* → 401 (not 403) ✓
- No token hitting /admin/* → 401 ✓
- No API key → 401 on all non-health routes ✓
- /health bypasses API key check (by design) ✓

## Typecheck
- backend: clean ✓
