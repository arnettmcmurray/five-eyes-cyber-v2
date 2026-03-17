---
title: "Payment Change Requests from Vendors: The Non-Negotiable Verification Rules"
type: training-content
topics:
  - Third-Party and Vendor Risk
source_trust: T1
freshness_cycle: 6mo
---

# Payment Change Requests from Vendors: The Non-Negotiable Verification Rules

The rule is simple and has no exceptions: any payment change from any vendor — ACH routing number, wire destination, factoring bank, fuel card account, new payee — requires a phone verification call to a number you independently know is correct. Not the number in the email requesting the change. Not the number in the email signature. A number from your existing records, your accounting system, or the vendor's official website.

This rule works because email is compromisable and a phone call to a verified number is not. An attacker who has taken over a vendor's email account can send you a perfectly convincing payment change request. They cannot simultaneously control the vendor's phone number at the main office.

## Why This Matters: $2.77 Billion in 2024 Alone

The FBI IC3 2024 Internet Crime Report documented $2.77 billion in BEC losses in 2024. Vendor payment fraud — where an attacker impersonates or compromises a vendor to redirect payments — is one of the primary mechanisms. The losses are not from sophisticated malware or system intrusions. They are from employees who processed payment changes without independent verification, because the email looked right and the relationship was established.

FinCEN has documented specific red flags associated with vendor payment fraud. These red flags are patterns that appear consistently in fraudulent payment change requests:

- Unusual urgency — "must process before close of business" or "payment holds will apply if not updated today"
- A new contact person making the payment change request on behalf of a vendor you know through a different contact
- A change to routing or account number, especially combined with any other red flag
- A request to keep the change confidential or to process it outside normal channels
- A change in communication method — the vendor has never asked you to communicate through this portal before

Any one of these flags is sufficient reason to verify by phone before taking any action.

## How to Verify Correctly

Step 1: Do not reply to the email. Do not call a number provided in the email. The email may be compromised, and any number in it may be attacker-controlled.

Step 2: Find the vendor's phone number in your existing records. Look in your accounting system, your TMS, your vendor contract file, or the vendor's official website. If you have worked with a specific contact before, call their direct line at the number you have historically used.

Step 3: Call that number and ask specifically about the payment change request. Identify yourself, name the request you received, and ask the vendor to confirm whether they submitted it. Ask for confirmation of the account details if the change is legitimate.

Step 4: Document the call. Record the date and time, the name of the person you spoke with, and the confirmation that was given. This documentation protects you and creates an audit trail if questions arise later.

## Dual Approval

Any payment change above a defined dollar threshold — or any new payee being added to your payment system — should require approval from both the person processing it and a second approver, independently. The second approver is not rubber-stamping the first person's work. They are reviewing the payment request, the verification documentation, and the destination account against your vendor record before approving.

Dual approval is most effective when the second approver genuinely reviews rather than passively confirms. The goal is two independent judgments, not two signatures on the same unverified request.

## New Payees: Same Standard

A new ACH or wire payee being added to your system for the first time is a payment change. It carries the same verification requirement as a routing number update for an existing vendor. Before the first payment goes out to any new payee, verify the payee's banking details by phone using an independently confirmed contact number.

## Freight-Specific Exposure Points

Factoring payment changes are a high-priority target. An attacker who changes where your factoring proceeds are sent — either by compromising the factor's email or by impersonating the factor to your AP team — can redirect significant sums before the fraud is detected. Factoring payment change requests deserve extra scrutiny precisely because the amounts involved are often large and the relationship is recurring.

Fuel card account changes are lower-value individually but are a common target because the verification culture around them is less rigorous than around large wire transfers. Apply the same standard regardless of the amount.

## This Is Not Bureaucracy

Dual approval and phone verification for payment changes are not administrative overhead. They are the specific controls that stop the attack. No technical system, no spam filter, no email authentication tool prevents a fraudulent payment change request from a legitimately compromised vendor account. A phone call to a verified number does. The $2.77 billion in 2024 BEC losses flowed through organizations that did not have these controls in place, or had them and did not apply them consistently. The rule only works if it applies every time.
