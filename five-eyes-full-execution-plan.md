# Five Eyes — Full Execution Plan From Here

Last updated: March 20, 2026

## Ground truth

This is **not** full public launch yet.

Current truth:
- Core learner/module spine exists and is wired through T1–T10.
- KB content/search works.
- Governance backend exists.
- Governance admin UI is functionally complete for current scope.
- Admin auth is password-only.
- Non-admin auth is OTP-only.
- AWS target is **staging-style first**, editable while frontend/design continues.
- SES is intended for OTP/notifications.
- DNS provider is Ionos and client can create a `platform` subdomain.
- Stripe remains on test keys for now.
- No broad redesign reset.
- No TTX full build yet.
- No game work right now.
- KB is the primary truth source; AI is backup only.

## What happens next

The next move is **not** “do AWS only.”

The real next move is:

1. lock current app truth
2. run smoke validation on what already exists
3. prepare AWS staging shell
4. only then start narrow TTX v1 planning/build
5. only after that, do style pass tied back to prior design direction

That order matters. Otherwise you end up polishing assumptions.

---

# Phase 0 — Working rules

## Do now
- keep admin as the control center
- keep KB/governance as the source of truth
- keep auth split strict
- keep changes narrow and testable
- keep staging lightweight and editable

## Do not do now
- no full TTX system
- no game overhaul
- no broad redesign reset
- no fake analytics polish
- no broad refactors
- no duplicate/temp/backup files
- no “looks done” mock behavior
- no public launch framing

---

# Phase 1 — Lock current truth in repo

## Goal
Make the repo say the same thing the team is saying out loud.

## Required files
Create or update:

- `docs/current-truth.md`
- `docs/aws-staging-plan.md`
- `docs/smoke-test-checklist.md`
- `docs/ttx-v1-boundary.md`
- `out/current-state.md`
- `out/history/YYYY-MM-DD-HHMM.md`

## Contents for `docs/current-truth.md`
Must state clearly:
- admin = password only
- learner/non-admin = OTP only
- `user.tier` is the source of truth for access (`admin|free|individual|premium`)
- free users only get landing + email assessment funnel
- paid users get learning / KB help / assigned training
- KB/governance gates must stay enforced
- AWS is staging first, not public go-live
- styling is not first priority
- TTX is a narrow v1 slice later, not a broad system now

## Claude/Gemini prompt for this phase
```text
Create/update the following files with tight, current-truth content only:
- docs/current-truth.md
- docs/aws-staging-plan.md
- docs/smoke-test-checklist.md
- docs/ttx-v1-boundary.md

Rules:
- reflect current Five Eyes truth only
- do not broaden scope
- do not implement TTX
- do not do style work
- keep each file practical and short
- update out/current-state.md
- append a timestamped note to out/history/
Return only:
- completed
- working
- next
```

## Done when
- repo documents match actual plan
- no major ambiguity remains about auth, staging, KB truth, or TTX timing

---

# Phase 2 — Smoke-test the app you already have

## Goal
Prove the current build is real before cloud debugging muddies the water.

## Smoke path checklist

### Admin auth
- admin login works via password only
- admin is blocked from OTP-only learner flow
- admin lands in admin dashboard
- refresh preserves admin context

### Learner auth
- non-admin OTP send works
- OTP login works
- learner logout works
- learner cannot access admin routes
- refresh preserves learner context

### Learner flow
- modules load
- quizzes load
- weak-answer path gives useful feedback
- result/failure flow teaches, not dead-ends
- progress persists

### KB/Governance flow
- learner sees only learner-safe content
- draft content is not exposed
- publish without lineage is blocked
- publish with lineage works
- governance pages load

### Admin truth
- admin sees real score/progress reflections
- admin data is not fake/stubbed
- content control pages load
- package/pricing/content control routes behave

## Claude/Gemini prompt for this phase
```text
Run a focused smoke-truth pass on the current app.

Check only:
- admin password auth
- learner OTP auth
- module/quiz flow
- KB/governance protections
- admin data truth
- progress persistence

Rules:
- no broad refactors
- no TTX work
- no style pass
- no analytics polish
- if a flow is broken, fix only the direct blocker
- log each issue briefly in out/current-state.md
- append out/history/ before stopping

Return only:
- completed
- working
- next
```

## Done when
- core paths are verified or directly fixed
- you are not guessing what is real

