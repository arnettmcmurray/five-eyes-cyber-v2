# TTX AI Assist — Tightened (2026-03-15)

## New scenario creation flow
- `TtxScenarios.tsx` `create()`: if objective present, navigates to `/ttx/scenarios/:id?draft=ai`
- `TtxScenarioEdit.tsx`: `useSearchParams` detects `?draft=ai` in `load()` after scenario fetched
  - Auto-calls `draftScenarioWithAI(title, objective)` once (guarded by `autoDraftTriggered` ref)
  - Clears `?draft=ai` from URL immediately via `setSearchParams({}, { replace: true })`
  - `draftScenarioWithAI` now accepts optional override args for the auto-trigger path

## AI assist boundaries
- Both `/ttx/assist/*` endpoints: `requireAdmin` middleware, no learner path possible
- Server-side logging: `logAssist(adminUsername, endpoint, input)` → stdout with ISO timestamp
  - stepPrompt truncated to 100 chars in log to avoid log bloat
- Missing API key: throws at `getClient()`, returns 500 with `ANTHROPIC_API_KEY is not set` message
- No auto-save: all paths require explicit facilitator action (click "Add section" or "Use" + "Add Inject")

## AI session badges (minimal history/context)
- `aiCreated: Set<string>` state tracks IDs created from AI this session
- `applyDraftSection`: adds section.id, step.ids, inject.ids to `aiCreated`
- `injectFromAI` ref: set by `applyInjectSuggestion`, consumed by `addInject` to tag the resulting ID
- Render: `{aiCreated.has(x.id) && <span>✦ AI</span>}` on section title, step prompt, inject body row
- Session-only (no DB column, no persistence) — resets on page reload
