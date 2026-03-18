# TTX Frontend (2026-03-16)

## Pages Added (all on feature/ttx-core)

### /ttx/scenarios — TtxScenarios.tsx
- Lists all scenarios (title, slug, created date)
- Create new scenario inline form (slug, title, description, objective)
- Delete scenario
- Links to scenario edit, session list

### /ttx/scenarios/:id — TtxScenarioEdit.tsx
- Edit scenario title/description/objective inline
- Add/delete sections
- Add/delete steps (prompt + facilitator notes)
- Add/delete injects (body, type, target roles, suggested timing)
- Full nested tree view matching backend structure
- Inject type badges (media=yellow, technical=blue, legal=purple, other=gray)

### /ttx/sessions — TtxSessions.tsx
- Lists all sessions with status badge (planned/active/ended)
- Create new session (select scenario, title, optional scheduled datetime)
- Links to console (active) or view (planned/ended)

### /ttx/sessions/:id — TtxConsole.tsx (Facilitator Console)
- Start / End session controls
- Current inject panel (highlighted in blue)
- Full inject list — Deliver button per inject (disabled if already active)
- Delivered injects shown as dimmed
- Log event form (decision/note/action, actor handle, linked inject selector)
- Participant join form (handle + role)
- Live participant list
- Event log with auto-scroll (color-coded by type)
- Link to AAR when session ended

### /ttx/sessions/:id/aar — TtxAAR.tsx
- Session metadata summary grid
- Participant list
- Full event timeline (color-coded)
- AAR content editor (summary, strengths, improvements)
- Finalize AAR (marks as final, locks editing)
- Action items CRUD (add, close, retest)
- Link to raw export JSON

### /ttx/sessions/:id/participate — TtxParticipant.tsx
- Join screen (handle + role, no admin token needed for UX)
- Waits for session to start
- Current inject displayed prominently (role highlighting if targeted)
- Submit response form (decision/note/action linked to current inject)
- My responses log
- Full session event log (auto-scrolls)
- Session ended message when done
- Polls every 5s during active session for updates

## API Client (client.ts)
- All TTX types added: TtxScenario, TtxScenarioDetail, TtxSection, TtxStep, TtxInject, TtxSession, TtxSessionDetail, TtxParticipant, TtxEvent, TtxAAR, TtxActionItem, TtxExport
- api.ttx.scenarios.* — full CRUD + sections/steps/injects
- api.ttx.sessions.* — list/get/create/start/end/advance/join/submitEvent/export
- api.ttx.sessions.aar.* — get/save/finalize/addActionItem/updateActionItem

## Routes (App.tsx)
- /ttx/scenarios
- /ttx/scenarios/:id
- /ttx/sessions
- /ttx/sessions/:id
- /ttx/sessions/:id/aar
- /ttx/sessions/:id/participate

## Build
- Frontend: 51 modules, vite build clean ✓
- Backend typecheck: clean ✓
- Dead code in scenarios.ts GET handler cleaned up ✓

## Not Yet Done (Phase 2)
- Participant auth via learner OTP with TTX session flag
- Real-time push (polling at 5s for now)
- PDF export
- AI assistance
