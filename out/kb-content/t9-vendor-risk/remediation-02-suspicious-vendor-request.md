---
title: "You Got a Payment Change Request from a Vendor — Pause Before You Process"
type: remediation-card
topics:
  - Third-Party and Vendor Risk
---

# You Got a Payment Change Request from a Vendor — Pause Before You Process

You received an email requesting a change to a vendor's payment details — new ACH routing, new wire destination, new factoring bank, or a new payee. Before you do anything else, stop.

---

## Decision Flow

**Does the request have any of these characteristics?**
- Urgency language ("process before close of business," "holds will apply if not updated today")
- A new contact name you have not worked with at this vendor
- A request to keep the change confidential or to use a new communication channel
- A reply-to address that differs from the From address
- A request to call a number provided in the email to "verify"

**If yes to any:** treat as suspicious. Follow the steps below.

**If no:** still follow the steps below. The absence of red flags does not make phone verification optional. The rule applies to every payment change request.

---

## Steps

**1. Stop — do not process the change**

Set the email aside. Do not update the payment record, do not initiate the transfer, and do not reply to the email. Processing first and verifying later is how fraud losses happen.

---

**2. Find the vendor's phone number from your own records**

Look in your vendor access register, accounting system, TMS, or the vendor's official website. Do not use any phone number in the email requesting the change — that number may be attacker-controlled.

---

**3. Call that number and ask specifically about the payment change request**

Identify yourself and your company. Name the specific request: "I received an email today asking us to update your ACH routing to [new bank]. I am calling to confirm whether you submitted this request." Ask for the name of the person who submitted it and confirmation of the account details if the change is legitimate.

---

**4a. If confirmed real — document, dual-approve, then process**

Record the verification call: date, time, name of person who confirmed, and any confirmation number provided. Obtain your second approver's independent sign-off with a copy of the verification documentation. Then process the change. Do not skip the documentation step even when verification is clean — it is your audit trail.

---

**4b. If suspicious — preserve, escalate, and report**

- Preserve the email with full headers intact (do not forward without headers; headers contain routing data investigators need)
- Flag to your manager immediately
- Do not notify the vendor via the email thread — if the account is compromised, the attacker is reading those replies
- If funds were already transferred before this review: call your bank's fraud line now to initiate a wire recall; then file a complaint at IC3.gov
- If funds moved and the amount is material: file a Suspicious Activity Report (SAR) with FinCEN at fincen.gov — this is required if your business is a money services business or recommended if you suspect wire fraud involving your accounts

---

## One-Line Summary

**Every vendor payment change requires a phone verification call to a number you already had — not the number in the email — before any change is made or any transfer is processed.**
