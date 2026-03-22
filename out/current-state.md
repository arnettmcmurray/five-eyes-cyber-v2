# Current State Audit - Frontend Reality

This document summarizes the actual functional state of the Five Eyes frontend as of 2026-03-22.

## 1. Working (Wired to Backend)

### Learner Flow
- **Authentication**: OTP request and verification (wired in `LearnHub.tsx` and `TtxParticipate.tsx`).
  - Mailpit is configured for local OTP delivery. SMTP_HOST=localhost SMTP_PORT=1025 in backend/.env.
  - Admin emails are blocked from OTP flow with a 400 error.
- **Hub**: Module listing with progress status (Started, Completed, Locked) and prerequisite checks.
- **Module Experience**: Full study-to-practice flow. Supports content roles (prereq/primary), references, and module-specific KB search.
- **Practice & Grading**: Multiple-choice assessment with instant grading and remediation (topic/KB recommendations).
- **Session Management**: Persistent learner tokens and handles in `localStorage`.

### Admin Flow
- **Authentication**: Password-based login and session management.
- **KB Management**: Full listing, status/type filtering, and ingestion (Manual, File, and URL triggers).
- **Progress Tracking**: Holistic views of learner progress "By Learner" and "By Module" (Detailed scores and activity timestamps).
- **Content Governance**: Draft/Review/Publish workflows and version lineage tracking.

### TTX Flow — PROVEN LOCAL CHECKPOINT (2026-03-22)
- **Schema**: Executive Standard schema (`ttx_exercise_runs`, `ttx_run_events`, `ttx_run_participants`, `ttx_action_items`, `ttx_scenario_sections`, `ttx_scenario_steps`, `ttx_injects`) applied to local DB.
- **Facilitator Conduct Mode**: `TtxConduct.tsx` — loads run detail, shows section/step hierarchy, delivers narrative, deploys injects, captures action items. Auth-guarded (admin token).
- **Participant Situation Room**: `TtxParticipate.tsx` — OTP-based learner auth, join with role, view narrative/inject feed, submit decisions/notes. Backend view endpoint returns `scenarioTitle` and `currentStep`.
- **Action Catalog / AAR**: `TtxAAR.tsx` — loads real action items from run data, supports adding/updating items, export, and finalize.
- **Flagship Scenario**: "Compromised at the Perimeter (Executive Edition)" seeded in local DB with 3 sections, 4 steps, 3 injects.
- **Routes**: All TTX routes integrated in `App.tsx`. Conduct Mode is full-screen (no NavShell). Participate is full-screen.

---

## 2. Known Issues Fixed This Session
- DB client had `ssl: { rejectUnauthorized: false }` which failed against local Postgres. Fixed with `DB_SSL=true` env flag.
- TTX schema was never migrated to local DB (was on old `ttx_sessions` schema). Pushed new Executive Standard schema.
- `step.prompt` vs `step.title` naming mismatch: DB/backend uses `title`, frontend used `prompt`. Fixed in client types, API methods, and all frontend pages.
- `TtxExerciseRun.title` field: added `title` column to `ttx_exercise_runs` schema and backend session create handler.
- Participate view endpoint missing `scenarioTitle` and `currentStep`. Fixed in backend route.
- Inject advance was overwriting `currentStepId` with inject ID. Fixed — injects don't change currentStepId.
- CORS origin mismatch (`.env` had 5175, Vite runs on 5173). Fixed.
- Mailpit not installed or configured. Installed via Homebrew, configured via SMTP_HOST in backend/.env.

---

## 3. Local Environment State (2026-03-22)
- Postgres: localhost:5433, DB five_eyes_v2, schema fully migrated
- Backend: localhost:3001 (tsx watch, backend/.env)
- Frontend: localhost:5173 (Vite)
- Mailpit: localhost:8025 (UI), localhost:1025 (SMTP)
- Flagship scenario ID: 618aebb1-9b9e-4a7c-bb96-07f294290fdd
- Active run ID: 75acef10-8040-470a-aa3c-fec287255747 (status: active)

---

## 4. Next Steps
1. **Frontend Design Pass**: Apply Five Eyes high-fidelity visual direction to TTX pages and overall UI.
2. **Staging Deploy**: Build and deploy frontend to AWS S3/CloudFront.
3. **End-to-End Staging Smoke**: Verify full TTX flow on staging environment.
4. **Mailpit → SES cutover**: For staging, set `SES_FROM_ADDRESS` and remove `SMTP_HOST`.
