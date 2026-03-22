---
title: "ELD and Telematics Security: What Drivers Can Do"
type: training-content
topics:
  - Mobile Device and BYOD Security
source_trust: T1
freshness_cycle: 90d
---

# ELD and Telematics Security: What Drivers Can Do

Your ELD is not a logbook with a screen. It is a computer — running firmware, maintaining a cellular connection to your carrier's fleet management platform, receiving software updates over the air, and in some configurations, connecting to your tractor's diagnostic bus. It has the same attack surface as any other networked device. That means it has the same vulnerabilities.

## This Is Not Theoretical

NMFTA researchers — researchers specifically focused on freight industry security — have discovered and formally registered vulnerabilities in ELD systems. CVE-2024-12054 is one example. These are real, cataloged vulnerabilities in devices that are sitting in hundreds of thousands of commercial trucks right now. The research community that protects freight infrastructure knows this is a problem. That knowledge should reach drivers too.

The clearest proof of what's at stake is what happened to ORBCOMM customers in September 2023. Ransomware reached ELD systems through fleet networks. Systems went offline across major carriers — not for hours, but for three weeks. Drivers couldn't update HOS records electronically. Entire fleets had to revert to paper logs. FMCSA issued emergency exemptions because carriers couldn't comply with electronic recording requirements through no fault of their own. Fleet operators lost real-time visibility across their entire operation.

An ELD outage isn't just an IT problem. It's a DOT compliance problem, an operational problem, and a customer credibility problem — simultaneously.

## What Drivers Can Do

**Apply firmware updates when prompted.** When your ELD or its companion app prompts you for a firmware update, don't dismiss it or defer it indefinitely. Updates ship security fixes. Vendors issue firmware patches when vulnerabilities are discovered — staying on old firmware means staying on versions with known weaknesses. If you're unsure whether an update is legitimate, call your fleet manager before dismissing it.

**Don't connect unauthorized USB devices to your ELD.** The ELD port is a data port, not just a power outlet. An attacker who gains physical access to your truck — at a rest stop, a drop yard, or during a relay — can use a malicious USB device to compromise the ELD. Only connect devices your carrier has issued and approved for use with the ELD.

**Know what normal looks like.** Anomaly detection starts with you. If your ELD:

- Shows a login screen it has never shown before
- Asks for credentials it didn't ask for in the past
- Displays error messages you haven't encountered on this equipment
- Reports GPS location data that doesn't match where you are
- Shows HOS entries that don't match what you logged

...these are reportable events, not minor glitches to ignore. Unusual ELD behavior after a rest stop, a service appointment, or a driver handoff warrants a call to your dispatcher.

**What to report and to whom.** If your ELD starts behaving differently — unexpected prompts, unfamiliar screens, data that doesn't match your entries — call your dispatcher immediately and describe exactly what you're seeing. Don't troubleshoot it yourself, don't dismiss the prompt, and don't assume it's a routine software update you forgot about. Your dispatcher can contact the ELD vendor's support line and verify whether any updates were pushed to your device.

## For Fleet Managers

The ORBCOMM incident made clear that ELD vendor security practices are a vendor selection criterion, not an afterthought. When evaluating or renewing ELD vendor contracts:

- Ask how quickly the vendor issues firmware patches after vulnerabilities are discovered. A vendor with no security patch cadence is a vendor whose products will accumulate unpatched CVEs.
- Ensure ELD network traffic is segmented from corporate IT networks where technically feasible. The ransomware that reached ORBCOMM systems traveled through connected fleet networks — segmentation limits blast radius.
- Establish a named security contact at your ELD vendor. When a vulnerability is disclosed, you need a direct line to someone who can tell you your exposure status and timeline for remediation.
- Maintain paper log capability as a fallback. The ORBCOMM incident forced paper log reversion on short notice. Drivers who haven't touched paper logs in years faced compliance challenges. Periodic paper log practice is not obsolete.

The driver sitting in that cab is the first line of anomaly detection for ELD security. They need to know what normal looks like — and what to do when it doesn't.
