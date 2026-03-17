---
title: Practice Questions — Third-Party and Vendor Risk (20 questions)
module: Third-Party and Vendor Risk in Freight
---

# Practice Questions: Third-Party and Vendor Risk in Freight

All questions are scenario-based. Correct answer marked with asterisk (*).

---

**Q1. Your company uses a cloud-based TMS, an ELD fleet management portal, a factoring platform, and Microsoft 365 with an MSP managing IT. You are building a vendor access register for the first time. Which of the following vendor relationships carries the highest potential blast radius if the vendor's account is compromised?**

a) The load board account manager who helps with billing disputes
b) The ELD vendor support rep who can access vehicle location and driver hours
*c) The MSP that holds Global Administrator access to Microsoft 365
d) The fuel card account manager who can view transaction history

Explanation: Global Administrator access to Microsoft 365 means the MSP can read any mailbox, reset any password, and create new accounts — full access to the company's communications. ELD, load board, and fuel card access are significant but narrower in scope. MSP admin compromise is what CISA has documented leading to multi-client ransomware events.

---

**Q2. You are building your vendor access register. Which of the following entries is complete enough to be useful during an incident?**

a) Vendor: TMS Co. | Access: TMS | Contact: their support line
b) Vendor: TMS Co. | Access: TMS admin | Granted: last year
*c) Vendor: TMS Co. | System: TMS (read/write all records) | Level: Admin | Contact: J. Rivera, 800-555-0192 | Granted: 2024-11-01 | Review: 2025-02-01
d) Vendor: TMS Co. | Access: admin | Contact: sales rep email

Explanation: A useful vendor access register entry requires the system name, access level, a named contact with a reachable number, a grant date, and a review date. Options A, B, and D are missing critical fields that would slow response during an incident or access audit.

---

**Q3. Your company's vendor access register shows your factoring company's portal as "read/write." What data does that access level most likely allow the vendor to see or modify?**

a) Only payment confirmation notifications
b) Driver ELD records and hours of service
*c) Invoice submissions, invoice status, and potentially payment routing information
d) Load board posting activity and carrier contact lists

Explanation: Factoring portals are built around invoice data and payment flows. Read/write access at the factoring portal typically exposes invoice submissions, payment status, and banking routing information — which is why factoring payment changes are a high-priority BEC target.

---

**Q4. A new ELD telematics vendor has approached your company and would like to connect their system to your existing fleet data. They have provided a polished website and a sales deck. Before granting any system access, what is the minimum acceptable security attestation?**

a) A signed NDA from the vendor
b) A letter from the vendor's CEO confirming their systems are secure
*c) A SOC 2 Type II audit report within the past 12 months, or ISO 27001 certification, or a completed security questionnaire signed by their named CISO or IT director
d) A reference from one other trucking company that uses their product

Explanation: Vendor policy requires a SOC 2 Type II, ISO 27001 certification, or a written security questionnaire signed by a named security/IT lead. A signed NDA and CEO letters are not security attestations. A reference is part of the vetting process but does not satisfy the security attestation requirement.

---

**Q5. You are vetting a new MSP that will manage your company's Microsoft 365 environment. They have provided a SOC 2 Type II report. What additional requirement applies to this vendor that does not apply to a read-only SaaS platform?**

a) The vendor must have a physical office within 50 miles
*b) Because they will hold admin-level access, they must confirm that staff assigned to your account have undergone background screening
c) They must provide three years of audited financial statements
d) The MSP must be certified by Microsoft as a partner at the Gold level or above

Explanation: Vendors with admin-level access — the MSP is the clearest example — must confirm that assigned staff have been background screened. This requirement does not apply to read-only SaaS vendors. Financial statements and Microsoft certification tiers are not vendor vetting requirements under this policy.

---

**Q6. A vendor you have been considering cannot provide a SOC 2 report or ISO 27001 certification. They are a small software firm with five employees. According to vendor vetting policy, what happens next?**

a) The vendor is automatically disqualified from consideration
b) The vendor must provide a SOC 2 before any access is discussed
*c) The vendor must complete a written security questionnaire signed by their named CISO, IT director, or security lead — this is the acceptable alternative when formal certification is not available
d) The vendor is permitted to proceed without a security attestation if the contract includes an indemnification clause

Explanation: The policy provides a path for small vendors without formal certifications: a signed security questionnaire from a named security or IT lead. This is not optional — it is the substitute requirement. Disqualification and indemnification clauses are not the policy response.

---

**Q7. Your company's quarterly vendor access review is due. You pull the vendor access register and find that your previous ELD integration vendor — whose contract ended four months ago — still has an active user account in your TMS. What is the correct immediate response?**

a) Add a note to the register to deactivate the account at the next scheduled maintenance window
b) Email the former vendor and ask them to close their own account
*c) Immediately revoke the account and document the revocation date in the vendor access register; then investigate whether the account was used after contract termination
d) Leave the account active until the quarterly review is formally completed, then deactivate it

