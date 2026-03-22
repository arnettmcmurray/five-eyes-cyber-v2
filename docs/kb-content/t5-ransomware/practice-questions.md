---
title: Practice Questions — Ransomware and Operational Resilience (30 questions)
module: Ransomware and Operational Resilience
---

# Practice Questions: Ransomware and Operational Resilience

All questions are scenario-based. Format: stem + 4 options. Correct answer marked *.

---

## Section 1: Recognition of Early Warning Signs

**Q1.** A dispatcher at a regional LTL carrier notices that the shared network drive where BOL templates are stored is loading with unusual slowness, and several files now show extensions she doesn't recognize — the PDFs she stored yesterday are now named with a string of random characters. She can still log into her workstation. What should she do first?

A) Try to open the files to see if they are still readable
B) Restart the workstation to see if that clears the problem
*C) Stop working, write down what she observed and when, and call IT immediately
D) Move the affected files to a different folder to prevent further changes

---

**Q2.** An IT administrator receives an alert from the endpoint protection tool on a dispatch workstation: a suspicious file was detected and quarantined in the downloads folder. The dispatcher says she didn't download anything intentionally. The workstation appears to be functioning normally. What is the correct response?

A) Clear the quarantine log and monitor the workstation for 24 hours
*B) Treat the alert as a potential active threat, escalate to IT security review, and investigate what the quarantined file was and how it got there
C) Advise the dispatcher to restart the workstation and resume work
D) No action needed — the file was quarantined, so the threat is contained

---

**Q3.** A fleet manager reviews the dashboard for a 40-truck fleet and notices that 6 ELDs across different drivers and routes have all gone offline within a 10-minute window. There is no reported weather event or known cellular outage. What does this pattern most likely indicate?

A) A routine cellular carrier maintenance window affecting a regional tower
*B) A potential compromise of the ELD backend system or carrier network requiring immediate IT notification
C) Individual device malfunctions that each driver should troubleshoot separately
D) A DAT connectivity issue affecting load confirmation for those drivers

---

**Q4.** A driver notices that his ELD is displaying a new login prompt he's never seen before, asking him to re-enter his credentials. He's already logged in and hasn't touched any settings. What should he do?

A) Enter his credentials — the system probably just logged him out automatically
B) Ignore the prompt and continue driving since his HOS is already recording
*C) Do not enter credentials, report the unusual prompt to dispatch or fleet management immediately, and document what the prompt says
D) Power cycle the ELD to clear the prompt

---

**Q5.** During a routine morning shift, a dispatcher notices that Task Manager on her workstation shows a command prompt process running in the background. She didn't open a command prompt. The workstation is otherwise functioning normally. How urgent is this?

*A) Urgent — an unexpected process running without user action is a potential indicator of malicious activity; IT should be notified immediately
B) Not urgent — background processes are normal and Task Manager often shows system utilities
C) Moderate — worth mentioning to IT at the end of the day
D) Not a concern — command prompt can open automatically during system updates

---

## Section 2: Correct Response Sequence When Ransomware Is Suspected

**Q6.** A driver contacts dispatch and reports that a ransom note has appeared on the TMS terminal at a drop yard. The screen says all files are encrypted and demands Bitcoin payment within 48 hours. The terminal is plugged into the yard's network switch. What is the first action dispatch should take?

A) Attempt to access the TMS from a different terminal to assess how widespread the encryption is
*B) Notify IT and operations leadership immediately, and advise yard staff not to turn off the terminal without IT direction
C) Unplug the terminal from the wall to prevent further damage
D) Contact the payment processing team to assess the ransom demand while IT is notified

---

**Q7.** IT has confirmed ransomware is active and is spreading through the carrier network. The IT lead instructs the operations team to disconnect affected workstations from the network. A dispatcher says she needs 10 more minutes to finish a load confirmation in the TMS before disconnecting. What is the correct response?

A) Allow her 10 minutes — completing the load confirmation protects shipper relationships
B) Allow 5 minutes — a brief delay won't significantly worsen the damage
*C) Disconnect immediately — every minute of continued network connection allows the ransomware to spread to additional systems; the load confirmation can wait
D) Allow her to finish only if she can confirm her workstation has not been encrypted yet

---

**Q8.** An owner-operator discovers a ransom note on his laptop at 2 AM at a truck stop. He cannot reach his IT contact. The laptop has an active cellular connection. What should he do?

*A) Disable Wi-Fi and cellular on the laptop immediately, write down everything he observed, and reach his security contact as soon as possible — even if that means waiting until morning business hours
B) Shut down the laptop immediately to prevent further encryption
C) Try to use the laptop's recovery mode to restore the system before calling anyone
D) Connect to the truck stop Wi-Fi to download an antivirus tool to clean the laptop

