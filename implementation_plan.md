# Implementation Plan

## Status: Local TTX Frontend Checkpoint REACHED (2026-03-22)

All primary objectives from the session brief have been proven locally.

---

## Completed This Session

### DONE: DB + Schema
- Dropped old TTX schema (`ttx_sessions`, `ttx_session_events`, etc.)
- Applied new Executive Standard TTX schema via `npm run db:push`
- Added `title` column to `ttx_exercise_runs`
- Fixed DB client SSL issue (was using SSL against local non-SSL Postgres)

### DONE: Email / OTP
- Installed Mailpit via Homebrew
- Configured `SMTP_HOST=localhost SMTP_PORT=1025` in backend `.env`
- OTP emails now delivered to Mailpit locally — no real email needed
- Admin emails blocked from OTP flow (400 error with guidance to use admin login)

### DONE: API Contract Fixes
- Fixed `step.prompt` → `step.title` naming across client types, API methods, TtxConduct.tsx, TtxScenarioEdit.tsx
- Fixed `TtxExerciseRun.title` — stored in DB, returned by sessions list/get
- Fixed participate `/view` endpoint: now returns `scenarioTitle` and `currentStep`
- Fixed inject advance: injects no longer overwrite `currentStepId`
- Fixed CORS origin mismatch (5175 → 5173)

### DONE: Flagship Scenario Seeded
- Scenario: "Compromised at the Perimeter (Executive Edition)"
- 3 sections, 4 steps, 3 injects seeded via API
- 1 active run created and proven

### DONE: Proof Walkthrough (all 8 proofs passed)
1. Learner OTP login via Mailpit — PROVEN
2. Admin password login — PROVEN
3. Admin email blocked from OTP — PROVEN
4. Facilitator opens TTX, scenario loads — PROVEN
5. Section/step progression visible — PROVEN
6. Inject progression — PROVEN
7. Participant responds, response persists — PROVEN
8. Action Catalog / AAR from real data — PROVEN

---

## Next Phase

### Phase 5 (remaining)
- [ ] **5A: Frontend Deploy**: Build frontend, deploy to S3/CloudFront
- [ ] **5B: End-to-End Staging Smoke**: Full TTX flow on staging

### Phase 6
- [ ] **6A: Design Pass**: Apply Five Eyes high-fidelity visual direction

---

## Running Services Checklist (local)
```
mailpit                    # localhost:8025 (UI), 1025 (SMTP)
cd backend && npm run dev  # localhost:3001
cd .. && npm run dev       # localhost:5173
```

## Test Credentials (local only)
- Admin: arnettmcmurray@gmail.com / changeme
- Learner OTP: any non-admin email → check Mailpit at localhost:8025
