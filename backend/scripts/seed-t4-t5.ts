/**
 * Content expansion seed — T4 and T5 modules.
 *
 * T4: Freight Vendor Impersonation & Invoice Fraud
 * T5: Warehouse Ransomware Response
 *
 * Idempotent: ON CONFLICT DO NOTHING on all inserts.
 * Run: npx tsx --env-file=.env scripts/seed-t4-t5.ts
 */

const SEED_BY = 'seed-content-expansion';

// ── Fixed IDs ────────────────────────────────────────────────────────────────

const IDS = {
  // Existing: T3 module (to update nextModuleId)
  t3Module: 'b5c6d7e8-f9a0-4bcd-efab-123456789abc',
  // Existing: T3 KB items reused as supplementary
  t2BecK4Item: 'aa000004-0000-4000-0000-000000000004', // payment-change-policy
  t2BecK8Item: 'aa000008-0000-4000-0000-000000000008', // evidence-capture-checklist
  t2K1Item:    'c6d7e8f9-a0b1-4234-cdef-012345678901', // phishing-ransomware-killchain
  t2K2Item:    'd8e9f0a1-b2c3-4456-ef01-234567890123', // i-clicked-immediate-steps
  t1K5Item:    '4aacad81-97b3-4a51-8082-5c8402ab168a', // how-to-report-suspicious
  // Existing learner
  samLearner: '33333333-3333-4333-a333-333333333333',

  // T4 Module
  t4Module:   'ba000001-0000-4000-0000-000000000001',
  // T4 KB items
  t4K1Item:   'ba010001-0000-4000-0000-000000000001', // invoice-fraud-in-freight
  t4K2Item:   'ba010002-0000-4000-0000-000000000002', // vendor-banking-change-redflags
  t4K3Item:   'ba010003-0000-4000-0000-000000000003', // invoice-verification-procedures
  // T4 KB revisions
  t4K1Rev:    'ba020001-0000-4000-0000-000000000001',
  t4K2Rev:    'ba020002-0000-4000-0000-000000000002',
  t4K3Rev:    'ba020003-0000-4000-0000-000000000003',
  // T4 lesson content links
  lc_t4_1:    'ba040001-0000-4000-0000-000000000001', // t4 + t4K1 (primary)
  lc_t4_2:    'ba040002-0000-4000-0000-000000000002', // t4 + t4K2 (primary)
  lc_t4_3:    'ba040003-0000-4000-0000-000000000003', // t4 + t4K3 (primary)
  lc_t4_4:    'ba040004-0000-4000-0000-000000000004', // t4 + payment-change-policy (supp)
  lc_t4_5:    'ba040005-0000-4000-0000-000000000005', // t4 + evidence-capture-checklist (supp)
  // T4 quiz questions (12)
  t4Q1:  'ba030001-0000-4000-0000-000000000001',
  t4Q2:  'ba030002-0000-4000-0000-000000000002',
  t4Q3:  'ba030003-0000-4000-0000-000000000003',
  t4Q4:  'ba030004-0000-4000-0000-000000000004',
  t4Q5:  'ba030005-0000-4000-0000-000000000005',
  t4Q6:  'ba030006-0000-4000-0000-000000000006',
  t4Q7:  'ba030007-0000-4000-0000-000000000007',
  t4Q8:  'ba030008-0000-4000-0000-000000000008',
  t4Q9:  'ba030009-0000-4000-0000-000000000009',
  t4Q10: 'ba030010-0000-4000-0000-000000000010',
  t4Q11: 'ba030011-0000-4000-0000-000000000011',
  t4Q12: 'ba030012-0000-4000-0000-000000000012',
  t4Q13: 'ba030013-0000-4000-0000-000000000013',
  t4Q14: 'ba030014-0000-4000-0000-000000000014',
  t4Q15: 'ba030015-0000-4000-0000-000000000015',
  t4Q16: 'ba030016-0000-4000-0000-000000000016',
  t4Q17: 'ba030017-0000-4000-0000-000000000017',
  t4Q18: 'ba030018-0000-4000-0000-000000000018',
  t4Q19: 'ba030019-0000-4000-0000-000000000019',
  t4Q20: 'ba030020-0000-4000-0000-000000000020',
  t4Q21: 'ba030021-0000-4000-0000-000000000021',
  t4Q22: 'ba030022-0000-4000-0000-000000000022',
  // T4 content chunks
  cc_t4_1: 'ba050001-0000-4000-0000-000000000001',
  cc_t4_2: 'ba050002-0000-4000-0000-000000000002',
  cc_t4_3: 'ba050003-0000-4000-0000-000000000003',
  // T4 topic relationships
  tr_t4_1: 'ba060001-0000-4000-0000-000000000001',
  tr_t4_2: 'ba060002-0000-4000-0000-000000000002',
  tr_t4_3: 'ba060003-0000-4000-0000-000000000003',
  tr_t4_4: 'ba060004-0000-4000-0000-000000000004',
  tr_t4_5: 'ba060005-0000-4000-0000-000000000005',
  // T4 module assignment
  ma_t4_sam: 'ba070001-0000-4000-0000-000000000001',

  // T5 Module
  t5Module:   'ba000002-0000-4000-0000-000000000002',
  // T5 KB items
  t5K1Item:   'bb010001-0000-4000-0000-000000000001', // ransomware-in-warehouse
  t5K2Item:   'bb010002-0000-4000-0000-000000000002', // ransomware-containment
  t5K3Item:   'bb010003-0000-4000-0000-000000000003', // ransomware-communications
  // T5 KB revisions
  t5K1Rev:    'bb020001-0000-4000-0000-000000000001',
  t5K2Rev:    'bb020002-0000-4000-0000-000000000002',
  t5K3Rev:    'bb020003-0000-4000-0000-000000000003',
  // T5 lesson content links
  lc_t5_1:    'bb040001-0000-4000-0000-000000000001',
  lc_t5_2:    'bb040002-0000-4000-0000-000000000002',
  lc_t5_3:    'bb040003-0000-4000-0000-000000000003',
  lc_t5_4:    'bb040004-0000-4000-0000-000000000004', // supp: kill-chain
  lc_t5_5:    'bb040005-0000-4000-0000-000000000005', // supp: i-clicked
  // T5 quiz questions (12)
  t5Q1:  'bb030001-0000-4000-0000-000000000001',
  t5Q2:  'bb030002-0000-4000-0000-000000000002',
  t5Q3:  'bb030003-0000-4000-0000-000000000003',
  t5Q4:  'bb030004-0000-4000-0000-000000000004',
  t5Q5:  'bb030005-0000-4000-0000-000000000005',
  t5Q6:  'bb030006-0000-4000-0000-000000000006',
  t5Q7:  'bb030007-0000-4000-0000-000000000007',
  t5Q8:  'bb030008-0000-4000-0000-000000000008',
  t5Q9:  'bb030009-0000-4000-0000-000000000009',
  t5Q10: 'bb030010-0000-4000-0000-000000000010',
  t5Q11: 'bb030011-0000-4000-0000-000000000011',
  t5Q12: 'bb030012-0000-4000-0000-000000000012',
  t5Q13: 'bb030013-0000-4000-0000-000000000013',
  t5Q14: 'bb030014-0000-4000-0000-000000000014',
  t5Q15: 'bb030015-0000-4000-0000-000000000015',
  t5Q16: 'bb030016-0000-4000-0000-000000000016',
  t5Q17: 'bb030017-0000-4000-0000-000000000017',
  t5Q18: 'bb030018-0000-4000-0000-000000000018',
  t5Q19: 'bb030019-0000-4000-0000-000000000019',
  t5Q20: 'bb030020-0000-4000-0000-000000000020',
  t5Q21: 'bb030021-0000-4000-0000-000000000021',
  t5Q22: 'bb030022-0000-4000-0000-000000000022',
  // T5 content chunks
  cc_t5_1: 'bb050001-0000-4000-0000-000000000001',
  cc_t5_2: 'bb050002-0000-4000-0000-000000000002',
  cc_t5_3: 'bb050003-0000-4000-0000-000000000003',
  // T5 topic relationships
  tr_t5_1: 'bb060001-0000-4000-0000-000000000001',
  tr_t5_2: 'bb060002-0000-4000-0000-000000000002',
  tr_t5_3: 'bb060003-0000-4000-0000-000000000003',
  tr_t5_4: 'bb060004-0000-4000-0000-000000000004',
  tr_t5_5: 'bb060005-0000-4000-0000-000000000005',
  // T5 module assignment
  ma_t5_sam: 'bb070001-0000-4000-0000-000000000001',

  // New topics
  topicInvoiceFraud:     'tt000010-0000-4000-0000-000000000010',
  topicDocumentFraud:    'tt000011-0000-4000-0000-000000000011',
  topicRansomwareResp:   'tt000012-0000-4000-0000-000000000012',
  // Existing topics (reused for relationships)
  topicBecFraud:         'tt000007-0000-4000-0000-000000000007',
  topicFreightSecurity:  'tt000002-0000-4000-0000-000000000002',
  topicIncidentResponse: 'tt000004-0000-4000-0000-000000000004',
  topicRansomware:       'tt000005-0000-4000-0000-000000000005',
};

// ── KB Content ────────────────────────────────────────────────────────────────

