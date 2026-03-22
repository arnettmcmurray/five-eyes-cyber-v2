---
title: MFA Frequently Asked Questions
type: faq
topics: MFA
source_trust: internal
---

# MFA Frequently Asked Questions

**What is multi-factor authentication (MFA)?**

MFA requires you to provide two or more pieces of evidence to prove your identity when logging in:
1. Something you know (your password)
2. Something you have (your phone, a hardware key) or something you are (fingerprint/face)

Even if someone steals your password, they cannot log in without also having the second factor.

---

**Why do I have to use MFA? My password is strong.**

Passwords are regularly stolen without any failure on your part — through data breaches at other services you use, through phishing attacks, and through credential-stuffing attacks that try leaked passwords across many sites. A strong password is no longer sufficient protection for accounts that access freight operations, payment systems, or customer data. MFA adds a layer that a stolen password alone cannot bypass.

---

**Which MFA method is most secure?**

From most to least secure:
1. **Hardware security key** (YubiKey etc.) — phishing-resistant; not affected by SIM swaps
2. **Authenticator app** (Microsoft Authenticator, Google Authenticator, Authy) — strong and practical
3. **Push notification** (an app that asks you to approve or deny a login) — convenient but can be defeated by prompt bombing
4. **Email code** — acceptable but depends on your email account being secure
5. **SMS text code** — acceptable but weakest, vulnerable to SIM swap attacks

For accounts that process payments (factoring portals, banking, accounting software), use an authenticator app or hardware key rather than SMS.

---

**What is "MFA fatigue" and how do I handle it?**

Some MFA systems send push notifications that just say "Approve?" with no detail. Attackers exploit this by sending dozens of approval requests in rapid succession, hoping you approve one by mistake or just to stop the notifications.

If you receive MFA approval requests you did not initiate, **do not approve them**. This means someone has your password and is actively trying to log in. Decline the request, change your password immediately, and report to your supervisor.

---

**What happens if I get a new phone?**

Before you wipe or transfer your old phone:
1. Set up your new phone first.
2. In your authenticator app (most support this), look for a "transfer accounts" or "export accounts" option.
3. Transfer your authenticator accounts to the new phone while you still have the old one.
4. Test that MFA codes work on the new phone for your most important accounts.
5. Then wipe the old phone.

If you have already switched phones without transferring — see the "Lost phone: MFA recovery" article.

---

**What are recovery codes and where should I store them?**

When you set up MFA on most services, you are given a set of one-time recovery codes. These allow you to access your account if you lose your MFA device.

Store recovery codes:
- In your password manager vault (in the same entry as the account password)
- Or printed and stored in a secure physical location

Do not store them in the same email inbox or on the same device the MFA is protecting. If that device is compromised or lost, you still need a way in.

---

**My platform does not support MFA. What should I do?**

Report this to your supervisor and IT contact. If a business-critical platform does not support MFA, this is a security risk that the company needs to assess — including whether to seek alternatives or apply compensating controls. Do not treat "it does not support MFA" as an acceptable long-term answer for Tier 1 accounts.

---

**Does MFA protect me from phishing?**

Standard MFA (SMS code, authenticator app code) reduces phishing risk significantly but is not completely phishing-resistant. Sophisticated phishing sites can intercept MFA codes in real time.

Hardware security keys (like YubiKey) are fully phishing-resistant — they will not work on fake sites.

For most people in freight operations, authenticator app MFA is a large improvement over no MFA. Do not let "it is not perfect" be a reason to skip it.

---

**Who do I contact for help setting up MFA?**

Contact your supervisor or IT/MSP contact. Setting up MFA on your core business accounts should be treated as a priority task, not a nice-to-have.
