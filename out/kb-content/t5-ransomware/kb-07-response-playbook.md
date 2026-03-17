---
title: Ransomware Response Playbook
type: policy
topics:
  - Ransomware & Operational Resilience
source_trust: T0
freshness_cycle: 6mo
---

# Ransomware Response Playbook

Speed and correct sequencing determine outcomes in ransomware response. The decisions made in the first hour have more impact on recovery time and total damage than anything that happens afterward. This playbook defines who does what, in what order, and why.

---

## Phase 1: Detect and Confirm (0–15 Minutes)

**Goal:** Determine whether the incident is ransomware or a system error. Do not begin containment procedures for a network outage. Do not dismiss a ransomware incident as a network outage.

**Who confirms:**
IT operations lead or designated security contact makes the determination based on observed indicators — ransom note on screen, files with unfamiliar extensions, encrypted network shares, or confirmed security tool alerts. If IT cannot be reached immediately, the operations manager initiates Phase 2 based on what they observe while continuing to attempt IT contact.

**Who makes the isolation decision:**
IT operations lead makes the isolation call. Operations manager has authority to begin network isolation for clearly affected workstations if IT cannot be reached and active encryption is visually confirmed (files changing in real time, ransom note displayed).

**Do not:**
- Do not turn off any affected systems
- Do not attempt to open or recover encrypted files
- Do not broadcast the incident to staff before leadership is notified

---

## Phase 2: Contain (15–60 Minutes)

**Goal:** Stop the spread. Ransomware that is still running will continue encrypting. Every minute of delay increases the scope of damage.

**Steps:**

1. **Isolate affected systems from the network.** Unplug ethernet cables from affected workstations. Disable Wi-Fi. If systems are on a managed switch, IT may be able to disable ports remotely — this is faster at scale than physical disconnection.

2. **Do not turn off systems without IT direction.** Powered systems retain forensic evidence in memory. Forensic investigators need that information. Exception: if IT explicitly instructs shutdown, comply immediately.

3. **Map affected vs. clean systems.** IT leads this effort. Operations staff assist by identifying which workstations and shared drives are behaving abnormally. Document the list. Clean systems that have been identified and isolated from the affected segment may be used for continued operations.

4. **Initiate offline operations immediately.** Do not wait for containment to complete before starting offline procedures. While IT contains the incident, operations activates:
   - Paper-based dispatch using physical BOLs
   - Driver phone tree for check-in and load status
   - Manual HOS log procedures for affected drivers

---

## Phase 3: Notify (First Hour)

**Goal:** Get the right people informed so decisions can be made with authority. Notifications happen in sequence — internal first, then external based on scope assessment.

**Internal notifications (in order):**
1. IT operations lead (if not already involved)
2. Operations leadership / executive decision-maker
3. Legal counsel

**External notifications (based on scope and leadership direction):**
- **Cyber insurance carrier:** Notify as soon as possible. Coverage may require notification within a defined timeframe. The insurer can provide pre-approved incident response vendors, reducing decision time.
- **FBI Internet Crime Complaint Center (IC3) / law enforcement:** Reporting is voluntary but strongly encouraged. Law enforcement has intelligence on ransomware groups that may assist with attribution and recovery options.
- **CISA:** For incidents with significant operational impact, CISA can provide technical assistance and threat intelligence coordination.

**Do not notify customers, shippers, or partners until:**
- Scope of the incident is understood
- Legal has been consulted on disclosure obligations
- Leadership has approved external communication

Premature external disclosure before scope is known creates additional liability and may not accurately represent the situation.

---

## Phase 4: Assess and Recover

**Goal:** Establish recovery path and begin restoration from a position of verified information.

**Steps:**

1. **Engage incident response firm.** Have a pre-selected IR vendor under retainer or on a short list before an incident occurs. Waiting to identify an IR firm during an active incident adds hours to the response timeline. The cyber insurance carrier will often have pre-approved vendors.

2. **Assess backup integrity before starting recovery.** Do not begin restoration from backup until the backup's integrity and isolation status is confirmed. If backups were on the same network segment as encrypted systems, assume they may also be encrypted. Attempt a test restore to verify backup viability before committing to a recovery path.

3. **Do not pay ransom without engaging legal and insurance first.** See the ransom payment policy (kb-08) for full guidance. Payment decisions require legal review of OFAC obligations and insurance coordination. This decision is never made by operations staff.

---

## Phase 5: Return to Operations

**Goal:** Restore systems cleanly, verify integrity, and resume operations with confidence that the attack vector has been addressed.

**Steps:**

1. **Restore from known-clean backups.** IT leads restoration. Verify each system before reconnecting it to the network. A restored system that is reconnected before the original attack vector is closed can be reinfected immediately.

2. **Verify systems before reconnecting to the network.** Each restored system should be scanned by endpoint protection tools and confirmed clean before network reconnection. IT makes this determination.

3. **Conduct post-incident review within 2 weeks of full restoration.** The review must address: how did the attacker get in, what could have detected it earlier, what worked in the response, and what needs to change. Review findings feed into control improvements and updated training.

---

## Pre-Incident Requirements

This playbook only functions if the following are in place before an incident:

- Current IT and security contact numbers stored offline (not just in email or TMS)
- Cyber insurance carrier contact information accessible outside encrypted systems
- IR vendor pre-selected and contact information documented
- Paper BOLs and log books physically present in all cab locations
- All staff have completed ransomware response training and know their role in Phases 1–2