---

**Q9.** During a ransomware containment, the IT lead has isolated affected systems. Operations asks whether they should continue using the three workstations that have been confirmed clean and isolated on a separate network segment. What is the right answer?

A) No — all workstations should be taken offline until full restoration is complete
*B) Yes — confirmed clean workstations on an isolated segment can be used to maintain minimal operational continuity while recovery proceeds
C) Only if the workstations have been rebooted since the containment began
D) Only if the ransom demand has been reviewed and a payment decision has been made

---

**Q10.** The response playbook specifies that customers and shippers should not be notified about a ransomware incident until scope is understood and legal has been consulted. A major shipper calls dispatch asking why their load status updates have stopped. What should the dispatcher say?

A) Tell the shipper the TMS is down due to ransomware but that operations are continuing manually
B) Do not answer the call until leadership approves a communication script
*C) Acknowledge a system issue is being addressed, provide a manual status update on their specific load, and let them know the team will follow up — without disclosing it is a ransomware incident until authorized
D) Redirect the shipper to email so all communications are documented

---

## Section 3: Prevention Controls

**Q11.** A carrier's IT team requires MFA for VPN access but has not enabled it for the TMS web portal, which dispatchers access when working from home. A dispatcher's TMS credentials are stolen in a phishing attack. What does MFA on the TMS portal prevent in this scenario?

A) Nothing — if credentials are stolen, MFA cannot help because the attacker has the password
*B) The attacker cannot log in to the TMS even with the correct password, because they don't have access to the dispatcher's second factor (authenticator app or push notification)
C) MFA would slow down the attacker but not stop them from eventually accessing the system
D) MFA only helps when the attacker is remote — it provides no protection against local access

---

**Q12.** A carrier is choosing between keeping their existing legacy antivirus software or upgrading to an EDR solution. The IT manager argues the legacy AV is "good enough" since it catches known malware. What is the primary limitation of this argument in the context of ransomware?

A) Legacy AV is more expensive than EDR on an annual basis
*B) Modern ransomware is engineered to evade signature-based detection — EDR detects malicious behavior patterns, making it effective against new variants that don't match known signatures
C) Legacy AV cannot protect endpoint devices on cellular connections
D) EDR is required by FMCSA regulation for all carriers operating ELDs

---

**Q13.** CISA's Known Exploited Vulnerabilities (KEV) catalog lists a vulnerability in a VPN product used by a regional carrier. The carrier's IT team is aware of the vulnerability but has not yet patched it due to workload. Why does this represent an especially high-priority risk?

*A) KEV listings indicate vulnerabilities that are actively being exploited in real attacks — unpatched KEV vulnerabilities are among the most commonly exploited initial access points for ransomware
B) CISA requires carriers to patch KEV vulnerabilities within 24 hours or face regulatory penalties
C) VPN vulnerabilities only affect systems with direct internet exposure, which is limited to the main corporate office
D) The vulnerability is low-risk because it requires physical access to the VPN hardware to exploit

---

**Q14.** A dispatcher has local administrator rights on her workstation because the previous IT manager said it made software installations faster. The carrier's new IT policy removes admin rights from all dispatcher workstations. Why does this change improve ransomware resilience?

A) Admin rights allow dispatchers to disable antivirus software, which is now prevented
*B) Ransomware executing under a standard user account can encrypt far fewer resources than ransomware executing with admin rights — limiting the blast radius of any infection that does occur
C) Admin rights allow remote connections from outside the network, which is now closed
D) The change makes no meaningful difference to ransomware risk — ransomware can always escalate privileges regardless of account type

---

**Q15.** A carrier has their ELD management system, TMS server, and corporate email server all on the same network segment with no firewall rules between them. Ransomware enters through a malicious email attachment. What is the likely result compared to a properly segmented network?

A) The result is the same — ransomware always spreads to all reachable systems regardless of segmentation
*B) Without segmentation, ransomware can spread laterally from the email system to the TMS and ELD management systems in a single attack — segmentation would have contained the infection to the email segment
C) The ELD management system is protected because it uses a cellular connection, not the office network
D) The TMS is always protected because it requires separate login credentials

---

## Section 4: ELD and Telematics-Specific Scenarios

**Q16.** During a ransomware incident, a carrier's ELD backend system is confirmed to be encrypted and offline. Drivers are currently on active routes. Under FMCSA regulations, what are drivers authorized to do when their ELD is non-functional?

