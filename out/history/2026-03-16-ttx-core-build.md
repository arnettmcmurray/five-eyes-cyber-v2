# TTX Core Build (2026-03-16)

## Branch
`feature/ttx-core` — created and active. Not merged to main.

## Schema (9 new tables — applied via db-push.sh)
- ttx_scenarios
- ttx_scenario_sections
- ttx_scenario_steps
- ttx_injects (targetRoles stored as JSON string)
- ttx_sessions (currentInjectId tracks live progress)
- ttx_session_participants (handle + role)
- ttx_session_events (inject_delivered | decision | note | action)
- ttx_after_action_reviews (draft → final lifecycle)
- ttx_action_items (open | closed | retesting lifecycle)

## Routes

### /ttx/scenarios (all requireAdmin)
- GET /ttx/scenarios — list all
- POST /ttx/scenarios — create
- GET /ttx/scenarios/:id — full nested (sections → steps → injects)
- PATCH /ttx/scenarios/:id — update title/description/objective
- DELETE /ttx/scenarios/:id
- POST /ttx/scenarios/:id/sections — add section
- PATCH /ttx/scenarios/:id/sections/:sectionId
- DELETE /ttx/scenarios/:id/sections/:sectionId
- POST /ttx/scenarios/:id/sections/:sectionId/steps — add step
- PATCH /ttx/scenarios/:id/sections/:sectionId/steps/:stepId
- DELETE /ttx/scenarios/:id/sections/:sectionId/steps/:stepId
- POST /ttx/scenarios/:id/sections/:sectionId/steps/:stepId/injects — add inject
- PATCH /ttx/scenarios/:id/sections/:sectionId/steps/:stepId/injects/:injectId
- DELETE /ttx/scenarios/:id/sections/:sectionId/steps/:stepId/injects/:injectId

### /ttx/sessions (all requireAdmin)
- GET /ttx/sessions — list
- POST /ttx/sessions — create (status: planned)
- GET /ttx/sessions/:id — detail with participants + event log
- POST /ttx/sessions/:id/start — planned → active
- POST /ttx/sessions/:id/end — active → ended
- POST /ttx/sessions/:id/advance { injectId } — set currentInjectId, log inject_delivered event
- POST /ttx/sessions/:id/join { handle, role } — idempotent (re-join updates role)
- POST /ttx/sessions/:id/events { eventType, actorHandle, body, linkedInjectId? } — log decision/note/action
- POST /ttx/sessions/:id/aar — create or update AAR
- GET /ttx/sessions/:id/aar — fetch AAR + action items
- PATCH /ttx/sessions/:id/aar/finalize — mark final
- POST /ttx/sessions/:id/aar/action-items — add action item
- PATCH /ttx/sessions/:id/aar/action-items/:itemId — update status/owner/evidence
- GET /ttx/sessions/:id/export — full export blob (session + scenario + participants + events + AAR + action items)

## End-to-End Smoke Test (all passing)
1. Create scenario ✓
2. Add section → step → inject (nested) ✓
3. GET scenario returns full nested tree ✓
4. Create session (planned) ✓
5. Start session → active ✓
6. Participant join ✓
7. Advance inject → currentInjectId set, inject_delivered event logged ✓
8. Submit decision event ✓
9. End session → ended ✓
10. Create AAR (draft) ✓
11. Add action item (open) ✓
12. Finalize AAR → final ✓
13. GET export → session + scenario + 1 participant + 2 events + AAR (final) + 1 action item ✓

## Typecheck: clean ✓

## Not Built (Phase 2)
- AI scenario generation
- AI inject drafting
- AI AAR drafting
- Frontend UI for facilitator console and participant view
- Participant auth (learner OTP with TTX session flag)
- PDF export
