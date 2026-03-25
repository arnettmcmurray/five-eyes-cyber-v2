/**
 * Question depth expansion — Round 2 (T1 through T5).
 *
 * Adds 6 questions to T1, 8 to T2-BEC, 7 to T3, 6 to T4, 6 to T5.
 * All questions grounded in existing KB article content.
 *
 * After this pass:
 *   T1 phishing:      ~26 questions
 *   T2 BEC:           ~26 questions
 *   T3 account/MFA:   ~25 questions
 *   T4 invoice fraud: ~24 questions
 *   T5 ransomware:    ~24 questions
 *
 * Idempotent: ON CONFLICT DO NOTHING on all inserts.
 * Run: npx tsx --env-file=.env scripts/seed-questions-expansion-2.ts
 */

const SEED_BY = 'seed-questions-expansion-2';

// ── Fixed IDs — existing modules and KB items ──────────────────────────────

const REF = {
  // Modules
  t1Module: '712fb286-94ef-4f57-9d6a-c4f8ee9147cf',
  t2Module: 'a4e1b2c3-d5f6-4789-abcd-ef1234567890',
  t3Module: 'b5c6d7e8-f9a0-4bcd-efab-123456789abc',
  t4Module: 'ba000001-0000-4000-0000-000000000001',
  t5Module: 'ba000002-0000-4000-0000-000000000002',

  // T1 KB items
  t1K1Item: '104025aa-b87b-4153-a33e-b7be2b57a70a', t1K1Rev: '41350678-a536-4124-923e-da19d63cab6c',
  t1K2Item: 'b340bc7f-4567-4617-a177-4103b731eff5', t1K2Rev: 'd5a6c60e-e039-4c45-b389-178bcfe81cda',
  t1K3Item: '237cb8bf-0f47-48b5-80c6-33196d6cbc7e', t1K3Rev: 'f15df621-169d-4027-9fbe-dd99ba7fc22a',
  t1K4Item: 'c49ab1d2-3486-474b-a2f2-f875b4799758', t1K4Rev: '850b891a-bc14-4380-ab86-c95d728d1123',
  t1K5Item: '4aacad81-97b3-4a51-8082-5c8402ab168a', t1K5Rev: '98948de0-b838-4f03-80cd-76d7f4d8a876',

  // T2 BEC KB items — primary
  t2BecK1Item: 'aa000001-0000-4000-0000-000000000001', t2BecK1Rev: 'ab000001-0000-4000-0000-000000000001',
  t2BecK2Item: 'aa000002-0000-4000-0000-000000000002', t2BecK2Rev: 'ab000002-0000-4000-0000-000000000002',
  t2BecK3Item: 'aa000003-0000-4000-0000-000000000003', t2BecK3Rev: 'ab000003-0000-4000-0000-000000000003',
  // T2 BEC KB items — reference (not used in expansion-1)
  t2BecK4Item: 'aa000004-0000-4000-0000-000000000004', t2BecK4Rev: 'ab000004-0000-4000-0000-000000000004',
  t2BecK5Item: 'aa000005-0000-4000-0000-000000000005', t2BecK5Rev: 'ab000005-0000-4000-0000-000000000005',
  t2BecK6Item: 'aa000006-0000-4000-0000-000000000006', t2BecK6Rev: 'ab000006-0000-4000-0000-000000000006',
  t2BecK7Item: 'aa000007-0000-4000-0000-000000000007', t2BecK7Rev: 'ab000007-0000-4000-0000-000000000007',
  t2BecK8Item: 'aa000008-0000-4000-0000-000000000008', t2BecK8Rev: 'ab000008-0000-4000-0000-000000000008',

  // T3 KB items — primary
  t3K1Item: 'ae000001-0000-4000-0000-000000000001', t3K1Rev: 'af000001-0000-4000-0000-000000000001',
  t3K2Item: 'ae000002-0000-4000-0000-000000000002', t3K2Rev: 'af000002-0000-4000-0000-000000000002',
  t3K3Item: 'ae000003-0000-4000-0000-000000000003', t3K3Rev: 'af000003-0000-4000-0000-000000000003',
  // T3 KB items — reference
  t3K4Item: 'ae000004-0000-4000-0000-000000000004', t3K4Rev: 'af000004-0000-4000-0000-000000000004',
  t3K5Item: 'ae000005-0000-4000-0000-000000000005', t3K5Rev: 'af000005-0000-4000-0000-000000000005',
  t3K6Item: 'ae000006-0000-4000-0000-000000000006', t3K6Rev: 'af000006-0000-4000-0000-000000000006',
  t3K7Item: 'ae000007-0000-4000-0000-000000000007', t3K7Rev: 'af000007-0000-4000-0000-000000000007',

  // T4 KB items
  t4K1Item: 'ba010001-0000-4000-0000-000000000001', t4K1Rev: 'ba020001-0000-4000-0000-000000000001',
  t4K2Item: 'ba010002-0000-4000-0000-000000000002', t4K2Rev: 'ba020002-0000-4000-0000-000000000002',
  t4K3Item: 'ba010003-0000-4000-0000-000000000003', t4K3Rev: 'ba020003-0000-4000-0000-000000000003',

  // T5 KB items
  t5K1Item: 'bb010001-0000-4000-0000-000000000001', t5K1Rev: 'bb020001-0000-4000-0000-000000000001',
  t5K2Item: 'bb010002-0000-4000-0000-000000000002', t5K2Rev: 'bb020002-0000-4000-0000-000000000002',
  t5K3Item: 'bb010003-0000-4000-0000-000000000003', t5K3Rev: 'bb020003-0000-4000-0000-000000000003',
};

