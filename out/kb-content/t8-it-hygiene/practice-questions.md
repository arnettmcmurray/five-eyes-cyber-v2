---
title: "Practice Questions — Secure Systems Hygiene (20 questions)"
module: Secure IT Hygiene for Freight Operations
---

# Practice Questions: Secure Systems Hygiene

All questions are scenario-based. Format: stem + 4 options. Correct answer marked *.

---

**Q1.** You are the owner of a 15-truck carrier. Your MSP tells you they "patch everything monthly." You ask them to clarify what "everything" includes. Which of the following would NOT be covered by a statement like "we run Windows Update monthly"?

a) Windows OS security updates
b) Microsoft Edge browser updates
*c) Third-party browser (Chrome), email client (Outlook), and remote access software updates
d) Windows Defender definition updates

Explanation: Windows Update covers Microsoft products but does not automatically update third-party software like Chrome, standalone Outlook installations connected to third-party mail, or VPN clients. Patching "everything" must explicitly include third-party applications. Options A, B, and D are typically covered by Windows Update; C requires additional patch management tooling or manual attention.

---

**Q2.** You are a fleet manager. Your ELD vendor sends a firmware update notice for your 40-unit fleet. Your operations manager says "the trucks are all on the road — we'll push it when they come in for their next service, maybe six weeks from now." Based on CISA guidance, what is the appropriate response?

a) Six weeks is acceptable — ELD firmware is different from computer software.
b) Wait until the next scheduled maintenance regardless of severity — disrupting drivers mid-route is not worth it.
*c) Check whether the update addresses a critical or high-severity vulnerability. If critical, it must be applied within 14 days; if high, within 30 days — regardless of the service schedule.
d) Contact FMCSA to ask whether the firmware update is required for compliance before scheduling it.

Explanation: CISA CPG 1.E timelines (critical: 14 days; high: 30 days) apply to all networked systems including ELD firmware. NMFTA research has identified real CVEs in ELD systems. Waiting six weeks for a critical patch is non-compliant. Firmware updates can often be pushed remotely by the ELD vendor or applied by drivers — a physical service visit is not always required.

---

**Q3.** You are an owner-operator checking a port scan report your insurance broker sent you as part of a cyber audit. The report shows TCP port 3389 open and accessible on your office computer's public IP address. What does this mean and what should you do first?

a) Port 3389 is a standard web port — this is normal and requires no action.
b) This means your TMS is accessible from the internet, which is convenient. No change needed.
*c) Port 3389 is the Remote Desktop Protocol port. Having it open to the internet means attackers can attempt to brute-force your Windows login. Contact your MSP or IT provider today to block this port at the firewall.
d) This indicates your antivirus is misconfigured — run a scan and the port will close automatically.

Explanation: Port 3389 is RDP. An open RDP port is the single most common initial access vector for ransomware against SMBs. It must be blocked at the firewall and placed behind VPN if remote access is needed. It has no relationship to antivirus configuration.

---

**Q4.** Your MSP proposes adding a vendor access account for your new TMS provider. The MSP says the vendor wants "permanent always-on" access to assist with support issues. Based on your remote access policy, what should you require instead?

a) Permanent always-on access is standard practice — approve it.
b) Approve the access but ask the vendor to email you when they connect.
*c) Require that vendor access is time-limited (enabled for specific engagements and disabled afterward), tied to a named individual, protected by MFA, and that session logs are provided on request.
d) Ask the vendor to limit their access to business hours only, but allow it to remain always-on.

Explanation: Permanent, always-on vendor access without MFA is a documented attack vector — CISA has documented MSP-delivered ransomware incidents involving persistent vendor access. The policy requires time-limited, named, MFA-protected, logged access. "Business hours only" still leaves the access permanently open and uncontrolled.

---

**Q5.** You are reviewing your MSP contract renewal. The contract says they provide "enterprise antivirus." You want to ensure you have EDR coverage. What is the single most important question to ask?

a) "Does the antivirus include a firewall?"
b) "How often are antivirus signatures updated?"
*c) "Does this product use behavioral detection to identify novel threats, or only signature matching against known malware?"
d) "Is the antivirus compatible with Windows 11?"

Explanation: The core distinction between AV and EDR is behavioral detection of unknown threats vs. signature matching against known ones. Question C directly asks this. Signature update frequency (B) is an AV characteristic, not EDR. Firewall integration (A) and OS compatibility (D) are not the relevant distinguishing factors.

