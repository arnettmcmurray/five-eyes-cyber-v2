---
title: MFA Deployment Guide: Drivers, Dispatch, Finance, and Admins
type: training-content
topics: MFA
source_trust: internal
---

# MFA Deployment Guide: Drivers, Dispatch, Finance, and Admins

Multi-factor authentication (MFA) requires a second verification step beyond a password before granting access to an account. Even if an attacker steals your password — through phishing, a data breach, or guessing — they cannot log in without also having the second factor. This guide explains how to deploy MFA effectively for each role in a freight company.

## Why MFA Is Non-Negotiable for Freight Operations

StopRansomware guidance from CISA explicitly calls out phishing-resistant MFA as a critical control for email, VPNs, and accounts that access critical systems. The reason: passwords alone are not sufficient protection. Phishing, credential stuffing from leaked breaches, and keyloggers all bypass password protection entirely. MFA closes the gap.

A stolen TMS credential without MFA = immediate load board access, shipment manipulation, potential payment changes. A stolen TMS credential with MFA = the attacker cannot log in. MFA turns credential theft from "full access" into "expensive inconvenience."

## MFA for Everyone: Email First

**Email is the master key.** Every account password reset, every security notification, every login verification comes to your email inbox. An attacker who controls your email controls your ability to recover access to every other account. Email must have MFA.

**Setup steps (most email providers):**
1. Log in to your email account settings.
2. Navigate to "Security" or "Account Security."
3. Find "Two-factor authentication" or "2-step verification."
4. Choose an authenticator app (preferred) or SMS.
5. Scan the QR code with your authenticator app.
6. Save the backup/recovery codes in a secure location (not in that email account).

**Authenticator apps:** Microsoft Authenticator, Google Authenticator, and Authy are free and work with most services.

## Dispatch Staff: TMS and Load Board MFA

Dispatch accounts on TMS platforms and load boards must have MFA. A compromised dispatch account is a direct path to accepting fraudulent loads, viewing customer and carrier data, and modifying shipment details.

**Priority accounts for dispatch:**
- TMS login
- DAT, Truckstop.com, or other load board portals
- Any customer or shipper communication portal that shows load details

**Practical note for dispatchers:** Authenticator apps generate a 6-digit code that refreshes every 30 seconds. When logging in, you enter your password first, then open the app and enter the current code. This adds about 10 seconds to your login process.

## Finance and AP/AR: Payment Portal MFA

Finance staff who access payment portals, accounting software, or banking platforms have the highest financial risk from compromised credentials. These accounts must have MFA — and wherever available, use a hardware security key or authenticator app rather than SMS.

**Priority accounts for finance:**
- Banking and ACH payment portals
- Accounting software (QuickBooks, etc.)
- Factoring company portals
- Payroll platforms

**Note on SMS MFA:** SMS-based MFA (text code to your phone) is better than nothing but is vulnerable to SIM swap attacks. For accounts that process payments, use an authenticator app rather than SMS if the platform allows it.

## Drivers: Phone-Based Accounts

Drivers operate largely from mobile devices. MFA for drivers focuses on the accounts accessible from their phones.

**Priority accounts for drivers:**
- ELD app account (if login-based)
- Load board apps (if they access these directly)
- Work email
- Any carrier portal or document scanning app

**Practical note for drivers:** Authenticator apps work fine on mobile. Microsoft Authenticator and Google Authenticator are both available on iOS and Android. When you change phones, migrate your authenticator app before wiping the old device — see the "lost phone" recovery article if you need to recover access.

## Admins and IT: Privileged Account MFA

Admin accounts — for company email administration, TMS administration, network devices, domain registrar, DNS — have broader access than individual user accounts. MFA for admin accounts should use the strongest available method (hardware key or authenticator app) and should never use SMS.

Admin accounts should also be separate from daily-use accounts. Log in as admin only when doing admin tasks.

## MFA for Shared or Service Accounts

Shared accounts are a known problem. Where shared accounts are unavoidable (a shared dispatch email alias, a shared load board login):
- Use MFA with an authenticator app on a device that is accessible to authorized staff.
- Document who has access to the authenticator device.
- Review shared account access whenever there is a staff change.

Ideally, move away from shared accounts over time. Individual accounts with appropriate access are more secure and more auditable.

## After Setup: Test Recovery

After enabling MFA, immediately:
1. Save your recovery codes in a secure location separate from the device being protected.
2. Test that you can log in with MFA on a new browser session.
3. Know where to go if you lose access to your MFA device — see the recovery articles.
