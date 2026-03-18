---
title: Where BEC Happens in the Freight Payment Cycle
type: training-content
topics: BEC and Payment Fraud
source_trust: internal
---

# Where BEC Happens in the Freight Payment Cycle

BEC does not attack randomly. It attacks at the specific moments in your freight payment cycle where money is about to move and where email-based requests are normal. This map identifies every vulnerable handoff point in your operations and the specific attack that targets each one.

## Stage 1: Carrier Onboarding and Setup

**What happens:** A new carrier is set up in your TMS or payment system with their bank details for future settlements.

**BEC attack:** An attacker impersonates a new carrier or a carrier rep. They send a "complete this carrier packet" email with a form collecting banking details that go directly to the attacker.

**Control:** Verify every new carrier's bank details by calling the carrier directly at a number obtained independently from their MC filing or from a prior verified contact — not from the carrier packet itself.

## Stage 2: Invoice Submission and Approval

**What happens:** A carrier, vendor, or service provider submits an invoice for services rendered.

**BEC attack:** An attacker either compromises the vendor's email account or creates a convincing spoofed email with a near-identical domain, then sends an invoice with "updated banking information."

**Control:** Cross-reference bank details on any invoice against your existing vendor file. Any invoice with new or changed payment details requires callback verification before processing.

## Stage 3: Factoring Payment Processing

**What happens:** Your AP team processes payment to a factoring company (rather than directly to the carrier), following instructions from the factor.

**BEC attack:** The attacker sends email appearing to be from the factoring company announcing new ACH or wire details for a specific carrier or for all carrier payments through that factor.

**Control:** Any change to factoring payment instructions must be verbally confirmed with your existing factoring company contact at the number you have on file.

## Stage 4: Fuel Advance and Detention/Layover Payments

**What happens:** A driver or carrier requests a fuel advance or payment for detention/layover time before the load is complete.

**BEC attack:** A fraudulent carrier (or a legitimate carrier with a compromised email account) requests the advance be sent to an account different from your payment records for that carrier.

**Control:** Fuel advances and detention payments go only to the bank account already on file for that carrier — never to a new account number provided in the payment request. Any change requires standard callback verification.

## Stage 5: Settlement and Final Payment

**What happens:** After load delivery and POD confirmation, final settlement payment is processed.

**BEC attack:** A "late change" email arrives requesting that this settlement be routed to a new account or a new entity. May be framed as "carrier is switching factors" or "billing company has changed."

**Control:** Late-stage payment routing changes require the same verification as any new bank detail — independent callback, dual approval if required by threshold. "The load already delivered — just changing where you send the money" is exactly the framing BEC attackers use.

## Stage 6: Employee Payroll Changes

**What happens:** Drivers or staff submit requests to change their direct deposit bank accounts.

**BEC attack:** Attacker sends email posing as an employee, requesting direct deposit change to a new account.

**Control:** Direct deposit changes require in-person request or a verified phone call with the employee — not just an email. Payroll should call the employee at their number on file before processing.

## Stage 7: Wire Transfers for Urgent Business Needs

**What happens:** An executive or manager authorizes an urgent wire transfer for a business purpose.

**BEC attack:** Executive impersonation email creates pressure for an employee to wire funds immediately, with instructions not to verify through normal channels.

**Control:** No wire transfer is executed based on an email instruction alone. Any wire request requires verbal confirmation with the authorizing person through an independent channel (not replying to or calling numbers from the request email).

## The Single Most Useful Habit

For every payment action you take, ask: "How was this payment instruction delivered to me, and have I verified it through a channel the requester does not control?"

If the answer is "only by email" and "no" — stop and verify before proceeding.