---

**Q6.** You are a dispatcher. Your company uses one shared "office" Windows login that all staff use during the day, and the same account is also used by the owner to manage the router and server remotely. An IT consultant calls this a "significant risk." Why?

a) Shared accounts are slow — each user should have their own account for performance reasons.
b) The shared account is probably easy to guess, since everyone knows the password.
*c) If any staff member is phished or their session is compromised, the attacker gains access to whatever that account can reach — including admin functions. There is also no way to determine who performed a specific action if an incident occurs.
d) Shared accounts violate FMCSA regulations.

Explanation: The risk is both privilege scope (an admin-level shared account gives attackers maximum access) and non-repudiation (shared accounts make incident investigation impossible — you cannot determine who did what). Shared accounts are prohibited under CIS Control 5 and CISA CPG 1.G guidance.

---

**Q7.** Your MSP confirms they have deployed antivirus on all company endpoints. During a quarterly review, you ask to see the central management dashboard. They say "we can pull individual reports from each machine, but there's no central view." What does this tell you about their endpoint protection setup?

a) This is normal — individual reports are sufficient for compliance.
b) This indicates your endpoints are not all running the same antivirus product.
*c) A lack of central visibility means your MSP cannot efficiently monitor all endpoints for active threats or missed updates. This is a gap in your endpoint protection management capability.
d) This is only a problem if you have more than 50 devices.

Explanation: Central management console visibility is a core requirement of enterprise-grade endpoint protection. Without it, the MSP cannot efficiently identify which endpoints have missed updates, which have active alerts, or which are offline. The number of devices is irrelevant — even 5 unmonitored endpoints represent unacceptable risk.

---

**Q8.** You are an owner-operator who manages your own systems. You use one Windows account for everything — email, browsing, TMS access, and router administration. To implement admin account separation with minimal disruption, what is the correct first step?

a) Create a new Windows account for a family member who helps with the business.
b) Change your current account's password to something stronger and enable MFA.
*c) Create a separate, standard (non-admin) user account for your daily work — email, browsing, TMS access — and reserve the existing admin account only for router and server management tasks.
d) Ask your MSP to remove your admin account entirely and replace it with a standard account.

Explanation: The correct implementation is to create a daily-use account without admin rights and use the existing admin account only for admin tasks. Removing admin entirely (D) leaves you unable to manage your systems. A stronger password (B) does not address the separation problem — admin credentials are still exposed to phishing through daily use. Adding a family member account (A) is irrelevant to privilege separation.

---

**Q9.** You receive a quarterly security checklist from your cyber insurer and item 5 says "Backups tested in last 90 days (offline copy exists)." Your MSP says backups run nightly to a cloud service. Is this checklist item confirmed as complete?

a) Yes — cloud backup is sufficient, and running nightly confirms it is working.
b) Yes — cloud backup counts as an offline copy because it is not physically at your office.
*c) Not yet. The item requires two things: (1) a tested restore — not just a running backup — within 90 days, and (2) an offline or air-gapped copy that cannot be reached by ransomware affecting the primary systems. Cloud backup connected 24/7 may be reachable by ransomware. Ask your MSP to confirm the restore test and whether the backup is isolated from ransomware propagation.
d) Yes — if the backup has been running for more than 90 days, it qualifies as tested.

Explanation: A backup that has never been restored is untested. Cloud backups that are always-connected can be encrypted or deleted by ransomware that gains sufficient access. The checklist item explicitly requires both a documented restore test and an offline/air-gapped copy. Neither is satisfied by "nightly cloud backups running."

---

**Q10.** You are a freight broker. A former employee left the company 45 days ago. During your quarterly user access review, you discover their Microsoft 365 account is still active. What is the correct response?

a) Disable the account and document the action. Review all other accounts in the same review cycle.
b) Send the former employee an email asking them to delete their own account.
*c) Disable the account immediately, export any business-relevant email if needed, and investigate whether the account has been accessed since the employee's departure. Document the finding as part of the quarterly review.
d) Leave the account active until the end of the billing month to avoid wasting the license.

Explanation: Active accounts for former employees are a direct security risk — the former employee retains access, and their credentials may have been shared or compromised. Immediate disablement is required. If the account was accessed after departure, that is a potential security incident. Option D (leaving it for billing reasons) is never an acceptable justification for maintaining unnecessary access.

