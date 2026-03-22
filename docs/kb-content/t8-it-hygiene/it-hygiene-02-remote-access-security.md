---
title: "Remote Access Policy for Freight SMBs: VPN, RDP, and Vendor Tunnels"
type: policy
topics:
  - Secure Systems Hygiene
source_trust: T1
freshness_cycle: 12mo
---

# Remote Access Policy for Freight SMBs: VPN, RDP, and Vendor Tunnels

## Purpose

This policy establishes minimum requirements for all remote access to company systems — including employee access from off-site locations, MSP and IT provider access, and vendor or software-vendor support access. Insecure remote access is the most common ransomware entry path for freight SMBs. This policy exists to close that path.

## The Problem with Exposed RDP

Remote Desktop Protocol (RDP) — the technology that lets you control a Windows computer from another location — runs on TCP port 3389 by default. Attackers run automated scans of the entire public internet, continuously, looking for open port 3389. When they find one, they run credential spray attacks using breached password lists. Because freight companies often use weak or reused passwords, these attacks succeed routinely.

RDP exposed directly to the internet is the single most common initial access vector for ransomware attacks against small and mid-size businesses. It must not exist on any company system.

## Rule 1: RDP Must Never Be Exposed Directly to the Internet

No company system running Remote Desktop Protocol may have port 3389 accessible from the public internet. If RDP is required for legitimate purposes, it must be placed behind a VPN or a jump host (also called a bastion host) — meaning the user must authenticate to the VPN or jump host before they can reach RDP.

Verify this: ask your MSP or IT provider to confirm in writing that no RDP-enabled systems are directly internet-accessible. Request a scan report if available. If you have a firewall, confirm the rule blocking inbound 3389 is active.

## Rule 2: All Admin Remote Access Requires MFA

Every person connecting to company systems remotely for administrative purposes — including MSP technicians — must authenticate with multi-factor authentication. Username and password alone is insufficient.

CISA Cybersecurity Performance Goal 1.D requires MFA for all remote administrative access. This is not a suggestion; it is the current baseline expectation for any organization receiving incident response assistance or cyber insurance coverage.

What "admin remote access" includes:
- MSP technicians connecting to manage company systems
- IT administrators connecting from off-site
- Any account with local administrator or domain administrator privileges connecting remotely
- Access to firewall, router, or network management interfaces

## Rule 3: Vendor Remote Access Must Be Time-Limited and Logged

Software vendors and service providers sometimes require remote access to troubleshoot or configure systems — TMS vendors, ELD providers, load board integrators, logistics software platforms. This access must not be permanent.

Requirements for vendor access:
- Access is granted for a specific, documented purpose and time window.
- Access is revoked when the engagement ends — not left open indefinitely.
- Access is tied to a named individual at the vendor, not a shared "vendor" account.
- A log is kept: who connected, from what source, when, and what they did.
- Vendor access accounts are reviewed quarterly and disabled if no longer needed.

NIST SP 800-82 Rev.3 guidance on OT-adjacent systems is relevant here: ELD management consoles, telematics dashboards, and warehouse management systems that connect to operational technology need network segmentation from general business traffic. Vendor access to these systems should traverse a separate, monitored path — not the same VPN used for general remote work.

## Recommended Implementation for Freight SMBs

**For Microsoft 365 / Azure AD shops:** Use Microsoft Entra ID Conditional Access to require MFA for any remote sign-in. Configure the policy to require MFA for all users connecting from outside the company network. This is available in most M365 Business Premium and above plans.

**For non-Microsoft environments:** Deploy a VPN with MFA integration. WireGuard and OpenVPN are both viable open-source options with documented SMB deployments. Commercial options (NordLayer, Cisco AnyConnect, Palo Alto GlobalProtect) provide centralized management if your MSP supports them.

**For MSP access:** Require your MSP to use a Professional Services Automation (PSA) tool that logs all remote sessions. Major MSP platforms (ConnectWise, Kaseya, Datto) have session logging capabilities. Confirm it is enabled and that logs are retained for at least 90 days.

## Audit Trail Requirements

Know who connected, from where, when, and what they did. If you cannot answer those questions, you cannot investigate an incident involving remote access. Your MSP must be able to provide a remote access activity log on request. If they cannot, that is a gap in your security visibility that needs to be addressed contractually.

## Vendor and MSP Access Review

Conduct a quarterly review of all active remote access accounts:
- Confirm each account belongs to a current, named individual.
- Confirm each account is still needed.
- Disable accounts for vendors not currently engaged.
- Confirm MFA is active on all accounts.

Document this review. If something goes wrong, you need to be able to show that access was managed and audited.
