---
title: "Sharing Freight Documents Securely: When Email Is Not Enough"
type: training-content
topics:
  - Data and Document Security
source_trust: T1
freshness_cycle: 12mo
---

# Sharing Freight Documents Securely: When Email Is Not Enough

Standard email is unencrypted in transit. Most email providers encrypt the connection between your client and their server, but that does not mean the message content is protected end-to-end. Email sits in inboxes, gets forwarded, lands on compromised servers, and stays accessible long after the original transaction is complete. For the most sensitive freight documents — driver PII, payment instructions, high-value cargo manifests — email alone is not a sufficient transmission channel.

This is not a theoretical concern. The TT Club and BSI Annual Cargo Theft Report documents document interception as a live freight fraud vector. Attackers intercept or obtain BOLs and PODs, alter them, and collect cargo or payment. Limiting who can access and share documents limits the blast radius when any part of the chain is compromised.

## What Must Never Travel in Unencrypted Email

These categories carry an absolute prohibition on transmission via standard unencrypted email:

- **Social Security Numbers (SSN)** — driver or employee SSNs sent via email are the most common source of driver PII exposure in small freight operations
- **CDL numbers and issuing state** — independently useful for identity fraud and false employment verification
- **Full dates of birth** — in combination with name and CDL, DOB enables synthetic identity creation
- **Drug and alcohol test results** — DOT-regulated; access restricted; never appropriate for general email
- **Driver medical records and medical examiner certificate details**
- **Bank account and routing numbers** — for any party: carrier ACH details, driver payroll routing, factoring account data
- **Payment change confirmations** — any message confirming a new bank account, new ACH routing, or new wire destination must not live only in email; payment changes require verbal verification on a known-good number (see T2 policy)

## What Requires Secure Channels Even If Not Technically PII

Some freight documents do not contain personal data but are operationally sensitive enough to require controlled sharing:

- **Rate confirmations**: contain your pricing, your carrier identity, your shipper and consignee, and your lane. Interception enables carrier impersonation, customer poaching, and targeted BEC fraud.
- **BOLs with high-value commodity detail**: electronics, pharmaceuticals, and consumer goods manifests tell an attacker exactly what is in the truck, where it's going, and when. This information has direct cargo theft value.
- **Customer contact and account data**: your shipper contacts, account numbers, and billing data are the raw material for BEC attacks targeting your customers.

## Approved Methods for Secure Sharing

**1. Secure document portal (preferred)**

A TMS document portal, carrier onboarding platform (RMIS, MyCarrierPackets, Highway), or dedicated cloud document portal with required login is the preferred method for sharing any sensitive freight document. These platforms maintain an audit trail, require recipient authentication, and can have access revoked. Use these for driver onboarding packets (which contain SSN and CDL), rate confirmations, and carrier payment setup.

**2. Encrypted email**

True end-to-end email encryption using S/MIME or PGP is technically robust but operationally complex for most small freight companies. More accessible options include Microsoft 365 Purview Message Encryption (built into M365 Business and above), Google Workspace Confidential Mode, Virtru (integrates with Gmail and Outlook), or Proton Mail for businesses that need a straightforward encrypted email service. These options are practical for SMBs and appropriate for any message containing SSNs, CDL numbers, or banking data.

**3. Password-protected PDF (minimum bar)**

When secure portal and encrypted email are not available, a password-protected PDF is the minimum acceptable control for a sensitive attachment. The document password must be delivered through a completely separate channel — a phone call or text message, not included in the same email as the attachment. Sending the password in the same email as the protected file defeats the protection entirely.

## Recipient Verification

Before transmitting sensitive documents to a new contact or in response to a contact-information change request, verify the recipient by phone using the original, known-good contact number. Do not use a phone number provided in the request email or in a message you cannot independently authenticate.

This is the same verification principle that governs payment changes (T2): an attacker who has compromised an email account will provide new contact details in that compromised email thread. The only way to verify a new destination is to call the number you already had on file.

## Cloud Sharing Default Settings

Google Drive and Microsoft OneDrive default to broader sharing than most users realize. "Anyone with the link can view" is the default behavior in many Google Drive share dialogs, and OneDrive links set to "People in your organization with the link" still expose documents to all company users, including those who should not have access to driver files or financial data.

Train all staff on the difference between these settings:

- "Anyone with the link" — do not use for any business document
- "Anyone in the organization with the link" — acceptable for general operational documents, not for PII or financial data
- "Specific people" — required for rate confirmations, BOLs with commodity detail, customer account data, and any document containing driver PII

Review existing shared folders periodically to confirm that access settings are correctly applied. A shared folder that accumulated "anyone with the link" permissions over months of operational use is a quiet data exposure that may not trigger any alert until after the damage is done.

## The Operational Standard

If you are about to attach a driver qualification document, a bank account number, or a rate confirmation to a standard email and press send, stop. Ask whether the recipient needs this information in this format and whether a portal, encrypted channel, or password-protected file is available. The inconvenience of an extra step is not comparable to the operational and legal consequences of an exposed SSN or a fraudulent carrier payment.