---

**Q11.** You are discussing your MSP contract and want to confirm logging requirements. Which statement best describes what you should require?

a) Logs should be retained for at least 7 days in case you need to check something.
b) Logging is only necessary on your email server — other endpoints do not generate useful logs.
*c) Security event logging should be enabled on all managed endpoints and servers, and logs should be retained for a minimum of 90 days — long enough to investigate an incident that may have started weeks before detection.
d) Your MSP's internal logs are sufficient — you do not need to be able to access them independently.

Explanation: Ransomware attackers frequently spend days or weeks inside a network before triggering encryption. A 90-day log retention window provides the historical data needed to investigate when the initial access occurred and what the attacker accessed. 7 days is insufficient. All endpoints generate relevant security events, not just email servers. Logs that only your MSP can access leave you dependent on them for incident investigation.

---

**Q12.** You are an owner of a freight brokerage. Your MSP says they have MFA enabled on your Microsoft 365 environment. To verify this is true and complete, what should you ask to see?

a) A screenshot of one user's MFA settings page.
b) The MFA setup email that was sent to users when it was configured.
*c) A report from the Microsoft Entra ID (Azure AD) admin console showing which accounts have MFA enforced via Conditional Access policy — not just which accounts have MFA registered.
d) Your MSP's internal documentation stating MFA was configured.

Explanation: The distinction between MFA "registered" and MFA "enforced" is critical. A user can have MFA registered but still be able to sign in without it if enforcement via Conditional Access policy is not configured. Only a Conditional Access policy report from the admin console confirms that MFA cannot be bypassed. Screenshots of one account (A), setup emails (B), and internal documentation (D) do not prove system-wide enforcement.

---

**Q13.** You are a dispatcher. Your manager asks you to log into the TMS admin panel using the shared "admin" credentials posted on the office whiteboard to add a new carrier. What should you do?

a) Log in using the shared credentials — the manager approved it.
*b) Do not use the shared admin credentials. Let your manager know that shared admin credentials are a security violation — the correct approach is for each admin user to have individual credentials. Escalate to your IT contact or MSP to get an individual admin account if needed for this task.
c) Log in using the shared credentials but change the password afterward.
d) Log in using the shared credentials only once and report it to IT after completing the task.

Explanation: Shared admin credentials are prohibited regardless of manager approval. Every admin action must be tied to a named individual for accountability and incident investigation purposes. Using shared credentials "just this once" normalizes the practice and contributes to the ongoing risk. The correct action is to decline and escalate.

---

**Q14.** You receive a cyber insurance renewal application asking whether you have EDR deployed. Your MSP says you have "Windows Defender." Is the answer yes or no?

a) No — Windows Defender is only AV and does not qualify as EDR.
*b) It depends. Windows Defender Antivirus is signature-based AV. Microsoft Defender for Business (a separate, paid product) includes EDR capability. Confirm with your MSP which specific product is deployed and whether it includes behavioral detection and response capability.
c) Yes — any product from Microsoft qualifies as EDR.
d) Yes — Windows Defender is included with Windows and is therefore equivalent to any third-party EDR product.

Explanation: "Windows Defender" can refer to the built-in AV or to the paid Defender for Business / Defender for Endpoint products with EDR capability. The insurer wants to know whether behavioral detection is deployed. Confirm the exact product name and feature set with your MSP before answering. The free built-in AV is not EDR; Defender for Business is.

---

**Q15.** You are reviewing your incident response contact list as part of the quarterly checklist. You find a printout from 18 months ago with your MSP's old support number and a cyber insurer contact from a policy that has since been renewed with a different carrier. What action is required?

a) The list is close enough — phone numbers rarely change.
b) Update the insurer contact but leave the MSP number, since you have worked with them for years.
*c) Update the entire list with current, verified contact information: MSP emergency line, current cyber insurer breach response number, FBI IC3.gov reporting, CISA reporting line, and internal escalation contacts. Print or save a copy accessible without company systems.
d) Confirm the information is correct by calling each number during business hours before posting the updated list.

Explanation: An incident response contact list with wrong numbers fails at the moment you need it most. All contacts must be current. The requirement for a copy accessible without company systems is also important — if systems are down due to ransomware, you cannot access a contact list stored on those systems. Option D is partially correct (verify the numbers) but incomplete — you also need to update the list and ensure offline accessibility.

---

