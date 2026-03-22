---
title: "What 'Endpoint Protection' Actually Means for a Small Freight Company"
type: training-content
topics:
  - Secure Systems Hygiene
source_trust: T1
freshness_cycle: 6mo
---

# What "Endpoint Protection" Actually Means for a Small Freight Company

If your MSP told you that all your computers have "antivirus," they may be right — and that may still not be enough. Understanding the difference between traditional antivirus and modern endpoint detection changes what you ask for and what you're actually protected against.

## AV vs. EDR: Why the Distinction Matters

**Traditional antivirus (AV)** works by matching files and activity against a database of known-bad signatures. When a new piece of malware appears, security vendors analyze it, add its signature to the database, and push the update to endpoints. AV catches what it has seen before.

**Endpoint Detection and Response (EDR)** takes a different approach. Instead of matching against known signatures, EDR monitors behavior — what processes are running, what files they're accessing, what network connections they're making, whether they're injecting code into other processes. EDR can detect ransomware that has never been seen before, because the behavior of ransomware — encrypting large numbers of files rapidly, calling out to a command-and-control server, disabling backups — looks anomalous even if the specific malware sample is brand new.

This distinction matters because ransomware operators specifically design new variants to evade AV signature detection. Many major freight ransomware incidents involved malware that existing AV did not catch on the day of the attack.

CISA's Cybersecurity Performance Goal 1.F calls for deploying and maintaining endpoint detection capability. CIS Control 10 covers malware defenses and explicitly supports behavioral detection as the current standard.

## What to Require of Your MSP

When reviewing or renewing your MSP agreement, confirm the following:

**EDR, not just AV.** Ask specifically: "Is this EDR or signature-based AV?" If the answer is "it has both," ask which product provides the EDR capability and which endpoints it covers.

**Central management console.** All endpoints should be visible from a single dashboard. This means your MSP can see the security status of every managed device — patch level, last scan, active alerts — without logging into each machine individually. If your MSP cannot show you this dashboard, they don't have the visibility to manage your security.

**Alert response SLA.** If EDR generates an alert at 2 AM, what happens? Ask your MSP for their documented response time for security alerts. "We'll look at it next business day" is insufficient for an active incident.

## Realistic Options for Freight SMBs

Cost is often the first objection to EDR. The SMB market has addressed this:

- **Microsoft Defender for Business** is approximately $3 per device per month and is included in some Microsoft 365 Business Premium plans. It provides EDR capability integrated with the M365 management console — a strong default for shops already on M365.
- **SentinelOne** offers SMB-tier plans through MSP channels. Behavioral detection, automated response, and rollback capabilities are core features.
- **CrowdStrike Falcon Go** is CrowdStrike's SMB entry point, providing the same behavioral detection engine used by large enterprises at a per-endpoint price accessible to small operators.

Managed EDR through an MSP typically bundles the software cost with monitoring — meaning a human reviews alerts and escalates genuine threats. This is the recommended configuration for freight SMBs without in-house security staff.

## Driver Devices and BYOD

Driver devices deserve specific attention. Company-owned driver phones and tablets should have Mobile Device Management (MDM) at minimum. MDM lets you enforce security policies (screen lock, OS updates, approved apps), see the device's compliance status, and remotely wipe it if it's lost or stolen.

For BYOD — personal phones used for freight work — full MDM is typically not practical or legally acceptable because it would give the company visibility into personal data. The minimum requirements for BYOD are:

- Screen lock with PIN or biometric enabled
- OS updated to the current supported version
- Remote wipe capability enrolled (either through a company app or the device's built-in "Find My" / "Find My Device" feature)

The company work application (ELD app, TMS app, load board app) on a BYOD device should be kept current and should not store credentials in the clear.

## Logging: The Invisible Requirement

Endpoint protection is not only about stopping attacks. It is also about seeing what happened when an incident occurs. Without security event logging enabled on endpoints, you cannot reconstruct an attacker's actions after the fact — you cannot tell what was accessed, what was exfiltrated, or where the attacker moved.

Your MSP should confirm that endpoint security event logging is enabled and that logs are retained for a minimum of 90 days.

## Warning Signs of Missing or Broken Protection

These are indicators that your endpoint protection may not be functioning as expected:

- No central dashboard where your MSP can show you all endpoints and their status
- AV or EDR "last updated" more than 7 days ago on any endpoint
- No process for your MSP to alert you when a new device connects to your network
- No way to remotely wipe a lost or stolen device
- No alert was generated when a known-bad test file was run (ask your MSP about EICAR test files)
- Your MSP has never shown you a security alert or incident report — not because there are none, but because they don't review them

If you are uncertain about your current coverage, ask your MSP to produce a one-page endpoint protection status report covering: EDR deployment status, last update date, any active alerts in the past 30 days, and remote wipe capability confirmation for managed devices.