A) Stop driving immediately and wait at the nearest truck stop until ELD service is restored
*B) Switch to paper logs — FMCSA regulations permit drivers to revert to paper HOS records when an ELD malfunctions, and the carrier should apply for an exemption for extended outages
C) Continue driving without logging hours, as a system outage creates a blanket exemption from HOS requirements
D) Use a personal mobile phone app to track hours in place of the ELD

---

**Q17.** NMFTA researchers discovered CVE-2024-12054, a documented vulnerability in ELD devices. An ELD vendor has released a firmware update that addresses a security vulnerability. A driver's ELD is displaying a prompt to install the update. What should the driver do?

*A) Follow the vendor's documented update process — firmware updates from vendors address real security vulnerabilities and should be applied; if uncertain about the prompt's legitimacy, confirm with the fleet manager before proceeding
B) Decline the update until the carrier's IT team has tested it on other devices first
C) Ignore the prompt — firmware updates are only relevant to ELD functionality, not security
D) Document the prompt and wait for the next scheduled maintenance stop to apply the update

---

**Q18.** A fleet manager is evaluating two ELD vendors for a contract renewal. Vendor A releases firmware updates frequently with detailed security advisory notes. Vendor B has not released a firmware update in 18 months and does not publish security advisories. From a cybersecurity perspective, which vendor presents lower risk and why?

*A) Vendor A — frequent updates with documented security advisories indicate an active vulnerability management program; 18 months without updates suggests either no security research or discovered vulnerabilities that are not being addressed
B) Vendor B — fewer updates mean less exposure to update-related malfunctions and a more stable firmware environment
C) Both vendors present equal risk — firmware updates don't meaningfully affect ransomware exposure for ELD devices
D) Vendor B — less frequent communication from the vendor means attackers have less publicly available information about the device

---

**Q19.** During a suspected ransomware incident, a driver notices his ELD has started showing a different interface than normal and is asking him to re-enter dispatch credentials he's never had to enter before. Dispatch is overwhelmed with calls. What is the most important action the driver should take?

A) Enter the credentials and report the issue to dispatch when they are less busy
B) Pull over and power off the ELD to prevent any data from being accessed
*C) Do not enter any credentials, document exactly what the screen shows, and report to dispatch as soon as possible — an ELD requesting new credentials during a known incident may indicate compromise of the device or its backend
D) Continue driving and report at the next DOT inspection point

---

## Section 5: Backup and Recovery Policy

**Q20.** A carrier has a single backup of their TMS database saved to a network-attached storage (NAS) device. The NAS is connected to the same network segment as the TMS server. Ransomware encrypts the TMS server. What is the likely status of the backup?

A) The backup is safe because NAS devices use a different file system format that ransomware cannot encrypt
*B) The backup is likely also encrypted — ransomware specifically targets network-accessible shares and mapped drives; a network-connected backup is not isolated from the attack
C) The backup is safe because it was written before the ransomware arrived
D) The backup may be partially encrypted depending on how recently it was written

---

**Q21.** A carrier's IT team follows the 3-2-1 backup rule: three copies of TMS data, on two media types, with one copy in cloud storage. The cloud storage uses a standard account with no immutable storage configuration enabled. Why does this not fully satisfy the 3-2-1 requirement for the offsite copy?

A) Cloud storage doesn't count as a valid backup medium under the 3-2-1 rule
*B) Standard cloud storage accounts can be accessed and deleted by network-connected malware — immutable or write-protected storage is required to ensure the cloud copy cannot be encrypted or deleted by ransomware with access to the account credentials
C) The rule requires physical media for the offsite copy, not cloud-based storage
D) The 3-2-1 rule requires the offsite copy to be in a different geographic region, not just a different medium

---

**Q22.** A carrier's IT team discovers during a ransomware recovery attempt that the quarterly restore test was skipped for the last two quarters due to resource constraints. The backup files appear intact on the storage medium, but restoration fails three hours into the process due to database corruption. What is the lesson here?

A) Backup files that exist and are readable are sufficient evidence of backup integrity
B) Quarterly restore testing is only necessary for carriers with annual revenue above a certain threshold
*C) A backup that has never been successfully tested has unknown value — corruption, configuration errors, and compatibility failures only surface during an actual restoration attempt; quarterly testing is mandatory for exactly this reason
D) The failure indicates a hardware problem with the restoration server, not an issue with the backup quality

---

**Q23.** A carrier's TMS goes down in a ransomware attack on a Tuesday morning. The last successful backup was Monday at midnight. What is the maximum amount of data that may be unrecoverable under a once-daily backup schedule?

A) No data is unrecoverable — backups capture everything up to the moment of attack
B) Only data entered after the attack began is unrecoverable
*C) Up to approximately 9–10 hours of data entered between Monday midnight and Tuesday morning may be unrecoverable — this is the Recovery Point Objective gap for a daily backup schedule
D) All data since the last quarterly restore test may be unrecoverable

