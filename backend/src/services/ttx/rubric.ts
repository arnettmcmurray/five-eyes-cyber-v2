/**
 * TTX Rubric Engine — standards-based evaluation of tabletop exercise sessions.
 *
 * Architecture:
 *   1. Detect scenario profile (BEC, ransomware, CEO fraud, general) from snapshot.
 *   2. Load the matching weight profile for that scenario type.
 *   3. Analyse event text (decision + note + action events) for positive/negative signals
 *      per category using keyword pattern matching.
 *   4. Compute raw category scores, apply profile weights, derive overall score + band.
 *   5. Generate specific, non-generic output text (strengths, misses, gaps, recs).
 *   6. Return a RubricResult that is stored in decisions.rubric JSONB and surfaced in AAR.
 *
 * Future company-protocol overlay: the result includes protocolComparisonPending=true and
 * baselineRubricId so that a later overlay can attach company-specific expectations to the
 * same result structure and compare them against the baseline evaluation.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryResult {
  id: string;
  label: string;
  weight: number;        // 0–1, profile weight for this category in this scenario type
  rawScore: number;      // 0–100 before weighting
  weightedScore: number; // rawScore * weight, contributing to overall
  band: 'pass' | 'concern' | 'critical_miss';
  evidence: string[];    // specific positive observations from event log
  gaps: string[];        // specific gap observations
  // Standards anchoring
  baselineExpectation: string;
  standardsReferences: string[];
}

export interface CorrectivePriority {
  rank: number;
  categoryId: string;
  categoryLabel: string;
  action: string;
  ownerFunction: string;
}

export interface RubricResult {
  scoredAt: string;
  rubricVersion: string;     // '1.1' — bump when logic changes
  sessionId: string;
  sessionTitle: string;
  scenarioProfile: string;   // 'bec' | 'ransomware' | 'ceo_fraud' | 'supply_chain' | 'general'
  baselineRubricId: string;  // identifies this rubric for overlay attachment
  participantCount: number;
  observationCount: number;  // decision + action events
  insufficientData: boolean; // true when too few events to score reliably
  overallScore: number;      // 0–100 weighted
  overallBand: 'strong' | 'acceptable' | 'needs_attention' | 'critical_gaps';
  categories: CategoryResult[];
  strengths: string[];
  misses: string[];
  criticalGaps: string[];
  operationalRiskNote: string;
  recommendedActions: string[];
  trainingRecommendations: string[];
  policyRecommendations: string[];
  // Standards anchoring
  baselineFrameworkNote: string;
  standardsAnchored: true;
  // Scenario expectation pack
  scenarioExpectationPackId: string;
  scenarioExpectationSummary: string;
  scenarioSpecificFindings: string[];
  criticalMissTriggers: string[];
  // Executive / leadership summary
  executiveSummary: string;
  businessRiskStatement: string;
  correctivePriorities: CorrectivePriority[];
  leadershipBottomLine: string;
  // Company-protocol overlay hooks (not yet implemented — prepared for future pass)
  protocolOverlayAvailable: boolean;
  protocolComparisonPending: boolean;
}

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------

interface CategoryDef {
  id: string;
  label: string;
  positiveSignals: string[];
  negativeSignals: string[];
  criticalRequired: boolean; // false = partial credit even with zero positive hits
  absentText: string;        // used in gaps[] when no positive signals found
  passText: string;          // used in evidence[] when band=pass
  concernText: string;       // used in gaps[] when band=concern
  criticalMissText: string;  // used in gaps[] when band=critical_miss
  trainingRec: string;
  policyRec: string;
  actionRec: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'verification-validation',
    label: 'Verification & Validation',
    positiveSignals: [
      'verify', 'verification', 'confirm', 'confirmation', 'out of band', 'out-of-band',
      'call back', 'callback', 'call the number', 'phone call', 'phone check',
      'authenticate', 'authentication', 'validate', 'validation', 'check identity',
      'identity check', 'cross-check', 'cross check', 'double check', 'double-check',
      'pre-registered', 'registered number', 'trusted contact', 'independent source',
      'independent confirmation', 'secondary channel', 'second channel',
    ],
    negativeSignals: [
      'assumed it was', 'trusted the email', 'clicked without', 'transferred without',
      'no need to verify', 'didn\'t verify', 'did not verify', 'no verification',
    ],
    criticalRequired: true,
    absentText: 'No verification discipline was demonstrated in team responses. Payment change requests or identity claims were not challenged.',
    passText: 'Team referenced out-of-band verification, callback procedures, or identity confirmation before acting on suspect requests.',
    concernText: 'Verification was referenced but lacked explicit out-of-band confirmation. Responses suggest the team understands the concept but may not have a reliable procedure.',
    criticalMissText: 'Team failed to verify payment-change authenticity through an out-of-band method. No callback, identity check, or independent confirmation was referenced. This is a direct path to financial loss in a real incident.',
    trainingRec: 'BEC & Payment Fraud Prevention — focused on out-of-band verification procedures for payment change requests.',
    policyRec: 'Establish a written out-of-band verification policy for all payment change requests. Staff must confirm via a pre-registered contact number — not the number provided in the suspect message.',
    actionRec: 'Conduct a structured walkthrough of payment verification procedures with finance, AP, and dispatch teams. Test with a simulated payment-change request.',
  },
  {
    id: 'escalation-notification',
    label: 'Escalation & Internal Notification',
    positiveSignals: [
      'escalate', 'escalated', 'escalation', 'notify', 'notified', 'notification',
      'informed', 'alert', 'alerted', 'report', 'reported', 'contact',
      'manager', 'supervisor', 'ciso', 'cio', 'cto', 'ceo', 'cfo', 'executive',
      'security team', 'it team', 'it department', 'legal', 'compliance',
      'operations manager', 'finance director', 'chain of command',
      'told my', 'called my', 'emailed my', 'flagged to',
    ],
    negativeSignals: [
      'handled it alone', 'handle alone', 'didn\'t tell', 'did not tell',
      'didn\'t inform', 'did not inform', 'kept it quiet', 'on my own',
      'without telling', 'without notifying',
    ],
    criticalRequired: true,
    absentText: 'No escalation or internal notification actions appeared in team responses. Incidents were handled as individual decisions rather than organizational events.',
    passText: 'Team referenced appropriate internal escalation paths — notifying security, management, or relevant leadership within a reasonable timeframe.',
    concernText: 'Escalation was referenced but applied inconsistently or only after significant delay. Some responses suggest individual handling without organizational visibility.',
    criticalMissText: 'Team failed to escalate or notify relevant internal stakeholders. In a real incident, this would prevent coordinated response and delay executive awareness until damage is irreversible.',
    trainingRec: 'Incident Response Fundamentals — escalation chains and organizational communication during an active incident.',
    policyRec: 'Define and publish an internal incident notification matrix: who must be informed, in what timeframe, for each incident category.',
    actionRec: 'Map and distribute the escalation chain for financial fraud, IT security, and operational disruption incidents. Every team member should know who to call before an incident occurs.',
  },
  {
    id: 'communication-quality',
    label: 'Communication Quality',
    positiveSignals: [
      'communicate', 'communicated', 'communication', 'informed stakeholders',
      'briefed', 'documented', 'wrote up', 'chain of custody', 'notified customers',
      'customer notification', 'stakeholder update', 'status update',
      'transparent', 'transparency', 'coordinated with', 'internal communication',
      'responsible disclosure', 'drafted', 'written notice',
    ],
    negativeSignals: [
      'posted on social', 'tweeted', 'posted online', 'leaked', 'disclosed publicly',
      'told everyone', 'announced publicly', 'press release without',
      'speculated publicly', 'guessed publicly',
    ],
    criticalRequired: false,
    absentText: 'Communication handling was not addressed in team responses. No references to stakeholder notification, incident status updates, or responsible disclosure.',
    passText: 'Team demonstrated responsible communication discipline — stakeholder notifications, internal updates, and controlled disclosure were referenced.',
    concernText: 'Communication was partially addressed but lacked structure. Responses did not clearly define who is notified, by whom, and in what sequence.',
    criticalMissText: 'Communication discipline was absent or counterproductive. Responses included indicators of premature public disclosure, uncontrolled information flow, or failure to inform affected parties appropriately.',
    trainingRec: 'Social Engineering & Fraud Awareness — communication hygiene during an active incident.',
    policyRec: 'Define a communications protocol for incident response: who is authorised to communicate externally, through which channels, and with what approval chain.',
    actionRec: 'Brief all team members on communication restrictions during an active incident. Designate a single external spokesperson and a single internal communications lead.',
  },
  {
    id: 'incident-response',
    label: 'Incident Response Quality',
    positiveSignals: [
      'incident response', 'ir plan', 'ir procedure', 'incident plan', 'playbook',
      'procedure', 'protocol', 'soc', 'security operations', 'forensics', 'forensic',
      'isolate system', 'disconnect', 'shut down', 'isolate network',
      'contain the breach', 'contain the incident', 'preserve logs', 'log collection',
      'incident declared', 'breach declared', 'security incident', 'raise a ticket',
    ],
    negativeSignals: [
      'no plan', 'no procedure', 'not sure what to do', 'improvised',
      'ad hoc', 'make it up', 'wing it',
    ],
    criticalRequired: false,
    absentText: 'No references to incident response plans, SOC procedures, or established protocols appeared in team responses. Responses appear improvised.',
    passText: 'Team referenced incident response protocols, established procedures, or security operations processes — demonstrating structured thinking rather than improvisation.',
    concernText: 'Incident response thinking was present but inconsistent. Some responses referenced protocols; others appeared ad hoc. Procedural gaps are likely.',
    criticalMissText: 'No established incident response process was referenced. Team responses were entirely improvised. In a real incident, this results in uncoordinated actions, duplicated effort, and preventable damage.',
    trainingRec: 'Incident Response Fundamentals and Ransomware Response modules.',
    policyRec: 'Adopt and test a documented incident response plan. At minimum: incident declaration criteria, roles and responsibilities, first-hour checklist, and escalation contacts.',
    actionRec: 'Schedule an incident response tabletop specifically focused on the first 30 minutes of a security event, using the documented IR plan as the baseline.',
  },
  {
    id: 'containment-control',
    label: 'Containment & Immediate Control',
    positiveSignals: [
      'isolate', 'isolated', 'isolation', 'disconnect', 'disconnected',
      'blocked', 'block access', 'quarantine', 'quarantined',
      'revoke access', 'revoked', 'reset password', 'change credentials',
      'lock account', 'locked account', 'segmented', 'network segment',
      'firewall rule', 'firewall block', 'remove from network', 'pull the plug',
      'stop the spread', 'prevent further', 'limit exposure', 'freeze account',
    ],
    negativeSignals: [
      'kept running', 'continued operating normally', 'ignored the alert',
      'didn\'t stop', 'did not stop', 'no action taken', 'let it continue',
    ],
    criticalRequired: false,
    absentText: 'No containment or immediate control actions appeared in team responses. Responses did not address stopping the spread of compromise or limiting the attack surface.',
    passText: 'Team referenced concrete containment actions — isolation, access revocation, credential resets, or network segmentation — demonstrating an instinct to limit exposure.',
    concernText: 'Containment thinking was present but partial. Responses addressed some control actions without a systematic approach to limiting the attack surface.',
    criticalMissText: 'No containment actions were referenced. Team responses would leave systems and accounts exposed during the incident. Continued operation during active compromise causes compounding damage.',
    trainingRec: 'Ransomware Response module — first-hour containment steps.',
    policyRec: 'Define a containment decision matrix: under what conditions are systems isolated, accounts locked, and network segments restricted — and who is authorised to make those decisions.',
    actionRec: 'Run a containment drill: simulate a compromised endpoint and practice the isolation and access revocation steps until the team can execute them in under 15 minutes.',
  },
  {
    id: 'evidence-documentation',
    label: 'Evidence Preservation & Documentation',
    positiveSignals: [
      'screenshot', 'screen capture', 'preserve', 'preservation',
      'document', 'documented', 'documentation', 'record', 'recorded',
      'log', 'logs', 'audit trail', 'forensic', 'forensics', 'chain of custody',
      'save the email', 'keep the email', 'preserve the evidence', 'don\'t delete',
      'backup', 'captured', 'wrote down', 'noted',
    ],
    negativeSignals: [
      'delete', 'deleted', 'reformat', 'reformatted', 'wipe', 'wiped',
      'clean the machine', 'destroyed', 'removed the evidence',
    ],
    criticalRequired: false,
    absentText: 'No references to evidence preservation, documentation, or audit trail maintenance appeared in team responses.',
    passText: 'Team referenced evidence preservation — screenshots, log collection, chain of custody, or written records — demonstrating awareness that documentation supports investigation and recovery.',
    concernText: 'Evidence thinking was present but incomplete. Some preservation actions were referenced without a systematic approach to maintaining chain of custody.',
    criticalMissText: 'No evidence preservation actions were referenced, and responses included indicators of potential evidence destruction. Without preserved evidence, forensic investigation and insurance claims become significantly harder.',
    trainingRec: 'Incident Response Fundamentals — evidence handling and chain of custody.',
    policyRec: 'Establish an evidence handling policy covering: what to preserve, how to preserve it, who owns the evidence log, and how to maintain chain of custody for legal proceedings.',
    actionRec: 'Train team members to take screenshots and preserve communications as a first reflex during any suspected security incident, before taking any other action on the affected system.',
  },
  {
    id: 'recovery-continuity',
    label: 'Recovery & Continuity Thinking',
    positiveSignals: [
      'restore', 'restoration', 'backup', 'backups', 'recovery plan',
      'business continuity', 'bcp', 'drp', 'disaster recovery',
      'resume operations', 'alternative system', 'workaround', 'failover',
      'recover', 'recovery', 'back online', 'restore from backup',
      'rto', 'rpo', 'continuity plan', 'contingency', 'fallback',
    ],
    negativeSignals: [
      'no backup', 'no recovery plan', 'couldn\'t restore', 'no fallback',
      'no alternative', 'permanently lost',
    ],
    criticalRequired: false,
    absentText: 'No recovery or business continuity thinking appeared in team responses. Responses focused on the immediate incident without addressing restoration of operations.',
    passText: 'Team referenced recovery procedures, backup restoration, business continuity planning, or contingency options — demonstrating that operations resumption is a priority alongside incident management.',
    concernText: 'Recovery thinking was present but superficial. Responses acknowledged the need to restore operations without referencing specific procedures, RTOs, or tested backup systems.',
    criticalMissText: 'No recovery thinking was demonstrated. A real incident handled with this approach would result in undefined downtime, no clear path to restoration, and potential permanent data loss.',
    trainingRec: 'Ransomware Response module — recovery and business continuity sections.',
    policyRec: 'Develop and test a business continuity plan with defined RTOs and RPOs for critical systems. Backup restoration must be tested at least annually.',
    actionRec: 'Verify that backup systems are operational and that at least one team member can execute a restoration procedure without external assistance.',
  },
  {
    id: 'leadership-decisions',
    label: 'Leadership Decision Quality',
    positiveSignals: [
      'decision', 'decided', 'authorise', 'authorized', 'approved',
      'leadership', 'executive team', 'board', 'ceo', 'cfo', 'coo',
      'senior management', 'escalated to leadership', 'executive approval',
      'ownership', 'accountable', 'prioritise', 'prioritized', 'strategic',
      'risk assessment', 'risk decision', 'acceptable risk', 'risk tolerance',
      'trade-off', 'trade off', 'consequence', 'considered the impact',
    ],
    negativeSignals: [
      'acted unilaterally', 'no authorisation', 'no authorization', 'no approval',
      'bypassed leadership', 'without permission', 'without authorisation',
    ],
    criticalRequired: false,
    absentText: 'No references to leadership decision-making, executive involvement, or ownership of critical decisions appeared in team responses.',
    passText: 'Team demonstrated sound decision-making discipline — escalating decisions appropriately, seeking executive authorisation for significant actions, and demonstrating risk-awareness in choices made.',
    concernText: 'Decision-making was present but some critical choices appeared to be taken without appropriate escalation or authorisation. Leadership visibility into the incident may be intermittent.',
    criticalMissText: 'Leadership decision quality was absent. Critical decisions were taken without executive awareness or authorisation. In a real incident, this creates accountability gaps and prevents coordinated executive response.',
    trainingRec: 'Incident Response Fundamentals — executive decision authority during incidents.',
    policyRec: 'Define a decision authority matrix: which decisions can be made at which levels, and which require executive sign-off during an active incident.',
    actionRec: 'Include senior leadership in the next TTX session to practise executive-level decision-making and ensure the decision authority matrix is understood across the organisation.',
  },
  {
    id: 'vendor-coordination',
    label: 'Third-party & Vendor Coordination',
    positiveSignals: [
      'vendor', 'supplier', 'carrier', 'notify vendor', 'contact vendor',
      'third party', 'third-party', 'partner', 'mssp', 'managed service',
      'bank', 'financial institution', 'fbi', 'law enforcement', 'police',
      'cisa', 'insurance', 'cyber insurance', 'attorney', 'legal counsel',
      'regulator', 'notify broker', 'freight forwarder', 'shipper',
    ],
    negativeSignals: [
      'didn\'t notify vendor', 'didn\'t tell the carrier', 'kept from partner',
      'no external contact', 'handled internally only',
    ],
    criticalRequired: false,
    absentText: 'No third-party notification or vendor coordination appeared in team responses. Responses handled the incident as an entirely internal matter.',
    passText: 'Team referenced appropriate external coordination — notifying vendors, engaging law enforcement, contacting cyber insurance, or involving legal counsel.',
    concernText: 'Third-party coordination was partially present. Some external parties were mentioned but responses did not demonstrate a systematic approach to external notification obligations.',
    criticalMissText: 'No external coordination was referenced. A real incident of this type typically requires vendor notification, law enforcement engagement, or insurance coordination — all of which have time-sensitive obligations.',
    trainingRec: 'Regulatory and Compliance frameworks for logistics — third-party notification obligations.',
    policyRec: 'Maintain a pre-populated vendor and external contact list for incident scenarios: cyber insurance, FBI IC3, CISA, and key vendors with their security contact details.',
    actionRec: 'Identify which incidents legally or contractually require vendor and third-party notification. Brief relevant team members on these obligations.',
  },
  {
    id: 'regulatory-reporting',
    label: 'Regulatory & Reporting Awareness',
    positiveSignals: [
      'regulatory', 'regulation', 'compliance', 'breach notification',
      'disclosure obligation', 'legal obligation', 'reporting requirement',
      'gdpr', 'hipaa', 'fmcsa', 'dot', 'sec', 'ftc',
      'cisa report', 'fbi report', 'ic3', 'report the breach',
      'insurance claim', 'cyber insurance', 'legal counsel',
      'notify regulator', 'regulatory body', 'federal reporting',
    ],
    negativeSignals: [
      'don\'t report', 'didn\'t report', 'no need to report',
      'ignore the regulators', 'no disclosure', 'don\'t tell anyone',
    ],
    criticalRequired: false,
    absentText: 'No references to regulatory obligations, reporting requirements, or disclosure responsibilities appeared in team responses.',
    passText: 'Team demonstrated regulatory awareness — referencing reporting obligations, breach notification requirements, or the need for legal counsel review before decisions.',
    concernText: 'Regulatory awareness was partially present. Some compliance references appeared but team responses did not clearly map actions to specific reporting obligations or timelines.',
    criticalMissText: 'No regulatory or reporting awareness was demonstrated. Incidents of this type typically carry statutory reporting obligations and breach notification requirements. Absence of this thinking creates significant legal exposure.',
    trainingRec: 'Regulatory and Compliance Frameworks — freight sector reporting obligations, CISA guidance, and breach notification requirements.',
    policyRec: 'Develop a regulatory notification checklist covering: applicable regulations, notification timelines, required content, and responsible person for each incident category.',
    actionRec: 'Have legal counsel review incident response obligations and ensure the team understands which incident categories require mandatory external reporting.',
  },
];

// ---------------------------------------------------------------------------
// Scenario profile definitions (weights must sum to 1.0)
// ---------------------------------------------------------------------------

type WeightProfile = Record<string, number>;

const PROFILES: Record<string, { label: string; weights: WeightProfile }> = {
  bec: {
    label: 'Business Email Compromise / Payment Fraud',
    weights: {
      'verification-validation':   0.25,
      'escalation-notification':   0.20,
      'communication-quality':     0.12,
      'incident-response':         0.08,
      'containment-control':       0.05,
      'evidence-documentation':    0.10,
      'recovery-continuity':       0.05,
      'leadership-decisions':      0.10,
      'vendor-coordination':       0.03,
      'regulatory-reporting':      0.02,
    },
  },
  ransomware: {
    label: 'Ransomware / Operational Disruption',
    weights: {
      'verification-validation':   0.05,
      'escalation-notification':   0.15,
      'communication-quality':     0.08,
      'incident-response':         0.22,
      'containment-control':       0.22,
      'evidence-documentation':    0.08,
      'recovery-continuity':       0.12,
      'leadership-decisions':      0.05,
      'vendor-coordination':       0.02,
      'regulatory-reporting':      0.01,
    },
  },
  ceo_fraud: {
    label: 'CEO Fraud / Executive Impersonation',
    weights: {
      'verification-validation':   0.28,
      'escalation-notification':   0.22,
      'communication-quality':     0.12,
      'incident-response':         0.06,
      'containment-control':       0.04,
      'evidence-documentation':    0.10,
      'recovery-continuity':       0.04,
      'leadership-decisions':      0.10,
      'vendor-coordination':       0.02,
      'regulatory-reporting':      0.02,
    },
  },
  supply_chain: {
    label: 'Supply Chain / Cargo Diversion',
    weights: {
      'verification-validation':   0.20,
      'escalation-notification':   0.18,
      'communication-quality':     0.10,
      'incident-response':         0.10,
      'containment-control':       0.08,
      'evidence-documentation':    0.08,
      'recovery-continuity':       0.08,
      'leadership-decisions':      0.08,
      'vendor-coordination':       0.06,
      'regulatory-reporting':      0.04,
    },
  },
  general: {
    label: 'General Threat / Mixed Scenario',
    weights: {
      'verification-validation':   0.12,
      'escalation-notification':   0.13,
      'communication-quality':     0.10,
      'incident-response':         0.11,
      'containment-control':       0.10,
      'evidence-documentation':    0.10,
      'recovery-continuity':       0.10,
      'leadership-decisions':      0.12,
      'vendor-coordination':       0.06,
      'regulatory-reporting':      0.06,
    },
  },
};

// ---------------------------------------------------------------------------
// Standards anchoring — per-category baseline expectations and NIST references
// ---------------------------------------------------------------------------

interface StandardsEntry {
  baselineExpectation: string;
  standardsReferences: string[];
}

const STANDARDS_MAP: Record<string, StandardsEntry> = {
  'verification-validation': {
    baselineExpectation: 'Teams should verify the identity of requesters through an out-of-band channel before acting on payment changes, access requests, or instruction modifications.',
    standardsReferences: [
      'NIST SP 800-61 §3.2 — Detection and Analysis (identity verification as a first-hour control)',
      'NIST CSF PR.AC-3 — Remote access management (extends to verification before privileged action)',
    ],
  },
  'escalation-notification': {
    baselineExpectation: 'Suspected incidents must be escalated to security or management within the first response window. Individual staff should not manage security incidents without organisational visibility.',
    standardsReferences: [
      'NIST SP 800-61 §2.3.4 — Incident response team structure and escalation responsibilities',
      'NIST CSF RS.CO-2 — Incidents are reported consistent with established criteria',
    ],
  },
  'communication-quality': {
    baselineExpectation: 'Communication about an active incident must be controlled, accurate, and routed through designated spokespersons. Premature or uncontrolled external disclosure must be prevented.',
    standardsReferences: [
      'NIST SP 800-61 §3.4 — Post-incident communication (extends to in-incident discipline)',
      'NIST CSF RS.CO-4 — Coordination with stakeholders occurs consistent with response plans',
    ],
  },
  'incident-response': {
    baselineExpectation: 'Teams should reference and follow a documented incident response plan during the exercise rather than improvising. Plan existence and basic familiarity are the minimum threshold.',
    standardsReferences: [
      'NIST SP 800-61 §2 — Establishing an Incident Response Capability',
      'NIST CSF RS.RP-1 — Response plan is executed during or after an incident',
    ],
  },
  'containment-control': {
    baselineExpectation: 'When compromise is suspected, teams should take immediate action to isolate affected systems, revoke access, or limit the attack surface within the first response window.',
    standardsReferences: [
      'NIST SP 800-61 §3.3 — Containment, Eradication, and Recovery',
      'NIST CSF RS.MI-1 — Incidents are contained',
      'NIST CSF RS.MI-2 — Incidents are mitigated',
    ],
  },
  'evidence-documentation': {
    baselineExpectation: 'All evidence — emails, logs, screenshots — must be preserved before any remediation action is taken. Chain of custody should be maintained for legal and insurance purposes.',
    standardsReferences: [
      'NIST SP 800-61 §3.3.2 — Evidence Gathering and Handling',
      'NIST CSF RS.AN-1 — Notifications from detection systems are investigated',
    ],
  },
  'recovery-continuity': {
    baselineExpectation: 'Teams should reference a tested recovery plan and backup restoration procedure. Business continuity planning should be invoked for any incident that disrupts operations.',
    standardsReferences: [
      'NIST SP 800-61 §3.4 — Post-Incident Activity (restoration and lessons learned)',
      'NIST CSF RC.RP-1 — Recovery plan is executed during or after a cybersecurity incident',
      'NIST CSF RC.CO-3 — Recovery activities are communicated to internal and external stakeholders',
    ],
  },
  'leadership-decisions': {
    baselineExpectation: 'Senior leadership must be informed and involved in significant decisions during an incident. Decision authority must be clear — not defaulted to the first available individual.',
    standardsReferences: [
      'NIST CSF GV.RR-2 — Cybersecurity roles and responsibilities are established, communicated, and understood',
      "NIST SP 800-61 §2.3.4 — Senior management's role in incident response",
    ],
  },
  'vendor-coordination': {
    baselineExpectation: 'Teams should identify and notify relevant external parties — vendors, carriers, banks, law enforcement — when incidents involve or affect those relationships.',
    standardsReferences: [
      'NIST SP 800-61 §2.3.5 — Relationships with other organisations',
      'NIST CSF RS.CO-3 — Information is shared consistent with response plans',
    ],
  },
  'regulatory-reporting': {
    baselineExpectation: 'Teams should demonstrate awareness of applicable reporting obligations and take steps to involve legal counsel in determining notification requirements.',
    standardsReferences: [
      'NIST SP 800-61 §2.3.5 — Reporting requirements and law enforcement engagement',
      'NIST CSF GV.PO-2 — Cybersecurity policy addresses purpose, scope, roles, authorities, and management commitment',
    ],
  },
};

const BASELINE_FRAMEWORK_NOTE =
  'This rubric is aligned to NIST SP 800-61 Rev. 2 (Computer Security Incident Handling Guide) and ' +
  'NIST CSF 2.0 (Govern, Identify, Protect, Detect, Respond, Recover) as contextual reference families. ' +
  'References indicate relevant controls and guidance — they do not imply certification or full framework compliance. ' +
  'Rubric scores reflect observed team behaviour during a tabletop exercise, not an audit finding.';

// ---------------------------------------------------------------------------
// Scenario expectation packs — profile-keyed minimum expectations
// ---------------------------------------------------------------------------

interface ScenarioExpectation {
  concept: string;          // plain-language description
  signals: string[];        // keywords indicating this was addressed in event text
  isCritical: boolean;      // absent → criticalMissTrigger (not just a gap)
}

interface ExpectationPack {
  packId: string;
  summary: string;
  expectations: ScenarioExpectation[];
  escalationTriggers: string[];  // scenario moments that should trigger escalation
}

const EXPECTATION_PACKS: Record<string, ExpectationPack> = {
  bec: {
    packId: 'bec-v1',
    summary: 'BEC / Payment Fraud scenarios require out-of-band payment verification, immediate payment hold authority, ' +
      'finance and management escalation, and evidence preservation of the fraudulent communication. ' +
      'Key risk: teams act on email instructions without independent confirmation.',
    escalationTriggers: [
      'Receipt of a payment change request or new banking instructions via email',
      'A supplier or vendor claiming to have changed their bank account details',
      'An urgent wire transfer request attributed to an executive or known contact',
      'Any instruction to bypass normal payment approval procedures',
    ],
    expectations: [
      {
        concept: 'Out-of-band payment verification attempted before any funds movement',
        signals: ['verify', 'verification', 'call back', 'callback', 'out of band', 'out-of-band', 'phone', 'pre-registered', 'trusted contact', 'independent confirmation'],
        isCritical: true,
      },
      {
        concept: 'Payment hold or freeze initiated pending verification',
        signals: ['hold', 'freeze', 'pause', 'stop payment', 'halt', 'do not transfer', 'pending verification', 'pause the transfer', 'put a hold'],
        isCritical: true,
      },
      {
        concept: 'Finance or management escalation triggered',
        signals: ['escalate', 'manager', 'finance director', 'cfo', 'supervisor', 'notify', 'report', 'informed'],
        isCritical: true,
      },
      {
        concept: 'Suspect email preserved as evidence',
        signals: ['preserve', 'screenshot', 'save the email', 'keep the email', 'document', 'forward to', 'evidence', 'do not delete'],
        isCritical: false,
      },
      {
        concept: 'Law enforcement or FBI IC3 notified',
        signals: ['fbi', 'ic3', 'law enforcement', 'police', 'report the fraud', 'report to fbi'],
        isCritical: false,
      },
      {
        concept: 'Bank contacted to recall or block transfer if funds moved',
        signals: ['contact the bank', 'call the bank', 'recall', 'clawback', 'fraud department', 'bank alert'],
        isCritical: false,
      },
    ],
  },
  ransomware: {
    packId: 'ransomware-v1',
    summary: 'Ransomware / Operational Disruption scenarios require immediate system isolation, IT and security notification, ' +
      'invocation of an incident response plan, and initiation of backup restoration assessment. ' +
      'Key risk: teams delay containment while attempting to negotiate or diagnose without isolating first.',
    escalationTriggers: [
      'Discovery of encrypted files or systems with ransom notes',
      'Multiple systems becoming unreachable or exhibiting abnormal behaviour simultaneously',
      'Evidence of active data exfiltration or lateral movement',
      'Any operational system shutdown or disruption during business hours',
    ],
    expectations: [
      {
        concept: 'Infected or suspect systems isolated from the network immediately',
        signals: ['isolate', 'isolated', 'disconnect', 'disconnected', 'quarantine', 'pull the plug', 'remove from network', 'shut down'],
        isCritical: true,
      },
      {
        concept: 'IT and security team notified and IR plan invoked',
        signals: ['it team', 'security team', 'soc', 'incident response', 'ir plan', 'playbook', 'procedure', 'escalate'],
        isCritical: true,
      },
      {
        concept: 'Backup status assessed and restoration initiated',
        signals: ['backup', 'backups', 'restore', 'restoration', 'restore from backup', 'recovery', 'disaster recovery'],
        isCritical: true,
      },
      {
        concept: 'Forensic evidence preserved before remediation',
        signals: ['forensic', 'preserve', 'logs', 'log collection', 'evidence', 'chain of custody', 'do not reformat', 'screenshot'],
        isCritical: false,
      },
      {
        concept: 'Cyber insurance and legal counsel engaged',
        signals: ['cyber insurance', 'insurance', 'legal counsel', 'attorney', 'notify insurer'],
        isCritical: false,
      },
      {
        concept: 'Business continuity plan invoked for affected operations',
        signals: ['business continuity', 'bcp', 'continuity plan', 'alternative', 'workaround', 'failover', 'contingency'],
        isCritical: false,
      },
    ],
  },
  ceo_fraud: {
    packId: 'ceo-fraud-v1',
    summary: 'CEO Fraud / Executive Impersonation scenarios require identity verification of the claimed executive through ' +
      'a known direct contact, refusal of the request pending confirmation, and board or leadership notification. ' +
      'Key risk: urgency and authority override standard controls when the request appears to come from the top.',
    escalationTriggers: [
      'An urgent, confidential wire transfer request attributed to an executive',
      'Executive communication requesting staff bypass standard approval processes',
      'Contact from an executive through an unusual or unverified channel',
      'Instruction to keep a transaction secret from other team members',
    ],
    expectations: [
      {
        concept: 'Executive identity verified through a known, pre-registered contact',
        signals: ['verify', 'verification', 'call back', 'callback', 'phone', 'call directly', 'direct line', 'known number', 'pre-registered', 'out of band', 'confirm with'],
        isCritical: true,
      },
      {
        concept: 'Requested action paused or refused pending verification',
        signals: ['pause', 'hold', 'refuse', 'declined', 'will not', 'pending verification', 'do not proceed', 'not transferred', 'on hold', 'stop'],
        isCritical: true,
      },
      {
        concept: 'Actual executive and board or legal notified of the fraudulent attempt',
        signals: ['notify', 'notified', 'board', 'legal', 'ceo', 'cfo', 'coo', 'executive team', 'senior management', 'informed leadership'],
        isCritical: true,
      },
      {
        concept: 'Fraudulent communication preserved as evidence',
        signals: ['preserve', 'save', 'screenshot', 'evidence', 'document', 'forward to security', 'keep a record'],
        isCritical: false,
      },
      {
        concept: 'FBI IC3 or law enforcement report filed',
        signals: ['fbi', 'ic3', 'law enforcement', 'report', 'filed a report'],
        isCritical: false,
      },
    ],
  },
  supply_chain: {
    packId: 'supply-chain-v1',
    summary: 'Supply Chain / Cargo Diversion scenarios require verification of load and delivery instruction changes through ' +
      'registered carrier contacts, operations and dispatch notification, and engagement with law enforcement or freight brokers. ' +
      'Key risk: fraudulent pickup or reroute instructions are followed without verifying through the legitimate carrier.',
    escalationTriggers: [
      'Unexpected reroute, pickup change, or new delivery instructions received',
      'A broker or carrier contact requesting loads be directed to a different location',
      'Driver or pickup contact not matching registered carrier details',
      'Cargo reported missing, misrouted, or not delivered as expected',
    ],
    expectations: [
      {
        concept: 'Carrier or broker identity verified through registered contact details',
        signals: ['verify', 'verification', 'callback', 'call back', 'registered', 'official contact', 'known number', 'carrier contact', 'confirm with carrier', 'trusted number'],
        isCritical: true,
      },
      {
        concept: 'Dispatch and operations management notified immediately',
        signals: ['dispatch', 'operations', 'operations manager', 'notify', 'escalate', 'management', 'supervisor', 'alert'],
        isCritical: true,
      },
      {
        concept: 'Legitimate carrier contacted through official channels to confirm load status',
        signals: ['contact carrier', 'freight forwarder', 'notify carrier', 'call carrier', 'official channel', 'broker', 'shipper'],
        isCritical: true,
      },
      {
        concept: 'Police report and freight crime report filed',
        signals: ['police', 'law enforcement', 'report', 'filed', 'freight crime', 'cargo theft', 'fbi'],
        isCritical: false,
      },
      {
        concept: 'Cargo tracking activated and load location investigated',
        signals: ['track', 'tracking', 'locate', 'gps', 'eld', 'telematics', 'last known location'],
        isCritical: false,
      },
    ],
  },
  general: {
    packId: 'general-v1',
    summary: 'General / Mixed Threat scenarios require prompt escalation to security or management, ' +
      'incident documentation, and basic containment of the affected system or account. ' +
      'Minimum baseline: the team should not handle a suspected security incident as an individual matter.',
    escalationTriggers: [
      'Any suspected system compromise, unauthorised access, or unusual activity',
      'Receipt of a suspicious communication requesting action or access',
      'Discovery of data exposure or potential unauthorised disclosure',
    ],
    expectations: [
      {
        concept: 'Incident escalated to security or management promptly',
        signals: ['escalate', 'escalated', 'notify', 'notified', 'report', 'security team', 'manager', 'supervisor', 'alert'],
        isCritical: true,
      },
      {
        concept: 'Incident documented with key details captured',
        signals: ['document', 'documented', 'record', 'recorded', 'screenshot', 'log', 'noted', 'wrote down'],
        isCritical: true,
      },
      {
        concept: 'Affected system or account contained',
        signals: ['isolate', 'disconnect', 'quarantine', 'revoke', 'lock', 'block', 'freeze', 'contain'],
        isCritical: false,
      },
      {
        concept: 'Legal counsel or compliance team informed where appropriate',
        signals: ['legal', 'compliance', 'attorney', 'counsel', 'regulatory'],
        isCritical: false,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Owner function labels per category (for corrective priorities)
// ---------------------------------------------------------------------------

const OWNER_FUNCTIONS: Record<string, string> = {
  'verification-validation':   'Finance / Accounts Payable',
  'escalation-notification':   'Security / Operations',
  'communication-quality':     'Communications / Legal',
  'incident-response':         'IT / Security Operations',
  'containment-control':       'IT / Security Operations',
  'evidence-documentation':    'IT / Security / Legal',
  'recovery-continuity':       'IT / Business Continuity',
  'leadership-decisions':      'Senior Leadership',
  'vendor-coordination':       'Operations / Procurement',
  'regulatory-reporting':      'Legal / Compliance',
};

// ---------------------------------------------------------------------------
// Profile detection
// ---------------------------------------------------------------------------

function detectProfile(snapshot: Record<string, unknown>): string {
  const text = [
    snapshot['title'] ?? '',
    snapshot['description'] ?? '',
    snapshot['objective'] ?? '',
    snapshot['signatureTheme'] ?? '',
    snapshot['executiveSummary'] ?? '',
  ].join(' ').toLowerCase();

  if (/ransomware|malware|encrypt|operational disruption|ops down|systems down/.test(text)) return 'ransomware';
  if (/ceo fraud|executive fraud|wire fraud|president fraud|impersonat/.test(text)) return 'ceo_fraud';
  if (/cargo diversion|load theft|supply chain|double broker|double-broker/.test(text)) return 'supply_chain';
  if (/bec|business email compromise|invoice fraud|payment fraud|payment change|wire transfer|account change/.test(text)) return 'bec';
  return 'general';
}

// ---------------------------------------------------------------------------
// Signal analysis
// ---------------------------------------------------------------------------

interface SignalAnalysis {
  posCount: number;
  negCount: number;
  positiveHits: string[];  // signal text that matched — used in evidence
}

function analyseSignals(eventTexts: string, cat: CategoryDef): SignalAnalysis {
  const lower = eventTexts.toLowerCase();
  const positiveHits: string[] = [];
  let posCount = 0;
  let negCount = 0;

  for (const sig of cat.positiveSignals) {
    if (lower.includes(sig)) {
      posCount++;
      positiveHits.push(sig);
    }
  }
  for (const sig of cat.negativeSignals) {
    if (lower.includes(sig)) negCount++;
  }

  return { posCount, negCount, positiveHits };
}

// ---------------------------------------------------------------------------
// Category scoring
// ---------------------------------------------------------------------------

function scoreCategory(cat: CategoryDef, allEventText: string, hasEvents: boolean): CategoryResult {
  if (!hasEvents) {
    const stdEntry = STANDARDS_MAP[cat.id] ?? { baselineExpectation: '', standardsReferences: [] };
    return {
      id: cat.id,
      label: cat.label,
      weight: 0,
      rawScore: 0,
      weightedScore: 0,
      band: 'critical_miss',
      evidence: [],
      gaps: ['No participant decisions or actions were recorded for this session — unable to evaluate.'],
      baselineExpectation: stdEntry.baselineExpectation,
      standardsReferences: stdEntry.standardsReferences,
    };
  }

  const { posCount, negCount, positiveHits } = analyseSignals(allEventText, cat);
  const criticalAbsent = cat.criticalRequired && posCount === 0;

  let rawScore: number;
  if (criticalAbsent) {
    // Critical category with no signals: 0–20 depending on whether negatives present
    rawScore = negCount > 0 ? 0 : 15;
  } else if (posCount === 0) {
    // Non-critical with no signals: some partial credit for other evidence of engagement
    rawScore = negCount > 0 ? 10 : 25;
  } else {
    const base = 30;
    const bonus = Math.min(posCount * 14, 65);
    const penalty = negCount * 12;
    rawScore = Math.max(0, Math.min(100, base + bonus - penalty));
  }

  const band: CategoryResult['band'] =
    rawScore >= 72 ? 'pass' : rawScore >= 48 ? 'concern' : 'critical_miss';

  // Build evidence and gap text
  const evidence: string[] = [];
  const gaps: string[] = [];

  if (band === 'pass') {
    evidence.push(cat.passText);
    if (positiveHits.length > 0) {
      evidence.push(`Signals detected: ${positiveHits.slice(0, 4).join(', ')}.`);
    }
  } else if (band === 'concern') {
    evidence.push(cat.concernText);
    if (positiveHits.length > 0) {
      evidence.push(`Partial signals: ${positiveHits.slice(0, 3).join(', ')}.`);
    }
    gaps.push(cat.concernText);
  } else {
    gaps.push(criticalAbsent ? cat.criticalMissText : cat.absentText);
    if (negCount > 0) {
      gaps.push('Responses included indicators of explicitly incorrect practice for this category.');
    }
  }

  const stdEntry = STANDARDS_MAP[cat.id] ?? { baselineExpectation: '', standardsReferences: [] };

  return {
    id: cat.id,
    label: cat.label,
    weight: 0, // filled in by caller after profile lookup
    rawScore,
    weightedScore: 0,
    band,
    evidence,
    gaps,
    baselineExpectation: stdEntry.baselineExpectation,
    standardsReferences: stdEntry.standardsReferences,
  };
}

// ---------------------------------------------------------------------------
// Overall band
// ---------------------------------------------------------------------------

function overallBand(score: number): RubricResult['overallBand'] {
  if (score >= 78) return 'strong';
  if (score >= 58) return 'acceptable';
  if (score >= 38) return 'needs_attention';
  return 'critical_gaps';
}

// ---------------------------------------------------------------------------
// Operational risk note (derived from critical gaps)
// ---------------------------------------------------------------------------

function buildOperationalRiskNote(categories: CategoryResult[]): string {
  const criticals = categories.filter(c => c.band === 'critical_miss').map(c => c.id);

  if (criticals.length === 0) return 'No critical gaps identified. Primary risk exposure relates to the concern-level categories above — consistent execution under real incident pressure remains the outstanding variable.';

  const parts: string[] = [];

  if (criticals.includes('verification-validation') && criticals.includes('escalation-notification')) {
    parts.push('The combination of absent verification discipline and absent escalation creates a high-probability path to successful fraud. An attacker who reaches email correspondence with staff has a clear, unobstructed route to financial loss or operational compromise.');
  } else if (criticals.includes('verification-validation')) {
    parts.push('Absent verification discipline is the single highest-priority risk. Payment change requests, identity claims, and instruction changes that go unverified represent a direct financial exposure.');
  } else if (criticals.includes('escalation-notification')) {
    parts.push('Absent escalation means incidents will be handled individually rather than organisationally. Executive decision authority will not be engaged until damage has accumulated and response options have narrowed.');
  }

  if (criticals.includes('containment-control') && criticals.includes('incident-response')) {
    parts.push('Without containment procedures and IR protocols, a ransomware or compromise event would result in extended and uncontrolled spread before any coordinated response begins. Extended downtime is the likely outcome.');
  } else if (criticals.includes('containment-control')) {
    parts.push('Absent containment thinking means that compromise scope will expand during response. Systems, accounts, and data will remain exposed while the incident is managed.');
  }

  if (criticals.includes('recovery-continuity')) {
    parts.push('Recovery thinking was absent. Without tested backup and continuity procedures, restoration timelines are undefined and potentially indefinite.');
  }

  if (criticals.includes('evidence-documentation')) {
    parts.push('Without evidence preservation, forensic investigation, insurance claims, and legal proceedings become significantly harder to support after the event.');
  }

  if (criticals.includes('regulatory-reporting')) {
    parts.push('Regulatory and reporting awareness was absent. Incidents of this type carry statutory notification obligations. Failure to comply creates legal exposure that outlasts the incident itself.');
  }

  if (parts.length === 0) {
    parts.push(`Critical gaps in ${criticals.map(c => CATEGORIES.find(cat => cat.id === c)?.label ?? c).join(', ')} represent operational exposure that would likely compound damage in a real incident.`);
  }

  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Recommendation generation
// ---------------------------------------------------------------------------

function buildRecommendations(categories: CategoryResult[]): {
  recommendedActions: string[];
  trainingRecommendations: string[];
  policyRecommendations: string[];
} {
  const recommendedActions: string[] = [];
  const trainingRecommendations: string[] = [];
  const policyRecommendations: string[] = [];

  for (const cat of categories) {
    if (cat.band === 'pass') continue;
    const def = CATEGORIES.find(c => c.id === cat.id);
    if (!def) continue;

    const priority = cat.band === 'critical_miss' ? '[Priority] ' : '';
    recommendedActions.push(`${priority}${def.actionRec}`);
    trainingRecommendations.push(`${priority}${def.trainingRec}`);
    policyRecommendations.push(`${priority}${def.policyRec}`);
  }

  return { recommendedActions, trainingRecommendations, policyRecommendations };
}

// ---------------------------------------------------------------------------
// Scenario expectation pack evaluation
// ---------------------------------------------------------------------------

function buildExpectationFindings(
  allEventText: string,
  profileKey: string,
): {
  scenarioSpecificFindings: string[];
  criticalMissTriggers: string[];
} {
  const pack = EXPECTATION_PACKS[profileKey] ?? EXPECTATION_PACKS['general'];
  const lower = allEventText.toLowerCase();

  const scenarioSpecificFindings: string[] = [];
  const criticalMissTriggers: string[] = [];

  for (const exp of pack.expectations) {
    const matched = exp.signals.some(sig => lower.includes(sig));
    if (matched) {
      scenarioSpecificFindings.push(`Addressed: ${exp.concept}`);
    } else if (exp.isCritical) {
      criticalMissTriggers.push(`Not demonstrated: ${exp.concept}`);
    } else {
      scenarioSpecificFindings.push(`Gap: ${exp.concept} — not clearly addressed in team responses`);
    }
  }

  return { scenarioSpecificFindings, criticalMissTriggers };
}

// ---------------------------------------------------------------------------
// Corrective priorities (top 3 by weighted gap severity)
// ---------------------------------------------------------------------------

function buildCorrectivePriorities(categories: CategoryResult[]): CorrectivePriority[] {
  const priorityScore = (c: CategoryResult): number => {
    if (c.band === 'critical_miss') return c.weight * 3;
    if (c.band === 'concern') return c.weight * 1.5;
    return 0;
  };

  const ranked = [...categories]
    .filter(c => c.band !== 'pass')
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 3);

  return ranked.map((c, i) => {
    const def = CATEGORIES.find(cat => cat.id === c.id);
    return {
      rank: i + 1,
      categoryId: c.id,
      categoryLabel: c.label,
      action: def?.actionRec ?? `Address gap in ${c.label}`,
      ownerFunction: OWNER_FUNCTIONS[c.id] ?? 'Operations / Leadership',
    };
  });
}

// ---------------------------------------------------------------------------
// Executive / leadership summary layer
// ---------------------------------------------------------------------------

function buildExecutiveSummaryLayer(input: {
  overallBand: RubricResult['overallBand'];
  overallScore: number;
  scenarioProfile: string;
  profileLabel: string;
  criticalGaps: string[];
  categories: CategoryResult[];
  correctivePriorities: CorrectivePriority[];
  insufficientData: boolean;
}): {
  executiveSummary: string;
  businessRiskStatement: string;
  leadershipBottomLine: string;
} {
  const { overallBand, overallScore, profileLabel, criticalGaps, categories, correctivePriorities, insufficientData } = input;

  if (insufficientData) {
    return {
      executiveSummary: 'This session did not generate sufficient participant response data for a reliable evaluation. The rubric requires recorded decision and action events to score team performance. Re-run the evaluation after the session has been conducted with active participant input.',
      businessRiskStatement: 'No business risk assessment can be generated without session data.',
      leadershipBottomLine: 'Conduct the exercise with active participant involvement and re-score.',
    };
  }

  const criticalCats = categories.filter(c => c.band === 'critical_miss');
  const passCats = categories.filter(c => c.band === 'pass');
  const topPriority = correctivePriorities[0];
  const criticalLabels = criticalCats.map(c => c.label).join(', ');
  const passLabels = passCats.slice(0, 3).map(c => c.label).join(', ');

  let executiveSummary: string;
  let businessRiskStatement: string;
  let leadershipBottomLine: string;

  switch (overallBand) {
    case 'strong':
      executiveSummary =
        `The team demonstrated strong incident response capabilities in this ${profileLabel} tabletop exercise, ` +
        `scoring ${overallScore}/100. ${passCats.length} of 10 evaluated categories performed at pass level, ` +
        `indicating established foundational discipline.` +
        (criticalCats.length > 0
          ? ` Isolated critical gaps remain in ${criticalLabels} and require targeted remediation.`
          : ' No critical gaps were identified. Primary focus should be on formalising existing practices into documented, tested procedures.');
      businessRiskStatement =
        'Current risk exposure is relatively low, with the team demonstrating sound instincts across most evaluated categories. ' +
        (topPriority
          ? `The most significant remaining exposure is in ${topPriority.categoryLabel}, which should be addressed by ${topPriority.ownerFunction} as a structured programme item.`
          : 'Continued exercise cadence and procedure formalisation are the recommended next steps.');
      leadershipBottomLine =
        `Team performance is strong — the outstanding need is to formalise and test existing practices before the next real incident.`;
      break;

    case 'acceptable':
      executiveSummary =
        `The team demonstrated acceptable but inconsistent performance in this ${profileLabel} exercise, ` +
        `scoring ${overallScore}/100. While ${passLabels || 'some categories'} were handled appropriately, ` +
        `${criticalCats.length > 0 ? `critical gaps in ${criticalLabels} represent` : 'concern-level findings represent'} ` +
        `material risk that would likely compound under real incident pressure. ` +
        `Structured remediation of the identified gaps is recommended before the next exercise.`;
      businessRiskStatement =
        `The organisation has baseline incident response capability but inconsistent execution creates windows of exposure. ` +
        (criticalCats.length > 0
          ? `The most acute risk is in ${criticalLabels} — these gaps could result in delayed response, financial loss, or extended downtime in a real ${profileLabel.toLowerCase()} event.`
          : `Inconsistent application of procedures may result in coordination failures under the time pressure of a real incident.`);
      leadershipBottomLine =
        `Performance is acceptable on paper, but gaps in ${topPriority?.categoryLabel ?? 'key categories'} represent real exposure — close them before the next incident finds them first.`;
      break;

    case 'needs_attention':
      executiveSummary =
        `Team performance in this ${profileLabel} exercise fell below the acceptable threshold, ` +
        `scoring ${overallScore}/100. Critical gaps in ${criticalLabels || 'multiple categories'} indicate that ` +
        `key response actions were not demonstrated. These deficiencies represent significant operational risk ` +
        `that requires executive-sponsored intervention — not just training scheduling.`;
      businessRiskStatement =
        `The organisation currently has meaningful exposure to a ${profileLabel.toLowerCase()} event. ` +
        `Absent or inconsistent ${criticalLabels || 'core response'} discipline means that a real incident would likely result in ` +
        `delayed containment, extended financial or operational impact, and potential regulatory exposure. ` +
        `Remediation is time-sensitive.`;
      leadershipBottomLine =
        `This result requires executive attention — the gaps identified are not training issues alone, they are structural, and they carry real financial and operational consequences.`;
      break;

    case 'critical_gaps':
    default:
      executiveSummary =
        `This ${profileLabel} exercise revealed that the organisation is not currently prepared to manage an incident of this type, ` +
        `scoring ${overallScore}/100. Critical deficiencies in ${criticalLabels || 'multiple fundamental categories'} ` +
        `indicate that core response disciplines — verification, escalation, containment, and recovery — ` +
        `were not demonstrated. Immediate remediation action from senior leadership is required.`;
      businessRiskStatement =
        `In the event of a real ${profileLabel.toLowerCase()} incident occurring now, the organisation faces significant unmitigated risk across multiple response dimensions. ` +
        `The combination of absent ${criticalLabels || 'foundational'} disciplines means that financial loss, operational disruption, and regulatory exposure would compound ` +
        `without effective counteraction. This is a board-level risk posture concern.`;
      leadershipBottomLine =
        `The organisation is not currently prepared to manage a ${profileLabel.toLowerCase()} incident — this requires immediate, executive-sponsored remediation.`;
      break;
  }

  return { executiveSummary, businessRiskStatement, leadershipBottomLine };
}

// ---------------------------------------------------------------------------
// Main scoring entry point
// ---------------------------------------------------------------------------

export interface ScoringInput {
  sessionId: string;
  sessionTitle: string;
  snapshot: Record<string, unknown>;
  events: Array<{ eventType: string; body: string; actorHandle: string }>;
  participants: Array<unknown>;
}

export function scoreSession(input: ScoringInput): RubricResult {
  const { sessionId, sessionTitle, snapshot, events, participants } = input;

  // Filter to scoreable events
  const responseEvents = events.filter(e => ['decision', 'note', 'action'].includes(e.eventType));
  const hasEvents = responseEvents.length > 0;
  const observationCount = events.filter(e => ['decision', 'action'].includes(e.eventType)).length;
  const allEventText = responseEvents.map(e => e.body).join(' ');

  // Detect scenario profile
  const profileKey = detectProfile(snapshot);
  const profile = PROFILES[profileKey] ?? PROFILES['general'];

  // Insufficient data check — need at least 2 response events
  const insufficientData = responseEvents.length < 2;

  // Score each category
  const categories: CategoryResult[] = CATEGORIES.map(cat => {
    const result = scoreCategory(cat, allEventText, hasEvents);
    const weight = profile.weights[cat.id] ?? 0.1;
    result.weight = weight;
    result.weightedScore = Math.round(result.rawScore * weight * 10) / 10;
    return result;
  });

  // Overall weighted score
  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + c.weightedScore, 0)
  );

  // Strengths, misses, critical gaps
  const strengths = categories
    .filter(c => c.band === 'pass' && c.rawScore >= 75)
    .map(c => c.evidence[0] ?? `Strong performance in ${c.label}.`);

  const misses = categories
    .filter(c => c.band === 'concern')
    .map(c => c.gaps[0] ?? `Improvement needed in ${c.label}.`);

  const criticalGaps = categories
    .filter(c => c.band === 'critical_miss' && hasEvents)
    .map(c => c.gaps[0] ?? `Critical gap in ${c.label}.`);

  const operationalRiskNote = buildOperationalRiskNote(categories);
  const { recommendedActions, trainingRecommendations, policyRecommendations } = buildRecommendations(categories);
  const { scenarioSpecificFindings, criticalMissTriggers } = buildExpectationFindings(allEventText, profileKey);
  const correctivePriorities = buildCorrectivePriorities(categories);
  const finalBand: RubricResult['overallBand'] = insufficientData ? 'critical_gaps' : overallBand(overallScore);
  const { executiveSummary, businessRiskStatement, leadershipBottomLine } = buildExecutiveSummaryLayer({
    overallBand: finalBand,
    overallScore: insufficientData ? 0 : overallScore,
    scenarioProfile: profileKey,
    profileLabel: profile.label,
    criticalGaps: insufficientData ? [] : criticalGaps,
    categories,
    correctivePriorities,
    insufficientData,
  });

  const pack = EXPECTATION_PACKS[profileKey] ?? EXPECTATION_PACKS['general'];

  return {
    scoredAt: new Date().toISOString(),
    rubricVersion: '1.1',
    sessionId,
    sessionTitle,
    scenarioProfile: profileKey,
    baselineRubricId: `five-eyes-ttx-rubric-v1.1-${profileKey}`,
    participantCount: participants.length,
    observationCount,
    insufficientData,
    overallScore: insufficientData ? 0 : overallScore,
    overallBand: finalBand,
    categories,
    strengths: insufficientData ? [] : strengths,
    misses: insufficientData ? [] : misses,
    criticalGaps: insufficientData ? ['Session has insufficient participant response data to generate a reliable rubric evaluation.'] : criticalGaps,
    operationalRiskNote: insufficientData
      ? 'This session had fewer than 2 recorded participant responses. The rubric requires decision and action events to evaluate team performance. Run the evaluation again after the session has generated more participant input.'
      : operationalRiskNote,
    recommendedActions: insufficientData ? [] : recommendedActions,
    trainingRecommendations: insufficientData ? [] : trainingRecommendations,
    policyRecommendations: insufficientData ? [] : policyRecommendations,
    // Standards anchoring
    baselineFrameworkNote: BASELINE_FRAMEWORK_NOTE,
    standardsAnchored: true,
    // Scenario expectation pack
    scenarioExpectationPackId: pack.packId,
    scenarioExpectationSummary: pack.summary,
    scenarioSpecificFindings: insufficientData ? [] : scenarioSpecificFindings,
    criticalMissTriggers: insufficientData ? [] : criticalMissTriggers,
    // Executive / leadership summary
    executiveSummary,
    businessRiskStatement,
    correctivePriorities: insufficientData ? [] : correctivePriorities,
    leadershipBottomLine,
    // Company-protocol overlay hooks (not yet implemented — prepared for future pass)
    protocolOverlayAvailable: false,
    protocolComparisonPending: true,
  };
}
