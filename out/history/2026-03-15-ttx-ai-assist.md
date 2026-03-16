# TTX AI Assist Layer — 2026-03-15

## What was built

### Backend: `backend/src/routes/ttx/assist.ts`
Two endpoints behind `requireAdmin`:

**POST /ttx/assist/scenario**
- Input: `{ title, objective }`
- Calls claude-opus-4-6 with structured prompt
- Returns draft `{ sections[{ title, steps[{ prompt, facilitatorNotes, injects[] }] }] }`
- Returns 500 with clear message if ANTHROPIC_API_KEY not set

**POST /ttx/assist/injects**
- Input: `{ stepPrompt, scenarioContext?, count? }`
- Returns `{ injects[{ body, injectType, targetRoles, suggestedTimingMinutes }] }`
- Defaults to 3 suggestions

### Backend: `backend/src/app.ts`
- Imported and mounted `ttxAssistRouter` at `/ttx/assist` behind `requireAdmin`

### Frontend: `src/api/client.ts`
- Added `api.ttx.assist.draftScenario()` and `api.ttx.assist.draftInjects()`
- Added types: `TtxDraftInject`, `TtxDraftStep`, `TtxDraftSection`, `TtxDraftScenario`

### Frontend: `src/pages/TtxScenarioEdit.tsx`
- "✦ Draft structure with AI" button on scenario meta (only visible when objective is set)
- AI draft panel: shows collapsible view of suggested sections, each with "Add section" button
  - Clicking "Add section" creates the section + all steps + all injects via API calls sequentially
- "✦ Suggest injects" button on each step header
- Inject suggestions panel: shows 3 suggested injects, each with "Use" button
  - "Use" pre-fills the inject form for facilitator review/edit before saving
- Errors shown inline; dismiss button on draft panels

## Design decisions
- Manual-first: AI output is always a suggestion. Nothing is applied without facilitator action.
- AI uses claude-opus-4-6 for quality; both endpoints are synchronous (no streaming needed for admin tool)
- ANTHROPIC_API_KEY read from environment at request time; missing key returns actionable 500 error
- Key NOT committed; placeholder added to backend/.env

## Setup required
Add to `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```
Then restart backend.
