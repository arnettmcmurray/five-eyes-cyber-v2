---
title: "How Freight Data Gets Stolen and Misused: PII Theft, Document Fraud, and BEC Data Harvesting"
type: threat-brief
topics:
  - Data and Document Security
source_trust: T1
freshness_cycle: 12mo
---

# How Freight Data Gets Stolen and Misused: PII Theft, Document Fraud, and BEC Data Harvesting

Data breaches in freight do not look like the enterprise breaches that make the news. There is no nation-state actor, no sophisticated zero-day exploit, no months-long infiltration of a defended perimeter. Freight data attacks are operationally efficient: find a document left in an accessible location, compromise an email account and monitor it quietly, intercept a BOL and alter one field. The data stolen is used immediately, within the same operational cycle it was taken from, before anyone notices something is wrong.

Understanding how freight data is specifically targeted and misused is the foundation for understanding why the protection controls in this module are not bureaucratic overhead — they are direct defenses against documented active threats.

## Driver File Exfiltration and Identity Fraud

The FBI Internet Crime Complaint Center (IC3) 2024 Annual Report documents the link between identity theft and employment record exfiltration. The CDL number combined with SSN is a high-value PII package for two specific fraud types:

**Synthetic identity fraud**: Attackers combine a real SSN (from a data breach or purchased from dark web markets) with a fabricated name and address to create a new credit identity. A CDL number adds legitimacy to employment verification, enabling the synthetic identity to pass background checks, open credit accounts, and apply for loans. Driver records stolen from a small trucking company's poorly secured shared drive are raw material for fraud that may not surface for 18 months.

**False employment verification**: A CDL number, SSN, and employment history from a stolen driver qualification file enables an attacker to fabricate a trucking employment history. This is used to obtain commercial driving positions under false qualifications — a safety concern as well as an identity fraud concern.

Small freight carriers and brokers are specifically targeted for driver data because they hold complete driver qualification packages — CDL, SSN, DOB, employment history, drug test results — and they frequently store this data in shared drives or email folders with no access restriction.

## Document Fraud: Altered BOLs, Fabricated PODs, and Fictitious Pickups

The TT Club and BSI Annual Cargo Theft Report consistently identifies document fraud as a primary mechanism for staged cargo theft. The attack pattern is documented and repeating:

**Fictitious pickup via fabricated BOL**: An attacker creates a BOL or alters an intercepted one to show their controlled carrier as the authorized pickup party. At the dock, the document looks legitimate. The cargo leaves. The legitimate carrier arrives later; nothing is there. Electronics, pharmaceuticals, and high-value consumer goods are the primary targets because the resale value justifies the effort of producing credible documentation.

**Fraudulent payment via manipulated POD**: An attacker obtains a POD — sometimes through an email compromise, sometimes through an unsecured document portal — and alters it to show delivery of goods that were not delivered, or to change the amount to match a fraudulent invoice. The altered POD flows into accounts payable; the payment clears before the discrepancy is detected.

The document is the attack surface. Securing document access, limiting sharing, and verifying documents before releasing cargo or approving payment are the direct countermeasures.

## BEC Data Harvesting: The Quiet Phase Before the Attack

Business Email Compromise attacks against freight companies do not always begin with an immediate fraud attempt. A significant portion of BEC attacks include a data harvesting phase in which attackers compromise an email account and monitor it for weeks or months before taking any visible action.

During this monitoring period, attackers collect:

- **Rate confirmations**: to understand which carriers you use, what you pay them, and which shippers you serve. This data is used to impersonate you convincingly in future fraud targeting your shippers or carriers.
- **Payment instructions**: to identify ACH and wire details for your carriers and suppliers — the target of the eventual payment fraud. Attackers know exactly which bank to redirect and what amount to use because they have been watching real payments.
- **Driver files** (if accessible via email or an email-linked portal): SSN and CDL data harvested during the monitoring phase is either used directly or sold.
- **Customer contact information**: to build a target list for future BEC fraud directed at your customers.

The harvesting phase is what makes BEC attacks credible. By the time the attacker sends a fraudulent payment change instruction, they have been reading your emails long enough to know how your company communicates, who approves payments, and what a legitimate payment instruction from you looks like.

## Why Small Freight Companies Are Targeted

Small freight companies hold operationally valuable data — retail and pharmaceutical cargo manifests, carrier relationships, customer pricing — while operating with weaker data access controls than enterprise shippers or large brokerages. The asymmetry is attractive: the data value is comparable to larger targets, but the security controls are significantly lower.

Driver files in a shared Google Drive, rate confirmations forwarded over standard email, BOLs stored in an inbox rather than a document system — these are not unusual configurations in a 10-truck carrier or a 3-person brokerage. They are the default. And because they are the default, attacking them requires no sophistication.

## Three Ways Freight Data Attacks Are Different

**The data is operational, not just personal.** A driver SSN enables identity fraud, but a BOL controls cargo release and a rate confirmation enables impersonation. The data does not just affect individuals — it controls physical and financial outcomes in the same transaction cycle it was stolen from.

**Fraud can happen before the breach is detected.** In a typical data breach, the attacker exfiltrates data and uses it later, giving the victim time to detect the breach before the fraud occurs. In freight, the BOL or POD is altered and used in the same day. By the time anyone notices the document was manipulated, the cargo is gone or the payment has cleared.

**The victims include your customers and carriers, not just your company.** When your rate confirmation is intercepted and used to impersonate you to a shipper, the shipper is the victim of fraud your data made possible. When your carrier's banking data is changed due to a compromised payment record, the carrier bears the financial harm. Data exposure in freight creates liability exposure to third parties, not just harm to the breached company.
