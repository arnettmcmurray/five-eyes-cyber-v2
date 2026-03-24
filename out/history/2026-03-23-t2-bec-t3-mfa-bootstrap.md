# T2 BEC + T3 MFA Bootstrap Expansion — 2026-03-23

## What Was Done

Replaced the placeholder T2 module ("Supply Chain Threat Awareness", 2 phishing KB items, 4 questions) with a full "BEC and Payment Protection" module, and added a new T3 "Account Security and MFA" module. Both now match T1's standard: full KB articles, curated practice questions, reference materials, FTS-indexed content_chunks, and topic relationships.

---

## T2 — BEC and Payment Protection (replaces placeholder T2)

**Module slug:** `t2-bec-payment-protection`

**KB items (8 total):**
- `t2-bec-freight-payment-map` — training-content (primary): Where BEC Happens in the Freight Payment Cycle
- `t2-bec-indicator-library` — training-content (primary): BEC Indicator Library: How to Recognize a Payment Fraud Attempt
- `t2-bec-dual-approval` — training-content (primary): What "Dual Approval" Means and When to Use It
- `t2-bec-payment-change-policy` — policy (supplementary): Payment Change Verification Policy
- `t2-bec-in-freight-threat-brief` — threat-brief (supplementary): BEC in Freight: Factoring Fraud, Invoice Redirection, and Executive Impersonation
- `t2-bec-financial-escalation-tree` — policy (supplementary): Financial Escalation Tree: Who to Call When Payment Fraud Occurs
- `t2-bec-already-sent-money` — faq (supplementary): If You Already Sent Money: The First 60 Minutes
- `t2-bec-evidence-capture-checklist` — policy (supplementary): Evidence Capture Checklist

**Practice questions:** 12 promoted, linked to training-content items:
- kb-03 (freight-bec-map): Q1, Q4, Q6, Q9, Q10
- kb-04 (bec-indicator-library): Q2, Q3, Q7, Q8, Q11
- kb-06 (dual-approval): Q5, Q12

**Topics:** bec-fraud (primary), freight-security, incident-response (cross-links)

---

## T3 — Account Security and MFA (new module)

**Module slug:** `t3-account-security-mfa`

**KB items (7 total):**
- `t3-password-guidance` — training-content (primary): Password and Passphrase Guidance for Freight Professionals
- `t3-mfa-deployment-guide` — training-content (primary): MFA Deployment Guide for Freight Operations
- `t3-privilege-separation` — training-content (primary): Privilege Separation: Admin vs. Daily-Use Accounts
- `t3-account-security-standard` — policy (supplementary): Account Security Standard
- `t3-mfa-faq` — faq (supplementary): MFA FAQ for Freight Staff
- `t3-account-takeover-in-freight` — threat-brief (supplementary): Account Takeover in Freight: How Attackers Compromise Business Email and TMS Accounts
- `t3-lost-phone-mfa-recovery` — faq (supplementary): Lost Phone or Device: How to Recover MFA Access

**Practice questions:** 12 promoted, linked to training-content items:
- kb-02 (password-guidance): Q1, Q3, Q4, Q9
- kb-03 (mfa-deployment-guide): Q2, Q5, Q6, Q7, Q11
- kb-05 (privilege-separation): Q8, Q10, Q12

**Topics:** password-security, mfa (primary), incident-response (cross-link)

---

## Bootstrap Changes

**`backend/scripts/bootstrap-local-proof.ts`:**
- Added T2 BEC and T3 content constants (15 full KB articles)
- Added IDS for 8 T2 BEC + 7 T3 KB items, revisions, lesson links, quiz candidates, chunks, topic relationships
- Added t3Module ID and ma4 (sam→t3 assignment)
- Added 3 new topics (bec-fraud, password-security, mfa)
- Section 15: updates t2Module slug/title/description to BEC and Payment Protection
- Section 16: removes legacy T2 lesson content links (lc6/lc7)
- Section 16b: cleans up pipeline-created items that conflict on slug before bootstrap inserts
- Section 17: inserts T2 BEC KB items + revisions + lesson links + topic_relationships + content_chunks
- Section 18: inserts 12 T2 BEC practice questions
- Section 19: inserts T3 KB items + revisions + lesson links + topic_relationships + content_chunks
- Section 20: inserts 12 T3 practice questions

**Slug conflict resolution:** The ingestion pipeline had created kb_items for T2 BEC and all T3 slugs with random UUIDs. Added Section 16b that detects and deletes pipeline-created conflicts before the fixed-UUID bootstrap inserts. Pattern mirrors `topicIdBySlug` but for items, delete-first rather than resolve.

**FK ordering fix:** content_chunks and topic_relationships for T2 BEC and T3 are now inserted inline within Sections 17/19 (after their KB items exist), not in Section 14.

---

## Verification

- Bootstrap runs clean and idempotent (tested twice)
- `npx tsc --noEmit` passes (frontend + backend)
- DB: sam has t1 + t2-bec + t3-mfa assignments; alex has t1 only
- All 22 bootstrap KB items have content_chunks (FTS works for all 3 modules)