**Q16.** You are an owner-operator and you run a port scan using a free online tool. You find that port 3389 (RDP) is closed but port 22 (SSH) is open and accessible from the internet. How should you assess this?

a) SSH is more secure than RDP, so this is acceptable.
b) Port 22 is for file transfers — it does not represent a remote access risk.
*c) An open SSH port is a remote access exposure similar to open RDP. It should be reviewed — confirm it is necessary, ensure it requires key-based authentication (not password), and consider placing it behind a VPN or using a non-standard port with access restrictions.
d) Since RDP is closed, you have met all remote access security requirements.

Explanation: SSH (port 22) provides remote command-line access to servers and is subject to brute-force attacks just as RDP is. It requires the same controls: MFA or key-based authentication, VPN protection if possible, and logging. Closing RDP while leaving SSH open does not satisfy remote access security requirements. Option B is wrong — port 22 is for remote shell access, not file transfers (that is SFTP, which runs on SSH but is a different protocol).

---

**Q17.** You complete your quarterly security checklist and find that phishing awareness training has not been completed for three of your five dispatch staff in the past 6 months. What is the correct response?

a) Note it in the checklist and bring it up at the next annual review.
b) Send the three staff members the training link and consider it complete once they respond.
*c) Assign the training immediately with a completion deadline of no more than 30 days. Document the gap and the remediation action in the quarterly checklist record. Confirm completion before the next quarter.
d) Training completion is a best practice, not a requirement — if the business is busy, it can wait.

Explanation: Phishing awareness training has a 6-month cadence because threat patterns evolve and retention degrades. A gap of more than 6 months means those employees are operating without current awareness of active lure patterns. The checklist item is not confirmed as complete until all in-scope staff have completed training. Noting it for annual review (A) does not address the current gap.

---

**Q18.** Your MSP proposes to your freight brokerage that they set up "persistent remote management access" on your server using a remote management tool that will always be connected. They say it's necessary for monitoring. What questions should you ask before approving?

a) Whether the tool is compatible with your Windows version.
*b) How the access is authenticated (is MFA required?), whether session activity is logged and available to you on request, how you will disable the access if the MSP relationship ends, and what specific systems the tool can reach.
c) Whether the monthly cost is included in your MSP fee.
d) Whether other freight companies in your area use the same tool.

Explanation: Persistent remote management access represents a standing attack surface. The security questions — authentication strength, session logging, access scope, and revocability — are the relevant considerations. Compatibility, cost, and peer adoption do not address the security risk of always-on remote access.

---

**Q19.** You are a small carrier owner who just learned that a prior breach exposed your email password on the dark web. You use the same password for your email account and your TMS admin account. The password is now known to attackers. What is the immediate priority?

a) Change your email password only — attackers are interested in email, not TMS.
b) Notify your customers that their data may have been compromised.
*c) Change the password on all accounts that use the same password immediately, starting with admin accounts. Enable MFA on all accounts where it is not already active. Contact your MSP to check for unauthorized access. This is also the moment to implement separate admin accounts with unique credentials.
d) Run an antivirus scan to check whether your computer has been compromised.

Explanation: Password reuse means every account with that password is compromised. Admin accounts are higher priority because of their access scope. MFA prevents the stolen credential from being immediately useful even if changing it takes minutes longer. An AV scan (D) addresses malware, not credential compromise — these are separate problems.

---

**Q20.** You are conducting your quarterly MSP review using the 12-item SMB checklist. Your MSP cannot confirm the status of items 3 (patch cycle), 7 (no exposed RDP), or 9 (logging enabled). They say "we believe those are fine." What is the appropriate response?

a) Accept the verbal assurance — if it were a problem, you would have noticed by now.
b) Mark those items as complete and follow up at the next quarterly review.
*c) Do not accept unverified assurance for security controls. Request written confirmation and documentation — a patch status report, a firewall rule confirmation, and a logging status report — with a deadline. Items that cannot be confirmed as complete are open risks that require documented remediation timelines.
d) Replace the MSP immediately for failing to maintain adequate documentation.

Explanation: The checklist is designed to produce documented, verifiable answers — not verbal assurances. Unconfirmed controls are open risks. Requesting documentation with a deadline is the appropriate response; it is not grounds for immediate MSP replacement (though persistent inability to provide basic documentation would be a serious concern). "We believe that's fine" is not an acceptable answer for a control tied to your ability to detect or survive a ransomware incident.
