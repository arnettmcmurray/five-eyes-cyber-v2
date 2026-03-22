---
title: Practice Questions — Data and Document Security (20 questions)
module: Data and Document Security for Freight Operations
---

# Practice Questions: Data and Document Security for Freight Operations

All questions are scenario-based. Format: stem + 4 options. Correct answer marked *.

---

## Driver PII Identification

**Q1.** During a carrier onboarding audit, you discover that a dispatcher emailed a completed driver application — containing the driver's SSN, CDL number, and DOB — to a carrier contact last month using standard company email with no encryption. Which statement best describes this situation?

a) This is acceptable because driver applications are business documents, not personal data
b) The SSN is protected but the CDL number and DOB are not — only partial concern applies
*c) All three data elements (SSN, CDL, DOB) are protected driver PII that must not be transmitted via unencrypted email — this is a policy violation that may trigger breach notification assessment
d) This is acceptable if the email was sent to a verified carrier and not forwarded further

**Explanation:** SSN, CDL number, and full date of birth are all driver PII categories subject to protection controls. Transmitting them via unencrypted email violates the secure sharing policy regardless of the recipient's identity. The event requires breach notification assessment because the data may have been exposed in transit or in the recipient's inbox.

---

**Q2.** A former employee's driver qualification file contains her SSN, CDL number, drug test results, and medical examiner certificate. She left the company 18 months ago. The file is stored in a locked cabinet. Under FMCSA 49 CFR 391.51, what is the correct action?

a) The file can be discarded — she has been gone more than a year
b) The file must be retained until the end of the calendar year following her departure
*c) The file must be retained for three years from the date her employment ended — it is not eligible for destruction until 30 months from now
d) The file should be given to the driver upon request and then destroyed

**Explanation:** 49 CFR 391.51 requires driver qualification files to be retained for the duration of employment plus three years. At 18 months post-employment, the retention period has not expired. The file must remain in secured storage.

---

**Q3.** A driver's ELD records from the past 90 days are requested by a plaintiff's attorney in a civil case arising from an accident. A dispatcher pulls the records and emails them to the attorney. What is the problem with this response?

a) There is no problem — ELD records are not PII, they are vehicle data
b) The attorney should have submitted the request in writing before any records were released
*c) ELD records linked to an identified driver are driver PII; the release should be handled through legal counsel, not by a dispatcher via standard email, and should not occur without a valid legal process
d) The records can be emailed but only if the dispatcher confirms the attorney's identity first

**Explanation:** ELD records that identify a named driver's location and activity are driver PII. Responding to legal requests for driver records requires legal counsel involvement. A dispatcher should not make unilateral decisions to release driver data, regardless of who is requesting it.

---

## Document Handling Decisions

**Q4.** A carrier contacts dispatch at 2:30pm and says the original delivery destination has changed — the consignee has moved their receiving facility. They need the BOL updated and the driver redirected. The request came by email from the carrier contact you have worked with before. What is the correct response?

a) Update the BOL and redirect the driver — the carrier contact is verified
b) Ask the carrier to send the new address in writing before updating the BOL
*c) Do not update the BOL or redirect the driver based on email alone — call the shipper on your original verified contact number to confirm the change before taking any action
d) Ask the driver to confirm the change directly with the consignee at the original delivery point

**Explanation:** Mid-transit delivery instruction changes are a documented cargo theft vector. A request to redirect delivery — even from a known contact via email — requires independent verification with the shipper using your pre-existing contact number, not a number provided in the change request. This is the T4 exception-handling standard applied to document security.

---

**Q5.** Your accounts payable staff member receives a POD from a carrier for a $45,000 load that delivered yesterday. The POD shows a delivery signature and timestamp but lists the delivery weight as 2,200 lbs less than the BOL shows. The carrier is calling to approve the invoice. What is the correct action?

*a) Hold the payment — a discrepancy between BOL and POD weight is a fraud signal that must be investigated before payment is approved
b) Approve payment for the invoiced amount — weight discrepancies happen in transit
c) Approve payment but note the discrepancy in the file for future reference
d) Ask the carrier to provide a revised POD showing the correct weight before paying

**Explanation:** A discrepancy between BOL and POD is explicitly a fraud signal in the document handling policy. Payment should be held and the discrepancy investigated — contacting the shipper and consignee to verify actual delivery — before any invoice is approved. Approving payment under time pressure on a mismatched document is how fraudulent POD payments succeed.

---

