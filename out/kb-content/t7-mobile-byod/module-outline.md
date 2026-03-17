---
title: Mobile Device and BYOD Security
module_type: topic-module
estimated_minutes: 20
topics:
  - Mobile Device and BYOD Security
---

# Module Outline: Mobile Device and BYOD Security

## Learning Objectives

By the end of this module, learners will be able to:

1. Explain why freight operations are structurally more exposed to mobile-based threats than most industries
2. Identify the specific requirements that apply to their device (company-owned vs. BYOD)
3. Safely install, verify, and maintain freight applications on mobile devices
4. Recognize and respond to ELD anomalies that may indicate a security incident
5. Identify smishing, WhatsApp fraud, and QR code attacks targeting freight workers
6. Execute the correct lost/stolen device response within the required reporting window
7. Select and use appropriate MFA methods for freight platform accounts

---

## Lesson Structure

### Lesson 1 — Why Freight Is Different (5 min)
**Source:** kb-01-byod-risk-in-freight.md
**Format:** Threat brief / reading

Establishes the structural case for mobile security in freight. Covers distributed workforce, owner-operator exposure, BYOD in small brokerages, and the shift from identity fraud to account compromise documented in CargoNet Q1 2025. Connects ELD networked risk (NMFTA CVE-2024-12054, ORBCOMM attack) to the broader mobile risk picture. This lesson is framing — it answers "why does this apply to me" before procedural content begins.

**Key concept to land:** The phone in a driver's or dispatcher's hand is not a personal device doing occasional work tasks. It is the primary access point to systems controlling freight worth tens of thousands of dollars per load.

---

### Lesson 2 — Device Security Requirements (4 min)
**Source:** kb-02-mobile-security-baseline.md
**Format:** Policy / interactive checklist

Learners identify their device type (company-owned or BYOD) and step through the applicable requirements. Checklist format with yes/no self-assessment. Any "no" responses flag a compliance gap learners must resolve before module completion.

**Key concept to land:** BYOD does not mean unmanaged. Screen lock, OS currency, and official app stores apply to personal devices used for freight work.

---

### Lesson 3 — Safe App Installation and Account Hygiene (4 min)
**Source:** kb-03-safe-app-usage.md
**Format:** Training content / scenario-based

Covers how to verify legitimate freight apps, recognize fake app stores or sideloaded APKs, check permissions, and manage passwords across freight platforms. Includes two scenario prompts: (1) a "dispatcher" sends you a link to install an updated TMS app — what do you do? (2) You notice your load board app requesting access to your contacts — what do you do?

**Key concept to land:** Each freight platform account needs a unique password. Credential stuffing attacks mean one stolen password can cascade into multiple account compromises.

---

### Lesson 4 — ELD Security for Drivers and Fleet Managers (4 min)
**Source:** kb-04-eld-telematics-security.md
**Format:** Training content / role-split (driver vs. fleet manager)

Covers the ORBCOMM incident as primary case study. Establishes that ELDs are networked computers with real, registered CVEs (NMFTA research). Driver-facing content focuses on firmware updates, USB hygiene, and anomaly reporting. Fleet manager content covers vendor patch cadence, network segmentation, and paper log fallback.

**Key concept to land:** An ELD showing an unexpected login screen after a rest stop is a reportable event. Drivers are the first line of anomaly detection.

---

### Lesson 5 — Smishing, WhatsApp, and QR Attacks (3 min)
**Source:** kb-05-smishing-mobile-phishing.md
**Format:** Training content / pattern recognition

Pattern-matching lesson: learners see freight-specific examples of smishing (fake DOT texts, fake load offers, fake carrier verification), WhatsApp impersonation scenarios, and QR code attack vectors. For each example, learners identify the red flags and the correct response action.

**Key concept to land:** Urgency + unknown sender + a link or credential request = smishing. Verify through a known number or the original load board — not through anything provided in the suspicious message.

---

### Lesson 6 — Lost/Stolen Device Response (2 min)
**Source:** kb-06-lost-stolen-device.md + remediation-01-lost-device-freight.md
**Format:** Policy + fast-action card

Short scenario: your phone is missing at a truck stop. Walk through the 5-step response in order. Emphasis on the 4-hour reporting window and the parallel actions (changing passwords independently, not waiting for IT to direct every step).

**Key concept to land:** Do not wait to see if it turns up. Report, change passwords, and confirm remote wipe — in that order, immediately.

---

### Lesson 7 — MFA and Authentication for Freight Accounts (2 min)
**Source:** kb-07-mobile-mfa-authentication.md
**Format:** FAQ / knowledge check

FAQ-format review of MFA options with freight-specific context. Covers why authenticator apps are better than SMS codes, what to do when a freight platform doesn't support MFA, and the backup codes requirement. Closes with a three-question knowledge check.

**Key concept to land:** Authenticator app over SMS where available. Backup codes saved outside the phone. One unique password per freight platform.

---

## Assessment Notes

**Practice question bank:** 28 scenario-based questions (see practice-questions.md). Coverage:
- BYOD risk identification: 3-4 questions
- Safe app installation: 3-4 questions
- ELD anomaly recognition and reporting: 4-5 questions
- Smishing and mobile phishing: 4-5 questions
- Lost/stolen device response: 3-4 questions
- MFA and authentication: 3-4 questions
- WhatsApp and QR code fraud: 3-4 questions

**Module passing threshold:** 80% (23/28 correct)

**Question format:** All questions are scenario-based. No vocabulary-test items. Each stem presents an operational situation; learners select the correct response behavior.

**Time limit:** No hard time limit recommended — scenario reading takes variable time. Flag sessions under 4 minutes for review (likely skimming).

---

## Remediation Path

Learners who score below 80% are assigned targeted remediation based on which question clusters they missed.

| Missed cluster | Remediation assigned |
|---|---|
| BYOD risk / device requirements | Re-read kb-01 + kb-02; retake 5-question subset |
| App installation / account hygiene | Re-read kb-03; retake 4-question subset |
| ELD security | Re-read kb-04; retake 5-question subset |
| Smishing / mobile phishing | Re-read kb-05 + remediation-02; retake 5-question subset |
| Lost/stolen device | Fast-action card remediation-01; retake 4-question subset |
| MFA / authentication | Re-read kb-07; retake 4-question subset |
| WhatsApp / QR | Re-read kb-05; retake 4-question subset |

After remediation, learners retake only the failed cluster questions. Full retake required if overall score is below 60%.

---

## Module Dependencies

This module assumes completion of:
- Phishing and Email Security module (understanding of social engineering baseline)
- Password and Account Security fundamentals (if available in curriculum)

This module is a prerequisite for:
- Advanced Freight Fraud Recognition (if in curriculum)
- Incident Response for Freight Operations (if in curriculum)
