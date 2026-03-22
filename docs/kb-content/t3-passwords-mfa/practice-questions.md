---
title: Practice Questions — Passwords and Credential Security / MFA (28 questions)
module: Account Security and MFA
---

# Practice Questions: Passwords and Credential Security / MFA

All questions are scenario-based. Correct answer marked *.

---

**Q1.** An employee uses the same password for their work email, TMS login, and a personal news site they registered years ago. A data breach at the news site exposes the password. What is the risk to the freight company?

A) Minimal — the breach is at an unrelated site.
*B) High — the attacker can now attempt that password against the work email and TMS, which may grant access to dispatch operations and communications.
C) Moderate — the attacker would need to also guess the username.
D) Low — the TMS requires a different username format.

---

**Q2.** A dispatcher's TMS account shows a login from an unfamiliar city at 2 AM. The dispatcher did not log in at that time. What should happen immediately?

A) Change the TMS password and monitor for more activity.
*B) Change the password, revoke all active sessions, check for unauthorized changes in the TMS, enable MFA if not already active, and report to a supervisor.
C) Contact the TMS vendor to ask about the login.
D) Wait to see if additional suspicious activity occurs before escalating.

---

**Q3.** Which of the following passwords is the strongest?

A) `D!spatch@2024` (12 characters with uppercase, symbols, number)
*B) `freight dock monday orange` (26 characters, four random words)
C) `P@ssw0rd123!` (12 characters with symbol substitution)
D) `CarrierRouteNorth52` (19 characters, but predictable pattern)

---

**Q4.** According to NIST digital identity guidance, when should you change a password?

A) Every 90 days, regardless of whether a breach occurred.
B) Every 30 days for business accounts.
*C) When you have reason to believe it was compromised, when you receive a breach notification, or when your IT/security contact requests it.
D) Annually, during your security review.

---

**Q5.** A dispatcher receives three MFA approval notifications on their phone for their TMS account within two minutes — they did not initiate any login. What does this indicate?

A) A system error is generating phantom notifications.
*B) Someone has the dispatcher's TMS password and is attempting to log in, hoping the dispatcher will approve one of the push notifications.
C) The TMS account needs to be reconfigured.
D) The dispatcher's phone needs a software update.

---

**Q6.** What is the correct response to receiving MFA approval requests you did not initiate?

*A) Deny all requests, change your password immediately, report to your supervisor, and check the account for unauthorized access.
B) Approve one to stop the notifications, then change your password.
C) Ignore the notifications — they will stop on their own.
D) Contact your phone carrier about the notifications.

---

**Q7.** Which MFA method is most secure for a finance employee who manages payment portals?

A) SMS text codes.
B) Email verification codes.
*C) An authenticator app (Microsoft Authenticator, Google Authenticator) or hardware security key.
D) A backup email address.

---

**Q8.** An employee has admin access to the company's TMS and uses the same account for daily email and dispatch work. Why is this a security risk?

*A) If their daily-use account is compromised through phishing or a credential breach, the attacker immediately has TMS admin access — the most privileged access in the system.
B) Admin accounts are slower to log in.
C) Daily use causes admin accounts to accumulate unnecessary email.
D) This is acceptable practice if the account has a strong password.

---

**Q9.** A driver changes phones. What should they do before wiping the old phone?

A) Nothing — authenticator apps restore automatically from the app store.
*B) Transfer authenticator app accounts to the new phone first, then verify MFA works on the new phone, then wipe the old one.
C) Uninstall the authenticator app from the old phone before setting up the new one.
D) Contact IT to reset all MFA accounts and start fresh on the new phone.

---

**Q10.** A broker's employee requests a carrier portal login for a small partner carrier. The portal only requires a username and password. The broker's IT team should:

A) Accept this as the carrier's decision — they control their own systems.
*B) Ask whether the portal supports MFA and, if not, flag this as a risk and explore whether compensating controls are needed.
C) Create the login and monitor it for unusual activity.
D) Require the carrier to use a separate portal that supports MFA.

---

**Q11.** Which account should receive MFA protection first in a freight company?

A) The TMS account.
B) The load board account.
*C) Business email — because email is the recovery mechanism for every other account and the most targeted account in BEC attacks.
D) The accounting software account.

---

**Q12.** What is the primary benefit of using a password manager for business accounts?

A) Password managers make login faster.
B) Password managers provide more secure storage than browser-saved passwords.
*C) Password managers allow you to use unique, strong passwords for every account without needing to remember them all — eliminating the reuse problem.
D) Password managers protect against phishing attacks on their own.

---

**Q13.** An employee who managed carrier onboarding leaves the company. Their TMS account is kept active "in case we need to look something up." Why is this a problem?

*A) An active account with no active owner is an unmonitored access point — it could be misused by the departed employee, or its credentials could be compromised without detection.
B) Unused accounts cause TMS performance issues.
C) The account may have billing implications.
D) It is only a problem if the employee left on bad terms.

---

**Q14.** A carrier's operations manager uses their email address as the username and a predictable password for their load board account. An attacker who knows the email address and uses a credential list from a prior breach succeeds in logging in. What could they do?

A) Only view public load listings.
*B) Accept loads as that carrier, change carrier profile details including payment information, and send messages to brokers and shippers that appear to come from the legitimate carrier.
C) Only view past loads for that carrier.
D) Only view rate information.

