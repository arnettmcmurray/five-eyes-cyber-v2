---
title: "Handling Freight Documents Securely: BOL, POD, Rate Con, and Driver Files"
type: training-content
topics:
  - Data and Document Security
source_trust: T1
freshness_cycle: 12mo
---

# Handling Freight Documents Securely: BOL, POD, Rate Con, and Driver Files

Every freight operation runs on documents. The Bill of Lading controls who receives cargo. The Proof of Delivery triggers payment. The rate confirmation identifies the carrier, the rate, and the shipper. Driver qualification files contain among the most sensitive personal data your company holds. When any of these documents is mishandled — lost, altered, intercepted, or left unsecured — the consequences are not administrative. They are operational and financial.

The TT Club and BSI Annual Cargo Theft Report consistently identifies document fraud as one of the primary enablers of fictitious pickups and fraudulent payment collection. The attack is low-tech: get access to the right document, alter one field, and collect cargo or payment that belongs to someone else. The document is the attack surface.

## Why Freight Documents Matter for Security

**A fraudulent BOL means stolen cargo.** The Bill of Lading is the legal instrument that controls cargo release at the pickup point. A fabricated or altered BOL — with a different carrier name, a different destination, or a different consignee — is what makes a fictitious pickup possible. The dock worker is not verifying the truck; they are verifying the document. If the document looks right, the cargo moves.

**A manipulated POD means getting paid for undelivered goods.** The Proof of Delivery authorizes payment. A POD that has been altered to show delivery when the shipment is in dispute, short, or missing is a direct fraud vector against your accounts payable process. Reviewing PODs before approving payment is not bureaucratic caution — it is basic fraud prevention.

**A rate confirmation is a targeting document.** Your rate confirmation contains your price, the carrier identity, the shipper, the consignee, and the lane. If an attacker intercepts a rate confirmation, they have everything they need to impersonate the carrier, contact your shipper, and redirect cargo or payment. Rate confirmations are not sensitive in the same way as SSNs, but they are operationally sensitive in a way that directly enables fraud.

**Driver qualification files are PII and must be treated accordingly.** SSN, CDL, DOB, drug test results, medical examiner records — these are the highest-sensitivity documents in your operation, stored in the same office as load documents but subject to an entirely different level of protection.

## Document-by-Document Security Standards

**Bill of Lading (BOL)**

Retain the original or a certified copy. Never release cargo without a matching, verified BOL. Any change to destination, carrier identity, or consignee after the load has been tendered requires escalation through your exception-handling process (see T4 exception-handling policy) — not a verbal okay from someone who calls or emails. Freight fraud routinely involves a mid-transit request to redirect delivery; that request should trigger verification, not automatic compliance.

**Proof of Delivery (POD)**

Retain originals. Review the POD against the BOL before approving any invoice for payment. A POD that does not match the BOL — different commodity weight, different delivery address, different receiver signature — is a fraud signal that must be investigated before payment clears. Do not approve payment on a POD discrepancy under time pressure.

**Rate Confirmation**

The rate confirmation is shared between you and the carrier. It should not travel beyond those parties. Do not copy rate confirmations into general email threads, forward them to parties not involved in the load, or store them in shared folders accessible to all staff. Interception of rate confirmations is a documented step in carrier impersonation attacks — the attacker needs your pricing and customer data to make the impersonation credible.

**Driver Qualification Files**

Highest sensitivity category. SSN, CDL, drug test results, DOB, and medical records must never be in shared drives accessible beyond HR and compliance staff. Never include this information in email without encryption. Never discuss drug test results in general team communication channels. Retention and access requirements are addressed in the driver PII protection policy (data-security-01).

## Retention Requirements

FMCSA sets the minimum retention floors:

- Driver qualification files: duration of employment plus three years (49 CFR 391.51)
- Accident register: three years from the date of each accident (49 CFR 390.15)
- Drug and alcohol test records: one to five years depending on record type (49 CFR Part 40)
- Hazmat shipping papers: 375 days (49 CFR 177.817)

These are legal minimums. Your contracts with shippers or brokers may require longer retention for BOLs and PODs — check your broker-carrier agreement.

## Secure Storage Standards

**Digital documents.** Cloud storage for business documents is operationally appropriate and widely used. It is acceptable security only when access controls are properly configured. "Anyone with the link can view" is not acceptable for any freight document with business or personal data. BOLs, PODs, rate confirmations, and driver files must be in folders configured for specific, named users only.

**Driver files specifically** must be stored in a system with role-based access control — not a general shared folder. If your TMS does not provide adequate access controls for driver qualification files, store them in a separate, restricted location.

**Physical documents.** Paper driver qualification files belong in a locked filing cabinet — not a wire inbox on the dispatcher's desk. Paper BOLs during active operations should be in a controlled area of the dispatch office, not accessible to walk-in visitors or general staff.

## The Practical Point

Document handling is the physical layer of freight security. A dock worker who accepts a BOL without checking the carrier name is the same attack surface as a dispatcher who emails a rate confirmation to a party who wasn't on the original load. The document controls the money and the cargo. Treat it accordingly.
