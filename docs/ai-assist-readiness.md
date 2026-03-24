# AI Assist — Readiness Note

## What is implemented

### Backend (`backend/src/routes/ttx/assist.ts`)
- `POST /ttx/assist/scenario` — given `{ title, objective }` → draft `{ sections[{ title, steps[{ prompt, facilitatorNotes, injects[] }] }] }`
- `POST /ttx/assist/injects` — given `{ stepPrompt, scenarioContext?, count? }` → `{ injects[{ body, injectType, targetRoles, suggestedTimingMinutes }] }`
- Both behind `requireAdmin` — participant access impossible
- `getClient()` throws with clear message if `ANTHROPIC_API_KEY` missing
- `extractError()` pulls inner Anthropic error message, not raw blob
- JSON parse failure → "AI returned unparseable response — try again"
- Shape validation: missing `sections` / `injects` array → actionable 500
- Request logging: `[ttx-assist] <iso> admin=<username> endpoint=<x> input=<json>`

### Frontend (`src/pages/TtxScenarioEdit.tsx`)
- "✦ Draft structure with AI" button on meta (gated: only when `scenario.objective` exists, not while `aiDrafting`)
- AI draft panel: collapsible, shows sections with preview, "Add section" applies one at a time
- "✦ Suggest injects" button per step, suggests 3 injects, "Use" pre-fills form for review
- `aiCreated` Set: tracks AI-origin IDs for session, shows `✦ AI` badge
- `aiError` shown inline; never blocks manual controls
- New scenario with objective → navigates to edit with `?draft=ai` → auto-triggers draft on load

## What is verified (no provider spend)

| Check | Result |
|-------|--------|
| No auth → 401 on both endpoints | ✓ |
| Fake learner token → 401 | ✓ |
| Missing required fields → 400 with clear message | ✓ |
| Missing ANTHROPIC_API_KEY → 500 "not set in backend/.env" | ✓ |
| Provider error (no credits) → clean user-readable message | ✓ |
| Manual controls unaffected by AI state | ✓ |
| Nothing auto-saves or auto-publishes | ✓ |
| TS compile clean | ✓ |

## What is blocked by provider credits only

- Full scenario draft generation (end-to-end)
- Inject suggestion generation (end-to-end)
- Auto-draft on new scenario creation (triggered, but provider call fails)
- `✦ AI` badge flow (requires successful draft → apply)

## Smoke test to run once credits are added

```bash
# 1. Get admin token
TOKEN=$(curl -s -X POST http://localhost:3001/auth/admin/login \
  -H "Content-Type: application/json" -H "x-api-key: dev-local-key" \
  -d '{"username":"arnettmcmurray@gmail.com","password":"arnett-five-eyes-2026"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 2. Scenario draft
curl -s -X POST http://localhost:3001/ttx/assist/scenario \
  -H "Content-Type: application/json" -H "x-api-key: dev-local-key" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Ransomware Crisis Response","objective":"Test IR team ability to detect, contain and communicate a ransomware attack"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('sections:', len(d.get('sections',[])))"

# 3. Inject suggestions
curl -s -X POST http://localhost:3001/ttx/assist/injects \
  -H "Content-Type: application/json" -H "x-api-key: dev-local-key" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"stepPrompt":"How does your team identify and triage the initial ransomware alert?","count":3}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('injects:', len(d.get('injects',[])))"

# 4. UI: create scenario with objective → verify auto-draft triggers on edit page
# 5. UI: click "✦ Suggest injects" on a step → verify suggestions panel appears
# 6. UI: click "Use" → verify inject form pre-fills → "Add Inject" → verify ✦ AI badge
```
