# KB Third Tranche Build Plan
**Date:** 2026-03-17
**Target:** 60 days post-launch (T8, T9, T10)

## Source intelligence driving this plan

- **NIST SP 800-161 Rev.1** — supply chain cyber risk management; anchors T9 vendor risk content
- **NIST SP 800-82 Rev.3** — OT/ICS security; anchors T8 patch and remote access content
- **CIS Controls v8/8.1** — mapped safeguards for SMB IT hygiene (T8 primary baseline)
- **CISA CPGs 2.0** — baseline protections, especially least privilege, MFA, patching; all three topics
- **NIST SP 800-50 Rev.1 (Sept 2024)** — training and awareness framework; anchors coverage/depth design
- **FMCSA** — data/document privacy guidance; driver PII handling (T10)
- **FinCEN** — red flags and SAR obligations; cross-references T9 vendor payment changes
- **CargoNet Q1 2025** — BEC-enabled cargo theft via compromised vendor/partner accounts (T9)
- **NMFTA** — trucking-specific IT hygiene gaps, remote access exploitation via fleet systems (T8)
- **MITRE ATT&CK** — Initial Access + Lateral Movement TTPs (remote access and vendor paths) — summarized for learners, no raw technique page republication
- **TT Club/BSI Annual Cargo Theft Report** — data handling and shipment record fraud (T10)
- **FBI IC3 2024** — BEC $2.77B total loss; vendor/employee impersonation patterns (T9)

---

## Third Tranche: Three Topic Groups

### T8. Secure Systems Hygiene for SMB IT

**Why third tranche:** Patching, remote access hardening, and endpoint hygiene require IT/MSP coordination beyond individual training. Leadership buy-in needed — which lands better after Second Tranche ransomware and IR content. Small fleets and owner-operators especially need the "what should your MSP be doing" lens.

**Minimum standard:** 4–6 KB articles, 1 module, 15–20 practice questions, 2 remediation cards.

**Anchor sources:** CIS Controls v8, CISA CPGs 2.0, NIST SP 800-82 Rev.3 (OT), NMFTA trucking hygiene, KEV list (operational context only — no raw IOCs)

**KB articles (6):**

1. `it-hygiene-01-patch-management.md`
   - type: training-content
   - title: "Patching in a Freight Operation: What to Update, When, and Who's Responsible"
   - CIS Control 7 anchored. OS, browser, ELD firmware, TMS, load board app, email clients. Who patches BYOD vs. company devices. SMB reality: MSP responsibility scoping. CISA CPG 1.E: patch critical within 14 days.

2. `it-hygiene-02-remote-access-security.md`
   - type: policy
   - title: "Remote Access Policy for Freight SMBs: VPN, RDP, and Vendor Tunnels"
   - RDP is the #1 ransomware entry vector. CIS Control 12 (network monitoring). Require VPN + MFA for all remote admin access. Disable direct RDP exposure to internet. MSP and vendor tunnel access: time-limited, logged, principle of least privilege. NIST SP 800-82: OT-adjacent systems (ELD, telematics, WMS) need network segmentation.

3. `it-hygiene-03-endpoint-protection.md`
   - type: training-content
   - title: "What 'Endpoint Protection' Actually Means for a Small Freight Company"
   - EDR vs. AV — what the difference means in practice for a 10-truck operation. CIS Control 10: malware defenses. What to require of your MSP. Free tools vs. managed detection. Driver devices and BYOD: minimum endpoint posture. Logging enabled vs. not.

4. `it-hygiene-04-admin-accounts-privilege.md`
   - type: training-content
   - title: "Separate Your Admin Accounts: Why Privilege Separation Matters in Freight IT"
   - CIS Control 5: account management. Admin accounts should not be used for email, browsing, or daily work. TMS and load board admin accounts: unique credentials, not shared. MFA required. Local admin rights on driver devices: remove where possible. Vendor admin accounts: time-limited.

