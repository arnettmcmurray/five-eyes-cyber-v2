# 2026-03-15 — Learner dashboard from real progress

## Files changed
- `backend/src/services/learn/progress.service.ts` — ProgressEntry: +score, +total, +lastAttemptAt
- `backend/src/routes/learn/modules.ts` — enriched module fields; nextRecommendedId server logic
- `src/api/client.ts` — LearnModulesResponse type; LearnModuleWithProgress: +inProgress/score/total
- `src/pages/LearnHub.tsx` — sectioned dashboard with next call-out, states, scores

## Behavior
- Dashboard sections: up-next callout, in-progress, available, completed (with scores), locked
- nextRecommendedId: admin nextModuleId → in-progress → first available (server-computed)
- Typechecks clean
