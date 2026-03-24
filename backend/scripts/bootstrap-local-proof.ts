/**
 * Persistent local-proof bootstrap for Five Eyes v2.
 *
 * Creates the minimum persistent data needed to evaluate the app end-to-end:
 *   - 2 published training modules (t1 fully populated, t2 partially)
 *   - 3 local-proof learner accounts covering distinct access states
 *   - Group memberships for admin company/group search
 *   - Access overrides (individual/professional per learner)
 *   - Module assignments with distinct access patterns per learner
 *   - Realistic learner progress states across users
 *
 * Idempotent: safe to re-run. Uses ON CONFLICT DO NOTHING on all inserts.
 * Does NOT wipe existing DB data or touch existing rows.
 *
 * Run from repo root:  npm run --prefix backend bootstrap
 * Run from backend/:   npx tsx --env-file=.env scripts/bootstrap-local-proof.ts
 */

// ── Fixed IDs ──────────────────────────────────────────────────────────────
// All IDs are fixed so re-runs are idempotent.

const IDS = {
  // Modules
  t1Module:   '712fb286-94ef-4f57-9d6a-c4f8ee9147cf',
  t2Module:   'a4e1b2c3-d5f6-4789-abcd-ef1234567890',
  t3Module:   'b5c6d7e8-f9a0-4bcd-efab-123456789abc',

  // T1 KB items (existing — match seed-t1-questions.ts)
  t1K1Item:   '104025aa-b87b-4153-a33e-b7be2b57a70a',
  t1K2Item:   'b340bc7f-4567-4617-a177-4103b731eff5',
  t1K3Item:   '237cb8bf-0f47-48b5-80c6-33196d6cbc7e',
  t1K4Item:   'c49ab1d2-3486-474b-a2f2-f875b4799758',
  t1K5Item:   '4aacad81-97b3-4a51-8082-5c8402ab168a',

  // T1 KB revisions
  t1K1Rev:    '41350678-a536-4124-923e-da19d63cab6c',
  t1K2Rev:    'd5a6c60e-e039-4c45-b389-178bcfe81cda',
  t1K3Rev:    'f15df621-169d-4027-9fbe-dd99ba7fc22a',
  t1K4Rev:    '850b891a-bc14-4380-ab86-c95d728d1123',
  t1K5Rev:    '98948de0-b838-4f03-80cd-76d7f4d8a876',

  // T2 KB items (legacy — kept for FK safety, disconnected from module by Section 16)
  t2K1Item:   'c6d7e8f9-a0b1-4234-cdef-012345678901',
  t2K2Item:   'd8e9f0a1-b2c3-4456-ef01-234567890123',

  // T2 KB revisions (legacy)
  t2K1Rev:    'e0f1a2b3-c4d5-4678-0123-456789012345',
  t2K2Rev:    'f2a3b4c5-d6e7-4890-2345-678901234567',

  // T2 legacy quiz questions (linked to legacy KB items, not in module after Section 16)
  t2Q1:       'ii000001-0000-4000-0000-000000000001',
  t2Q2:       'ii000002-0000-4000-0000-000000000002',
  t2Q3:       'ii000003-0000-4000-0000-000000000003',
  t2Q4:       'ii000004-0000-4000-0000-000000000004',

  // T2 BEC KB items (3 training-content primary + 5 reference)
  t2BecK1Item:  'aa000001-0000-4000-0000-000000000001', // kb-03: freight-bec-map (training-content)
  t2BecK2Item:  'aa000002-0000-4000-0000-000000000002', // kb-04: bec-indicator-library (training-content)
  t2BecK3Item:  'aa000003-0000-4000-0000-000000000003', // kb-06: dual-approval (training-content)
  t2BecK4Item:  'aa000004-0000-4000-0000-000000000004', // kb-01: payment-change-policy (policy)
  t2BecK5Item:  'aa000005-0000-4000-0000-000000000005', // kb-02: bec-in-freight (threat-brief)
  t2BecK6Item:  'aa000006-0000-4000-0000-000000000006', // kb-05: financial-escalation-tree (policy)
  t2BecK7Item:  'aa000007-0000-4000-0000-000000000007', // kb-07: already-sent-money (faq)
  t2BecK8Item:  'aa000008-0000-4000-0000-000000000008', // kb-08: evidence-capture-checklist (policy)

  // T2 BEC KB revisions
  t2BecK1Rev:   'ab000001-0000-4000-0000-000000000001',
  t2BecK2Rev:   'ab000002-0000-4000-0000-000000000002',
  t2BecK3Rev:   'ab000003-0000-4000-0000-000000000003',
  t2BecK4Rev:   'ab000004-0000-4000-0000-000000000004',
  t2BecK5Rev:   'ab000005-0000-4000-0000-000000000005',
  t2BecK6Rev:   'ab000006-0000-4000-0000-000000000006',
  t2BecK7Rev:   'ab000007-0000-4000-0000-000000000007',
  t2BecK8Rev:   'ab000008-0000-4000-0000-000000000008',

  // T2 BEC quiz questions (12)
  t2BecQ1:   'ac000001-0000-4000-0000-000000000001',
  t2BecQ2:   'ac000002-0000-4000-0000-000000000002',
  t2BecQ3:   'ac000003-0000-4000-0000-000000000003',
  t2BecQ4:   'ac000004-0000-4000-0000-000000000004',
  t2BecQ5:   'ac000005-0000-4000-0000-000000000005',
  t2BecQ6:   'ac000006-0000-4000-0000-000000000006',
  t2BecQ7:   'ac000007-0000-4000-0000-000000000007',
  t2BecQ8:   'ac000008-0000-4000-0000-000000000008',
  t2BecQ9:   'ac000009-0000-4000-0000-000000000009',
  t2BecQ10:  'ac000010-0000-4000-0000-000000000010',
  t2BecQ11:  'ac000011-0000-4000-0000-000000000011',
  t2BecQ12:  'ac000012-0000-4000-0000-000000000012',

  // T3 KB items (3 training-content primary + 4 reference)
  t3K1Item:  'ae000001-0000-4000-0000-000000000001', // kb-02: password-guidance (training-content)
  t3K2Item:  'ae000002-0000-4000-0000-000000000002', // kb-03: mfa-deployment-guide (training-content)
  t3K3Item:  'ae000003-0000-4000-0000-000000000003', // kb-05: privilege-separation (training-content)
  t3K4Item:  'ae000004-0000-4000-0000-000000000004', // kb-01: account-security-standard (policy)
  t3K5Item:  'ae000005-0000-4000-0000-000000000005', // kb-04: mfa-faq (faq)
  t3K6Item:  'ae000006-0000-4000-0000-000000000006', // kb-06: account-takeover-in-freight (threat-brief)
  t3K7Item:  'ae000007-0000-4000-0000-000000000007', // kb-07: lost-phone-mfa-recovery (faq)

  // T3 KB revisions
  t3K1Rev:   'af000001-0000-4000-0000-000000000001',
  t3K2Rev:   'af000002-0000-4000-0000-000000000002',
  t3K3Rev:   'af000003-0000-4000-0000-000000000003',
  t3K4Rev:   'af000004-0000-4000-0000-000000000004',
  t3K5Rev:   'af000005-0000-4000-0000-000000000005',
  t3K6Rev:   'af000006-0000-4000-0000-000000000006',
  t3K7Rev:   'af000007-0000-4000-0000-000000000007',

  // T3 quiz questions (12)
  t3Q1:   'ag000001-0000-4000-0000-000000000001',
  t3Q2:   'ag000002-0000-4000-0000-000000000002',
  t3Q3:   'ag000003-0000-4000-0000-000000000003',
  t3Q4:   'ag000004-0000-4000-0000-000000000004',
  t3Q5:   'ag000005-0000-4000-0000-000000000005',
  t3Q6:   'ag000006-0000-4000-0000-000000000006',
  t3Q7:   'ag000007-0000-4000-0000-000000000007',
  t3Q8:   'ag000008-0000-4000-0000-000000000008',
  t3Q9:   'ag000009-0000-4000-0000-000000000009',
  t3Q10:  'ag000010-0000-4000-0000-000000000010',
  t3Q11:  'ag000011-0000-4000-0000-000000000011',
  t3Q12:  'ag000012-0000-4000-0000-000000000012',

  // Learners
  evaLearner:  '11111111-1111-4111-a111-111111111111',
  alexLearner: '22222222-2222-4222-a222-222222222222',
  samLearner:  '33333333-3333-4333-a333-333333333333',

  // Groups
  transportOpsGroup:  'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
  freightSecGroup:    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',

  // Group members
  gm1: 'cc000001-0000-4000-0000-000000000001', // transport-ops + eva
  gm2: 'cc000002-0000-4000-0000-000000000002', // transport-ops + alex
  gm3: 'cc000003-0000-4000-0000-000000000003', // freight-sec + sam

  // Access overrides
  ao1: 'dd000001-0000-4000-0000-000000000001', // alex → individual
  ao2: 'dd000002-0000-4000-0000-000000000002', // sam → professional

  // Module assignments
  ma1: 'ee000001-0000-4000-0000-000000000001', // alex → t1
  ma2: 'ee000002-0000-4000-0000-000000000002', // sam → t1
  ma3: 'ee000003-0000-4000-0000-000000000003', // sam → t2
  ma4: 'ee000004-0000-4000-0000-000000000004', // sam → t3

  // Lesson content links — T1
  lc1: 'ff000001-0000-4000-0000-000000000001', // t1 + phishingInFreight
  lc2: 'ff000002-0000-4000-0000-000000000002', // t1 + emailRedFlags
  lc3: 'ff000003-0000-4000-0000-000000000003', // t1 + smishingVishing
  lc4: 'ff000004-0000-4000-0000-000000000004', // t1 + safeLinkHandling
  lc5: 'ff000005-0000-4000-0000-000000000005', // t1 + howToReport
  lc6: 'ff000006-0000-4000-0000-000000000006', // t2 legacy + killchain (deleted in Section 16)
  lc7: 'ff000007-0000-4000-0000-000000000007', // t2 legacy + iClicked (deleted in Section 16)

  // Lesson content links — T2 BEC (3 primary + 5 supplementary)
  lc_t2bec_1: 'ad000001-0000-4000-0000-000000000001', // t2 + freight-bec-map (primary)
  lc_t2bec_2: 'ad000002-0000-4000-0000-000000000002', // t2 + bec-indicator-library (primary)
  lc_t2bec_3: 'ad000003-0000-4000-0000-000000000003', // t2 + dual-approval (primary)
  lc_t2bec_4: 'ad000004-0000-4000-0000-000000000004', // t2 + payment-change-policy (supplementary)
  lc_t2bec_5: 'ad000005-0000-4000-0000-000000000005', // t2 + bec-in-freight (supplementary)
  lc_t2bec_6: 'ad000006-0000-4000-0000-000000000006', // t2 + financial-escalation-tree (supplementary)
  lc_t2bec_7: 'ad000007-0000-4000-0000-000000000007', // t2 + already-sent-money (supplementary)
  lc_t2bec_8: 'ad000008-0000-4000-0000-000000000008', // t2 + evidence-capture-checklist (supplementary)

  // Lesson content links — T3 (3 primary + 4 supplementary)
  lc_t3_1: 'ah000001-0000-4000-0000-000000000001', // t3 + password-guidance (primary)
  lc_t3_2: 'ah000002-0000-4000-0000-000000000002', // t3 + mfa-deployment-guide (primary)
  lc_t3_3: 'ah000003-0000-4000-0000-000000000003', // t3 + privilege-separation (primary)
  lc_t3_4: 'ah000004-0000-4000-0000-000000000004', // t3 + account-security-standard (supplementary)
  lc_t3_5: 'ah000005-0000-4000-0000-000000000005', // t3 + mfa-faq (supplementary)
  lc_t3_6: 'ah000006-0000-4000-0000-000000000006', // t3 + account-takeover-in-freight (supplementary)
  lc_t3_7: 'ah000007-0000-4000-0000-000000000007', // t3 + lost-phone-mfa-recovery (supplementary)

  // Learner progress
  lp1: 'gg000001-0000-4000-0000-000000000001', // alex + t1 started
  lp2: 'gg000002-0000-4000-0000-000000000002', // sam + t1 completed
  lp3: 'gg000003-0000-4000-0000-000000000003', // sam + t2 started

  // Practice attempts
  pa1: 'hh000001-0000-4000-0000-000000000001', // sam + t1 attempt

  // Topics (for retrieval + remediation)
  topicPhishing:          'tt000001-0000-4000-0000-000000000001',
  topicFreightSecurity:   'tt000002-0000-4000-0000-000000000002',
  topicLinkVerification:  'tt000003-0000-4000-0000-000000000003',
  topicIncidentResponse:  'tt000004-0000-4000-0000-000000000004',
  topicRansomware:        'tt000005-0000-4000-0000-000000000005',
  topicMobileScams:       'tt000006-0000-4000-0000-000000000006',
  topicBecFraud:          'tt000007-0000-4000-0000-000000000007',
  topicPasswordSecurity:  'tt000008-0000-4000-0000-000000000008',
  topicMfa:               'tt000009-0000-4000-0000-000000000009',

  // Topic relationships
  tr1:  'rr000001-0000-4000-0000-000000000001', // t1K1 → phishing-emails
  tr2:  'rr000002-0000-4000-0000-000000000002', // t1K1 → freight-security
  tr3:  'rr000003-0000-4000-0000-000000000003', // t1K2 → phishing-emails
  tr4:  'rr000004-0000-4000-0000-000000000004', // t1K2 → link-verification
  tr5:  'rr000005-0000-4000-0000-000000000005', // t1K3 → mobile-scams
  tr6:  'rr000006-0000-4000-0000-000000000006', // t1K3 → phishing-emails
  tr7:  'rr000007-0000-4000-0000-000000000007', // t1K4 → link-verification
  tr8:  'rr000008-0000-4000-0000-000000000008', // t1K5 → incident-response
  tr9:  'rr000009-0000-4000-0000-000000000009', // t2K1 → ransomware
  tr10: 'rr000010-0000-4000-0000-000000000010', // t2K1 → phishing-emails
  tr11: 'rr000011-0000-4000-0000-000000000011', // t2K2 → incident-response
  tr12: 'rr000012-0000-4000-0000-000000000012', // t2K2 → ransomware
  // T2 BEC topic relationships
  tr13: 'rr000013-0000-4000-0000-000000000013', // t2BecK1 → bec-fraud
  tr14: 'rr000014-0000-4000-0000-000000000014', // t2BecK1 → freight-security
  tr15: 'rr000015-0000-4000-0000-000000000015', // t2BecK2 → bec-fraud
  tr16: 'rr000016-0000-4000-0000-000000000016', // t2BecK3 → bec-fraud
  tr17: 'rr000017-0000-4000-0000-000000000017', // t2BecK4 → bec-fraud
  tr18: 'rr000018-0000-4000-0000-000000000018', // t2BecK5 → bec-fraud
  tr19: 'rr000019-0000-4000-0000-000000000019', // t2BecK5 → freight-security
  tr20: 'rr000020-0000-4000-0000-000000000020', // t2BecK6 → bec-fraud
  tr21: 'rr000021-0000-4000-0000-000000000021', // t2BecK6 → incident-response
  tr22: 'rr000022-0000-4000-0000-000000000022', // t2BecK7 → bec-fraud
  tr23: 'rr000023-0000-4000-0000-000000000023', // t2BecK8 → bec-fraud
  // T3 topic relationships
  tr24: 'rr000024-0000-4000-0000-000000000024', // t3K1 → password-security
  tr25: 'rr000025-0000-4000-0000-000000000025', // t3K2 → mfa
  tr26: 'rr000026-0000-4000-0000-000000000026', // t3K3 → password-security
  tr27: 'rr000027-0000-4000-0000-000000000027', // t3K4 → password-security
  tr28: 'rr000028-0000-4000-0000-000000000028', // t3K4 → mfa
  tr29: 'rr000029-0000-4000-0000-000000000029', // t3K5 → mfa
  tr30: 'rr000030-0000-4000-0000-000000000030', // t3K6 → password-security
  tr31: 'rr000031-0000-4000-0000-000000000031', // t3K6 → mfa
  tr32: 'rr000032-0000-4000-0000-000000000032', // t3K7 → mfa

  // Content chunks (one per KB item — enables FTS for local-proof learners)
  cc1: 'kk000001-0000-4000-0000-000000000001', // t1K1
  cc2: 'kk000002-0000-4000-0000-000000000002', // t1K2
  cc3: 'kk000003-0000-4000-0000-000000000003', // t1K3
  cc4: 'kk000004-0000-4000-0000-000000000004', // t1K4
  cc5: 'kk000005-0000-4000-0000-000000000005', // t1K5
  cc6: 'kk000006-0000-4000-0000-000000000006', // t2K1 (legacy)
  cc7: 'kk000007-0000-4000-0000-000000000007', // t2K2 (legacy)
  // T2 BEC content chunks
  cc8:  'kk000008-0000-4000-0000-000000000008', // t2BecK1 (freight-bec-map)
  cc9:  'kk000009-0000-4000-0000-000000000009', // t2BecK2 (bec-indicator-library)
  cc10: 'kk000010-0000-4000-0000-000000000010', // t2BecK3 (dual-approval)
  cc11: 'kk000011-0000-4000-0000-000000000011', // t2BecK4 (payment-change-policy)
  cc12: 'kk000012-0000-4000-0000-000000000012', // t2BecK5 (bec-in-freight)
  cc13: 'kk000013-0000-4000-0000-000000000013', // t2BecK6 (financial-escalation-tree)
  cc14: 'kk000014-0000-4000-0000-000000000014', // t2BecK7 (already-sent-money)
  cc15: 'kk000015-0000-4000-0000-000000000015', // t2BecK8 (evidence-capture-checklist)
  // T3 content chunks
  cc16: 'kk000016-0000-4000-0000-000000000016', // t3K1 (password-guidance)
  cc17: 'kk000017-0000-4000-0000-000000000017', // t3K2 (mfa-deployment-guide)
  cc18: 'kk000018-0000-4000-0000-000000000018', // t3K3 (privilege-separation)
  cc19: 'kk000019-0000-4000-0000-000000000019', // t3K4 (account-security-standard)
  cc20: 'kk000020-0000-4000-0000-000000000020', // t3K5 (mfa-faq)
  cc21: 'kk000021-0000-4000-0000-000000000021', // t3K6 (account-takeover-in-freight)
  cc22: 'kk000022-0000-4000-0000-000000000022', // t3K7 (lost-phone-mfa-recovery)
};

