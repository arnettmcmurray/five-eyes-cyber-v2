---
title: BEC and Payment Protection
module_type: learner-module
estimated_minutes: 25
topics: BEC and Payment Fraud
---

# Module: BEC and Payment Protection

## Module Purpose
Teach finance, AP/AR, and operations staff how business email compromise works in freight, how to recognize it, and what to do when a payment request arrives that does not look right. Emphasis on practical verification behaviors that work under the time pressure of freight operations.

## Learning Objectives
By the end of this module, learners will be able to:
1. Define BEC and identify the freight-specific patterns (factoring redirect, invoice redirect, executive impersonation).
2. Apply the payment change verification rule: no bank detail change by email alone.
3. Execute a callback verification using an independent contact source.
4. Identify BEC indicators: urgency, secrecy, domain inconsistency, first-time requests.
5. Initiate the correct escalation sequence if a fraudulent payment is discovered.

---

## Module Structure

### Lesson 1: What BEC Looks Like in Freight (7 min)
**KB source:** kb-02-bec-in-freight.md, kb-03-freight-bec-map.md

**Core idea:** BEC is not generic phishing. It is a targeted, researched attack that impersonates people and companies your company already does business with. In freight, it appears at every payment handoff: carrier onboarding, invoice processing, factoring payments, fuel advances, and payroll.

**Scenario:** "Your AP team receives an email from 'ABC Carrier Billing <billing@abc-carrier-billing.net>' with a PDF attachment announcing new ACH details for ABC Trucking effective immediately. The PDF looks professional. The amount is a routine carrier settlement. What do you do?"

Discussion: Why does this work? The timing is right. The format matches real notifications. The amount is expected. Only the domain is slightly wrong — but most people do not check the domain on expected emails.

### Lesson 2: The Verification Rule (5 min)
**KB source:** kb-01-payment-change-policy.md, kb-06-dual-approval.md

**Core idea:** One rule applies to all payment changes regardless of how convincing the request looks — no bank detail change is processed without an independent callback to a verified contact.

The verification call must use a number you have on file or from the official website — not from the email. The email is potentially controlled by the attacker.

**Scenario:** Walk through a mock callback verification: "I received a request to update your ACH details. I am calling the number we have on file to confirm. Can you verify that you submitted this change and that account number [XXX] is correct?"

### Lesson 3: Reading BEC Indicators (5 min)
**KB source:** kb-04-bec-indicator-library.md

**Core idea:** The indicators that mark a BEC attempt — urgency, secrecy, domain inconsistency, first-time request, pressure against verification — appear consistently. The more of them present, the more important verification becomes.

**Scenario:** Present an email with several BEC indicators embedded. Have learners identify each one.

### Lesson 4: How Attackers Use Urgency Against You (3 min)
**Core idea:** In freight, urgency is normal. "Hot load," "carrier waiting," "payment due today" — these are real operational pressures. BEC attacks are designed to exploit this. The urgency in a BEC email is constructed to make verification feel dangerous (to the load, to the relationship, to the timeline). It is not.

A real factoring company can wait 15 minutes for you to call and confirm. A fraudulent email cannot afford for you to call.

**The rule:** When urgency is highest, verification is most important — not least important.

### Lesson 5: If Something Already Happened (5 min)
**KB source:** kb-07-already-sent-money.md, kb-05-financial-escalation-tree.md

**Core idea:** Recovery is possible but time-dependent. If a fraudulent payment was made, the first call is to your bank's fraud line — not to your supervisor to wait and see. Every minute of delay reduces recovery probability.

Walk through the escalation sequence and the evidence capture checklist.

---

## Practice Questions
Use `practice-questions.md` — 30 scenario questions covering verification procedures, BEC indicator identification, and escalation sequencing.

**Recommended for practice module:** 10 questions weighted toward Lessons 2 and 3.

## Remediation Path
Learners who score below 70%:
- Review Lesson 2 (verification rule) and Lesson 3 (BEC indicators).
- Key concepts: independent callback, domain check, no urgency bypass.

Remediation KB items:
- kb-01-payment-change-policy.md
- kb-04-bec-indicator-library.md
