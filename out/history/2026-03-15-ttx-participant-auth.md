# TTX Participant Auth + SSE (2026-03-15)

## Completed

### Backend
- `backend/src/routes/ttx/participate.ts` — new router at `/ttx/participate`
  - `requireLearner` middleware: validates Bearer against `learner_sessions`, attaches `learnerId` + `learnerHandle`
  - `requireParticipant` middleware: checks `ttx_session_participants` for handle+sessionId
  - `POST /:sessionId/join { role }` — learner joins by authenticated handle
  - `GET /:sessionId/view` — returns session state, currentInject (resolved), participants, events, myHandle
  - `POST /:sessionId/respond { eventType, body }` — submit decision/note/action
  - `GET /:sessionId/stream` — SSE, token via ?token= query param
- `backend/src/app.ts` — added `/ttx/participate` (no requireAdmin); updated API key middleware to also accept `req.query['x-api-key']` for SSE EventSource compat
- TypeScript param fix: all `req.params['sessionId'] as string` casts to satisfy Drizzle type

### Frontend — src/api/client.ts
- Added `api.ttx.participate.{ join, view, respond, streamUrl }` — all use `req()` (learner Bearer)
- Added `api.ttx.sessions.streamUrl()` — admin Bearer SSE URL builder
- Added `TtxParticipateView` type: `{ session, scenarioTitle, participants, events, currentInject, myHandle }`

### Frontend — TtxParticipant.tsx (full rewrite)
- OTP flow: otp-request → otp-verify → join role → active session view
- Auth stored via `lib/session.ts` `setSession(token, handle)` — same as existing learner auth
- SSE via EventSource at `/ttx/participate/:id/stream?token=...&x-api-key=...`
- Handles: state, session_started, session_ended, inject_advanced, participant_joined, event_logged
- No polling — SSE only
- Deduplication: event_logged checks by id before appending

### Frontend — TtxConsole.tsx
- Added SSE connection via `connectSse()` after initial `load()`
- Handles all session events, deduplicates by id
- Admin token passed as ?token= to SSE stream endpoint
- Cleanup on unmount via `esRef.current?.close()`

## Access model (final)
- `/ttx/scenarios/*` — admin Bearer (requireAdmin)
- `/ttx/sessions/*` — admin Bearer (requireAdmin)
- `/ttx/participate/*` — learner Bearer (requireLearner; join additionally requireParticipant for view/respond/stream)
- AAR/export — admin only (behind requireAdmin on sessions routes)
- Participant never touches AAR endpoints

## Next
- End-to-end smoke test: OTP → join → facilitator delivers inject → participant sees it via SSE → respond
- Consider AI assist layer (inject drafting, scenario drafting) once auth/access verified

## Smoke Test Results (2026-03-16)

### Full path verified
1. OTP request (testlearner) → 204 ✓
2. OTP verify → learner token ✓
3. Participant join (planned session, role: Security Lead) → 201 ✓
4. Participant view (planned, no inject) → status: planned, currentInject: null ✓
5. Admin start session → status: active ✓
6. Admin deliver inject → currentInjectId set ✓
7. Participant view (active) → currentInject body + targetRoles + stepPrompt ✓
8. Participant respond (decision) → linked to inject ✓
9. Admin session view → inject_delivered + decision events both visible ✓
10. Admin end session → status: ended ✓
11. Create AAR, add action item, finalize → all clean ✓
12. Export → session/participants/events/aar/actionItems ✓
13. SSE: initial state event + session_started broadcast via curl ✓

### Auth break tests — all clean
- Learner token → /ttx/sessions → "Invalid or expired admin session" ✓
- Admin token → /ttx/participate/respond → "Invalid or expired session" ✓
- Invalid token → 401 ✓, No token → 401 ✓
- Participant → different session view → 403 ✓
- Participant → unjoined session respond → 403 ✓

### State machine break tests — all clean
- Start ended session → error ✓
- End ended session → error ✓
- Respond after end → error ✓
- Join ended session → error ✓
- Advance inject on ended session → error ✓
- Finalize already-final AAR → error ✓
- Add action item to final AAR → error ✓
- Learner POST AAR → "Invalid or expired admin session" ✓

### Fixes applied
- `sessions.ts` SSE: missing expiry check on learner token (gt(expiresAt, now) added)
- `TtxParticipant.tsx`: expired token in checkAlreadyJoined → clearSession + back to OTP screen
- `TtxConsole.tsx`: connectSse() only called after successful load
- Both pages: SSE connected indicator (green dot = live, yellow pulse = reconnecting)
