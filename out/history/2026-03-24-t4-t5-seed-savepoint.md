# Savepoint: T4+T5 Content Seed — 2026-03-24

## What was done this session

### Public shell design pass (feature/public-shell-design-pass — merged to main via PR)
- Cinematic pre-home entry (`truck-turning-corner.mp4` replaced with `premium-logistics.mp4`)
- NeuralBackground promoted to z-0/z-2, opaque root div removed — canvas now visible
- ThemeToggle (jh3y night/day) wired to localStorage + `data-theme` on `<html>`
- Light mode visibility: nav text, image card overlays, glass section overrides
- About page: `port-operations-center.png` full-bleed hero
- Contact/Enterprise page: `cargo-ship-night.png` full-bleed hero
- NavShell icons refreshed (grid, play-circle, shield-lightning, rising bars)
- Logo routing: authenticated → `/learn` or `/admin/dashboard`, public → `/`

### Content expansion pass (feature/ttx-core — in progress)
- `backend/scripts/seed-t4-t5.ts` created and run successfully
- T4: Freight Vendor Impersonation & Invoice Fraud
  - 3 KB items (invoice-fraud-in-freight, vendor-banking-change-redflags, invoice-verification-procedures)
  - 12 questions, 5 lesson links (3 primary + 2 supplementary reuse)
  - Topics: invoice-fraud, document-fraud, ransomware-response (new)
- T5: Warehouse Ransomware Response
  - 3 KB items (ransomware-in-warehouse, ransomware-containment, ransomware-communications)
  - 12 questions, 5 lesson links (3 primary + 2 supplementary reuse)
- T3 → T4 → T5 chain set (nextModuleId)
- Sam.professional assigned T1–T5
- DB verified: 68 total promoted questions, 5 modules with questions

## What was NOT done / still pending

- **App-level smoke test of T4/T5** — paused to save tokens. DB verified only.
  - Sam login via OTP → check T4/T5 visible in dashboard
  - T4 end-to-end (briefing → checkpoint → debrief)
  - T5 end-to-end
  - KB help returning T4/T5 content
  - Admin visibility of new modules
- **T6–T10 modules** — not created yet. Same seed pattern as T4/T5.
- **TTX expansion** (4 new scenarios) — not started.
- **AWS staging** — OTP/SES, secrets, migration automation still needed.

## Resume instructions for next session

1. Read `docs/design/full-build-status-checklist.md` first (canonical truth).
2. **First task:** smoke test T4/T5 in running app (Sam OTP login → Mailpit → dashboard → T4 → T5).
3. If T4/T5 pass: create `backend/scripts/seed-t6-t7.ts` (Dispatch Phishing/MFA Fatigue + Broker/Load Board Fraud). Same pattern as seed-t4-t5.ts.
4. Then T8/T9/T10 in separate scripts.
5. Then TTX expansion (4 new scenarios).
6. Then AWS staging prep.

## DB counts at savepoint

| Entity | Count |
|--------|-------|
| Published modules | 5 (t1–t5 canonical + legacy duplicates in DB) |
| Promoted questions | 68 |
| KB items (published) | ~29 |
| Learners | 3 |
| Sam's assigned modules | T1, T2, T3, T4, T5 |
| TTX scenarios | 1 (BEC freight payment hijack) |

## Commands

Bootstrap (full reset): `npm run --prefix backend bootstrap`
T4+T5 seed only: `npx tsx --env-file=.env scripts/seed-t4-t5.ts` (from backend/)
Dev servers: `npm run dev` (root)

## Branch state

- `main` — public shell design pass merged
- `feature/ttx-core` — T4/T5 seed + checklist updates (commit this savepoint)
