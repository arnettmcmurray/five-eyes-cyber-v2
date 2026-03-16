# TTX AI Assist — Boundary & Failure Tests (2026-03-15)

## Live API test
Skipped — ANTHROPIC_API_KEY not yet set in backend/.env. Key must be added and backend restarted to activate.

## Boundary tests (all pass against running backend)

| Test | Expected | Result |
|------|----------|--------|
| POST /ttx/assist/scenario — no auth | 401 | ✓ 401 |
| POST /ttx/assist/scenario — fake learner Bearer | 401 | ✓ 401 |
| POST /ttx/assist/scenario — admin token, no API key | 500 + "ANTHROPIC_API_KEY is not set in backend/.env" | ✓ |
| POST /ttx/assist/scenario — missing objective | 400 + "title and objective are required" | ✓ |
| POST /ttx/assist/injects — missing stepPrompt | 400 + "stepPrompt is required" | ✓ |

## Response hardening (requires backend restart to take effect)

Added to both endpoints (after JSON.parse):
- `JSON.parse` failure → 500 "AI returned unparseable response — try again"
- Missing `sections` array (scenario) → 500 "AI response missing expected sections array — try again"
- Missing `injects` array (injects) → 500 "AI response missing expected injects array — try again"

## Manual flow independence confirmed
- `aiDrafting` only disables the AI button — never gates manual section/step/inject forms
- `aiError` renders inline below meta section, dismisses on next successful draft
- All `addingSection`, `addingStep`, `addingInject` flows are independent of AI state

## To activate
1. Add `ANTHROPIC_API_KEY=sk-ant-...` to `backend/.env`
2. Restart backend (`npm run dev` in backend/)
3. Open a scenario with an objective → "✦ Draft structure with AI" button visible
4. Or create a new scenario with title + objective → auto-triggers draft on edit page load