// ── KB Content ─────────────────────────────────────────────────────────────

const T1_CONTENT = {
  phishingInFreight: `# Phishing in Freight: Recognizing Scam Emails Targeting Logistics Teams

Phishing emails are the most common entry point for cyberattacks against freight and logistics companies. Unlike the generic "Nigerian prince" scams, freight-targeted phishing is designed to look exactly like the emails your team already receives every day — load board alerts, delivery exception notices, FMCSA compliance reminders, and carrier setup requests.

## Why Freight Companies Are High-Value Targets

Freight operations move fast. Dispatchers process dozens of load tenders daily. Drivers get texts about delivery windows. Finance teams receive constant invoice and payment requests. Attackers know that when a dispatcher sees "Urgent: Load Board Match — Confirm Now," they are primed to click.

The FBI has documented how cyber cargo theft works: attackers use phishing emails to steal credentials, then access TMS portals, load boards, or email accounts to create fraudulent shipping paperwork, redirect loads, or initiate payment fraud. The phishing email is not the attack itself — it is the door.

## Common Freight Phishing Lures

**Load board notifications** — Fake emails from "[DAT / Truckstop / 123Loadboard]" claiming a high-value load match or account alert.

**FMCSA or DOT compliance notices** — Emails claiming your authority is suspended, your MC number has a violation, or your DOT registration requires immediate action.

**Carrier setup or onboarding requests** — "New carrier packet" emails with attachments containing malware, or links to fake carrier portal logins.

**Invoice and payment requests** — Emails from spoofed vendor addresses requesting invoice payment to a new account.

## What You Should Do

- **Do not click links in unsolicited emails** — go directly to the official site by typing the URL.
- **Verify urgency claims** — a real FMCSA notice will give you time; a phishing email creates false urgency.
- **Report suspicious emails** — see the reporting policy in this knowledge base.
- **If you clicked**, follow the "I clicked a link" response card immediately.`,

  emailRedFlags: `# Email Red Flags: Header Spoofing, Lookalike Domains, and Urgency Patterns

Not every phishing email is obvious. The most dangerous ones are the ones that look almost exactly right. This article teaches you the specific signals to check before clicking any link or responding to any request.

## Check 1: The Sender's Actual Email Address

The display name can say anything. What matters is the actual email address in angle brackets.

- Does the domain match the company's actual domain? \`@dat.com\` for DAT, \`@fmcsa.dot.gov\` for FMCSA.
- Is the domain a lookalike? \`@dat-freight.com\`, \`@dat.support\`, \`@fmcsa-compliance.com\` are not official.
- Is it a free email provider claiming to be from a major vendor?

## Check 2: Lookalike Domains

| Legitimate | Lookalike |
|-----------|-----------|
| dat.com | dat-support.com, dat.co |
| fmcsa.dot.gov | fmcsa-dot.gov, fmcsa.compliance.com |
| quickbooks.com | quickbooksinvoice.com |

## Check 3: Urgency and Pressure Language

**High-risk phrases:**
- "Immediate action required"
- "Your account will be suspended in 24 hours"
- "Verify now to avoid penalties"

**The rule:** If the urgency is the main message, the email deserves more scrutiny, not less.

## Check 4: Mismatched Links

Hover over any link without clicking to see where it actually goes.

**Red flags:** The domain doesn't match the expected company; URL uses a shortener hiding the destination.

## Quick Reference

Before clicking: check sender address, link destination, urgency level, and whether the attachment was requested.`,

  smishingVishing: `# Smishing and Vishing: Mobile Phone Scams for Drivers and Field Staff

Phishing is not just email. Text message scams (smishing) and phone call scams (vishing) target drivers, dock workers, and field operations staff specifically because they are mobile and working under time pressure.

## Smishing: Scam Texts Targeting Freight Workers

**Fake load board alerts** — "Alert: Your DAT account has been locked. Verify now: [link]."
**Fake compliance texts** — "ELD malfunction detected on your unit. Confirm your driver ID: [link]."
**Fake pay notifications** — "Your direct deposit failed. Re-enter your bank details: [link]."

**The rule for texts:** Legitimate companies will not ask you to log in or provide sensitive information through a link in a text message. If a link is included, go to the app directly instead.

## Vishing: Phone Call Scams

**"IT support" calls** — A caller claiming to be from your TMS vendor or company IT says there is a problem with your account and they need your login. Legitimate IT does not need your password.

**"Dispatcher" impersonation** — A caller pretending to be your dispatch office asks for your current location or load details. Used to gain situational awareness for cargo diversion.

**Caller ID spoofing** — The caller's number may show as a real company's number. Caller ID cannot be trusted.

## What to Do on a Suspicious Call

1. Do not confirm or provide any information.
2. Tell the caller you will call them back on a number you look up yourself from the company's official website.
3. Hang up.
4. Report the call to your supervisor.

## For Drivers: The Short Version

- A text with a link asking you to log in = suspicious. Go to the app directly.
- A caller asking for your location or a code from your phone = suspicious. Hang up and call back.
- When in doubt: stop, verify out-of-band, then act.`,

  safeLinkHandling: `# Safe Link Handling: Hover, Verify, and Approved Channels

Links are the mechanism that turns a phishing email into a real compromise. This article gives you a repeatable process for handling every link you receive.

## The Three-Second Rule

Before clicking any link, spend three seconds on:
1. Where is it going? Hover to preview the destination URL.
2. Does the domain match the sender?
3. Is this communication expected?

## How to Read a URL

The most important part is the **domain** — the part just before the first single forward slash.

**Example:** \`https://login.customer-portal.com/dat/verify\`
Reading from right: \`customer-portal.com\` is the domain. The \`dat\` piece is a subdomain. This URL is controlled by whoever owns \`customer-portal.com\`, not DAT.

**Legitimate:** \`https://auth.dat.com/login\` — the domain is dat.com ✓
**Lookalike:** \`https://dat.auth-secure.com/login\` — the domain is auth-secure.com ✗

## Approved Channels for Freight Business

| What the link claims to do | Approved alternative |
|---------------------------|---------------------|
| Log in to your TMS | Open the TMS app or type the URL directly |
| View a load board alert | Log in directly at the load board's known URL |
| FMCSA compliance notice | Go to fmcsa.dot.gov directly |
| Invoice or payment update | Log in to your accounting portal directly |

The pattern: **bypass the link, go direct.**

## URL Shorteners Are a Red Flag

Shortened URLs hide the destination. In freight business communications, there is no legitimate reason for a vendor to send you a shortened URL.

## If You Are Not Sure

The worst outcome from not clicking a legitimate link is a small delay. The worst outcome from clicking a malicious link is a compromised account, a stolen load, or a ransomware infection.`,

  howToReport: `# How to Report a Suspicious Email, Text, or Call

Reporting suspicious communications is one of the highest-value security actions anyone in the company can take. A single report can stop an active attack before it reaches more targets.

## What to Report

- An email asking you to log in via a link and you are not certain the link is legitimate.
- An email requesting a payment, bank detail change, or wire transfer.
- A text or call asking for login credentials or one-time verification codes.
- Any communication claiming your account or compliance is at risk and demanding immediate action.
- An attachment you did not expect.
- **Any communication you acted on that may have been fraudulent.** This is especially important to report immediately.

## How to Report

1. Do not forward the suspicious email to coworkers — this spreads the risk.
2. Do not click or interact further with the suspicious communication.
3. Preserve the evidence — do not delete the email or text.
4. Report to your supervisor with: what you received, who it appeared to be from, what it asked you to do, whether you took any action, and the time and date.

## If You Already Clicked or Responded

Tell your supervisor immediately — do not wait. Every minute matters. Fast reporting enables fast account recovery. There is no blame for reporting — there is only risk from not reporting.

## Culture Note

Reporting is not about blame. Someone who clicks a link and immediately reports it has done the right thing.

Good security is a team practice. Report what you see.`,
};

const T2_CONTENT = {
  killchain: `# Phishing to Ransomware: The Three-Step Kill Chain

Most ransomware attacks in small and mid-size businesses start with a phishing email. This brief explains how a single click escalates to a company-wide encryption event.

## Why This Matters for Freight

Ransomware that encrypts a freight company's dispatch system, TMS, and communication tools means trucks go dark, loads cannot be tracked or tendered, customers cannot be contacted, and billing stops. For freight, the threat is not just data loss — it is operational paralysis.

## Step 1 — The Phishing Email (The Door)

An employee receives an email that looks legitimate: a load board alert, an invoice, a carrier compliance notice. The email contains a link or an attachment.

- If it is a link, it leads to a page that steals credentials or directly downloads malware.
- If it is an attachment, opening it executes code that installs malware silently.

The employee may notice nothing unusual. The malware is now installed.

## Step 2 — Reconnaissance and Lateral Movement (The Expansion)

This phase often takes days or weeks. The malware does several things:

**Harvests credentials** — Captures login information for TMS, load boards, email, VPN, admin portals.

**Maps the network** — Scans for other devices, file shares, backup systems.

**Moves laterally** — Using harvested credentials, the attacker accesses additional systems and installs malware on more machines.

**Disables backups** — If backups are connected to the network, the attacker deletes or encrypts them before triggering the payload.

## Step 3 — Encryption and Ransom Demand (The Lock)

Files across the network are encrypted simultaneously. Systems begin crashing. This is the first moment most organizations realize something is wrong — but the attacker has been inside for days.

## The Point

The phishing email in Step 1 is the entire prevention opportunity. The training goal is to make that click not happen.

Three behaviors stop the kill chain at Step 1:
1. Recognize the lure.
2. Report suspicious emails before acting on them.
3. Verify before clicking.`,

  iClicked: `# I Clicked a Suspicious Link — What Do I Do Right Now?

If you clicked a link in an email or text and you are not sure whether it was legitimate, do not wait. Fast action limits the damage.

## Step 1 — Do Not Click Anything Else on the Page

If a page opened, do not enter any information. Do not enter your username, password, or any personal details. If the page downloaded a file, do not open it.

## Step 2 — Disconnect the Device From the Network

If you believe malware may have been downloaded:
- On a company computer: disconnect from Wi-Fi and unplug any ethernet cable immediately.
- On your phone: turn on airplane mode.
- Do not turn off the device unless instructed by IT — powered-on devices preserve logs.

## Step 3 — Report Immediately

Tell your supervisor or security contact right now. Do not wait to see if anything happens. Key information:
- The email or text where you found the link.
- Whether you entered any information on the page.
- The approximate time you clicked.
- The device you used.

There is no penalty for reporting.

## Step 4 — Change Your Password

If the link opened a page that looked like a login page — even if you did not enter credentials — change the password for the service it was impersonating.

## Step 5 — Enable MFA

If the account does not have multi-factor authentication active, enable it now.

## Step 6 — Watch for Follow-On Indicators

In the hours and days after clicking, watch for:
- Emails sent from your account that you did not send.
- Password reset notifications for accounts you did not request.
- Unexpected charges or payment activity.

## The Short Version

Click → Disconnect if download → Report immediately → Change password → Enable MFA → Watch for follow-on signs.

The worst response is to do nothing and hope it was harmless.`,
};

