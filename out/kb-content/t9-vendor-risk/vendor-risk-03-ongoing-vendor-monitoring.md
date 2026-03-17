---
title: "Monitoring Vendor Access After Onboarding: Access Review and Offboarding Controls"
type: policy
topics:
  - Third-Party and Vendor Risk
source_trust: T0
freshness_cycle: 12mo
---

# Monitoring Vendor Access After Onboarding: Access Review and Offboarding Controls

Vetting a vendor before onboarding is necessary but not sufficient. Vendor relationships change: contacts leave, contracts evolve, companies get acquired. Access that was appropriate six months ago may no longer be. An account that was created for a project that ended may still be active. A vendor whose key contact departed may have transitioned your account to a new person you have never verified.

Ongoing monitoring is the control layer that catches what initial vetting cannot anticipate.

## Quarterly Access Review

Every 90 days, pull a list of all active vendor accounts across all business systems. For each entry on the vendor access register, confirm with the relationship owner — the person at your company responsible for that vendor relationship — that:

- The vendor relationship is still active and the contracted scope still requires system access
- The access level is still appropriate (not expanded beyond what was originally scoped)
- The named contact at the vendor is still the person with access, or if personnel have changed, the new contact has been vetted appropriately

This review does not require specialized tools. It requires 30 minutes and a current vendor access register. Block time for it. It does not happen unless it is scheduled.

## Change Management

Any change to a vendor's access scope — expanding permissions, adding systems, granting access to a new team member at the vendor — requires written authorization from the relationship owner before it is provisioned. Verbal approvals are not sufficient. "The vendor called and said they needed it" is not authorization.

The written authorization should document: what change is being made, why it is needed, who approved it, and the date. Add it to the vendor's record in the access register. This is the difference between an auditable vendor access program and one that expands informally until no one knows what any vendor actually has.

## Offboarding: Same-Day Revocation

When a vendor relationship ends, access is revoked on the same day — not when IT gets around to it, not at the end of the billing cycle, not "sometime this week." Terminated vendors with active system access are a risk that grows with every day it is left open. Former vendors have no business need for your systems; there is no operational justification for delay.

The offboarding checklist for every vendor departure:

- Deactivate all login accounts (TMS, email, cloud platforms, ELD portal, load boards, payroll systems — all of them)
- Revoke API keys and tokens
- Remove from email distribution lists and shared inboxes
- Rotate any shared passwords the vendor had access to
- Confirm data return or certified destruction per the vendor agreement
- Document the completion date in the vendor access register

## Shared Credential Rotation After Personnel Changes at Vendor

When any individual at a vendor company departs — particularly their technical or account staff assigned to your account — rotate any shared passwords or API keys that person had access to. You do not control the vendor's offboarding process. You cannot verify that the vendor has revoked their former employee's access to your credentials. Rotating your side of shared credentials is the control you do have.

This is especially important for MSPs, where a departing technician may retain credentials to dozens of client environments if client-side rotation does not occur.

## Access Logging Requirement

All vendor remote access should generate logs. Your MSP or cloud provider can produce access reports showing when vendor accounts logged in, from what IP addresses, and what actions were taken. Request these reports quarterly as part of your access review. Confirm with your cloud provider or IT team that logging is enabled for vendor accounts before an incident makes you wish it had been.

If a vendor cannot or will not support access logging, that is relevant to the access level you are comfortable granting them.

## Event-Driven Review Triggers

The following events require an immediate vendor access audit — do not wait for the next quarterly review:

- The vendor notifies you of a security breach or incident affecting their systems
- A key contact at the vendor departs without notice or under unclear circumstances
- Unexplained activity appears in your systems — logins at unusual hours, data exports you did not initiate, permission changes you did not authorize
- The vendor is acquired by another company (new ownership means new security posture — review the relationship before the transition completes)
- A CargoNet alert, CISA advisory, or industry notification describes a compromise at a vendor type you use (e.g., a known ELD provider breach, a load board credential theft campaign)

The standard is: when the risk environment for a vendor changes, your access review does not wait for the calendar.

## Post-Termination Documentation

When offboarding is complete, record the following in the vendor access register: termination date, list of systems from which access was revoked, confirmation of credential rotation, data disposition status (returned or destroyed), and the date offboarding was verified as complete. This documentation closes the record and confirms the vendor no longer has an active footprint in your systems.
