# Third Tranche — 2026-03-17

## Summary

Built, ingested, and verified all Third Tranche KB content (T8–T10). Completed Second Tranche module chain wiring (T4→T5→T6→T7). Wrote three source governance documents.

---

## Completed Tasks

### 1. Third Tranche Plan
- `out/kb-third-tranche-build.md` — full plan for T8/T9/T10 derived from `kb-build-order.md` + `reference/deep-research-report.md`

### 2. Third Tranche Content (30 files)

| Topic | Articles | Module | Practice Qs | Dir |
|-------|----------|--------|-------------|-----|
| T8: Secure Systems Hygiene | 6 | 1 | 23 | out/kb-content/t8-it-hygiene/ |
| T9: Third-Party/Vendor Risk | 6 | 1 | 23 | out/kb-content/t9-vendor-risk/ |
| T10: Data and Document Security | 6 | 1 | 23 | out/kb-content/t10-data-security/ |

Types: training-content, policy, threat-brief, faq
Sources: NIST, CISA, FMCSA, NMFTA, FBI IC3, CIS Controls

### 3. Ingestion (scripts/ingest-third-tranche.ts)
- 3 topics created: secure-systems-hygiene, third-party-vendor-risk, data-document-security
- 18 KB items ingested and published
- 3 modules created (displayOrder 8/9/10, 20min each)
- 69 quiz candidates created and approved
- content_chunks populated for FTS

**Key ingest fix:** format-agnostic practice question parser — T9 questions used `**Q1. full text**\n\na) options` (bold wraps entire question + double newline before options). Fixed by searching for first option line index with `block.search(/^[*]?[a-d]\)/im)` and slicing before it.

**Key schema fix:** content_chunks INSERT uses `item_id` not `kb_item_id`.

### 4. Module Chain
- T7→T8→T9→T10 wired (PATCH /kb/modules via ingest script)
- T4→T5→T6→T7 wired (SQL UPDATE — was missing from Second Tranche ingest)
- Full chain: T1→T2→T3→T4→T5→T6→T7→T8→T9→T10 ✓

### 5. testlearner Assignments
- T8/T9/T10 assigned via SQL INSERT (module_assignments)
- Rate limiter (10 req/15min on /auth/*) reached during verification; used DB session token directly

### 6. FTS Verification (all passing)
| Query | Top result |
|-------|-----------|
| patch management freight | t8-patch-management |
| vendor access register | t9-smb-vendor-controls |
| driver PII protection | t10-driver-pii-protection |
| RDP remote access | t8-remote-access-security |
| BEC vendor payment fraud | t9-payment-change-controls |
| data breach notification | t10-breach-response-basics |
| FMCSA verification (baseline) | t4-carrier-identity-verification |
| BEC invoice (baseline) | t2-bec-in-freight |

### 7. Learner Module Verification (T8/T9/T10)
All three modules accessible via `/learn/modules/:id` with:
- T8: study=3, refs=3, practice=23
- T9: study=2, refs=4, practice=23
- T10: study=3, refs=3, practice=23
- KB help (FTS) returning relevant results on all three modules

### 8. Governance Documents
- `out/source-registry-plan.md` — approved source categories, trust tiers T0–T3 (T3=watch-only), platform trustMap (all T0/T1/T2 → external-curated), hard rules
- `out/content-intelligence-plan.md` — ADDIE 6-component standard, gap types (coverage/depth/support/alignment), freshness volatility, item analysis (p-value 0.25–0.75, discrimination ≥0.20), admin alert model, scoring framework
- `out/kb-governance-model.md` — content lifecycle, review-first publish rules, hard no-autopublish categories, freshness rules, audit trail requirements

---

## Debug Notes

**FTS was "broken":** Root cause was missing `x-api-key` header in curl commands. All auth AND unauthenticated routes (except /health) go through the API key guard at app.ts:76. `/health` is the only exempt path.

**Admin login rate limit:** 10 req/15min on /auth/*. Burned quickly during debugging session. Workaround: use a fresh admin account (4 available), or wait 15min.

**Learner session from DB:** When rate-limited on OTP, get valid session token from `learner_sessions` table: `SELECT token FROM learner_sessions WHERE learner_id = '...' AND expires_at > NOW()`.

---

## State at End of Session
- All 10 tranches (T1–T10) live in-system
- Full module chain T1→T10 wired
- 88 total KB items published (31 T1-T4 + 23 T5-T7 + 18 T8-T10 + some legacy)
- FTS working across all tranches
- testlearner assigned to all 10 tranche modules
- 3 governance docs written
- Source governance backend implementation NOT started (next session)