// ── New question IDs (round 2, prefix qf) ─────────────────────────────────

const QF = {
  // T1 expansion round 2 (6 questions)
  t1f1: 'qf100001-0000-4000-0000-000000000001',
  t1f2: 'qf100002-0000-4000-0000-000000000002',
  t1f3: 'qf100003-0000-4000-0000-000000000003',
  t1f4: 'qf100004-0000-4000-0000-000000000004',
  t1f5: 'qf100005-0000-4000-0000-000000000005',
  t1f6: 'qf100006-0000-4000-0000-000000000006',

  // T2 BEC expansion round 2 (8 questions)
  t2f1: 'qf200001-0000-4000-0000-000000000001',
  t2f2: 'qf200002-0000-4000-0000-000000000002',
  t2f3: 'qf200003-0000-4000-0000-000000000003',
  t2f4: 'qf200004-0000-4000-0000-000000000004',
  t2f5: 'qf200005-0000-4000-0000-000000000005',
  t2f6: 'qf200006-0000-4000-0000-000000000006',
  t2f7: 'qf200007-0000-4000-0000-000000000007',
  t2f8: 'qf200008-0000-4000-0000-000000000008',

  // T3 expansion round 2 (7 questions)
  t3f1: 'qf300001-0000-4000-0000-000000000001',
  t3f2: 'qf300002-0000-4000-0000-000000000002',
  t3f3: 'qf300003-0000-4000-0000-000000000003',
  t3f4: 'qf300004-0000-4000-0000-000000000004',
  t3f5: 'qf300005-0000-4000-0000-000000000005',
  t3f6: 'qf300006-0000-4000-0000-000000000006',
  t3f7: 'qf300007-0000-4000-0000-000000000007',

  // T4 expansion round 2 (6 questions)
  t4f1: 'qf400001-0000-4000-0000-000000000001',
  t4f2: 'qf400002-0000-4000-0000-000000000002',
  t4f3: 'qf400003-0000-4000-0000-000000000003',
  t4f4: 'qf400004-0000-4000-0000-000000000004',
  t4f5: 'qf400005-0000-4000-0000-000000000005',
  t4f6: 'qf400006-0000-4000-0000-000000000006',

  // T5 expansion round 2 (6 questions)
  t5f1: 'qf500001-0000-4000-0000-000000000001',
  t5f2: 'qf500002-0000-4000-0000-000000000002',
  t5f3: 'qf500003-0000-4000-0000-000000000003',
  t5f4: 'qf500004-0000-4000-0000-000000000004',
  t5f5: 'qf500005-0000-4000-0000-000000000005',
  t5f6: 'qf500006-0000-4000-0000-000000000006',
};