**Q6.** A broker calls and asks you to email him the rate confirmation for load number 8847 so he can verify the details with his shipper. You confirm you know him. Should you email the rate confirmation?

a) Yes — confirming his identity is sufficient; the rate confirmation is not sensitive
b) Yes — rate confirmations are not PII and can be shared freely
*c) No — rate confirmations contain pricing, carrier identity, and customer data that should only travel between the contracting parties; sharing them beyond the original parties creates impersonation and fraud risk
d) Yes, but only if you password-protect the attachment

**Explanation:** Rate confirmations are operationally sensitive documents. They contain your pricing, your carrier relationship, and your customer information. Sharing a rate confirmation with a third party — even a known contact — exposes data that enables carrier impersonation and targeted BEC fraud. The document should not leave the parties who are party to the load.

---

**Q7.** You are cleaning up document storage and find a paper driver qualification file for a driver who left the company two years ago. FMCSA requires retention for three years post-employment. The retention period has another year to run. What is the correct storage action?

a) Scan the file and upload it to the shared company drive for easier access
b) Move it to a storage box in the warehouse — it doesn't need to be locked since the driver is no longer employed
*c) Keep it in the locked filing cabinet — the file contains SSN and drug test results and must remain in secured storage for the full retention period
d) Return the file to the former driver and note the return in the employment record

**Explanation:** A former employee's driver qualification file requires the same protection controls during the retention period as an active employee's file. SSN, drug test results, and CDL data do not become less sensitive because the employment relationship ended. Moving it to an unsecured storage location violates the protection controls in place.

---

## Secure Sharing Method Selection

**Q8.** You need to send a carrier's new ACH banking information to your accounts payable team so they can update the payment record. The information includes the bank name, routing number, and account number. What is the appropriate transmission method?

a) Standard email — your company uses Office 365, which encrypts email in transit
b) Text message — more secure than email
*c) A secure portal, encrypted email (M365 Purview Message Encryption or equivalent), or a password-protected document with the password delivered by phone — bank routing and account numbers must not travel via standard email regardless of the email platform's transit encryption
d) Verbal communication only — banking details should never be written down

**Explanation:** Standard email "encryption in transit" means the connection to the mail server is encrypted, not that the message is protected end-to-end. Bank account and routing numbers are a specific prohibition for unencrypted email. A secure internal portal or encrypted email is required. The payment change verification process (T2) also applies here.

---

**Q9.** A small carrier you are onboarding needs to submit their driver qualification packet including CDL copies and a completed W-9 (containing SSN). They do not use your carrier onboarding portal and are asking you to just email a fillable form they can return. What should you do?

a) Email the fillable form and tell them to email it back — it is faster and the carrier prefers it
b) Email the fillable form and tell them to mail the completed version back by physical mail
*c) Direct them to complete the onboarding through your secure carrier portal — if a portal is not available, send the blank form and instruct them to return the completed packet via encrypted email or password-protected PDF with password via separate channel
d) Accept the SSN verbally over the phone and fill in the form yourself

**Explanation:** Carrier onboarding packets contain CDL numbers and SSNs, which must not travel via standard unencrypted email. Directing carriers to a secure portal is the correct primary response. When a portal is unavailable, encrypted email or password-protected file (with separately transmitted password) is the minimum control.

---

**Q10.** You need to send a high-value cargo manifest — listing 800 units of consumer electronics worth $280,000 — to the receiver's dock scheduler. You are about to attach a PDF to a standard email. What should you consider first?

a) Nothing — this is standard freight documentation and email is appropriate
b) Whether the receiver is a verified contact — if yes, standard email is acceptable
*c) High-value commodity manifests are operationally sensitive documents that, if intercepted, provide direct cargo theft value; a secure portal or encrypted email is the appropriate channel, particularly for electronics, pharmaceuticals, or high-value consumer goods
d) Password-protect the PDF before sending — that is sufficient protection for any attachment

**Explanation:** Commodity manifests for high-value freight are operationally sensitive even though they do not contain PII. Cargo theft attackers specifically seek manifests for electronics and pharmaceuticals to identify and intercept targeted loads. The manifest should travel through a secure channel, not standard email.

---

## Breach Response Sequencing

**Q11.** On Monday morning, you discover that a Google Drive folder containing driver qualification files — including SSNs, CDL numbers, and drug test results — was configured as "Anyone with the link can view" for the past six months. The link was in a shared document. You cannot determine who accessed the folder during that period. What is the first thing you should do?