Explanation: Vendor access is revoked the same day the relationship ends — four months of active access after contract termination is a significant gap. Immediate revocation is required. The email approach and deferral options are both wrong; the access is terminated before anything else.

---

**Q8. During your quarterly vendor access review, you learn that your MSP's lead technician assigned to your account left the MSP three weeks ago. Your MSP has not contacted you about this. What must happen before your next regular review?**

*a) Rotate any shared passwords and API keys that the departed technician had access to; confirm with the MSP that the former employee's access to their management tools has been revoked; update the named contact in your vendor access register
b) Send the MSP a letter documenting your concern and wait for their response
c) Continue the review normally — the MSP is responsible for their own personnel transitions
d) Suspend all MSP access until the MSP provides written confirmation the technician's access is revoked

Explanation: You cannot verify the MSP's internal offboarding. The control you own is rotating your side of shared credentials, which removes the departed technician's ability to use any credentials they may have retained. Confirming the new contact and updating records are also required. Suspension is disproportionate; waiting is insufficient.

---

**Q9. Which of the following events is NOT listed as an event-driven trigger requiring an immediate vendor access audit outside the quarterly schedule?**

a) A vendor notifies you of a security breach affecting their systems
b) Your vendor is acquired by another company
*c) The vendor's pricing increases by more than 20% at contract renewal
d) Unexplained activity appears in your systems — logins at unusual hours you did not authorize

Explanation: Pricing changes are commercial matters, not security events. All three other options — vendor breach notification, acquisition (new ownership means new security posture), and unexplained system activity — are explicit event-driven audit triggers.

---

**Q10. CargoNet Q1 2025 reported that BEC-enabled cargo theft is the predominant cargo theft strategy. What makes BEC through a compromised vendor account harder to detect than BEC from an unknown attacker?**

a) Vendor BEC attacks always involve larger amounts than cold-sender BEC
*b) The email comes from a domain you recognize and a relationship that already exists — it passes surface-level checks that would flag a cold-sender email as suspicious
c) Vendor BEC attacks use malware to hide their origin
d) Most email security tools cannot detect BEC from vendor domains

Explanation: Vendor account compromise inherits the trust of the established relationship. The email domain matches, the sender history is real, and your team has processed transactions from this address before. The attack exploits that established trust rather than trying to create new trust from scratch.

---

**Q11. An attacker gains access to a carrier's load board account on DAT. Which of the following attack patterns does this enable?**

a) Payment redirect BEC to the carrier's factoring company
b) Ransomware deployment against the broker who tenders to this carrier
*c) Fictitious pickup — the attacker accepts a load using the carrier's account, then dispatches different drivers to pick it up and divert the cargo
d) Account takeover of the broker's TMS by credential reuse

Explanation: Load board account compromise enables the fictitious pickup pattern — accepting loads on behalf of the legitimate carrier and substituting different drivers. This is a documented cargo theft technique. The other options describe different attack vectors that load board account access does not directly enable.

---

**Q12. An email arrives from the billing address of a carrier you regularly pay. The email announces new ACH routing information effective immediately and includes an urgent request to update before this week's settlement run. Which warning sign is present in this scenario?**

a) The email came from a billing address, which is unusual
*b) The urgency framing — "effective immediately" and "before this week's settlement run" — is a FinCEN-documented red flag for vendor payment fraud
c) The request to update ACH information is itself the red flag; legitimate carriers never change bank accounts
d) Settlement notifications are never sent via email by legitimate carriers

Explanation: Urgency tied to an operational deadline ("before this week's settlement run") is a FinCEN-documented red flag. It is designed to pressure the AP team into processing before verification. Note that legitimate carriers do sometimes change bank accounts — the red flag is not the change request itself but the manufactured urgency.

---

**Q13. Your MSP notifies you that their management platform was compromised by ransomware and that several client environments were affected. Your systems appear to be functioning normally at the moment. What is the correct immediate response?**

a) Wait to see whether your systems show symptoms before taking action
b) Call your MSP to ask for an update and log the call
*c) Treat this as an active event-driven audit trigger: check access logs for unusual MSP activity, rotate any shared credentials the MSP holds, notify your cyber insurer, and alert your team to watch for spoofed communications
d) Back up all data and disconnect from the internet until the MSP gives the all-clear

Explanation: A vendor breach notification is an explicit event-driven trigger requiring immediate action, not a wait-and-see event. CISA has documented MSP compromise as a multi-client ransomware vector — "appearing normal" does not mean the environment is clean. Log review, credential rotation, insurer notification, and team alerting are all correct immediate steps.

---

**Q14. A vendor emails you to update their ACH details. The email looks exactly like communications you have received from this vendor before. What is the correct first step?**

