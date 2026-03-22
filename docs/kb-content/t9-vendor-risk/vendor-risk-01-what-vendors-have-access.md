---
title: "What Your Vendors Can Actually Access: Mapping the Freight Tech Stack"
type: training-content
topics:
  - Third-Party and Vendor Risk
source_trust: T1
freshness_cycle: 6mo
---

# What Your Vendors Can Actually Access: Mapping the Freight Tech Stack

Your TMS contains every shipment you have ever moved — every customer, every lane, every rate, every carrier relationship. If your TMS vendor's support team has read/write access to your account, that is exactly what a compromised vendor credential exposes. The attacker does not need to breach your company. They breach the vendor and walk in through an already-open door.

Third-party access is not theoretical risk. CargoNet's Q1 2025 threat data showed that BEC-enabled cargo theft — the predominant cargo theft strategy — is increasingly executed through compromised vendor and partner accounts rather than through the target company itself. When attackers need access, they look for the path of least resistance. Trusted vendor relationships are that path.

Understanding what access your vendors actually have is the first step to managing this risk.

## The Freight Tech Stack and What Vendors Can See

**Transportation Management System (TMS)**

TMS vendor support staff commonly hold read/write access to the entire shipment database. That access exists so they can troubleshoot issues, run data corrections, and assist with implementations. In practice, it means a vendor support technician can see every load, every rate confirmation, every customer contact, and often every carrier settlement. A compromised TMS vendor account exposes your entire operational picture.

**Load Board Accounts (DAT, Truckstop)**

Account managers at load board providers often retain login-level access for billing and account management. This is less operationally sensitive than your TMS but still exposes your company's posting activity, contact relationships, and sometimes saved search patterns that reveal your freight lanes.

**ELD Fleet Management Portals (Samsara, Motive/KeepTruckin, Omnitracs)**

ELD vendor support staff can access real-time vehicle location, driver hours-of-service records, fault codes, and in some platforms, in-cab camera feeds. A compromised ELD vendor account exposes your fleet's operational state — where trucks are, where drivers are, and when they are running legal hours. That data has direct value for cargo theft planning.

**Email and Productivity Platforms (Microsoft 365, Google Workspace)**

Your IT provider or managed service provider (MSP) almost certainly holds Global Administrator access to your email and productivity environment. Global Admin can read any mailbox, reset any password, and add new accounts. A compromised MSP technician account is effectively full access to your company's communications. CISA has documented the pattern of MSPs being compromised to attack multiple clients simultaneously.

**Factoring Portal**

Your factor's account representative may have access to submit invoices, view invoice status, and in some platforms, see payment routing information. Factoring portals are a known target precisely because they sit at the intersection of carrier payment data and banking instructions.

**Accounting and Payroll Platforms (QuickBooks, Gusto, ADP)**

Payroll providers and accounting software MSPs hold all employee PII — names, addresses, Social Security numbers, direct deposit routing and account numbers. A compromised payroll provider is a direct path to employee banking fraud and identity theft.

**Fuel Card Platform**

Fuel card account managers can typically view full transaction history and in many cases can edit card limits, add cards, or see driver PIN assignments. Transaction history reveals driver routes, home terminals, and fueling patterns — useful for cargo theft planning.

## Why Vendor Compromise Is Your Problem

NIST SP 800-161 Rev.1 (Cybersecurity Supply Chain Risk Management Practices) is explicit: third-party access constitutes supply chain risk, and organizations are responsible for the security posture of what they grant others access to. The standard does not carve out an exception because "the vendor handles the security." You granted the access; you are accountable for what happens through it.

The risk is not limited to malicious vendors. The more common scenario is a legitimate vendor whose credentials are stolen — a support technician's laptop compromised through phishing, a shared service account with a weak password, a former employee whose access was never revoked at the vendor. The vendor did not mean to expose you. But the attacker used that vendor's legitimate access to reach you.

## The Minimum Response: A Vendor Access Register

You cannot manage access you have not mapped. A vendor access register does not require enterprise tools. It requires discipline. At minimum, document:

- Vendor name
- Which system they can access
- What level of access (read-only, read/write, admin)
- Named contact at the vendor
- Date access was originally granted
- Next scheduled review date
- Offboarding status (for former vendors)

Keep this list current. Review it quarterly. Every vendor access relationship that is not on the list is an unmanaged risk.