---

## Section 6: Ransom Payment Decisions and Obligations

**Q24.** A ransomware group has encrypted a regional carrier's TMS and is demanding payment in Bitcoin within 48 hours or the demand doubles. The carrier has no usable backups. The operations manager believes paying is the only option to stay in business. Who has authority to make the payment decision?

A) The operations manager, since operations continuity is their responsibility
B) The IT manager, since they understand the technical situation best
C) The highest-ranking person available at the time of the deadline
*D) Executive leadership with legal counsel and cyber insurance involvement — the decision requires OFAC screening, legal review of FinCEN obligations, and insurance coordination; no single operations manager has this authority

---

**Q25.** A carrier is preparing to pay a ransomware demand. Legal counsel informs them that the ransomware group has been designated on OFAC's Specially Designated Nationals (SDN) list. What does this mean for the payment decision?

*A) Paying a sanctioned entity — even unknowingly and even under duress — can result in civil penalties under OFAC regulations; strict liability applies, meaning good intent does not eliminate legal exposure; the payment must not proceed without further legal guidance
B) The SDN designation means law enforcement will handle the payment on the carrier's behalf
C) Payments to SDN-listed groups are illegal but the penalties are minor for first-time violations
D) The OFAC designation only applies to the ransomware group's assets, not to companies that pay them

---

**Q26.** After paying a ransomware demand, a carrier's bank notifies them that a Suspicious Activity Report may need to be filed. Under what framework does this obligation arise?

A) FMCSA's motor carrier financial reporting requirements
B) The Cybersecurity Information Sharing Act (CISA)
*C) FinCEN's Bank Secrecy Act guidance, which may require SAR filing when payments are made to criminal entities — financial institutions processing the transfer have independent SAR obligations, and the paying company may also have reporting obligations
D) DOT's incident reporting requirements for commercial carriers

---

**Q27.** A carrier decides not to pay the ransom and begins restoration from backup. The IR firm they engaged advises them to also notify the FBI Internet Crime Complaint Center. A manager asks why law enforcement notification matters if they've already decided not to pay. What is the correct answer?

A) Law enforcement notification is only required if the carrier decides to pay
B) FBI notification is required by FMCSA regulation for all ransomware incidents affecting ELD systems
*C) Law enforcement notification provides access to intelligence about the ransomware group, may assist with identifying decryption tools, and contributes to broader law enforcement awareness of ransomware campaigns — it is independent of the payment decision
D) Notification is only relevant if the carrier plans to pursue criminal prosecution of the attackers

---

## Section 7: Operational Continuity During Outage

**Q28.** A carrier's TMS is encrypted and offline. Drivers currently on routes need to know their next pickup locations. Dispatch has no access to TMS, email, or shared drives. What should dispatch do to maintain driver communication?

A) Tell drivers to check DAT for available loads near their current location and self-dispatch
B) Suspend all new assignments until TMS is restored — attempting manual dispatch creates too much liability
*C) Use phone-based direct contact with each driver to relay pickup location and instructions verbally; document each assignment on paper for billing reconstruction later
D) Contact the shipper to arrange direct communication between shipper and driver, bypassing dispatch until systems are restored

---

**Q29.** During a ransomware incident, a dispatcher needs to generate a paper Bill of Lading for a time-sensitive load. The TMS is offline. What information does a paper BOL require, and where should this information come from?

A) BOLs cannot be generated manually — wait until TMS is restored to avoid compliance issues
B) Paper BOLs only require driver name and destination — the rest can be filled in after TMS restoration
*C) A paper BOL requires shipper, consignee, commodity description, weight, piece count, and special instructions — this information should come from direct contact with the shipper; pre-printed blank BOL forms should be on hand at every terminal and in every cab for exactly this situation
D) A phone call to the shipper confirming the load is sufficient to substitute for a BOL during a system outage

---

**Q30.** It is day four of a ransomware outage. The TMS remains offline. A major shipper is threatening to pull future tender awards because they have not received load status updates or invoices for four days of freight. Operations leadership asks the dispatcher what can realistically be communicated. What is the correct answer?

A) Tell the shipper that all load records were destroyed and reconstruction will begin after TMS restoration
B) Advise the shipper to contact the drivers directly for status updates since dispatch cannot provide information
*C) Using phone-based check-ins and paper documentation created during the outage, dispatch can provide manual load status for each shipment in transit — the shipper should be given a single point of contact for updates and a realistic timeline for invoice generation once TMS is restored; proactive communication reduces shipper attrition even during extended outages
D) Suspend communication with the shipper until systems are restored to avoid providing inaccurate information
