---
title: Privilege Separation: Why Admin and User Accounts Must Be Different
type: training-content
topics: Passwords and Credential Security
source_trust: internal
---

# Privilege Separation: Why Admin and User Accounts Must Be Different

Privilege separation — using different accounts for high-access "admin" tasks versus everyday work — is one of the simplest and most effective security controls for small and mid-size freight companies. This article explains why it matters and how to apply it practically.

## The Problem With "One Account for Everything"

In many small freight companies, the owner or operations manager has a single account that they use for email, TMS administration, load board management, accounting software, and everything else. If that account is compromised — through a phishing attack, a password breach, or an MFA bypass — the attacker has access to everything simultaneously.

- They can change dispatch settings in the TMS.
- They can access and modify financial records.
- They can read and send email as the account holder.
- They can change other users' passwords or remove other users' accounts.
- They can disable security controls.

A single compromised account with admin-level access is a total-compromise event.

## What Privilege Separation Means in Practice

**Principle of least privilege:** Every person should have the minimum access they need to do their job — no more. A dispatcher needs access to the TMS for dispatch functions; they do not need TMS admin access that lets them modify other users or system settings.

**Separate admin accounts:** If you have admin access to a platform (email admin, TMS admin, network admin), use a separate account for those admin tasks. Your admin account:
- Is not used for daily email or web browsing.
- Has a different, strong, unique password.
- Has MFA — ideally using a hardware key or authenticator app, not SMS.
- Is only logged into when you are doing admin work.

Your daily-use account is what gets exposed to phishing emails, potentially compromised websites, and everyday credential risk. Keeping admin access in a separate account means a compromised daily-use account does not immediately give the attacker admin power.

**Real example:** An attacker sends a phishing email that captures the dispatcher's email credentials. With those credentials, they can access the dispatcher's email. If the dispatcher used their regular email account as the TMS admin, the attacker now has TMS admin access too. If dispatch and TMS admin are separate accounts, the email breach does not automatically transfer to TMS admin.

## Freight-Specific Applications

**TMS administration:** Set up admin accounts separately from dispatch user accounts. The person who manages TMS user settings, integrations, and configurations should use a dedicated admin login.

**Email administration:** If you manage your company's email domain (adding users, managing forwarding rules, reviewing mail flow), use an admin account for that — not your daily email account.

**Load board accounts:** Some load board platforms have separate "company admin" vs "user" access levels. Use them.

**Accounting software:** Accounting admin access (ability to add payees, change bank details, export all data) should be limited to the fewest necessary people and used via dedicated credentials.

## Vendor and Contractor Access

When vendors, MSPs, or contractors need admin access to your systems:
- Create time-limited accounts where possible.
- Remove access immediately when the work is done.
- Require MFA for all vendor admin access.
- Review what your MSP or IT vendor can access — "admin" access for a managed service provider means they have significant power over your systems.

## When Someone Leaves

When an employee leaves, disable or delete their accounts within 24 hours. Do not:
- Transfer their account to a new employee.
- Keep the account active "in case it is needed."
- Share the credentials with remaining staff temporarily.

Each of these practices creates ongoing access risk. Disable, then create fresh credentials for the new employee.

## The Practical Starting Point

If privilege separation is new to your company, start with:
1. Identify who has admin access to your email system, TMS, and accounting software.
2. Create separate admin accounts for those people.
3. Ensure daily-use accounts for those people do not have admin permissions.
4. Apply MFA to admin accounts first.

This does not require new tools — only a different approach to how existing accounts are structured.
