/**
 * Question depth expansion — T1 through T5.
 *
 * Adds 5 questions to T1, 6 to T2-BEC, 6 to T3, 6 to T4, 6 to T5.
 * All questions are grounded in the existing KB article content for each module.
 *
 * Idempotent: ON CONFLICT DO NOTHING on all inserts.
 * Run: npx tsx --env-file=.env scripts/seed-questions-expansion.ts
 */

const SEED_BY = 'seed-questions-expansion';

// ── Fixed IDs — existing modules and KB items ─────────────────────────────────

const REF = {
  // Modules
  t1Module: '712fb286-94ef-4f57-9d6a-c4f8ee9147cf',
  t2Module: 'a4e1b2c3-d5f6-4789-abcd-ef1234567890',
  t3Module: 'b5c6d7e8-f9a0-4bcd-efab-123456789abc',
  t4Module: 'ba000001-0000-4000-0000-000000000001',
  t5Module: 'ba000002-0000-4000-0000-000000000002',

  // T1 KB items + revisions
  t1K1Item: '104025aa-b87b-4153-a33e-b7be2b57a70a', t1K1Rev: '41350678-a536-4124-923e-da19d63cab6c',
  t1K2Item: 'b340bc7f-4567-4617-a177-4103b731eff5', t1K2Rev: 'd5a6c60e-e039-4c45-b389-178bcfe81cda',
  t1K3Item: '237cb8bf-0f47-48b5-80c6-33196d6cbc7e', t1K3Rev: 'f15df621-169d-4027-9fbe-dd99ba7fc22a',
  t1K4Item: 'c49ab1d2-3486-474b-a2f2-f875b4799758', t1K4Rev: '850b891a-bc14-4380-ab86-c95d728d1123',
  t1K5Item: '4aacad81-97b3-4a51-8082-5c8402ab168a', t1K5Rev: '98948de0-b838-4f03-80cd-76d7f4d8a876',

  // T2 BEC KB items + revisions (primary only)
  t2BecK1Item: 'aa000001-0000-4000-0000-000000000001', t2BecK1Rev: 'ab000001-0000-4000-0000-000000000001',
  t2BecK2Item: 'aa000002-0000-4000-0000-000000000002', t2BecK2Rev: 'ab000002-0000-4000-0000-000000000002',
  t2BecK3Item: 'aa000003-0000-4000-0000-000000000003', t2BecK3Rev: 'ab000003-0000-4000-0000-000000000003',

  // T3 KB items + revisions (primary only)
  t3K1Item: 'ae000001-0000-4000-0000-000000000001', t3K1Rev: 'af000001-0000-4000-0000-000000000001',
  t3K2Item: 'ae000002-0000-4000-0000-000000000002', t3K2Rev: 'af000002-0000-4000-0000-000000000002',
  t3K3Item: 'ae000003-0000-4000-0000-000000000003', t3K3Rev: 'af000003-0000-4000-0000-000000000003',

  // T4 KB items + revisions
  t4K1Item: 'ba010001-0000-4000-0000-000000000001', t4K1Rev: 'ba020001-0000-4000-0000-000000000001',
  t4K2Item: 'ba010002-0000-4000-0000-000000000002', t4K2Rev: 'ba020002-0000-4000-0000-000000000002',
  t4K3Item: 'ba010003-0000-4000-0000-000000000003', t4K3Rev: 'ba020003-0000-4000-0000-000000000003',

  // T5 KB items + revisions
  t5K1Item: 'bb010001-0000-4000-0000-000000000001', t5K1Rev: 'bb020001-0000-4000-0000-000000000001',
  t5K2Item: 'bb010002-0000-4000-0000-000000000002', t5K2Rev: 'bb020002-0000-4000-0000-000000000002',
  t5K3Item: 'bb010003-0000-4000-0000-000000000003', t5K3Rev: 'bb020003-0000-4000-0000-000000000003',
};

// ── New question IDs ──────────────────────────────────────────────────────────

