# Tasks 13-14: Remediation Refinement + Prerequisite Curation (2026-03-15)

## Task 13: Learner feedback/remediation refinement
- `learn.service.ts` `checkPractice()`: after grading, collects wrong-answer topics, fetches published KB items tagged with those topics (excluding the wrong item itself), returns up to 4 as `remediationItems`
- `PracticeResult` now includes `remediationItems: RemediationItem[]`
- `LearnModule.tsx` `RemediationScreen`: renders suggested reading items from `remediationItems` at top, then KB freeform help search below

## Task 14: Module prerequisite/admin curation refinement
- `ModuleService.getDependents(id)` — reverse lookup: modules that list `id` as a prerequisite
- `GET /kb/modules/:id/dependents` route added
- `api.modules.dependents(id)` added to client
- `PrerequisiteManager` in `ModuleManager.tsx`:
  - Loads dependents alongside prereqs via `Promise.all`
  - Renders read-only "Required by:" section listing dependent module titles
- `LearnModule.tsx` `LockedScreen`:
  - Fetches `api.learn.prerequisites(id, learnerId)` to get prereqs with `completed` booleans
  - Shows each prereq with ✓/✗ indicator and link to incomplete ones

## Typechecks
- Frontend (`tsconfig.app.json`): clean
- Backend: clean
