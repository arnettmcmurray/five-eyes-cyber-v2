/**
 * seed-demo-ttx.ts
 *
 * Seeds a complete, leadership-ready demo TTX scenario + session.
 *
 * Scenario:   "Invoice Diversion Attack — BEC Response Exercise"
 * Session:    "Meridian Freight — Q2 BEC Response Exercise"
 * Band:       Acceptable (realistic — not perfect, not failing)
 * Profile:    bec (auto-detected by rubric engine)
 *
 * Idempotent — checks for existing slug before inserting.
 *
 * Run:  npm run seed:demo   (from backend/)
 */

import 'dotenv/config';
import { v4 as uuid } from 'uuid';
import { eq, asc } from 'drizzle-orm';
import { db } from '../src/db/client.js';
import {
  ttxScenarios,
  ttxScenarioSections,
  ttxScenarioSteps,
  ttxInjects,
  ttxExerciseRuns,
  ttxRunParticipants,
  ttxRunEvents,
} from '../src/db/schema/ttx.js';
import { adminUsers } from '../src/db/schema/admin-auth.js';
import { scoreSession } from '../src/services/ttx/rubric.js';

const DEMO_SLUG = 'invoice-diversion-bec-demo-v1';
const DEMO_SESSION_TITLE = 'Meridian Freight — Q2 BEC Response Exercise';

// ---------------------------------------------------------------------------

