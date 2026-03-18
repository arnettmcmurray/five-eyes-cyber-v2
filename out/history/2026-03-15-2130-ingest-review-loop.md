# 2026-03-15 — Ingest pipeline + review-to-publish loop

## Completed
- URL ingest: title extracted from `<title>` tag before HTML stripping; slug capped at 190 chars
- WORKFLOW_ACTIONS corrected: publish available from under-review, removed phantom 'approved' state
- WorkflowEvent type fixed: performedAt, fromStatus, toStatus, note optional
- ReviewPanel component on item detail: draft banner (submit/archive) + under-review banner (publish/approve/reject+note/changes+note/archive)
- Jobs panel: "view item" → "Review →" blue button
- doAction accepts optional note for reject/changes

## Working
- Full ingest → review → publish loop: manual confirmed, URL fixed, file should work
- Review panel prominently appears for draft/under-review items

## Next
- Module management page (step 9)
- Topic assignment during/after ingest (step 6)
- Wire into learning flow (step 10)
