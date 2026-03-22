---
title: "Data and Document Security for Freight Operations"
module_type: standard
estimated_minutes: 20
displayOrder: 10
topics:
  - Data and Document Security
---

# Module Outline: Data and Document Security for Freight Operations

## Learning Objectives

By the end of this module, learners will demonstrate the following measurable behaviors:

1. **Identify driver PII categories** — Given a list of data types collected during driver onboarding or operations, correctly classify which items constitute protected PII under FMCSA regulations and applicable state law, and identify the retention period that applies to each category.

2. **Apply document-specific security rules** — Given a scenario involving a BOL, POD, rate confirmation, or driver qualification file, select the correct handling action (secure storage, verification before payment, escalation before release, access restriction) and identify when a document handling decision represents a fraud risk.

3. **Select appropriate secure sharing methods** — Given a scenario requiring transmission of a sensitive freight document, select the correct sharing method (secure portal, encrypted email, password-protected file, phone-only) based on the data category involved, and recognize when standard email is not sufficient.

4. **Execute breach response sequence** — Given a scenario in which driver PII or freight data has been exposed, correctly identify the event as a potential breach, and sequence the correct response steps: contain, document, notify IT, notify insurer, assess notification obligations, notify affected individuals, and file law enforcement report.

5. **Apply access control principles** — Given a description of a freight company's document storage structure, identify which access configurations violate least privilege and recommend the corrected configuration for each sensitive document category.

---

## Lesson Structure

### Lesson 1 — Driver PII: What You Have and What You Owe (4 minutes)
**KB article:** data-security-01-driver-pii-protection.md
**Learning objective addressed:** Objective 1

This lesson establishes the full inventory of driver PII collected in freight operations and the FMCSA regulatory retention and protection obligations that attach to it, with particular attention to the categories most frequently mishandled (SSN, CDL, drug test results) and the breach notification obligations triggered when those categories are exposed.

**Transition:** Learner understands what driver PII is and what the law requires. Lesson 2 extends this to all freight documents and their specific handling rules.

---

### Lesson 2 — Document Handling Standards by Document Type (4 minutes)
**KB article:** data-security-02-document-handling-standards.md
**Learning objective addressed:** Objective 2

This lesson covers BOL, POD, rate confirmation, and driver file handling rules one by one — connecting each document's security requirements to the specific fraud the mishandling enables (fictitious pickup, fraudulent POD payment, carrier impersonation, identity theft), and establishing the verification and retention standards that apply to each.

**Transition:** Learner knows how to handle each document type. Lesson 3 covers how to share documents safely.

---

### Lesson 3 — Secure Sharing: When Email Is Not Enough (3 minutes)
**KB article:** data-security-03-secure-sharing-controls.md
**Learning objective addressed:** Objective 3

This lesson establishes which data categories require secure transmission channels beyond standard email, presents the three approved methods (portal, encrypted email, password-protected PDF) with practical guidance on each, and covers recipient verification and cloud storage default-setting risks relevant to all freight staff.

**Transition:** Learner can share documents appropriately. Lesson 4 addresses what to do when something goes wrong.

---

### Lesson 4 — Breach Response: What to Do When Data Is Exposed (4 minutes)
**KB article:** data-security-04-breach-response-basics.md
**Learning objective addressed:** Objective 4

This lesson defines the triggering events that initiate breach response, walks through the eight-step response sequence (contain, document, IT notification, insurer notification, legal assessment, individual notification, law enforcement report, post-incident review), and identifies the state notification law obligations that apply when driver SSN, CDL, or DOB is exposed.

**Transition:** Learner knows how to respond to a breach. Lesson 5 addresses the preventive control structure that limits how much damage a breach can cause.

---

### Lesson 5 — Access Controls: Who Gets Access to What (3 minutes)
**KB article:** data-security-05-access-control-for-documents.md
**Learning objective addressed:** Objective 5

This lesson applies the principle of least privilege to freight document management, provides the role-based access map for the five primary document categories, covers cloud storage hygiene for Google Drive/OneDrive/SharePoint, and establishes the quarterly access review as the minimum operational control for ongoing access management.

**Transition:** Learner has the access control framework. Lesson 6 provides the threat context that explains why all of these controls are necessary.

---

### Lesson 6 — Threat Brief: How Freight Data Is Stolen and Misused (2 minutes)
**KB article:** data-security-06-threat-brief-data-freight.md
**Learning objectives addressed:** All (reinforcement and threat context)

This lesson provides the operational threat context behind the module's controls — driver file exfiltration for identity fraud, document fraud enabling cargo theft and fraudulent payment, and the BEC data harvesting phase that precedes payment fraud. It closes the module by framing why freight data attacks are distinctly dangerous: the data is operational, fraud can happen before the breach is detected, and victims include customers and carriers as well as the breached company.

---

## Assessment

**Module quiz:** 10 questions drawn from the practice question bank (practice-questions.md). Minimum passing score: 80% (8 of 10 correct).

**Question distribution for module quiz:**
- Driver PII identification (Objective 1): 2 questions
- Document handling decisions (Objective 2): 2 questions
- Secure sharing method selection (Objective 3): 2 questions
- Breach response sequencing (Objective 4): 2 questions
- Access control decisions (Objective 5): 2 questions

**Full practice bank:** 20 questions covering all five objectives plus document fraud recognition scenarios.

**Adaptive branching:** Learners who score below 80% are routed to the remediation path before reattempting the quiz. Learners who fail two attempts are flagged for manager review.

---

## Remediation Path

Learners who do not pass the module quiz are routed to one or both remediation cards based on their error pattern:

**remediation-01-driver-pii-exposed.md** — For learners who missed questions on driver PII identification, breach response sequencing, or notification obligations. This fast-action card provides a numbered 48-hour response sequence for driver PII exposure events, reinforcing containment, notification, and documentation steps as a concrete operational workflow.

**remediation-02-document-fraud-suspected.md** — For learners who missed questions on document handling decisions, secure sharing choices, or document fraud recognition. This fast-action card covers the immediate response to a suspected BOL or POD manipulation: hold the transaction, verify on a known-good number, preserve the document, report through the correct channels.

After completing the assigned remediation card(s), learners reattempt the quiz with a new question set drawn from the same topic areas.

Learners who pass after remediation are marked complete. Learners who fail a second time after remediation are escalated to their manager for a live review session with a supervisor or compliance officer.