a) Update the ACH details — the email looks legitimate
b) Reply to the email asking the vendor to confirm the change
*c) Do not update anything yet. Find the vendor's phone number in your existing records — not from the email — and call to verify the request
d) Forward the email to your manager for approval before updating the records

Explanation: The correct first step is independent phone verification using a number from your records, not from the email. Replying to the email is not verification — if the email is compromised, the attacker controls the reply thread. Manager forwarding is a process step, not a verification.

---

**Q15. You find the vendor's phone number in the payment change email and call it. The person who answers confirms the change is legitimate and provides the new routing number. Is this sufficient verification?**

a) Yes — the vendor confirmed the change verbally
b) Yes, if you also document the call
*c) No — the phone number in the email may be controlled by the attacker. Verification must use a number from your existing records or the vendor's official website, not a number provided in the suspicious communication
d) Yes, if the call confirmation is followed by a dual-approval sign-off

Explanation: Using a phone number from the suspicious email is not independent verification — it is calling a number potentially controlled by the attacker. The verification value comes entirely from calling a number you have confirmed through a source the attacker does not control. This is the most commonly missed step in payment change verification.

---

**Q16. Your AP coordinator receives a payment change request from a vendor, calls the vendor's number from your records, and verbally confirms the change is legitimate. What must happen next before the payment record is updated?**

a) The coordinator can update the record immediately — verification is complete
*b) The coordinator must document the call (date, time, name of person who confirmed, confirmation details) and then obtain a second approver's independent sign-off before updating the payment record
c) The coordinator emails the vendor a confirmation and waits for a written reply
d) The coordinator notifies the manager but can process the change unilaterally since verification is complete

Explanation: Phone verification is the first required step, not the only required step. Documentation of the call and dual approval are both required before the payment record is changed. Verification clears the fraud concern; dual approval ensures no single employee can unilaterally update payment routing.

---

**Q17. A carrier calls your dispatch team to say their factoring company has changed and all future settlements should go to "Capital Route Funding" at a new bank. The carrier verbally confirms this over the phone. Is this sufficient to update your payment records?**

a) Yes — the carrier called you directly, which is equivalent to independent verification
b) Yes, if the carrier follows up with a written notice
*c) No — a call you received from a number you did not independently verify is not the same as a call you initiated to a number in your existing records. Contact the carrier at their number on file to verify this is their actual factoring arrangement before updating payment routing
d) Yes, because factoring changes are routine and the carrier confirmed it verbally

Explanation: Verification must use a call you initiate to a number you independently control. A call received from an unverified number is not equivalent. Attackers can call you and confirm fraudulent changes just as convincingly as they can email them.

---

**Q18. Your company is a 12-person freight brokerage. You do not have a dedicated IT department. Who is responsible for maintaining the vendor access register under this policy?**

a) No one — the policy only applies to companies with IT staff
b) The vendor themselves — they should maintain records of what they access
*c) The owner of each vendor relationship at your company; overall policy ownership sits with whoever manages IT or operations — in a small brokerage, that is typically the owner or general manager
d) Your MSP, since they manage your IT systems

Explanation: Policy ownership scales to company size. In a small brokerage without IT staff, the general manager or owner is the policy owner. The relationship owner for each vendor maintains that vendor's register entry. The MSP manages your systems; they do not own your vendor oversight responsibilities.

---

**Q19. Your company sets up a one-time engagement with a technology consultant to configure a new TMS integration. The consultant needs admin access to the TMS for approximately two weeks. According to the SMB vendor controls policy, what must happen at the time of provisioning?**

a) The consultant is given access and reminded verbally to let you know when they are finished
b) The consultant is added to the vendor access register with no expiration date, to be reviewed quarterly
*c) The consultant is added to the vendor access register with an access expiration date set two weeks out; the expiration must be enforced — not left open pending the consultant confirming they are done
d) The consultant is given access under the company owner's credentials to avoid creating a new account

Explanation: Project-based vendor access requires an expiration date set at time of provisioning. Temporary access without a hard expiration regularly becomes indefinite access by inattention. Using company owner credentials is not an appropriate solution — it eliminates accountability for what actions the consultant takes.

---

**Q20. A fuel card account manager emails to say they are updating your account's reporting portal and need you to click a link to re-authenticate. Before clicking, what should you do?**

a) Click the link — it is from a vendor you have worked with before
b) Reply to the email asking the account manager to confirm it is legitimate
*c) Do not click the link. Call the fuel card company at the number in your vendor access register to confirm they are conducting a portal update and that this email is legitimate before taking any action
d) Forward the email to IT for review before acting

Explanation: Clicking a link in an unexpected email from a vendor — even a legitimate-seeming one — without verification is the action that phishing and session-hijacking attacks depend on. The correct response is independent phone verification before any click or action. Replying to the email and forwarding to IT do not substitute for verification before acting.
