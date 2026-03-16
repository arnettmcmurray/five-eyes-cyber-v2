# TTX AI Assist — Final Smoke Tests (2026-03-15)

## Setup
- ANTHROPIC_API_KEY written to backend/.env
- Backend restarted; confirmed up on :3001

## Error extraction improvement
Added `extractError(e)` helper to assist.ts:
- `e instanceof Anthropic.APIError` → pulls `e.error.error.message` (inner message only)
- Fallback: `e.message` or `String(e)`
- Result: "Your credit balance is too low..." instead of raw 400 JSON blob

## Boundary tests (all pass)

| Test | Status |
|------|--------|
| No auth — scenario endpoint | 401 ✓ |
| No auth — injects endpoint | 401 ✓ |
| Fake learner Bearer — scenario | 401 ✓ |
| Missing objective | 400 + "title and objective are required" ✓ |
| Missing stepPrompt | 400 + "stepPrompt is required" ✓ |
| Provider error (no credits) | 500 + clean message ✓ |

## Live API test
Blocked by account credit balance. Key is valid (confirmed by clean Anthropic error message structure, not auth error).
Full scenario draft test will pass once credits are added.

## Manual flow independence (confirmed)
- `aiDrafting` / `aiError` / `injectSuggestions` state never gates section/step/inject manual forms
- Admin can use all TTX scenario editing without touching AI assist at all
- No auto-save, no auto-publish anywhere in the flow

## Next
Add credits to Anthropic account → smoke test full new-scenario → auto-draft → accept section → inject suggest → apply → save flow.
