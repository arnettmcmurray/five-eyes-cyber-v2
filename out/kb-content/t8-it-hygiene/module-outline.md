---
title: "Secure IT Hygiene for Freight Operations"
module_type: standard
estimated_minutes: 20
displayOrder: 8
topics:
  - Secure Systems Hygiene
---

# Module Outline: Secure IT Hygiene for Freight Operations

## Module Purpose

Equip freight company owners, office managers, dispatchers, and MSP contacts with the practical knowledge to evaluate and improve their company's baseline IT security posture. This module covers the controls that close the most common attack paths documented in freight ransomware and compromise incidents — patch management, remote access, endpoint protection, admin account separation, and MSP accountability. Learners who complete this module can hold a meaningful quarterly security conversation with their IT provider and identify gaps before an attacker finds them.

---

## Learning Objectives

By the end of this module, learners will be able to:

1. Identify which systems in a freight operation require patching, who is responsible for patching them, and what the required timelines are under CISA CPG 1.E and CIS Control 7 guidance.
2. Apply the three remote access rules (no direct RDP, MFA required, vendor access time-limited and logged) to evaluate or configure their company's remote access setup.
3. Distinguish between traditional antivirus and EDR, and specify the minimum endpoint protection requirements to demand from an MSP.
4. Demonstrate admin account separation by identifying which accounts in a freight operation should be separated and what "separate" means in practice.
5. Use the 12-control SMB checklist to conduct a quarterly security review with an MSP or IT provider and document the results.

---

## Lesson Structure

### Lesson 1 — The Threat Picture: Why Freight SMBs Get Hit (3 min)
**Source:** it-hygiene-06-threat-brief-smb-attacks.md

Establishes the operational threat context before procedural content begins. Covers ENISA 2025 ransomware prevalence data, IBM X-Force transportation targeting, and the three attack chains common in freight SMB incidents (exposed RDP, phishing + admin credential theft, compromised MSP/vendor access). Answers "why does this apply to me" with freight-specific data. Learners who understand the attack pattern are more motivated to apply the controls that follow.

---

### Lesson 2 — Patching: What, When, and Who (4 min)
**Source:** it-hygiene-01-patch-management.md

Covers the full scope of patching in a freight operation: OS, browsers, email clients, ELD firmware, TMS applications, and remote access software. Establishes the CISA CPG 1.E timelines (critical within 14 days, high within 30 days) and the CIS Control 7 continuous-management framing. Addresses the BYOD/company-device split and what to demand from an MSP patch agreement. Includes ELD firmware context from NMFTA research (CVE-2024-12054).

---

### Lesson 3 — Remote Access: Closing the Biggest Door (4 min)
**Source:** it-hygiene-02-remote-access-security.md

Focuses on RDP exposure as the primary ransomware entry point for freight SMBs and establishes the three rules: no direct RDP, MFA on all admin remote access, vendor access time-limited and logged. Covers implementation options appropriate for freight SMB scale (Microsoft Entra ID Conditional Access for M365 environments, WireGuard/OpenVPN for others). Addresses NIST SP 800-82 Rev.3 guidance on OT-adjacent systems including ELD management consoles and telematics dashboards. Closes with the audit trail requirement — who connected, from where, when, and what they did.

---

### Lesson 4 — Endpoint Protection: EDR vs. AV and What to Ask Your MSP (4 min)
**Source:** it-hygiene-03-endpoint-protection.md

Explains the behavioral detection distinction between EDR and signature-based AV, why the difference matters for novel ransomware, and what CISA CPG 1.F requires. Provides specific SMB-accessible EDR options (Defender for Business, SentinelOne, CrowdStrike Falcon Go) and the questions to ask when reviewing an MSP contract. Covers mobile device management for driver devices, BYOD minimums, and the logging requirement. Includes practical warning signs of missing or broken protection.

---

### Lesson 5 — Admin Account Separation: One Account, One Purpose (3 min)
**Source:** it-hygiene-04-admin-accounts-privilege.md

Addresses the most underimplemented control in freight SMB environments: privilege separation. Explains the attack consequence of combined admin and daily-use accounts, the principle of least privilege (CIS Control 5, CISA CPG 1.G), and the specific separation required in freight operations (TMS admin vs. dispatcher, email admin vs. staff email, load board admin vs. daily broker login). Covers shared admin credential prohibition, vendor account requirements, driver device local admin rights, and the non-negotiable MFA requirement for all admin accounts.

---

### Lesson 6 — The Quarterly Checklist: Holding Your MSP Accountable (2 min)
**Source:** it-hygiene-05-smb-security-checklist.md

Presents the 12-control SMB freight security checklist as a practical tool for quarterly MSP review conversations. Explains how to use each item — what "done" looks like, what documentation to request, and what an inability to confirm means. Frames the checklist not as a compliance exercise but as the minimum conversation a freight company owner should be able to have with their IT provider every quarter.

---

## Assessment

**Practice question bank:** 20 scenario-based questions (see practice-questions.md)

**Question distribution:**
- Patch management decisions (4 questions): Bloom's Apply and Analyze — scenarios requiring learners to determine what needs patching, who is responsible, and whether a given patch cadence meets standards.
- Remote access policy application (4 questions): Bloom's Apply — scenarios presenting specific remote access configurations and asking learners to identify what is non-compliant and what corrective action to take.
- Endpoint protection choices (4 questions): Bloom's Recognize and Apply — scenarios distinguishing AV from EDR, evaluating MSP claims, and identifying warning signs of missing protection.
- Admin account separation (4 questions): Bloom's Apply and Analyze — scenarios involving specific freight account configurations and requiring learners to identify which configurations violate privilege separation.
- SMB checklist application (4 questions): Bloom's Apply — scenarios presenting quarterly review situations and requiring learners to identify which checklist items are not confirmed as complete and what that means.

**Module passing threshold:** 80% (16/20 correct)

**Question format:** All questions are scenario-based ("You are an owner-operator / dispatcher / MSP contact and..."). No vocabulary definitions. No abstract framework knowledge tests.

**Time guidance:** Expected completion 12–15 minutes for the assessment. Sessions completed under 5 minutes should be flagged for review.

---

## Remediation Path

Learners who score below 80% are assigned targeted remediation based on which question clusters they missed.

| Missed cluster | Remediation assigned |
|---|---|
| Patch management | Re-read it-hygiene-01; complete remediation-01-my-msp-update.md |
| Remote access policy | Re-read it-hygiene-02; complete remediation-02-exposed-rdp.md |
| Endpoint protection | Re-read it-hygiene-03; retake 4-question subset |
| Admin account separation | Re-read it-hygiene-04; retake 4-question subset |
| SMB checklist application | Re-read it-hygiene-05; retake 4-question subset |

After targeted remediation, learners retake only the failed cluster questions. A full module retake is required if the overall score is below 60%.

---

## Module Dependencies

This module assumes completion of:
- Phishing and Social Engineering module (foundational understanding of social engineering and initial access tactics)
- Password and Account Security module (MFA concepts assumed as background knowledge)

This module is a prerequisite for:
- Ransomware and Operational Resilience (if in curriculum) — patch management and EDR concepts are foundational to ransomware prevention
- Incident Response for Freight Operations (if in curriculum) — logging and MSP accountability concepts support IR readiness