const T4_CONTENT = {
  invoiceFraud: `# Freight Invoice Fraud: How Vendor Impersonation Works in Logistics

Invoice fraud is one of the most financially damaging cyber threats facing freight and logistics businesses. Unlike ransomware, which announces itself, invoice fraud is designed to look completely routine — until the money is gone.

## Why Freight Is a Prime Target

Freight businesses process large volumes of invoices from carriers, brokers, fuel vendors, repair shops, and port agents. Payment amounts are high — a single freight invoice can be $20,000 to $250,000. The volume and routine nature of these payments creates the perfect environment for fraud.

Attackers target freight companies specifically because:
- Invoice processing is high-volume and often under time pressure
- Multiple vendors means many legitimate payment requests arrive daily
- Freight staff are trained to process payments quickly — delays cost money
- Many freight firms still handle invoices via email rather than a locked-down AP portal

## The Anatomy of Freight Invoice Fraud

**Stage 1 — Reconnaissance.** Attackers gather information about your vendor relationships. This may come from social media (LinkedIn lists your key vendors), prior phishing campaigns that harvested email content, or purchasing stolen data.

**Stage 2 — Impersonation.** The attacker either:
- Registers a lookalike domain (e.g. ocean-freightpartners.com instead of oceanfreightpartners.com)
- Compromises the actual vendor's email account (BEC)
- Sends from a free email pretending to be the vendor

**Stage 3 — The Request.** The fraudulent email references real invoice details (invoice number, amount, contact name) to appear legitimate. It requests a payment to a new bank account, citing a bank change, audit, or error on the previous payment.

**Stage 4 — Urgency and Pressure.** The email typically claims a shipment hold, penalty fees, or relationship damage if payment is not made quickly. This urgency is engineered to bypass verification.

## The Single Most Important Control

**Never change banking details without calling the vendor at a number you look up yourself** — not a number in the email. A five-minute phone call is the most effective fraud prevention tool available.

## Common Freight Invoice Fraud Scenarios

- **Carrier payment redirect:** A carrier you regularly use sends an email stating their bank account has changed and asking for the next payment to go to a new account.
- **Port agent invoice:** An email purportedly from a port agent submits an invoice for port handling fees with a new remittance account.
- **Fuel and repair vendor:** A fuel card or repair shop sends an invoice with slightly altered bank details.
- **Freight broker commission:** A broker requests an urgent commission payment to a new account before a scheduled load.

## What Good Looks Like

A freight business with strong invoice fraud defences has:
1. A written policy requiring out-of-band verification for any banking detail change
2. A dual-approval rule for payments above a defined threshold
3. A verified contact list for all key vendors (phone numbers confirmed separately)
4. Clear escalation when something feels wrong — no blame culture for pausing a payment`,

  vendorBankingRedFlags: `# Red Flags in Vendor Banking Change Requests

Every freight finance or AP team member needs to be able to spot when a banking change request is fraudulent. This article gives you the specific signals to check.

## The Core Signal: Urgency + Account Change = Verify

Legitimate vendors rarely change their banking details urgently. When an urgent banking change arrives, treat it as a verification trigger — not a task to complete.

## Red Flag Checklist

**The email address**
- Does the sender domain exactly match the vendor's real domain?
- Is the domain a lookalike? Check character by character: rn looks like m, 0 looks like o.
- Is it a free email provider (Gmail, Outlook.com) claiming to be a business vendor?

**The request content**
- Is this the first time this vendor has ever changed their banking details?
- Does the request reference invoice numbers or amounts correctly? (Attackers may know these from prior compromise.)
- Does the email create urgency — "process by end of day", "hold on shipment if not received"?
- Does it ask you not to contact the vendor's main office?

**The contact information**
- Does the email provide a new phone number or email to confirm with? (Red flag — the attacker controls that number/address.)
- Is the signature block different from previous correspondence?

**The bank account**
- Is the new account in a different country than the vendor's normal account?
- Is it a personal account rather than a business account?

## Out-of-Band Verification: The Required Response

When a banking change request arrives, the response is always the same:

1. Do not reply to the email.
2. Find the vendor's phone number from your existing records or their official website — not from the email.
3. Call that number and speak to a known contact.
4. Ask them to confirm the change in writing from their official email.

This process cannot be skipped. It is not optional when the request looks convincing. It is especially required when the request looks convincing.

## When the Vendor Confirms — Double Check Anyway

If the person you reach confirms the change, verify:
- You are calling the number you looked up, not a number provided in the suspicious email
- The confirmation comes from an email address you have previously received verified emails from
- A second approver at your organisation also confirms before payment is made

## The $240,000 Rule

If you would not hand over £240,000 in cash without checking identification, do not change a banking detail for a £240,000 payment based on an email alone.`,

  invoiceVerification: `# Invoice Verification Procedures: The Dual-Approval Rule

Invoice verification is the process of confirming that an invoice is legitimate before payment is made. For freight businesses, this is not optional — it is a financial control.

## Why Freight Needs Formal Invoice Verification

Freight operations move fast. Invoices arrive from dozens of vendors on unpredictable schedules. Under pressure, the path of least resistance is to process and pay. Attackers rely on this.

Formal verification procedures create a mandatory pause — a checkpoint between receiving an invoice and releasing funds.

## The Dual-Approval Rule

**Any payment above your defined threshold requires two independent approvals.**

Recommended thresholds by company size:
- Small freight operator (under 20 staff): £5,000 / $5,000
- Mid-size freight business: £10,000 / $10,000
- Enterprise logistics: £25,000 / $25,000

**What counts as independent approval:**
- Two different named individuals, not one person approving twice
- Second approver must have reviewed the original invoice, not just been told "Alex approved it"
- Second approver must confirm vendor identity independently if any banking detail has changed

## The Standard Invoice Verification Checklist

Before approving any payment:

1. **Invoice exists on file:** Does this invoice number appear in your system as a pending obligation?
2. **Vendor identity confirmed:** Is the payee exactly who you expect? Check exact spelling of company name and bank details.
3. **Amount matches:** Does the invoiced amount match the agreed rate, PO, or contract?
4. **Banking details unchanged:** Are the bank details the same as the last payment to this vendor? If not — stop and verify.
5. **Dual approval obtained:** Has a second approver confirmed independently?

## For New Vendors

New vendors require a higher verification bar:
- Collect and file their bank details via a separate onboarding process — not via the first invoice email
- Verify company registration and contact details before first payment
- First payment may require director-level sign-off

## What Happens When You Skip These Steps

Payment fraud losses are rarely recovered. Wire transfers and BACS payments, once made to a fraudulent account, are moved within hours. Your bank may be unable to recall the funds.

The cost of a five-minute verification call is zero. The cost of a missed verification can be the company's operating capital.

## Culture: Pausing Is Not Slowing Down

Create a culture where pausing a payment for verification is praised, not questioned. The person who pauses and verifies is protecting the company. The person who says "just process it, we'll be fine" is creating risk.`,
};

