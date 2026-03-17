# Session History: KB First Tranche Ingest
**Date:** 2026-03-16

## Mission
Ingest all First Tranche KB content into the live system, verify mapping, confirm learner/admin usability.

## Approach
Wrote a TypeScript ingestion script (`scripts/ingest-first-tranche.ts`) that:
1. Authenticates as admin
2. Creates 7 First Tranche topics (idempotent)
3. For each of the 31 KB articles: reads markdown file, parses frontmatter, creates item + revision, runs `submit` → `publish` workflow, assigns to topic(s)
4. Creates 4 modules with correct estimatedMinutes, displayOrder
5. Links items to modules with role (primary/supplementary) and order
6. Parses practice-questions.md files, distributes questions round-robin across items, creates and approves quiz candidates

Post-script: populated `content_chunks` table via direct SQL for FTS search (items created via the direct KB API bypass the ingestion pipeline which normally handles this).

## What was found / fixed

### Workflow state machine
Items require `draft → submit → under-review → publish`. The initial script tried to publish directly from draft, causing 400. Fixed by adding `submit` step before `publish`.

### content_chunks not populated
The search service queries `content_chunks`, not `kb_revisions`. Items created via the direct API don't go through the pipeline so no chunks are written. Fixed by inserting one chunk per item directly:
```sql
INSERT INTO content_chunks (id, item_id, revision_id, chunk_index, content, token_count)
SELECT gen_random_uuid(), ki.id, ki.current_revision_id, 0, kr.content, length(kr.content)/4
FROM kb_items ki JOIN kb_revisions kr ON kr.id = ki.current_revision_id
WHERE ki.slug LIKE 't1-%' OR ...
```
Result: 31 chunks inserted; FTS now returns correct results.

### estimatedMinutes not set on create
Module create route only accepts `slug, title, description, displayOrder`. `estimatedMinutes` ignored on create. Fixed with PATCH after creation.

## Verification results
| Check | Result |
|-------|--------|
| 31 items published | ✓ |
| 4 modules published | ✓ |
| 126 quiz candidates approved | ✓ |
| FTS: "FMCSA verification" | ✓ Carrier Identity Verification (score 0.39) |
| FTS: "pickup code dock" | ✓ Pickup Integrity (score 0.71) |
| FTS: "BEC invoice" | ✓ BEC in Freight (score 0.64) |
| T4 module: 4 study items, 5 refs, 35 practice Qs | ✓ |
| Practice 3/3 correct → 100% | ✓ |
| Wrong answer → topic remediation items | ✓ (4 items from freight-identity topic) |

## Files produced
- `scripts/ingest-first-tranche.ts` — ingestion script (idempotent)
- `out/kb-first-tranche-ingest-status.md` — full verification status

## Known gaps (non-blocking)
- Module chain (nextModuleId) not linked T1→T2→T3→T4
- Remediation cards not ingested as KB items
- Module assignments per learner not configured
- Quiz distribution is round-robin, not thematic