5. `it-hygiene-05-smb-security-checklist.md`
   - type: policy
   - title: "SMB Freight IT Security Checklist: 12 Controls Your MSP Should Confirm Quarterly"
   - Practical checklist: MFA on email, MFA on admin remote access, patch cadence confirmed, EDR deployed, backups tested (offline copy), admin account separation, disable unused remote access, review user list quarterly, logging enabled, incident contact list posted, phishing simulation run in last 6mo, cyber insurer notified of major tech changes. Maps each to a CIS Control and CISA CPG.

6. `it-hygiene-06-threat-brief-smb-attacks.md`
   - type: threat-brief
   - title: "How SMB Freight Companies Get Compromised: RDP, Phishing, and Vendor Trust Abuse"
   - Composite: NMFTA pattern data, ENISA 2025 (ransomware 83.9% of transport cybercrime), IBM X-Force Transportation 2025 (sector #5). Three attack chains: (1) exposed RDP + credential spray → ransomware, (2) phishing + admin credential theft → lateral movement to billing, (3) compromised MSP/vendor access → data exfil. Written as "how attackers think" — no IOC detail.

**Module:**
- title: "Secure IT Hygiene for Freight Operations"
- estimated_minutes: 20
- displayOrder: 8
- Lesson structure: patch management → remote access controls → endpoint protection → privilege separation → your MSP agreement → SMB checklist
- Practice: 20 questions (CIS Control mapping, SMB scenarios, patch decision logic)
- Remediation path: itHygiene topic

**Remediation cards:**

- `remediation-01-my-msp-update.md`
  "My MSP Said Everything Is Patched — Verification Questions to Ask"
  6 questions to ask your MSP quarterly: last patch date confirmed?, EDR coverage?, admin account audit done?, backup tested?, logging enabled?, incident playbook up to date?

- `remediation-02-exposed-rdp.md`
  "You Found RDP Open to the Internet — Do This Now"
  Immediate: block the port, rotate admin credentials, check for unauthorized access in event logs, notify MSP. Short-term: require VPN + MFA for all admin remote access, document what was exposed and for how long.

---

### T9. Third-Party and Vendor Risk

**Why third tranche:** Effective training requires learners to have their own access inventory first (post-launch operations task). Vendor risk content lands better after credential and BEC foundation (First Tranche) establishes why vendor account compromise matters. NIST SP 800-161 is the anchor — requires organizational maturity to apply.

**Minimum standard:** 4–6 KB articles, 1 module, 15–20 practice questions, 2 remediation cards.

**Anchor sources:** NIST SP 800-161 Rev.1 (C-SCRM), FBI IC3 2024 (BEC via vendor impersonation), CargoNet Q1 2025 (vendor account compromise pattern), FMCSA carrier vetting, FinCEN vendor payment change red flags

**KB articles (6):**

1. `vendor-risk-01-what-vendors-have-access.md`
   - type: training-content
   - title: "What Your Vendors Can Actually Access: Mapping the Freight Tech Stack"
   - TMS, load board admin, ELD fleet management, email platform, factoring portal, accounting/payroll. Per-vendor: what they can read, what they can change, what they can break if compromised. Why this matters: vendor compromise gives attacker their access level in your environment. NIST SP 800-161: third-party access is supply chain risk.

2. `vendor-risk-02-vetting-new-vendors.md`
   - type: policy
   - title: "Vendor Vetting Minimum Standards for Freight Operations"
   - Before granting a new vendor access: verify their identity and credentials (especially for IT/MSP vendors — FMCSA carrier vetting analogy), require SOC 2 or equivalent for cloud SaaS, check references for security incidents, define exactly what access they need (principle of least privilege), require a written agreement on notification if they're breached. NIST SP 800-161 C-SCRM: due diligence is not optional.

3. `vendor-risk-03-ongoing-vendor-monitoring.md`
   - type: policy
   - title: "Monitoring Vendor Access After Onboarding: Access Review and Offboarding Controls"
   - Quarterly: pull all active vendor credentials and review with hiring manager. Offboarding: revoke access same day vendor relationship ends. Change shared passwords when any vendor staff departs. Audit trail: know what each vendor touched. Event-driven: vendor tells you they had a breach → immediate credential rotation, access audit, notify insurer.

4. `vendor-risk-04-bec-via-vendor.md`
   - type: threat-brief
   - title: "BEC Through a Trusted Vendor: How Attackers Use Your Vendor Relationships"
   - CargoNet Q1 2025: BEC-enabled cargo theft shifting to account compromise via trusted partner channels. FBI IC3 2024: vendor email compromise is a documented BEC variant. Three patterns: (1) attacker compromises vendor email → sends realistic payment change request, (2) attacker impersonates vendor contact to change ACH details, (3) cargo theft via load-board/carrier account compromised at vendor. Freight-specific telltale signs.

5. `vendor-risk-05-payment-change-controls.md`
   - type: training-content
   - title: "Payment Change Requests from Vendors: The Non-Negotiable Verification Rules"
   - Any payment change (ACH/wire details, factoring bank, fuel card account) from any vendor must be verified by phone call to a known-good number — not any number in the email requesting the change. Dual-approval: finance + manager for changes over threshold. Out-of-band confirmation for new payees. Log the call. FinCEN red flags: unusual urgency, new contact, changed routing. This is not bureaucracy — it's the control that stops BEC.

6. `vendor-risk-06-smb-vendor-controls.md`
   - type: policy
   - title: "Vendor Access Controls for Small Freight Operations: A Practical Policy"
   - Practical policy for SMBs without a dedicated IT team: vendor access register (spreadsheet minimum), named contact per vendor, MFA required for all vendor remote access, time-limited access tokens where possible, quarterly review reminder, incident notification clause in vendor agreements. NIST SP 800-161 adapted for a 5–50 person freight operation.

**Module:**
- title: "Third-Party and Vendor Risk in Freight"
- estimated_minutes: 20
- displayOrder: 9
- Lesson structure: what access vendors have → vetting before onboarding → monitoring ongoing access → BEC via vendor relationships → payment change controls → practical SMB policy
- Practice: 20 questions (vendor access scenarios, BEC detection, policy application)
- Remediation path: vendorRisk topic

**Remediation cards:**

- `remediation-01-vendor-breach-notification.md`
  "Your Vendor Was Breached — Do This Within 24 Hours"
  1. Identify what access that vendor had. 2. Rotate all shared credentials immediately. 3. Review access logs for the vendor's activity in the last 30 days. 4. Notify your cyber insurer. 5. Tell your team: watch for spoofed vendor emails. 6. Update your vendor access register with breach date and remediation.

- `remediation-02-suspicious-vendor-request.md`
  "You Got a Payment Change Request from a Vendor — Pause Before You Process"
  Do not process. Call the vendor's known-good phone number (not any number in the email). Confirm the request is real. If confirmed: document the call, dual-approve, process. If suspicious: flag to manager, preserve the email with headers, file a SAR with FinCEN if funds already moved.

---

### T10. Data and Document Security (Expanded)

**Why third tranche:** Core document fraud content (BOL/POD) is in First Tranche T4. This tranche covers the broader data security layer — HR/driver PII, secure sharing, breach response — which only matters once real data is flowing through the platform. Requires the access control and credential foundation from First and Second Tranche to land.

**Minimum standard:** 4–6 KB articles, 1 module, 15–20 practice questions, 2 remediation cards.

**Anchor sources:** FMCSA driver PII requirements, FTC data protection guidance, TT Club/BSI cargo theft (document fraud patterns), NIST SP 800-122 (PII), FBI IC3 2024 (identity theft), EEOC driver records requirements

**KB articles (6):**

1. `data-security-01-driver-pii-protection.md`
   - type: policy
   - title: "Driver PII in Freight: What You Collect, How to Protect It, and What Not to Do"
   - What counts as PII: name, SSN, CDL number, DOB, medical certificate, drug test results, GPS tracking data, ELD driving logs. FMCSA: driver qualification file retention requirements (3 years). FTC: protect against unauthorized disclosure. Minimum controls: encrypted storage, access restricted to HR/management, no SSN in email, proper disposal. Breach response: notify affected drivers and relevant authorities.

2. `data-security-02-document-handling-standards.md`
   - type: training-content
   - title: "Handling Freight Documents Securely: BOL, POD, Rate Con, and Driver Files"
   - Which documents have high fraud/misuse value: BOL (controls cargo release), POD (triggers payment), rate confirmation (used to impersonate carrier), driver files (identity theft vector). Secure sharing: encrypted email or portal for documents with PII; never unencrypted email for SSN/CDL. Storage: don't leave driver files on shared drives without access controls. Retention: FMCSA requirements for driver files, 3 years for most records.

3. `data-security-03-secure-sharing-controls.md`
   - type: training-content
   - title: "Sharing Freight Documents Securely: When Email Is Not Enough"
   - What not to share via email: SSNs, CDL numbers, full DOBs, drug test results, bank account details, BOL with sensitive commodity info. Approved channels: secure portal, encrypted file share, password-protected attachments (minimum). Recipient verification: confirm before sending sensitive docs to a new contact or after a contact-info change request. TT Club/BSI: document fraud increasingly uses intercepted or manipulated documents — limit blast radius by using portals.

4. `data-security-04-breach-response-basics.md`
   - type: policy
   - title: "What to Do If Freight Business Data Is Exposed: A Breach Response Primer"
   - Triggering events: unauthorized access to driver files, exposed rate confirmations or BOLs, compromised email with customer or driver data, TMS data exfil. First steps: isolate, document, notify MSP/IT, preserve logs. State breach notification: most US states require notification if personal data (name + SSN/CDL/DOB) is exposed. Timeline: typically 30–60 days, some states 72 hours. Insurer notification. Customer notification if their data was involved. FBI IC3 report.

5. `data-security-05-access-control-for-documents.md`
   - type: training-content
   - title: "Who Should Have Access to What: Document Access Controls in Small Freight Operations"
   - Driver files: HR and management only. Customer rate data: dispatch and management. Carrier payment info: finance only. Shared drive hygiene: don't put sensitive files in a folder everyone can read. Cloud storage: OneDrive/Google Drive sharing settings; do not share by "anyone with the link." Principle of least privilege applied to document access — same concept as IT access control, applied to files and folders.

6. `data-security-06-threat-brief-data-freight.md`
   - type: threat-brief
   - title: "How Freight Data Gets Stolen and Misused: PII Theft, Document Fraud, and BEC Data Harvesting"
   - FBI IC3 2024: identity theft linked to driver file exfiltration (CDL + SSN = high-value combo). TT Club/BSI: fraudsters intercept BOLs and PODs to stage fictitious pickup. BEC data harvesting: attackers compromise email to collect rate confirmations, customer data, and banking info before launching wire fraud. Cargo theft via address/delivery instruction fraud (manipulated POD). Freight-specific: small companies often have high-value customer data (retail, pharma, electronics manifests) with poor data access controls.

**Module:**
- title: "Data and Document Security for Freight Operations"
- estimated_minutes: 20
- displayOrder: 10
- Lesson structure: what data you hold and why it matters → driver PII protection → document handling standards → secure sharing → breach response basics → access control for documents
- Practice: 20 questions (PII scenarios, document sharing decisions, breach response logic)
- Remediation path: dataSecurity topic

**Remediation cards:**

- `remediation-01-driver-pii-exposed.md`
  "Driver PII Was Exposed — Steps to Take Within 48 Hours"
  1. Identify what was exposed (SSN, CDL, DOB?) and how many drivers affected. 2. Contain: remove from wherever it was exposed, revoke any unauthorized access. 3. Notify your cyber insurer and legal counsel — state breach notification laws may apply. 4. Notify affected drivers what was exposed and what you're doing. 5. File FTC or state AG report if required. 6. Document everything: timeline, data involved, who was notified.

- `remediation-02-document-fraud-suspected.md`
  "You Think a BOL or POD Was Altered or Intercepted — Do This Now"
  1. Hold the payment or cargo release — do not proceed until verified. 2. Call the shipper/receiver/carrier on their known-good phone number to confirm the document. 3. Preserve the suspect document (don't delete). 4. Notify dispatch supervisor and management. 5. Report to CargoNet (www.cargonet.com) if cargo is involved. 6. If funds were moved based on a fraudulent document, contact your bank immediately and file an FBI IC3 report.

---

## Totals

| Group | KB Articles | Module | Practice Qs | Remediation | Dir |
|-------|------------|--------|-------------|-------------|-----|
| T8: Secure Systems Hygiene (SMB IT) | 6 | 1 (20 min) | 20 | 2 cards | out/kb-content/t8-it-hygiene/ |
| T9: Third-Party / Vendor Risk | 6 | 1 (20 min) | 20 | 2 cards | out/kb-content/t9-vendor-risk/ |
| T10: Data and Document Security | 6 | 1 (20 min) | 20 | 2 cards | out/kb-content/t10-data-security/ |
| **Total** | **18** | **3** | **60** | **6 cards** | |

---

## Content model (same as First and Second Tranche)

```yaml
---
title: "Title Here"
type: training-content | threat-brief | policy | faq
topics:
  - Secure Systems Hygiene
source_trust: T1
freshness_cycle: 12mo
---
```

Types → role in learner module:
- `training-content` with role `primary` → study items
- `policy`, `faq`, `threat-brief` → references

---

## Freshness cycles by topic

| Topic | Cycle | Event triggers |
|-------|-------|----------------|
| T8: IT Hygiene | 6–12 months | CISA CPG update, major KEV wave, CIS Controls release |
| T9: Vendor Risk | 6–12 months | FBI IC3 annual report, major vendor-compromise incident, CargoNet quarterly |
| T10: Data/Document Security | 12 months | State breach law changes, FMCSA requirement update, major freight data breach |

---

## Trusted sources by topic

### T8 — IT Hygiene
- CIS Controls v8/8.1: cisecurity.org (T1)
- CISA CPGs 2.0: cisa.gov (T0)
- NIST SP 800-82 Rev.3: nvlpubs.nist.gov (T0)
- NMFTA trucking cyber: nmfta.org (T1)

### T9 — Vendor Risk
- NIST SP 800-161 Rev.1: nvlpubs.nist.gov (T0)
- FBI IC3 2024: ic3.gov (T0)
- CargoNet Q1 2025: cargonet.com (T2)
- FinCEN advisories: fincen.gov (T0)

### T10 — Data Security
- FMCSA driver file requirements: fmcsa.dot.gov (T0)
- FTC data protection guidance: ftc.gov (T0)
- NIST SP 800-122: nvlpubs.nist.gov (T0)
- TT Club/BSI Annual Cargo Theft Report: ttclub.com (T2)
- FBI IC3 2024: ic3.gov (T0)

---

## Gaps and constraints

- **ISA/IEC 62443** (OT security standard): T8 mentions OT context but avoids citing 62443 directly — licensing likely restricts redistribution.
- **TIA fraud framework**: subscriber/internal use only; redistribution prohibited. Not sourced directly.
- **MITRE ATT&CK**: technique-level detail (TTP pages) must not be reproduced in learner content. Use only for internal mapping to validate coverage, not as learner-visible source.
- **ISAC member reports**: Surface Transportation ISAC and Maritime ISAC reports are gated/membership-only. Not sourced directly.

*Last updated: 2026-03-17*
