# Source Governance Backend — 2026-03-17

## Summary

Implemented the full source governance backend layer: 8 new DB tables, governance fields on kbItems, GovernanceService with all service methods, admin-only REST endpoints, and backfill of all 74 existing published KB items.

---

## What Was Built

### Schema (backend/src/db/schema/)

| File | Table | Purpose |
|------|-------|---------|
| `source-trust-levels.ts` | `source_trust_levels` | Trust tiers: canonical/approved/monitored/blocked with rank, flags, default freshness days |
| `sources.ts` | `sources` | Source registry with sourceType enum, ingestMode enum, status, trustLevelId FK |
| `source-domains.ts` | `source_domains` | Domain allowlist with optional source/trust linkage, allowSubdomains flag |
| `freshness-rules.ts` | `freshness_rules` | Review/expiry windows by appliesToType + appliesToValue |
| `governance-ingest-jobs.ts` | `governance_ingest_jobs` | Governance source pull tracking (separate from ingestion_jobs) |
| `review-queue.ts` | `review_queue` | Content items pending human review — priority, status, assignment |
| `content-alerts.ts` | `content_alerts` | Alerts on published content (severity: info/warning/critical, status: open/acknowledged/resolved) |
| `publish-decisions.ts` | `publish_decisions` | Audit trail: approve/reject/defer decisions per KB item |

### kb-items.ts changes

Added 7 governance fields (all nullable for backwards compat):
- `sourceId`, `sourceUrl`, `sourceTrustLevelId` — source linkage
- `reviewStatus` — 'pending' | 'in_review' | 'approved' | 'rejected' | 'deferred'
- `freshnessStatus` — 'current' | 'stale' | 'expired'
- `nextReviewAt` — timestamp for next scheduled review
- `learnerVisible` — boolean, default true

Existing governance fields kept: `freshnessCycle`, `publishedAt`, `lastReviewedAt`

### db/schema/index.ts

Removed 4 stale exports (deleted files from incomplete first pass):
- `source-registry.js`, `freshness-rules.js`, `content-alerts.js`, `publish-decisions.js`

Added correct new exports for all 8 governance tables.

### scripts/db-push.sh

Added governance files with cross-schema imports to the strip_js file list:
`sources.ts`, `source-domains.ts`, `governance-ingest-jobs.ts`, `review-queue.ts`, `content-alerts.ts`, `publish-decisions.ts`

### GovernanceService (backend/src/services/kb/governance.service.ts)

Methods:
- `listTrustLevels()`, `getTrustLevelByCode(code)`
- `listSources()`, `getSourceById(id)`, `createSource(data)`, `updateSource(id, data)`
- `listFreshnessRules()`, `createFreshnessRule(data)`, `updateFreshnessRule(id, data)`
- `listReviewQueue(filter?)`, `getReviewQueueItem(id)`, `enqueueForReview(data)`, `resolveReviewQueueItem(id, data)`
- `listAlerts(filter?)`, `createAlert(data)`, `updateAlert(id, data)`
- `recordPublishDecision(data)`, `listPublishDecisionsForItem(contentItemId)`
- `getGovernanceSummary(itemId)` — per-item context: source, trust level, open reviews, open alerts, recent decisions
- `getAdminGovernanceSummary()` — system-wide counts by reviewStatus and freshnessStatus
- `scanForStaleItems()` — returns items with overdue nextReviewAt or no freshnessCycle over 365 days
- `backfillGovernanceDefaults()` — sets learnerVisible=true, reviewStatus='approved', freshnessStatus='current' on published items with null reviewStatus

### Admin Routes (backend/src/routes/admin/governance.ts)

All endpoints behind `requireAdmin` via `app.use('/admin', requireAdmin, adminGovernanceRouter)`:

| Method | Path | Action |
|--------|------|--------|
| GET | /admin/source-trust-levels | List all trust levels |
| GET | /admin/sources | List all sources |
| GET | /admin/sources/:id | Get source by ID |
| POST | /admin/sources | Create source (ownerUserId from token) |
| PATCH | /admin/sources/:id | Update source |
| GET | /admin/freshness-rules | List freshness rules |
| POST | /admin/freshness-rules | Create freshness rule |
| PATCH | /admin/freshness-rules/:id | Update freshness rule |
| GET | /admin/review-queue | List queue (filter by status/priority) |
| GET | /admin/review-queue/:id | Get queue item |
| POST | /admin/review-queue/:id/decision | Resolve queue item (approved/rejected/deferred) |
| GET | /admin/content-alerts | List alerts (filter by status/severity) |
| PATCH | /admin/content-alerts/:id | Update alert (acknowledge/resolve) |
| GET | /admin/kb/governance-summary | System-wide governance counts |
| GET | /admin/kb/items/:id/governance | Per-item governance context |
| POST | /admin/kb/governance/backfill | Backfill defaults on published items |
| GET | /admin/kb/governance/stale-scan | Scan for overdue items |

---

## Seed Data

Trust levels seeded via SQL:
- canonical (rank=0): T0 — primary regulators, standards bodies, government sources; reviewRequired=true; freshnessDefaultDays=365
- approved (rank=1): T1 — sector nonprofits, ISACs, industry bodies; reviewRequired=true; freshnessDefaultDays=365
- monitored (rank=2): T2 — commercial vendors with inherent bias; reviewRequired=true; freshnessDefaultDays=180
- blocked (rank=3): T3 — watch-only, never sole authority; reviewRequired=true; freshnessDefaultDays=90

NIST Cybersecurity source created (government, canonical trust, nist.gov, manual ingest).

---

## Backfill Result

`POST /admin/kb/governance/backfill` → `{ "updated": 74 }`

All 74 published KB items now have:
- `learnerVisible = true` (preserves all existing learner visibility)
- `reviewStatus = 'approved'`
- `freshnessStatus = 'current'`

5 non-published items (draft/under-review): no backfill — reviewStatus remains null.

---

## Verification

```
GET /admin/kb/governance-summary →
{
  "total": 79,
  "published": 74,
  "learnerVisible": 79,
  "byReviewStatus": { "null": 5, "approved": 74 },
  "byFreshnessStatus": { "null": 5, "current": 74 },
  "openAlerts": 0,
  "criticalAlerts": 0,
  "pendingReviews": 0,
  "blockingReviews": 0
}

GET /admin/kb/governance/stale-scan → { "flagged": 0, "items": [] }
```

TypeScript: `tsc --noEmit` clean before and after.
DB push: `npm run db:push` → `[✓] Changes applied`

---

## Design Notes

- **Soft FKs on kbItems governance fields**: `sourceId` and `sourceTrustLevelId` are plain text fields (no DB FK constraint). This avoids circular import chains between schema files and allows the governance layer to be added without touching existing service code.
- **Separate from ingestion_jobs**: `governance_ingest_jobs` is a new table tracking governance-layer source pulls. The existing `ingestion_jobs` table tracks raw file/URL ingest operations and is unchanged.
- **learnerVisible default=true**: Deliberately safe — the backfill cannot accidentally hide existing published content.
- **No admin UI yet**: Backend-only for now. UI pass is a future session.

---

## Not Built (Next Session)

- Admin UI for source registry, review queue, content alerts
- Freshness rules seed data (standard rules per content type / freshness cycle)
- Automated stale-scan scheduling (cron job or DB trigger)
- Review queue population from freshness rule violation scan
- Source domain registry population (allowlist/blocklist of actual domains)