const QE = {
  // T1 expansion (5 questions)
  t1e1: 'qe100001-0000-4000-0000-000000000001',
  t1e2: 'qe100002-0000-4000-0000-000000000002',
  t1e3: 'qe100003-0000-4000-0000-000000000003',
  t1e4: 'qe100004-0000-4000-0000-000000000004',
  t1e5: 'qe100005-0000-4000-0000-000000000005',

  // T2 BEC expansion (6 questions)
  t2e1: 'qe200001-0000-4000-0000-000000000001',
  t2e2: 'qe200002-0000-4000-0000-000000000002',
  t2e3: 'qe200003-0000-4000-0000-000000000003',
  t2e4: 'qe200004-0000-4000-0000-000000000004',
  t2e5: 'qe200005-0000-4000-0000-000000000005',
  t2e6: 'qe200006-0000-4000-0000-000000000006',

  // T3 expansion (6 questions)
  t3e1: 'qe300001-0000-4000-0000-000000000001',
  t3e2: 'qe300002-0000-4000-0000-000000000002',
  t3e3: 'qe300003-0000-4000-0000-000000000003',
  t3e4: 'qe300004-0000-4000-0000-000000000004',
  t3e5: 'qe300005-0000-4000-0000-000000000005',
  t3e6: 'qe300006-0000-4000-0000-000000000006',

  // T4 expansion (6 questions)
  t4e1: 'qe400001-0000-4000-0000-000000000001',
  t4e2: 'qe400002-0000-4000-0000-000000000002',
  t4e3: 'qe400003-0000-4000-0000-000000000003',
  t4e4: 'qe400004-0000-4000-0000-000000000004',
  t4e5: 'qe400005-0000-4000-0000-000000000005',
  t4e6: 'qe400006-0000-4000-0000-000000000006',

  // T5 expansion (6 questions)
  t5e1: 'qe500001-0000-4000-0000-000000000001',
  t5e2: 'qe500002-0000-4000-0000-000000000002',
  t5e3: 'qe500003-0000-4000-0000-000000000003',
  t5e4: 'qe500004-0000-4000-0000-000000000004',
  t5e5: 'qe500005-0000-4000-0000-000000000005',
  t5e6: 'qe500006-0000-4000-0000-000000000006',
};

