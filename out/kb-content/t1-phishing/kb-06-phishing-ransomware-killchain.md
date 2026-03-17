---
title: Phishing to Ransomware: The Three-Step Kill Chain
type: threat-brief
topics: Phishing and Email Security
source_trust: internal
---

# Phishing to Ransomware: The Three-Step Kill Chain

Most ransomware attacks in small and mid-size businesses start with a phishing email. This brief explains how a single click escalates to a company-wide encryption event — and what the attacker is doing between the click and the ransom demand that you may never see.

## Why This Matters for Freight

Ransomware that encrypts a manufacturing company's design files is serious. Ransomware that encrypts a freight company's dispatch system, TMS, and communication tools means trucks go dark, loads cannot be tracked or tendered, customers cannot be contacted, and billing stops. The FBI and FTC have documented ransomware costs for small businesses averaging millions of dollars, with recovery times measured in weeks.

For freight, the threat is not just data loss. It is operational paralysis.

## Step 1 — The Phishing Email (The Door)

An employee receives an email that looks legitimate: a load board alert, an invoice, a carrier compliance notice, or a driver portal reset. The email contains a link or an attachment.

- If it is a link, it leads to a page that steals credentials (login and password) or directly downloads malware.
- If it is an attachment (PDF, Word document, ZIP file), opening it executes code that installs malware silently.

The employee may notice nothing unusual. The email may close normally. The download may appear to be a legitimate file. The malware is now installed.

## Step 2 — Reconnaissance and Lateral Movement (The Expansion)

This phase often takes days or weeks. The attacker is not in a hurry. The malware on the compromised machine does several things:

**Harvests credentials** — It captures login information for anything accessed on the infected machine: TMS logins, load board credentials, email passwords, VPN access, admin portals.

**Maps the network** — The malware scans for other devices, file shares, backup systems, and domain controllers on the same network.

**Moves laterally** — Using the harvested credentials, the attacker accesses additional systems, installs malware on more machines, and identifies backup locations.

**Exfiltrates data** — Sensitive files — customer records, employee data, financial records — are quietly copied out before encryption begins. This enables "double extortion": pay for decryption, and pay again to prevent the stolen data from being published.

**Disables backups** — If backups are connected to the network, the attacker deletes or encrypts them before triggering the ransomware payload. This is why offline, disconnected backups are critical.

At this stage, every minute without detection is an advantage for the attacker.

## Step 3 — Encryption and Ransom Demand (The Lock)

The attacker triggers the encryption payload. Files across the network are encrypted simultaneously. Systems begin crashing or showing ransom notes. This is the first moment most organizations realize something is wrong — but the attacker has been inside for days.

The ransom note appears on screens across the company demanding payment in cryptocurrency in exchange for decryption keys.

**At this point:**
- Dispatch may have no access to TMS.
- Communications may be down or compromised.
- Backup systems may already be encrypted.
- Customer and driver records may be inaccessible.
- The attacker may already have exfiltrated sensitive data.

Recovery without backups — paying or not paying — is measured in days to weeks. Average freight company ransomware incident cost: over $5 million when accounting for downtime, recovery, regulatory exposure, and lost business.

## The Point of This Brief

The phishing email in Step 1 is the entire prevention opportunity. Once the malware is installed, the organization is in a recovery scenario. The training goal is to make that click not happen.

Three behaviors stop the kill chain at Step 1:
1. **Recognize** the lure (see "Email Red Flags" and "Phishing in Freight" articles).
2. **Report** suspicious emails before acting on them.
3. **Verify** before clicking — especially for unexpected links and attachments.

Every person in the company who does not click an active phishing email has, in practical terms, prevented a possible ransomware attack.
