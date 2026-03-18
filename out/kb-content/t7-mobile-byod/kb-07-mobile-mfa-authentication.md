---
title: "Mobile MFA and Authentication: What Works and What Doesn't"
type: faq
topics:
  - Mobile Device and BYOD Security
source_trust: T0
freshness_cycle: 12mo
---

# Mobile MFA and Authentication: What Works and What Doesn't

---

**Q: Is SMS-based MFA — a text code sent to my phone — safe to use for freight accounts?**

It is better than no MFA at all, and you should use it if it's the only option. But it has real weaknesses. SIM-swapping attacks — where an attacker convinces your carrier to transfer your phone number to a SIM they control — redirect those codes directly to the attacker. Additionally, if your phone itself is compromised, the attacker on the device receives the code as it arrives. For DAT accounts, TMS logins, and freight email, use an authenticator app if the platform supports it. When both options are available, authenticator apps are the better choice.

---

**Q: My ELD companion app doesn't support MFA at all. What should I do?**

Use a strong, unique password for that account — one you are not using for any other service. A strong password is long (12+ characters), random, and not based on your name, truck number, CDL number, or anything else guessable from your professional identity. Beyond that: report to your fleet manager that the ELD vendor doesn't support MFA. This is a documented security gap. Fleet managers should be raising this with vendors at contract time and at renewal — MFA support is now a baseline expectation for any platform handling compliance and operational data.

---

**Q: I use the same password for my DAT account, my Truckstop account, and my personal email. Is that actually a risk?**

Yes. This is called credential stuffing, and it's a standard attacker technique. When login credentials are stolen from one platform — through a data breach, a phishing page, or malware — attackers immediately run those credentials against other popular platforms automatically. If your DAT password matches your email password, a DAT credential compromise is also an email compromise. And email is how you reset every other password. Use a password manager (Bitwarden, 1Password, and similar tools are available on mobile) to generate and store unique passwords for each freight platform. The manager remembers them; you don't have to.

---

**Q: What's the safest authenticator app for freight workers?**

Google Authenticator, Microsoft Authenticator, and Authy are all acceptable and widely supported. Google Authenticator is supported by the broadest range of freight and logistics platforms. Authy adds multi-device sync and cloud backup, which matters for the lost-phone scenario. Microsoft Authenticator integrates well if your company uses Microsoft 365 for freight operations. All three are free and available on iOS and Android. The key choice is authenticator app over SMS — not which specific authenticator app.

---

**Q: What if I lose my phone and I'm locked out of my authenticator app? I can't log in to anything.**

This is the most common reason people cite for not setting up MFA — and it's a real problem with a straightforward solution. When you enroll in MFA on any platform, the platform generates backup codes at enrollment time. These are one-time-use codes that let you log in if your authenticator is unavailable. Save those codes in a secure place that is not on the device you're protecting: a printed copy in a secure location, a password manager on a separate device, or a secure notes app with a different login. If you are locked out because you lost your phone, report to IT immediately. IT can assist with account recovery and will need to verify your identity through alternative means before restoring access to freight platforms.

---

**Q: Someone told me biometric authentication — fingerprint or Face ID — is unsafe. Should I use a PIN instead?**

Biometrics are acceptable as part of a layered approach. On a properly secured device, fingerprint or Face ID combined with a device PIN is a reasonable configuration — the biometric is convenient for routine unlocks, and the PIN remains the fallback. The concern with biometrics is that they cannot be changed if compromised, and in some legal jurisdictions a device owner can be compelled to unlock a device with biometrics in ways they cannot be compelled to reveal a PIN. For freight purposes, the practical risk is the device being unlocked by an unauthorized person. A 6-digit PIN with 5-minute auto-lock addresses this. Biometrics plus PIN is standard recommended practice per NIST SP 800-124r2 and is appropriate for the freight mobile context.
