---
title: "Freight-Specific Incident Response: Carrier Impersonation, BEC Wire Fraud, Cargo Theft"
type: training-content
topics:
  - Incident Reporting & Response
source_trust: T0
freshness_cycle: 6mo
---

# Freight-Specific Incident Response: Carrier Impersonation, BEC Wire Fraud, Cargo Theft

Three fraud scenarios dominate freight cybersecurity losses. Each has a distinct response sequence. The wrong moves in the first hour do not just delay recovery — they can eliminate it entirely.

---

## Scenario 1: Carrier Identity Impersonation

**What it looks like:** A shipper calls your operations desk asking about a load your company picked up yesterday. You have no record of that load. Someone has been using your USDOT number, MC authority, or company name to book and accept freight you never tendered.

**Why it happens:** Carrier identity information is publicly available through FMCSA's carrier lookup. Fraudsters pull a legitimate carrier's identity — including authority status, insurance certificates, and physical address — and use it to pose as that carrier on load boards, often with a slightly different phone number or email domain.

**Incident Response Steps:**

1. **Verify the scope.** Search DAT and Truckstop for postings or activity under your USDOT and MC numbers that you did not authorize. Ask the shipper for any documentation — load confirmation, BOL, driver contact information — provided by the impersonator.

2. **Immediately notify DAT and Truckstop.** Contact both platforms directly with your USDOT and MC number and request that they flag your identity as compromised and alert brokers tendering loads under your authority. Ask them to freeze any new bookings pending verification.

3. **File a complaint with FMCSA.** FMCSA maintains carrier identity records and can document the fraud, which supports any downstream law enforcement action.

4. **File an FBI/IC3 report** at ic3.gov. Include the fraudulent load postings, any communications from the impersonator, the shipper's contact information, and the timeline of the fraud.

5. **Issue notice to your known shipper and broker contacts.** Tell them your identity has been compromised and provide a direct verification contact number so they can confirm any load before releasing freight.

6. **Gather and preserve evidence.** The fraudulent load postings (screenshots if they are still live), any emails or messages from the impersonator, any documentation provided to shippers. Do not lose these — they identify the attacker's infrastructure and support law enforcement investigation.

---

## Scenario 2: BEC Wire Fraud — Payment Redirected

**What it looks like:** A payment for a delivered load — or a customer's payment to your company — was sent to a fraudulent bank account. The fraud was executed by someone who impersonated your finance team in email (or impersonated the customer's AP department) and issued updated payment instructions with new banking details.

**Why it happens:** Business email compromise in freight targets the moment between invoice delivery and wire transfer. Attackers either compromise a legitimate email account or create a convincing lookalike domain and intercept the payment conversation, substituting fraudulent bank account information for real account numbers.

**Incident Response Steps:**

1. **Do not attempt to reverse the wire yourself.** A self-initiated reversal attempt can fail and may complicate the bank's fraud recovery process. Go through the proper channels immediately.

2. **Call your bank's fraud line right now.** Wire recall is measured in hours — not days. The moment funds leave your bank, they begin moving toward offshore accounts through a chain of correspondent banks. Your bank's fraud team has direct channels to initiate a recall and contact the receiving institution. Every hour you wait reduces the probability of recovery.

3. **Call the sending party's bank.** If the fraudulent wire came from your customer's account (they were defrauded, not you), contact their bank's fraud line as well. Both institutions need to be coordinating simultaneously.

4. **File an FBI/IC3 report immediately.** The FBI's Financial Fraud Kill Chain (FFKC) is the mechanism for attempting to freeze wires before they move offshore. This only works within a 72-hour window from the time of transfer. Do not wait until your internal investigation is complete. File what you know now and update the report later.

5. **Call your cyber insurance carrier.** BEC wire fraud is typically a covered event, but your policy may have a notification deadline. Call now, not after you have figured out the scope.

6. **Preserve all email communications.** Do not delete, move, or archive anything. The email chain — including any messages from the attacker's impersonation account — is forensic evidence. Forward to IT with headers intact. Provide originals, not printed copies.

7. **Engage legal before communicating publicly.** Customers, partners, and other carriers will ask questions. Do not speculate about scope or assign fault until legal has reviewed the situation.

---

## Scenario 3: Cyber-Enabled Cargo Theft

**What it looks like:** A load your dispatcher tendered is not where it should be. The driver is not responding to calls. The last GPS ping from the ELD showed an unexpected location. When you contact the consignee, they have not received the shipment. The "driver" or "carrier" who accepted the load used fraudulent credentials, a fake broker of record, or spoofed pickup authorization.

**Why it happens:** Cyber-enabled cargo theft uses fraudulent digital credentials — fake MC authorities, spoofed broker identities on load board postings, forged BOL documents — to get unauthorized access to freight. The attack starts online and ends with physical cargo gone.

**Incident Response Steps:**

1. **Confirm last known position.** Pull ELD records, GPS history, and last verified driver contact. Establish the last point of legitimate contact and the estimated location of the freight.

2. **Contact shipper and consignee immediately.** Notify both parties that the shipment is unaccounted for. Do not speculate about cause — confirm facts first.

3. **File a cargo theft report with FBI/IC3 and state law enforcement.** Cargo theft crosses jurisdictions; both federal and state reporting channels matter. Include the load details, the suspected fraudulent credentials, and any communication from the attacker.

4. **Notify your cargo insurance carrier immediately.** Cargo policies have notification requirements — some require report within 24-48 hours of discovery. Check your policy and call now. Delayed notification can affect coverage.

5. **Contact CargoNet or NMFTA.** CargoNet and the National Motor Freight Traffic Association maintain cargo theft incident reporting databases that feed intelligence to law enforcement and carriers across the industry. Reporting here helps identify patterns and track theft rings across the sector.

6. **Preserve all dispatch records.** Load confirmations, BOL copies, driver assignment records, load board postings and associated communications. These establish the chain of authorization and identify where the fraudulent credential was inserted.

---

## The Principle Behind All Three Scenarios

Evidence and speed both matter, and they are in tension. Moving fast to call the bank, the load board, and law enforcement is essential. Destroying evidence while doing it is unacceptable.

The solution is to do both simultaneously: call the bank and IT at the same time. Screenshot everything before you start making calls. Write down the time. Escalate up the chain while preserving what is in front of you.

Waiting to "figure it out internally" before reporting is the decision that loses the recovery window in all three scenarios. The bank's fraud recall, the FBI's Financial Fraud Kill Chain, the load board identity freeze — every one of these mechanisms has a time limit. The clock starts when the fraud happens, not when you feel ready to report it.
