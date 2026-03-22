---
title: The Freight Fraud Kill Chain: Where Verification Must Happen
type: training-content
topics: Load Board Scams and Double Brokering, Broker-Carrier Impersonation, Document Fraud
source_trust: internal
---

# The Freight Fraud Kill Chain: Where Verification Must Happen

Modern cargo theft is not primarily a physical crime. Federal law enforcement data shows that the dominant pattern is deception — attackers impersonate legitimate carriers, brokers, or shippers; exploit load boards and document systems; and steal loads that are willingly handed to them by people who believed they were dealing with someone legitimate.

This article maps the freight workflow from tender to settlement and identifies exactly where verification must occur to break the fraud kill chain.

## Stage 1 — Tender and Match

**What happens:** A shipper or broker posts a load. A carrier or their representative submits a matching offer through a load board or direct contact.

**Fraud attack:** A fraudulent "carrier" creates a profile on the load board using a stolen USDOT number, a hijacked MC number, or entirely fabricated credentials. They bid on and accept loads — especially high-value, easy-to-convert commodities: electronics, pharmaceuticals, alcohol, baby formula.

**Verification required:**
- Independently verify the carrier's MC and USDOT through FMCSA's official lookup (FMCSA.dot.gov / Li.fmcsa.dot.gov), not just through the load board's display.
- Confirm the carrier is "Authorized for Property" transport, is not flagged for safety issues, and matches the profile you expect.
- Be alert to carriers with very new authority (recent MC registration), inconsistencies between displayed and actual authority dates, or suspiciously competitive rates.

## Stage 2 — Carrier Vetting and Onboarding

**What happens:** A new or less-familiar carrier is set up for a load. Contact information is exchanged. Carrier packet may be sent.

**Fraud attack:** An attacker impersonating a legitimate carrier provides a fraudulent carrier packet with real-sounding company information, modified bank details, and contact information the attacker controls. Alternatively, an attacker compromises a broker's email or TMS to insert themselves as a carrier contact for a legitimate load.

**Verification required:**
- Call the carrier at a phone number obtained from FMCSA records or your existing verified carrier file — not from the carrier packet or load board listing being submitted.
- Confirm the driver name, equipment type, and truck/trailer number you expect to see at pickup.
- Do not use "confirm by email" as the verification — it is possible an email thread has been compromised or is being spoofed.

## Stage 3 — Pickup Appointment and Arrival

**What happens:** A driver arrives at the shipper's dock for pickup. The dock or dispatcher confirms the appointment and releases the load.

**Fraud attack:** A fraudulent driver arrives with paperwork that looks correct (often created from real BOL templates with modified details) and presents credentials that appear to match the load. The dock releases the load to a fraudulent carrier who drives away with cargo that will never be delivered legitimately.

**Verification required:**
- Verify the driver's identity: license, name matching the load appointment.
- Verify the equipment identifiers: tractor plate/VIN, trailer plate/VIN, and seal number.
- Cross-reference against the dispatch record: the truck and driver showing up must match what was arranged.
- Use a unique pickup code or advance confirmation number — communicate it separately to the expected driver before pickup. The arriving driver must know this code.
- Do not release a load to a driver who cannot provide the pickup code, whose equipment does not match, or whose identity cannot be verified — regardless of how legitimate the paperwork appears.

## Stage 4 — In-Transit

**What happens:** The load is in transit. Communications may occur between shipper, broker, carrier, and consignee.

**Fraud attack:** Mid-transit reconsignment requests arrive — "change the delivery destination" — often framed as an urgent customer request. Alternatively, a load board account is compromised and tracking data is used to plan a physical interception.

**Verification required:**
- All destination changes must be verified through a pre-established process. Never change a delivery destination based solely on an in-transit email or call from an unverified contact.
- Apply the two-person rule for mid-transit reconsignment: two independent people must approve the change, and the verification must go back to the original booking contact — not the contact requesting the change.

## Stage 5 — Delivery and POD

**What happens:** Load arrives at consignee. Proof of delivery (POD) is generated.

**Fraud attack:** Fraudulent POD is submitted after a theft-by-deception event — the "carrier" creates a delivery receipt with a forged signature to claim the load was delivered. Or, in a double-brokering scenario, the legitimate consignee has received a different load or nothing at all.

**Verification required:**
- POD must match the actual delivery location and recipient name.
- Any POD that arrives without prior delivery confirmation from the consignee should be verified before final settlement.

## Stage 6 — Settlement and Payment

**What happens:** Final settlement payment is processed.

**Fraud attack:** Mid-settlement payment redirect — as covered in the BEC/payment fraud module — an email arrives with "new banking details" for the carrier or factor.

**Verification required:**
- Payment destination must match the carrier's file record. Any late-stage payment routing change requires callback verification (see the BEC/Payment Fraud articles).

## The Common Thread

Verification works. It is not glamorous. It adds minutes to a process. But every major cargo theft-by-deception in public law enforcement reporting relied on a verification step being skipped — a pickup code not used, a carrier identity not confirmed, a reconsignment not verified, a domain not checked.

The kill chain breaks when someone does the 2-minute verification call.
