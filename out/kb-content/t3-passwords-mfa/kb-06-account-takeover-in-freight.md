---
title: Account Takeover in Freight: From Stolen Credentials to Rerouted Loads
type: threat-brief
topics: Passwords and Credential Security, MFA
source_trust: internal
---

# Account Takeover in Freight: From Stolen Credentials to Rerouted Loads

Account takeover (ATO) is what happens after credential theft succeeds. An attacker has your username and password for a business-critical system. This brief traces what they can do with that access in a freight operation — from the moment they log in to the point where a real shipment is redirected or a real payment is changed.

## The Initial Access: How Credentials Are Stolen

Credentials end up in attackers' hands through several reliable channels:

**Phishing** — A fake login page captures your credentials. You think you are logging into your TMS or email; you are actually handing them to an attacker.

**Data breach reuse** — A website you used years ago was breached and your email/password combination is in a leak database. If you used the same password for business accounts, the attacker now has those too. This is why unique passwords per account matter.

**Keyloggers** — Malware installed through a phishing email or a compromised download logs every keystroke, including the passwords you type.

**Credential marketplace purchases** — Stolen credentials are bought and sold on criminal marketplaces. An attacker does not need to steal the credentials themselves — they can buy access to your industry segment's accounts.

## What Happens When a Load Board Account Is Taken Over

Load board accounts (DAT, Truckstop, etc.) have more access than they might appear to:

1. **The attacker accepts loads** posted to the load board on behalf of a carrier — a carrier that may not exist or may be a fraudulent front. The shipment leaves the legitimate shipper's dock with a fake carrier.

2. **The attacker monitors load postings** by your competitors, shippers, and brokers — intelligence useful for further fraud planning.

3. **The attacker changes carrier profile details** — contact number, email, bank details — before loads are delivered or payments processed.

4. **The attacker sends messages** from your account to customers and partners that appear to come from you.

The FBI has specifically warned brokers and shippers to verify driver and equipment identifiers independently, precisely because load board accounts can be compromised and used to create fraudulent load arrangements.

## What Happens When a TMS Account Is Taken Over

A compromised TMS account gives an attacker a window into your entire operation:

- Shipment details: origins, destinations, cargo types, high-value load schedules.
- Customer and carrier contact information.
- Delivery windows and pickup appointment times — useful for planning a physical interception.
- The ability to modify shipment records: change delivery addresses, swap carrier assignments.
- In some TMS platforms: the ability to trigger payment actions or change billing records.

An attacker with TMS access and patience can monitor your operations for weeks before taking action, timing a fraudulent load pickup to coincide with a legitimate one they know is scheduled.

## What Happens When Email Is Taken Over

Email is the most dangerous account takeover because email is the recovery method for every other account. An attacker with email access can:

- Reset passwords for every account that uses that email for recovery.
- Set up forwarding rules that quietly copy all incoming email to an attacker-controlled address — often invisible in the email client but active in the background.
- Send emails to your customers, vendors, and carriers — and they will trust them because the email comes from your real address.
- Read historical correspondence to understand your business relationships, payment patterns, and operational details — intelligence used for targeted BEC attacks.

**A frequent TMS for email ATO:** The attacker sets up a forwarding rule and never changes the password. You never know your email is compromised. For weeks, every email about payments, load schedules, and carrier changes is being read by the attacker — who uses this information to craft a perfectly timed BEC attempt.

## How MFA Stops Account Takeover

If MFA is enabled, a stolen password alone does not provide access. The attacker also needs the second factor — typically a code from your authenticator app or a hardware key only you physically possess.

For the vast majority of ATO attempts — which use credentials stolen from breaches or phishing — MFA is a complete stop. The credentials work, but without the second factor, the login fails.

This is why MFA is treated as non-negotiable for email, TMS, and payment portals: it converts credential theft from "full access" to "the attacker has a password but cannot use it."
