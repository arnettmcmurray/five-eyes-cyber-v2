---
title: "ELD and Fleet Telematics: The Ransomware Attack Surface"
type: threat-brief
topics:
  - Ransomware & Operational Resilience
source_trust: T1
freshness_cycle: 90d
---

# ELD and Fleet Telematics: The Ransomware Attack Surface

An ELD is not a logbook with a screen. It is a networked computer with firmware, cellular connectivity, GPS hardware, and integration into carrier dispatch systems and FMCSA's backend infrastructure. It can be reached remotely. It can be updated remotely. And like any networked computing device, it has vulnerabilities — ones that researchers have found, documented, and cataloged.

## What an ELD Actually Is (From a Security Perspective)

FMCSA-certified ELDs must connect to the commercial motor vehicle's engine control module, record engine data, and transmit HOS records on demand to roadside inspectors. To do this, they communicate over cellular networks, connect to carrier TMS backends, and in many implementations receive firmware and configuration updates over the air.

Each of those connections is an attack surface. Cellular communication can be intercepted or spoofed. Backend integrations can be compromised through the carrier's network. Over-the-air update mechanisms, if not properly authenticated, can be used to deliver unauthorized firmware.

## The ORBCOMM Incident

In September 2023, a ransomware attack against ORBCOMM — one of the largest providers of ELD and fleet telematics services in North America — took ELD systems offline across multiple major carriers for approximately three weeks. Drivers could not record Hours of Service electronically. Fleet managers lost real-time location and status visibility across their entire operated fleets. FMCSA issued temporary regulatory exemptions to give affected carriers time to restore compliance.

The attack demonstrated that ELD disruption is not theoretical. A single provider being compromised created compliance and operational problems at scale, across carriers who had no involvement in the attack and no warning it was coming.

## Real Vulnerabilities, Real Research

NMFTA (National Motor Freight Traffic Association) security researchers have actively investigated ELD device security. Their work has resulted in documented vulnerabilities in ELD hardware and firmware — including CVE-2024-12054, a cataloged vulnerability in ELD systems. The existence of formal CVE assignments for ELD vulnerabilities means these systems are taken seriously as attack targets by both researchers and attackers.

The specific technical details of these vulnerabilities are not appropriate for this training context — the defensive takeaway is that ELD vulnerabilities are real, are being researched, and are being cataloged. When your ELD vendor issues a firmware update, that update may be closing a real security gap.

## Attack Scenarios

**Ransomware spreading from carrier network to ELD backend.** If ELD management systems are on the same network as other carrier systems — TMS, email, accounting — ransomware that enters through any one of those systems can potentially reach ELD management infrastructure. When ORBCOMM's systems were encrypted, the impact cascaded to every carrier using their platform.

**Unauthorized firmware delivered over the air.** ELDs that accept firmware updates without strong cryptographic verification of the update source could potentially receive malicious firmware. A compromised firmware load could alter HOS records, disable the device, or provide remote access to an attacker.

**ELD data manipulation.** HOS records that can be altered — either through compromised devices or compromised backend systems — represent both a compliance risk and a potential liability for drivers and carriers. FMCSA takes HOS data integrity seriously.

## How Drivers Can Help

Drivers are the first line of observation for ELD anomalies. When something is wrong with an ELD, drivers notice it first.

- **Keep ELD firmware updated when prompted.** If the device indicates a firmware update is available through a legitimate prompt, follow the vendor's process. Vendors release updates to address security vulnerabilities, not just add features.
- **Report unusual ELD behavior immediately.** Frequent unexpected disconnections from the carrier backend, new login prompts that weren't there before, unexpected alerts or messages on the device screen, or changes in how the device records time should all be reported to dispatch and fleet management — not ignored or worked around.
- **Do not connect unauthorized devices to the ELD port.** The ELD port is a regulated interface. Connecting unauthorized devices — including personal chargers or data cables — can introduce security risks that the device's manufacturer did not account for.

## For Fleet Managers

ELD vendor selection has a security component that should be part of procurement evaluation.

- **Evaluate vendor patch cadence.** How quickly does the vendor release firmware updates when vulnerabilities are discovered? How are updates delivered and authenticated? Vendors who cannot answer these questions clearly are vendors whose security practices are not mature.
- **Segment ELD systems from corporate IT networks.** ELD management systems — the backend servers that receive data from devices — should not be on the same network segment as corporate email and TMS servers. If they are, a compromise of any system becomes a potential compromise of all systems.
- **Have a contingency plan for ELD failure.** The ORBCOMM incident showed that even carriers who did nothing wrong found themselves without ELD capability for weeks. Paper log procedures should be documented, log books should be in every cab, and drivers should know how to complete paper logs correctly before they need to do it under pressure.
