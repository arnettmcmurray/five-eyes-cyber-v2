---
title: "BEC Through a Trusted Vendor: How Attackers Use Your Vendor Relationships"
type: threat-brief
topics:
  - Third-Party and Vendor Risk
source_trust: T1
freshness_cycle: 6mo
---

# BEC Through a Trusted Vendor: How Attackers Use Your Vendor Relationships

Business email compromise delivered through a trusted vendor is harder to catch than BEC from an unknown sender. The email comes from a domain you recognize. The account history looks real. The relationship already exists. Your finance team has processed payments from this vendor before, which means the request does not trigger the internal skepticism that a cold email might.

CargoNet's Q1 2025 threat reporting identified BEC-enabled cargo theft as the predominant cargo theft strategy in the current environment — and noted that attackers are increasingly operating through compromised vendor and partner accounts rather than attacking target companies directly. The FBI IC3 2024 Internet Crime Report documented total BEC losses of $2.77 billion. Vendor email compromise is a documented BEC variant, not an edge case.

## Three Attack Patterns in Freight

**Pattern 1: Compromised Broker or Carrier Email — Payment Change BEC**

The attacker gains access to a vendor's email account through credential theft — a phishing email the vendor's employee clicked, a reused password from a breached website, or an account with no MFA. Rather than immediately making noise, the attacker monitors the mailbox. They read your email threads to understand your payment relationships, amounts, and timing. Then, at the right moment in the payment cycle, they send a realistic "update our payment details" email from the vendor's real email address and domain.

This is the hardest variant to catch because the email passes every surface check. It comes from a known domain. The display name is correct. The signature block looks right. The only reliable defense is a callback verification rule that applies regardless of how legitimate the email looks — because this one does.

**Pattern 2: Load Board Account Compromise — Fictitious Pickup**

The attacker compromises a carrier's load board account through credential theft at the carrier company. Using the carrier's legitimate account on DAT, Truckstop, or a similar platform, the attacker accepts loads on the carrier's behalf, then dispatches entirely different drivers to pick them up. The shipper or broker sees a known carrier accepting the load. The carrier has no idea their account was used. The cargo disappears.

CargoNet and NMFTA have both documented this pattern. Load board credential theft is not hypothetical; it is an active operational technique used by cargo theft rings.

**Pattern 3: MSP Compromise — Multi-Client Ransomware**

A managed IT provider with broad client access is a high-value target for ransomware groups. CISA has documented this pattern explicitly: attackers compromise the MSP's management platform or remote access tools, then use that access to deploy ransomware across multiple client environments simultaneously. One successful intrusion at the MSP becomes ransomware events at dozens of freight companies, logistics firms, and other SMB clients — all at the same time.

This is why MSP vetting, MSP access logging, and MFA requirements for MSP remote access are not optional controls. The MSP's security posture is your security posture, because the attacker does not distinguish between them.

## Why Trusted Vendors Are Useful to Attackers

The trust relationship is already established and already functioning. Your AP coordinator does not second-guess a payment change request from a carrier you have paid 30 times before. Your dispatcher does not verify a load board acceptance from a carrier they know. Your IT manager does not question a remote session from your MSP because MSP remote sessions are routine.

Attackers understand this. They target vendor accounts specifically because the access those accounts carry does not require them to establish new trust — it is inherited from the existing relationship.

## Warning Signs That a Vendor Communication Is Compromised

No single indicator is definitive, but the following patterns appear consistently in compromised vendor communications:

**Payment detail change request via email.** Legitimate payment changes occasionally happen — but the correct response is always a phone verification call. An email requesting a payment change, even from a known vendor, is not sufficient authorization on its own. It never is.

**Urgency language tied to operational pressure.** "Process today or we'll hold your loads." "Settlement must go to the new account before tomorrow or there will be delays." In freight, urgency is real and routine. Attackers construct urgency specifically because they know it short-circuits verification in this industry.

**New contact name you have not worked with.** A payment change request from "Jennifer in billing" when you have always worked with "Tom" deserves verification. Personnel transitions happen — but verify the transition, not just the request.

**Reply-to address different from the From address.** The email displays as coming from `billing@realvendor.com` but the reply-to is `billing@realvendor-invoicing.com`. The attacker controls the reply-to; they do not always control the From. Check both.

**Request to use a new communication channel or to keep the change confidential.** "Please process this through our new portal" or "Don't mention this to your accounting team yet" are social engineering techniques designed to isolate the transaction from normal oversight.

The answer to all of these is the same: stop, call the vendor at a number you have independently verified, and confirm before acting. A legitimate vendor can wait 15 minutes for that call. A fraudulent request cannot.