const T2_BEC_CONTENT = {
  freightBecMap: `# Where BEC Happens in the Freight Payment Cycle

BEC does not attack randomly. It attacks at the specific moments in your freight payment cycle where money is about to move and where email-based requests are normal. This map identifies every vulnerable handoff point in your operations and the specific attack that targets each one.

## Stage 1: Carrier Onboarding and Setup

**What happens:** A new carrier is set up in your TMS or payment system with their bank details for future settlements.

**BEC attack:** An attacker impersonates a new carrier or a carrier rep. They send a "complete this carrier packet" email with a form collecting banking details that go directly to the attacker.

**Control:** Verify every new carrier's bank details by calling the carrier directly at a number obtained independently from their MC filing or from a prior verified contact — not from the carrier packet itself.

## Stage 2: Invoice Submission and Approval

**What happens:** A carrier, vendor, or service provider submits an invoice for services rendered.

**BEC attack:** An attacker either compromises the vendor's email account or creates a convincing spoofed email with a near-identical domain, then sends an invoice with "updated banking information."

**Control:** Cross-reference bank details on any invoice against your existing vendor file. Any invoice with new or changed payment details requires callback verification before processing.

## Stage 3: Factoring Payment Processing

**What happens:** Your AP team processes payment to a factoring company (rather than directly to the carrier), following instructions from the factor.

**BEC attack:** The attacker sends email appearing to be from the factoring company announcing new ACH or wire details for a specific carrier or for all carrier payments through that factor.

**Control:** Any change to factoring payment instructions must be verbally confirmed with your existing factoring company contact at the number you have on file.

## Stage 4: Fuel Advance and Detention/Layover Payments

**What happens:** A driver or carrier requests a fuel advance or payment for detention/layover time before the load is complete.

**BEC attack:** A fraudulent carrier (or a legitimate carrier with a compromised email account) requests the advance be sent to an account different from your payment records for that carrier.

**Control:** Fuel advances and detention payments go only to the bank account already on file for that carrier — never to a new account number provided in the payment request.

## Stage 5: Settlement and Final Payment

**What happens:** After load delivery and POD confirmation, final settlement payment is processed.

**BEC attack:** A "late change" email arrives requesting that this settlement be routed to a new account or a new entity. May be framed as "carrier is switching factors" or "billing company has changed."

**Control:** Late-stage payment routing changes require the same verification as any new bank detail — independent callback, dual approval if required by threshold.

## Stage 6: Employee Payroll Changes

**What happens:** Drivers or staff submit requests to change their direct deposit bank accounts.

**BEC attack:** Attacker sends email posing as an employee, requesting direct deposit change to a new account.

**Control:** Direct deposit changes require in-person request or a verified phone call with the employee — not just an email.

## Stage 7: Wire Transfers for Urgent Business Needs

**What happens:** An executive or manager authorizes an urgent wire transfer for a business purpose.

**BEC attack:** Executive impersonation email creates pressure for an employee to wire funds immediately, with instructions not to verify through normal channels.

**Control:** No wire transfer is executed based on an email instruction alone. Any wire request requires verbal confirmation with the authorizing person through an independent channel.

## The Single Most Useful Habit

For every payment action you take, ask: "How was this payment instruction delivered to me, and have I verified it through a channel the requester does not control?"

If the answer is "only by email" and "no" — stop and verify before proceeding.`,

  becIndicatorLibrary: `# BEC Indicator Library: How to Recognize a Payment Fraud Attempt

BEC attacks are designed to blend in. Unlike phishing emails full of misspellings and bad formatting, a well-crafted BEC email can be indistinguishable from a legitimate business message at first glance. This library maps the specific indicators to check when you receive any payment-related request.

## Indicator 1: Urgency and Time Pressure

**What it looks like:**
- "This wire must be sent today — the account closes at 3 PM."
- "We need this processed before end of business or the load will not be released."
- "Please expedite — I'm on a deadline."

**Why it matters:** Legitimate payment processes are not that fragile. A real business partner whose bank details genuinely changed can wait 30 minutes for you to call and verify. If urgency is being used to prevent verification, that is a red flag — not a reason to skip it.

## Indicator 2: Requests for Secrecy or Unusual Confidentiality

**What it looks like:**
- "Please don't mention this to your supervisor — handle it directly."
- "This is confidential — process quietly."
- "Don't discuss this with accounting until the transfer is complete."

**Why it matters:** Legitimate payment instructions do not come with secrecy requirements. Confidentiality clauses in payment requests are designed to prevent you from doing exactly what you should do: verify through another channel.

## Indicator 3: Domain or Sender Address Inconsistency

**What it looks like:**
- Email display name says "ABC Trucking Accounts" but address is \`billing@abc-trucking-pay.net\`.
- Reply-to address is different from the sender address.
- Email claims to be from your factoring company but the domain is a near-match, not the exact domain.

**How to check:** Click on the sender name in your email client to see the full email address. Even one character difference — a hyphen added, a letter substituted, a \`.net\` instead of \`.com\` — means the email is not from who it claims.

## Indicator 4: First-Time or Out-of-Pattern Request

**What it looks like:**
- You have paid this vendor for two years; this is the first email about bank details.
- Your regular contact's email suddenly starts asking about payment in a way they never have before.

**Why it matters:** Pattern breaks are a signal. If someone you have a long payment relationship with suddenly initiates an unusual payment request, verify before proceeding.

## Indicator 5: Pressure Against Verification

**What it looks like:**
- "Don't bother calling — they'll just tell you the same thing."
- "I've already cleared this with management."
- "The callback number is the same as the email — there's no need to look it up."

**Why it matters:** Legitimate requests welcome verification. Only fraudulent requests need you to skip it. Any pushback against independent verification is itself a strong indicator of fraud.

## Indicator 6: "New Account" or "Changed Banking Details" With No Prior Notice

**What it looks like:**
- "Effective immediately, please use the following new bank details."
- "We've switched factors — please update your payment records."

**Why it matters:** Banking changes do happen legitimately. But in a BEC attack, the change notification is the attack itself. The verification rule applies in every case: call and confirm before updating payment records.

## Indicator 7: Attachment With Payment Instructions

**What it looks like:**
- A PDF labeled "New ACH Instructions" or "Updated Remittance Form."
- A Word document with vendor letterhead requesting bank detail updates.

**Why it matters:** Attackers create convincing fake documents. A professional-looking PDF does not verify the bank details in it. Verify through a callback, not by inspecting the document.

## The Two-Question Checkpoint

Before acting on any payment instruction:

1. **Is this email the only source of this request?** If yes → stop and verify through an independent channel.
2. **Has anything about this request bypassed normal process?** (urgency, secrecy, first-time, new account) → stop and verify.`,

  dualApproval: `# What "Dual Approval" Means and When to Use It

Dual approval is one of the most effective controls against payment fraud. It requires two separate, independent people to review and authorize a payment — not one person approving and a second person forwarding. This article explains how it works, when it applies, and what makes it effective.

## What Dual Approval Is

Dual approval means:
- **Two separate people** independently review the payment request against the verified vendor information.
- **Both must confirm** the payment details are correct and the request is legitimate before the payment is executed.
- Neither person relies solely on the other's approval — each makes an independent judgment.

What dual approval is **not**:
- One person approving and forwarding the request to a second person to "authorize" without their own review.
- A supervisor approving a request that an employee already acted on.
- Two people approving the same email thread without independently verifying the payment destination.

## When Dual Approval Is Required

Apply dual approval to any payment or payment-change request that meets any of the following conditions:

**1. High dollar value** — set your company's threshold based on your typical transaction size. Payments above that threshold always require two approvers.

**2. Urgency or time pressure** — any request framed as urgent or time-critical. Urgency is often manufactured by attackers specifically to bypass controls. If someone is pressuring you to skip dual approval because there is no time, that pressure itself is a reason to enforce it.

**3. New payee or new account** — first-time payments to an entity, or any payment to a new or changed bank account for an existing vendor.

**4. Unusual communication channel** — the payment request arrived via personal email, text, or phone rather than your normal business process.

**5. Executive direction with unusual secrecy** — any payment request from a person claiming to be a company leader that includes a request not to verify through normal channels.

## How to Execute Dual Approval Correctly

1. **Approver 1** receives the payment request, independently verifies the payee's bank details against the existing vendor file, and does a callback if the details are new or changed.

2. **Approver 1 documents** their verification: who they called, when, what was confirmed.

3. **Approver 2** reviews the same documentation independently — they do not simply rubber-stamp Approver 1's work. They confirm the payment details look correct and the verification was completed.

4. Both approvers sign off in your payment system or in a documented log before execution.

## Why Two Approvers Stop BEC

BEC works by creating a false sense of authority and urgency that causes one person to act without verification. Dual approval structurally prevents this by requiring a second independent person to also be deceived. This is much harder for an attacker to achieve — particularly if both approvers follow the callback verification rule.

Even if one person is tricked by a convincing BEC email, the second approver provides an independent check. In practice, dual approval consistently surfaces fraud attempts that would have gotten through a single-approver process.

## The Culture Note

Some employees feel uncomfortable pushing back on urgency or requiring a second approval when pressure comes from leadership. The right response is:

"Our payment process requires dual approval for transactions like this. Let me complete the verification and get the second approval — it protects the company."

If the requestor is a legitimate company leader, they will support the process. If they resist, that resistance itself should be escalated.`,

  paymentChangePolicy: `# Payment Change Verification Policy: The Non-Negotiable Rules

Business Email Compromise (BEC) is the most financially damaging cybercrime category tracked by the FBI. In freight operations, it appears as fraudulent requests to change banking details, redirect factoring payments, or approve urgent wire transfers. This policy defines the non-negotiable controls that must be followed for any payment instruction change.

## Scope

This policy applies to all staff involved in accounts payable / accounts receivable, carrier and vendor payment processing, factoring company communications, employee direct deposit management, and any transaction involving a bank detail change or a new payee.

## The Non-Negotiable Rules

### Rule 1: No bank detail change by email alone

No change to a bank account number, routing number, wire address, or payment destination is authorized based on an email request alone — regardless of who the email appears to be from.

### Rule 2: Independent callback verification required

Every payment change request requires a callback to a verified contact using a phone number from your existing records or the company's official website — not a phone number provided in the requesting email.

Steps: (1) Locate verified contact information. (2) Call that contact directly. (3) Verbally confirm the request, new details, and reason. (4) Document the call.

### Rule 3: Dual approval for high-value or unusual changes

Any payment change that is urgent, involves a new payee, or exceeds your company's threshold requires a second approver who independently verifies — not rubber-stamps.

### Rule 4: Written documentation

All approved payment changes must be documented with the original request, the callback verification record, the approver names, and the date of execution.

## If a Fraudulent Payment Was Already Made

See the "If you already sent money" response card immediately. Speed of response is critical — banks can sometimes recover funds from unauthorized transfers within hours.`,

  becInFreight: `# BEC in Freight: Factoring Fraud, Invoice Redirection, and Executive Impersonation

Business Email Compromise (BEC) is a targeted attack where criminals use email to deceive a company into making unauthorized payments or changing financial account information. The FBI's Internet Crime Complaint Center consistently ranks BEC among the costliest cybercrime categories it tracks.

In freight and logistics, BEC has freight-specific shapes that differ from the generic executive-impersonation scenario.

## Pattern 1: Factoring Account Redirect

Freight carriers often use factoring companies to receive payment quickly on invoices. The attack: an attacker compromises the email account of your factoring company or a carrier you work with. A convincing email is sent to your AP team announcing "new banking instructions" for a carrier's factoring account. Future payments go to the attacker's account. By the time the legitimate carrier reports non-payment (often weeks later), the money is gone.

## Pattern 2: Vendor or Supplier Invoice Redirect

FinCEN has documented this pattern extensively: attackers impersonate a supplier you pay regularly and send a notice of "new banking details effective immediately" for future invoices. The invoice looks real, the amount looks right, only the bank details are wrong.

## Pattern 3: Executive Impersonation — Urgent Wire Requests

A message appears to be from a company owner, CEO, or senior manager requesting an urgent wire transfer: "I'm in a meeting — please wire $XX,XXX to this account immediately. Confidential — don't discuss with anyone."

The request exploits the employee's desire to be helpful and avoid disappointing a senior leader. The urgency and secrecy are deliberate: they prevent verification.

## Pattern 4: Detention, Layover, and Fuel Advance Fraud

A fraudulent carrier requests payment for detention or a fuel advance before a load is complete. The amount is small enough to avoid approval thresholds but the bank details have been changed.

## Pattern 5: Driver Direct Deposit Change

An attacker emails payroll pretending to be a driver requesting a change to their direct deposit bank account.

## The Common Thread Across All BEC Patterns

Every BEC attack has one goal: get money to move before verification happens. The defense is the same in every case: verify independently, using a contact you already have, before any money moves.`,

  financialEscalationTree: `# Financial Escalation Tree: Who to Call When Payment Fraud Occurs

When a payment fraud attempt is discovered — or when a fraudulent payment has already been made — the sequence and speed of escalation directly affects how much is recoverable.

## Step 1: Internal Escalation (Immediate — within minutes)

Tell your direct supervisor and the company owner or finance leader. Give them: the approximate amount, the bank account the payment was directed to, when the payment was initiated, and any communication documenting the fraudulent request.

## Step 2: Your Bank (Within 1 hour of discovery)

Call your bank's fraud department — not the general customer service line. Request a wire recall (for wire transfers) or ACH reversal. Provide: the wire amount, recipient bank name, recipient account and routing number, transfer date, and reference number.

**Critical timing:** Wire recall success rates drop sharply after 24–48 hours. Call immediately.

## Step 3: Your Cyber Insurance Carrier (Within 4 hours)

If you have a cyber liability or crime insurance policy, notify your carrier's claims line. Many policies have reporting windows (24–48 hours) for covered losses.

## Step 4: Law Enforcement — IC3 and FBI (Within 24 hours)

File a complaint at IC3.gov. The FBI's Financial Fraud Kill Chain works with financial institutions to halt and recover funds in BEC cases. Early filing gives the program more recovery options.

## Step 5: Affected Vendors or Carriers (Coordinated)

If a vendor's or carrier's account was being impersonated, notify them. They need to know their identity was used in the fraud and may have been compromised themselves.

## What Not to Do

Do not delete the fraudulent email — it is evidence. Do not contact the fraudster through the email thread. Do not make additional payments while the investigation is active.`,

  alreadySentMoney: `# If You Already Sent Money: The First 60 Minutes

If you discover that a payment was sent to a fraudulent account, the speed of your response determines how much is recoverable. Act within the first hour.

## Minute 0–5: Stop Everything and Report Internally

Stop any additional pending payments tied to the same request. Tell your supervisor and company owner right now — use your voice, do not rely on email. Give them: the amount, where it was sent, when it was sent, and the fraudulent communication.

## Minute 5–20: Call Your Bank's Fraud Line

Call your bank's fraud department — not general customer service. Say: "I need to initiate a wire recall / ACH reversal. The payment was fraudulent."

Provide: the transfer amount, destination account number and routing number, the exact date and time, and the reference number.

**This is the most time-sensitive step.** Domestic wire recalls within the first few hours have a meaningful recovery rate. International wires become difficult to recover within 24 hours.

## Minute 20–60: Document and Preserve Evidence

Preserve the original fraudulent email (with headers), any attachments, your payment records, and any approval records. Your bank, insurance carrier, and law enforcement will need this.

## Hour 1–4: Notify Your Cyber Insurance Carrier

If you have cyber or crime insurance, call the claims line now. Have your policy number and a summary ready.

## Hour 4–24: File with the FBI's IC3

File a complaint at IC3.gov. The FBI's Financial Fraud Kill Chain works with financial institutions to halt and recover BEC funds.

## What Not to Do

Do not send more money. Do not contact the fraudulent account directly. Do not delete evidence. Do not wait.

The probability of recovery is highest in the first hour — act, then gather information.`,

  evidenceCaptureChecklist: `# Evidence Capture Checklist: What to Preserve When Fraud Is Suspected

When payment fraud is suspected, the quality and completeness of evidence you preserve determines the outcome of bank recovery attempts, insurance claims, and law enforcement investigations. Apply this checklist immediately — do not wait for confirmation.

## Email Evidence

- Export the suspicious email with full headers (right-click → "View Message Source" or "Show Original"). Save as .eml or .txt.
- Note the sender's actual email address (not just the display name).
- Note the Reply-To address if different from the sender.
- Capture a screenshot of the email showing the sender field.
- Save any attachments without opening them on a network-connected device.

## Payment Records

- The payment confirmation or reference number.
- The exact dollar amount.
- The destination bank name, routing number, and account number.
- The date and time the payment was initiated and confirmed.

## Authorization Trail

- Who requested the payment.
- Who approved the payment.
- Whether dual approval was completed, and both approvers' names.

## Communication History

- All email correspondence from the fraudulent sender.
- Any phone call records: number, time, and what was discussed.

## Timeline Document

Create a chronological log: when the fraudulent communication was first received, when it was acted on, when fraud was suspected, when fraud was confirmed, and each action taken after discovery.

## Chain of Custody Note

Do not alter the original evidence. Preserve originals in a location not accessible to the attacker. Share evidence with: your bank's fraud team, cyber insurance carrier, and law enforcement.`,
};

