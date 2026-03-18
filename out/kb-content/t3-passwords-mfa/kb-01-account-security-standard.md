---
title: Account Security Standard for Freight Apps
type: policy
topics: Passwords and Credential Security, MFA
source_trust: internal
---

# Account Security Standard for Freight Apps

Compromised credentials are the primary way attackers gain initial access to freight company systems. This policy defines the minimum account security requirements for every system used in freight operations.

## Scope

This policy applies to all accounts used for company business, including:
- Business email (Office 365, Google Workspace, or any email provider)
- Transportation Management System (TMS)
- Load board accounts (DAT, Truckstop.com, 123Loadboard, etc.)
- Document portals and customer/carrier communication platforms
- ELD and telematics platforms
- Factoring and payment portals
- Remote access tools (VPN, remote desktop)
- Accounting and payroll software
- Any cloud storage used for business files

## Password Requirements

**Minimum length:** 14 characters. Longer is better. A four-word passphrase (e.g., "freight dock monday orange") is easier to remember and stronger than a short complex password.

**Complexity:** Use a mix of letters, numbers, and symbols. Do not use predictable patterns (company name + year, personal name, common words).

**No forced periodic rotation:** Do not change passwords on a schedule unless there is a specific reason to believe they may be compromised. Forced rotation leads to weak passwords (adding "1" to the end of the previous password). Change passwords when:
- You have reason to believe the account was compromised.
- You received a notification of a data breach involving that service.
- Your security contact or IT team requests it.

**No reuse:** Do not use the same password across multiple systems. If one service is breached, unique passwords prevent that breach from spreading to your other accounts.

**Password managers are required for all staff managing business accounts.** A password manager generates strong, unique passwords and remembers them for you — you only need one strong master password. Approved options: [list your company-approved options]. Browsers' built-in password managers are acceptable for low-sensitivity accounts.

## MFA Requirements

Multi-factor authentication (MFA) must be enabled on:

**Tier 1 — required immediately:**
- Business email (highest priority — email is the master key to every other account)
- VPN and remote access
- TMS and load board accounts
- Factoring and payment portals

**Tier 2 — required within [30 days]:**
- Accounting and payroll software
- Cloud storage with business files
- ELD and telematics platforms

**Tier 3 — strongly recommended:**
- All other business accounts

Acceptable MFA methods (in order of security):
1. Hardware security key (most secure)
2. Authenticator app (Google Authenticator, Microsoft Authenticator, Authy)
3. Email-based one-time code (acceptable)
4. SMS text code (acceptable but weaker — SIM swap attacks can intercept SMS codes)

**MFA recovery codes** must be stored securely — not in the same email inbox or device that the MFA protects. Print and store offline or save in a secure password manager vault.

## Privilege Separation

- Separate admin accounts from daily-use accounts. If you need admin access to a system, use a dedicated account with that access — not your regular email or login.
- Admin accounts should only be used for admin tasks, not for everyday email and browsing.
- When an employee leaves, disable or delete their accounts within 24 hours of departure. Do not reassign accounts.

## Shared Accounts

Shared accounts are prohibited for any system where individual accountability is required — TMS actions, payment approvals, email communications. Each person must have their own account. "Company load board login" is not acceptable where individual activity needs to be traceable.

## Account Review

Conduct an account access review at least every six months to confirm:
- All active accounts belong to current employees.
- Access levels match current job responsibilities.
- MFA is active on all Tier 1 and Tier 2 accounts.
- No dormant accounts remain enabled.
