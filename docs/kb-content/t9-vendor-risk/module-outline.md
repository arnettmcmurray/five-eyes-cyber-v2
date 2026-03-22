---
title: "Third-Party and Vendor Risk in Freight"
module_type: standard
estimated_minutes: 20
displayOrder: 9
topics:
  - Third-Party and Vendor Risk
---

# Module: Third-Party and Vendor Risk in Freight

## Module Purpose

Teach freight operations staff — including owners, dispatchers, AP/AR coordinators, and anyone who manages vendor relationships — how vendor access creates risk, how to vet and monitor vendors, how attackers exploit trusted vendor relationships to commit BEC and cargo theft, and what controls actually stop these attacks. Emphasis on the practical behaviors that work in a small freight operation without enterprise tools.

---

## Learning Objectives

By the end of this module, learners will be able to:

1. Identify which vendors in the freight tech stack hold access to sensitive systems and describe the risk exposure associated with each access type.
2. Apply the minimum vetting requirements before granting any new vendor access to business systems, including identity verification, scope definition, and security attestation.
3. Execute a quarterly vendor access review using a vendor access register, and identify the event-driven triggers that require an immediate access audit outside the scheduled review.
4. Recognize the warning signs that a vendor communication may be compromised and explain why trusted vendor channels make BEC harder to detect than cold-sender attacks.
5. Apply the non-negotiable payment change verification procedure — independent callback to a verified number, dual approval, and call documentation — before processing any vendor payment change.

---

## Module Structure

### Lesson 1: Mapping Vendor Access in Your Freight Operation (3 min)
**KB source:** vendor-risk-01-what-vendors-have-access.md

What vendors in the freight tech stack actually have access to — TMS, ELD portals, load boards, email admin, factoring platforms, payroll, and fuel cards — and why a compromised vendor account is effectively a compromised company account; introduces the vendor access register as the foundational control.

### Lesson 2: Vetting New Vendors Before You Let Them In (4 min)
**KB source:** vendor-risk-02-vetting-new-vendors.md

The six pre-access requirements that apply before any new vendor is granted system access — identity verification, scope definition, security attestation, background screening for admin-level vendors, reference checking, and the written agreement clauses that give you legal recourse if the vendor's security fails.

### Lesson 3: Ongoing Monitoring and Access Offboarding (4 min)
**KB source:** vendor-risk-03-ongoing-vendor-monitoring.md

How to maintain control of vendor access after onboarding through quarterly access reviews, change management for scope expansions, same-day offboarding requirements, shared credential rotation after vendor personnel changes, access logging expectations, and the event-driven triggers that require an immediate audit.

### Lesson 4: BEC Through a Trusted Vendor (4 min)
**KB source:** vendor-risk-04-bec-via-vendor.md

How attackers use compromised vendor accounts to commit payment redirect BEC, fictitious pickup cargo theft via load board account takeover, and multi-client ransomware via MSP compromise — and the specific warning signs in vendor communications that indicate the account may no longer be under the vendor's control.

### Lesson 5: Payment Change Verification — The Rule and the Procedure (3 min)
**KB source:** vendor-risk-05-payment-change-controls.md

The non-negotiable rule for vendor payment changes (independent phone verification to a known-good number, no exceptions), the FinCEN red flags that require heightened scrutiny, the step-by-step verification and documentation procedure, and the role of dual approval in preventing single-point-of-failure payment fraud.

### Lesson 6: Practical Vendor Controls for Small Freight Operations (2 min)
**KB source:** vendor-risk-06-smb-vendor-controls.md

A practical, tool-light policy implementation for five-to-fifty person freight operations — the minimum viable vendor access register, the MFA requirement for all vendor remote access, time-limited access provisioning for project vendors, access notification and logging expectations, and the 30-minute quarterly review ritual.

---

## Assessment

### Practice Questions
Use `practice-questions.md` — 20 scenario-based questions.

**Question distribution:**
- Vendor access mapping and risk identification (Q1–Q3): 3 questions covering which vendor access types carry the highest risk and what a vendor access register must contain
- Vendor vetting decisions (Q4–Q6): 3 questions covering pre-access requirements, acceptable security attestations, and what to do when a vendor cannot meet requirements
- Ongoing monitoring and access review (Q7–Q9): 3 questions covering quarterly review procedures, offboarding timing, shared credential rotation, and event-driven review triggers
- BEC-via-vendor recognition (Q10–Q13): 4 questions covering the three attack patterns, warning signs in vendor communications, and why trusted vendor BEC is harder to catch than cold-sender BEC
- Payment change verification procedure (Q14–Q17): 4 questions covering the correct verification sequence, which phone number to use, dual approval mechanics, and FinCEN red flags
- SMB policy application (Q18–Q20): 3 questions covering practical policy implementation including MFA requirements, time-limited access, and quarterly review responsibility

**Passing score:** 70% (14 of 20 correct)

**Recommended for practice module:** 10 questions weighted toward Lessons 4 and 5 (BEC recognition and payment change verification), as these map to the highest-consequence failure modes.

---

## Remediation Path

Learners who score below 70% should review the lessons corresponding to their missed questions, then retake the assessment.

**Primary remediation targets:**

Missed questions in BEC recognition or payment change verification (Lessons 4–5) — review vendor-risk-04-bec-via-vendor.md and vendor-risk-05-payment-change-controls.md. Key concepts: the callback verification rule, no number from the suspicious email, dual approval mechanics, and urgency as a disqualifier rather than an accelerant.

Missed questions in vetting or monitoring (Lessons 2–3) — review vendor-risk-02-vetting-new-vendors.md and vendor-risk-03-ongoing-vendor-monitoring.md. Key concepts: the six pre-access requirements, same-day offboarding, event-driven review triggers, and shared credential rotation.

**Remediation KB items:**
- vendor-risk-04-bec-via-vendor.md
- vendor-risk-05-payment-change-controls.md
- vendor-risk-02-vetting-new-vendors.md
- vendor-risk-03-ongoing-vendor-monitoring.md
