---
title: "Patching in a Freight Operation: What to Update, When, and Who's Responsible"
type: training-content
topics:
  - Secure Systems Hygiene
source_trust: T1
freshness_cycle: 6mo
---

# Patching in a Freight Operation: What to Update, When, and Who's Responsible

Unpatched software is the most common reason ransomware succeeds. Before attackers send phishing emails, before they brute-force passwords — many are scanning the internet for known, unpatched vulnerabilities. ENISA's 2025 transport sector threat assessment found ransomware accounts for 83.9% of cybercrime against EU transport organizations. The majority of those attacks did not require novel techniques. They exploited software flaws that already had patches available.

Patching is not glamorous IT work. It is also not optional.

## What Must Be Patched

Any software that connects to a network, handles data, or interacts with business systems is a patch target. For a typical freight SMB, that list includes:

**Operating systems.** Windows and macOS updates are not optional. When Microsoft or Apple releases a security update, attackers have the patch in hand within hours and work backward to identify what it fixes. Unpatched machines become targets within days.

**Browsers.** Chrome, Edge, Firefox, and Safari release security updates frequently. A driver or dispatcher using an outdated browser to log into a load board is running attack surface that the browser vendor already fixed.

**Email clients.** Outlook and other email software have been the entry point for credential theft and malware delivery. Keep them current.

**ELD firmware.** Electronic Logging Devices are networked computers. NMFTA research identified CVE-2024-12054 in ELD systems — a real, registered vulnerability in hardware running in trucks on the road. ELD vendors push firmware updates to address these issues. If your ELD vendor offers an update and you haven't installed it, your trucks may be running known-vulnerable firmware. Confirm with your ELD vendor what their update cadence is and how drivers or fleet managers receive and apply those updates.

**TMS and load board applications.** Desktop TMS clients, web-based load board apps, and carrier portal software all require updates. These connect directly to business systems and financial data.

**Remote access software.** VPN clients, remote desktop clients, and any software used for remote access are high-priority targets. Attackers specifically look for outdated VPN software — multiple major ransomware campaigns have exploited unpatched VPN vulnerabilities for initial access.

## When to Patch: CISA and CIS Guidance

CISA's Cybersecurity Performance Goals (CPG 1.E) set clear expectations: critical vulnerabilities must be patched within 14 days of availability; high-severity vulnerabilities within 30 days. CIS Control 7 frames this as continuous vulnerability management — not an annual event.

For an SMB freight company, "continuous" means: when a vendor releases a security update, it gets applied within 30 days. Critical updates — particularly for remote access software and operating systems — within 14 days.

## Who Patches What

**Company devices (managed by IT or MSP):** Your IT provider or Managed Service Provider is responsible for patching all company-owned equipment — desktops, laptops, servers, and any managed devices. This must be documented in your MSP agreement. "We patch monthly" is not enough. Confirm in writing that the scope includes: Windows and macOS OS updates, third-party applications (browsers, email clients, Adobe Reader, remote access software), and any industry-specific software installed on company devices.

**BYOD (driver-owned phones, personal laptops):** The company cannot push patches to personally owned devices. The policy responsibility shifts: drivers and staff using personal devices for work are responsible for keeping the device OS and applications current. The company is responsible for ensuring that work applications installed on BYOD — TMS apps, ELD driver apps, load board apps — are updated when the vendor releases a new version.

**ELD/telematics:** Vendor-managed firmware updates are the norm. Fleet managers should confirm the update process with each ELD vendor annually and ensure firmware versions are documented.

## The Practical Rule

If a device connects to your business systems, it gets patched within 30 days of a security update. No exceptions for servers that "can't go down" — schedule a maintenance window. No exceptions for driver tablets that are always in the truck — build an update check into the weekly inspection process.

Your MSP agreement should explicitly confirm this standard. If your MSP cannot tell you the last time they patched your systems, or cannot show you a patch status report, that is a gap that needs to be closed before the next incident — not after.