async function main() {
  console.log('▶  Five Eyes TTX demo seed');

  // 1. Get (or fail loudly) a facilitator admin account
  const [admin] = await db.select().from(adminUsers).limit(1);
  if (!admin) {
    console.error('✗  No admin user found. Run the bootstrap script first.');
    process.exit(1);
  }
  console.log(`   Facilitator: ${admin.username} (${admin.id})`);

  // 2. Check if scenario already exists
  const [existing] = await db
    .select()
    .from(ttxScenarios)
    .where(eq(ttxScenarios.slug, DEMO_SLUG))
    .limit(1);

  let scenarioId: string;

  if (existing) {
    console.log(`   Scenario already exists (${existing.id}) — skipping scenario creation`);
    scenarioId = existing.id;
  } else {
    // 3a. Create scenario
    scenarioId = uuid();
    await db.insert(ttxScenarios).values({
      id: scenarioId,
      slug: DEMO_SLUG,
      title: 'Invoice Diversion Attack — BEC Response Exercise',
      executiveSummary:
        'A threat actor impersonates an established freight vendor and submits a fraudulent banking-change ' +
        'request via email. This scenario tests the team's ability to detect, verify, escalate, and document ' +
        'a business email compromise (BEC) attempt before funds are diverted.',
      description:
        'Your AP and operations team receives an email from what appears to be a long-standing freight vendor — ' +
        'Atlas Carrier Group — requesting an update to their bank account details for future payments. ' +
        'The email references a real invoice number and uses formatting consistent with legitimate correspondence.',
      objective:
        'Test the team's payment-fraud detection instincts, verify the out-of-band callback procedure is ' +
        'understood and followed, assess internal escalation speed and quality, and identify gaps in evidence ' +
        'preservation and regulatory awareness.',
      goals: [
        'Verify team executes out-of-band callback before any payment action',
        'Test escalation chain to Finance Director and IT Security',
        'Assess evidence preservation discipline',
        'Identify regulatory and law enforcement notification awareness',
      ],
      targetAudience: [
        'Accounts Payable Manager',
        'Operations Director',
        'IT Security / Support Lead',
        'Finance Controller',
        'Legal / Compliance',
      ],
      signatureTheme: 'BEC / Invoice Fraud / Payment Diversion',
      createdBy: admin.username,
    });
    console.log(`   ✓ Scenario created (${scenarioId})`);

    // 3b. Sections
    const sec1Id = uuid();
    const sec2Id = uuid();
    const sec3Id = uuid();

    await db.insert(ttxScenarioSections).values([
      {
        id: sec1Id,
        scenarioId,
        title: 'Section 1 — Initial Contact',
        background:
          'Atlas Carrier Group has been a vendor for 3 years. The email arrives Monday morning and looks routine.',
        order: 1,
      },
      {
        id: sec2Id,
        scenarioId,
        title: 'Section 2 — Escalation Window',
        background:
          'AP team flags the email as suspicious. The team must decide how to proceed while a second email arrives raising urgency.',
        order: 2,
      },
      {
        id: sec3Id,
        scenarioId,
        title: 'Section 3 — Containment and Documentation',
        background:
          'The fraud has been confirmed. The team must now contain the threat, preserve evidence, and determine notification obligations.',
        order: 3,
      },
    ]);

    // 3c. Steps
    const step1Id = uuid();
    const step2Id = uuid();
    const step3Id = uuid();
    const step4Id = uuid();
    const step5Id = uuid();

    await db.insert(ttxScenarioSteps).values([
      {
        id: step1Id,
        sectionId: sec1Id,
        title: 'Banking change email received',
        facilitatorNarrative:
          'Read the email aloud: "Hi Sarah, we have updated our banking details effective immediately. ' +
          'Please use the new account for all outstanding invoices. Attached is our updated remittance form. ' +
          'Our new account number is 0847-220193, sort code 30-44-21, at Barclays Business. ' +
          'Kindly confirm receipt. — Tom Weston, Atlas Carrier Group Accounts."',
        participantSituationRoom:
          'An email has arrived in the AP inbox from atlas-accounts@atlas-carriergroup.co — your vendor, Atlas Carrier Group — ' +
          'requesting a bank account update for all future invoice payments. ' +
          'The email looks legitimate and references invoice #INV-2024-1183 which is outstanding.',
        prompts: [
          'What is your immediate response to this email?',
          'What specific steps do you take before processing this request?',
          'Who do you contact and in what order?',
        ],
        whatGoodLooksLike:
          'Participant immediately flags BEC risk, does NOT action the request without out-of-band callback, ' +
          'contacts vendor via known (pre-registered) phone number — not the reply-to or any number in the email.',
        consequenceNote:
          'If participant proceeds without verification — advance to "Funds transferred" inject. ' +
          'If participant holds and escalates — advance to Section 2.',
        order: 1,
      },
      {
        id: step2Id,
        sectionId: sec2Id,
        title: 'Second email — urgency escalation',
        facilitatorNarrative:
          'Deliver inject: a follow-up email arrives 45 minutes later with increased urgency — ' +
          '"Sarah, I need to confirm receipt of my previous message. We have a payment run tomorrow and need ' +
          'this confirmed today. Please advise. — Tom"',
        participantSituationRoom:
          'A follow-up email has arrived from the same address, pressing for urgent confirmation of the banking change. ' +
          'The email tone is more urgent than normal Atlas correspondence.',
        prompts: [
          'How does this second email change your threat assessment?',
          'Have you been able to reach Atlas via your registered contact number yet?',
          'What do you tell the sender while the verification is in progress?',
        ],
        whatGoodLooksLike:
          'Team does not respond to the sender while the verification call is in progress. ' +
          'Escalation to management is confirmed. IT is notified to check for email compromise.',
        consequenceNote:
          'If the team has not yet escalated to IT — deliver the "Domain spoofing discovered" inject.',
        order: 2,
      },
      {
        id: step3Id,
        sectionId: sec2Id,
        title: 'Callback to vendor — fraud confirmed',
        facilitatorNarrative:
          'Announce: the callback to Atlas Carrier Group\'s registered number has been completed. ' +
          'Tom Weston confirms he sent no such email and their account details have not changed.',
        participantSituationRoom:
          'The callback to Atlas Carrier Group has been completed. Their accounts team confirm they sent no banking-change ' +
          'request. The email is fraudulent.',
        prompts: [
          'What do you do in the next 10 minutes?',
          'Is there any risk that payment was already processed? How do you check?',
          'Who needs to be notified now that fraud is confirmed?',
        ],
        whatGoodLooksLike:
          'Immediate review of payment queue for any associated payments. Notification to executive leadership. ' +
          'Evidence of the fraudulent email preserved. IT initiates investigation of how the email bypassed filtering.',
        consequenceNote: 'Advance to Section 3 containment.',
        order: 3,
      },
      {
        id: step4Id,
        sectionId: sec3Id,
        title: 'Containment and evidence lock',
        facilitatorNarrative:
          'Ask each participant: what are your immediate containment and documentation actions?',
        participantSituationRoom:
          'Fraud is confirmed. Your team must now contain the situation, preserve all evidence, ' +
          'and begin assessing external notification obligations.',
        prompts: [
          'What evidence do you preserve, and how do you preserve it?',
          'Are there any regulatory or law enforcement reporting obligations?',
          'How do you communicate this incident to senior leadership?',
        ],
        whatGoodLooksLike:
          'Fraudulent email preserved in a secure, non-editable format with headers. ' +
          'IT logs captured. Reference to FBI IC3 or relevant law enforcement channel. ' +
          'Legal counsel contacted to assess disclosure obligations.',
        consequenceNote: 'Conclude exercise here. Transition to AAR discussion.',
        order: 4,
      },
      {
        id: step5Id,
        sectionId: sec3Id,
        title: 'Leadership notification',
        facilitatorNarrative:
          'Final step: who does leadership hear from, when, and what do they need to decide?',
        participantSituationRoom:
          'Your CEO has been informed that a BEC attempt occurred. They want a summary briefing within the hour. ' +
          'What does that briefing contain?',
        prompts: [
          'What is the core message for leadership?',
          'What decisions do they need to make?',
          'What action items are you bringing to the session?',
        ],
        whatGoodLooksLike:
          'Clear, factual summary: what happened, when, what the team did, what was prevented, what is still at risk. ' +
          'Decision request: reporting obligations, external notification, policy review.',
        consequenceNote: 'Wrap-up. Move to AAR.',
        order: 5,
      },
    ]);

    // 3d. Injects
    await db.insert(ttxInjects).values([
      {
        id: uuid(),
        scenarioId,
        stepId: step2Id,
        content:
          'IT analysis reveals the sender domain "atlas-carriergroup.co" was registered 11 days ago. ' +
          'The legitimate domain is "atlascarriergroup.com". The email was designed to closely mimic real correspondence.',
        injectType: 'technical',
        targetRoles: ['IT Security / Support Lead', 'Operations Director'],
        consequenceLogic:
          'Adds urgency to IT investigation. Team should now prioritise checking whether the sender had prior access to real invoice data.',
        order: 1,
      },
      {
        id: uuid(),
        scenarioId,
        stepId: step3Id,
        content:
          'Your bank confirms that no wire transfer has been initiated to the fraudulent account number. ' +
          'However, there is an ACH batch run scheduled for tomorrow morning that includes an Atlas Carrier Group payment.',
        injectType: 'other',
        targetRoles: ['Finance Controller', 'Accounts Payable Manager'],
        consequenceLogic:
          'Team must now confirm whether the ACH batch reflects the old (legitimate) banking details or the fraudulent ones.',
        order: 2,
      },
      {
        id: uuid(),
        scenarioId,
        stepId: step4Id,
        content:
          'A second vendor — Summit Freight Brokerage — has sent a similar banking-change email dated two days ago. ' +
          'It has not yet been processed but is sitting in the AP queue.',
        injectType: 'other',
        targetRoles: ['Accounts Payable Manager', 'Finance Controller'],
        consequenceLogic:
          'Suggests a campaign rather than a one-off. AP must now audit the entire payment queue for similar requests in the past 30 days.',
        order: 3,
      },
    ]);

    console.log('   ✓ Sections, steps, and injects created');
  }

  // 4. Check if demo session already exists
  const existingSessions = await db
    .select()
    .from(ttxExerciseRuns)
    .where(eq(ttxExerciseRuns.scenarioId, scenarioId));

  const demoSession = existingSessions.find(s => s.title === DEMO_SESSION_TITLE);

  if (demoSession) {
    console.log(`   Session already exists (${demoSession.id}) — skipping session creation`);
    console.log('▶  Seed complete (idempotent)');
    process.exit(0);
  }

  // 5. Fetch full snapshot for the session
  const [scenario] = await db.select().from(ttxScenarios).where(eq(ttxScenarios.id, scenarioId)).limit(1);
  const sections = await db.select().from(ttxScenarioSections).where(eq(ttxScenarioSections.scenarioId, scenarioId)).orderBy(asc(ttxScenarioSections.order));
  const allSteps: (typeof ttxScenarioSteps.$inferSelect)[] = [];
  for (const sec of sections) {
    const steps = await db.select().from(ttxScenarioSteps).where(eq(ttxScenarioSteps.sectionId, sec.id)).orderBy(asc(ttxScenarioSteps.order));
    allSteps.push(...steps);
  }
  const allInjects: (typeof ttxInjects.$inferSelect)[] = [];
  for (const step of allSteps) {
    const injects = await db.select().from(ttxInjects).where(eq(ttxInjects.stepId, step.id)).orderBy(asc(ttxInjects.order));
    allInjects.push(...injects);
  }
  const snapshot = {
    ...scenario,
    sections: sections.map(sec => ({
      ...sec,
      steps: allSteps.filter(s => s.sectionId === sec.id).map(step => ({
        ...step,
        injects: allInjects.filter(inj => inj.stepId === step.id),
      })),
    })),
  };

  // 6. Create the session
  const sessionId = uuid();
  const sessionStart = new Date('2025-03-18T09:15:00Z');
  const sessionEnd = new Date('2025-03-18T10:55:00Z');

  await db.insert(ttxExerciseRuns).values({
    id: sessionId,
    scenarioId,
    title: DEMO_SESSION_TITLE,
    snapshot,
    scheduledAt: new Date('2025-03-18T09:00:00Z'),
    startedAt: sessionStart,
    endedAt: sessionEnd,
    status: 'complete',
    facilitatorId: admin.id,
  });
  console.log(`   ✓ Session created (${sessionId})`);

  // 7. Add participants
  const participants: Array<{ id: string; handle: string; role: string }> = [
    { id: uuid(), handle: 'S. Martinez',   role: 'Accounts Payable Manager' },
    { id: uuid(), handle: 'J. Reeves',     role: 'Operations Director' },
    { id: uuid(), handle: 'K. Thompson',   role: 'IT Security Lead' },
    { id: uuid(), handle: 'L. Chen',       role: 'Finance Controller' },
  ];

  await db.insert(ttxRunParticipants).values(
    participants.map(p => ({
      id: p.id,
      runId: sessionId,
      handle: p.handle,
      role: p.role,
      joinedAt: sessionStart,
    }))
  );
  console.log('   ✓ Participants added');

  // 8. Insert realistic decision/action events
  const t = (offsetMin: number) => new Date(sessionStart.getTime() + offsetMin * 60_000);

  const events: Array<{ eventType: string; actorHandle: string; body: string; occurredAt: Date }> = [
    {
      eventType: 'narrative_delivered',
      actorHandle: admin.username,
      body: 'Section 1 opened. Banking change email received from atlas-accounts@atlas-carriergroup.co referencing invoice #INV-2024-1183.',
      occurredAt: t(0),
    },
    {
      eventType: 'decision',
      actorHandle: 'S. Martinez',
      body: 'I would not action this request without first verifying it through our registered vendor contact. This matches BEC patterns from our training — urgent payment change, new bank account, tight timeline. My first call is to the AP manager and I would simultaneously call Atlas Carrier Group on the phone number we have in our vendor register — not the one in the email or the reply-to.',
      occurredAt: t(3),
    },
    {
      eventType: 'action',
      actorHandle: 'J. Reeves',
      body: 'Escalated immediately to the Finance Director and flagged to IT Security. I have placed a 24-hour hold on all outbound wire transfers and ACH runs pending verification. AP team has been told: do not respond to the email and do not process any associated payments until cleared.',
      occurredAt: t(6),
    },
    {
      eventType: 'decision',
      actorHandle: 'K. Thompson',
      body: 'Requested the full email headers from S. Martinez for technical analysis. Preserved the original email in a read-only folder — no forwarding, no deletion. Checking our email security gateway logs for other messages from that domain or similar spoofed domains in the past 30 days.',
      occurredAt: t(9),
    },
    {
      eventType: 'action',
      actorHandle: 'L. Chen',
      body: 'Initiating callback to our CFO on his registered mobile — not using any number from the suspect email chain. Also pulled Atlas Carrier Group\'s account details from our vendor register to compare against what was submitted. Will consult with our legal counsel to understand whether we have any disclosure obligations even if no funds have moved.',
      occurredAt: t(12),
    },
    {
      eventType: 'inject_delivered',
      actorHandle: admin.username,
      body: 'IT analysis: sender domain "atlas-carriergroup.co" was registered 11 days ago. Legitimate domain is "atlascarriergroup.com". Email bypassed spam filter due to low-volume sender reputation.',
      occurredAt: t(20),
    },
    {
      eventType: 'action',
      actorHandle: 'K. Thompson',
      body: 'Confirmed domain spoofing to the team. Blocking the fraudulent domain at the mail gateway immediately. Checking for any other emails from that domain that may have reached staff. No evidence of internal account compromise — this appears to be external social engineering only.',
      occurredAt: t(23),
    },
    {
      eventType: 'decision',
      actorHandle: 'S. Martinez',
      body: 'Callback to Atlas Carrier Group completed using the number from our vendor register. Tom Weston confirms he sent no banking-change email and their account details are unchanged. The email is fraudulent. AP queue has been locked pending full audit.',
      occurredAt: t(35),
    },
    {
      eventType: 'action',
      actorHandle: 'J. Reeves',
      body: 'Operations team briefed on delay to carrier payments. Notifying affected vendors through verified contact channels only — no email reply to incoming messages until cleared. ACH run tomorrow is suspended pending audit of all payment details in queue.',
      occurredAt: t(40),
    },
    {
      eventType: 'narrative_delivered',
      actorHandle: admin.username,
      body: 'Section 3: Containment and documentation phase. Fraud is confirmed. Second inject: Summit Freight Brokerage has a similar banking-change email in the AP queue dated two days ago.',
      occurredAt: t(55),
    },
    {
      eventType: 'decision',
      actorHandle: 'S. Martinez',
      body: 'Initiating full AP queue audit for any similar requests in the last 60 days. Calling Summit Freight Brokerage immediately on their registered number. All vendor banking-change requests are now on hold until each has been verified by callback.',
      occurredAt: t(58),
    },
    {
      eventType: 'action',
      actorHandle: 'K. Thompson',
      body: 'Forensic evidence package assembled: original email with full headers, domain registration records, gateway logs, timeline of actions. Chain of custody documented. Ready for potential law enforcement referral if the team decides to report to FBI IC3.',
      occurredAt: t(65),
    },
    {
      eventType: 'decision',
      actorHandle: 'L. Chen',
      body: 'Legal counsel has been contacted. They are reviewing whether we have a breach notification obligation given the fraudulent access to vendor account information. Initial assessment is that no funds moved, so SEC or FTC notification is not immediately required — but we should file an IC3 report given the campaign pattern across two vendors.',
      occurredAt: t(72),
    },
    {
      eventType: 'action',
      actorHandle: 'J. Reeves',
      body: 'Leadership briefing prepared. Summary: BEC campaign detected and stopped. No funds moved. Two vendors targeted. Actions taken: payment hold, callback verification, domain block, evidence preservation, legal consultation. Recommendations: review all vendor banking details in system, implement dual-authorization policy for banking changes, schedule follow-up tabletop in 60 days.',
      occurredAt: t(85),
    },
  ];

  await db.insert(ttxRunEvents).values(
    events.map(e => ({ id: uuid(), runId: sessionId, linkedInjectId: null, ...e }))
  );
  console.log('   ✓ Events inserted');

  // 9. Run rubric scorer and persist
  const allEvents = await db.select().from(ttxRunEvents).where(eq(ttxRunEvents.runId, sessionId)).orderBy(asc(ttxRunEvents.occurredAt));
  const allParticipants = await db.select().from(ttxRunParticipants).where(eq(ttxRunParticipants.runId, sessionId));

  const rubric = scoreSession({
    sessionId,
    sessionTitle: DEMO_SESSION_TITLE,
    snapshot: snapshot as Record<string, unknown>,
    events: allEvents.map(e => ({ eventType: e.eventType, body: e.body, actorHandle: e.actorHandle })),
    participants: allParticipants,
  });

  const aarSummary =
    'Meridian Freight conducted a Q2 tabletop exercise simulating a business email compromise (BEC) invoice diversion attack. ' +
    'The team successfully identified the threat, executed out-of-band verification, and contained potential financial exposure before any funds were moved. ' +
    'Key strengths: prompt verification discipline, strong internal escalation, and evidence preservation. ' +
    'Priority gaps: recovery and business continuity planning was not activated, and regulatory / law enforcement notification awareness remains incomplete. ' +
    'Two priority action items have been identified for closure within 30 days.';

  await db.update(ttxExerciseRuns)
    .set({
      decisions: {
        summary: aarSummary,
        rubric,
      },
    })
    .where(eq(ttxExerciseRuns.id, sessionId));

  console.log(`   ✓ Rubric scored — band: ${rubric.overallBand}, score: ${rubric.overallScore}`);
  console.log(`   ✓ AAR narrative and rubric persisted`);

  console.log('\n▶  Demo seed complete');
  console.log(`   Scenario: ${scenario.title}`);
  console.log(`   Session:  ${DEMO_SESSION_TITLE}`);
  console.log(`   View AAR: /ttx/sessions/${sessionId}/aar`);
  process.exit(0);
}

main().catch(e => {
  console.error('✗  Seed failed:', e);
  process.exit(1);
});
