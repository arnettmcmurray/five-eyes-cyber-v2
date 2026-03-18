# 2026-03-15 — Learner progress tracking + prerequisite enforcement

## Files created
- `backend/src/db/schema/learner-progress.ts` — learner_progress table with upsert-safe unique constraint
- `backend/src/services/learn/progress.service.ts` — recordStart, recordCompletion, getProgress, getCompletedSet
- `src/lib/learnerId.ts` — localStorage UUID per browser

## Files modified
- `backend/src/db/schema/index.ts` — learner-progress export
- `backend/scripts/db-push.sh` — learner-progress.ts in FILES
- `backend/src/services/learn/learn.service.ts` — prereq enforcement in getModuleStudy; learnerId in checkPractice
- `backend/src/routes/learn/modules.ts` — learnerId query param, progress enrichment, start recording
- `src/api/client.ts` — LearnModuleWithProgress type; learnerId params
- `src/pages/LearnHub.tsx` — locked/unlocked/completed cards
- `src/pages/LearnModule.tsx` — learnerId wired; friendly locked error screen

## What it does
- Practice passing (≥70%) records completion; below 70% records start only
- Modules with unmet prerequisites show as locked in hub and return 403 on direct access
- Progress persists per-browser via localStorage UUID
- Both frontend and backend typecheck clean