---

# Phase 3 — AWS staging prep

## Goal
Stand up a **staging-style** AWS path without treating it like public production.

## Target stack
- ECR
- ECS Fargate
- RDS PostgreSQL
- SES
- lightweight/staging-safe resource sizing

## Required decisions/info
- AWS region
- SES verified identity/domain status
- SES sandbox status
- ECR repo
- ECS cluster/service/task definition path
- RDS creation path
- `platform` subdomain/DNS plan from Ionos
- required env vars

## Required env vars
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `ADMIN_PASSWORD`
- `AWS_REGION`
- `SES_FROM_EMAIL` or equivalent
- `ANTHROPIC_API_KEY` only if ingest is enabled in staging
- any OTP/notification settings actually used by backend

## Deliverables
Create/update:
- `docs/aws-staging-plan.md`
- `docs/aws-env.md`
- `docs/deploy-checklist.md`

## AWS task order
1. create/update staging docs
2. confirm env var list
3. build backend/container image path
4. build frontend/container/static hosting path as currently appropriate
5. prepare RDS postgres
6. prepare SES identity
7. wire subdomain/DNS plan
8. deploy staging stack
9. run smoke test in staging

## Claude/Gemini prompt for this phase
```text
Prepare the repo and docs for AWS staging only.

Target:
- ECR
- ECS Fargate
- RDS PostgreSQL
- SES
- staging-safe resource usage

Do:
- create/update docs/aws-staging-plan.md
- create/update docs/aws-env.md
- create/update docs/deploy-checklist.md
- identify missing env/config assumptions
- identify fresh-boot/staging portability risks
- keep this staging-first, not public launch

Do not:
- treat this as full production hardening
- do broad feature work
- do TTX build
- do style work

Update:
- out/current-state.md
- out/history/<timestamp>.md

Return only:
- completed
- working
- next
```

## Done when
- staging path is documented and executable
- env truth is explicit
- no major hidden local-only assumptions remain

---

# Phase 4 — Staging deployment + smoke validation

## Goal
Get the current app into AWS staging and prove it behaves there.

## Tasks
1. deploy backend to ECS/Fargate
2. connect RDS
3. configure env vars/secrets
4. configure SES/test sender
5. deploy frontend in the chosen staging path
6. point staging URL/subdomain
7. run smoke checklist again in staging

## Required validation
- app boots cleanly
- DB migrations succeed
- auth split still holds
- KB/governance gates still hold
- learner flow works
- admin flow works
- no redirect loops
- no cloud-only surprises

## Claude/Gemini prompt for this phase
```text
Move the current app into AWS staging and validate it there.

Rules:
- staging only
- keep resource usage light
- no broad feature work
- no TTX implementation
- no style pass

Do:
- deploy the current app
- verify env/config
- run the smoke checklist in staging
- record any cloud-specific breakage precisely
- fix only direct blockers to staging truth

Always update before stopping:
- out/current-state.md
- out/history/<timestamp>.md

Return only:
- completed
- working
- next
```

## Done when
- staging is live and editable
- smoke path is proven there
- the app is stable enough to keep building against

---

# Phase 5 — TTX v1 planning, not fantasy

## Goal
Define the first real TTX slice without letting it swallow the project.

## TTX v1 boundary
TTX v1 is:
- admin-managed
- single-user first
- one scenario first
- 3–5 injects
- structured responses
- saved results
- admin reviewable
- KB-backed first, AI backup only

TTX v1 is not:
- multiplayer
- giant AI orchestration
- full facilitator suite
- scenario marketplace
- heavy analytics
- polished game system

## Required files
- `docs/ttx-v1-spec.md`
- `docs/ttx-data-model.md`
- `docs/ttx-route-map.md`
- `docs/ttx-scenarios/ransomware-logistics-v1.md`

## Minimum objects
- `ttx_scenarios`
- `ttx_injects`
- `ttx_sessions`
- `ttx_responses`
- `ttx_results`

## Claude/Gemini prompt for this phase
```text
Start TTX only as a narrow v1 planning lane.

Create:
- docs/ttx-v1-spec.md
- docs/ttx-data-model.md
- docs/ttx-route-map.md
- docs/ttx-scenarios/ransomware-logistics-v1.md

Rules:
- no TTX implementation yet
- no multiplayer
- no broad AI orchestration
- KB-first, AI backup only
- keep scope narrow and buildable
- update out/current-state.md
- append out/history/ before stopping

Return only:
- completed
- working
- next
```

