# KB First Tranche Ingest Status
**Date:** 2026-03-16

## Summary: First Tranche is fully usable in-app.

All 31 KB articles, 4 modules, and 126 quiz candidates are live and verified end-to-end.

---

## What Was Ingested

| Group | Items | Type | Status | Topics Assigned |
|-------|-------|------|--------|-----------------|
| T1: Phishing & Email Security | 7 | training-content, threat-brief, policy, faq | published | Phishing and Email Security |
| T2: BEC & Payment Fraud | 8 | training-content, threat-brief, policy, faq | published | BEC and Payment Fraud |
| T3: Passwords & MFA | 7 | training-content, threat-brief, policy, faq | published | Passwords and Credential Security, MFA |
| T4: Freight Identity | 9 | training-content, threat-brief, policy | published | Load Board Scams and Double Brokering, Broker-Carrier Impersonation, Document Fraud |
| **Total** | **31** | | | |

**Modules created and published:**

| Module slug | Title | estimatedMinutes | Items | Quiz Candidates |
|-------------|-------|-----------------|-------|-----------------|
| t1-phishing-email-security | Phishing and Email Security | 20 | 7 | 33 |
| t2-bec-payment-fraud | BEC and Payment Fraud | 25 | 8 | 30 |
| t3-passwords-mfa | Passwords and MFA | 20 | 7 | 28 |
| t4-freight-identity | Freight Identity, Verification, and Fraud Controls | 30 | 9 | 35 |

**Topics in DB:** 9 total (7 First Tranche + 2 legacy demo topics)

**Quiz candidates:** All distributed round-robin across items within each module, approved, linked via kbItemId.

---

## What Mapped Correctly

- ✓ All 31 items published (status = 'published')
- ✓ All items have a revision (currentRevisionId set)
- ✓ All items assigned to correct topics (matches frontmatter `topics:` values)
- ✓ All 4 modules linked to correct items with correct roles (primary / supplementary)
- ✓ item type classification correct: `training-content` items → study items; `policy`, `faq`, `threat-brief` → references
- ✓ Module estimatedMinutes set (20/25/20/30 min)
- ✓ 126 quiz candidates created and approved across all 31 items
- ✓ FTS search (content_chunks) populated; searches return correct items
  - "FMCSA verification" → Carrier Identity Verification (score 0.39)
  - "pickup code dock" → Pickup Integrity (score 0.71)
  - "business email compromise invoice" → BEC in Freight (score 0.64)

---

## Learner Flow Verified

- ✓ GET /learn/modules/:id — T4 module returns 4 study items + 5 references + 35 practice questions
- ✓ Study items = `training-content` with `primary` role (correct split)
- ✓ References = `policy`, `threat-brief`, `faq`, and `supplementary` items (correct split)
- ✓ POST /learn/modules/:id/practice — score 3/3 = 100% verified
- ✓ Wrong answers → recommendedTopics + remediationItems populated from topic graph (e.g., wrong answer → "Load Board Scams and Double Brokering" → 4 related KB items returned)
- ✓ T2 (BEC): 3 study items, 5 refs, 30 practice questions
- ✓ T3 (Passwords/MFA): 3 study items, 4 refs, 28 practice questions

---

## What Still Needs Manual Linking / Cleanup

### Minor (nice-to-have, not blockers)
- **Quiz question distribution** is round-robin per item, not semantically optimized. Admin can re-assign via quiz-candidates UI if needed (no broken functionality).
- **Module chain (nextModuleId)** not yet set between T1→T2→T3→T4. Admin can set via PATCH /kb/modules/:id if a prescribed sequence is desired.
- **Remediation cards** (8 markdown files in out/kb-content/) are not ingested as KB items — they are standalone reference docs. If the platform should serve them as KB items, ingest them separately via the admin UI or extend the ingest script.
- **Module assignments** for learner accounts not set. Learners with paid tier can access all modules by ID; admin can assign specific modules per learner via /admin/assignments.

### Legacy items
- 5 pre-existing demo items remain in `draft` status with auto-generated slugs — these are not linked to any First Tranche module and do not affect learner flow. Can be archived or deleted via admin UI.
- 2 legacy topics (`Phishing`, `OPSEC`) remain in DB from demo setup — no conflict, no First Tranche items tagged to them.

---

## Is First Tranche Now Truly Usable In-App?

**Yes.**

- Admin: can view, search, edit, and manage all 31 items in the KB admin panel
- Learner (paid tier): can access all 4 modules, read study content, browse references, complete practice with scoring and topic-linked remediation
- FTS search working over all First Tranche content
- Quiz candidates approved and serving correctly through practice endpoint
