---
title: "Evidence Preservation: What Not to Touch and Why"
type: training-content
topics:
  - Incident Reporting & Response
source_trust: T0
freshness_cycle: 12mo
---

# Evidence Preservation: What Not to Touch and Why

The first 30 minutes of an incident are often when the most evidence gets destroyed. Not by the attacker — by the people trying to stop them.

## The Most Common First Mistake

A dispatcher notices something wrong on a shared terminal — a ransom note, an unfamiliar program running, login activity they did not trigger. Their first instinct is to power it off. They think shutting the machine down stops the attack.

It does stop the attack. It also destroys the attacker's tools, their access credentials, their command history, and their network activity logs — all of which lived in RAM (volatile memory) and did not survive the power cycle. Investigators arrive to find a machine with no useful forensic content. The inquiry stalls.

**Do not turn off an affected system without explicit direction from IT or a cybersecurity professional.**

## What to Preserve

Every category below is evidence. Treat it accordingly.

- **System logs:** Application logs, security event logs, Windows Event Viewer entries, Linux syslog. These record what happened, when, and under which account.
- **Email headers and message content:** Do not delete the suspicious email. Forward it to IT with full headers intact. The sending server, routing path, and metadata identify the attacker's infrastructure.
- **Network flow data:** Your network logs record which systems communicated with which external addresses. This identifies data exfiltration and attacker command-and-control.
- **Screenshots of what you observed:** Before you do anything else — before you click, close, or escalate — take a screenshot of what you see on screen. Every screen. Timestamp visible if possible.
- **Your own written record:** On paper if necessary. Write down the exact time you first noticed something, what you were doing, what the system showed, and every action you took. Include your name. This becomes part of the chain of custody if law enforcement is involved.

## Chain of Custody

If law enforcement becomes involved — FBI on a BEC fraud, state police on cargo theft — they will ask who touched the affected systems and in what order. Chain of custody documentation tracks this. If you cannot answer those questions accurately, digital evidence may be inadmissible. Keep the circle small: only people who absolutely need access to the affected systems should touch them.

## Physical Evidence

If you find an unauthorized USB drive, a device plugged into a network port, or any unfamiliar hardware connected to a system:

- Do not remove it
- Photograph it in place, showing the device, the port, and enough of the surrounding environment to establish location
- Then call IT

## Freight-Specific Evidence That Gets Lost

- **ELD logs** — if the ELD device is rebooted before logs are exported, the activity record for the period in question may be gone
- **TMS audit logs** — if the TMS is shut down in a panic or the session is cleared, the audit trail showing who accessed which records and when may not be recoverable
- **Email headers** — deleting the suspicious email from your inbox removes the forensic value. IT needs the original in place.

## What You Can and Cannot Do

| Action | Permitted? |
|---|---|
| Take screenshots of what you see | Yes |
| Write down the time and your observations | Yes |
| Call IT/security immediately | Yes |
| Alert your supervisor | Yes |
| Forward suspicious email to IT with headers | Yes |
| Open files to investigate on your own | No |
| Run an antivirus scan to "clean" it | No — this destroys forensic artifacts |
| Reboot or power off the system | No — destroys volatile memory |
| Delete anything related to the incident | No |

The investigation happens after the evidence is secured. Your job in the first 30 minutes is to observe, document, and call IT. Let the professionals make the decisions about what to touch next.
