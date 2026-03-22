---
title: Practice Questions — Incident Reporting and Response (30 questions)
module: Incident Reporting and Response
---

# Practice Questions: Incident Reporting and Response

All questions are scenario-based. Format: stem + 4 options. Correct answer marked *.

---

## Incident Identification — What Counts

**Q1.** Your TMS shows that a carrier record was modified at 3:17am by an admin username you do not recognize. When you check with IT, no one can account for that account. What is the correct classification of this event?

A) Not an incident — system accounts sometimes run automated tasks at odd hours
B) Suspicious but not an incident — wait to see if anything else happens
*C) A cybersecurity incident — report immediately to IT/security
D) A maintenance window — verify with your TMS vendor before escalating

---

**Q2.** A driver receives a message through DAT directing them to submit load documentation through an unfamiliar payment portal with a URL you have never seen before. The driver has not clicked the link yet. What should happen next?

A) The driver should click the link to see if it is legitimate before reporting
B) The driver should ignore it — DAT messages are always from verified users
*C) The driver should not click the link and should report it to a supervisor and IT immediately
D) The driver should forward the link to the dispatcher to review

---

**Q3.** Your company received a spam email advertising a freight rate comparison tool. No one opened it or clicked any link. It was filtered to junk. How should this be classified?

A) An incident — all unsolicited emails are cybersecurity events
B) Suspicious — escalate to IT for review
C) A phishing attempt — report to FBI/IC3
*D) Not an incident — spam that was not interacted with does not cross the threshold

---

**Q4.** A broker calls to say that a carrier using your company's USDOT number and MC authority picked up a load yesterday — a load your dispatch team has no record of. What is this?

A) Probably a clerical error — verify with the broker before treating it as an incident
*B) A cybersecurity incident — carrier identity impersonation is in progress
C) A billing dispute — handle through your accounts receivable team
D) Not a cyber incident — this is a physical fraud matter, not a technology issue

---

**Q5.** An MFA notification fires on your phone requesting approval for a login to your TMS from a location in Eastern Europe. You are sitting at your desk in Texas and did not initiate a login. What do you do?

A) Deny the MFA request and continue working — denying it resolves the threat
*B) Deny the MFA request, do not log into TMS yourself, and immediately report to IT/security
C) Approve it to see what the person is trying to access, then report it
D) Change your password and notify your supervisor — no need to involve IT yet

---

## Internal Escalation Sequence

**Q6.** A wire transfer of $87,000 intended for a carrier was confirmed by your bank as having been sent to an account your company did not authorize. You discover this at 10:00am. According to the escalation policy, how quickly should management be notified?

A) Within 4 hours — give IT time to investigate first
B) Within 2 hours — confirm the details with accounts payable before escalating
*C) Within 30 minutes — financial fraud triggers the 30-minute escalation threshold
D) End of business day — compile the full picture before involving leadership

---

**Q7.** You receive a ransom note on your screen demanding payment in cryptocurrency. The ransom note says your files have been encrypted. You call IT immediately. What should you do while waiting for IT to arrive?

A) Try to close the ransom note and reboot the machine to clear the malware
B) Run a quick antivirus scan to identify what files were affected
*C) Do not touch the system — take a screenshot, write down the time, and wait for IT
D) Open File Explorer to see which files were encrypted so you can tell IT

---

**Q8.** An employee in dispatch discovers a suspicious email that appears to have redirected a payment. Their supervisor tells them: "Let's figure this out between us before we involve management — we don't want to start a panic." What is wrong with this approach?

A) Nothing — it is reasonable to investigate before escalating
B) The supervisor should have contacted IT before telling the employee
*C) Delaying escalation on financial fraud loses the wire recovery window and may create legal exposure
D) The employee should have reported directly to the FBI without involving the supervisor

---

**Q9.** During an incident, your manager asks you to write down what you observed. What information is most important to capture?

A) Your professional assessment of what caused the incident
*B) The exact time you first noticed the issue, what you saw, what device and system you were using, and what you did or did not do
C) The names of colleagues who might have caused the issue
D) A list of all systems that might potentially be affected

---

**Q10.** An operations manager tells an employee to go ahead and report the incident directly to CISA. Is this appropriate?

A) Yes — any employee can report to CISA at any time
B) Yes — CISA prefers direct reports from operational staff rather than management
*C) No — external reporting decisions belong to leadership and legal, not to individual employees or front-line supervisors
D) No — CISA does not accept incident reports from freight companies

---

## Evidence Preservation

