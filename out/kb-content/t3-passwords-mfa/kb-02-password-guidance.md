---
title: Password Guidance: Length, Passphrases, and Why Password Managers Work
type: training-content
topics: Passwords and Credential Security
source_trust: internal
---

# Password Guidance: Length, Passphrases, and Why Password Managers Work

Most people's passwords are weaker than they realize — and the practices that feel secure (adding special characters, rotating frequently) often do not help as much as you think. This article explains how passwords are attacked, what actually makes a password strong, and why a password manager is the practical solution for everyone managing business accounts.

## How Attackers Crack Passwords

**Credential stuffing:** An attacker takes a large list of username/password pairs from a previously leaked data breach and tries them against other services. This works because people reuse passwords. If your password for an unrelated website was leaked, and you used the same password for your TMS, the attacker now has your TMS access.

**Brute force and dictionary attacks:** Automated tools try millions of combinations per second against an offline password hash. Short passwords (under 12 characters) can be cracked quickly. "Password1!" is in every attacker's dictionary.

**Phishing for passwords:** As covered in the phishing module — attackers just ask. A convincing login page harvests your credentials without any cracking required.

**The implication:** Strong passwords protect against brute force and credential stuffing. Only MFA protects against credential theft through phishing — which is why both strong passwords AND MFA are required.

## What Makes a Password Strong

NIST (the National Institute of Standards and Technology) provides guidance on digital identity that informs modern password practice. The key takeaways for freight operations:

**Length matters most.** A 16-character password is exponentially harder to crack than an 8-character password, even if the 8-character one has symbols. A longer password beats a shorter "complex" one.

**Passphrases are excellent.** Four or more random words strung together ("freight dock monday orange") create a password that is long, memorable, and very hard to crack. It does not need a capital letter in an unusual place or an `@` instead of `a` — length is doing the work.

**Random beats predictable.** A password with your company name, a year, or your name is likely in attacker wordlists. Randomly generated passwords (from a password manager) are better.

**No forced rotation.** Changing passwords on a fixed schedule does not make them more secure — it leads to incremental changes ("Password1!" → "Password2!") that are easy to predict. Change your password when you have a reason to believe it was compromised, not on a calendar.

**No reuse across accounts.** This is the single most important habit. One breach of a low-value account (a shopping site, a newsletter) should not give an attacker access to your email or TMS. Unique passwords per account is the rule.

**Paste must work.** If a website blocks paste in the password field, they are making security harder without making it better. Do not let their poor design force you to use short, memorable passwords — use a password manager that can autofill instead of paste.

## Why Password Managers Solve the Problem

The reason people reuse and simplify passwords is that remembering dozens of unique, long passwords is impossible. A password manager solves this by:
- **Generating** strong, random, unique passwords for every account.
- **Storing** them securely in an encrypted vault.
- **Filling** them automatically when you log in.

You only need to remember one master password — the one that unlocks your vault. Make it a long, strong passphrase.

Password managers also alert you when a password appears in known data breaches, and they make it easy to identify where you have reused a password.

**For freight operations:** Every employee managing business accounts — TMS logins, email, load board accounts, payment portals — should be using a password manager. This is not optional for people with access to financial or operational systems.

## A Word on Security Questions

Security questions ("What was the name of your first pet?") are a weak alternative to strong passwords. The answers are often guessable or findable on social media. Where security questions are required, treat the answer as another password: generate a random answer with your password manager and store it. Do not use your actual pet's name.

## The Simplest Summary

- Long passphrase or password manager-generated password: strong
- Unique per account: required
- MFA on top: essential (see the MFA articles)
- The rest is noise
