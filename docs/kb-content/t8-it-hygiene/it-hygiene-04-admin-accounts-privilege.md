---
title: "Separate Your Admin Accounts: Why Privilege Separation Matters in Freight IT"
type: training-content
topics:
  - Secure Systems Hygiene
source_trust: T1
freshness_cycle: 12mo
---

# Separate Your Admin Accounts: Why Privilege Separation Matters in Freight IT

## The Problem You May Not Realize You Have

Most freight company owners and office managers who handle their own IT use one account for everything — checking email, browsing load boards, managing the TMS, and administering the systems. It feels efficient. It is also one of the most dangerous configurations you can have.

Here is what that looks like from an attacker's perspective: an admin user opens a phishing email and clicks a link. The credentials captured are admin credentials. The attacker now has full system access — not just to the email account, but to every system that admin account can reach: the TMS, the accounting software, the server, the cloud file storage. One click, full access.

If the same user had been checking email in a daily-use account without admin rights, a phishing compromise would capture credentials limited to that user's normal work. Damaging — but not catastrophic. The admin credentials would be in a separate account, on a separate session, never exposed to email-borne attacks.

This is the principle behind privilege separation.

## The Principle of Least Privilege

CIS Control 5 (Account Management) and CISA Cybersecurity Performance Goal 1.G both formalize the same principle: accounts should have only the permissions required to perform the task at hand. Not more.

In practice:
- An admin account is for admin tasks only. It is not used for email, web browsing, load board logins, or daily dispatch work.
- A daily-use account is for daily work. It does not have local administrator rights on the machine.
- Separate accounts exist for separate functions — and one being compromised does not automatically compromise the other.

## What This Looks Like in a Freight Operation

**TMS administration vs. dispatcher daily use.** The account used to configure the TMS, add new users, or change billing settings is not the same account used to book loads and communicate with carriers every day. The dispatcher uses a standard user account. TMS configuration is done when needed from a dedicated admin account.

**Load board admin vs. broker daily login.** Managing the load board subscription, adding users, or changing company settings uses a distinct admin account. Daily posting and searching uses a standard account.

**Email server or M365 admin vs. staff email.** Microsoft 365 global administrator access is one of the highest-value credentials in an M365 environment. If the person managing M365 uses their admin account to receive and read email, that admin account is exposed to every phishing email they receive. M365 best practice — and CIS guidance — is to maintain a separate admin account used only for administrative tasks, with no email inbox.

## Shared Admin Accounts Are Forbidden

When a security incident occurs, one of the first questions is: who made this change? Who logged in at 2 AM and created that new user account? Who granted those permissions?

Shared admin accounts make that question unanswerable. If four people share a "sysadmin" password, every action taken with that account is anonymous. You cannot investigate, you cannot prove who was responsible, and your cyber insurer may decline coverage for incidents where shared credentials were involved.

The rule is simple: every admin account is tied to one named individual. No shared credentials, ever.

## Vendor Admin Accounts

Vendors and MSPs that need admin access to your systems must have individual, named accounts — not a shared "vendor" login. These accounts must be:
- Time-limited: enabled for the engagement, disabled when it ends.
- MFA-protected: no exceptions.
- Audited quarterly: reviewed to confirm they are still needed and still assigned to current individuals.

## Driver Devices and Local Admin Rights

On company-issued driver devices — tablets, phones, or laptops — drivers should not have local administrator rights. Local admin rights allow software installation, configuration changes, and security setting modifications. Drivers do not need these capabilities for their work, and granting them creates exposure. A device that a driver has local admin rights on can have unauthorized software installed, security software disabled, or other changes made that create security risk.

Remove local admin rights from driver devices where technically feasible. This may require a configuration change by your MDM provider or IT support.

## MFA on All Admin Accounts — No Exceptions

Every admin account, without exception, requires multi-factor authentication. A strong password on an admin account is not sufficient — it can be phished, guessed, or bought on the dark web from a previous breach. MFA means that even if the password is compromised, the attacker cannot use it without the second factor.

If your current admin accounts do not have MFA enabled, that is the first thing to fix.