a) Change the sharing setting to "Specific people" and document the correction — if no one was harmed, breach response is not necessary
b) Notify the affected drivers immediately before doing anything else
*c) Change the sharing setting immediately to stop ongoing exposure, then begin breach response: document the timeline, notify IT, notify cyber insurer, and engage legal counsel to assess state notification obligations — you cannot assume no one accessed the folder
d) Wait to see if there is any evidence of misuse before treating it as a breach

**Explanation:** Contain first (change the sharing setting), then begin documentation and breach response. The six-month exposure to an uncontrolled link constitutes a potential breach of driver PII regardless of whether you can confirm access. The inability to confirm that no one accessed the folder is itself the problem — legal counsel must assess notification obligations because you cannot demonstrate the data was not accessed.

---

**Q12.** Your company has confirmed that a former employee accessed the TMS from home after their access should have been deactivated, and exported a customer list including names, email addresses, and phone numbers. No financial data or driver PII was confirmed as accessed. Which of the following breach response steps is most likely NOT required in this scenario?

a) Document what happened, what was accessed, and by whom
b) Notify IT to confirm access has been fully revoked and assess scope
*c) File written breach notifications to each individual on the customer list — names, emails, and phone numbers without financial account numbers or government ID numbers may not trigger state breach notification laws in most jurisdictions
d) Notify management and assess whether the export constitutes a violation of employment agreement or criminal unauthorized access

**Explanation:** Most state breach notification laws are triggered by exposure of name combined with SSN, financial account numbers, medical records, or government ID numbers. A customer list containing only names, email addresses, and phone numbers may not trigger statutory notification obligations in most states — though some states have broader definitions. Legal counsel should assess. The other steps (documentation, IT assessment, management notification) are required regardless.

---

**Q13.** A driver reports that someone used his CDL number and SSN to apply for a credit card in his name. He believes the information came from his employment records. You confirm that his driver qualification file was in an improperly secured shared folder for approximately three months last year. The breach notification period has technically passed, but the driver is now experiencing identity fraud. What should you do?

a) Explain that the notification period has passed and the company has no further obligation
b) Provide the driver with his current employment records and advise him to handle the fraud claim himself
*c) Notify the driver now of what was exposed and when, provide the practical steps he can take (credit bureau fraud alert, FTC IdentityTheft.gov, state AG complaint), and document the notification — late notification does not eliminate the obligation to assist the affected individual
d) The company has no obligation if the statutory notification window has passed

**Explanation:** Even after a statutory notification window has passed, the moral and practical obligation to the affected driver does not disappear. Documenting the notification and providing concrete fraud recovery resources is the correct response. Many states also have continuing obligations when harm is actively occurring regardless of the initial notification window.

---

**Q14.** Forty-five minutes ago, your company's email server was confirmed as compromised. The email system contains years of correspondence including rate confirmations, carrier onboarding packets with SSN and CDL data, and customer invoices. Which of the following is the correct sequence of immediate actions?

a) Notify affected drivers → Change all passwords → Call FBI/IC3 → Notify IT
b) Shut down the email server → Export all email to a safe location → Notify management
*c) Contain (revoke compromised access, engage IT) → Document the timeline and what was in the email system → Notify cyber insurer → Begin legal assessment of notification obligations — do not attempt to export or modify the affected system before IT assesses it
d) Change all user passwords → Run an antivirus scan → Send a company-wide email warning staff

**Explanation:** The response sequence is: contain, document, notify IT, notify insurer. Do not modify or export data from the affected system before IT and legal can assess it. Changing passwords is a containment action but should be coordinated with IT, not done ad hoc. Sending a company-wide email through a compromised system should not occur.

---

## Access Control Decisions

**Q15.** A 6-person freight brokerage uses a shared Google Drive for all company documents. All six employees have access to all folders, including a folder called "Driver Files" containing completed carrier onboarding packets with SSN and CDL data. The owner says this is easier operationally. What is the correct assessment?

a) This is acceptable for a company of this size — access controls are for larger enterprises
b) The folder is acceptable if access is limited to users who have company Google accounts
*c) All six employees having access to driver SSNs and CDL numbers violates least privilege; the driver files folder must be restricted to the one or two people with HR or compliance responsibility — there is no operational justification for a dispatcher to have access to driver SSNs
d) The setup is acceptable if the Google Drive account is password protected

**Explanation:** Least privilege applies regardless of company size. A dispatcher has no operational need for driver SSN or CDL data. The folder should be restricted to the specific named individuals whose job responsibilities require it. Company size is not a factor in the protection obligation for SSN and CDL data.

