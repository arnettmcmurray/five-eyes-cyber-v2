# 2026-03-15 — Identity-bound learner progress

## What changed
- `backend/src/db/schema/learners.ts` — new: learners table (id, handle unique, createdAt)
- `backend/src/db/schema/index.ts` — added learners export
- `backend/src/services/learn/learner.service.ts` — new: findOrCreate(handle), validate(learnerId)
- `backend/src/routes/learn/identify.ts` — new: POST /learn/identify
- `backend/src/app.ts` — mount /learn/identify before /learn/modules
- `backend/src/routes/learn/modules.ts` — requireLearner middleware replaces anonymous fallback; all routes 401 without valid learnerId
- `src/api/client.ts` — api.learn.identify; learnerId required on all learn.* calls
- `src/lib/learnerId.ts` — read/write only; no self-generation; clearLearnerId exported
- `src/pages/LearnHub.tsx` — IdentifyForm shown when no identity stored; Switch learner button
- `src/pages/LearnModule.tsx` — navigates to /learn if no learnerId; uses non-null assertion after guard

## Behavior now
- Server issues learnerId via POST /learn/identify — client never generates its own
- Backend validates every learnerId against learners table before processing progress
- No anonymous access; no unlocked-by-default fallback
- Both typechecks clean

## Still temporary
- No password/token — identity by handle claim only (dev-grade)