## Done when
- TTX is defined sharply enough for implementation
- no major scope ambiguity remains

---

# Phase 6 — TTX v1 thin vertical slice

## Goal
Build one working TTX flow after staging is stable.

## Required sequence
1. schema/types
2. migrations
3. backend routes/services
4. learner TTX flow pages
5. admin scenario/review pages
6. KB-grounded feedback
7. local smoke
8. staging smoke

## Suggested API surface
### Learner
- `GET /api/ttx/scenarios`
- `GET /api/ttx/scenarios/:id`
- `POST /api/ttx/sessions`
- `GET /api/ttx/sessions/:id`
- `POST /api/ttx/sessions/:id/responses`
- `POST /api/ttx/sessions/:id/complete`
- `GET /api/ttx/sessions/:id/results`

### Admin
- `GET /api/admin/ttx/scenarios`
- `POST /api/admin/ttx/scenarios`
- `PATCH /api/admin/ttx/scenarios/:id`
- `GET /api/admin/ttx/sessions`
- `GET /api/admin/ttx/sessions/:id`

## Claude/Gemini prompt for this phase
```text
Implement TTX v1 as a thin vertical slice only.

Build:
- one scenario
- 3–5 injects
- learner run flow
- saved session responses/results
- admin review path
- KB-backed feedback first

Rules:
- no multiplayer
- no broad authoring studio
- no heavy analytics
- no style pass
- fix only what supports the thin slice
- always update out/current-state.md and out/history/

Return only:
- completed
- working
- next
```

## Done when
- one scenario runs end-to-end
- admin can review results
- KB remains the primary truth source

---

# Phase 7 — Style pass returns

## Goal
Reconnect to the prior design direction only after the flow is real.

## What gets styled first
- learner dashboard clarity
- learner module/quiz/result flow
- learner TTX landing + session + results
- admin control hub clarity
- admin TTX scenario/session review
- content control pages

## Rules
- do not redesign the whole product
- use the previous design direction as a reference, not a prison
- clarity first
- calm, credible, controlled feel
- no visual polish that hides broken logic

## Claude/Gemini prompt for this phase
```text
Do a selective style and UX clarity pass only after core flows are real.

Focus on:
- learner clarity
- admin control clarity
- TTX thin slice clarity
- keeping the prior design vibe where it still fits

Do not:
- reset the whole design
- add flashy effects
- style fake or unfinished flows
- change architecture during style work

Update:
- out/current-state.md
- out/history/<timestamp>.md

Return only:
- completed
- working
- next
```

## Done when
- the app feels intentional again
- style supports the workflow instead of dressing a corpse

---

# Execution order summary

## Start now
1. Phase 1 — lock truth in repo
2. Phase 2 — smoke-test current reality
3. Phase 3 — AWS staging prep
4. Phase 4 — AWS staging deploy + smoke
5. Phase 5 — TTX v1 planning
6. Phase 6 — TTX v1 thin slice
7. Phase 7 — selective style pass

## Hard priority stack
1. truth
2. smoke
3. staging
4. TTX boundary
5. TTX slice
6. style

---

# Daily working loop

At the end of every work block:
1. update `out/current-state.md`
2. append `out/history/<timestamp>.md`
3. list:
   - completed
   - working
   - next

That prevents the repo from becoming a haunted house where only yesterday’s you knows the floor plan.

---

# What to tell Claude or Gemini first

Use this first:

```text
Continue from the current Five Eyes state.

Priority order from here:
1. lock current truth in repo docs
2. run smoke-truth pass on current core flows
3. prepare AWS staging docs/env/deploy checklist
4. move into AWS staging and validate
5. only after staging is real, start narrow TTX v1 planning
6. then implement one TTX thin slice
7. then do a selective style pass

Rules:
- no broad redesign reset
- no full TTX system yet
- no game work
- no analytics styling
- no fake placeholder progress
- no broad refactors
- always update out/current-state.md and out/history/ before any stop

Return only:
- completed
- working
- next
```

---

# Bottom line

**AWS staging is the next major step, but not by itself.**
The real next move is:
- truth lock
- smoke truth
- staging prep
- staging deploy
- then TTX
- then style

That is the clean road from here.
