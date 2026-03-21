# Flagship Scenario: Compromised at the Perimeter (Executive Edition)

## Purpose
Demonstrate the "Five Eyes" signature theme: physical security failures directly enable cyber compromise.

## Executive Goals & Objectives
- **Convergence**: Break the false separation between cyber and physical security domains.
- **Oversight**: Test access controls, logging, and contractor oversight.
- **Investigation**: Assess investigation readiness across IT and Facilities.

## Expected Participants
- Facilities / Operations Manager (Role: Facilities)
- IT / Security Leadership (Role: Security)
- Physical Security Lead (Role: Physical)
- HR / Legal (Role: Legal/HR)
- Executive Sponsor (Role: Executive)

## Scenario Overview
A contractor with temporary access connects an unauthorized device and leaves without detection. Weeks later, systems begin failing—and no one initially connects the dots.

---

## Section 1: Introduction & Initial Access
**Background**: A routine HVAC maintenance survey requires extended access to the server room wing.

### Step 1.1: The Briefing
- **Facilitator Narrative**: "It is Monday morning. An HVAC contractor from 'AirFlow Solutions' has requested after-hours access to the East Wing server room for a routine energy audit. The request was approved by a manager who is currently on PTO. No escort has been assigned."
- **Participant Situation Room**: "Briefing: HVAC energy audit scheduled for East Wing server room tonight. Note: No escort available due to staffing shortage."
- **Participant Prompts**:
  - Does the current access policy allow for unescorted contractor access to a Top Secret (TS) server room?
  - Who is the designated 'Site Owner' responsible for this access window?
- **What Good Looks Like**: Identification of the policy violation (unescorted access to a high-security zone) and an immediate request for a standby escort or rescheduling.
- **Consequence Note**: If participants allow access, Phase 2 will feature more severe malware beaconing.

---

## Section 2: Discovery & Indicators
**Background**: Two weeks have passed. IT Security monitoring systems detect unusual activity.

### Step 2.1: The First Signal
- **Facilitator Narrative**: "It is now Tuesday, two weeks later. A network analyst identifies a series of 'low-and-slow' encrypted beacons originating from a legacy database server in the East Wing. The destination is an unknown IP address in a high-risk jurisdiction."
- **Inject Triggers**: **IT-CYBER-01** (Beaconing detected on 10.0.8.21).
- **Participant Situation Room**: "ALERT: Unusual outbound traffic detected from DB-SERVER-04."
- **Participant Prompts**:
  - Is this server supposed to have external internet access?
  - What is the first step in your Incident Response (IR) playbook for 'Suspicious Beaconing'?
- **What Good Looks Like**: Immediate isolation of the server and a request for badge-access logs for the East Wing wing over the last 14 days.

### Step 2.2: The Physical Link
- **Facilitator Narrative**: "The badge logs show that the HVAC contractor from two weeks ago remained in the East Wing for 4 hours longer than the scheduled maintenance window. A physical inspection of the server rack reveals a small, unauthorized Raspberry Pi device connected to a secondary maintenance port."
- **Inject Triggers**: **IT-PHYS-01** (Rogue Device Found).
- **Participant Situation Room**: "PHYSICAL SECURITY UPDATE: Rogue hardware found in East Wing Rack 4B. Badge ID 'AFS-992' remained on-site until 11:30 PM on the night of the audit."
- **Participant Prompts**:
  - Who owns the investigation now: IT, Facilities, or the Physical Security Lead?
  - At what point do you notify the vendor (AirFlow Solutions) of the breach?
- **What Good Looks Like**: Recognition that this is a multi-domain incident. Formation of a joint IT-Physical investigation team.

---

## Section 3: Escalation & Mitigation
**Background**: The breach is confirmed; the adversary is actively exfiltrating data.

### Step 3.1: The Decision
- **Facilitator Narrative**: "Legal and HR are now involved. The contractor has been identified as a 10-year veteran of the vendor. Media inquiries are beginning to trickle in regarding 'unexpected system outages' in the voter registration portal."
- **Inject Triggers**: **MED-CYBER-01** (News inquiry about 'system lag').
- **Participant Situation Room**: "DISCLOSURE ALERT: State statute requires notification of PII breach within 48 hours of confirmation. The clock has started."
- **Participant Prompts**:
  - Do you shut down the voter registration portal to prevent further loss, even if it creates a public panic?
  - How do you balance 'Dignity of the Executive' versus 'Speed of Investigation' if the contractor was approved by senior leadership?
- **What Good Looks Like**: Prioritizing containment over public perception. Formal notification of law enforcement.

---

## Action Catalog (AAR Output Shape)
- **Action 1**: Update 'Escorted Access Policy' for all Tier-1 server rooms.
- **Action 2**: Implement cross-domain log correlation (Badge Access + Network Telemetry).
- **Action 3**: Audit all third-party maintenance contracts for 'Five Eyes' high-security clauses.

## KB Grounding
- **Primary Source**: [Five Eyes Access Control Policy v2](file:///kb/items/access-control-v2)
- **Secondary Source**: [Incident Response Playbook: Rogue Hardware](file:///kb/items/ir-rogue-hardware)
- **Legal Context**: [State Data Breach Notification Statute](file:///kb/items/legal-disclosure-48hr)
