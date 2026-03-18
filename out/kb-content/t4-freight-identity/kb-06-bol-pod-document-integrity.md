---
title: BOL/POD Document Integrity: What a BOL Controls and How It Is Abused
type: training-content
topics: Document Fraud
source_trust: internal
---

# BOL/POD Document Integrity: What a BOL Controls and How It Is Abused

The Bill of Lading (BOL) is the controlling document for a shipment. It establishes what was picked up, from where, in what condition, and to what destination. Fraudsters know that controlling the BOL controls the load — and document manipulation is increasingly central to cargo theft operations. CargoNet has documented that complex cargo theft schemes involving document fraud and identity theft are becoming more prevalent.

## What the BOL Controls

The BOL serves three legal functions:
1. **Receipt of goods** — the carrier acknowledges receipt of the described cargo.
2. **Contract of carriage** — defines the terms under which the carrier will transport the goods.
3. **Document of title** (for negotiable BOLs) — the physical document entitles the holder to the goods.

Every field on the BOL is meaningful. The consignee name, delivery address, cargo description, quantity, and seal number are all control points that, if changed, can redirect a load.

## How Document Fraud Works in Freight

**Fictitious pickup documents:** An attacker creates a BOL or delivery order using a real shipper's name and letterhead template. The document appears legitimate but directs a fraudulent driver to a dock for a load they are not authorized to pick up. Some operations source real BOL templates from compromised email accounts or public samples.

**Late-stage document modification:** A load is picked up legitimately, then the delivery address or consignee is changed through a fraudulent "amended BOL" emailed to the carrier in transit. The carrier, not knowing the amendment is fraudulent, diverts the load.

**POD forgery:** After a theft-by-deception event, the fraudulent carrier submits a forged proof of delivery — with a fabricated signature or a photo of a delivery that did not happen — to claim the load was delivered and demand payment.

**Authority document misuse:** Fraudsters create forged "carrier authority" documents, insurance certificates, or W-9s using a legitimate carrier's information. These are submitted in carrier packets to make the fraudulent carrier appear legitimate.

## BOL Integrity Controls

**At pickup:**
- The BOL must match what is in your TMS for that load: shipper name, consignee, cargo description, quantity, and destination.
- Any discrepancy between what the arriving driver presents and what is in your TMS should be treated as a potential document fraud indicator.
- The seal number applied at pickup is recorded on the BOL and in your TMS. This number follows the load.

**For amendments:**
- A BOL amendment — any change to the destination, consignee, or load description after pickup — requires verification through your established dispatch contact.
- Do not process a BOL amendment received by email or text from an unverified contact.

**For POD:**
- POD must be verified against your delivery appointment records. If delivery completion was not confirmed through your normal process (driver check-in, consignee notification, TMS update), a POD submitted after the fact should be scrutinized.

## Document Security Practices

- BOL templates and letterhead should not be shared externally or posted publicly. Attackers use legitimate-looking templates.
- Completed BOLs should be stored in your TMS, not only as email attachments or loose files.
- Access to create or modify BOLs in your TMS should be limited to authorized dispatch and operations staff.
- Any request to provide or resend a BOL to a party outside the normal delivery chain should be verified before complying.

## The Rule on Document Trust

A professional-looking document is not evidence of a legitimate transaction. Documents can be copied, modified, and forged. Document integrity is established by the verification process — FMCSA lookup, callback verification, pickup code — not by the appearance of the paperwork.

Never let a document substitute for a verification call.