**Q11.** Your computer shows signs of a ransomware infection. Your first instinct is to shut the machine down to stop the attack from spreading. Why is this the wrong move?

A) It is not wrong — shutting down infected systems is standard procedure
B) Shutting down will spread the ransomware to other machines
*C) Shutting down destroys RAM (volatile memory), which contains attacker tools, credentials, and activity logs that do not survive a power cycle
D) Shutting down triggers an automatic backup that overwrites the clean backup

---

**Q12.** You receive a suspicious email that contains a link you believe was used in a phishing attempt against a colleague. What should you do with the email?

A) Delete it — it is a security risk to keep phishing emails in your inbox
B) Print it and give it to your supervisor
*C) Do not delete it — forward it to IT with the original email intact, including headers
D) Forward it to your IT team and then delete your copy

---

**Q13.** You notice an unfamiliar USB drive plugged into a workstation in the dock office. No one knows who left it. What is the correct first action?

A) Unplug it immediately to prevent further access to the network
B) Plug it into your own computer to see what's on it
*C) Do not remove it — photograph it in place showing the device, the port, and the surrounding area, then call IT
D) Label it with the date and time and lock it in a drawer until IT can review it

---

**Q14.** An incident occurred involving your ELD system. The device was rebooted before IT arrived. What evidence was likely lost?

A) Nothing important — ELD logs are stored in the cloud automatically
B) GPS location data for the current trip only
*C) The ELD activity log for the period covering the incident, which may not survive a reboot
D) Nothing — ELD logs are stored on the carrier's TMS server, not the device

---

**Q15.** Which of the following actions is permitted during the first 30 minutes of a discovered incident?

A) Running a full antivirus scan to identify and quarantine affected files
B) Rebooting the system to clear any active malware processes
*C) Taking screenshots of everything visible on screen and writing down the exact time of discovery
D) Opening the suspicious files in a read-only viewer to assess the damage

---

## External Reporting — FBI/IC3, FMCSA, and Regulators

**Q16.** A wire transfer cleared to the wrong account 3 hours ago. Which of the following reporting actions gives the best chance of recovering the funds?

A) File a report with FMCSA and wait for their investigation
*B) Call your bank's fraud line and file an FBI/IC3 report immediately — the Financial Fraud Kill Chain has a 72-hour window
C) File a police report with local law enforcement and let them contact the FBI
D) Contact your cyber insurance carrier first — they will coordinate all reporting

---

**Q17.** A freight railroad operator covered by TSA Security Directive 1580-21-01 version C experiences a ransomware attack that shuts down dispatch operations. How long does the operator have to report this to CISA?

A) 72 hours from the time of discovery
*B) 24 hours from the time the incident is identified as significant
C) 4 business days from when the incident is determined to be material
D) 30 days from the date of incident discovery

---

**Q18.** A publicly traded logistics company determines on a Tuesday that a recent data breach affecting carrier records is material to investors. Under SEC Item 1.05 of Form 8-K, when must the disclosure be filed?

A) Within 24 hours of determining materiality
B) Within 72 hours of determining materiality
*C) Within 4 business days of determining materiality — by end of day the following Monday
D) Within 30 days of determining materiality

---

**Q19.** Someone has been fraudulently booking loads using your company's MC authority. Which organizations should receive a formal report? Select the best answer.

A) FBI/IC3 only — this is federal fraud, so state agencies don't apply
B) FMCSA only — MC authority is their jurisdiction
*C) FMCSA, DAT, Truckstop, and FBI/IC3 — each plays a different role in identity fraud response
D) Your cyber insurance carrier and CISA — the load boards do not need to be notified

---

**Q20.** A freight factoring company licensed in New York discovers a data breach affecting payment records. Which reporting obligation applies?

A) TSA SD 1580-21-01 — freight payment is transportation-adjacent
B) SEC Item 1.05 — factoring companies are considered financial institutions
*C) NYDFS 23 NYCRR 500 — NY-licensed financial services entities must notify NYDFS within 72 hours
D) CIRCIA — factoring companies are critical infrastructure

---

## TSA Directive Obligations

**Q21.** TSA Security Directive 1580-21-01 version C currently applies to which of the following operators?

A) All freight trucking companies with more than 25 power units
B) All carriers registered with FMCSA with interstate operating authority
*C) Designated freight railroad operators and pipeline owners/operators identified by TSA
D) Any transportation company that moves hazardous materials

---

