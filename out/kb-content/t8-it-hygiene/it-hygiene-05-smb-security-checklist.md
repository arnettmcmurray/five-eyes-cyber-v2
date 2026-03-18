---
title: "SMB Freight IT Security Checklist: 12 Controls Your MSP Should Confirm Quarterly"
type: policy
topics:
  - Secure Systems Hygiene
source_trust: T1
freshness_cycle: 12mo
---

# SMB Freight IT Security Checklist: 12 Controls Your MSP Should Confirm Quarterly

## Purpose

This checklist defines the minimum security posture for a freight SMB. It is designed to be reviewed with your Managed Service Provider or IT support contact on a quarterly basis. Each item specifies what "done" looks like and which framework standard it corresponds to. Items not confirmed as complete are open risks that require a remediation timeline.

This is not an aspirational framework. These are the controls that close the most common attack paths documented in ransomware and breach incidents affecting freight companies.

---

## The 12 Controls

---

**1. MFA on all email accounts**

_What "done" looks like:_ Multi-factor authentication is enabled and enforced on every email account in the company — owner, dispatch, finance, drivers if they have company email. No account is accessible with password alone. MFA enforcement is verified in the email platform admin console, not just assumed based on user behavior.

_Framework:_ CISA CPG 1.B (Phishing-resistant MFA for critical accounts); CIS Control 5.4

---

**2. MFA on all admin remote access**

_What "done" looks like:_ Every account used for remote administrative access — including MSP technician accounts, IT admin accounts, and any account with local or domain admin privileges connecting from outside the network — requires MFA to authenticate. Verified in VPN, RDP gateway, or identity provider configuration. MSP confirms in writing.

_Framework:_ CISA CPG 1.D; CIS Control 6.5

---

**3. Patch cycle confirmed (OS + applications within 30 days)**

_What "done" looks like:_ MSP can produce a patch status report showing all managed endpoints. The report confirms: operating system updates applied within 30 days of release, third-party applications (browsers, email clients, remote access software) updated within 30 days, and no critical or high-severity CVEs outstanding beyond the CISA CPG 1.E windows (critical: 14 days; high: 30 days). ELD firmware update status confirmed with each ELD vendor.

_Framework:_ CISA CPG 1.E; CIS Control 7

---

**4. EDR deployed and centrally managed**

_What "done" looks like:_ Endpoint Detection and Response software — not signature-only antivirus — is installed on all company-owned endpoints (desktops, laptops, servers). MSP can show the central management console with all endpoints listed, health status current, and no unacknowledged alerts older than 72 hours. Product name confirmed as EDR-class (Defender for Business, SentinelOne, CrowdStrike, or equivalent).

_Framework:_ CISA CPG 1.F; CIS Control 10

---

**5. Backups tested in last 90 days (offline copy exists)**

_What "done" looks like:_ A full or incremental restore test has been performed within the past 90 days, and the result is documented. An offline or air-gapped copy of critical backup data exists — meaning at least one backup copy is not continuously connected to the network and cannot be encrypted by ransomware that reaches the primary systems. Recovery time objective (RTO) for critical systems is documented and understood.

_Framework:_ CISA CPG 2.O; CIS Control 11

---

**6. Admin account separation (no shared admin credentials)**

_What "done" looks like:_ No admin account is shared between two or more individuals. Every admin-level account is assigned to a single named person. Daily-use accounts for dispatch, finance, and driver operations do not have local administrator rights. Admin accounts are not used for email or general browsing. MSP technician accounts are individual, not shared team credentials.

_Framework:_ CISA CPG 1.G; CIS Control 5

---

**7. Unused remote access disabled (no exposed RDP)**

_What "done" looks like:_ No RDP-enabled system has port 3389 accessible from the public internet. Verified by scan or firewall rule review. VPN or jump host is required before RDP is reachable. Vendor and MSP remote access accounts that are no longer needed are disabled. MSP provides written confirmation of no direct RDP exposure.

_Framework:_ CISA CPG 1.D; CIS Control 12

---

**8. User access list reviewed in last 90 days**

_What "done" looks like:_ A full list of active user accounts has been reviewed within the past 90 days. Accounts belonging to former employees, terminated contractors, or ex-vendors are disabled. Access permissions for current employees are confirmed as appropriate for their current role. Access changes from the previous quarter are documented. This review covers email accounts, TMS logins, load board accounts, VPN credentials, and any other business system.

_Framework:_ CIS Control 5; CISA CPG 1.G

---

**9. Security event logging enabled**

_What "done" looks like:_ Windows event logging is enabled on all managed endpoints and servers. Logs are retained for a minimum of 90 days. MSP confirms logs are being collected and are accessible for incident investigation. If a security incident occurred today, you could answer: what accounts logged in, what files were accessed, what software ran, and what network connections were made — for the past 90 days.

_Framework:_ CIS Control 8; CISA CPG 2.T

---

**10. Incident response contact list posted and up to date**

_What "done" looks like:_ A printed or readily accessible contact list exists that includes: MSP 24/7 emergency contact number, cyber insurer breach response hotline, FBI Internet Crime Complaint Center (IC3.gov), CISA reporting line (1-888-282-0870), and internal escalation contacts (owner, operations manager, finance). The list has been reviewed in the past 90 days to confirm all numbers are current. At least one copy exists that is accessible even if company systems are down.

_Framework:_ CISA CPG 2.B; NIST SP 800-82 Rev.3 (incident response planning)

---

**11. Phishing awareness training completed in last 6 months**

_What "done" looks like:_ All staff with access to company email, TMS, or financial systems have completed phishing awareness training within the past 6 months. Completion is documented. Training covered freight-specific phishing lures (fake load board alerts, FMCSA impersonation, carrier setup requests) — not just generic security awareness content. Simulated phishing tests, if conducted, showed improvement in click rates compared to previous period.

_Framework:_ CIS Control 14; CISA CPG 2.G

---

**12. Cyber insurer notified of major tech changes**

_What "done" looks like:_ The cyber insurance carrier has been notified of any significant technology changes in the past policy year — new cloud migration, new TMS deployment, new remote access solution, acquisition of new business with different IT systems, significant headcount growth. Your policy terms are reviewed to confirm that your current systems and coverage limits are aligned. You know your insurer's breach response hotline number.

_Framework:_ Industry best practice; aligns with cyber policy warranty and warranty warranty compliance requirements

---

## How to Use This Checklist

Share this checklist with your MSP at the start of each quarter. Ask them to confirm the status of each item in writing. Any item they cannot confirm as complete becomes a tracked remediation item with an assigned owner and deadline. Do not accept "we think that's fine" — each item has a verifiable, documented answer.

If your MSP is unfamiliar with any of these controls, that is useful information about your MSP relationship.
