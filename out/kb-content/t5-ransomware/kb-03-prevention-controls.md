---
title: "Ransomware Prevention Controls: What Actually Works"
type: training-content
topics:
  - Ransomware & Operational Resilience
source_trust: T0
freshness_cycle: 6mo
---

# Ransomware Prevention Controls: What Actually Works

Most ransomware attacks don't exploit unknown vulnerabilities. They exploit known weaknesses — weak passwords on remote access, unpatched software, employees who click on malicious links. The controls that stop ransomware aren't exotic. They're consistent application of a small number of high-impact practices.

## Email Filtering: Where Most Attacks Begin

Phishing is the most common entry point for ransomware in freight operations. A dispatcher receives an email that appears to be a rate confirmation from a known broker. The attachment is a Word document with a malicious macro. One click is all it takes.

Email filtering that scans attachments for malicious content and checks links against threat intelligence feeds stops a significant portion of these attempts before they reach the inbox. This is an IT function, but operations staff can reinforce it by:

- Not disabling macro warnings when opening Office documents from email
- Not clicking "Enable Content" on documents from unknown senders
- Reporting suspicious emails rather than just deleting them — your IT team needs to know what's arriving

## MFA on All Remote Access: The Most Important Single Control

Credential theft is the number one initial access vector for freight ransomware. Attackers buy stolen usernames and passwords from criminal marketplaces, then test them against RDP endpoints, VPN gateways, and TMS logins. When MFA is not required, a valid credential is all they need.

Multi-factor authentication means that even if an attacker has your password, they can't log in without the second factor — typically a code from an authenticator app or a push notification. Every remote access point — RDP, VPN, TMS web portal, email if accessed remotely — should require MFA. No exceptions for convenience.

This applies to dispatchers who access TMS from home, fleet managers who VPN in from the road, and any third-party vendor with remote access to carrier systems.

## Endpoint Protection: EDR Over Legacy Antivirus

Traditional antivirus software identifies threats by matching file signatures against a database of known malware. Modern ransomware is designed to evade signature-based detection — attackers modify their code to avoid matches.

Endpoint Detection and Response (EDR) tools work differently. They monitor behavior: what a process is doing, not just what it looks like. When a process starts encrypting large numbers of files rapidly, EDR can detect and interrupt that behavior even if the specific ransomware variant has never been seen before. For carriers with the resources to choose their endpoint security tools, EDR provides meaningfully better protection than legacy antivirus.

## Patching: The Fastest Path for Attackers Is Unpatched Software

CISA's Known Exploited Vulnerabilities (KEV) catalog documents software vulnerabilities that attackers are actively exploiting in the wild. Unpatched systems with vulnerabilities on the KEV list are the path of least resistance for ransomware operators. Attackers run automated scans for exposed, unpatched systems and target them at scale.

Patching is not optional maintenance. Systems that are behind on patches — particularly internet-facing systems like VPN concentrators, web servers, and remote desktop gateways — are the most likely entry points. Prioritize patches for internet-facing systems and any system on CISA's KEV catalog.

## Least Privilege: Limit Blast Radius

When ransomware executes on a system, it encrypts everything that the logged-in user has permission to access. If that user is a local administrator with full system rights and network access to shared drives, the ransomware encrypts everything. If that user is a standard account with access only to the files they need for their job, the damage is dramatically smaller.

Least privilege means users have the minimum permissions required to do their work — not admin rights "just in case." Dispatchers don't need local admin rights on their workstations. Drivers don't need access to billing systems. Reducing permissions doesn't reduce capability for legitimate work. It does reduce how much damage a ransomware infection can cause.

## Network Segmentation: Keep Systems Separate

ELD systems communicate over cellular networks and integrate with dispatch backends. If those ELD backend systems are on the same flat network as corporate email, accounting systems, and TMS servers, an infection in any one place can spread everywhere. Network segmentation — placing different categories of systems on separate network segments with firewall rules controlling traffic between them — limits the lateral movement attackers depend on to reach high-value targets.

At minimum, ELD systems, dispatch operations systems, and corporate office systems should not all be reachable from the same network without authentication and access controls between them.

## What Operations Staff Can Actually Influence

IT owns the infrastructure decisions — patching, network segmentation, EDR deployment. But operations staff influence the attack surface every day through behavior:

- Not clicking suspicious links or attachments in email
- Not reusing passwords across TMS, email, and personal accounts
- Reporting unusual system behavior rather than working around it
- Not connecting personal devices to ELD ports or dispatch systems without authorization
- Following MFA prompts correctly rather than approving push notifications without verifying the login attempt is legitimate

Prevention is a shared responsibility. IT can deploy every control on this list and still fail if an employee approves a fraudulent MFA push notification or ignores an antivirus alert.