const T5_CONTENT = {
  ransomwareInWarehouse: `# Ransomware in Warehouse Operations: What Happens and Why

Ransomware does not just attack office computers. It attacks the operational technology — warehouse management systems, label printers, barcode scanners, dock scheduling terminals, refrigeration monitors — that keeps a warehouse moving. When ransomware hits a warehouse, the operational impact is immediate and severe.

## What Ransomware Does in a Warehouse Environment

**Day 0 — Encryption begins.** Files on connected systems become inaccessible. WMS screens show errors. Label printers fail. Dock computers stop responding. This often happens overnight or during a low-staffed period.

**Day 0, first hour.** Staff arrive to find systems down. Shipments cannot be processed. Inbound receipts cannot be logged. Outbound loads cannot be staged or documented. Customers begin calling.

**Day 0-3 — Cascading failures.** EDI connections fail. Automated pick lists cannot be generated. Inventory counts are unavailable. If refrigerated storage is affected, product may be at risk. Customer SLAs begin to breach.

**The ransom note.** At some point, a message appears on affected screens demanding payment — typically in cryptocurrency — in exchange for a decryption key.

## How Ransomware Enters a Warehouse

**Phishing email** — The most common entry point. An employee clicks a link or opens an attachment. The malware installs silently and begins mapping the network.

**Remote access compromise** — Warehouse staff or vendors using remote desktop or VPN with weak or reused passwords. If credentials are stolen, attackers can walk in through the front door.

**Third-party vendor connections** — Many WMS and automation vendors maintain remote access to systems for support. If their credentials are compromised, your network is compromised through theirs.

**Unpatched systems** — Warehouse environments often run older operating systems (Windows 7, Windows Server 2008) on fixed terminals. Unpatched vulnerabilities are well-known to attackers.

## The Operational Stakes Are Different in Freight

A law firm hit by ransomware loses access to documents. A freight warehouse hit by ransomware:
- Cannot receive or dispatch goods
- Cannot track inventory
- Cannot communicate with carriers
- Cannot bill for shipments already made
- May breach perishable product storage conditions
- Creates liability for delayed shipments

The financial and contractual consequences can be severe within 24 hours.

## The Attacker's Timeline

Ransomware attackers typically enter a network weeks before the encryption event. During this window they:
- Map the network
- Identify and delete or encrypt backup systems
- Move laterally to reach the highest-value targets
- Exfiltrate sensitive data (double extortion)

By the time staff see the ransom note, the attacker has already been inside the network for an extended period.`,

  ransomwareContainment: `# Immediate Ransomware Containment: Isolate Without Deleting

The first fifteen minutes of a ransomware response determine the scope of the damage. The right actions at the start limit spread. The wrong actions destroy evidence and make recovery harder.

## What to Do — The First Fifteen Minutes

**Step 1: Do not restart the affected machine.**
Restarting may destroy volatile memory containing forensic evidence. It may also trigger the ransomware to complete its encryption run.

**Step 2: Disconnect from the network immediately.**
- Unplug the ethernet cable
- Turn off Wi-Fi on the device
- If the device is a shared terminal, disconnect it from the switch

**Step 3: Do not delete files.**
Do not attempt to delete ransomware files, clean up folders, or clear the desktop. Every file is potential forensic evidence.

**Step 4: Document what you see.**
Take a photo of the screen with your phone. Note the time, what you were doing, and any error messages or ransom note text.

**Step 5: Alert your supervisor and IT immediately.**
Call — do not email. Attackers who have compromised your email may be watching. Use a phone number you know independently.

## What NOT to Do

- **Do not pay the ransom without consulting law enforcement and legal.** Payment does not guarantee recovery and may be illegal depending on the sanctioned entity you are paying.
- **Do not try to fix it yourself.** Well-intentioned attempts to remove malware often destroy the evidence needed for recovery.
- **Do not tell other staff via email.** If email is compromised, the attacker sees everything you write.
- **Do not assume it is just one machine.** Ransomware spreads. Assume the worst until IT confirms otherwise.

## The Network Isolation Decision

If IT is not immediately available and ransomware is actively spreading:
- Pull network cables from affected switches
- Disable Wi-Fi at the router if feasible
- Prioritise disconnecting machines that handle WMS, finance, or customer data

The business pain of an isolated network is significantly less than the damage of an uncontrolled ransomware spread.

## After Isolation: What Happens Next

Once affected systems are isolated:
1. IT begins damage assessment — which systems are encrypted, which are clean
2. Backups are checked — are they intact and recent?
3. Incident response process begins — see the communications playbook
4. Law enforcement may be notified — contact Action Fraud (UK) or FBI IC3 (US) early

## The Backup Question

The first thing a professional responder will ask: "Do you have clean backups, and when were they last tested?"

If the answer is "we have backups but haven't tested them," recovery becomes uncertain. If the answer is "backups were also encrypted," recovery becomes very expensive.

**The lesson:** Test backups regularly. Verify they are kept offline or in a separate system that ransomware cannot reach.`,

  ransomwareCommunications: `# Communicating During a Ransomware Event: The Right Calls in the Right Order

When a warehouse ransomware attack begins, communication breaks down in two directions simultaneously: internally (staff don't know what's happening) and externally (customers and carriers are getting silence). This article gives you the communication playbook.

## Why Communication Goes Wrong in Ransomware Events

- Email may be compromised or unavailable
- Staff are focused on fixing the problem, not informing stakeholders
- No one has a clear picture yet, so no one wants to say anything
- Concern about legal liability creates information lockdown

All of these create worse outcomes. Controlled, honest communication limits damage.

## The Notification Order

**Immediate (0-30 minutes):**
1. Direct supervisor / operations manager — verbal, by phone
2. IT lead or managed service provider — verbal, by phone
3. Site manager / director — verbal, by phone

**Within 1 hour:**
4. Finance director — payment fraud risk assessment needed immediately
5. Legal / compliance if your organisation has them — for breach notification assessment
6. Insurance provider if you have cyber insurance — notify early, not late

**Within 2-4 hours:**
7. Key customers with active shipments at the facility — honest, brief notification
8. Carrier partners if dispatch is affected

## What to Say to Customers

Keep it factual and avoid speculation:

*"We are experiencing a systems outage affecting our warehouse operations. We are investigating the cause and our teams are working to restore service. We will update you within [X hours] with a revised timeline for your shipment. Please contact [name] on [number] for urgent queries."*

Do not:
- Describe it as a ransomware attack in initial customer communication without legal advice
- Make promises about recovery timelines you cannot keep
- Go silent — silence creates worse assumptions than honest uncertainty

## Internal Communications Protocol

If email is unavailable or untrusted:
- Use personal mobile phones for voice calls
- Use an out-of-band messaging platform (WhatsApp group, Teams on personal devices) for written coordination
- Designate one point of contact for all external communications — inconsistent messages create more confusion

## The Media / Social Media Rule

No one speaks to media or posts on social media about the incident without explicit authorisation from the director or legal. One wrong statement can have significant consequences.

## After the Incident: The Lessons Learned Communication

Once recovery is complete, a brief all-staff communication that:
- Acknowledges what happened (at an appropriate level of detail)
- Explains what was done to recover
- States what has changed to prevent recurrence
- Thanks those who responded well

This communication builds resilience. Staff who understand what happened are better prepared for the next event.`,
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { db } = await import('../src/db/client.js');
  const { learningModules } = await import('../src/db/schema/modules.js');
  const { kbItems } = await import('../src/db/schema/kb-items.js');
  const { kbRevisions } = await import('../src/db/schema/kb-revisions.js');
  const { lessonContentLinks } = await import('../src/db/schema/lesson-links.js');
  const { quizCandidates } = await import('../src/db/schema/quiz-candidates.js');
  const { moduleAssignments } = await import('../src/db/schema/module-assignments.js');
  const { topics, topicRelationships } = await import('../src/db/schema/topics.js');
  const { contentChunks } = await import('../src/db/schema/content-chunks.js');
  const { eq, sql } = await import('drizzle-orm');

  const now = new Date();
  console.log('[seed-t4-t5] Starting T4+T5 content expansion...');

  // ── 1. Modules ──────────────────────────────────────────────────────────────

  await db.insert(learningModules).values([
    {
      id: IDS.t4Module,
      slug: 't4-vendor-invoice-fraud',
      title: 'Freight Vendor Impersonation & Invoice Fraud',
      description: 'Learn how attackers impersonate freight vendors to redirect payments, the red flags in banking change requests, and the verification procedures that prevent fraud.',
      published: true,
      displayOrder: 4,
      estimatedMinutes: 35,
      nextModuleId: IDS.t5Module,
      createdBy: SEED_BY,
    },
    {
      id: IDS.t5Module,
      slug: 't5-warehouse-ransomware',
      title: 'Warehouse Ransomware Response',
      description: 'Understand how ransomware enters and cripples warehouse operations, the correct immediate containment steps, and how to communicate effectively during an active incident.',
      published: true,
      displayOrder: 5,
      estimatedMinutes: 40,
      nextModuleId: null,
      createdBy: SEED_BY,
    },
  ]).onConflictDoNothing();

  // Update T3 to chain into T4
  await db.execute(
    sql`UPDATE learning_modules SET next_module_id = ${IDS.t4Module} WHERE id = ${IDS.t3Module} AND next_module_id IS NULL`
  );

  console.log('[seed-t4-t5] ✓ Modules T4, T5 inserted; T3 → T4 chain set');

  // ── 2. New Topics ───────────────────────────────────────────────────────────

  await db.insert(topics).values([
    { id: IDS.topicInvoiceFraud,   slug: 'invoice-fraud',      name: 'Invoice Fraud',          description: 'Freight invoice and payment fraud via vendor impersonation' },
    { id: IDS.topicDocumentFraud,  slug: 'document-fraud',     name: 'Document Fraud',         description: 'Forged or manipulated shipping and financial documents' },
    { id: IDS.topicRansomwareResp, slug: 'ransomware-response', name: 'Ransomware Response',   description: 'Containment, communications, and recovery from ransomware attacks' },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ New topics');

  // ── 3. T4 KB Items ──────────────────────────────────────────────────────────

  await db.insert(kbItems).values([
    {
      id: IDS.t4K1Item, slug: 't4-invoice-fraud-in-freight',
      title: 'Freight Invoice Fraud: How Vendor Impersonation Works in Logistics',
      type: 'training-content', tags: ['invoice-fraud', 'bec', 'freight', 'vendor'],
      status: 'published', sourceTrust: 'internal', createdBy: SEED_BY,
      currentRevisionId: IDS.t4K1Rev, learnerVisible: true, publishedAt: now,
    },
    {
      id: IDS.t4K2Item, slug: 't4-vendor-banking-change-redflags',
      title: 'Red Flags in Vendor Banking Change Requests',
      type: 'training-content', tags: ['invoice-fraud', 'banking', 'verification', 'vendor'],
      status: 'published', sourceTrust: 'internal', createdBy: SEED_BY,
      currentRevisionId: IDS.t4K2Rev, learnerVisible: true, publishedAt: now,
    },
    {
      id: IDS.t4K3Item, slug: 't4-invoice-verification-procedures',
      title: 'Invoice Verification Procedures: The Dual-Approval Rule',
      type: 'training-content', tags: ['invoice-fraud', 'dual-approval', 'verification', 'policy'],
      status: 'published', sourceTrust: 'internal', createdBy: SEED_BY,
      currentRevisionId: IDS.t4K3Rev, learnerVisible: true, publishedAt: now,
    },
  ]).onConflictDoNothing();

  await db.insert(kbRevisions).values([
    { id: IDS.t4K1Rev, itemId: IDS.t4K1Item, content: T4_CONTENT.invoiceFraud,         version: 1, createdBy: SEED_BY },
    { id: IDS.t4K2Rev, itemId: IDS.t4K2Item, content: T4_CONTENT.vendorBankingRedFlags, version: 1, createdBy: SEED_BY },
    { id: IDS.t4K3Rev, itemId: IDS.t4K3Item, content: T4_CONTENT.invoiceVerification,   version: 1, createdBy: SEED_BY },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T4 KB items + revisions');

  // ── 4. T4 Lesson Content Links ──────────────────────────────────────────────

  await db.insert(lessonContentLinks).values([
    { id: IDS.lc_t4_1, moduleId: IDS.t4Module, kbItemId: IDS.t4K1Item, role: 'primary',       order: 0, addedBy: SEED_BY },
    { id: IDS.lc_t4_2, moduleId: IDS.t4Module, kbItemId: IDS.t4K2Item, role: 'primary',       order: 1, addedBy: SEED_BY },
    { id: IDS.lc_t4_3, moduleId: IDS.t4Module, kbItemId: IDS.t4K3Item, role: 'primary',       order: 2, addedBy: SEED_BY },
    { id: IDS.lc_t4_4, moduleId: IDS.t4Module, kbItemId: IDS.t2BecK4Item, role: 'supplementary', order: 3, addedBy: SEED_BY },
    { id: IDS.lc_t4_5, moduleId: IDS.t4Module, kbItemId: IDS.t2BecK8Item, role: 'supplementary', order: 4, addedBy: SEED_BY },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T4 lesson content links');

  // ── 5. T4 Quiz Questions (12) ───────────────────────────────────────────────

  await db.insert(quizCandidates).values([
    // KB1: invoice-fraud-in-freight (Q1-Q4)
    {
      id: IDS.t4Q1, kbItemId: IDS.t4K1Item, revisionId: IDS.t4K1Rev,
      questionText: 'Why are freight businesses considered high-value targets for invoice fraud?',
      options: [
        'They have more computers than other businesses, creating more attack surface.',
        'Freight invoices are high-value, processed in large volumes under time pressure, and often arrive via email from many different vendors.',
        'Freight businesses are less aware of cyber threats than other industries.',
        'Freight companies keep all their banking details in publicly accessible databases.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The combination of high invoice values, large processing volumes, time pressure, and email-based workflows creates the perfect environment for fraud. Attackers exploit the routine nature of payments and the pressure to process quickly.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q2, kbItemId: IDS.t4K1Item, revisionId: IDS.t4K1Rev,
      questionText: 'During Stage 3 of a freight invoice fraud attack, the attacker sends a fraudulent email requesting a payment to a new bank account. The email references real invoice numbers and correct amounts. How did the attacker most likely obtain this information?',
      options: [
        'They guessed the invoice numbers randomly.',
        'Invoice numbers follow a predictable pattern that attackers can calculate.',
        'They obtained it via prior phishing, email compromise of the vendor or victim, or purchased stolen data.',
        'Invoice numbers are publicly available in freight industry databases.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Attackers perform reconnaissance before launching fraud. They may have compromised the vendor\'s email, the victim\'s email, or purchased data from a prior breach. Specific details like invoice numbers and amounts make the fraud email appear legitimate and are obtained through intelligence gathering, not guessing.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q3, kbItemId: IDS.t4K1Item, revisionId: IDS.t4K1Rev,
      questionText: 'A carrier you have worked with for two years sends an email saying their bank account has changed and asking you to update the details before processing the next payment. What is the correct first action?',
      options: [
        'Update the banking details and process the payment as requested.',
        'Reply to the email asking for confirmation.',
        'Call the carrier at a number from your existing records or their official website — not a number in the email.',
        'Forward the email to your finance director for approval.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Out-of-band verification is the single most effective control against invoice fraud. The attacker controls the email and may also control a phone number provided in the email. You must call a number you independently verified — from your own records or the carrier\'s website. Forwarding to finance still does not verify the request is legitimate.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q4, kbItemId: IDS.t4K1Item, revisionId: IDS.t4K1Rev,
      questionText: 'An invoice fraud email uses urgency to pressure the recipient. Which of the following is most consistent with how real urgency is used in freight invoice fraud?',
      options: [
        '"This invoice is 30 days overdue — please remit at your earliest convenience."',
        '"Your shipment is on hold pending payment. Wire to the new account by 3pm today or the load will be re-tendered."',
        '"Please find attached our updated invoice with a revised line item — no action needed until normal payment run."',
        '"Thank you for your continued business. Our standard payment terms are Net 30."',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Urgency tied to an operational threat (shipment hold, load re-tendering, penalty fees) is a hallmark of freight invoice fraud. Attackers know that freight staff are trained to resolve operational problems quickly. The time pressure is designed to bypass the verification steps that would catch the fraud.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t4Module,
    },
    // KB2: vendor-banking-change-redflags (Q5-Q8)
    {
      id: IDS.t4Q5, kbItemId: IDS.t4K2Item, revisionId: IDS.t4K2Rev,
      questionText: 'You receive a banking change request email from a freight vendor. The email provides a new contact phone number to call and confirm the change. What is the problem with calling that number?',
      options: [
        'The number is probably a premium rate line that will charge you.',
        'The attacker may control the number provided in the email — calling it confirms you as a target and lets them socially engineer the confirmation.',
        'Phone confirmation is not a reliable method for banking changes.',
        'There is no problem — calling any number to confirm is sufficient verification.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'An attacker who controls the email also controls the phone number they provide in it. Calling that number connects you to the attacker, who will impersonate the vendor and confirm the fraudulent change. You must call a number you have independently verified from your own records or the vendor\'s official website.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q6, kbItemId: IDS.t4K2Item, revisionId: IDS.t4K2Rev,
      questionText: 'Which of the following is a red flag that a vendor banking change request may be fraudulent?',
      options: [
        'The request comes from the same email address you have always used for this vendor.',
        'The new bank account is in a different country from where the vendor normally operates.',
        'The request references the correct invoice number and amount.',
        'The email arrives during normal business hours.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'A new bank account in a different country than the vendor\'s normal location is a strong red flag. Referencing correct invoice details does not confirm legitimacy — attackers obtain these details through reconnaissance. The sending email address can be spoofed. Business hours are irrelevant to fraud attempts.',
      status: 'promoted', confidence: 0.93, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q7, kbItemId: IDS.t4K2Item, revisionId: IDS.t4K2Rev,
      questionText: 'A vendor banking change email says "Please do not contact our accounts department about this change as they are not aware of the transition yet." Why is this a red flag?',
      options: [
        'It suggests the vendor has poor internal communication.',
        'Legitimate banking changes always involve the full accounts department.',
        'This instruction is designed to prevent you from reaching anyone who would tell you the change is fraudulent.',
        'Vendors should always copy their accounts department on banking change emails.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'An instruction to avoid contacting specific people or departments is a social engineering technique. The attacker wants to prevent you from reaching anyone who would say "we never requested a banking change." Treat any instruction not to verify with specific departments as a strong signal the request is fraudulent.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q8, kbItemId: IDS.t4K2Item, revisionId: IDS.t4K2Rev,
      questionText: 'You have called the vendor at a number from your own records and the person you spoke to confirmed the banking change. Is it now safe to proceed with the update?',
      options: [
        'Yes — verbal confirmation from the vendor is sufficient.',
        'Yes — you used an independently verified number, so the confirmation is reliable.',
        'Not yet — also get written confirmation from an email address you have previously received verified correspondence from, and obtain a second internal approval.',
        'No — banking changes can never be made safely over the phone.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Verbal confirmation is necessary but not sufficient. The complete verification chain is: (1) call a number from your own records, (2) receive written confirmation from a known legitimate email address, (3) second internal approver reviews and confirms before payment is updated. Belt and suspenders — multiple controls provide the protection.',
      status: 'promoted', confidence: 0.92, promotedToModuleId: IDS.t4Module,
    },
    // KB3: invoice-verification-procedures (Q9-Q12)
    {
      id: IDS.t4Q9, kbItemId: IDS.t4K3Item, revisionId: IDS.t4K3Rev,
      questionText: 'What is the purpose of a dual-approval rule for invoice payments?',
      options: [
        'To slow down payment processing so errors can be caught.',
        'To require two independent approvers to review and authorise a payment, so that one person acting alone cannot authorise a fraudulent payment.',
        'To ensure the finance director is personally responsible for all payments.',
        'To comply with VAT and tax regulations.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Dual approval means two independent people must review and authorise a payment. This prevents a single compromised, deceived, or fraudulent actor from authorising a payment alone. It is not primarily about slowing things down — it is about requiring collusion to commit fraud, which is significantly harder than deceiving one person.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q10, kbItemId: IDS.t4K3Item, revisionId: IDS.t4K3Rev,
      questionText: 'During invoice verification, you check that the bank details match the previous payment to this vendor. You notice the sort code has changed by one digit. What should you do?',
      options: [
        'Process the payment — one digit difference is probably a data entry error on the vendor\'s side.',
        'Stop the payment and escalate to your manager immediately. Verify via out-of-band contact with the vendor.',
        'Email the vendor asking them to confirm the new sort code.',
        'Pay the invoice but flag it for review in the next month-end reconciliation.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Any change to banking details — even a single digit difference — must be treated as a fraud signal until verified. Do not process the payment. Do not email the vendor (you may be emailing the attacker). Call the vendor at a number from your own records. Escalate immediately. The one digit might be a typo — but it might also be the attacker\'s account.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q11, kbItemId: IDS.t4K3Item, revisionId: IDS.t4K3Rev,
      questionText: 'A colleague in AP says "I don\'t need the dual-approval check for this one — I know this vendor well, we\'ve paid them a hundred times." What is the correct response?',
      options: [
        'Allow the exception — familiarity with the vendor reduces fraud risk.',
        'The dual-approval process applies regardless of how well the vendor is known. Fraud specifically targets familiar, trusted relationships.',
        'Allow the exception but document it.',
        'Escalate to the director to approve the exception.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Fraud deliberately targets familiar relationships. The attacker impersonating your trusted vendor of ten years is more convincing precisely because of that familiarity. Verification procedures must be consistent and unconditional — exceptions create the gaps that fraud exploits. There are no exceptions to dual approval above the threshold.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q12, kbItemId: IDS.t4K3Item, revisionId: IDS.t4K3Rev,
      questionText: 'A wire transfer of £180,000 to a new vendor was made without dual approval. Two days later the vendor says they never sent that invoice. What is most likely true?',
      options: [
        'The vendor sent the invoice and forgot.',
        'The invoice was fraudulent and the payment was made to an attacker\'s account. Recovery is unlikely.',
        'It was a legitimate payment but the vendor has accounting issues.',
        'The payment will be automatically reversed by the bank within 5 business days.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'If a vendor says they never sent an invoice you paid, the payment was fraudulent. Wire transfers to attacker-controlled accounts are moved within hours. By day two the money is typically gone — moved through multiple accounts, often overseas. Banks can attempt recall but success rates are low for wire fraud. This is why the controls exist — prevention is the only reliable protection.',
      status: 'promoted', confidence: 0.98, promotedToModuleId: IDS.t4Module,
    },
    // Q13-Q22: deeper invoice fraud coverage
    {
      id: IDS.t4Q13, kbItemId: IDS.t4K1Item, revisionId: IDS.t4K1Rev,
      questionText: 'An attacker who has compromised a carrier\'s email account is most likely to wait for which moment before sending a fraudulent payment-redirect email?',
      options: [
        'Immediately after gaining access, to maximise the time to act.',
        'When a large payment is approaching — monitoring email for active invoice or payment conversations before injecting fraudulent instructions.',
        'On a Monday morning when finance teams are busy.',
        'Randomly — timing is not part of the attack strategy.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Sophisticated invoice fraud actors monitor compromised email accounts for weeks or months before acting. They wait for the right payment cycle — a large invoice being processed, a carrier expecting a big settlement — then inject a redirect request at exactly the right moment. This makes the fraud convincing and maximises the amount captured.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q14, kbItemId: IDS.t4K1Item, revisionId: IDS.t4K1Rev,
      questionText: 'Which of the following best describes "factoring fraud" in the freight sector?',
      options: [
        'An attacker submits invoices for freight loads that were never moved.',
        'An attacker compromises a factoring company or carrier email and redirects carrier payment settlements to an attacker-controlled account.',
        'Fraudulent fuel surcharge additions to carrier invoices.',
        'Forged carrier credentials used to win freight bids at below-market rates.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Factoring fraud targets the payment relationship between carriers, freight brokers, and the factoring companies that advance cash on invoices. The attacker — often holding a compromised email account — sends "new banking instructions" so that the broker\'s next settlement payment goes to the attacker rather than the legitimate carrier. The carrier then reports non-payment weeks later.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q15, kbItemId: IDS.t4K2Item, revisionId: IDS.t4K2Rev,
      questionText: 'An email from a vendor requests a bank account change. The email is grammatically correct, uses the vendor\'s real letterhead, and references your last three invoice numbers. What does this suggest?',
      options: [
        'The email is almost certainly legitimate — only the real vendor would know those invoice numbers.',
        'The email may be from an attacker who previously compromised the vendor\'s email and read historical invoices.',
        'The email is a standard banking change process — proceed with the update.',
        'Invoice numbers are public record — this tells you nothing about authenticity.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Invoice numbers, amounts, and company letterhead are all obtainable by an attacker with prior access to the vendor\'s email account. Correctly referencing historical invoices is not evidence of legitimacy — it is evidence the attacker did their research. Independent verification by phone (using your own records, not the number in the email) is the only reliable test.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q16, kbItemId: IDS.t4K2Item, revisionId: IDS.t4K2Rev,
      questionText: 'Which payment method is hardest to recover once sent to a fraudulent account?',
      options: [
        'Cheque — can be stopped at the bank.',
        'Credit card — chargeback protections apply.',
        'International wire transfer — once funds leave your bank and are moved on, recovery is extremely difficult.',
        'BACS/direct debit — automated reversal applies within 3 days.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'International wire transfers are the primary target of invoice fraud because they are fast, difficult to reverse, and offer no consumer-style chargeback protections. Once the receiving bank has forwarded funds to another account (often within hours), recovery rates drop sharply. This is why pre-payment verification controls matter far more than post-payment recall attempts.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q17, kbItemId: IDS.t4K2Item, revisionId: IDS.t4K2Rev,
      questionText: 'Your company has a policy: any new payee must be verified by callback before first payment. A manager tells you to skip this for a new carrier because "we need to get the load moving." What do you do?',
      options: [
        'Skip the verification — the manager has authority to approve exceptions.',
        'Complete the verification — explain the policy is a financial control and ask the manager to authorise the exception in writing.',
        'Process the payment but flag it as unverified in the system.',
        'Process the payment and do the verification on the next payment.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Financial controls exist precisely because urgency is the primary mechanism used by fraudsters. The correct response is to verify and ask for written exception authorisation if the manager insists on waiving it. This documents the decision, demonstrates you followed procedure, and often prompts the manager to reconsider. Verification delays of 10-15 minutes are preferable to unrecoverable losses of thousands of pounds.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q18, kbItemId: IDS.t4K3Item, revisionId: IDS.t4K3Rev,
      questionText: 'What is the primary purpose of maintaining a "verified vendor bank detail register" that requires written sign-off to update?',
      options: [
        'To comply with Companies House filing requirements.',
        'To create an authoritative record of confirmed payment details so any change requires a deliberate, documented approval — preventing unauthorised updates via email.',
        'To speed up payment processing by pre-approving common vendors.',
        'To satisfy HMRC audit requirements for VAT reclaim.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'A controlled vendor register means payment details can only be changed through a formal process — not via an email request. This single control eliminates the most common invoice fraud vector. If an attacker sends a banking change request, finance staff can point to the register and the requirement for verified sign-off, rather than relying on individual judgement about email authenticity.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q19, kbItemId: IDS.t4K3Item, revisionId: IDS.t4K3Rev,
      questionText: 'A finance team member discovers they approved a fraudulent invoice payment 90 minutes ago. The receiving bank account is in a different country. What is the most important first action?',
      options: [
        'Email the fraudulent vendor account to demand the money back.',
        'Call your bank\'s fraud team immediately to request a recall — acting within the first hour maximises recovery probability.',
        'Wait until the next business day to contact the bank.',
        'Report it to the police and wait for them to contact the bank.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The bank\'s fraud team is the first call. Swift action in the first 1-2 hours gives the best chance of a "freeze and return" before funds are moved on. Every hour matters. Banks have established recall processes but they require early notification. Simultaneously: document everything, notify your director, and prepare for a police report (Action Fraud in the UK, IC3 for US-connected fraud).',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q20, kbItemId: IDS.t4K3Item, revisionId: IDS.t4K3Rev,
      questionText: 'Which statement about invoice fraud prevention is most accurate?',
      options: [
        'Technology-based invoice scanning tools eliminate the need for callback verification.',
        'Employee training alone is sufficient — people who know the patterns will not be deceived.',
        'Layered controls — callback verification, dual approval, controlled vendor register — are more effective than any single control.',
        'Fraud only targets large companies with high-value payments.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'No single control is sufficient. Callback verification can be defeated if the attacker has compromised the vendor\'s phone line. Dual approval can be social-engineered. Training helps but creates false confidence. Layered controls — where defeating one requires also defeating several others simultaneously — is the correct model. SMEs in freight are frequent targets precisely because they often rely on a single control.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q21, kbItemId: IDS.t4K1Item, revisionId: IDS.t4K1Rev,
      questionText: 'A freight broker\'s AP team receives an email from a carrier they work with regularly, saying "we\'ve changed banks — please update our payment details before Friday\'s settlement." The sender address is identical to previous emails. What should they do?',
      options: [
        'Update the bank details — the email came from the correct address.',
        'Reply to the email to confirm the change is legitimate before updating.',
        'Call the carrier using a phone number from your records (not from the email) to independently confirm the change.',
        'Process Friday\'s payment to the old account and update details after.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'A matching sender address does not confirm authenticity — email accounts can be compromised. Replying to the email goes back to the potentially compromised account. The correct action is to call the carrier at a number you independently have on record — from your CRM, a previous contract, or a business card. This breaks the attacker\'s control of the communication channel.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t4Module,
    },
    {
      id: IDS.t4Q22, kbItemId: IDS.t4K2Item, revisionId: IDS.t4K2Rev,
      questionText: 'An attacker sends an invoice that matches a real pending load — correct carrier name, correct freight amount, real load reference number. How likely is this to succeed without a verification process?',
      options: [
        'Unlikely — the invoice needs the correct bank details too.',
        'Highly likely — the contextual accuracy makes it convincing, and most AP staff would not question details that match their records.',
        'Unlikely — most accounting software flags unknown bank accounts.',
        'Likely, but only if the attacker knows the AP contact name.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'An invoice that matches a real load with correct carrier name, amount, and reference is extremely convincing. The only incorrect element is the bank account — and under time pressure, AP staff often process payment without cross-checking bank details against the verified vendor record. This is the entire premise of freight invoice fraud: contextual accuracy removes suspicion and triggers payment.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t4Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T4 quiz questions (22)');

  // ── 6. T4 Content Chunks (FTS) ──────────────────────────────────────────────

  await db.insert(contentChunks).values([
    { id: IDS.cc_t4_1, itemId: IDS.t4K1Item, revisionId: IDS.t4K1Rev, chunkIndex: 0, content: T4_CONTENT.invoiceFraud.slice(0, 1200),         tokenCount: 250 },
    { id: IDS.cc_t4_2, itemId: IDS.t4K2Item, revisionId: IDS.t4K2Rev, chunkIndex: 0, content: T4_CONTENT.vendorBankingRedFlags.slice(0, 1200), tokenCount: 250 },
    { id: IDS.cc_t4_3, itemId: IDS.t4K3Item, revisionId: IDS.t4K3Rev, chunkIndex: 0, content: T4_CONTENT.invoiceVerification.slice(0, 1200),   tokenCount: 250 },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T4 content chunks');

  // ── 7. T4 Topic Relationships ────────────────────────────────────────────────

  await db.insert(topicRelationships).values([
    { id: IDS.tr_t4_1, itemId: IDS.t4K1Item, topicId: IDS.topicInvoiceFraud,    assignedBy: SEED_BY },
    { id: IDS.tr_t4_2, itemId: IDS.t4K1Item, topicId: IDS.topicBecFraud,        assignedBy: SEED_BY },
    { id: IDS.tr_t4_3, itemId: IDS.t4K2Item, topicId: IDS.topicInvoiceFraud,    assignedBy: SEED_BY },
    { id: IDS.tr_t4_4, itemId: IDS.t4K3Item, topicId: IDS.topicInvoiceFraud,    assignedBy: SEED_BY },
    { id: IDS.tr_t4_5, itemId: IDS.t4K3Item, topicId: IDS.topicFreightSecurity, assignedBy: SEED_BY },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T4 topic relationships');

  // ── 8. T4 Module Assignment → Sam ───────────────────────────────────────────

  await db.insert(moduleAssignments).values([
    { id: IDS.ma_t4_sam, moduleId: IDS.t4Module, learnerId: IDS.samLearner, assignedBy: SEED_BY },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T4 module assigned to sam.professional');

  // ═══════════════════════════════════════════════════════════════════════════
  // T5 — Warehouse Ransomware Response
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 9. T5 KB Items ───────────────────────────────────────────────────────────

  await db.insert(kbItems).values([
    {
      id: IDS.t5K1Item, slug: 't5-ransomware-in-warehouse',
      title: 'Ransomware in Warehouse Operations: What Happens and Why',
      type: 'training-content', tags: ['ransomware', 'warehouse', 'freight', 'operational-impact'],
      status: 'published', sourceTrust: 'internal', createdBy: SEED_BY,
      currentRevisionId: IDS.t5K1Rev, learnerVisible: true, publishedAt: now,
    },
    {
      id: IDS.t5K2Item, slug: 't5-ransomware-containment',
      title: 'Immediate Ransomware Containment: Isolate Without Deleting',
      type: 'training-content', tags: ['ransomware', 'containment', 'incident-response', 'warehouse'],
      status: 'published', sourceTrust: 'internal', createdBy: SEED_BY,
      currentRevisionId: IDS.t5K2Rev, learnerVisible: true, publishedAt: now,
    },
    {
      id: IDS.t5K3Item, slug: 't5-ransomware-communications',
      title: 'Communicating During a Ransomware Event: The Right Calls in the Right Order',
      type: 'training-content', tags: ['ransomware', 'communications', 'incident-response', 'escalation'],
      status: 'published', sourceTrust: 'internal', createdBy: SEED_BY,
      currentRevisionId: IDS.t5K3Rev, learnerVisible: true, publishedAt: now,
    },
  ]).onConflictDoNothing();

  await db.insert(kbRevisions).values([
    { id: IDS.t5K1Rev, itemId: IDS.t5K1Item, content: T5_CONTENT.ransomwareInWarehouse,    version: 1, createdBy: SEED_BY },
    { id: IDS.t5K2Rev, itemId: IDS.t5K2Item, content: T5_CONTENT.ransomwareContainment,    version: 1, createdBy: SEED_BY },
    { id: IDS.t5K3Rev, itemId: IDS.t5K3Item, content: T5_CONTENT.ransomwareCommunications, version: 1, createdBy: SEED_BY },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T5 KB items + revisions');

  // ── 10. T5 Lesson Content Links ─────────────────────────────────────────────

  await db.insert(lessonContentLinks).values([
    { id: IDS.lc_t5_1, moduleId: IDS.t5Module, kbItemId: IDS.t5K1Item, role: 'primary',       order: 0, addedBy: SEED_BY },
    { id: IDS.lc_t5_2, moduleId: IDS.t5Module, kbItemId: IDS.t5K2Item, role: 'primary',       order: 1, addedBy: SEED_BY },
    { id: IDS.lc_t5_3, moduleId: IDS.t5Module, kbItemId: IDS.t5K3Item, role: 'primary',       order: 2, addedBy: SEED_BY },
    { id: IDS.lc_t5_4, moduleId: IDS.t5Module, kbItemId: IDS.t2K1Item, role: 'supplementary', order: 3, addedBy: SEED_BY },
    { id: IDS.lc_t5_5, moduleId: IDS.t5Module, kbItemId: IDS.t2K2Item, role: 'supplementary', order: 4, addedBy: SEED_BY },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T5 lesson content links');

  // ── 11. T5 Quiz Questions (12) ──────────────────────────────────────────────

  await db.insert(quizCandidates).values([
    // KB1: ransomware-in-warehouse (Q1-Q4)
    {
      id: IDS.t5Q1, kbItemId: IDS.t5K1Item, revisionId: IDS.t5K1Rev,
      questionText: 'How does ransomware typically enter a warehouse environment?',
      options: [
        'Exclusively through physical USB drives inserted by attackers.',
        'Through phishing emails, compromised remote access credentials, vulnerable third-party vendor connections, and unpatched systems.',
        'Only through unpatched operating systems — email is not a vector.',
        'Through the barcode scanner hardware.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Warehouse ransomware enters through multiple vectors. Phishing emails are the most common initial entry. Remote access compromise (RDP, VPN) is increasingly common. Third-party vendor support connections create a pathway if the vendor is compromised. Unpatched warehouse terminals running older Windows versions are vulnerable to known exploits.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q2, kbItemId: IDS.t5K1Item, revisionId: IDS.t5K1Rev,
      questionText: 'Ransomware typically encrypts backup systems before triggering the main encryption event. Why?',
      options: [
        'Because backups use older encryption formats that are easier to attack.',
        'To destroy the victim\'s ability to restore from backup, maximising pressure to pay the ransom.',
        'Because backup systems contain more valuable data than production systems.',
        'To slow down the IT team\'s response.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Attackers spend time inside the network (days to weeks) before triggering ransomware. During this time they identify and delete or encrypt backup systems. When the ransomware fires, the victim has no clean backup to restore from, leaving payment as the only apparent option. This is why offline backups — not reachable from the network — are critical.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q3, kbItemId: IDS.t5K1Item, revisionId: IDS.t5K1Rev,
      questionText: 'A warehouse is hit by ransomware during a Monday morning shift. Label printers are down, the WMS is showing errors, and dock computers are unresponsive. What is the operational consequence if the issue is not contained within 4 hours?',
      options: [
        'The warehouse will lose access to email only.',
        'Inbound receipts cannot be logged, outbound loads cannot be documented, customer SLAs begin to breach, and carrier communication breaks down.',
        'Only the administrative office will be affected — warehouse floor operations are not connected.',
        'Payroll processing will be delayed but operations can continue manually.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Warehouse ransomware causes cascading operational failure. WMS outage means no pick lists, no receipts, no inventory counts. EDI connections fail. Customer SLAs breach. If refrigerated storage is affected, product may be at risk. The financial and contractual consequences escalate rapidly with time — containment speed is critical.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q4, kbItemId: IDS.t5K1Item, revisionId: IDS.t5K1Rev,
      questionText: 'Staff arrive to a warehouse where several computers show ransom notes on screen. How long has the attacker most likely been inside the network?',
      options: [
        'The attacker just broke in — the ransom note appears immediately upon access.',
        'A few hours — attackers work fast.',
        'Days to weeks — attackers typically map the network, identify backups, and exfiltrate data before triggering the encryption event.',
        'Exactly 24 hours — that is the industry-standard attacker dwell time.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'The ransom note is the last stage, not the first. Professional ransomware operators typically dwell in networks for days to weeks before detonating the ransomware. This dwell time is used to map the network, steal data (double extortion), and disable backups. The visible attack began long before the screen messages appeared.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t5Module,
    },
    // KB2: ransomware-containment (Q5-Q8)
    {
      id: IDS.t5Q5, kbItemId: IDS.t5K2Item, revisionId: IDS.t5K2Rev,
      questionText: 'You discover that a warehouse terminal is showing a ransom note. What is the correct first action?',
      options: [
        'Restart the computer to clear the ransomware process.',
        'Run an antivirus scan to identify and remove the ransomware.',
        'Do not restart — disconnect the device from the network by unplugging the ethernet cable and disabling Wi-Fi.',
        'Delete the ransom note and any suspicious files to contain the spread.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Disconnecting from the network immediately is the correct first action. Restarting may destroy forensic memory evidence and could trigger the ransomware to complete encryption. Deleting files destroys evidence. Antivirus may not recognise the ransomware. Network disconnection stops spread to other devices and stops the malware communicating with the attacker\'s command-and-control server.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q6, kbItemId: IDS.t5K2Item, revisionId: IDS.t5K2Rev,
      questionText: 'IT is not immediately available and ransomware appears to be spreading to multiple warehouse systems. What should you do?',
      options: [
        'Wait for IT to arrive before taking any action.',
        'Restart all affected computers to stop the spread.',
        'Disconnect network cables from affected machines and switches to isolate the network segment.',
        'Run a system restore on each affected machine.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'When IT is unavailable and ransomware is actively spreading, network isolation is both justified and necessary. Pull ethernet cables from affected machines. Disable Wi-Fi at the router if possible. Pull cables from network switches in affected areas. The operational disruption of an isolated network is far less than the damage from uncontrolled ransomware spread. Document every action you take.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q7, kbItemId: IDS.t5K2Item, revisionId: IDS.t5K2Rev,
      questionText: 'After a ransomware event, the IT responder\'s first question is: "Do you have clean backups, and when were they last tested?" Why does this question matter so much?',
      options: [
        'It is a standard question required by cyber insurance policies.',
        'The answer determines whether recovery is possible without paying the ransom — tested, offline backups are the primary recovery path.',
        'It helps identify the ransomware variant.',
        'It is used to calculate how much the ransom demand should be.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Backups are the recovery path. If you have tested, offline backups, recovery is expensive but possible. If backups were encrypted by the attacker or were never properly tested, recovery without paying the ransom may be impossible. This is why backup testing is a critical security control — not just a technical task. "We have backups" is not the same as "we can recover from them."',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q8, kbItemId: IDS.t5K2Item, revisionId: IDS.t5K2Rev,
      questionText: 'Should you pay the ransomware demand immediately if it is the fastest way to restore warehouse operations?',
      options: [
        'Yes — paying is the fastest and most reliable recovery option.',
        'No — payment should not be made without first consulting law enforcement and legal. Payment may violate sanctions, does not guarantee a working decryption key, and funds further attacks.',
        'Yes — if your cyber insurance covers it.',
        'Only if the ransom is under £10,000.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Ransomware payment decisions require legal and law enforcement consultation before proceeding. Payment may violate UK or US sanctions if the attacker is a sanctioned entity. Decryption keys are not always provided or functional after payment. Payment funds further ransomware operations. Law enforcement (Action Fraud, FBI IC3) should be notified early — they have tools and intelligence that can assist recovery.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t5Module,
    },
    // KB3: ransomware-communications (Q9-Q12)
    {
      id: IDS.t5Q9, kbItemId: IDS.t5K3Item, revisionId: IDS.t5K3Rev,
      questionText: 'During an active ransomware event, your company email is potentially compromised. How should internal communication be handled?',
      options: [
        'Continue using company email — attackers cannot monitor email in real time.',
        'Use personal mobile phones for calls and an out-of-band platform (personal device messaging, Teams) for written coordination.',
        'Use the company email but mark all messages as confidential.',
        'Stop all internal communication until IT confirms email is safe.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'If email is compromised, every message sent via company email is potentially visible to the attacker. This can compromise the incident response. Using out-of-band communication (personal phones, personal device messaging apps) keeps the response conversation away from the attacker. Stopping all communication is also wrong — coordination is critical during incident response.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q10, kbItemId: IDS.t5K3Item, revisionId: IDS.t5K3Rev,
      questionText: 'What is the correct order for notifications in the first hour of a ransomware event?',
      options: [
        'Customers first — they need to know immediately.',
        'IT lead first, then supervisor/director, then finance, then customers with active shipments.',
        'Finance director first, then IT, then everyone else.',
        'Law enforcement first — it is a legal requirement to notify immediately.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'IT must be the first call — they need to begin containment and assessment. Supervisor/director is notified immediately after so leadership has control. Finance is notified within the first hour because payment fraud risk must be assessed simultaneously with the technical response. Customers with active shipments are notified within 2-4 hours with a factual, honest status message.',
      status: 'promoted', confidence: 0.93, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q11, kbItemId: IDS.t5K3Item, revisionId: IDS.t5K3Rev,
      questionText: 'A customer calls asking about the status of their shipment during an active ransomware event. What is the correct response?',
      options: [
        '"We have been hit by ransomware — I\'ll call you back when systems are up."',
        '"Everything is fine — there is a small technical issue, nothing to worry about."',
        '"We are experiencing a systems outage affecting operations. We are investigating and will update you within [X hours] with a revised timeline. Here is a direct contact number for urgent queries."',
        '"I cannot comment on operational issues — contact our PR department."',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Honest, factual, and controlled is the correct tone. Avoid specifying "ransomware" in early customer communication without legal advice. Do not minimise ("nothing to worry about") — that creates a trust problem when the impact becomes apparent. Provide a specific timeframe for the next update and a direct contact. Customers appreciate honesty and communication far more than silence or false reassurance.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q12, kbItemId: IDS.t5K3Item, revisionId: IDS.t5K3Rev,
      questionText: 'After a ransomware event is resolved, a staff member wants to post about it on LinkedIn to warn others in the industry. Should they proceed?',
      options: [
        'Yes — sharing experiences helps the industry.',
        'Only if the post does not name the company.',
        'No — all public statements about the incident require explicit authorisation from the director or legal. Unauthorised posts can have legal and reputational consequences.',
        'Yes — as long as it is posted from a personal account.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Any public communication about a security incident — including social media posts — must be authorised. Unauthorised posts can: interfere with law enforcement investigations, create legal liability, breach insurance conditions, and cause reputational damage that exceeds the original incident. The rule is simple: no external statement without director or legal authorisation.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t5Module,
    },
    // Q13-Q22: deeper ransomware response coverage
    {
      id: IDS.t5Q13, kbItemId: IDS.t5K1Item, revisionId: IDS.t5K1Rev,
      questionText: 'Ransomware has been found on two warehouse terminals. The WMS is still running on the main server. What is the immediate priority?',
      options: [
        'Run antivirus scans on the two affected terminals before doing anything else.',
        'Isolate the affected terminals from the network immediately to prevent spread to the WMS server.',
        'Continue WMS operations and let IT investigate the affected terminals.',
        'Shut down the WMS server first to protect it.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Active ransomware spreads laterally across the network. The priority is network isolation — removing affected terminals from the network prevents the WMS and other systems from being encrypted. Shutting down the WMS server without isolation does not help if ransomware is already traversing the network. Antivirus scans during an active attack are too slow and unreliable.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q14, kbItemId: IDS.t5K1Item, revisionId: IDS.t5K1Rev,
      questionText: 'What is "double extortion" ransomware and why is it significant for logistics companies?',
      options: [
        'Two separate ransomware groups attack simultaneously.',
        'Attackers encrypt data AND exfiltrate it, threatening to publish customer, vendor, and shipment data unless payment is made — creating both operational and reputational risk.',
        'The ransom demand doubles every 24 hours until paid.',
        'A second ransom is demanded after the first decryption key is provided.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Double extortion means the attacker has two levers: decrypt your systems (operational recovery) and not publish your data (reputational and regulatory protection). For logistics companies, exfiltrated data may include customer PII, vendor contracts, carrier rate confirmations, and financial records. This creates an ICO notification obligation in the UK and GDPR exposure. Payment does not guarantee data deletion — published victim data after payment is well-documented.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q15, kbItemId: IDS.t5K2Item, revisionId: IDS.t5K2Rev,
      questionText: 'During a ransomware response, the IT team wants to image the encrypted drives before attempting recovery. Why?',
      options: [
        'Imaging is required by the insurance policy.',
        'Drive imaging preserves forensic evidence for law enforcement and incident investigation — without it, evidence of the attack method and entry point may be destroyed during recovery.',
        'Imaging speeds up the decryption process.',
        'Imaging is a legal requirement under UK GDPR.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Forensic imaging creates a complete snapshot of the system state at the time of the attack. This is critical for: identifying the initial access vector (how did they get in?), determining the full scope of the breach, supporting law enforcement investigation, and meeting cyber insurance evidence requirements. Recovering systems without imaging destroys this evidence permanently.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q16, kbItemId: IDS.t5K2Item, revisionId: IDS.t5K2Rev,
      questionText: 'What does the "3-2-1 backup rule" mean, and how does it protect against ransomware?',
      options: [
        '3 backup types, 2 backup tools, 1 backup team member responsible.',
        '3 copies of data, on 2 different media types, with 1 copy offsite/offline — the offline copy cannot be encrypted by ransomware that is active on the network.',
        '3 daily backups, 2 weekly backups, 1 monthly backup.',
        '3 servers, 2 of which are in the cloud, 1 on-premise.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The 3-2-1 rule ensures that at least one backup copy is air-gapped from the network — meaning ransomware that traverses your network cannot reach it. Many organisations have backups that are connected to the same network segment as their production systems, making them vulnerable to the same ransomware attack. Offline or immutable backups are the primary defence against catastrophic data loss.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q17, kbItemId: IDS.t5K2Item, revisionId: IDS.t5K2Rev,
      questionText: 'Before paying a ransomware demand, which of the following checks is legally required in many jurisdictions?',
      options: [
        'Confirm the ransom amount is below your cyber insurance deductible.',
        'Verify the attacker group is not a sanctioned entity — paying sanctioned groups may violate anti-money-laundering and sanctions law regardless of business impact.',
        'Check that the ransom is being paid in an approved cryptocurrency.',
        'Confirm that no employees have personal data stored on the affected systems.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'OFAC (in the US) and equivalent UK/EU sanctions authorities prohibit financial transactions with sanctioned entities. Ransomware groups like Conti, Evil Corp, and others have been sanctioned — paying them may be a criminal offence. A legal opinion and sanctions screening must precede any payment decision. Cyber insurers typically require this. This is one reason why payment should never be a spontaneous decision during the heat of an incident.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q18, kbItemId: IDS.t5K3Item, revisionId: IDS.t5K3Rev,
      questionText: 'Under UK GDPR, when must a personal data breach caused by ransomware be reported to the ICO?',
      options: [
        'Only if customer data was actually published by the attacker.',
        'Within 72 hours of the organisation becoming aware that personal data has likely been accessed or exfiltrated — regardless of whether it has been published.',
        'Within 30 days of the incident.',
        'Only if the affected individuals are EU citizens.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Under UK GDPR Article 33, a personal data breach that is likely to result in risk to individuals must be reported to the ICO within 72 hours of the controller becoming aware. Ransomware that accesses systems containing personal data is typically treated as a reportable breach. "We haven\'t confirmed data was exfiltrated" does not delay the clock — the obligation begins when you know the breach likely occurred.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q19, kbItemId: IDS.t5K3Item, revisionId: IDS.t5K3Rev,
      questionText: 'Your WMS is offline due to ransomware. What is the correct approach for warehouse operations during the outage?',
      options: [
        'Suspend all operations until WMS is recovered.',
        'Activate manual procedures — paper-based dock sheets, manual inventory counts, whiteboard load boards — and brief shift supervisors immediately.',
        'Use personal mobiles to text load information between teams.',
        'Wait for IT to provide an estimated recovery time before making any decisions.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Business continuity plans should include manual fallback procedures for WMS outages — ransomware or otherwise. Paper-based dock sheets, manual pallet count sheets, and whiteboard tracking are time-tested fallbacks. These should be pre-prepared and staff should be briefed on their use before an incident occurs. A total operations halt because the WMS is down represents an absence of continuity planning.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q20, kbItemId: IDS.t5K1Item, revisionId: IDS.t5K1Rev,
      questionText: 'Which of the following best describes how attackers typically access warehouse networks before deploying ransomware?',
      options: [
        'Physical break-in to access server hardware directly.',
        'Phishing emails leading to credential theft, followed by quiet persistence and lateral movement over days or weeks before encryption.',
        'Zero-day exploits targeting warehouse-specific WMS software.',
        'Social engineering of IT help desks to reset admin passwords.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The vast majority of ransomware incidents in SMEs begin with a phishing email that delivers credential-stealing malware or induces an employee to enter credentials on a fake login page. The attacker then gains quiet access, moves laterally to understand the network, identifies backup systems, and often spends weeks inside before triggering encryption. This "dwell time" is why patch management and phishing training are primary preventive controls.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q21, kbItemId: IDS.t5K2Item, revisionId: IDS.t5K2Rev,
      questionText: 'An external incident response firm has been engaged during an active ransomware event. What is their primary role in the first 4 hours?',
      options: [
        'Negotiate with the ransomware operators on the company\'s behalf.',
        'Identify the attack vector, scope the breach, contain the spread, preserve evidence, and provide a recovery roadmap.',
        'Restore data from backups directly.',
        'Contact law enforcement on the company\'s behalf.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'An incident response firm\'s first-phase focus is forensic analysis and containment — not recovery. They identify how the attacker entered, how far they spread, what data was accessed, and what systems are affected. This scope assessment drives the recovery strategy. Jumping to restoration before scoping risks rebuilding on a still-compromised foundation. IR firms may also assist with negotiations and law enforcement liaison, but containment and evidence preservation come first.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: IDS.t5Module,
    },
    {
      id: IDS.t5Q22, kbItemId: IDS.t5K3Item, revisionId: IDS.t5K3Rev,
      questionText: 'What is the purpose of a post-incident after-action review (AAR) following a ransomware event?',
      options: [
        'To assign blame and identify which employee clicked the phishing link.',
        'To document what happened, identify control gaps that allowed the attack to succeed, and define specific improvements to prevent recurrence.',
        'To satisfy cyber insurance renewal requirements.',
        'To write a public statement about the incident.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'An AAR is a structured learning exercise — not a blame exercise. The goal is to identify: how the attacker entered, what controls failed or were absent, what the response did well, and what specific changes are needed. AARs should be blameless and improvement-focused. The TTX (tabletop exercise) format is excellent for practising the response so that the real incident AAR has fewer surprises.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: IDS.t5Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T5 quiz questions (22)');

  // ── 12. T5 Content Chunks (FTS) ─────────────────────────────────────────────

  await db.insert(contentChunks).values([
    { id: IDS.cc_t5_1, itemId: IDS.t5K1Item, revisionId: IDS.t5K1Rev, chunkIndex: 0, content: T5_CONTENT.ransomwareInWarehouse.slice(0, 1200),    tokenCount: 250 },
    { id: IDS.cc_t5_2, itemId: IDS.t5K2Item, revisionId: IDS.t5K2Rev, chunkIndex: 0, content: T5_CONTENT.ransomwareContainment.slice(0, 1200),    tokenCount: 250 },
    { id: IDS.cc_t5_3, itemId: IDS.t5K3Item, revisionId: IDS.t5K3Rev, chunkIndex: 0, content: T5_CONTENT.ransomwareCommunications.slice(0, 1200), tokenCount: 250 },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T5 content chunks');

  // ── 13. T5 Topic Relationships ────────────────────────���──────────────────────

  await db.insert(topicRelationships).values([
    { id: IDS.tr_t5_1, itemId: IDS.t5K1Item, topicId: IDS.topicRansomware,       assignedBy: SEED_BY },
    { id: IDS.tr_t5_2, itemId: IDS.t5K1Item, topicId: IDS.topicFreightSecurity,  assignedBy: SEED_BY },
    { id: IDS.tr_t5_3, itemId: IDS.t5K2Item, topicId: IDS.topicRansomwareResp,   assignedBy: SEED_BY },
    { id: IDS.tr_t5_4, itemId: IDS.t5K2Item, topicId: IDS.topicIncidentResponse, assignedBy: SEED_BY },
    { id: IDS.tr_t5_5, itemId: IDS.t5K3Item, topicId: IDS.topicIncidentResponse, assignedBy: SEED_BY },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T5 topic relationships');

  // ── 14. T5 Module Assignment → Sam ──────────────────────────────────────────

  await db.insert(moduleAssignments).values([
    { id: IDS.ma_t5_sam, moduleId: IDS.t5Module, learnerId: IDS.samLearner, assignedBy: SEED_BY },
  ]).onConflictDoNothing();

  console.log('[seed-t4-t5] ✓ T5 module assigned to sam.professional');

  // ── Summary ──────────────────────────────────────────────────────────────────

  console.log('');
  console.log('[seed-t4-t5] ✅ T4+T5 expansion complete.');
  console.log('');
  console.log('  New modules:');
  console.log('    T4: t4-vendor-invoice-fraud     (3 primary tasks, 5 lesson links, 12 questions)');
  console.log('    T5: t5-warehouse-ransomware     (3 primary tasks, 5 lesson links, 12 questions)');
  console.log('');
  console.log('  T3 → T4 chain: set (if T3 nextModuleId was null)');
  console.log('  T4 → T5 chain: set');
  console.log('');
  console.log('  New KB items: 6 (3 per module)');
  console.log('  New questions: 24 (12 per module)');
  console.log('  New content chunks: 6');
  console.log('  New topics: 3 (invoice-fraud, document-fraud, ransomware-response)');
  console.log('  Sam assigned: T4 + T5');
  console.log('');
  console.log('  Run next: npx tsx --env-file=.env scripts/seed-t6-t7.ts');

  process.exit(0);
}

main().catch(err => {
  console.error('[seed-t4-t5] Fatal error:', err);
  process.exit(1);
});