**Q22.** A freight railroad covered by TSA SD 1580-21-01 is asked by an employee whether their cybersecurity coordinator needs to be available on weekends. What is the correct answer?

*A) Yes — the directive requires the cybersecurity coordinator to be reachable 24 hours a day, 7 days a week, with current contact information on file with TSA
B) No — the directive only requires coordinator availability during business hours
C) Only if the railroad operates on weekends
D) The directive does not specify availability requirements for the coordinator

---

**Q23.** A trucking company manager asks whether TSA's November 2024 NPRM means they now need to designate a cybersecurity coordinator and report incidents to CISA. What is the accurate response?

A) Yes — the NPRM took effect immediately upon publication in November 2024
B) Yes — TSA NPRMs apply automatically 90 days after publication
*C) No — the November 2024 NPRM is proposed rulemaking, not yet final. Trucking operators should monitor for the final rule and begin building capability now.
D) No — trucking is exempt from TSA cybersecurity requirements regardless of rulemaking

---

## Incident Communications

**Q24.** A shipper calls and asks why their load is delayed. You know there has been a ransomware event affecting dispatch systems, but leadership has not authorized external communications about it. What do you say?

A) "We had a ransomware attack but it's under control — your load should ship tomorrow."
B) "I can't talk about that — you'll need to call our legal department."
*C) "We're experiencing a system issue and are working to resolve it. I'll have an update on your load within [X hours]."
D) "I don't know anything about any incident — let me transfer you to IT."

---

**Q25.** A reporter calls asking about a "data breach" they heard about at your company. You are a dispatcher and have no authorized communications role. What do you say?

A) "We did have an incident but I can't give you details — please check our website."
B) Confirm that you are aware of the situation and give a brief factual description
*C) "We are aware of a situation and our team is actively working on it. We'll issue a statement when we have more information." Then route to leadership immediately.
D) Deny any knowledge of an incident — you are not authorized to confirm

---

**Q26.** During an active cyber incident, can an employee post on their personal social media account asking their followers to "send positive vibes to the team today"?

A) Yes — vague personal posts do not constitute disclosure
B) Yes — personal accounts are not subject to incident communications policy
*C) No — personal social media posts during active incidents are prohibited because they can prompt disclosure questions the organization is not prepared to answer, and may create legal or regulatory issues
D) Only if the company's social media policy does not specifically address incidents

---

**Q27.** A partner carrier calls and asks if they might be affected by your company's incident. Your systems share an EDI integration with theirs. What is the correct response?

A) Tell them they are not affected — it would be irresponsible to create unnecessary alarm
B) Tell them they are definitely affected and should shut down the integration immediately
*C) Tell them you are still assessing and will have IT reach out to them directly — do not speculate about shared exposure before IT has assessed it
D) Transfer them to your legal department without saying anything

---

## Freight-Specific Incident Scenarios

**Q28.** A wire transfer for a $120,000 load payment cleared to a fraudulent account 90 minutes ago. You have confirmed the fraud. What is the single most time-sensitive action?

A) File an FBI/IC3 report at ic3.gov
B) Notify your cyber insurance carrier
*C) Call your bank's fraud line immediately — wire recall is the most time-sensitive action and every hour reduces recovery probability
D) Engage legal counsel to assess liability before taking any action

---

**Q29.** A shipper calls to report that a carrier using your USDOT number picked up a load you have no record of. You confirm this is carrier identity impersonation. After notifying internal leadership and IT, which external action is most urgent to limit ongoing damage?

A) File a police report with local law enforcement
*B) Notify DAT and Truckstop immediately with your USDOT and MC number and request they freeze bookings under your identity — impersonators continue booking until the load boards flag the identity
C) File with FMCSA — they can issue a hold on your authority to prevent further bookings
D) Post a notice on your company website warning that your identity has been compromised

---

**Q30.** A dispatcher realizes a load that departed this morning has not checked in and the last ELD ping was from a location 200 miles off-route. The "driver" has not responded to calls. This may be a cargo theft enabled by fraudulent pickup credentials. After confirming the shipper and consignee, what should happen next?

A) Wait 12 hours to see if the driver makes contact before involving law enforcement
B) Contact the consignee only — cargo theft is their insurance problem, not yours
*C) File a report with FBI/IC3 and state law enforcement, notify your cargo insurance carrier immediately (policy timing requirements apply), and contact CargoNet or NMFTA for sector intelligence reporting — then preserve all dispatch records and load documentation
D) File with FMCSA — they handle all cargo theft investigations involving motor carriers

---
