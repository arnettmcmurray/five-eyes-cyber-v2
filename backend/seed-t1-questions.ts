/**
 * Seed script: insert practice questions for module t1-phishing-email-security
 * Source: docs/kb-content/t1-phishing/practice-questions.md
 *
 * Run from backend/: npx tsx --env-file=.env seed-t1-questions.ts
 */
import { randomUUID } from 'crypto';

async function main() {
  const { db } = await import('./src/db/client.js');
  const { quizCandidates } = await import('./src/db/schema/quiz-candidates.js');

  const MODULE_ID = '712fb286-94ef-4f57-9d6a-c4f8ee9147cf';

  // KB item IDs and revision IDs
  const KB = {
    phishingInFreight:   { itemId: '104025aa-b87b-4153-a33e-b7be2b57a70a', revId: '41350678-a536-4124-923e-da19d63cab6c' },
    emailRedFlags:       { itemId: 'b340bc7f-4567-4617-a177-4103b731eff5', revId: 'd5a6c60e-e039-4c45-b389-178bcfe81cda' },
    smishingVishing:     { itemId: '237cb8bf-0f47-48b5-80c6-33196d6cbc7e', revId: 'f15df621-169d-4027-9fbe-dd99ba7fc22a' },
    safeLinkHandling:    { itemId: 'c49ab1d2-3486-474b-a2f2-f875b4799758', revId: '850b891a-bc14-4380-ab86-c95d728d1123' },
    howToReport:         { itemId: '4aacad81-97b3-4a51-8082-5c8402ab168a', revId: '98948de0-b838-4f03-80cd-76d7f4d8a876' },
  };

  const questions = [

    // ── Task 1: Phishing in Freight (threat-brief) ───────────────────────────
    // Covers: freight-specific lures, why freight is targeted, what attackers gain from a stolen login
    {
      id: randomUUID(),
      kbItemId: KB.phishingInFreight.itemId,
      revisionId: KB.phishingInFreight.revId,
      questionText:
        'You receive an email from "DAT Freight Support <support@dat-freight.net>" at 4:45 PM saying your load board account is locked and you must verify within 2 hours or lose active loads. What is the safest next action?',
      options: [
        'Click the verification link in the email immediately to preserve your active loads.',
        'Forward the email to your team so they can check the DAT portal too.',
        'Delete the email and ignore it.',
        'Go directly to dat.com by typing the URL in your browser to check your account status.',
      ],
      suggestedCorrectIndex: 3,
      explanation:
        'The domain "dat-freight.net" is not the real DAT domain (dat.com). This is a lookalike domain used to harvest credentials. Always navigate directly to the vendor\'s known URL rather than clicking a link in an email. Deleting the email (C) is better than clicking, but reporting it is better still. Forwarding (B) spreads the attack to more people.',
      status: 'promoted' as const,
      confidence: 0.97,
      promotedToModuleId: MODULE_ID,
    },
    {
      id: randomUUID(),
      kbItemId: KB.phishingInFreight.itemId,
      revisionId: KB.phishingInFreight.revId,
      questionText:
        'Which email subject line should make you most suspicious that you are being targeted by a phishing attack?',
      options: [
        '"Load confirmation #7823 — thank you for your business"',
        '"Q4 carrier performance summary attached"',
        '"URGENT: Your FMCSA authority suspended — verify NOW to avoid penalties"',
        '"New rate sheet attached — please review when convenient"',
      ],
      suggestedCorrectIndex: 2,
      explanation:
        'Urgency combined with consequences ("suspended", "penalties", "NOW") is the primary tactic in freight phishing. Real FMCSA regulatory actions arrive through established channels and give time to respond. The other subject lines are routine freight communications without manufactured urgency.',
      status: 'promoted' as const,
      confidence: 0.96,
      promotedToModuleId: MODULE_ID,
    },
    {
      id: randomUUID(),
      kbItemId: KB.phishingInFreight.itemId,
      revisionId: KB.phishingInFreight.revId,
      questionText:
        'In the context of freight cybersecurity, a stolen dispatcher login to your TMS or load board most directly enables an attacker to:',
      options: [
        'Send spam emails from your company domain.',
        'Access and exfiltrate your company\'s employee records.',
        'Accept loads under your authority, redirect shipments, or initiate payment fraud.',
        'Install ransomware on your company\'s network immediately.',
      ],
      suggestedCorrectIndex: 2,
      explanation:
        'TMS and load board credentials are the specific target of freight phishing because they provide direct access to freight operations. With dispatcher access, an attacker can create fraudulent shipping paperwork, redirect loads for cargo theft, or initiate payment fraud. Ransomware (D) is a later-stage threat enabled by broader network access, not just a TMS login.',
      status: 'promoted' as const,
      confidence: 0.95,
      promotedToModuleId: MODULE_ID,
    },

    // ── Task 2: Email Red Flags (training-content) ───────────────────────────
    // Covers: domain checking, lookalike domains, link inspection, attachment red flags
    {
      id: randomUUID(),
      kbItemId: KB.emailRedFlags.itemId,
      revisionId: KB.emailRedFlags.revId,
      questionText:
        'You hover over a link in an email from "your TMS vendor" and the destination URL shows: https://login.tmssupport-verify.com/yourTMS. What should you conclude?',
      options: [
        'The link is safe because it includes your TMS vendor\'s name in the path.',
        'The link is safe because it uses HTTPS.',
        'The link is suspicious — the domain is "tmssupport-verify.com", not your TMS vendor\'s actual domain.',
        'The link is safe if the email display name matches your vendor\'s name.',
      ],
      suggestedCorrectIndex: 2,
      explanation:
        'HTTPS only means the connection is encrypted — it does not mean the site is legitimate. The real domain is everything between the last "/" and the top-level extension: here that is "tmssupport-verify.com". Your TMS vendor\'s name appearing in the path ("/yourTMS") does not make the domain legitimate. Only the actual domain registered by the vendor matters.',
      status: 'promoted' as const,
      confidence: 0.97,
      promotedToModuleId: MODULE_ID,
    },
    {
      id: randomUUID(),
      kbItemId: KB.emailRedFlags.itemId,
      revisionId: KB.emailRedFlags.revId,
      questionText:
        'An email from "FMCSA Compliance <compliance@fmcsa-compliance.com>" claims your MC authority is suspended pending verification. What is the most important check to make before acting?',
      options: [
        'Whether the email looks professionally formatted with the FMCSA logo.',
        'Whether any colleagues received the same email.',
        'Whether the sender\'s email domain is the real FMCSA domain (fmcsa.dot.gov).',
        'Whether the email was received during government business hours.',
      ],
      suggestedCorrectIndex: 2,
      explanation:
        'The official FMCSA domain is fmcsa.dot.gov — a .gov domain only issued to verified US government entities. "fmcsa-compliance.com" is a commercial domain anyone can register. Professional formatting (A) is easily copied. Colleagues receiving the same email (B) is useful information but is not the primary check. Government agencies do not restrict email delivery to business hours (D).',
      status: 'promoted' as const,
      confidence: 0.97,
      promotedToModuleId: MODULE_ID,
    },
    {
      id: randomUUID(),
      kbItemId: KB.emailRedFlags.itemId,
      revisionId: KB.emailRedFlags.revId,
      questionText:
        'You open a PDF attached to an unexpected email and a dialog box appears saying "Enable editing to view this document." What should you do?',
      options: [
        'Enable editing — this is a standard Microsoft Office security prompt.',
        'Close the file without enabling anything, then report the email.',
        'Save the file to your desktop first and then enable editing.',
        'Enable editing only if the sender\'s display name looks familiar.',
      ],
      suggestedCorrectIndex: 1,
      explanation:
        '"Enable editing" or "Enable content" prompts in Office documents and PDFs are a classic malware delivery mechanism. Enabling runs embedded macros or scripts that install malware silently. Legitimate documents do not require this. Close the file immediately, do not enable anything, and report the email to your supervisor. Sender display names (D) can be spoofed and are not a reliable indicator.',
      status: 'promoted' as const,
      confidence: 0.96,
      promotedToModuleId: MODULE_ID,
    },

    // ── Task 3: Smishing and Vishing — Drivers and Field Staff ───────────────
    // Covers: text message lures, caller ID spoofing, vishing scenarios for drivers
    {
      id: randomUUID(),
      kbItemId: KB.smishingVishing.itemId,
      revisionId: KB.smishingVishing.revId,
      questionText:
        'You are a driver at a truck stop and receive a text from an unknown number: "ELD malfunction detected on Unit 447. Tap here to confirm your driver ID and restore compliance status." What should you do?',
      options: [
        'Tap the link to resolve the compliance issue before it becomes a violation.',
        'Reply to the text with your driver ID to confirm the issue.',
        'Ignore the link, contact dispatch on a known number to verify the alert, and report the text.',
        'Forward the text to your supervisor.',
      ],
      suggestedCorrectIndex: 2,
      explanation:
        'ELD vendors and compliance systems do not send compliance alerts via text message with links asking for driver credentials. This is a smishing lure using compliance fear as the trigger. The correct response is to ignore the link entirely and contact dispatch through the number already in your phone — not the number in the text. Forwarding (D) spreads the link and is not a substitute for reporting through proper channels.',
      status: 'promoted' as const,
      confidence: 0.97,
      promotedToModuleId: MODULE_ID,
    },
    {
      id: randomUUID(),
      kbItemId: KB.smishingVishing.itemId,
      revisionId: KB.smishingVishing.revId,
      questionText:
        'You receive a call showing your company\'s main office number on caller ID. The caller says they are your supervisor and need you to transfer funds urgently. What is the correct response?',
      options: [
        'Do not transfer funds based on a phone call alone. Hang up and call your supervisor directly on their personal number to verify the request.',
        'Complete the transfer — the caller ID confirms it is from the office.',
        'Ask the caller to send a case number before completing the transfer.',
        'Transfer a smaller test amount first to verify the request is legitimate.',
      ],
      suggestedCorrectIndex: 0,
      explanation:
        'Caller ID can be spoofed to display any number, including your company\'s main line. A call displaying the office number proves nothing about the caller\'s identity. Any urgent request to transfer money by phone — regardless of displayed caller ID — must be verified out-of-band: hang up and call the supervisor on a number you already have. No test amount (D) is safe if the request is fraudulent.',
      status: 'promoted' as const,
      confidence: 0.97,
      promotedToModuleId: MODULE_ID,
    },
    {
      id: randomUUID(),
      kbItemId: KB.smishingVishing.itemId,
      revisionId: KB.smishingVishing.revId,
      questionText:
        'You tell a caller claiming to be from IT support that you will call them back on the vendor\'s official number to verify their identity. The caller then hangs up. What does this reaction indicate?',
      options: [
        'The call was legitimate — real IT personnel respect your caution and wait.',
        'The caller was a genuine security professional following protocol.',
        'The caller was likely fraudulent — legitimate callers welcome independent verification.',
        'The reaction is neutral and tells you nothing about whether the call was genuine.',
      ],
      suggestedCorrectIndex: 2,
      explanation:
        'Legitimate support callers — whether from vendors, IT, or your company — have no reason to object to or avoid independent verification. A caller who hangs up when you propose calling back through an official channel has just demonstrated they cannot withstand that verification. This is one of the clearest behavioral indicators of a vishing attempt.',
      status: 'promoted' as const,
      confidence: 0.96,
      promotedToModuleId: MODULE_ID,
    },

    // ── Task 4: Safe Link Handling ────────────────────────────────────────────
    // Covers: hover verification, QR codes, URL shorteners, unverified attachments
    {
      id: randomUUID(),
      kbItemId: KB.safeLinkHandling.itemId,
      revisionId: KB.safeLinkHandling.revId,
      questionText:
        'The best way to verify whether a link in an email is safe before clicking is:',
      options: [
        'Check whether the link uses HTTPS in the URL.',
        'Forward it to IT and wait for their response before clicking.',
        'Hover over the link to see the actual destination URL and verify the domain matches the real company domain.',
        'Run the link text through a search engine to see what comes up.',
      ],
      suggestedCorrectIndex: 2,
      explanation:
        'Hovering over a link reveals the actual destination URL in the status bar of your browser or email client. This is the single most effective 5-second check. HTTPS (A) only tells you the connection is encrypted — the destination can still be malicious. Forwarding to IT (B) is valuable after the fact but is not practical as a real-time check for every link. Search engines (D) will not reliably identify malicious links.',
      status: 'promoted' as const,
      confidence: 0.96,
      promotedToModuleId: MODULE_ID,
    },
    {
      id: randomUUID(),
      kbItemId: KB.safeLinkHandling.itemId,
      revisionId: KB.safeLinkHandling.revId,
      questionText:
        'You see a QR code posted on a sign at a truck stop claiming to give access to "free driver lounge Wi-Fi." What should you do?',
      options: [
        'Scan it — free Wi-Fi is a legitimate service at truck stops.',
        'Do not scan it. QR codes at public locations can direct you to malicious sites or connect your device to a network controlled by attackers.',
        'Scan it but do not enter any login credentials on the page that opens.',
        'Scan it only if the sign looks professionally printed.',
      ],
      suggestedCorrectIndex: 1,
      explanation:
        'QR codes are opaque links — you cannot see the destination before scanning. Attackers use physical QR codes in public locations to direct victims to credential-harvesting pages or malicious Wi-Fi networks where traffic can be intercepted. A professional-looking sign (D) is easy to produce and provides no security assurance. "Don\'t enter credentials" (C) does not protect against all attack types — simply connecting to a malicious network can expose your device.',
      status: 'promoted' as const,
      confidence: 0.95,
      promotedToModuleId: MODULE_ID,
    },
    {
      id: randomUUID(),
      kbItemId: KB.safeLinkHandling.itemId,
      revisionId: KB.safeLinkHandling.revId,
      questionText:
        'A broker you have not worked with before sends a "carrier packet" PDF to your email. The email includes your company name and references a specific load. What is the safest handling procedure?',
      options: [
        'Open the PDF — carrier packets are routine freight documents.',
        'Verify the broker independently through FMCSA\'s broker search and call the company at a number you find yourself before opening any attachment.',
        'Open the PDF only if your antivirus software does not flag it.',
        'Forward the packet to your compliance team to open on your behalf.',
      ],
      suggestedCorrectIndex: 1,
      explanation:
        'Unexpected attachments — even ones that reference real-looking freight details — are a primary malware delivery method. Attackers research their targets and can include accurate company names and load references to lower suspicion. Antivirus (C) does not catch all threats and is not a substitute for verification. Forwarding (D) transfers the risk to a colleague. The correct action is independent broker verification via FMCSA and a direct call before opening anything.',
      status: 'promoted' as const,
      confidence: 0.96,
      promotedToModuleId: MODULE_ID,
    },

    // ── Task 5: How to Report ─────────────────────────────────────────────────
    // Covers: reporting procedures, what not to do, if-already-clicked response
    {
      id: randomUUID(),
      kbItemId: KB.howToReport.itemId,
      revisionId: KB.howToReport.revId,
      questionText:
        'A colleague forwards you a suspicious email with a phishing link and adds the message "Warning — do not click this." What is wrong with this action?',
      options: [
        'Nothing — warning colleagues about threats is helpful security behavior.',
        'Forwarding the suspicious link spreads the attack to more people. The colleague should have reported it to a supervisor or security contact instead.',
        'The colleague should have deleted the email rather than forwarding it.',
        'Forwarding is acceptable as long as a warning message is included.',
      ],
      suggestedCorrectIndex: 1,
      explanation:
        'Forwarding a phishing email — even with a warning — exposes additional inboxes to the malicious link. Email filtering may not catch it; the recipient may click out of curiosity. The correct action is to preserve the original email without forwarding it and report it to a supervisor or security contact who can alert the team through appropriate channels. Deleting (C) destroys evidence needed for the incident response.',
      status: 'promoted' as const,
      confidence: 0.97,
      promotedToModuleId: MODULE_ID,
    },
    {
      id: randomUUID(),
      kbItemId: KB.howToReport.itemId,
      revisionId: KB.howToReport.revId,
      questionText:
        'You clicked a link in a suspicious email and a page opened that appeared to be your TMS login. You did not enter your username or password and closed the page. What should you do next?',
      options: [
        'Nothing — since you did not enter your credentials, you are not at risk.',
        'Change your TMS password as a precaution, but no need to report since nothing happened.',
        'Report the incident to your supervisor with the details of what happened, even though you did not enter credentials.',
        'Run a virus scan on your computer and only report if it finds something.',
      ],
      suggestedCorrectIndex: 2,
      explanation:
        'Simply loading a malicious page can execute scripts that capture browser session cookies, fingerprint your device, or attempt drive-by downloads — even if you entered no credentials. Reporting immediately allows IT to investigate whether any session data was captured and to monitor for unusual account activity. "Nothing happened" is a conclusion only IT can make after investigation, not something you can determine by observation alone.',
      status: 'promoted' as const,
      confidence: 0.97,
      promotedToModuleId: MODULE_ID,
    },
    {
      id: randomUUID(),
      kbItemId: KB.howToReport.itemId,
      revisionId: KB.howToReport.revId,
      questionText:
        'You recognize a phishing email immediately without clicking anything. The correct next action is:',
      options: [
        'Delete it — no further action is needed since you were not deceived.',
        'Mark it as spam so your email client filters similar messages.',
        'Report it to your supervisor or security contact so the team can be alerted and the email can be investigated.',
        'Forward it to colleagues with a clear warning label so they know to watch out.',
      ],
      suggestedCorrectIndex: 2,
      explanation:
        'A phishing email you recognized may be part of an active campaign targeting your whole team. Reporting it allows a security response: alerting others, investigating the sender infrastructure, and potentially blocking the attack before colleagues click it. Deleting (A) and spam-marking (B) remove the evidence and prevent a coordinated response. Forwarding (D) spreads the malicious link regardless of the attached warning.',
      status: 'promoted' as const,
      confidence: 0.96,
      promotedToModuleId: MODULE_ID,
    },
  ];

  console.log(`Inserting ${questions.length} questions for module: t1-phishing-email-security`);

  for (const q of questions) {
    await db.insert(quizCandidates).values(q);
    console.log(`  ✓ ${q.questionText.substring(0, 60)}…`);
  }

  console.log('\nDone. All questions inserted with status=promoted.');
  process.exit(0);
}

main().catch(e => { console.error('SEED FAILED:', e.message); process.exit(1); });
