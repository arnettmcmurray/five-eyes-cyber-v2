# TTX Branch Planning (Task 25)

## What TTX Is
Tabletop Exercise (TTX) mode: a facilitated, scenario-driven simulation distinct from the KB/learning module system.
Kept strictly separate from the learner flow and KB admin.

## Planned Scope (not built yet)

### Schema (future branch)
- `ttx_scenarios`: id, slug, title, description, scenarioType, createdBy, createdAt
- `ttx_sessions`: id, scenarioId, facilitatorId, startedAt, endedAt, status
- `ttx_participants`: id, sessionId, handle, role, joinedAt
- `ttx_events`: id, sessionId, participantId, eventType, payload (jsonb), createdAt

### Roles
- Facilitator: creates + drives the session; controls scenario pace
- Participant: reads scenario injects, submits decisions
- Observer: read-only view

### Backend routes
- `POST /ttx/sessions` — create session from scenario
- `POST /ttx/sessions/:id/join` — participant join
- `GET  /ttx/sessions/:id/state` — current inject + responses
- `POST /ttx/sessions/:id/inject` — facilitator sends next inject
- `POST /ttx/sessions/:id/respond` — participant submits decision
- `POST /ttx/sessions/:id/end` — facilitator closes

### Frontend
- Facilitator console: session control panel, inject queue, live participant view
- Participant view: scenario feed, decision input
- Observer view: read-only stream

## Constraints
- TTX sessions are NOT connected to the learner progress/module system
- No KB search in TTX (separate knowledge surface if needed)
- Auth: facilitators are admins or elevated learners (TBD); participants use learner OTP auth
- No analytics or scoring requirements yet
- Build TTX in a feature branch — does not merge until schema + facilitator console + participant flow are all working end-to-end

## Next Step
When ready to build: create `feature/ttx-core` branch, implement schema + facilitator console first, then participant join flow.
