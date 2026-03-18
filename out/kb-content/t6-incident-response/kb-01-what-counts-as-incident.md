---
title: "What Counts as a Cyber Incident: Definitions and Thresholds"
type: training-content
topics:
  - Incident Reporting & Response
source_trust: T0
freshness_cycle: 12mo
---

# What Counts as a Cyber Incident: Definitions and Thresholds

Freight operations run on speed. That speed kills incident response when employees dismiss something unusual as a glitch and move on. By the time the real scope is clear, evidence is gone and the recovery window has closed.

NIST SP 800-61r3 defines a cybersecurity incident as "a violation or imminent threat of violation of computer security policies, acceptable use policies, or standard security practices." That definition is intentionally broad. In freight operations, the threshold problem runs in the opposite direction — employees routinely underreport because they are not sure whether something "counts."

## What Always Counts — Report Immediately

These are incidents, not guesses. Escalate now.

- **Ransomware or encryption event** — any system that locks you out with a demand
- **Account compromise** — your login credentials used by someone else, or an account you didn't create appearing in your system
- **Unauthorized data access** — someone accessed customer, carrier, or shipment records without authorization
- **Successful phishing with credential entry** — you or a colleague entered a username and password on a site that turned out to be fake
- **BEC wire fraud attempt** — you received instructions to change payment details for a load or invoice, whether or not the wire was sent
- **Carrier identity theft** — someone is using your USDOT number, MC authority, or company name to book loads you never accepted

## What Might Count — Escalate and Let IT Decide

Do not sit on these. Get eyes on them.

- Unusual login patterns: someone accessed your TMS or load board account from a location you don't recognize
- Failed MFA challenges from unexpected cities or countries — especially multiple failures in a short window
- ELD anomalies that cannot be explained by a driver action or routine software update
- Unexpected changes to carrier profiles, payment routing information, or user permissions — especially changes made at odd hours

## What Usually Does Not Count

- Spam email that arrived in your inbox and was not clicked or opened
- Routine maintenance windows that were announced in advance
- Your own forgotten password requiring a reset

## The Operational Rule

When in doubt, report it. A false alarm costs your IT team 20 minutes. An undetected incident costs your operation weeks of recovery, possible regulatory exposure, and customer relationships that may not survive.

**Freight-specific examples:**

A driver receives a message through DAT directing them to submit documentation through a different payment portal with an unfamiliar URL. This is suspicious — report it to IT and your supervisor before doing anything with the link.

Your TMS shows a carrier record was modified at 2am by an admin account username you do not recognize. This is an incident. Stop what you are doing and call IT immediately — do not continue working in the system while an unauthorized account may still be active.

Reporting early preserves options. Reporting late eliminates them.