const T3_CONTENT = {
  passwordGuidance: `# Password Guidance: Length, Passphrases, and Why Password Managers Work

Most people's passwords are weaker than they realize — and the practices that feel secure (adding special characters, rotating frequently) often do not help as much as you think. This article explains how passwords are attacked, what actually makes a password strong, and why a password manager is the practical solution for everyone managing business accounts.

## How Attackers Crack Passwords

**Credential stuffing:** An attacker takes a large list of username/password pairs from a previously leaked data breach and tries them against other services. If your password for an unrelated website was leaked, and you used the same password for your TMS, the attacker now has your TMS access.

**Brute force and dictionary attacks:** Automated tools try millions of combinations per second. Short passwords (under 12 characters) can be cracked quickly. "Password1!" is in every attacker's dictionary.

**Phishing for passwords:** Attackers just ask. A convincing login page harvests your credentials without any cracking required.

**The implication:** Strong passwords protect against brute force and credential stuffing. Only MFA protects against credential theft through phishing — which is why both strong passwords AND MFA are required.

## What Makes a Password Strong

**Length matters most.** A 16-character password is exponentially harder to crack than an 8-character password. A longer password beats a shorter "complex" one.

**Passphrases are excellent.** Four or more random words strung together ("freight dock monday orange") create a password that is long, memorable, and very hard to crack.

**Random beats predictable.** A password with your company name, a year, or your name is likely in attacker wordlists. Randomly generated passwords (from a password manager) are better.

**No forced rotation.** Changing passwords on a fixed schedule does not make them more secure — it leads to incremental changes ("Password1!" → "Password2!"). Change your password when you have reason to believe it was compromised, not on a calendar.

**No reuse across accounts.** This is the single most important habit. One breach of a low-value account (a shopping site) should not give an attacker access to your email or TMS.

## Why Password Managers Solve the Problem

The reason people reuse and simplify passwords is that remembering dozens of unique, long passwords is impossible. A password manager solves this by generating strong, random, unique passwords for every account, storing them securely, and filling them automatically when you log in.

You only need to remember one master password — the one that unlocks your vault. Make it a long, strong passphrase.

**For freight operations:** Every employee managing business accounts — TMS logins, email, load board accounts, payment portals — should be using a password manager.

## The Simplest Summary

- Long passphrase or password manager-generated password: strong
- Unique per account: required
- MFA on top: essential
- The rest is noise`,

  mfaDeploymentGuide: `# MFA Deployment Guide: Drivers, Dispatch, Finance, and Admins

Multi-factor authentication (MFA) requires a second verification step beyond a password before granting access to an account. Even if an attacker steals your password — through phishing, a data breach, or guessing — they cannot log in without also having the second factor.

## Why MFA Is Non-Negotiable for Freight Operations

CISA explicitly calls out phishing-resistant MFA as a critical control for email, VPNs, and accounts that access critical systems. Passwords alone are not sufficient. Phishing, credential stuffing, and keyloggers all bypass password protection entirely. MFA closes the gap.

A stolen TMS credential without MFA = immediate load board access, shipment manipulation, potential payment changes. A stolen TMS credential with MFA = the attacker cannot log in.

## MFA for Everyone: Email First

**Email is the master key.** Every account password reset, every security notification comes to your email inbox. An attacker who controls your email controls your ability to recover every other account. Email must have MFA.

**Setup steps:** Log in to email account settings → Security → Two-factor authentication → Choose authenticator app (preferred) or SMS → Scan QR code → Save backup codes in a secure location.

**Authenticator apps:** Microsoft Authenticator, Google Authenticator, and Authy are free and work with most services.

## Dispatch Staff: TMS and Load Board MFA

Dispatch accounts on TMS platforms and load boards must have MFA. A compromised dispatch account is a direct path to accepting fraudulent loads, viewing customer and carrier data, and modifying shipment details.

**Practical note:** Authenticator apps generate a 6-digit code that refreshes every 30 seconds. Entering it adds about 10 seconds to your login.

## Finance and AP/AR: Payment Portal MFA

Finance staff who access payment portals, accounting software, or banking platforms have the highest financial risk from compromised credentials. Use a hardware security key or authenticator app rather than SMS wherever possible.

**Note on SMS MFA:** SMS-based MFA is better than nothing but is vulnerable to SIM swap attacks. For accounts that process payments, use an authenticator app.

## Drivers: Phone-Based Accounts

Drivers operate from mobile devices. MFA focuses on: ELD app account, load board apps, work email, and carrier portal apps.

**When changing phones:** Transfer authenticator app accounts to the new phone first, verify MFA works, then wipe the old device.

## Admins: Privileged Account MFA

Admin accounts should use the strongest available method (hardware key or authenticator app) and should never use SMS. Admin accounts should also be separate from daily-use accounts.

## After Setup: Test Recovery

After enabling MFA: save your recovery codes in a secure location separate from the device being protected, and test that you can log in with MFA on a new browser session.`,

  privilegeSeparation: `# Privilege Separation: Why Admin and User Accounts Must Be Different

Privilege separation — using different accounts for high-access "admin" tasks versus everyday work — is one of the simplest and most effective security controls for small and mid-size freight companies.

## The Problem With "One Account for Everything"

In many small freight companies, the owner or operations manager has a single account they use for email, TMS administration, load board management, accounting software, and everything else. If that account is compromised — through a phishing attack or a password breach — the attacker has access to everything simultaneously:

- They can change dispatch settings in the TMS.
- They can access and modify financial records.
- They can change other users' passwords or remove other users' accounts.
- They can disable security controls.

A single compromised account with admin-level access is a total-compromise event.

## What Privilege Separation Means in Practice

**Principle of least privilege:** Every person should have the minimum access they need to do their job — no more. A dispatcher needs TMS access for dispatch functions; they do not need TMS admin access that lets them modify other users or system settings.

**Separate admin accounts:** If you have admin access to a platform (email admin, TMS admin), use a separate account for those admin tasks. Your admin account is not used for daily email or web browsing, has a different strong unique password, has MFA (ideally hardware key), and is only logged into when doing admin work.

**Real example:** An attacker sends a phishing email that captures the dispatcher's email credentials. If the dispatcher used their regular email account as the TMS admin, the attacker now has TMS admin access too. If dispatch and TMS admin are separate accounts, the email breach does not automatically transfer to TMS admin.

## Freight-Specific Applications

- **TMS administration:** Set up admin accounts separately from dispatch user accounts.
- **Email administration:** If you manage your company's email domain, use an admin account for that — not your daily email.
- **Accounting software:** Accounting admin access (ability to add payees, change bank details) should be limited to the fewest necessary people.

## When Someone Leaves

When an employee leaves, disable or delete their accounts within 24 hours. Do not transfer their account to a new employee, keep the account active "in case it is needed," or share the credentials with remaining staff temporarily.

## The Practical Starting Point

1. Identify who has admin access to your email system, TMS, and accounting software.
2. Create separate admin accounts for those people.
3. Ensure daily-use accounts for those people do not have admin permissions.
4. Apply MFA to admin accounts first.`,

  accountSecurityStandard: `# Account Security Standard for Freight Apps

Compromised credentials are the primary way attackers gain initial access to freight company systems. This policy defines the minimum account security requirements for every system used in freight operations.

## Password Requirements

- Minimum 14 characters. A four-word passphrase is easier to remember and stronger than a short complex password.
- No forced periodic rotation — change passwords when you have reason to believe they may be compromised, not on a schedule.
- No reuse across accounts.
- Password managers are required for all staff managing business accounts.

## MFA Requirements

**Tier 1 — required immediately:** Business email, VPN and remote access, TMS and load board accounts, factoring and payment portals.

**Tier 2 — required within 30 days:** Accounting and payroll software, cloud storage with business files, ELD and telematics platforms.

Acceptable MFA methods (most to least secure): hardware security key, authenticator app, email-based one-time code, SMS text code.

MFA recovery codes must be stored securely — not in the same email inbox or device that the MFA protects.

## Privilege Separation

- Separate admin accounts from daily-use accounts.
- Admin accounts should only be used for admin tasks.
- When an employee leaves, disable or delete their accounts within 24 hours. Do not reassign accounts.

## Shared Accounts

Shared accounts are prohibited for any system where individual accountability is required — TMS actions, payment approvals, email communications.

## Account Review

Conduct an account access review at least every six months to confirm all active accounts belong to current employees and MFA is active on all Tier 1 and Tier 2 accounts.`,

  mfaFaq: `# MFA Frequently Asked Questions

**What is multi-factor authentication (MFA)?**

MFA requires two or more pieces of evidence to prove your identity: (1) something you know (your password) and (2) something you have (your phone, a hardware key). Even if someone steals your password, they cannot log in without also having the second factor.

**Why do I have to use MFA? My password is strong.**

Passwords are regularly stolen without any failure on your part — through data breaches at other services you use, through phishing attacks, and through credential-stuffing attacks. A strong password is no longer sufficient protection for accounts that access freight operations or payment systems. MFA adds a layer that a stolen password alone cannot bypass.

**Which MFA method is most secure?**

From most to least secure: (1) hardware security key — phishing-resistant, not affected by SIM swaps; (2) authenticator app — strong and practical; (3) push notification — convenient but can be defeated by prompt bombing; (4) email code — acceptable; (5) SMS text code — acceptable but weakest, vulnerable to SIM swap attacks.

**What is "MFA fatigue" and how do I handle it?**

Some MFA systems send push notifications that say "Approve?" with no detail. Attackers send dozens of approval requests in rapid succession, hoping you approve one by mistake. If you receive MFA approval requests you did not initiate, do not approve them — this means someone has your password and is actively trying to log in. Deny the request, change your password, and report to your supervisor.

**What happens if I get a new phone?**

Before wiping your old phone: set up your new phone, transfer authenticator accounts to the new phone while you still have the old one, test that MFA codes work on the new phone, then wipe the old phone.

**What are recovery codes and where should I store them?**

Recovery codes allow you to access your account if you lose your MFA device. Store them in your password manager vault or printed in a secure physical location — not in the same email inbox or on the same device the MFA is protecting.

**Does MFA protect me from phishing?**

Standard MFA reduces phishing risk significantly but is not completely phishing-resistant. Hardware security keys are fully phishing-resistant — they will not work on fake sites. For most freight operations staff, authenticator app MFA is a large improvement over no MFA.`,

  accountTakeoverInFreight: `# Account Takeover in Freight: From Stolen Credentials to Rerouted Loads

Account takeover (ATO) is what happens after credential theft succeeds. An attacker has your username and password for a business-critical system. This brief traces what they can do with that access in a freight operation.

## The Initial Access: How Credentials Are Stolen

**Phishing** — A fake login page captures your credentials. You think you are logging into your TMS or email; you are handing them to an attacker.

**Data breach reuse** — A website you used years ago was breached and your email/password combination is in a leak database. If you used the same password for business accounts, the attacker has those too. This is why unique passwords per account matter.

**Credential marketplace purchases** — Stolen credentials are bought and sold on criminal marketplaces. An attacker does not need to steal the credentials themselves — they can buy access.

## What Happens When a Load Board Account Is Taken Over

Load board accounts have more access than they might appear:

- The attacker accepts loads on behalf of a carrier — the shipment leaves the legitimate shipper's dock with a fake carrier.
- The attacker changes carrier profile details — contact number, email, bank details — before payments are processed.
- The attacker sends messages from your account that appear to come from you.

## What Happens When a TMS Account Is Taken Over

A compromised TMS account gives an attacker a window into your entire operation: shipment details, customer and carrier contact information, delivery windows useful for planning physical interception, and the ability to modify shipment records.

An attacker with TMS access and patience can monitor your operations for weeks before timing a fraudulent load pickup.

## What Happens When Email Is Taken Over

Email is the most dangerous account takeover because email is the recovery method for every other account. An attacker with email access can reset passwords for every account using that email for recovery, set up forwarding rules that quietly copy all incoming email to an attacker-controlled address, and send emails to customers and vendors — who will trust them because the email comes from your real address.

**A frequent ATO pattern:** The attacker sets up a forwarding rule and never changes the password. You never know your email is compromised. For weeks, every email about payments and load schedules is being read by the attacker — used to craft a perfectly timed BEC attempt.

## How MFA Stops Account Takeover

If MFA is enabled, a stolen password alone does not provide access. For the vast majority of ATO attempts — which use credentials stolen from breaches or phishing — MFA is a complete stop. The credentials work, but without the second factor, the login fails.

This is why MFA is treated as non-negotiable for email, TMS, and payment portals: it converts credential theft from "full access" to "the attacker has a password but cannot use it."`,

  lostPhoneMfaRecovery: `# Lost Phone: MFA Recovery Step-by-Step

If your phone is lost or stolen and you use it for MFA (authenticator app or SMS codes), you need to act quickly — both to regain access to your accounts and to prevent an attacker from using your phone to approve unauthorized logins.

## Step 1: Report the Loss Immediately

Tell your supervisor and IT/MSP contact. They can help coordinate account access recovery and may be able to remotely wipe a company-issued device.

## Step 2: Secure Your Most Critical Accounts Using Recovery Codes

If you stored your MFA recovery codes (as recommended), use them now. Start with:
1. Business email — this is your recovery path for everything else.
2. TMS account.
3. Load board accounts.
4. Payment portals.

**To use a recovery code:** On the login screen, when the MFA prompt appears, look for "Use a recovery code" or "Having trouble?" Enter one of your backup codes.

After regaining access, immediately change the MFA setting to remove the lost phone and add your replacement device.

## Step 3: If You Did Not Save Recovery Codes

Contact each service's support directly. You will typically need to verify your identity and request account recovery. This process can take hours to days — which is why saving recovery codes in advance is important.

## Step 4: Remove the Lost Phone From Your MFA Setup

Once you have access, go to security settings and remove the lost phone as an MFA device, add your new phone, and generate new recovery codes.

## Step 5: Check for Unauthorized Access During the Window

After recovering access, review each account for activity during the period the phone was missing: recent logins, active sessions, sent messages you did not write, forwarding rules in email, and payment account activity.

## Step 6: Prevent This From Happening Again

Save recovery codes in your password manager, not only on the phone. Consider setting up a backup MFA method (a second device or hardware key) for critical accounts.

## The Short Version

Lost phone → Tell supervisor and IT → Use recovery codes to access email first → Remove old phone from MFA → Add new phone → Check for unauthorized activity.`,
};

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const { db } = await import('../src/db/client.js');
  const { learningModules } = await import('../src/db/schema/modules.js');
  const { kbItems } = await import('../src/db/schema/kb-items.js');
  const { kbRevisions } = await import('../src/db/schema/kb-revisions.js');
  const { lessonContentLinks } = await import('../src/db/schema/lesson-links.js');
  const { quizCandidates } = await import('../src/db/schema/quiz-candidates.js');
  const { learners } = await import('../src/db/schema/learners.js');
  const { accessOverrides } = await import('../src/db/schema/access-tiers.js');
  const { groups, groupMembers } = await import('../src/db/schema/groups.js');
  const { moduleAssignments } = await import('../src/db/schema/module-assignments.js');
  const { learnerProgress } = await import('../src/db/schema/learner-progress.js');
  const { practiceAttempts } = await import('../src/db/schema/practice-attempts.js');
  const { topics, topicRelationships } = await import('../src/db/schema/topics.js');
  const { contentChunks } = await import('../src/db/schema/content-chunks.js');
  const { eq, and, inArray, not, sql } = await import('drizzle-orm');

  const BOOTSTRAP_BY = 'bootstrap-local-proof';
  const now = new Date();

  console.log('[bootstrap] Starting local-proof bootstrap...');

  // ── 1. Modules ────────────────────────────────────────────────────────────

  await db.insert(learningModules).values([
    {
      id: IDS.t1Module,
      slug: 't1-phishing-email-security',
      title: 'Email Security & Phishing Awareness',
      description: 'Understand how phishing attacks target freight operations, how to spot red flags in email and text, and what to do when something looks wrong.',
      published: true,
      displayOrder: 1,
      estimatedMinutes: 30,
      nextModuleId: IDS.t2Module,
      createdBy: BOOTSTRAP_BY,
    },
    {
      id: IDS.t2Module,
      slug: 't2-supply-chain-threat-awareness',
      title: 'Supply Chain Threat Awareness',
      description: 'Learn how phishing escalates to ransomware, what happens during a supply chain cyber incident, and the immediate steps to take if you suspect a compromise.',
      published: true,
      displayOrder: 2,
      estimatedMinutes: 20,
      nextModuleId: null,
      createdBy: BOOTSTRAP_BY,
    },
    {
      id: IDS.t3Module,
      slug: 't3-account-security-mfa',
      title: 'Account Security and MFA',
      description: 'Understand credential threats, how to create and manage strong passwords, why MFA is required for every freight business account, and how to recover if access is lost.',
      published: true,
      displayOrder: 3,
      estimatedMinutes: 25,
      nextModuleId: null,
      createdBy: BOOTSTRAP_BY,
    },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ Modules');

  // ── 2. KB Items ──────────────────────────────────────────────────────────

  await db.insert(kbItems).values([
    // T1
    { id: IDS.t1K1Item, slug: 't1-phishing-in-freight', title: 'Phishing in Freight: Recognizing Scam Emails Targeting Logistics Teams', type: 'training-content', tags: ['phishing', 'freight', 'email'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t1K1Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t1K2Item, slug: 't1-email-red-flags', title: 'Email Red Flags: Header Spoofing, Lookalike Domains, and Urgency Patterns', type: 'training-content', tags: ['phishing', 'email', 'red-flags'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t1K2Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t1K3Item, slug: 't1-smishing-vishing-drivers', title: 'Smishing and Vishing: Mobile Phone Scams for Drivers and Field Staff', type: 'training-content', tags: ['smishing', 'vishing', 'drivers', 'mobile'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t1K3Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t1K4Item, slug: 't1-safe-link-handling', title: 'Safe Link Handling: Hover, Verify, and Approved Channels', type: 'training-content', tags: ['links', 'url', 'verification'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t1K4Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t1K5Item, slug: 't1-how-to-report-suspicious', title: 'How to Report a Suspicious Email, Text, or Call', type: 'training-content', tags: ['reporting', 'incident-response'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t1K5Rev, learnerVisible: true, publishedAt: now },
    // T2
    { id: IDS.t2K1Item, slug: 't2-phishing-ransomware-killchain', title: 'Phishing to Ransomware: The Three-Step Kill Chain', type: 'training-content', tags: ['ransomware', 'kill-chain', 'phishing'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t2K1Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t2K2Item, slug: 't2-i-clicked-immediate-steps', title: 'I Clicked a Suspicious Link — Immediate Steps', type: 'training-content', tags: ['incident-response', 'clicked', 'phishing'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t2K2Rev, learnerVisible: true, publishedAt: now },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ KB items');

  // ── 3. KB Revisions ──────────────────────────────────────────────────────

  await db.insert(kbRevisions).values([
    // T1
    { id: IDS.t1K1Rev, itemId: IDS.t1K1Item, content: T1_CONTENT.phishingInFreight, version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t1K2Rev, itemId: IDS.t1K2Item, content: T1_CONTENT.emailRedFlags, version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t1K3Rev, itemId: IDS.t1K3Item, content: T1_CONTENT.smishingVishing, version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t1K4Rev, itemId: IDS.t1K4Item, content: T1_CONTENT.safeLinkHandling, version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t1K5Rev, itemId: IDS.t1K5Item, content: T1_CONTENT.howToReport, version: 1, createdBy: BOOTSTRAP_BY },
    // T2
    { id: IDS.t2K1Rev, itemId: IDS.t2K1Item, content: T2_CONTENT.killchain, version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t2K2Rev, itemId: IDS.t2K2Item, content: T2_CONTENT.iClicked, version: 1, createdBy: BOOTSTRAP_BY },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ KB revisions');

  // ── 4. Lesson Content Links ──────────────────────────────────────────────

  await db.insert(lessonContentLinks).values([
    // T1 — 5 primary tasks
    { id: IDS.lc1, moduleId: IDS.t1Module, kbItemId: IDS.t1K1Item, role: 'primary', order: 0, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc2, moduleId: IDS.t1Module, kbItemId: IDS.t1K2Item, role: 'primary', order: 1, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc3, moduleId: IDS.t1Module, kbItemId: IDS.t1K3Item, role: 'primary', order: 2, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc4, moduleId: IDS.t1Module, kbItemId: IDS.t1K4Item, role: 'primary', order: 3, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc5, moduleId: IDS.t1Module, kbItemId: IDS.t1K5Item, role: 'primary', order: 4, addedBy: BOOTSTRAP_BY },
    // T2 — 2 primary tasks
    { id: IDS.lc6, moduleId: IDS.t2Module, kbItemId: IDS.t2K1Item, role: 'primary', order: 0, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc7, moduleId: IDS.t2Module, kbItemId: IDS.t2K2Item, role: 'primary', order: 1, addedBy: BOOTSTRAP_BY },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ Lesson content links');

  // ── 5. T1 Practice Questions (skip if already seeded) ────────────────────

  const existingT1Q = await db
    .select({ id: quizCandidates.id })
    .from(quizCandidates)
    .where(and(
      inArray(quizCandidates.kbItemId, [IDS.t1K1Item, IDS.t1K2Item, IDS.t1K3Item, IDS.t1K4Item, IDS.t1K5Item]),
      eq(quizCandidates.status, 'promoted'),
    ));

  if (existingT1Q.length < 15) {
    console.log(`[bootstrap] T1 questions: ${existingT1Q.length} promoted found, seeding to 15...`);
    console.log('[bootstrap]   Run: npx tsx --env-file=.env seed-t1-questions.ts from backend/ to seed t1 questions');
  } else {
    console.log(`[bootstrap] ✓ T1 questions (${existingT1Q.length} already seeded, skipping)`);
  }

  // ── 6. T2 Practice Questions ─────────────────────────────────────────────

  await db.insert(quizCandidates).values([
    {
      id: IDS.t2Q1,
      kbItemId: IDS.t2K1Item,
      revisionId: IDS.t2K1Rev,
      questionText: 'According to the kill chain model, what is the primary prevention opportunity that training targets?',
      options: [
        'Step 2 — prevent lateral movement by patching all network devices.',
        'Step 3 — decrypt ransomware before it completes encryption.',
        'Step 1 — prevent the employee from clicking the phishing email.',
        'Step 2 — detect the attacker during the reconnaissance phase before Step 3.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Step 1 — the phishing email click — is the only stage where a single human decision can stop the entire attack. Once malware is installed (Step 1 complete), the organization moves from prevention to detection and response. Training targets Step 1 because it is the highest-leverage point.',
      status: 'promoted',
      confidence: 0.96,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2Q2,
      kbItemId: IDS.t2K1Item,
      revisionId: IDS.t2K1Rev,
      questionText: 'During the lateral movement phase of a ransomware attack, attackers commonly target backup systems because:',
      options: [
        'Backups contain the most sensitive employee personal data.',
        'Destroying or encrypting backups prevents the victim from recovering without paying.',
        'Backup systems typically have the weakest passwords in any network.',
        'Backup data is the primary target for sale on criminal markets.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Attackers disable or encrypt backups before triggering the ransomware payload specifically to eliminate the victim\'s ability to restore systems independently. This maximizes pressure to pay the ransom. "Double extortion" — encrypting data AND threatening to publish stolen data — is used when exfiltration is also possible.',
      status: 'promoted',
      confidence: 0.94,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2Q3,
      kbItemId: IDS.t2K2Item,
      revisionId: IDS.t2K2Rev,
      questionText: 'You clicked a link in a suspicious email. The page that opened looked like your TMS login — you did not enter any credentials. What should you do next?',
      options: [
        'Close the browser tab and continue working — no credentials were entered so no action is needed.',
        'Change your TMS password immediately, report the incident to your supervisor, and monitor for unusual account activity.',
        'Wait 24 hours to see if anything unusual happens before reporting.',
        'Forward the email to a colleague to get a second opinion on whether it was legitimate.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Even without entering credentials, a malicious page may have attempted to capture a session cookie, browser token, or other authentication artifact. Change the password for the impersonated service, report immediately, and monitor for follow-on activity. Waiting or forwarding to colleagues increases risk.',
      status: 'promoted',
      confidence: 0.95,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2Q4,
      kbItemId: IDS.t2K2Item,
      revisionId: IDS.t2K2Rev,
      questionText: 'You suspect malware was downloaded when you clicked a link. Before calling IT, you should:',
      options: [
        'Restart the computer to clear any running malware processes.',
        'Run a full antivirus scan to identify and remove the malware first.',
        'Disconnect the device from the network (Wi-Fi off, ethernet unplugged) without shutting it down.',
        'Delete your browser history and temporary files to remove the malware.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Disconnecting from the network immediately prevents malware from communicating with the attacker\'s command-and-control server, stops lateral movement to other devices, and limits data exfiltration — all before IT is even on the call. Do NOT restart the device, as a powered-on device preserves forensic logs. Do not attempt to clean it yourself.',
      status: 'promoted',
      confidence: 0.97,
      promotedToModuleId: IDS.t2Module,
    },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ T2 practice questions');

  // ── 7. Learner Accounts ──────────────────────────────────────────────────
  // handle = normalizeHandle(email) — strips @, ., and non-alphanumeric chars
  // eva.restricted@fiveeyes.dev   → evarestrictedfiveyesdev
  // alex.individual@fiveeyes.dev  → alexindividualfiveyesdev
  // sam.professional@fiveeyes.dev → samprofessionalfiveyesdev

  await db.insert(learners).values([
    {
      id: IDS.evaLearner,
      handle: 'evarestrictedfiveyesdev',
      rawEmail: 'eva.restricted@fiveeyes.dev',
      fullName: 'Eva Restricted',
      company: 'Transport Co Ltd',
      role: 'Operations Assistant',
    },
    {
      id: IDS.alexLearner,
      handle: 'alexindividualfiveyesdev',
      rawEmail: 'alex.individual@fiveeyes.dev',
      fullName: 'Alex Morgan',
      company: 'Transport Co Ltd',
      role: 'Dispatcher',
    },
    {
      id: IDS.samLearner,
      handle: 'samprofessionalfiveyesdev',
      rawEmail: 'sam.professional@fiveeyes.dev',
      fullName: 'Sam Reeves',
      company: 'Freight Solutions UK',
      role: 'Security Lead',
    },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ Learner accounts');

  // ── 8. Access Overrides ──────────────────────────────────────────────────
  // Eva: no override → hits access gate
  // Alex: individual tier (training + KB/chat, no TTX)
  // Sam: professional tier (training + TTX)

  for (const row of [
    {
      id: IDS.ao1,
      learnerId: IDS.alexLearner,
      tier: 'individual',
      reason: 'local-proof individual access',
      grantedBy: BOOTSTRAP_BY,
      expiresAt: null,
    },
    {
      id: IDS.ao2,
      learnerId: IDS.samLearner,
      tier: 'professional',
      reason: 'local-proof professional access',
      grantedBy: BOOTSTRAP_BY,
      expiresAt: null,
    },
  ]) {
    await db.insert(accessOverrides).values(row)
      .onConflictDoUpdate({
        target: accessOverrides.learnerId,
        set: { tier: row.tier, reason: row.reason, grantedBy: row.grantedBy },
      });
  }

  console.log('[bootstrap] ✓ Access overrides');

  // ── 9. Groups + Members ──────────────────────────────────────────────────

  await db.insert(groups).values([
    {
      id: IDS.transportOpsGroup,
      slug: 'transport-ops',
      name: 'Transport Operations',
      description: 'Dispatchers and operations staff at Transport Co Ltd',
    },
    {
      id: IDS.freightSecGroup,
      slug: 'freight-security',
      name: 'Freight Security Team',
      description: 'Security leads and compliance officers at Freight Solutions UK',
    },
  ]).onConflictDoNothing();

  await db.insert(groupMembers).values([
    { id: IDS.gm1, groupId: IDS.transportOpsGroup, learnerId: IDS.evaLearner },
    { id: IDS.gm2, groupId: IDS.transportOpsGroup, learnerId: IDS.alexLearner },
    { id: IDS.gm3, groupId: IDS.freightSecGroup, learnerId: IDS.samLearner },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ Groups and memberships');

  // ── 10. Module Assignments ───────────────────────────────────────────────
  // Alex (individual): t1 only — restricted catalog
  // Sam (professional): t1 + t2 — broader catalog

  await db.insert(moduleAssignments).values([
    { id: IDS.ma1, moduleId: IDS.t1Module, learnerId: IDS.alexLearner, assignedBy: BOOTSTRAP_BY },
    { id: IDS.ma2, moduleId: IDS.t1Module, learnerId: IDS.samLearner, assignedBy: BOOTSTRAP_BY },
    { id: IDS.ma3, moduleId: IDS.t2Module, learnerId: IDS.samLearner, assignedBy: BOOTSTRAP_BY },
    { id: IDS.ma4, moduleId: IDS.t3Module, learnerId: IDS.samLearner, assignedBy: BOOTSTRAP_BY },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ Module assignments');

  // ── 11. Learner Progress ─────────────────────────────────────────────────
  // Eva: no progress (never accessed platform)
  // Alex: t1 started — viewed content, not completed any checkpoint yet
  // Sam: t1 completed (12/15, 80%), t2 started (in progress)

  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  await db.insert(learnerProgress).values([
    {
      id: IDS.lp1,
      learnerId: IDS.alexLearner,
      moduleId: IDS.t1Module,
      status: 'started',
      score: null,
      total: null,
      percentage: null,
      lastAttemptAt: oneDayAgo,
      completedAt: null,
    },
    {
      id: IDS.lp2,
      learnerId: IDS.samLearner,
      moduleId: IDS.t1Module,
      status: 'completed',
      score: 12,
      total: 15,
      percentage: 80,
      lastAttemptAt: twoWeeksAgo,
      completedAt: twoWeeksAgo,
    },
    {
      id: IDS.lp3,
      learnerId: IDS.samLearner,
      moduleId: IDS.t2Module,
      status: 'started',
      score: null,
      total: null,
      percentage: null,
      lastAttemptAt: threeDaysAgo,
      completedAt: null,
    },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ Learner progress');

  // ── 12. Practice Attempts ────────────────────────────────────────────────
  // Sam completed t1 with 12/15 (80%, passed). Store a realistic attempt record.

  const t1PracticeResults = [
    { questionId: 'bootstrap-q1',  correct: true,  selectedIndex: 3, correctIndex: 3, explanation: 'Navigating directly to the known URL bypasses credential-harvesting pages.' },
    { questionId: 'bootstrap-q2',  correct: true,  selectedIndex: 2, correctIndex: 2, explanation: 'Urgency combined with consequences is the primary freight phishing tactic.' },
    { questionId: 'bootstrap-q3',  correct: true,  selectedIndex: 2, correctIndex: 2, explanation: 'Stolen dispatcher credentials enable freight fraud directly.' },
    { questionId: 'bootstrap-q4',  correct: true,  selectedIndex: 1, correctIndex: 1, explanation: 'The actual email domain, not the display name, reveals spoofing.' },
    { questionId: 'bootstrap-q5',  correct: false, selectedIndex: 0, correctIndex: 3, explanation: 'Lookalike domains use slight variations — always read the full domain.' },
    { questionId: 'bootstrap-q6',  correct: true,  selectedIndex: 2, correctIndex: 2, explanation: 'Urgency language is the most reliable phishing indicator.' },
    { questionId: 'bootstrap-q7',  correct: true,  selectedIndex: 1, correctIndex: 1, explanation: 'Hover before clicking reveals the actual destination URL.' },
    { questionId: 'bootstrap-q8',  correct: true,  selectedIndex: 0, correctIndex: 0, explanation: 'Smishing uses the same urgency and credential-theft tactics as email phishing.' },
    { questionId: 'bootstrap-q9',  correct: true,  selectedIndex: 3, correctIndex: 3, explanation: 'Hang up and call back on a known number — never trust caller ID.' },
    { questionId: 'bootstrap-q10', correct: false, selectedIndex: 1, correctIndex: 2, explanation: 'Legitimate IT never needs your password to assist you.' },
    { questionId: 'bootstrap-q11', correct: true,  selectedIndex: 2, correctIndex: 2, explanation: 'The domain is the authoritative part of the URL — everything before the first slash after the TLD.' },
    { questionId: 'bootstrap-q12', correct: true,  selectedIndex: 0, correctIndex: 0, explanation: 'Shortened URLs hide the destination and have no legitimate use in freight business communications.' },
    { questionId: 'bootstrap-q13', correct: true,  selectedIndex: 3, correctIndex: 3, explanation: 'Bypass the link — go to the vendor portal directly.' },
    { questionId: 'bootstrap-q14', correct: false, selectedIndex: 2, correctIndex: 0, explanation: 'Report first — do not forward. Forwarding spreads the risk to more people.' },
    { questionId: 'bootstrap-q15', correct: true,  selectedIndex: 1, correctIndex: 1, explanation: 'Reporting enables the company to respond before a small incident becomes large.' },
  ];

  await db.insert(practiceAttempts).values([
    {
      id: IDS.pa1,
      learnerId: IDS.samLearner,
      moduleId: IDS.t1Module,
      score: 12,
      total: 15,
      percentage: 80,
      passed: true,
      results: t1PracticeResults,
      attemptedAt: twoWeeksAgo,
    },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ Practice attempts');

  // ── 13. Topics + Topic Relationships ─────────────────────────────────────
  // Bootstrap items were never run through the ingestion pipeline, so they have
  // no topic_relationships. Seed topics and link each item to its primary topics.
  // Topics use ON CONFLICT (slug) DO NOTHING so pipeline-created duplicates are tolerated.
  // We resolve actual IDs by slug after insert, handling the case where a same-slug
  // topic already exists with a pipeline-assigned UUID.

  const BOOTSTRAP_TOPICS = [
    { id: IDS.topicPhishing,          slug: 'phishing-emails',    name: 'Phishing Emails',    description: 'Email-based phishing attacks targeting freight and logistics operations' },
    { id: IDS.topicFreightSecurity,   slug: 'freight-security',   name: 'Freight Security',   description: 'Security practices for freight and logistics teams' },
    { id: IDS.topicLinkVerification,  slug: 'link-verification',  name: 'Link Verification',  description: 'URL inspection and safe link-handling practices' },
    { id: IDS.topicIncidentResponse,  slug: 'incident-response',  name: 'Incident Response',  description: 'Steps to take when a security incident occurs' },
    { id: IDS.topicRansomware,        slug: 'ransomware',         name: 'Ransomware',         description: 'Ransomware threats, kill chain, and prevention' },
    { id: IDS.topicMobileScams,       slug: 'mobile-scams',       name: 'Mobile Scams',       description: 'Smishing and vishing scams targeting mobile workers' },
    { id: IDS.topicBecFraud,          slug: 'bec-fraud',          name: 'BEC and Payment Fraud', description: 'Business email compromise, payment fraud, and invoice redirect attacks in freight' },
    { id: IDS.topicPasswordSecurity,  slug: 'password-security',  name: 'Password Security',  description: 'Password strength, credential hygiene, and privilege separation' },
    { id: IDS.topicMfa,               slug: 'mfa',                name: 'Multi-Factor Authentication', description: 'MFA deployment, methods, and recovery for freight business accounts' },
  ];

  for (const t of BOOTSTRAP_TOPICS) {
    await db.execute(sql`
      INSERT INTO topics (id, slug, name, description, created_at)
      VALUES (${t.id}, ${t.slug}, ${t.name}, ${t.description}, NOW())
      ON CONFLICT (slug) DO NOTHING
    `);
  }

  // Resolve actual topic IDs (may differ from IDS.* if pipeline created same-slug topics)
  const resolvedTopics = await db
    .select({ id: topics.id, slug: topics.slug })
    .from(topics)
    .where(inArray(topics.slug, BOOTSTRAP_TOPICS.map(t => t.slug)));
  const topicIdBySlug = new Map(resolvedTopics.map(r => [r.slug, r.id]));

  // Topic relationship definitions for bootstrap KB items
  const TR_DEFS = [
    { id: IDS.tr1,  itemId: IDS.t1K1Item,    slug: 'phishing-emails',   weight: 1.0 },
    { id: IDS.tr2,  itemId: IDS.t1K1Item,    slug: 'freight-security',  weight: 0.8 },
    { id: IDS.tr3,  itemId: IDS.t1K2Item,    slug: 'phishing-emails',   weight: 1.0 },
    { id: IDS.tr4,  itemId: IDS.t1K2Item,    slug: 'link-verification', weight: 0.8 },
    { id: IDS.tr5,  itemId: IDS.t1K3Item,    slug: 'mobile-scams',      weight: 1.0 },
    { id: IDS.tr6,  itemId: IDS.t1K3Item,    slug: 'phishing-emails',   weight: 0.7 },
    { id: IDS.tr7,  itemId: IDS.t1K4Item,    slug: 'link-verification', weight: 1.0 },
    { id: IDS.tr8,  itemId: IDS.t1K5Item,    slug: 'incident-response', weight: 1.0 },
    { id: IDS.tr9,  itemId: IDS.t2K1Item, slug: 'ransomware',        weight: 1.0 },
    { id: IDS.tr10, itemId: IDS.t2K1Item, slug: 'phishing-emails',   weight: 0.8 },
    { id: IDS.tr11, itemId: IDS.t2K2Item, slug: 'incident-response', weight: 1.0 },
    { id: IDS.tr12, itemId: IDS.t2K2Item, slug: 'ransomware',        weight: 0.7 },
    // T2 BEC (tr13-tr23) and T3 (tr24-tr32) are inserted in Sections 17 and 19
    // respectively, after those KB items have been created.
  ];

  const trValues = TR_DEFS
    .map(r => ({ id: r.id, itemId: r.itemId, topicId: topicIdBySlug.get(r.slug), weight: r.weight, assignedBy: BOOTSTRAP_BY }))
    .filter((r): r is { id: string; itemId: string; topicId: string; weight: number; assignedBy: string } => r.topicId !== undefined);

  if (trValues.length > 0) {
    await db.insert(topicRelationships).values(trValues).onConflictDoNothing();
  }

  console.log(`[bootstrap] ✓ Topics (${BOOTSTRAP_TOPICS.length}) and topic relationships (${trValues.length})`);

  // ── 14. Content Chunks ───────────────────────────────────────────────────
  // Bootstrap KB items bypass the ingestion pipeline, so no content_chunks exist.
  // Seed one chunk per item using the full revision content.
  // This makes FTS work for local-proof learners in the KB Help panel.

  // T1 + legacy T2 chunks only — T2 BEC and T3 chunks inserted after their KB items in Sections 17/19
  await db.insert(contentChunks).values([
    { id: IDS.cc1,  itemId: IDS.t1K1Item, revisionId: IDS.t1K1Rev, chunkIndex: 0, content: T1_CONTENT.phishingInFreight, tokenCount: Math.ceil(T1_CONTENT.phishingInFreight.length / 4) },
    { id: IDS.cc2,  itemId: IDS.t1K2Item, revisionId: IDS.t1K2Rev, chunkIndex: 0, content: T1_CONTENT.emailRedFlags,     tokenCount: Math.ceil(T1_CONTENT.emailRedFlags.length / 4) },
    { id: IDS.cc3,  itemId: IDS.t1K3Item, revisionId: IDS.t1K3Rev, chunkIndex: 0, content: T1_CONTENT.smishingVishing,  tokenCount: Math.ceil(T1_CONTENT.smishingVishing.length / 4) },
    { id: IDS.cc4,  itemId: IDS.t1K4Item, revisionId: IDS.t1K4Rev, chunkIndex: 0, content: T1_CONTENT.safeLinkHandling, tokenCount: Math.ceil(T1_CONTENT.safeLinkHandling.length / 4) },
    { id: IDS.cc5,  itemId: IDS.t1K5Item, revisionId: IDS.t1K5Rev, chunkIndex: 0, content: T1_CONTENT.howToReport,      tokenCount: Math.ceil(T1_CONTENT.howToReport.length / 4) },
    { id: IDS.cc6,  itemId: IDS.t2K1Item, revisionId: IDS.t2K1Rev, chunkIndex: 0, content: T2_CONTENT.killchain,        tokenCount: Math.ceil(T2_CONTENT.killchain.length / 4) },
    { id: IDS.cc7,  itemId: IDS.t2K2Item, revisionId: IDS.t2K2Rev, chunkIndex: 0, content: T2_CONTENT.iClicked,         tokenCount: Math.ceil(T2_CONTENT.iClicked.length / 4) },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ Content chunks T1 + legacy T2 (FTS enabled)');

  // ── 15. Update T2 module to BEC and Payment Protection ───────────────────
  // The t2Module row was inserted with placeholder slug/title in Section 1.
  // Now update it to the real BEC module values and set nextModuleId → t3Module.
  // This UPDATE runs every time — it is safe to re-run.

  await db.update(learningModules)
    .set({
      slug: 't2-bec-payment-protection',
      title: 'BEC and Payment Protection',
      description: 'Understand how business email compromise targets freight payment cycles, how to recognize fraud indicators, how dual approval stops attacks, and what to do when fraud is discovered.',
      estimatedMinutes: 30,
      nextModuleId: IDS.t3Module,
    })
    .where(eq(learningModules.id, IDS.t2Module));

  console.log('[bootstrap] ✓ T2 module updated to BEC and Payment Protection');

  // ── 16. Delete legacy T2 lesson content links ─────────────────────────────
  // Remove the old lc6/lc7 links that pointed t2Module at the legacy phishing
  // KB items (killchain / iClicked). The legacy KB items stay in the DB (FK safety).

  await db.delete(lessonContentLinks)
    .where(inArray(lessonContentLinks.id, [IDS.lc6, IDS.lc7]));

  console.log('[bootstrap] ✓ Legacy T2 lesson content links removed');

  // ── 16b. Clean up pipeline-created items that conflict with bootstrap slugs ─
  // The ingestion pipeline may have created kb_items with these slugs using random
  // UUIDs. The bootstrap needs to own these items with fixed UUIDs for idempotency.
  // Delete pipeline conflicts (those NOT using our fixed bootstrap UUIDs) + their deps.

  const bootstrapOwnedSlugs = [
    't2-bec-indicator-library',
    't3-password-guidance', 't3-mfa-deployment-guide', 't3-privilege-separation',
    't3-account-security-standard', 't3-mfa-faq', 't3-account-takeover-in-freight',
    't3-lost-phone-mfa-recovery',
  ];
  const bootstrapFixedIds = [
    IDS.t2BecK2Item,
    IDS.t3K1Item, IDS.t3K2Item, IDS.t3K3Item, IDS.t3K4Item,
    IDS.t3K5Item, IDS.t3K6Item, IDS.t3K7Item,
  ];

  const pipelineConflicts = await db
    .select({ id: kbItems.id })
    .from(kbItems)
    .where(and(
      inArray(kbItems.slug, bootstrapOwnedSlugs),
      not(inArray(kbItems.id, bootstrapFixedIds)),
    ));

  if (pipelineConflicts.length > 0) {
    const conflictIds = pipelineConflicts.map(r => r.id);
    await db.delete(contentChunks).where(inArray(contentChunks.itemId, conflictIds));
    await db.delete(quizCandidates).where(inArray(quizCandidates.kbItemId, conflictIds));
    await db.delete(topicRelationships).where(inArray(topicRelationships.itemId, conflictIds));
    await db.delete(lessonContentLinks).where(inArray(lessonContentLinks.kbItemId, conflictIds));
    // Null out current_revision_id before deleting revisions (circular FK safety)
    await db.update(kbItems).set({ currentRevisionId: null }).where(inArray(kbItems.id, conflictIds));
    await db.delete(kbRevisions).where(inArray(kbRevisions.itemId, conflictIds));
    await db.delete(kbItems).where(inArray(kbItems.id, conflictIds));
    console.log(`[bootstrap] ✓ Cleaned ${conflictIds.length} pipeline-created item(s) conflicting with bootstrap slugs`);
  }

  // ── 17. T2 BEC KB items, revisions, and lesson content links ─────────────

  await db.insert(kbItems).values([
    // T2 BEC training-content (primary study items)
    { id: IDS.t2BecK1Item, slug: 't2-bec-freight-payment-map', title: 'Where BEC Happens in the Freight Payment Cycle', type: 'training-content', tags: ['bec', 'payment-fraud', 'freight'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t2BecK1Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t2BecK2Item, slug: 't2-bec-indicator-library', title: 'BEC Indicator Library: How to Recognize a Payment Fraud Attempt', type: 'training-content', tags: ['bec', 'indicators', 'fraud-recognition'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t2BecK2Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t2BecK3Item, slug: 't2-bec-dual-approval', title: 'What "Dual Approval" Means and When to Use It', type: 'training-content', tags: ['dual-approval', 'payment-controls', 'bec'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t2BecK3Rev, learnerVisible: true, publishedAt: now },
    // T2 BEC reference items (policy / faq / threat-brief)
    { id: IDS.t2BecK4Item, slug: 't2-bec-payment-change-policy', title: 'Payment Change Verification Policy: The Non-Negotiable Rules', type: 'policy', tags: ['policy', 'payment-verification', 'bec'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t2BecK4Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t2BecK5Item, slug: 't2-bec-in-freight-threat-brief', title: 'BEC in Freight: Factoring Fraud, Invoice Redirection, and Executive Impersonation', type: 'threat-brief', tags: ['bec', 'factoring', 'freight', 'threat'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t2BecK5Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t2BecK6Item, slug: 't2-bec-financial-escalation-tree', title: 'Financial Escalation Tree: Who to Call When Payment Fraud Occurs', type: 'policy', tags: ['escalation', 'incident-response', 'bec'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t2BecK6Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t2BecK7Item, slug: 't2-bec-already-sent-money', title: 'If You Already Sent Money: The First 60 Minutes', type: 'faq', tags: ['fraud-response', 'wire-recall', 'bec'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t2BecK7Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t2BecK8Item, slug: 't2-bec-evidence-capture-checklist', title: 'Evidence Capture Checklist: What to Preserve When Fraud Is Suspected', type: 'policy', tags: ['evidence', 'incident-response', 'bec'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t2BecK8Rev, learnerVisible: true, publishedAt: now },
  ]).onConflictDoNothing();

  await db.insert(kbRevisions).values([
    { id: IDS.t2BecK1Rev, itemId: IDS.t2BecK1Item, content: T2_BEC_CONTENT.freightBecMap,           version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t2BecK2Rev, itemId: IDS.t2BecK2Item, content: T2_BEC_CONTENT.becIndicatorLibrary,     version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t2BecK3Rev, itemId: IDS.t2BecK3Item, content: T2_BEC_CONTENT.dualApproval,            version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t2BecK4Rev, itemId: IDS.t2BecK4Item, content: T2_BEC_CONTENT.paymentChangePolicy,     version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t2BecK5Rev, itemId: IDS.t2BecK5Item, content: T2_BEC_CONTENT.becInFreight,            version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t2BecK6Rev, itemId: IDS.t2BecK6Item, content: T2_BEC_CONTENT.financialEscalationTree, version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t2BecK7Rev, itemId: IDS.t2BecK7Item, content: T2_BEC_CONTENT.alreadySentMoney,        version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t2BecK8Rev, itemId: IDS.t2BecK8Item, content: T2_BEC_CONTENT.evidenceCaptureChecklist, version: 1, createdBy: BOOTSTRAP_BY },
  ]).onConflictDoNothing();

  await db.insert(lessonContentLinks).values([
    { id: IDS.lc_t2bec_1, moduleId: IDS.t2Module, kbItemId: IDS.t2BecK1Item, role: 'primary',       order: 0, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t2bec_2, moduleId: IDS.t2Module, kbItemId: IDS.t2BecK2Item, role: 'primary',       order: 1, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t2bec_3, moduleId: IDS.t2Module, kbItemId: IDS.t2BecK3Item, role: 'primary',       order: 2, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t2bec_4, moduleId: IDS.t2Module, kbItemId: IDS.t2BecK4Item, role: 'supplementary', order: 3, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t2bec_5, moduleId: IDS.t2Module, kbItemId: IDS.t2BecK5Item, role: 'supplementary', order: 4, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t2bec_6, moduleId: IDS.t2Module, kbItemId: IDS.t2BecK6Item, role: 'supplementary', order: 5, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t2bec_7, moduleId: IDS.t2Module, kbItemId: IDS.t2BecK7Item, role: 'supplementary', order: 6, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t2bec_8, moduleId: IDS.t2Module, kbItemId: IDS.t2BecK8Item, role: 'supplementary', order: 7, addedBy: BOOTSTRAP_BY },
  ]).onConflictDoNothing();

  // T2 BEC topic relationships (tr13-tr23) — inserted here so KB items exist
  const T2_BEC_TR_DEFS = [
    { id: IDS.tr13, itemId: IDS.t2BecK1Item, slug: 'bec-fraud',         weight: 1.0 },
    { id: IDS.tr14, itemId: IDS.t2BecK1Item, slug: 'freight-security',  weight: 0.8 },
    { id: IDS.tr15, itemId: IDS.t2BecK2Item, slug: 'bec-fraud',         weight: 1.0 },
    { id: IDS.tr16, itemId: IDS.t2BecK3Item, slug: 'bec-fraud',         weight: 1.0 },
    { id: IDS.tr17, itemId: IDS.t2BecK4Item, slug: 'bec-fraud',         weight: 1.0 },
    { id: IDS.tr18, itemId: IDS.t2BecK5Item, slug: 'bec-fraud',         weight: 1.0 },
    { id: IDS.tr19, itemId: IDS.t2BecK5Item, slug: 'freight-security',  weight: 0.7 },
    { id: IDS.tr20, itemId: IDS.t2BecK6Item, slug: 'bec-fraud',         weight: 1.0 },
    { id: IDS.tr21, itemId: IDS.t2BecK6Item, slug: 'incident-response', weight: 0.8 },
    { id: IDS.tr22, itemId: IDS.t2BecK7Item, slug: 'bec-fraud',         weight: 1.0 },
    { id: IDS.tr23, itemId: IDS.t2BecK8Item, slug: 'bec-fraud',         weight: 1.0 },
  ];
  const t2BecTrValues = T2_BEC_TR_DEFS
    .map(r => ({ id: r.id, itemId: r.itemId, topicId: topicIdBySlug.get(r.slug), weight: r.weight, assignedBy: BOOTSTRAP_BY }))
    .filter((r): r is { id: string; itemId: string; topicId: string; weight: number; assignedBy: string } => r.topicId !== undefined);
  if (t2BecTrValues.length > 0) {
    await db.insert(topicRelationships).values(t2BecTrValues).onConflictDoNothing();
  }

  // T2 BEC content chunks — inserted here so KB items + revisions exist
  await db.insert(contentChunks).values([
    { id: IDS.cc8,  itemId: IDS.t2BecK1Item, revisionId: IDS.t2BecK1Rev, chunkIndex: 0, content: T2_BEC_CONTENT.freightBecMap,            tokenCount: Math.ceil(T2_BEC_CONTENT.freightBecMap.length / 4) },
    { id: IDS.cc9,  itemId: IDS.t2BecK2Item, revisionId: IDS.t2BecK2Rev, chunkIndex: 0, content: T2_BEC_CONTENT.becIndicatorLibrary,      tokenCount: Math.ceil(T2_BEC_CONTENT.becIndicatorLibrary.length / 4) },
    { id: IDS.cc10, itemId: IDS.t2BecK3Item, revisionId: IDS.t2BecK3Rev, chunkIndex: 0, content: T2_BEC_CONTENT.dualApproval,             tokenCount: Math.ceil(T2_BEC_CONTENT.dualApproval.length / 4) },
    { id: IDS.cc11, itemId: IDS.t2BecK4Item, revisionId: IDS.t2BecK4Rev, chunkIndex: 0, content: T2_BEC_CONTENT.paymentChangePolicy,      tokenCount: Math.ceil(T2_BEC_CONTENT.paymentChangePolicy.length / 4) },
    { id: IDS.cc12, itemId: IDS.t2BecK5Item, revisionId: IDS.t2BecK5Rev, chunkIndex: 0, content: T2_BEC_CONTENT.becInFreight,             tokenCount: Math.ceil(T2_BEC_CONTENT.becInFreight.length / 4) },
    { id: IDS.cc13, itemId: IDS.t2BecK6Item, revisionId: IDS.t2BecK6Rev, chunkIndex: 0, content: T2_BEC_CONTENT.financialEscalationTree,  tokenCount: Math.ceil(T2_BEC_CONTENT.financialEscalationTree.length / 4) },
    { id: IDS.cc14, itemId: IDS.t2BecK7Item, revisionId: IDS.t2BecK7Rev, chunkIndex: 0, content: T2_BEC_CONTENT.alreadySentMoney,         tokenCount: Math.ceil(T2_BEC_CONTENT.alreadySentMoney.length / 4) },
    { id: IDS.cc15, itemId: IDS.t2BecK8Item, revisionId: IDS.t2BecK8Rev, chunkIndex: 0, content: T2_BEC_CONTENT.evidenceCaptureChecklist, tokenCount: Math.ceil(T2_BEC_CONTENT.evidenceCaptureChecklist.length / 4) },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ T2 BEC KB items, revisions, lesson content links, content chunks');

  // ── 18. T2 BEC Practice Questions (12) ───────────────────────────────────

  await db.insert(quizCandidates).values([
    {
      id: IDS.t2BecQ1,
      kbItemId: IDS.t2BecK1Item,
      revisionId: IDS.t2BecK1Rev,
      questionText: 'Your AP team receives an email from "FastPay Factoring <support@fastpay-billing.net>" announcing new ACH details for a carrier you regularly pay. What is the correct next step?',
      options: [
        'Update the carrier\'s payment record with the new ACH details.',
        'Reply to the email asking for confirmation before updating.',
        'Do not update the record. Call FastPay Factoring at the number on file to verify the request is legitimate.',
        'Forward the email to your manager for approval before acting.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Never update payment records based on an email alone. The phone number provided in the email may be attacker-controlled. You must call a number you already have on file — from prior correspondence or the company\'s official website — to verify independently.',
      status: 'promoted',
      confidence: 0.97,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ2,
      kbItemId: IDS.t2BecK2Item,
      revisionId: IDS.t2BecK2Rev,
      questionText: 'Which of the following is the most reliable indicator that a payment change request may be a BEC attack?',
      options: [
        'The email uses formal business language.',
        'The email was received during business hours.',
        'The email creates urgency and includes a request not to verify through normal channels.',
        'The email is from a vendor you have paid before.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Urgency combined with pressure against verification is the defining BEC signal. Legitimate businesses do not need you to skip verification — only fraudulent requests require it. The combination of manufactured urgency and requests not to verify independently is the BEC playbook.',
      status: 'promoted',
      confidence: 0.96,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ3,
      kbItemId: IDS.t2BecK2Item,
      revisionId: IDS.t2BecK2Rev,
      questionText: 'An email from what appears to be your CEO says: "Wire $18,500 to this account today. Confidential — don\'t discuss with accounting." What should you do?',
      options: [
        'Do not wire the money. Call the CEO directly on their personal number (not a number in the email) to verify this is a legitimate request.',
        'Wire the money — the CEO has authority to authorize transfers.',
        'Wire the money but document it as executive-directed.',
        'Ask the CEO to follow up with an email from their official address.',
      ],
      suggestedCorrectIndex: 0,
      explanation: 'This is a textbook executive impersonation BEC attack. The secrecy instruction ("don\'t discuss with accounting") and urgency are designed to prevent verification. Any wire request from an executive via email alone requires verbal confirmation through an independent channel — not the email thread or a number from the email.',
      status: 'promoted',
      confidence: 0.97,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ4,
      kbItemId: IDS.t2BecK1Item,
      revisionId: IDS.t2BecK1Rev,
      questionText: 'A carrier\'s email account has been compromised. What is the most likely BEC attack the attacker will launch using that access?',
      options: [
        'Phishing emails sent to the carrier\'s own employees.',
        'Fraudulent payment redirect notices sent to the brokers, shippers, or factoring companies that pay the carrier.',
        'Load board account takeover to steal loads.',
        'Ransomware deployment against the carrier\'s network.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'With access to a carrier\'s email account, the attacker monitors ongoing payment conversations and injects fraudulent payment redirect instructions at the right moment in the payment cycle — targeting the brokers, shippers, or factors who are about to pay the carrier. This is the factoring fraud and invoice redirect pattern.',
      status: 'promoted',
      confidence: 0.95,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ5,
      kbItemId: IDS.t2BecK3Item,
      revisionId: IDS.t2BecK3Rev,
      questionText: 'Your company has a $5,000 wire transfer threshold for dual approval. A $4,800 payment request arrives with the instruction "urgent — please process before close of business." What is the correct response?',
      options: [
        'Apply dual approval anyway — the urgency framing is a BEC indicator regardless of the amount being below the threshold.',
        'Process the payment — it is under the threshold.',
        'Process the payment but document the urgency claim.',
        'Ask the requester to resubmit the request without the urgency framing.',
      ],
      suggestedCorrectIndex: 0,
      explanation: 'Dual approval requirements are not only triggered by dollar thresholds. Any request framed as urgent — regardless of amount — meets the urgency trigger for dual approval. Attackers deliberately size requests below thresholds. The urgency framing itself is a BEC indicator and a reason to apply extra scrutiny.',
      status: 'promoted',
      confidence: 0.96,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ6,
      kbItemId: IDS.t2BecK1Item,
      revisionId: IDS.t2BecK1Rev,
      questionText: 'Which verification channel is acceptable for confirming a payment change request?',
      options: [
        'Replying to the email that contained the payment change request.',
        'Calling the phone number provided in the payment change email.',
        'Calling the contact at the number you have in your existing vendor file or the company\'s official website.',
        'Sending a chat message to the contact through your TMS.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'The email and any contact information in it may be attacker-controlled. The only valid verification channel is a phone number you already have on file from prior verified correspondence or the company\'s official website — not a number provided in the same message you are trying to verify.',
      status: 'promoted',
      confidence: 0.97,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ7,
      kbItemId: IDS.t2BecK2Item,
      revisionId: IDS.t2BecK2Rev,
      questionText: 'A vendor calls you on a number you do not have on file and says they need to confirm the new bank details in the email they just sent. What should you do?',
      options: [
        'Confirm the details over the phone — they called you, so they are legitimate.',
        'Tell the caller you will verify through the number you have on file and call them back there. Do not confirm any payment details on a call you did not initiate.',
        'Confirm the account number only, not the routing number.',
        'Ask the caller to send a follow-up email.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Attackers use caller ID spoofing and unsolicited calls as the "verification" channel for their own fraud — staging a call to confirm the fraudulent details they sent by email. Never confirm payment details on a call you did not initiate. Call back at the number you have on file.',
      status: 'promoted',
      confidence: 0.96,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ8,
      kbItemId: IDS.t2BecK2Item,
      revisionId: IDS.t2BecK2Rev,
      questionText: 'An email arrives from `accounting@yourbroker.co` (where your actual broker is `yourbroker.com`) requesting an invoice payment to a new account. The `.co` domain instead of `.com` is:',
      options: [
        'A normal variation — `.co` domains are widely used.',
        'A strong indicator this is a spoofed domain. The payment request should be treated as suspicious and verified independently before any action.',
        'Acceptable if the email content and formatting look correct.',
        'Only significant if the email also uses urgency language.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'A one-character domain difference (\`.co\` vs \`.com\`) is a classic lookalike domain used in BEC. The email is not from your broker — it is from whoever registered \`yourbroker.co\`. Domain inconsistency is an independent BEC indicator, regardless of whether the email also uses urgency. Always verify.',
      status: 'promoted',
      confidence: 0.95,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ9,
      kbItemId: IDS.t2BecK1Item,
      revisionId: IDS.t2BecK1Rev,
      questionText: 'In a BEC attack on a freight company, what does the attacker typically do with access to an employee\'s email account?',
      options: [
        'Send spam from the account to external lists.',
        'Monitor the account for payment-related conversations, then insert fraudulent instructions at the right moment in the payment cycle.',
        'Change the employee\'s password and lock them out immediately.',
        'Use the account to access the TMS directly.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Sophisticated BEC attackers are patient. Once they have email access, they monitor incoming and outgoing correspondence about payments, vendor relationships, and factoring arrangements. They wait for the right moment — when a payment is about to be made — and then inject fraudulent redirect instructions that appear contextually legitimate.',
      status: 'promoted',
      confidence: 0.95,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ10,
      kbItemId: IDS.t2BecK1Item,
      revisionId: IDS.t2BecK1Rev,
      questionText: 'An invoice arrives from a long-standing vendor with a note at the bottom: "Please note: we have updated our banking details. Please use the new ACH information below for this and all future invoices." How should this be handled?',
      options: [
        'Update the vendor\'s payment record — long-standing vendors have established relationships.',
        'Do not update the record yet. Call the vendor at the number in your existing file to confirm this change is legitimate before processing any payment to the new account.',
        'Process this invoice to the old account but update records for future invoices.',
        'Email the vendor asking them to resend the change notice on company letterhead.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The length of a vendor relationship does not reduce the need for verification — it may increase attacker preparation time. Banking detail changes on invoices are one of the most common BEC delivery mechanisms. The vendor\'s email account may have been compromised. Call the number you already have on file to confirm independently.',
      status: 'promoted',
      confidence: 0.96,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ11,
      kbItemId: IDS.t2BecK2Item,
      revisionId: IDS.t2BecK2Rev,
      questionText: 'A BEC email instructs you to "please use the callback number in this email to verify." The correct response is:',
      options: [
        'Call the number — the attacker provided it for verification.',
        'Do not use a phone number provided in the suspicious email. Locate the contact\'s verified number independently from your records or official website.',
        'Call the number only if you recognize the area code.',
        'Ask a colleague to call the number on your behalf.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'A phone number provided in the suspicious email is controlled by the attacker. Calling it "verifies" the fraud to the attacker, not to you. The only valid callback number is one you already have on file or one you independently locate from the company\'s official website. The instruction to use the email\'s own number is itself a BEC indicator.',
      status: 'promoted',
      confidence: 0.97,
      promotedToModuleId: IDS.t2Module,
    },
    {
      id: IDS.t2BecQ12,
      kbItemId: IDS.t2BecK3Item,
      revisionId: IDS.t2BecK3Rev,
      questionText: 'Which action by a second approver in a dual-approval process provides effective fraud protection?',
      options: [
        'The second approver independently reviews the payment request and verification documentation and forms their own judgment before approving.',
        'The second approver confirms the first approver\'s authorization is visible in the system.',
        'The second approver checks that the amount is within the authorized range.',
        'The second approver reads the email thread and approves if it looks legitimate.',
      ],
      suggestedCorrectIndex: 0,
      explanation: 'Dual approval only stops BEC if the second approver independently evaluates the payment — not if they simply confirm the first approver acted. If both approvers read the same fraudulent email and each approves without independent verification, dual approval provides no protection. The value of the second approver is their independent judgment.',
      status: 'promoted',
      confidence: 0.96,
      promotedToModuleId: IDS.t2Module,
    },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ T2 BEC practice questions (12)');

  // ── 19. T3 KB items, revisions, and lesson content links ──────────────────

  await db.insert(kbItems).values([
    // T3 training-content (primary study items)
    { id: IDS.t3K1Item, slug: 't3-password-guidance', title: 'Password Guidance: Length, Passphrases, and Why Password Managers Work', type: 'training-content', tags: ['passwords', 'credential-security', 'password-manager'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t3K1Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t3K2Item, slug: 't3-mfa-deployment-guide', title: 'MFA Deployment Guide: Drivers, Dispatch, Finance, and Admins', type: 'training-content', tags: ['mfa', 'two-factor', 'account-security'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t3K2Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t3K3Item, slug: 't3-privilege-separation', title: 'Privilege Separation: Why Admin and User Accounts Must Be Different', type: 'training-content', tags: ['privilege-separation', 'admin-accounts', 'least-privilege'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t3K3Rev, learnerVisible: true, publishedAt: now },
    // T3 reference items (policy / faq / threat-brief)
    { id: IDS.t3K4Item, slug: 't3-account-security-standard', title: 'Account Security Standard for Freight Apps', type: 'policy', tags: ['policy', 'account-security', 'mfa', 'passwords'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t3K4Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t3K5Item, slug: 't3-mfa-faq', title: 'MFA Frequently Asked Questions', type: 'faq', tags: ['mfa', 'faq', 'authenticator-app', 'recovery-codes'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t3K5Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t3K6Item, slug: 't3-account-takeover-in-freight', title: 'Account Takeover in Freight: From Stolen Credentials to Rerouted Loads', type: 'threat-brief', tags: ['ato', 'credential-theft', 'tms', 'load-board'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t3K6Rev, learnerVisible: true, publishedAt: now },
    { id: IDS.t3K7Item, slug: 't3-lost-phone-mfa-recovery', title: 'Lost Phone: MFA Recovery Step-by-Step', type: 'faq', tags: ['mfa-recovery', 'lost-phone', 'recovery-codes'], status: 'published', sourceTrust: 'internal', createdBy: BOOTSTRAP_BY, currentRevisionId: IDS.t3K7Rev, learnerVisible: true, publishedAt: now },
  ]).onConflictDoNothing();

  await db.insert(kbRevisions).values([
    { id: IDS.t3K1Rev, itemId: IDS.t3K1Item, content: T3_CONTENT.passwordGuidance,         version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t3K2Rev, itemId: IDS.t3K2Item, content: T3_CONTENT.mfaDeploymentGuide,       version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t3K3Rev, itemId: IDS.t3K3Item, content: T3_CONTENT.privilegeSeparation,      version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t3K4Rev, itemId: IDS.t3K4Item, content: T3_CONTENT.accountSecurityStandard,  version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t3K5Rev, itemId: IDS.t3K5Item, content: T3_CONTENT.mfaFaq,                   version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t3K6Rev, itemId: IDS.t3K6Item, content: T3_CONTENT.accountTakeoverInFreight, version: 1, createdBy: BOOTSTRAP_BY },
    { id: IDS.t3K7Rev, itemId: IDS.t3K7Item, content: T3_CONTENT.lostPhoneMfaRecovery,     version: 1, createdBy: BOOTSTRAP_BY },
  ]).onConflictDoNothing();

  await db.insert(lessonContentLinks).values([
    { id: IDS.lc_t3_1, moduleId: IDS.t3Module, kbItemId: IDS.t3K1Item, role: 'primary',       order: 0, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t3_2, moduleId: IDS.t3Module, kbItemId: IDS.t3K2Item, role: 'primary',       order: 1, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t3_3, moduleId: IDS.t3Module, kbItemId: IDS.t3K3Item, role: 'primary',       order: 2, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t3_4, moduleId: IDS.t3Module, kbItemId: IDS.t3K4Item, role: 'supplementary', order: 3, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t3_5, moduleId: IDS.t3Module, kbItemId: IDS.t3K5Item, role: 'supplementary', order: 4, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t3_6, moduleId: IDS.t3Module, kbItemId: IDS.t3K6Item, role: 'supplementary', order: 5, addedBy: BOOTSTRAP_BY },
    { id: IDS.lc_t3_7, moduleId: IDS.t3Module, kbItemId: IDS.t3K7Item, role: 'supplementary', order: 6, addedBy: BOOTSTRAP_BY },
  ]).onConflictDoNothing();

  // T3 topic relationships (tr24-tr32) — inserted here so KB items exist
  const T3_TR_DEFS = [
    { id: IDS.tr24, itemId: IDS.t3K1Item, slug: 'password-security', weight: 1.0 },
    { id: IDS.tr25, itemId: IDS.t3K2Item, slug: 'mfa',               weight: 1.0 },
    { id: IDS.tr26, itemId: IDS.t3K3Item, slug: 'password-security', weight: 1.0 },
    { id: IDS.tr27, itemId: IDS.t3K4Item, slug: 'password-security', weight: 0.9 },
    { id: IDS.tr28, itemId: IDS.t3K4Item, slug: 'mfa',               weight: 0.9 },
    { id: IDS.tr29, itemId: IDS.t3K5Item, slug: 'mfa',               weight: 1.0 },
    { id: IDS.tr30, itemId: IDS.t3K6Item, slug: 'password-security', weight: 0.8 },
    { id: IDS.tr31, itemId: IDS.t3K6Item, slug: 'mfa',               weight: 0.8 },
    { id: IDS.tr32, itemId: IDS.t3K7Item, slug: 'mfa',               weight: 1.0 },
  ];
  const t3TrValues = T3_TR_DEFS
    .map(r => ({ id: r.id, itemId: r.itemId, topicId: topicIdBySlug.get(r.slug), weight: r.weight, assignedBy: BOOTSTRAP_BY }))
    .filter((r): r is { id: string; itemId: string; topicId: string; weight: number; assignedBy: string } => r.topicId !== undefined);
  if (t3TrValues.length > 0) {
    await db.insert(topicRelationships).values(t3TrValues).onConflictDoNothing();
  }

  // T3 content chunks — inserted here so KB items + revisions exist
  await db.insert(contentChunks).values([
    { id: IDS.cc16, itemId: IDS.t3K1Item, revisionId: IDS.t3K1Rev, chunkIndex: 0, content: T3_CONTENT.passwordGuidance,         tokenCount: Math.ceil(T3_CONTENT.passwordGuidance.length / 4) },
    { id: IDS.cc17, itemId: IDS.t3K2Item, revisionId: IDS.t3K2Rev, chunkIndex: 0, content: T3_CONTENT.mfaDeploymentGuide,       tokenCount: Math.ceil(T3_CONTENT.mfaDeploymentGuide.length / 4) },
    { id: IDS.cc18, itemId: IDS.t3K3Item, revisionId: IDS.t3K3Rev, chunkIndex: 0, content: T3_CONTENT.privilegeSeparation,      tokenCount: Math.ceil(T3_CONTENT.privilegeSeparation.length / 4) },
    { id: IDS.cc19, itemId: IDS.t3K4Item, revisionId: IDS.t3K4Rev, chunkIndex: 0, content: T3_CONTENT.accountSecurityStandard,  tokenCount: Math.ceil(T3_CONTENT.accountSecurityStandard.length / 4) },
    { id: IDS.cc20, itemId: IDS.t3K5Item, revisionId: IDS.t3K5Rev, chunkIndex: 0, content: T3_CONTENT.mfaFaq,                   tokenCount: Math.ceil(T3_CONTENT.mfaFaq.length / 4) },
    { id: IDS.cc21, itemId: IDS.t3K6Item, revisionId: IDS.t3K6Rev, chunkIndex: 0, content: T3_CONTENT.accountTakeoverInFreight, tokenCount: Math.ceil(T3_CONTENT.accountTakeoverInFreight.length / 4) },
    { id: IDS.cc22, itemId: IDS.t3K7Item, revisionId: IDS.t3K7Rev, chunkIndex: 0, content: T3_CONTENT.lostPhoneMfaRecovery,     tokenCount: Math.ceil(T3_CONTENT.lostPhoneMfaRecovery.length / 4) },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ T3 KB items, revisions, lesson content links, content chunks');

  // ── 20. T3 Practice Questions (12) ───────────────────────────────────────

  await db.insert(quizCandidates).values([
    {
      id: IDS.t3Q1,
      kbItemId: IDS.t3K1Item,
      revisionId: IDS.t3K1Rev,
      questionText: 'An employee uses the same password for their work email, TMS login, and a personal news site they registered years ago. A data breach at the news site exposes the password. What is the risk to the freight company?',
      options: [
        'Minimal — the breach is at an unrelated site.',
        'High — the attacker can now attempt that password against the work email and TMS, which may grant access to dispatch operations and communications.',
        'Moderate — the attacker would need to also guess the username.',
        'Low — the TMS requires a different username format.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Credential stuffing — trying leaked username/password combinations against other services — is one of the most common account takeover methods. Password reuse means a breach of any low-value account potentially unlocks every account using the same password. This is why unique passwords per account are required.',
      status: 'promoted',
      confidence: 0.97,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q2,
      kbItemId: IDS.t3K2Item,
      revisionId: IDS.t3K2Rev,
      questionText: 'A dispatcher\'s TMS account shows a login from an unfamiliar city at 2 AM. The dispatcher did not log in at that time. What should happen immediately?',
      options: [
        'Change the TMS password and monitor for more activity.',
        'Change the password, revoke all active sessions, check for unauthorized changes in the TMS, enable MFA if not already active, and report to a supervisor.',
        'Contact the TMS vendor to ask about the login.',
        'Wait to see if additional suspicious activity occurs before escalating.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'An unfamiliar login is evidence of account compromise — not suspicious activity to monitor. The full response is required immediately: change the password from an unaffected device, revoke all active sessions (the attacker may still be logged in), check for unauthorized changes (modified load records, payment details, user access), enable MFA, and report. Monitoring while the attacker has access extends the compromise window.',
      status: 'promoted',
      confidence: 0.96,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q3,
      kbItemId: IDS.t3K1Item,
      revisionId: IDS.t3K1Rev,
      questionText: 'Which of the following passwords is the strongest?',
      options: [
        '`D!spatch@2024` (12 characters with uppercase, symbols, number)',
        '`freight dock monday orange` (26 characters, four random words)',
        '`P@ssw0rd123!` (12 characters with symbol substitution)',
        '`CarrierRouteNorth52` (19 characters, but predictable pattern)',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Length is the most important factor in password strength. A 26-character passphrase of four random words is exponentially harder to crack than a 12-character "complex" password, even one with uppercase, numbers, and symbols. Symbol substitution (@ for a, 0 for o) is well-known to attackers and provides minimal protection. The four-word passphrase also avoids predictable patterns.',
      status: 'promoted',
      confidence: 0.95,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q4,
      kbItemId: IDS.t3K1Item,
      revisionId: IDS.t3K1Rev,
      questionText: 'According to NIST digital identity guidance, when should you change a password?',
      options: [
        'Every 90 days, regardless of whether a breach occurred.',
        'Every 30 days for business accounts.',
        'When you have reason to believe it was compromised, when you receive a breach notification, or when your IT/security contact requests it.',
        'Annually, during your security review.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'NIST SP 800-63B explicitly advises against periodic forced password rotation. Rotating passwords on a schedule leads to predictable incremental changes ("Password1!" → "Password2!") that are easy for attackers to guess. Change passwords when there is a specific reason — a breach notification, evidence of compromise, or a security team request.',
      status: 'promoted',
      confidence: 0.95,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q5,
      kbItemId: IDS.t3K2Item,
      revisionId: IDS.t3K2Rev,
      questionText: 'A dispatcher receives three MFA approval notifications on their phone for their TMS account within two minutes — they did not initiate any login. What does this indicate?',
      options: [
        'A system error is generating phantom notifications.',
        'Someone has the dispatcher\'s TMS password and is attempting to log in, hoping the dispatcher will approve one of the push notifications.',
        'The TMS account needs to be reconfigured.',
        'The dispatcher\'s phone needs a software update.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Multiple unsolicited MFA push notifications are the signature of an MFA fatigue attack. The attacker has the correct password and is sending rapid push notifications hoping the recipient will approve one by mistake or out of frustration. This is confirmation of a live credential compromise attempt — the correct response is to deny all notifications, change the password immediately, and report.',
      status: 'promoted',
      confidence: 0.97,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q6,
      kbItemId: IDS.t3K2Item,
      revisionId: IDS.t3K2Rev,
      questionText: 'What is the correct response to receiving MFA approval requests you did not initiate?',
      options: [
        'Deny all requests, change your password immediately, report to your supervisor, and check the account for unauthorized access.',
        'Approve one to stop the notifications, then change your password.',
        'Ignore the notifications — they will stop on their own.',
        'Contact your phone carrier about the notifications.',
      ],
      suggestedCorrectIndex: 0,
      explanation: 'Approving one notification to stop them is exactly what the attacker wants — it grants them account access. Ignoring them means the attacker keeps trying. The correct sequence: deny all, change password immediately (from a different device if possible), report to supervisor, and check the account for any unauthorized changes made before the notifications started.',
      status: 'promoted',
      confidence: 0.97,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q7,
      kbItemId: IDS.t3K2Item,
      revisionId: IDS.t3K2Rev,
      questionText: 'Which MFA method is most secure for a finance employee who manages payment portals?',
      options: [
        'SMS text codes.',
        'Email verification codes.',
        'An authenticator app (Microsoft Authenticator, Google Authenticator) or hardware security key.',
        'A backup email address.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'SMS MFA is vulnerable to SIM swap attacks, where an attacker redirects your phone number to a SIM they control. Email codes depend on your email account being secure — and finance accounts are high-value targets. An authenticator app generates time-based codes on your device that an attacker cannot intercept via SIM swap. Hardware security keys provide the strongest protection and are phishing-resistant.',
      status: 'promoted',
      confidence: 0.96,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q8,
      kbItemId: IDS.t3K3Item,
      revisionId: IDS.t3K3Rev,
      questionText: 'An employee has admin access to the company\'s TMS and uses the same account for daily email and dispatch work. Why is this a security risk?',
      options: [
        'If their daily-use account is compromised through phishing or a credential breach, the attacker immediately has TMS admin access — the most privileged access in the system.',
        'Admin accounts are slower to log in.',
        'Daily use causes admin accounts to accumulate unnecessary email.',
        'This is acceptable practice if the account has a strong password.',
      ],
      suggestedCorrectIndex: 0,
      explanation: 'This is the privilege separation problem. The daily-use account is exposed to phishing emails, potentially compromised websites, and everyday credential risk. Keeping admin access in the same account means any compromise of the daily-use account immediately transfers to admin-level access. Separate accounts contain the blast radius of a successful attack.',
      status: 'promoted',
      confidence: 0.96,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q9,
      kbItemId: IDS.t3K1Item,
      revisionId: IDS.t3K1Rev,
      questionText: 'What is the primary benefit of using a password manager for business accounts?',
      options: [
        'Password managers make login faster.',
        'Password managers provide more secure storage than browser-saved passwords.',
        'Password managers allow you to use unique, strong passwords for every account without needing to remember them all — eliminating the reuse problem.',
        'Password managers protect against phishing attacks on their own.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'The root cause of most credential-based breaches is password reuse. People reuse passwords because remembering dozens of unique, long passwords is impossible. A password manager solves this directly — it generates and stores unique, randomly-generated passwords for every account so the user only needs to remember one strong master password. Eliminating reuse eliminates credential stuffing risk.',
      status: 'promoted',
      confidence: 0.95,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q10,
      kbItemId: IDS.t3K3Item,
      revisionId: IDS.t3K3Rev,
      questionText: 'An employee who managed carrier onboarding leaves the company. Their TMS account is kept active "in case we need to look something up." Why is this a problem?',
      options: [
        'An active account with no active owner is an unmonitored access point — it could be misused by the departed employee, or its credentials could be compromised without detection.',
        'Unused accounts cause TMS performance issues.',
        'The account may have billing implications.',
        'It is only a problem if the employee left on bad terms.',
      ],
      suggestedCorrectIndex: 0,
      explanation: 'Active accounts for departed employees are dormant attack surfaces. The departed employee may still have the password. The credentials may be exposed in a breach without anyone noticing because no one is monitoring the account. There is no legitimate reason to keep an account active after an employee leaves — disable or delete within 24 hours.',
      status: 'promoted',
      confidence: 0.96,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q11,
      kbItemId: IDS.t3K2Item,
      revisionId: IDS.t3K2Rev,
      questionText: 'Which of the following is true about SMS-based MFA?',
      options: [
        'SMS MFA is equivalent in security to authenticator app MFA.',
        'SMS MFA is better than no MFA but is vulnerable to SIM swap attacks — attackers can sometimes redirect your phone number to a SIM they control. Authenticator apps are more secure.',
        'SMS MFA is the most recommended MFA method.',
        'SMS MFA is not an acceptable MFA method for any business accounts.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'SMS MFA is meaningfully better than no MFA — it stops the vast majority of automated credential stuffing attacks. However, it is weaker than authenticator apps because SIM swap attacks can redirect SMS codes to an attacker-controlled SIM. For accounts that process payments or have admin access, use an authenticator app. For all other accounts, SMS MFA is an acceptable starting point.',
      status: 'promoted',
      confidence: 0.95,
      promotedToModuleId: IDS.t3Module,
    },
    {
      id: IDS.t3Q12,
      kbItemId: IDS.t3K3Item,
      revisionId: IDS.t3K3Rev,
      questionText: 'A freight company\'s owner uses the same login for their company email admin panel and their daily email. This violates which security principle?',
      options: [
        'Least authority',
        'Privilege separation — admin access should use a dedicated account separate from daily-use accounts.',
        'Multi-factor authentication',
        'Password uniqueness',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Privilege separation requires that administrative access — which has the power to add users, change configurations, set forwarding rules, and disable security controls — be kept in a dedicated account used only for admin tasks. Mixing admin access with a daily-use email account means any phishing compromise of the daily email immediately grants admin-level power to the attacker.',
      status: 'promoted',
      confidence: 0.95,
      promotedToModuleId: IDS.t3Module,
    },
  ]).onConflictDoNothing();

  console.log('[bootstrap] ✓ T3 practice questions (12)');

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log('');
  console.log('[bootstrap] ✅ Local-proof bootstrap complete.');
  console.log('');
  console.log('  Modules:');
  console.log('    t1-phishing-email-security  (5 tasks, 15 questions)');
  console.log('    t2-bec-payment-protection   (3 primary tasks + 5 reference items, 12 questions)');
  console.log('    t3-account-security-mfa     (3 primary tasks + 4 reference items, 12 questions)');
  console.log('');
  console.log('  Learner accounts:');
  console.log('    eva.restricted@fiveeyes.dev   — no package (hits access gate)');
  console.log('    alex.individual@fiveeyes.dev  — individual access, t1 assigned, in progress');
  console.log('    sam.professional@fiveeyes.dev — professional access, t1+t2+t3, t1 completed 80%');
  console.log('');
  console.log('  Groups:');
  console.log('    transport-ops (Eva + Alex)');
  console.log('    freight-security (Sam)');
  console.log('');
  console.log('  Admin login: arnettmcmurray@gmail.com / $ADMIN_PASSWORD (changeme locally)');
  console.log('  Learner OTP: request OTP at /login, check Mailpit at http://localhost:8025');

  process.exit(0);
}

main().catch(err => {
  console.error('[bootstrap] FATAL:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