async function main() {
  const { db } = await import('../src/db/client.js');
  const { quizCandidates } = await import('../src/db/schema/quiz-candidates.js');

  console.log('[seed-questions-expansion] Starting question depth expansion...');

  // ── T1 — Phishing in Freight (5 new questions) ────────────────────────────

  await db.insert(quizCandidates).values([
    // t1K1: phishing in freight
    {
      id: QE.t1e1, kbItemId: REF.t1K1Item, revisionId: REF.t1K1Rev,
      questionText: 'A freight dispatcher receives an email claiming to be from FMCSA stating their MC number has a compliance violation that must be resolved within 48 hours via the link provided. What is the most accurate characterisation of this email?',
      options: [
        'A legitimate FMCSA notice — compliance violations require immediate action.',
        'A freight-targeted phishing lure using a fake regulatory urgency to drive a click — real FMCSA notices are mailed and provide time to respond.',
        'Probably a scam, but FMCSA compliance emails do sometimes arrive without warning.',
        'A vendor notification — FMCSA issues compliance notices through freight brokers.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'FMCSA compliance lures are a documented freight-specific phishing attack. Real FMCSA enforcement notices are delivered via postal mail and always identify the specific regulation and provide a formal response period. Email claiming immediate action on an MC number is a phishing attempt exploiting the fear of authority suspension.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t1Module,
    },
    // t1K2: email red flags
    {
      id: QE.t1e2, kbItemId: REF.t1K2Item, revisionId: REF.t1K2Rev,
      questionText: 'You receive an email from "DAT Load Board <alerts@dat-freight-notifications.com>" telling you your account is suspended. The subject line says "URGENT: Account suspension — verify in 24 hours." What two specific red flags does this email contain?',
      options: [
        'The word "urgent" and the 24-hour deadline.',
        'The lookalike domain (dat-freight-notifications.com instead of dat.com) and the urgency/time pressure language designed to bypass scrutiny.',
        'The use of load board notifications and the mention of account suspension.',
        'The email came from an external sender and uses your company name.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Two classic red flags: (1) The sender domain is a lookalike — "dat-freight-notifications.com" is not "dat.com." Check the domain character by character. (2) Urgency and time pressure ("24 hours") are engineered to make you act before verifying. Legitimate platforms do not suspend accounts based on email responses — they require action through your authenticated account.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t1Module,
    },
    // t1K3: smishing/vishing
    {
      id: QE.t1e3, kbItemId: REF.t1K3Item, revisionId: REF.t1K3Rev,
      questionText: 'A driver receives a call that shows the company\'s dispatch office number on caller ID. The caller claims to be IT support and says the driver\'s TMS app credentials need to be re-verified over the phone. Caller ID shows the office number. Is it safe to provide the credentials?',
      options: [
        'Yes — caller ID showing the office number confirms the caller is legitimate.',
        'Yes — IT support staff sometimes need to verify credentials remotely.',
        'No — caller ID can be spoofed. Legitimate IT support does not need your password. Hang up and call the office number directly.',
        'Only if the caller can confirm your employee ID first.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Caller ID spoofing is straightforward — attackers can make any number appear. A spoofed caller ID is not proof of identity. Legitimate IT support never needs your password to fix a problem — they access systems through admin tools. The correct response is to hang up and independently dial the number you know for the dispatch office or IT helpdesk.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: REF.t1Module,
    },
    // t1K4: safe link handling
    {
      id: QE.t1e4, kbItemId: REF.t1K4Item, revisionId: REF.t1K4Rev,
      questionText: 'You hover over a link in an email and the preview shows: https://auth.dat-loadboard-secure.com/login. Is this a legitimate DAT link?',
      options: [
        'Yes — it uses HTTPS which confirms it is secure.',
        'Yes — the URL starts with "auth.dat" which is the DAT authentication server.',
        'No — the domain is "dat-loadboard-secure.com", not "dat.com". The auth.dat prefix is a subdomain controlled by whoever owns dat-loadboard-secure.com.',
        'Cannot tell from hovering — need to click the link to check.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Reading a URL correctly: the domain is the part just before the first single forward slash after the protocol. In "https://auth.dat-loadboard-secure.com/login", the domain is "dat-loadboard-secure.com" — not dat.com. The "auth.dat" piece is a subdomain, and subdomains are controlled by the domain owner. HTTPS confirms the connection is encrypted, not that the site is legitimate.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: REF.t1Module,
    },
    // t1K5: how to report
    {
      id: QE.t1e5, kbItemId: REF.t1K5Item, revisionId: REF.t1K5Rev,
      questionText: 'A colleague receives a suspicious email and forwards it to the whole team to warn them. Why is this the wrong approach?',
      options: [
        'It is not wrong — informing the team quickly helps everyone stay alert.',
        'Forwarding spreads the suspicious email and its links to additional potential targets, multiplying the risk rather than containing it.',
        'It is only wrong if the email contains attachments.',
        'It is wrong because it bypasses the IT helpdesk ticketing system.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Forwarding a suspicious email to colleagues spreads the attack. Links in phishing emails are live — each person who receives the forwarded email is a new potential victim. The correct action is to report to a supervisor, not forward. Preserve the email without clicking, and let IT handle distribution of the warning through safe channels.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t1Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-questions-expansion] ✓ T1 +5 questions');

  // ── T2 BEC — BEC and Payment Fraud (6 new questions) ─────────────────────

  await db.insert(quizCandidates).values([
    // t2BecK1: freight BEC map — fuel advance fraud + verification habit
    {
      id: QE.t2e1, kbItemId: REF.t2BecK1Item, revisionId: REF.t2BecK1Rev,
      questionText: 'A driver sends an email from an address you don\'t recognise asking for a fuel advance to be sent to a "temporary account" because their usual account is frozen. What is the correct response?',
      options: [
        'Send the advance to the temporary account — the driver is on the road and needs the funds.',
        'Decline entirely — fuel advances should never be sent to non-standard accounts.',
        'Do not process. Call the driver at the number you have on file (not the one in the email) to confirm the request is genuine before making any payment.',
        'Ask the driver to send proof of their account freeze before processing.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'Fuel advances to non-standard accounts are a documented BEC attack vector. Attackers compromise a carrier\'s email or create a spoofed address, then intercept advance payments. The correct control is out-of-band verification: call the driver at the number you have independently on file. Do not rely on a number or account provided in the suspicious email.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t2Module,
    },
    {
      id: QE.t2e2, kbItemId: REF.t2BecK1Item, revisionId: REF.t2BecK1Rev,
      questionText: 'According to the BEC freight payment map, at which stage of the payment cycle is a "late change" email (requesting re-routing to a new entity or account at the final stage) most dangerous?',
      options: [
        'Stage 1 (carrier onboarding) — this is where most fraud originates.',
        'Stage 5 (settlement and final payment) — the load is delivered, the relationship seems secure, and time pressure to close the invoice can bypass verification.',
        'Stage 3 (factoring) — this is the highest-value transaction.',
        'Stage 6 (payroll) — employees are easy targets.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Stage 5 late-change attacks exploit the completion pressure of a delivered load. Both parties want the settlement closed, POD is confirmed, and the relationship feels established. An attacker impersonating a carrier or factoring company can exploit this "wind-down" moment when scrutiny is reduced. The verification rule applies at every stage, but this stage is particularly vulnerable to complacency.',
      status: 'promoted', confidence: 0.93, promotedToModuleId: REF.t2Module,
    },
    // t2BecK2: BEC indicator library — secrecy + two-question checkpoint
    {
      id: QE.t2e3, kbItemId: REF.t2BecK2Item, revisionId: REF.t2BecK2Rev,
      questionText: 'A payment instruction email says: "Please don\'t loop in accounting on this — handle it directly and I\'ll explain when I\'m back in the office." This instruction is:',
      options: [
        'Reasonable if the sender is a senior manager dealing with a confidential matter.',
        'A strong BEC indicator — legitimate payment instructions do not require secrecy, and this instruction is specifically designed to prevent verification.',
        'Unusual but not necessarily fraudulent — some payments are commercially sensitive.',
        'Acceptable if the email comes from a domain you recognise.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Secrecy and confidentiality requirements in payment requests are a documented BEC indicator. Legitimate payments do not require bypassing normal oversight. The reason attackers use this technique is precisely to prevent you from reaching someone who would confirm "no, we never sent that." Any instruction not to involve accounting or management should be treated as a fraud signal, not a reason for compliance.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: REF.t2Module,
    },
    {
      id: QE.t2e4, kbItemId: REF.t2BecK2Item, revisionId: REF.t2BecK2Rev,
      questionText: 'Applying the two-question BEC checkpoint: you receive a payment instruction email that: (1) is the only source of this request — no prior verbal or written instruction, and (2) requests updated banking details for a vendor you have paid before. What should you do?',
      options: [
        'Process the payment — you have paid this vendor before, so the relationship is verified.',
        'Process but flag for review in the next reconciliation cycle.',
        'Stop and verify: both conditions (sole email source, new banking detail) trigger the checkpoint. Call the vendor at a number you look up independently before taking any action.',
        'Ask the vendor to send a signed letter confirming the change.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'The two-question checkpoint: (1) Is email the only source? Yes. (2) Has anything bypassed normal process? Yes — new banking details for an existing vendor. Both conditions are triggered. The prior relationship does not reduce the risk — BEC specifically exploits trusted relationships. Stop and verify independently before any payment action.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t2Module,
    },
    // t2BecK3: dual approval — rubber stamping and threshold
    {
      id: QE.t2e5, kbItemId: REF.t2BecK3Item, revisionId: REF.t2BecK3Rev,
      questionText: 'Your colleague says "I\'ve already checked this payment — just add your name as the second approver." You have not reviewed the underlying invoice or verified the vendor details yourself. Does adding your name constitute valid dual approval?',
      options: [
        'Yes — one person has already done the checking, so adding a second name fulfils the requirement.',
        'No — dual approval requires both approvers to independently verify the payment details. Adding your name without personal review is rubber-stamping, which provides no fraud protection.',
        'Yes, if you trust your colleague\'s judgment.',
        'Only if the payment is below the threshold amount.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Dual approval is only effective when both approvers independently verify. Rubber-stamping — where the second approver relies entirely on the first — means one deceived person can still authorise a fraudulent payment. Each approver must personally confirm: is this invoice on file? Are the bank details correct? Has anything about this request changed? Independent review is the control.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: REF.t2Module,
    },
    {
      id: QE.t2e6, kbItemId: REF.t2BecK3Item, revisionId: REF.t2BecK3Rev,
      questionText: 'A payment of £4,800 arrives with an instruction to "process before close of business today." Your company\'s dual approval threshold is £5,000. Should the payment be processed without dual approval since it is below the threshold?',
      options: [
        'Yes — it is legitimately below the threshold and urgent.',
        'No — the urgency instruction is itself a BEC indicator. Additionally, breaking a payment into amounts just below the threshold to avoid controls is a known fraud technique. Apply additional scrutiny, not less.',
        'Yes, but flag it for the next compliance review.',
        'Only process if your manager verbally approves the urgency.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Payments fractionally below control thresholds with urgency pressure are a BEC technique. Attackers research your approval thresholds and target amounts designed to fly under them. The urgency language is an additional red flag. Both signals together warrant escalated scrutiny, not expedited processing. Your threshold is a minimum, not a safe zone for fraud.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t2Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-questions-expansion] ✓ T2 +6 questions');

  // ── T3 — Account Security and MFA (6 new questions) ──────────────────────

  await db.insert(quizCandidates).values([
    // t3K1: password guidance — passphrase and manager
    {
      id: QE.t3e1, kbItemId: REF.t3K1Item, revisionId: REF.t3K1Rev,
      questionText: 'Which of the following is a stronger password for a TMS login?',
      options: [
        'P@ssw0rd1! (8 characters with symbol and number substitution)',
        'correct-horse-battery-staple (four random words, 28 characters)',
        'TMS2024Admin! (role-based with year)',
        'QW3rty!9 (random-looking 8 characters)',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Length dominates password strength. "correct-horse-battery-staple" is 28 characters — vastly harder to brute-force than any 8-character password, regardless of symbol substitution. Character substitutions (@ for a, 0 for o) are well-known to cracking tools. Four random unrelated words create entropy through length and unpredictability. A password manager generates and stores credentials like this, so you only need to remember one master passphrase.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t3Module,
    },
    {
      id: QE.t3e2, kbItemId: REF.t3K1Item, revisionId: REF.t3K1Rev,
      questionText: 'A freight dispatcher has used the same TMS password for 3 years without any security incident. According to current NIST guidance, should they change it now?',
      options: [
        'Yes — passwords should be changed every 90 days regardless of incident history.',
        'No — NIST guidance says don\'t force periodic password changes unless there is evidence of compromise. Forced rotation leads to weaker passwords. Change it if there\'s a breach, not on a calendar.',
        'Yes — 3 years without change is too long for any business account.',
        'Only if the company\'s password policy requires a change.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'NIST SP 800-63B updated guidance: do not require periodic password changes unless there is evidence of compromise. Forced rotation (every 90 days) leads users to pick weaker, patterned passwords (Password1!, Password2!) and post them on stickies. A strong password that has not been involved in a breach should be kept. Change it immediately if any breach occurs involving that account or service.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: REF.t3Module,
    },
    // t3K2: MFA guide — app vs SMS and MFA fatigue
    {
      id: QE.t3e3, kbItemId: REF.t3K2Item, revisionId: REF.t3K2Rev,
      questionText: 'Your company is rolling out MFA for TMS access. The IT team is deciding between SMS-based MFA and an authenticator app for the finance team who process high-value payments. Which should they choose and why?',
      options: [
        'SMS — it is simpler for staff and equally secure.',
        'Authenticator app — SMS codes can be intercepted via SIM-swapping attacks, and finance staff handling large payments are a high-value target worth the extra setup.',
        'Either is acceptable — the important thing is having any MFA.',
        'SMS — authenticator apps require smartphones which not all staff have.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'SMS MFA is better than nothing but is vulnerable to SIM-swapping, where attackers convince a mobile carrier to transfer your number to their SIM, intercepting your codes. Finance staff managing high-value payments are a high-value target for this attack. Authenticator apps generate time-based codes offline and are not interceptable via SIM-swap. For high-risk roles, app-based MFA is the correct recommendation.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t3Module,
    },
    {
      id: QE.t3e4, kbItemId: REF.t3K2Item, revisionId: REF.t3K2Rev,
      questionText: 'A dispatcher receives a push notification on their phone asking to approve a login — they did not try to log in. They ignore the first notification. A second and third appear over the next few minutes. Why might an attacker send multiple approval requests?',
      options: [
        'It is a technical glitch in the MFA system causing duplicate notifications.',
        'MFA fatigue — the attacker sends repeated approval requests hoping the user approves one just to make the notifications stop.',
        'The attacker is testing the system to see which notifications get through.',
        'This indicates the attacker has already compromised the account.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'MFA fatigue (also called MFA bombing or push harassment) is a real attack technique. An attacker who already has valid credentials but not the MFA approval sends repeated push notifications hoping the user will approve one to stop the annoyance. The correct response is to deny all unapproved requests and immediately report to IT — this means someone has your credentials and is actively attempting to access your account.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t3Module,
    },
    // t3K3: privilege separation — daily use admin + offboarding
    {
      id: QE.t3e5, kbItemId: REF.t3K3Item, revisionId: REF.t3K3Rev,
      questionText: 'A small freight company has one IT admin who also uses their admin account for daily email and browsing. Why does this violate privilege separation?',
      options: [
        'It doesn\'t — small companies cannot always afford separate accounts.',
        'Admin accounts have elevated permissions across all systems. Using them for daily work means every email opened, every link clicked, and every website visited carries the risk of compromising the most powerful account in the company.',
        'It violates the policy because admins should not use email.',
        'It is only a problem if the admin account is shared with other users.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Privilege separation requires that high-privilege accounts are used only for privileged tasks. Browsing the web or opening emails from an admin account means phishing attacks, drive-by downloads, and malicious attachments run with admin permissions. An attacker who compromises a daily-use admin account immediately has keys to every system. The fix: a separate unprivileged account for daily work, admin account only when elevated access is required.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t3Module,
    },
    {
      id: QE.t3e6, kbItemId: REF.t3K3Item, revisionId: REF.t3K3Rev,
      questionText: 'A carrier onboarding manager leaves the company. IT keeps their TMS account active for 30 days "in case we need to access their work." The account has access to carrier bank details and payment records. What is the risk?',
      options: [
        'No risk — the employee no longer has the device.',
        'The account represents a credential that is no longer monitored, could be accessed by the former employee, or could be compromised. Active accounts with sensitive access should be disabled on the last day of employment.',
        'Low risk — the former employee signed a confidentiality agreement.',
        'Only a risk if the employee left on bad terms.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Accounts of departed employees must be disabled on their last day, not after a grace period. A live account with carrier bank details and payment records is a standing risk: the former employee may retain access (especially if credentials were reused), the account may be visible in data from prior email compromise, or attackers scanning for valid credentials may find it. "Just in case" access should be handled through supervised data export, not live account retention.',
      status: 'promoted', confidence: 0.96, promotedToModuleId: REF.t3Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-questions-expansion] ✓ T3 +6 questions');

  // ── T4 — Freight Vendor Invoice Fraud (6 new questions) ──────────────────

  await db.insert(quizCandidates).values([
    // t4K1: invoice fraud in freight — what good looks like + port agent scenario
    {
      id: QE.t4e1, kbItemId: REF.t4K1Item, revisionId: REF.t4K1Rev,
      questionText: 'Which combination of controls does a well-protected freight business have in place against invoice fraud?',
      options: [
        'A spam filter and antivirus on all AP computers.',
        'A written out-of-band verification policy, dual approval above threshold, a verified vendor contact list (phone numbers confirmed separately), and a no-blame culture for pausing payments.',
        'A finance director who reviews all invoices personally.',
        'Requiring all invoices to arrive by post rather than email.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Strong invoice fraud defence is a combination of policy, process, and culture: (1) A written policy so staff know the rule. (2) Out-of-band verification for banking changes. (3) Dual approval above threshold. (4) A verified contact list so you can call the real number, not one provided in a fraudulent email. (5) A culture where pausing a payment is praised, not questioned.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: REF.t4Module,
    },
    {
      id: QE.t4e2, kbItemId: REF.t4K1Item, revisionId: REF.t4K1Rev,
      questionText: 'You receive an invoice from a port agent for handling fees of £47,000, with a note that their bank account has changed. The agent is real and the fees align with recent port activity. What is the one thing that determines whether this is safe to pay?',
      options: [
        'Whether the invoice number matches your port activity records.',
        'Whether the email domain exactly matches the port agent\'s known domain.',
        'Whether you have independently verified the new bank account details with the port agent through a phone call to a number you already have on file — not a number in the email.',
        'Whether the amount falls within your normal range for this agent.',
      ],
      suggestedCorrectIndex: 2,
      explanation: 'A legitimate invoice amount and a real vendor name are not sufficient confirmation. Attackers research your real vendor relationships and invoice volumes to make fraud emails look authentic. The only thing that determines safety is whether you have independently verified the new bank account via an out-of-band call. Invoice match, known agent, realistic amount — none of these substitute for verification.',
      status: 'promoted', confidence: 0.97, promotedToModuleId: REF.t4Module,
    },
    // t4K2: vendor banking change red flags — personal account + the £240k rule
    {
      id: QE.t4e3, kbItemId: REF.t4K2Item, revisionId: REF.t4K2Rev,
      questionText: 'A vendor banking change request provides a new account where the account holder name is an individual person\'s name rather than a company name. Why is this a red flag?',
      options: [
        'It is not a red flag — sole traders often use personal accounts.',
        'Legitimate freight vendors use business accounts. A personal account as the destination for a business payment is unusual and should trigger verification, since it may indicate the payment would go to an individual (the attacker) rather than the vendor company.',
        'It is a red flag only if the person\'s name does not match a named contact at the vendor.',
        'Personal accounts charge higher transaction fees, which is why it matters.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Established freight vendors use business bank accounts. A personal account named for an individual receiving a large B2B payment is an anomaly that warrants verification. Attackers may use personal accounts (sometimes mule accounts) to receive diverted payments. This does not mean every sole trader using a personal account is committing fraud — but combined with other factors (new account, urgent request), it requires out-of-band confirmation.',
      status: 'promoted', confidence: 0.93, promotedToModuleId: REF.t4Module,
    },
    {
      id: QE.t4e4, kbItemId: REF.t4K2Item, revisionId: REF.t4K2Rev,
      questionText: 'The "£240,000 rule" from the vendor banking red flag guidance states that you should not change banking details for a large payment based on an email alone. What is the underlying principle?',
      options: [
        '£240,000 is the legal threshold for mandatory dual-approval under UK payment regulations.',
        'The standard of proof you require before taking an action should match the consequences of that action. A five-minute verification call costs nothing; a misdirected wire transfer may be unrecoverable.',
        'Payments over £240,000 require HMRC notification, so extra scrutiny is warranted.',
        'Cyber insurance only covers misdirected payments over £240,000, so smaller amounts require less verification.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'The rule is a principle of proportionate verification: the effort required to verify a payment instruction should match the cost of getting it wrong. You would not hand over cash without identity checks. You should not change banking details for any significant payment without independently verifying the change. The specific amount in the example is illustrative — the principle applies at any amount above your verification threshold.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t4Module,
    },
    // t4K3: invoice verification — new vendor bar + culture
    {
      id: QE.t4e5, kbItemId: REF.t4K3Item, revisionId: REF.t4K3Rev,
      questionText: 'A new carrier has just delivered their first load and submits an invoice requesting payment. This is the first payment you would make to this carrier. What additional verification is appropriate compared to an established vendor?',
      options: [
        'None — the carrier completed the load, so the invoice is legitimate.',
        'New vendors require higher verification: collect and file bank details through a formal onboarding process before the first payment, verify company registration independently, and consider director-level sign-off for the first payment.',
        'Simply check that the bank account is in the same country as the carrier.',
        'Ask the carrier to provide two references from other freight companies they have worked with.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'New vendor payments are higher risk than established vendor payments because there is no verified payment history to compare against. The correct process: collect banking details through a separate onboarding flow (not from the first invoice email), verify the carrier\'s company registration independently, and apply a higher approval bar for the first payment. Do not pay a new vendor from bank details that arrived only on their first invoice.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: REF.t4Module,
    },
    {
      id: QE.t4e6, kbItemId: REF.t4K3Item, revisionId: REF.t4K3Rev,
      questionText: 'An AP team member pauses a £75,000 payment because the bank details changed by one digit from the previous payment. After a callback, the change turns out to be a legitimate data entry error. A manager comments "you caused a half-day delay." What is the correct organisational response to this situation?',
      options: [
        'Acknowledge the delay was unfortunate and remind the team member to use faster verification next time.',
        'Praise the team member for following the verification procedure — a half-day delay is the correct and acceptable cost of fraud prevention. The same procedure that caused the delay would have prevented a £75,000 fraud.',
        'Review the process to reduce delays in the future without compromising security.',
        'No specific response needed — the team member was doing their job.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Culture is part of the fraud control. If staff who pause payments for verification receive criticism, they will stop pausing. The manager\'s comment — regardless of intent — undermines the control. The organisational response must be to explicitly praise the verification behaviour: "you did exactly the right thing." A culture where pausing is safe is a culture where fraud is hard.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t4Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-questions-expansion] ✓ T4 +6 questions');

  // ── T5 — Warehouse Ransomware Response (6 new questions) ─────────────────

  await db.insert(quizCandidates).values([
    // t5K1: ransomware in warehouse — vendor access + double extortion
    {
      id: QE.t5e1, kbItemId: REF.t5K1Item, revisionId: REF.t5K1Rev,
      questionText: 'A WMS vendor has persistent remote access to your warehouse systems for support purposes. Why does this create a ransomware risk even if your own systems are well-maintained?',
      options: [
        'It does not create additional risk — the vendor\'s connection is encrypted.',
        'If the vendor\'s systems or credentials are compromised, attackers gain access to your network through the vendor\'s trusted connection without ever needing to compromise your users or perimeter.',
        'Remote access connections are monitored so any intrusion would be detected immediately.',
        'Vendor connections only risk data theft, not ransomware deployment.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Third-party vendor connections are a well-documented ransomware entry point. Attackers compromise the vendor\'s credentials or systems, then use the vendor\'s legitimate, trusted remote access to enter your network. Your own security posture is irrelevant to this pathway — you inherit the vendor\'s security weaknesses. Controls: limit vendor access to specific systems and time windows, require MFA for vendor connections, log all vendor sessions.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: REF.t5Module,
    },
    {
      id: QE.t5e2, kbItemId: REF.t5K1Item, revisionId: REF.t5K1Rev,
      questionText: 'A ransomware group uses "double extortion" in their attack on a freight company. What does this mean?',
      options: [
        'They demand the ransom twice — once for decryption and once for data deletion.',
        'They encrypt the data AND exfiltrate it before encrypting, threatening to publish stolen freight contracts, customer data, or financial information if the ransom is not paid.',
        'They attack two separate companies in the same attack.',
        'They require payment in two different cryptocurrencies to make tracing harder.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Double extortion means attackers exfiltrate your data during the dwell period (before triggering the ransomware) and then threaten to publish it. Even if you restore from backups without paying for decryption, the data is still at risk of publication. This escalates the pressure significantly — the victim faces both operational disruption and data exposure. For freight companies, stolen data may include customer contracts, carrier bank details, and shipment manifests.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t5Module,
    },
    // t5K2: ransomware containment — don't fix yourself + evidence
    {
      id: QE.t5e3, kbItemId: REF.t5K2Item, revisionId: REF.t5K2Rev,
      questionText: 'A warehouse supervisor is technically capable and attempts to remove the ransomware from affected machines themselves before IT arrives, to restore operations faster. Why is this likely to make the situation worse?',
      options: [
        'It is not — technically capable staff should act quickly to reduce operational impact.',
        'Self-remediation attempts often destroy forensic evidence needed to understand the attack, may miss infections on other machines, and can trigger the ransomware to complete its encryption run or execute additional payloads.',
        'It may accidentally spread the ransomware to the supervisor\'s own machine.',
        'IT staff are contractually responsible and should not have their role bypassed.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Attempting to clean ransomware without forensic expertise destroys evidence. IT and incident responders need to understand which systems are affected, the ransomware variant, and the entry point to prevent reinfection. Premature cleanup can also trigger sleeping malware components, delete files needed for recovery, or cause ransomware to complete encryption on files it had not yet touched. Isolate, document, report — do not remediate without guidance.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: REF.t5Module,
    },
    {
      id: QE.t5e4, kbItemId: REF.t5K2Item, revisionId: REF.t5K2Rev,
      questionText: 'Immediately after ransomware is discovered, a staff member takes a photo of the ransom note on screen and notes the time, the machines affected, and what they were doing when the issue was first noticed. Why is this valuable?',
      options: [
        'It is not particularly valuable — IT will handle the forensics.',
        'Documentation from the first moments of an incident is critical forensic evidence: the time pinpoints when encryption began, the ransom note may identify the ransomware variant, and the staff member\'s activity may reveal the initial infection vector.',
        'It is required for the insurance claim.',
        'Photos are needed in case the screens are wiped during recovery.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'First-response documentation is forensically significant. The time the ransomware was first noticed helps establish the timeline. The ransom note text often identifies the ransomware group or variant, which helps IT understand available decryptors and known recovery paths. The activity at the time (what was opened, what was clicked) may reveal the entry point. This information is valuable to IT, incident responders, and law enforcement — and it takes 30 seconds to capture.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t5Module,
    },
    // t5K3: ransomware communications — customer message + finance
    {
      id: QE.t5e5, kbItemId: REF.t5K3Item, revisionId: REF.t5K3Rev,
      questionText: 'Why must the finance team be notified within the first hour of a ransomware event, even if the financial systems appear unaffected?',
      options: [
        'To ensure payroll is protected.',
        'Because ransomware attacks are frequently combined with simultaneous payment fraud attempts — attackers who have been inside the network may already be monitoring email and can attempt BEC attacks during the chaos of the response.',
        'Finance must approve the decision to pay or not pay the ransom.',
        'Insurance notification requirements specify finance team involvement.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Ransomware attackers often have access to email during the dwell period. In the chaotic hours after ransomware fires, the same attacker may attempt payment fraud (BEC) — sending fraudulent payment instructions, impersonating the CEO to request urgent wires, or intercepting emails about insurance or recovery payments. Finance must be alerted immediately so they apply heightened payment scrutiny and do not process urgent payment requests through potentially compromised channels.',
      status: 'promoted', confidence: 0.94, promotedToModuleId: REF.t5Module,
    },
    {
      id: QE.t5e6, kbItemId: REF.t5K3Item, revisionId: REF.t5K3Rev,
      questionText: 'Two days after a ransomware event is resolved, a member of staff receives a call from a journalist asking for comment on the company\'s "recent cyber attack." The staff member has personal knowledge of what happened. What should they do?',
      options: [
        'Provide a factual account — transparency helps the industry.',
        'Decline to comment and refer the journalist to the company\'s designated spokesperson or PR contact, then immediately inform their manager about the enquiry.',
        'Confirm the basic facts but do not give details.',
        'Deny the incident — the company has an obligation not to create reputational damage.',
      ],
      suggestedCorrectIndex: 1,
      explanation: 'Media enquiries after a security incident require a managed, authorised response. Uncontrolled comments — even factual ones — can violate NDA obligations, prejudice insurance claims, interfere with law enforcement investigations, or cause reputational damage that compounds the original incident. All media contact must go through the designated spokesperson. Referring and reporting is the correct action; individual staff should not speak to media directly about incidents.',
      status: 'promoted', confidence: 0.95, promotedToModuleId: REF.t5Module,
    },
  ]).onConflictDoNothing();

  console.log('[seed-questions-expansion] ✓ T5 +6 questions');
  console.log('');
  console.log('[seed-questions-expansion] Summary: 5+6+6+6+6 = 29 new questions added.');
  console.log('[seed-questions-expansion] Module totals after expansion:');
  console.log('  T1 phishing:       ~20 questions');
  console.log('  T2 BEC payment:     18 questions');
  console.log('  T3 account/MFA:     18 questions');
  console.log('  T4 invoice fraud:   18 questions');
  console.log('  T5 ransomware:      18 questions');
  console.log('[seed-questions-expansion] Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
