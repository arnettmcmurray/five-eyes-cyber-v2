---
title: Incident Reporting and Response
module_type: topic-module
estimated_minutes: 25
topics:
  - Incident Reporting & Response
---

# Module Outline: Incident Reporting and Response

## Learning Objectives

By the end of this module, learners will demonstrate the following measurable behaviors:

1. **Classify incidents correctly** — Given a freight operational scenario, correctly identify whether an event constitutes a cybersecurity incident, a suspicious event requiring escalation, or a non-incident, using NIST SP 800-61r3 thresholds.

2. **Execute internal escalation** — Identify the correct escalation chain for a freight cyber incident and apply the correct time triggers (15 minutes for system compromise, 30 minutes for financial fraud).

3. **Preserve evidence appropriately** — In a scenario where an incident has just been discovered, select the actions that preserve forensic evidence and reject actions that destroy it (rebooting, running antivirus, deleting files).

4. **Identify external reporting obligations** — Match incident types to the appropriate external reporting recipients (FBI/IC3, FMCSA, CISA, SEC) and know the applicable timeframes.

5. **Apply regulatory knowledge accurately** — Distinguish between current requirements (TSA SD 1580-21-01 version C, SEC Item 1.05) and proposed or pending rules (CIRCIA, TSA NPRM for trucking) without overstating obligations.

6. **Execute freight-specific IR steps** — Given a carrier impersonation, BEC wire fraud, or cargo theft scenario, select the correct first-response actions in the correct priority order.

7. **Use incident communications correctly** — Select appropriate language to use with shippers, reporters, and partner carriers during an active incident without making unauthorized disclosures.

---

## Lesson Structure

### Lesson 1 — What Counts as a Cyber Incident (5 minutes)
**KB article:** kb-01-what-counts-as-incident.md
**Learning objective addressed:** Objective 1
**Format:** Reading + 2 embedded scenario-check questions

Key concepts:
- NIST SP 800-61r3 incident definition
- Always-report events vs. assess-and-escalate events vs. non-incidents
- Freight-specific threshold examples (DAT messages, TMS audit logs, ELD anomalies)

**Transition:** Learner knows what counts as an incident. Lesson 2 covers what to do in the first minutes after discovery.

---

### Lesson 2 — Internal Escalation Chain (4 minutes)
**KB article:** kb-02-internal-escalation.md
**Learning objective addressed:** Objective 2
**Format:** Policy reading + decision scenario

Key concepts:
- The escalation chain: employee → supervisor → IT/security → operations leadership → legal
- Time triggers by incident type (15 min / 30 min thresholds)
- What information to capture during escalation (time, device, system, actions)
- Who makes external reporting decisions (not front-line employees)

**Transition:** Learner knows who to call. Lesson 3 covers what not to touch while making those calls.

---

### Lesson 3 — Evidence Preservation (5 minutes)
**KB article:** kb-05-evidence-preservation.md
**Learning objective addressed:** Objective 3
**Format:** Reading + permitted/not-permitted action table + scenario

Key concepts:
- Volatile memory (RAM) destroyed by reboot — do not power off
- Screenshot before doing anything else
- Chain of custody
- Freight-specific evidence: ELD logs, TMS audit trails, email headers
- What you can vs. cannot do yourself

**Transition:** Learner knows how to preserve evidence. Lesson 4 covers who outside the company needs to know — and when.

---

### Lesson 4 — External Reporting: Regulators and Law Enforcement (6 minutes)
**KB articles:** kb-03-reporting-obligations.md, kb-04-law-enforcement-reporting.md
**Learning objectives addressed:** Objectives 4 and 5
**Format:** Reading (two articles, shorter passes) + matching exercise

Key concepts:
- TSA SD 1580-21-01 version C: current, freight railroad and pipeline, 24-hour CISA reporting
- CIRCIA: proposed, not yet final — prepare now, do not state as current requirement
- SEC Item 1.05: 4 business days from materiality determination, publicly traded companies
- NYDFS 23 NYCRR 500: NY-licensed financial services, 72-hour reporting
- FBI/IC3: ic3.gov, Financial Fraud Kill Chain for BEC, 72-hour window
- FMCSA: carrier identity theft reporting, load board notification

**Transition:** Learner understands regulatory and law enforcement reporting. Lesson 5 applies the full response sequence to freight-specific scenarios.

---

### Lesson 5 — Freight-Specific Incident Response Scenarios (4 minutes)
**KB article:** kb-06-freight-specific-ir.md
**Learning objective addressed:** Objective 6
**Format:** Three scenario walk-throughs + sequencing exercise

Key concepts:
- Carrier impersonation: verify scope → notify DAT/Truckstop → FMCSA → FBI/IC3 → notify shipper contacts
- BEC wire fraud: call bank first → call sending bank → FBI/IC3 → cyber insurance → preserve email evidence
- Cargo theft with cyber component: confirm position → notify shipper/consignee → law enforcement → cargo insurance → CargoNet/NMFTA

**Transition:** Learner can respond to the three primary freight fraud scenarios. Lesson 6 covers communications during and after the incident.

---

### Lesson 6 — Incident Communications (3 minutes)
**KB article:** kb-08-incident-communications.md
**Learning objective addressed:** Objective 7
**Format:** FAQ reading + response-selection exercise

Key concepts:
- What to say to shippers, reporters, and partner carriers during an active incident
- No social media during active incidents
- Employee communications come from leadership through official channels
- When the organization can speak openly: after containment, scope understanding, regulatory notifications, and legal review

---

## Assessment Notes

**Module quiz:** 10 questions drawn from the practice question bank (practice-questions.md). Minimum passing score: 80%.

**Question distribution for module quiz:**
- Incident identification: 2 questions
- Internal escalation and evidence: 2 questions
- External reporting (regulatory and law enforcement): 3 questions
- Freight-specific scenarios: 2 questions
- Incident communications: 1 question

**Adaptive branching:** Learners who score below 80% are routed to the remediation path before reattempting the quiz. Learners who fail two attempts are flagged for manager review.

---

## Remediation Path

Learners who do not pass the module quiz are routed to one or both remediation cards based on their error pattern:

**remediation-01-incident-first-hour.md** — For learners who missed questions on escalation sequence, evidence preservation, or the 15/30-minute time triggers. This fast-action card reinforces the first 60 minutes of incident response as a numbered operational sequence.

**remediation-02-do-i-need-to-report.md** — For learners who missed questions on external reporting obligations, regulatory frameworks, or law enforcement reporting timing. This decision card provides if/then reporting logic organized by incident type.

After completing the assigned remediation card(s), learners reattempt the quiz with a new question set drawn from the same topic areas.

Learners who pass after remediation are marked complete. Learners who fail a second time after remediation are escalated to their manager for live review with a supervisor or compliance officer.