---

**Q16.** Your IT contractor completed a TMS integration project three months ago and still has admin-level access to the TMS. He is no longer working on any active project. The relationship ended amicably. What is the correct action?

a) Leave the access in place — he may be needed for future support
b) Downgrade his access to read-only so he can assist with questions if needed
*c) Remove all access immediately — the engagement is complete; contractor access must be removed at the end of the engagement; admin access for a contractor with no active scope is an uncontrolled risk
d) Ask the contractor to self-report if he accesses the system for any non-work reason

**Explanation:** Contractor access must be removed at the conclusion of the engagement, not when the next project starts. An admin credential that remains active after the work is done is an attack surface — whether the contractor is trustworthy is not the point; their credentials can be compromised without their knowledge. Deactivate on the last day of the engagement.

---

**Q17.** A new billing coordinator is being onboarded. Her role requires access to settled shipment records (BOLs and PODs for closed loads) and customer invoice history. Her manager asks IT to give her the same access as the dispatch team, "so she has everything she needs." What access should she actually receive?

a) Full dispatch access — it is simpler to manage one access tier
b) Access to all BOLs and PODs plus the rate confirmation history for her billing work
*c) Access to settled shipment records (closed BOLs and PODs) and customer invoice history only — she does not need access to active load documents, rate negotiations, or carrier banking data; access should be scoped to her actual job requirements
d) Read-only access to the entire TMS so she can reference anything she might need

**Explanation:** Least privilege requires that her access be scoped to what her specific role requires. Billing requires settled records and invoice history — not active dispatch documents, rate negotiation data, or carrier payment routing information. Granting "full dispatch access" adds access to data she does not need and creates unnecessary exposure surface.

---

## Document Fraud Recognition

**Q18.** A carrier has submitted a POD for a $62,000 electronics shipment. The POD shows a delivery signature and timestamp from this morning. However, when you call the consignee to confirm receipt as part of a routine check, they say they received the delivery two days ago and the signature on the POD is not their receiving manager's name. What is this?

a) A clerical error — POD signature discrepancies are common and do not indicate fraud
b) A dispute between the carrier and consignee — route to accounts receivable for resolution
*c) A likely altered or fabricated POD — hold payment immediately, preserve the document, notify management, and do not release any future loads to this carrier pending investigation
d) A billing dispute — the delivery date discrepancy may be a system error

**Explanation:** A POD signed by a name the consignee does not recognize, with a date that does not match the actual delivery, is a strong indicator of document fraud. The correct response is to hold payment, preserve the document as evidence, and escalate — not to process it as a routine discrepancy.

---

**Q19.** You receive an email from a carrier you have used before. The email contains a new W-9 and new ACH banking instructions, explaining that the carrier changed their bank. The email address looks correct. What is the appropriate response before updating the payment record?

a) Update the banking information — the email address is verified and the W-9 looks legitimate
b) Ask the carrier to resend from their official domain before updating
*c) Call the carrier on the phone number you have had on file since before this email — not a number provided in this email or the attached documents — and verbally confirm the banking change before making any updates
d) Wait to see if the first payment to the new account clears before treating it as suspicious

**Explanation:** This is the BEC payment fraud pattern. Attackers compromise or spoof a vendor's email, send fraudulent banking change instructions, and collect the next payment. The verification must happen on a phone number you already have — not one provided in the suspicious message. This applies equally to carrier banking changes and any other payment instruction update.

---

**Q20.** A stranger calls your dispatch line and identifies himself as an auditor from a state trucking association conducting a CDL compliance survey. He asks you to confirm the CDL numbers and expiration dates for your top five drivers so he can verify they are in good standing. He offers to send an email confirming his identity afterward. What is the correct response?

*a) Decline to provide CDL information over the phone — CDL numbers are driver PII, the request is unverified, and legitimate auditors do not request driver PII from carriers by phone; ask for written documentation through official channels and verify independently
b) Provide the CDL expiration dates only — not the numbers themselves
c) Ask him to email his auditor credential and then provide the information once you have reviewed it
d) Provide the information — CDL expiration status is public record

**Explanation:** CDL numbers are driver PII that must not be shared with unverified parties over the phone, regardless of the caller's stated affiliation. Legitimate regulatory audits are conducted through documented, official channels — not cold calls requesting sensitive driver data. This pattern (urgent authority request by phone for driver PII) is a social engineering technique. The correct response is to decline and require written, verifiable documentation through official channels.

---
