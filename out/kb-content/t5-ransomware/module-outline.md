---
title: Ransomware and Operational Resilience
module_type: topic-module
estimated_minutes: 30
topics:
  - Ransomware & Operational Resilience
---

# Module: Ransomware and Operational Resilience

## Module Purpose

This module prepares freight operations personnel — dispatchers, drivers, fleet managers, and owner-operators — to recognize ransomware threats, respond correctly in the first critical minutes, and understand the policies that govern recovery decisions. Completion of this module satisfies the Ransomware & Operational Resilience training requirement for all roles.

---

## Learning Objectives

Upon completing this module, learners will be able to:

1. Describe what ransomware does to freight operations, citing at least two specific system categories (TMS, ELD, load boards, document systems) that are lost in an attack
2. Identify at least four early behavioral warning signs of ransomware activity before encryption completes
3. Execute the correct three-step response sequence (Recognize → Report → Isolate) within the 5-minute decision window
4. Explain why the 3-2-1 backup rule requires one offline or air-gapped copy and what happens to network-attached backups during an attack
5. State the correct escalation chain when ransomware is confirmed, including who makes the network isolation decision and who has authority over ransom payment decisions
6. Describe at least two ELD-specific risks and one action drivers can take to support ELD security
7. Explain why ransom payment decisions require legal and insurance involvement and identify the two federal regulatory frameworks (OFAC, FinCEN) that apply

---

## Lesson Structure

### Lesson 1: The Threat Landscape in Freight (5 minutes)
**Knowledge base:** kb-01-ransomware-in-freight.md

**Content:** What ransomware actually does to freight operations; ENISA and IBM X-Force statistics; the ORBCOMM attack as a real-world reference case; why freight is a high-value target; the attack chain from initial access to encryption.

**Objective covered:** #1

**Format:** Threat brief read + 3-question knowledge check

---

### Lesson 2: Operational Impact — System by System (6 minutes)
**Knowledge base:** kb-02-operational-impact.md

**Content:** What happens to TMS, ELD, load boards, dispatch communication, and document systems when ransomware hits; the operational cascade; what offline operations actually requires; the first-hour, first-day, and first-week decision timeline; role-specific impact for dispatchers, drivers, owner-operators, and fleet managers.

**Objective covered:** #1, #5

**Format:** Training content read + scenario walkthrough (TMS down: what do you do?) + 4-question knowledge check

---

### Lesson 3: Early Warning Signs and the 5-Minute Window (7 minutes)
**Knowledge base:** kb-05-early-warning-signs.md

**Content:** The reconnaissance and staging window before encryption; behavioral indicators (antivirus alerts, system slowness, inaccessible drives, unknown file extensions, unexpected processes); freight-specific signals (TMS anomalies, simultaneous ELD drops, login failures); what not to do; the Recognize → Report → Isolate sequence.

**Objective covered:** #2, #3

**Format:** Training content read + scenario-based decision exercise (choose the correct response to four observable indicators) + 5-question knowledge check

---

### Lesson 4: Prevention Controls and ELD Threats (6 minutes)
**Knowledge base:** kb-03-prevention-controls.md, kb-06-eld-telematics-threat.md

**Content:** Email filtering, MFA on all remote access, EDR vs. legacy AV, patching discipline (CISA KEV), least privilege, network segmentation; ELD as a networked attack surface; ORBCOMM and NMFTA research grounding ELD vulnerability as real; attack scenarios; driver and fleet manager actions.

**Objective covered:** #4, #6

**Format:** Training content read + quick-reference control checklist + 5-question knowledge check

---

### Lesson 5: Response and Recovery Policy (6 minutes)
**Knowledge base:** kb-07-response-playbook.md, kb-04-backup-recovery-standard.md

**Content:** The five-phase response playbook (Detect and Confirm → Contain → Notify → Assess and Recover → Return to Operations); who does what in each phase; the 3-2-1 backup rule; why backups must be offline; RTO and RPO for freight systems; restore testing requirements.

**Objective covered:** #3, #4, #5

**Format:** Playbook read + role-assignment exercise (which phase and action applies to: dispatcher, IT lead, operations manager) + 5-question knowledge check

---

### Lesson 6: Ransom Payment Policy (4 minutes)
**Knowledge base:** kb-08-ransom-payment-policy.md

**Content:** Default policy (no payment); OFAC SDN list obligations; FinCEN SAR obligations under BSA; who has authority to make the payment decision; what to do instead of paying; when and how insurance and legal counsel engage.

**Objective covered:** #7

**Format:** FAQ read + 3-question knowledge check

---

## Assessment

**Module assessment:** 10 questions drawn from the practice question bank (practice-questions.md), covering all seven learning objectives. Passing score: 80% (8/10). Learners who score below 80% are directed to the remediation path.

---

## Remediation Path

Learners who fail the module assessment or are enrolled after a confirmed security incident are directed to:

1. **Remediation card:** remediation-01-ransomware-discovered.md (immediate-action review)
2. **Remediation card:** remediation-02-eld-offline-operations.md (operational continuity review)
3. Re-read the lesson(s) corresponding to missed questions (mapped by question tag to lesson)
4. Retake the 10-question assessment
5. If still below 80% after two attempts: manager notification and one-on-one review session required before retake

---

## Audience and Role Targeting

| Role | Required Lessons | Emphasized Content |
|---|---|---|
| Dispatcher | All | Lessons 2, 3, 5 (operational continuity, response sequencing) |
| Driver | Lessons 1, 3, 4 | ELD-specific content; early warning signs; what to report |
| Fleet Manager | All | Lessons 4, 5, 6 (prevention controls, ELD vendor evaluation, policy) |
| Owner-Operator | All | Full module — no IT backstop; all decisions may fall to them |
| Operations Leadership | All | Lessons 5, 6 (response authority, payment policy, insurance coordination) |
