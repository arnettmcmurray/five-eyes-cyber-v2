---
title: Account Security and MFA
module_type: learner-module
estimated_minutes: 20
topics: Passwords and Credential Security, MFA
---

# Module: Account Security and MFA

## Module Purpose
Teach all freight company roles how credential theft leads to account takeover and how strong passwords plus MFA close the gap. Emphasis on the practical consequences for freight operations (not abstract IT concepts) and the specific steps to set up and maintain MFA.

## Learning Objectives
By the end of this module, learners will be able to:
1. Explain how account takeover happens in freight (credential theft → TMS/email access → cargo or payment fraud).
2. Apply NIST-aligned password practices: length, passphrases, unique passwords, no forced rotation.
3. Enable MFA on priority accounts.
4. Respond correctly to MFA fatigue/prompt bombing.
5. Recover access after a lost phone or compromised account.

---

## Module Structure

### Lesson 1: Why Your Password Is Not Enough (5 min)
**KB source:** kb-06-account-takeover-in-freight.md, kb-02-password-guidance.md

**Core idea:** Passwords are stolen routinely without any mistake on your part — from breaches of unrelated sites, from phishing attacks, from malware. In freight, a stolen dispatch or email credential is not just an IT problem — it is a direct path to rerouted loads, BEC fraud, and compromised customer relationships.

**Scenario:** "An attacker bought your dispatch email credentials from a breach database for $5. Your password was from a news site account you created in 2019. Walk through what the attacker can now do with your email."

This makes the threat concrete: it is not about being careless. It is about the scale of credential theft online.

### Lesson 2: Passwords That Actually Work (5 min)
**KB source:** kb-02-password-guidance.md, kb-01-account-security-standard.md

**Core idea:** Long beats complex. Unique is non-negotiable. Password managers solve the "too many passwords" problem. Three rules: use a passphrase or generated password, never reuse across accounts, use a password manager for business accounts.

**Demonstration:** Show the math — 8-character password with symbols vs. 16-character passphrase. Length wins.

**Action step:** Identify which business accounts you currently use the same or similar passwords for. Those all need new, unique passwords — starting with email and TMS.

### Lesson 3: MFA — The Lock Behind the Password (5 min)
**KB source:** kb-03-mfa-deployment-guide.md, kb-04-mfa-faq.md

**Core idea:** Even if your password is stolen, MFA stops the attacker from logging in. The extra 10 seconds to enter a code is the difference between "credential theft" and "credential theft that becomes an account takeover."

**Role-specific:** Show the MFA setup process for the learner's role (dispatcher: TMS and load board; finance: payment portals; driver: email and ELD app).

**Important note:** If you receive MFA approval requests you did not initiate — deny them and report immediately. Someone has your password.

### Lesson 4: Privilege Separation and Clean Access (3 min)
**KB source:** kb-05-privilege-separation.md

**Core idea:** If you have admin access to your TMS or email system, use a separate account for that. Your daily email account gets exposed to every phishing email and risky website. Keeping admin access in a separate account limits the blast radius of a daily-use account compromise.

This lesson is most relevant to owners, IT leads, and operations managers with elevated system access.

### Lesson 5: Recovery Scenarios (2 min)
**KB source:** kb-07-lost-phone-mfa-recovery.md, remediation cards

**Core idea:** Recovery codes are the insurance policy for MFA. Save them now, before you need them. If you lose your phone, the sequence is: supervisor + IT → recovery codes → email first → other accounts.

---

## Practice Questions
Use `practice-questions.md` — 28 scenario questions.

**Recommended for practice module:** 10 questions weighted toward Lessons 2 and 3.

## Remediation Path
Learners who score below 70%:
- Review Lesson 2 (password guidance) and Lesson 3 (MFA setup and response).
- Key concepts: unique passwords, MFA priority accounts, MFA fatigue response.

Remediation KB items:
- kb-02-password-guidance.md
- kb-03-mfa-deployment-guide.md