---

**Q15.** What does it mean when MFA recovery codes are described as "one-time use"?

A) They expire after 24 hours.
*B) Each code can only be used once — after use, it is invalid. Generate new codes after using one.
C) They can only be used within the first month after MFA setup.
D) They only work during business hours.

---

**Q16.** A finance coordinator receives an email from their accounting software vendor saying their login was detected in an unusual location. They are in the office at the time. What should they do?

A) Ignore it — this is likely an automated false alarm.
*B) Do not use that account until they verify through the vendor's official website whether there was a real unauthorized login. Change the password and check active sessions.
C) Reply to the email confirming they are in the office.
D) Enable MFA on the account and resume normal use.

---

**Q17.** Which of the following is true about SMS-based MFA?

A) SMS MFA is equivalent in security to authenticator app MFA.
*B) SMS MFA is better than no MFA but is vulnerable to SIM swap attacks — attackers can sometimes redirect your phone number to a SIM they control. Authenticator apps are more secure.
C) SMS MFA is the most recommended MFA method.
D) SMS MFA is not an acceptable MFA method for any business accounts.

---

**Q18.** An employee creates a new, strong, unique password for their TMS account but does not enable MFA. A phishing email then captures their new password. What is the outcome?

*A) The attacker has full TMS access — a strong password alone does not protect against credential theft via phishing.
B) The attacker cannot use the password because it is unique and not in their breach databases.
C) The strong password makes the attacker's login attempt detectable.
D) The TMS will require re-verification after detecting a new login.

---

**Q19.** After a data breach notification from an unrelated service, an employee confirms they used the same email and password combination for their work email. The recommended immediate actions are:

*A) Change the work email password immediately to a unique, strong password, enable MFA if not already active, and revoke active sessions in the email account.
B) Wait for IT to assess the breach impact before making changes.
C) Change the password on the breached service only — the work email uses a different login portal.
D) Report to a supervisor and take no additional action until directed.

---

**Q20.** A shared "company" load board login is used by three dispatchers. One dispatcher leaves. What is the correct action?

A) Remove the departed dispatcher from the shared login documentation.
*B) Change the shared account password immediately and distribute the new credentials to remaining authorized dispatchers. Better yet, transition to individual accounts.
C) Monitor the account for any activity from the departed employee's device.
D) No action needed — the departed employee no longer has the physical device used to log in.

---

**Q21.** What should an employee do with MFA recovery codes immediately after setting up MFA on a critical account?

A) Memorize the first two codes.
B) Screenshot the codes and store them in the phone's camera roll.
*C) Save the codes in their password manager or print them and store in a secure physical location — not in the same email inbox or on the same device the MFA protects.
D) Email the codes to their supervisor for safekeeping.

---

**Q22.** A freight company's owner uses the same login for their company email admin panel and their daily email. This violates which security principle?

A) Least authority
*B) Privilege separation — admin access should use a dedicated account separate from daily-use accounts.
C) Multi-factor authentication
D) Password uniqueness

---

**Q23.** An attacker sets up an email forwarding rule on a compromised dispatch account and then resets the password back to the original. What is the likely goal?

*A) To monitor all incoming email (including load details, payment information, and carrier contacts) without triggering a locked-account alert — enabling a long-term, covert presence.
B) To block the account from receiving legitimate emails.
C) To access the dispatcher's personal contacts.
D) To test whether MFA would trigger an alert.

---

**Q24.** Which of the following password creation approaches aligns with NIST SP 800-63B guidance?

A) Using a 10-character password with required complexity rules (uppercase, number, symbol).
B) Rotating passwords every 90 days.
*C) Using a long passphrase or password manager-generated password, without forcing arbitrary periodic rotation.
D) Using the company name plus a memorable number.

---

**Q25.** A driver's personal smartphone is stolen. The driver used it for their ELD app, work email, and personal accounts. What is the most urgent security action?

A) Report the loss to the phone carrier only.
*B) Report to the supervisor and IT contact immediately, remotely wipe the device if possible, change passwords on business accounts accessed from the phone, and revoke MFA devices associated with the lost phone.
C) Change the driver's ELD PIN only.
D) Wait to see if the phone can be located before taking account-related action.

---

**Q26.** An employee with both TMS user and admin access asks why they need separate accounts. The best explanation is:

*A) "If your daily account is compromised — for example through a phishing email — keeping admin access in a separate account means the attacker does not automatically have the power to modify other users, change system settings, or disable security controls."
B) "Separate accounts are required by regulation."
C) "Admin accounts have different session timeouts."
D) "Separate accounts allow IT to audit admin activity separately from user activity."

---

**Q27.** A freight company has 12 employees. How many of them need MFA on their business email accounts?

A) Only those who handle financial transactions.
B) Only those who access systems with sensitive data.
*C) All 12 — business email is the recovery mechanism for every other business account and the primary target for account takeover and BEC attacks.
D) Only those with admin-level access.

---

**Q28.** What is the most important immediate action when an employee believes their TMS or email account was accessed without their authorization?

A) Change their password and monitor for one week.
*B) Report to their supervisor immediately, change the password from an unaffected device, revoke all active sessions, and check for unauthorized changes — do not delay action while waiting for certainty.
C) Contact the TMS or email vendor's support line.
D) Disable the account temporarily to stop unauthorized access.
