# TTX Polish / Hardening (2026-03-16)

## Changes

### TtxSessions.tsx
- Action column label now status-aware: `Setup` (scheduled), `Console` (active), `View` (ended)
- "Copy join link" button added per row for non-ended sessions → `navigator.clipboard.writeText` participant URL

### TtxConsole.tsx
- Participant URL bar shown for non-ended sessions: origin + `/ttx/sessions/:id/participate` with Copy button
- SSE indicator dot now clickable (cursor-pointer when disconnected) → `connectSse()` on click

### TtxParticipant.tsx
- SSE dot clickable to reconnect (same pattern as console)
- OTP verify help text changed from `"(check server log in dev)"` → `"Enter it below."` (neutral, non-dev-facing)

### TtxAAR.tsx
- Fixed broken "View raw export JSON" link (pointed to non-existent frontend route `/ttx/sessions/:id/export`)
- Replaced with "Download export JSON ↓" button — downloads blob from already-loaded `exportData` state

### TtxParticipant.tsx (additional)
- Waiting-for-inject message now context-aware: "Waiting for next inject…" after first inject delivered vs. "Waiting for facilitator to deliver first inject…" at session start

## Verified
- TypeScript compile clean (no errors)
- All manual controls unaffected
- No auto-save or auto-publish introduced