async function main() {
  const { db } = await import('../src/db/client.js');
  const { quizCandidates } = await import('../src/db/schema/quiz-candidates.js');

  console.log('[seed-questions-expansion-2] Starting round 2 question depth expansion...');

  // ── T1 — Phishing in Freight (6 more questions) ───────────────────────────

  await db.insert(quizCandidates).values([
    // t1K3: smishing — fake direct deposit text + dispatcher impersonation call
    {
      id: QF.t1f1, kbItemId: REF.t1K3Item, revisionId: REF.t1K3Rev,
      questionText: 'A driver receives a text: "Your direct deposit failed — click here to re-enter your bank details to receive today\'s pay." The sender appears to be their company\'s payroll system. What should the driver do?',
      options: [
        'Click the link — pay delays cause real hardship and this sounds urgent.',
        'Do not click the link. Go directly to the payroll app or call the payroll office using a number from the company intranet. Legitimate systems do not request bank details through a text link.',
        'Reply to the text asking for confirmation of which bank details are needed.',
        'Forward the text to the dispatcher to see if it is legitimate.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Fake direct deposit texts are a documented smishing attack targeting freight workers. The rule is simple: legitimate companies do not ask you to re-enter bank details through a link in a text message. If your pay is genuinely delayed, call the payroll office directly using a number you know. Never provide financial information through a link sent to your phone.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t1Module,
    },
    {
      id: QF.t1f2, kbItemId: REF.t1K3Item, revisionId: REF.t1K3Rev,
      questionText: 'A caller claims to be your dispatch office and asks for your current load location and delivery window details "to update the customer." You don\'t recognise the voice. Why might this be a vishing attack?',
      options: [
        'It is not suspicious — dispatch offices frequently call drivers for location updates.',
        'Attackers use dispatcher impersonation to gather situational awareness for cargo theft — knowing your load, location, and delivery window enables a physical interception.',
        'It is only suspicious if the caller asks for a password or PIN.',
        'It is suspicious only if the call came from an unknown number.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Dispatcher impersonation calls are used to gather intelligence for cargo theft. A freight load\'s location, contents, delivery window, and route are valuable to criminals planning a physical theft. The correct response: do not confirm load details, hang up, and call dispatch back at the number you know. The fact that caller ID may show a legitimate company number is irrelevant — caller ID can be spoofed.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: REF.t1Module,
    },
    // t1K2: email red flags — urgency rule + URL shorteners
    {
      id: QF.t1f3, kbItemId: REF.t1K2Item, revisionId: REF.t1K2Rev,
      questionText: 'An email subject reads: "URGENT: Your account will be suspended in 24 hours." According to the email red flags guidance, this urgency is:',
      options: [
        'A sign you should act immediately — account suspensions have real operational consequences.',
        'A signal that the email deserves more scrutiny, not less. Urgency designed to make you act before verifying is itself a red flag.',
        'Only suspicious if combined with a link to a non-standard domain.',
        'Normal — most platform notifications use urgent subject lines.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The red flags guidance states explicitly: "If the urgency is the main message, the email deserves more scrutiny, not less." Urgency is an engineering choice by the attacker — it is designed to short-circuit your verification instinct. The correct response to urgency is to slow down and verify, not to comply faster.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: REF.t1Module,
    },
    {
      id: QF.t1f4, kbItemId: REF.t1K2Item, revisionId: REF.t1K2Rev,
      questionText: 'An email from a vendor includes a link that shows as "bit.ly/freightinvoice123" when you hover. Why is this a red flag for freight business communications?',
      options: [
        'It is not — shortened URLs are commonly used by legitimate businesses to make links more manageable.',
        'URL shorteners hide the actual destination. In freight business communications, there is no legitimate reason for a vendor to send a shortened URL. It prevents you from reading the real domain before clicking.',
        'It is a red flag only if the shortened URL redirects to a non-HTTPS site.',
        'Shortened URLs from recognised URL shorteners (bit.ly, tinyurl) are trusted.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Shortened URLs are a red flag in freight business communications because they hide the destination domain. Your ability to read a URL before clicking — to check the domain is legitimate — is removed. A vendor with a legitimate invoice to send has no reason to use a URL shortener. Any link to a freight business platform, payment portal, or document should show the full real domain.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t1Module,
    },
    // t1K5: reporting — what to report + already clicked
    {
      id: QF.t1f5, kbItemId: REF.t1K5Item, revisionId: REF.t1K5Rev,
      questionText: 'A driver clicked a link in a text two days ago and thinks it might have been suspicious but is embarrassed to say anything. What should happen?',
      options: [
        'Nothing — if nothing bad has happened yet, the threat has probably passed.',
        'The driver should report it to their supervisor immediately, even two days later. Delayed reporting is still valuable — account recovery, password resets, and security monitoring can still limit damage.',
        'The driver should change their password and monitor their account themselves.',
        'The driver should only report it if they saw any unusual account activity.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The reporting guidance is explicit: "Tell your supervisor immediately — do not wait. Every minute matters." Even two days later, reporting enables account recovery, password resets, and investigation of what the attacker may have accessed. The guidance also states: "There is no blame for reporting — there is only risk from not reporting." Delayed reporting is far better than no reporting.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t1Module,
    },
    {
      id: QF.t1f6, kbItemId: REF.t1K1Item, revisionId: REF.t1K1Rev,
      questionText: 'According to the phishing in freight article, a phishing email targeting a freight company is not the attack itself — it is described as what?',
      options: [
        'The final stage of the attack.',
        'The door — phishing steals credentials or installs malware, which then enables the real attack: TMS access, payment fraud, load redirection.',
        'A low-risk nuisance that rarely leads to actual compromise in freight.',
        'The same as the attack on a consumer — there is nothing freight-specific about it.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The phishing in freight article states directly: "The phishing email is not the attack itself — it is the door." Phishing is the entry point. After credentials are captured or malware installs, attackers access TMS portals, load boards, or email accounts to execute the real attack: fraudulent shipping paperwork, redirected loads, payment fraud. Understanding phishing as a door — not the end goal — helps staff understand why it matters even if the email looks minor.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t1Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-questions-expansion-2] ✓ T1 +6 questions');

  // ── T2 BEC — 8 more questions from reference KB items ────────────────────

  await db.insert(quizCandidates).values([
    // t2BecK4: payment change policy — Rule 1, Rule 3
    {
      id: QF.t2f1, kbItemId: REF.t2BecK4Item, revisionId: REF.t2BecK4Rev,
      questionText: 'The payment change verification policy states: "No bank detail change by email alone." Does this rule apply even when the email appears to come from a vendor you have worked with for years?',
      options: [
        'No — a long-established vendor relationship is sufficient trust to update bank details by email.',
        'Yes — the rule applies regardless of the apparent sender. BEC specifically targets trusted relationships. An attacker who has compromised your vendor\'s email will send the request from the real address.',
        'Only for payments above the dual-approval threshold.',
        'Yes, but only if the email requests an immediate change.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The policy is non-negotiable and applies to all banking changes regardless of relationship history. The reason is precisely that BEC attacks exploit trusted relationships — the fraudulent email may come from the real vendor\'s domain if their email account has been compromised. A long-established relationship is not a substitute for independent verification.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: REF.t2Module,
    },
    {
      id: QF.t2f2, kbItemId: REF.t2BecK4Item, revisionId: REF.t2BecK4Rev,
      questionText: 'During a callback to verify a banking change, the AP team member finds the phone number to call in the email that contained the banking change request. Why is this wrong?',
      options: [
        'It is acceptable if the phone number matches the company\'s website.',
        'The callback number in the requesting email is controlled by the attacker. A fraudulent email will provide a fraudulent phone number. The only valid callback source is your existing records or the company\'s official website.',
        'It is only wrong if the number is a mobile number rather than a direct business line.',
        'It is fine — verifying by phone regardless of source is sufficient.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The payment change policy requires calling "a phone number from your existing records or the company\'s official website — not a phone number provided in the requesting email." An attacker constructing a fraudulent banking change email will also include a fraudulent phone number where a confederate answers and confirms the change. The source of the callback number is as important as making the call.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: REF.t2Module,
    },
    // t2BecK5: BEC in freight — factoring pattern + direct deposit change
    {
      id: QF.t2f3, kbItemId: REF.t2BecK5Item, revisionId: REF.t2BecK5Rev,
      questionText: 'Your AP team receives an email from what appears to be your factoring company, announcing "new banking instructions" for payments relating to a specific carrier. The email looks professionally formatted and references real invoice numbers. What is the correct response?',
      options: [
        'Update the payment records — the professional format and correct invoice references confirm it is legitimate.',
        'Stop and verify: call your factoring company at the number you have on file (not in the email) and confirm the change directly with your known contact.',
        'Reply to the email requesting confirmation from a director.',
        'Process one payment using the new details and monitor for problems.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Factoring account redirect is a documented freight BEC pattern. Attackers compromise the email of your factoring company or a carrier and send convincing "new banking instructions." Professional formatting and correct invoice numbers can be obtained by attackers through prior email compromise or reconnaissance. The correct action is always an independent callback to the factoring company\'s known number — not reliance on the email\'s appearance.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t2Module,
    },
    {
      id: QF.t2f4, kbItemId: REF.t2BecK5Item, revisionId: REF.t2BecK5Rev,
      questionText: 'A driver emails payroll requesting their direct deposit bank account be changed to a new account. What control does the BEC guidance require before processing this change?',
      options: [
        'Confirm with the driver\'s direct manager by email that the request is genuine.',
        'Call the driver at the number in your records — not a number in the email — or require an in-person request. Payroll direct deposit changes must be verified out-of-band.',
        'Process the change and monitor whether the driver reports any issue with the following pay.',
        'Require the driver to submit a signed form via email.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Driver direct deposit changes are an identified BEC attack pattern. An attacker poses as an employee and emails payroll requesting a bank account change. The control: direct deposit changes require a verbal confirmation with the employee using a number from your records, or an in-person request. Not an email reply, not a form submission — a direct out-of-band confirmation.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t2Module,
    },
    // t2BecK6: financial escalation tree — bank call timing + IC3
    {
      id: QF.t2f5, kbItemId: REF.t2BecK6Item, revisionId: REF.t2BecK6Rev,
      questionText: 'A fraudulent wire transfer has just been discovered. You have the fraud department number for your bank. According to the escalation guidance, why must you call the fraud department — not general customer service?',
      options: [
        'Fraud departments have longer opening hours.',
        'The fraud department can initiate a wire recall; general customer service cannot. Speed is critical — wire recall success rates drop sharply after 24–48 hours.',
        'Fraud departments have more experienced staff who can give better advice.',
        'General customer service will route you to fraud anyway, so either works.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The escalation guidance is specific: call the bank\'s fraud department, not general customer service. Only the fraud department can initiate wire recall procedures. The guidance also states: "Wire recall success rates drop sharply after 24–48 hours." Every minute spent in a general customer service queue is a minute the money is moving further out of reach. Know your bank\'s fraud line number before you need it.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t2Module,
    },
    {
      id: QF.t2f6, kbItemId: REF.t2BecK6Item, revisionId: REF.t2BecK6Rev,
      questionText: 'After discovering a fraudulent payment, your company notifies the bank and insurance carrier. The guidance also recommends filing with the FBI\'s IC3. What specific programme makes early IC3 filing valuable for fund recovery?',
      options: [
        'IC3 reports trigger automatic bank reversals if filed within 24 hours.',
        'The FBI\'s Financial Fraud Kill Chain works with financial institutions to halt and recover BEC funds. Early filing gives the programme more options before money is withdrawn or moved internationally.',
        'IC3 filing is required to make an insurance claim.',
        'IC3 filing creates a public record that protects against future fraud.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The escalation tree references the FBI\'s Financial Fraud Kill Chain — a programme that works with financial institutions to halt and recover funds in BEC cases. Filing at IC3.gov early (within 24 hours) gives this programme more options. Once funds move offshore or are withdrawn, recovery becomes much harder. IC3 filing is not just for legal record-keeping — it is an active recovery tool.',
      status: 'promoted', confidence: 0.93, promotedToModuleId: REF.t2Module,
    },
    // t2BecK7: already sent money — 60-minute window + what not to do
    {
      id: QF.t2f7, kbItemId: REF.t2BecK7Item, revisionId: REF.t2BecK7Rev,
      questionText: 'You have just discovered a payment of £85,000 was made to a fraudulent account 45 minutes ago. You are preparing to call the bank. What information must you have ready for the fraud call?',
      options: [
        'Your account number and a description of the fraudulent email.',
        'The transfer amount, destination account number and routing number, the exact date and time of the transfer, and the reference number.',
        'The name of the vendor who was impersonated and the invoice number on the fraudulent request.',
        'A copy of the fraudulent email and your approval records.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The "if you already sent money" guidance specifies exactly what the bank needs to initiate a recall: the transfer amount, the destination bank name, routing number, and account number, the exact date and time, and the reference number. Having this ready before calling avoids wasting critical minutes gathering information while on hold. The guidance is clear: "This is the most time-sensitive step."',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t2Module,
    },
    // t2BecK8: evidence capture checklist — headers + chain of custody
    {
      id: QF.t2f8, kbItemId: REF.t2BecK8Item, revisionId: REF.t2BecK8Rev,
      questionText: 'When preserving a suspicious email as evidence, why is exporting the email with its full headers more valuable than a simple screenshot?',
      options: [
        'It is not — a screenshot is sufficient for bank and insurance purposes.',
        'Full headers contain the actual routing path of the email, the originating server, the real sender IP address, and the Reply-To address — information that confirms the email\'s true source and is critical for law enforcement and bank recovery.',
        'Full headers are only needed if law enforcement requests them.',
        'Headers are useful for IT but not for bank or insurance claims.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The evidence capture checklist specifies exporting the email "with full headers (right-click → View Message Source or Show Original)." Full headers reveal the actual sending server and routing path, which can expose that the email came from an attacker\'s server despite a convincing display name. This metadata is used by investigators to identify the attack infrastructure and may be required to prove fraud to your bank and insurer.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: REF.t2Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-questions-expansion-2] ✓ T2 +8 questions');

  // ── T3 — Account Security and MFA (7 more questions) ──────────────────────

  await db.insert(quizCandidates).values([
    // t3K4: account security standard — MFA tiers + shared accounts
    {
      id: QF.t3f1, kbItemId: REF.t3K4Item, revisionId: REF.t3K4Rev,
      questionText: 'The account security standard defines MFA Tier 1 as "required immediately." Which of the following is a Tier 1 account type?',
      options: [
        'Accounting and payroll software — high financial risk.',
        'Business email — it is the master key, required for Tier 1 along with VPN, TMS/load board accounts, and payment portals.',
        'Cloud storage with business files — contains sensitive data.',
        'ELD and telematics platforms — directly tied to freight operations.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The account security standard Tier 1 — required immediately — includes: business email, VPN and remote access, TMS and load board accounts, and factoring and payment portals. Accounting/payroll, cloud storage, and ELD platforms are Tier 2 (required within 30 days). Business email is at the top of Tier 1 because it is the recovery path for every other account.',
      status: 'promoted', confidence: 0.93, promotedToModuleId: REF.t3Module,
    },
    {
      id: QF.t3f2, kbItemId: REF.t3K4Item, revisionId: REF.t3K4Rev,
      questionText: 'The account security standard prohibits shared accounts for certain system types. Why are shared accounts for TMS access specifically prohibited?',
      options: [
        'They are a security risk but not prohibited — companies can use them with appropriate controls.',
        'Shared accounts remove individual accountability: when an action is taken in the TMS (a load modified, a payment changed), there is no way to identify which person was responsible. This prevents fraud detection and investigation.',
        'Shared accounts increase the risk of passwords being written down.',
        'They are prohibited only if more than three people share the account.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The standard states shared accounts are prohibited "for any system where individual accountability is required — TMS actions, payment approvals, email communications." Without individual accountability, fraud and errors become uninvestigable. If a shipment was redirected or a payment approved fraudulently, a shared account means you cannot determine who took the action or whether it was an insider or an external attacker.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t3Module,
    },
    // t3K5: MFA FAQ — MFA security ranking + recovery codes storage
    {
      id: QF.t3f3, kbItemId: REF.t3K5Item, revisionId: REF.t3K5Rev,
      questionText: 'From most to least secure, what is the correct order of MFA methods according to the MFA FAQ?',
      options: [
        'Authenticator app → hardware key → push notification → SMS → email code',
        'Hardware security key → authenticator app → push notification → email code → SMS text code',
        'SMS → email code → push notification → authenticator app → hardware key',
        'Hardware key → SMS → authenticator app → email → push notification',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The MFA FAQ ranks methods from most to least secure: (1) hardware security key — phishing-resistant, not affected by SIM swaps; (2) authenticator app — strong and practical; (3) push notification — convenient but can be defeated by prompt bombing; (4) email code — acceptable; (5) SMS text code — weakest, vulnerable to SIM swap attacks. For payment portal access, use the highest available method.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: REF.t3Module,
    },
    {
      id: QF.t3f4, kbItemId: REF.t3K5Item, revisionId: REF.t3K5Rev,
      questionText: 'Where should MFA recovery codes be stored?',
      options: [
        'In the same email inbox that the MFA protects — so they are always accessible.',
        'In your password manager vault or in a secure physical location — not in the same email inbox or on the same device the MFA is protecting.',
        'In a text file on your desktop for quick access.',
        'Recovery codes do not need to be stored — you can always request new ones.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The MFA FAQ explicitly states: "Store them in your password manager vault or printed in a secure physical location — not in the same email inbox or on the same device the MFA is protecting." If your recovery codes are in your email inbox and your email account is compromised, the attacker has both your email access and your recovery codes. Separation of the recovery mechanism from the protected account is essential.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t3Module,
    },
    // t3K6: account takeover in freight — TMS ATO consequences + email forwarding
    {
      id: QF.t3f5, kbItemId: REF.t3K6Item, revisionId: REF.t3K6Rev,
      questionText: 'An attacker gains access to a freight company\'s TMS account. Beyond reading shipment data, what persistent capability can they establish that is particularly dangerous?',
      options: [
        'They can view delivery windows but cannot modify records in most TMS systems.',
        'They can monitor operations for weeks, identifying the right moment to divert a high-value load — shipment details, carrier identities, delivery windows, and customer data are all visible.',
        'The main risk is reputation damage from sending messages to customers.',
        'They can only access data for the specific user account that was compromised.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The account takeover article explains: "An attacker with TMS access and patience can monitor your operations for weeks before timing a fraudulent load pickup." TMS access provides shipment details, customer and carrier contact information, delivery windows, and the ability to modify shipment records. This intelligence enables a precisely timed cargo theft — not just data exposure.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t3Module,
    },
    {
      id: QF.t3f6, kbItemId: REF.t3K6Item, revisionId: REF.t3K6Rev,
      questionText: 'An attacker compromises a freight company\'s email account but does not change the password. Instead, they set up a silent forwarding rule. Why is this particularly dangerous?',
      options: [
        'It is not especially dangerous — reading emails does not give access to other systems.',
        'A silent forwarding rule copies every incoming email to the attacker while the legitimate user continues using the account normally, unaware of the compromise. The attacker builds a complete intelligence picture of the business over weeks or months.',
        'It is dangerous because it may cause email delivery delays.',
        'It is only dangerous if the attacker intercepts payment-related emails.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The article describes this as "a frequent ATO pattern": the attacker sets up a forwarding rule and never changes the password. The legitimate user never knows the account is compromised. Every email about payments, load schedules, vendor relationships, and customer communications is copied to the attacker — creating the intelligence needed to time a perfectly credible BEC attack. Silent forwarding rules are why post-compromise email review (checking for forwarding rules, active sessions, sent items) is critical.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t3Module,
    },
    // t3K7: lost phone MFA recovery — recovery code usage + check for unauthorized access
    {
      id: QF.t3f7, kbItemId: REF.t3K7Item, revisionId: REF.t3K7Rev,
      questionText: 'Your phone is lost and you need to regain access to your email account which has authenticator-based MFA. You have recovery codes saved. What account should you recover first and why?',
      options: [
        'Your TMS account — it contains the most operationally sensitive data.',
        'Your business email — it is the recovery path for every other account. With email access, you can reset passwords and disable old MFA devices for all other accounts.',
        'Your payment portal — it carries the highest financial risk.',
        'Whichever account you use most frequently.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The lost phone recovery guidance states: "Start with: (1) Business email — this is your recovery path for everything else." Email is the master key: every password reset, security notification, and account recovery goes through your email. With email access restored, you can recover all other accounts. Starting with email is not just practical — it is structurally correct because email access enables all subsequent recoveries.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t3Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-questions-expansion-2] ✓ T3 +7 questions');

  // ── T4 — Freight Vendor Invoice Fraud (6 more questions) ──────────────────

  await db.insert(quizCandidates).values([
    // t4K1: invoice fraud anatomy — reconnaissance and urgency
    {
      id: QF.t4f1, kbItemId: REF.t4K1Item, revisionId: REF.t4K1Rev,
      questionText: 'The invoice fraud anatomy describes four stages. In Stage 1 (Reconnaissance), how do attackers gather information about your vendor relationships before targeting you?',
      options: [
        'They guess vendor names based on common freight company types.',
        'Through LinkedIn (which lists key vendors), prior phishing campaigns that harvested email content, or purchasing stolen data.',
        'They call the company posing as an auditor to collect vendor information.',
        'They examine publicly filed accounts to identify supplier relationships.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The invoice fraud article explains that Stage 1 reconnaissance uses multiple channels: LinkedIn often lists key vendor relationships, prior phishing campaigns may have already harvested email content revealing real invoice details, and stolen data is available for purchase. This is why fraudulent emails can reference real invoice numbers and vendor names — the attacker researched you before contacting you.',
      status: 'promoted', confidence: 0.93, promotedToModuleId: REF.t4Module,
    },
    {
      id: QF.t4f2, kbItemId: REF.t4K1Item, revisionId: REF.t4K1Rev,
      questionText: 'A freight broker sends an urgent email requesting commission payment to a new account before a scheduled load, citing "new banking arrangements." What two red flags are present?',
      options: [
        'The payment is commission-based and the broker is new.',
        'Urgency tied to an operational event ("before the scheduled load") and a banking detail change — both are classic invoice fraud triggers requiring out-of-band verification.',
        'The email mentions "new arrangements" and requests an immediate wire transfer.',
        'The request came by email and the broker is asking for commission.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Two simultaneous fraud signals: (1) urgency manufactured around an operational event (the scheduled load creates time pressure), and (2) a banking detail change. The invoice fraud article explicitly identifies "freight broker commission to a new account" as a common fraud scenario. The correct response is to call the broker at their known number — not a number in the email — and confirm both the banking change and the commission amount independently.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t4Module,
    },
    // t4K2: vendor banking red flags — lookalike domain + out-of-band required when request looks convincing
    {
      id: QF.t4f3, kbItemId: REF.t4K2Item, revisionId: REF.t4K2Rev,
      questionText: 'An email from "ocean-freightpartners.com" requests a banking change. Your legitimate vendor\'s domain is "oceanfreightpartners.com." Is this a red flag?',
      options: [
        'Not necessarily — email domains sometimes change when businesses restructure.',
        'Yes — this is a lookalike domain. The vendor banking red flags guidance specifically lists "ocean-freightpartners.com instead of oceanfreightpartners.com" as an impersonation example. A hyphen added to a domain is a common technique.',
        'Only if the email content also contains urgency language.',
        'Check with the vendor — domain changes do happen legitimately.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The vendor banking red flags article specifically uses this example: "ocean-freightpartners.com instead of oceanfreightpartners.com." A single added hyphen creates a lookalike domain that is distinct from the legitimate one. The guidance instructs: check the sender domain "character by character: rn looks like m, 0 looks like o." Lookalike domains combined with a banking change request require immediate out-of-band verification.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: REF.t4Module,
    },
    {
      id: QF.t4f4, kbItemId: REF.t4K2Item, revisionId: REF.t4K2Rev,
      questionText: 'A banking change email provides a phone number for you to call to confirm the change. The guidance states this phone number is a red flag. Why?',
      options: [
        'It is not necessarily a red flag — vendors providing a confirmation number is common practice.',
        'A phone number provided in the suspicious email is controlled by the attacker. A confederate will answer and confirm the fraudulent change. Only call numbers from your existing records or the company\'s official website.',
        'Phone numbers in emails are a red flag only if they are mobile numbers.',
        'It is a red flag because vendors should confirm changes in writing, not by phone.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The vendor banking red flags guidance explicitly flags this: "Does the email provide a new phone number or email to confirm with? (Red flag — the attacker controls that number/address.)" This is the most important principle: the callback number must come from your own records or the company\'s official website. A number provided in the suspicious email is a trap — calling it means calling the attacker.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: REF.t4Module,
    },
    // t4K3: invoice verification — standard checklist + what happens when steps are skipped
    {
      id: QF.t4f5, kbItemId: REF.t4K3Item, revisionId: REF.t4K3Rev,
      questionText: 'The standard invoice verification checklist has five steps. Which step is most likely to catch a payment redirect fraud before money is sent?',
      options: [
        'Step 1 — confirming the invoice exists on file.',
        'Step 4 — confirming banking details are unchanged from the last payment to this vendor. If changed: stop and verify out-of-band.',
        'Step 2 — confirming the payee name matches exactly.',
        'Step 5 — obtaining dual approval.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Step 4 of the verification checklist — "Are the bank details the same as the last payment to this vendor? If not — stop and verify" — is the direct catch for payment redirect fraud. The entire fraud mechanism relies on substituting bank details. Step 4 is specifically designed to surface that substitution before payment. Steps 1-3 confirm the invoice is legitimate; Step 4 confirms the payment destination is legitimate.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t4Module,
    },
    {
      id: QF.t4f6, kbItemId: REF.t4K3Item, revisionId: REF.t4K3Rev,
      questionText: 'The invoice verification guidance states that wire transfer and BACS payments made to fraudulent accounts are "rarely recovered." Why does this make pre-payment verification essential rather than optional?',
      options: [
        'It makes verification important but not essential — some funds are recovered.',
        'Because payment fraud losses are effectively permanent. Once sent, a wire transfer to a fraudulent account is moved within hours. The cost of skipping a five-minute verification can be the company\'s operating capital.',
        'Because insurance covers wire fraud losses, making recovery straightforward.',
        'Because the bank can always initiate a recall if you report within 24 hours.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The invoice verification article states directly: "Wire transfers and BACS payments, once made to a fraudulent account, are moved within hours. Your bank may be unable to recall the funds." This is why verification is a financial control, not a bureaucratic preference. The guidance frames it economically: "The cost of a five-minute verification call is zero. The cost of a missed verification can be the company\'s operating capital."',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t4Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-questions-expansion-2] ✓ T4 +6 questions');

  // ── T5 — Warehouse Ransomware Response (6 more questions) ─────────────────

  await db.insert(quizCandidates).values([
    // t5K1: ransomware in warehouse — attacker dwell period + unpatched systems
    {
      id: QF.t5f1, kbItemId: REF.t5K1Item, revisionId: REF.t5K1Rev,
      questionText: 'Ransomware attackers typically enter a network weeks before the encryption event. What do they do during this "dwell period"?',
      options: [
        'They encrypt files gradually to avoid detection.',
        'They map the network, delete or encrypt backup systems, move laterally to high-value targets, and exfiltrate sensitive data — so that by the time the ransom note appears, maximum damage has already been done.',
        'They wait for a low-activity period before executing the encryption.',
        'They monitor whether their presence has been detected.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The ransomware in warehouse article describes the attacker timeline: "Ransomware attackers typically enter a network weeks before the encryption event. During this window they: map the network, identify and delete or encrypt backup systems, move laterally to reach the highest-value targets, exfiltrate sensitive data (double extortion)." This explains why the ransom note is not the start of the attack — by then, backups may already be gone and data already stolen.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t5Module,
    },
    {
      id: QF.t5f2, kbItemId: REF.t5K1Item, revisionId: REF.t5K1Rev,
      questionText: 'Warehouse environments often run older operating systems (Windows 7, Windows Server 2008) on fixed terminals. Why does this create a ransomware risk specifically?',
      options: [
        'Older systems cannot run modern antivirus software.',
        'Unpatched systems have known vulnerabilities that are well-documented in attacker tools. Microsoft no longer issues security patches for end-of-life systems, so vulnerabilities remain open indefinitely.',
        'Older systems are slower, making them easier to compromise.',
        'The risk is the same as for modern systems — ransomware targets all operating systems equally.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The ransomware article identifies "unpatched systems — warehouse environments often run older operating systems on fixed terminals. Unpatched vulnerabilities are well-known to attackers." When an OS reaches end-of-life, the vendor stops issuing security patches. Known vulnerabilities from that point forward remain permanently exploitable. Attackers specifically target these systems because the attack tools are documented and the vulnerabilities are permanent.',
      status: 'promoted', confidence: 0.93, promotedToModuleId: REF.t5Module,
    },
    // t5K2: ransomware containment — do not restart + network isolation decision
    {
      id: QF.t5f3, kbItemId: REF.t5K2Item, revisionId: REF.t5K2Rev,
      questionText: 'Staff find a warehouse terminal displaying a ransom note. Their instinct is to restart the machine to "clear it." Why does the containment guidance say not to restart?',
      options: [
        'Restarting may spread the ransomware to other machines on the network.',
        'Restarting may destroy volatile memory containing forensic evidence, and may trigger the ransomware to complete its encryption run on files it had not yet touched.',
        'Restarting is only dangerous if the ransomware is still actively running.',
        'Restarting is acceptable if IT is not immediately available.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The containment guidance Step 1 states: "Do not restart the affected machine. Restarting may destroy volatile memory containing forensic evidence. It may also trigger the ransomware to complete its encryption run." RAM may contain decryption keys or malware artefacts that are only available while the machine is powered on. Additionally, some ransomware variants are designed to complete their payload on restart. Leave the machine running, disconnect it from the network, and wait for IT.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t5Module,
    },
    {
      id: QF.t5f4, kbItemId: REF.t5K2Item, revisionId: REF.t5K2Rev,
      questionText: 'IT is not immediately available and ransomware is actively spreading across warehouse terminals. The containment guidance says it may be necessary to pull network cables from switches. Why is this level of disruption justified?',
      options: [
        'It is not — the business disruption of taking down the network is worse than the ransomware spreading.',
        'The business pain of an isolated network is significantly less than the damage of an uncontrolled ransomware spread — every minute of spread means more encrypted machines and a more expensive recovery.',
        'Network isolation is only justified if the ransomware is known to spread via network shares.',
        'Network isolation should wait for IT authorisation regardless of spread speed.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The containment article states directly: "The business pain of an isolated network is significantly less than the damage of an uncontrolled ransomware spread." Ransomware spreads by moving through network shares and lateral connections. Each minute of spread means more machines encrypted, longer recovery time, and higher cost. Pulling cables to stop spread — even with IT not present — is the correct judgement when ransomware is actively spreading.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t5Module,
    },
    // t5K3: ransomware communications — notification order + what to say to customers
    {
      id: QF.t5f5, kbItemId: REF.t5K3Item, revisionId: REF.t5K3Rev,
      questionText: 'The ransomware communications playbook requires notifying the finance director within 1 hour. A team member argues that finance is irrelevant since no financial systems appear affected. Why is the guidance correct?',
      options: [
        'The finance director must approve the ransom payment decision.',
        'Ransomware attackers who had network access may simultaneously attempt payment fraud. Finance must apply heightened payment scrutiny and avoid processing urgent payment requests through potentially compromised channels during and after the incident.',
        'Insurance notification requires finance director sign-off.',
        'Finance must be informed to begin calculating the financial impact for the board.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The communications guidance explains: "ransomware attacks are frequently combined with simultaneous payment fraud attempts — attackers who have been inside the network may already be monitoring email and can attempt BEC attacks during the chaos of the response." Finance must be alerted immediately to apply heightened scrutiny to all payment requests. The chaos of a ransomware response makes it easier for attackers to push through fraudulent payments — "urgent" requests during a crisis bypass normal scrutiny.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t5Module,
    },
    {
      id: QF.t5f6, kbItemId: REF.t5K3Item, revisionId: REF.t5K3Rev,
      questionText: 'During a ransomware event, email is unavailable or untrusted. The communications guidance recommends using "out-of-band messaging" for internal coordination. What does this mean in practice?',
      options: [
        'Wait until email is restored before communicating internally.',
        'Use personal mobile phones for voice calls and platforms like WhatsApp or Teams on personal devices — communication channels that are separate from the compromised corporate network.',
        'Use the company\'s backup email server.',
        'All communication should go through the IT team only.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The communications playbook states: "If email is unavailable or untrusted: use personal mobile phones for voice calls, use an out-of-band messaging platform (WhatsApp group, Teams on personal devices) for written coordination." Out-of-band means using channels that do not depend on or pass through the compromised corporate network. This ensures the attacker — who may be monitoring corporate email — cannot read your response coordination.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: REF.t5Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-questions-expansion-2] ✓ T5 +6 questions');
  console.log('');
  console.log('[seed-questions-expansion-2] Summary: 6+8+7+6+6 = 33 new questions added.');
  console.log('[seed-questions-expansion-2] Module totals after expansion:');
  console.log('  T1 phishing:       ~26 questions');
  console.log('  T2 BEC payment:    ~26 questions');
  console.log('  T3 account/MFA:    ~25 questions');
  console.log('  T4 invoice fraud:  ~24 questions');
  console.log('  T5 ransomware:     ~24 questions');
  console.log('[seed-questions-expansion-2] Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
