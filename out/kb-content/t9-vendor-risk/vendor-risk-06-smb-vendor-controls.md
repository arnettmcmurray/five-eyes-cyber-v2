---
title: "Vendor Access Controls for Small Freight Operations: A Practical Policy"
type: policy
topics:
  - Third-Party and Vendor Risk
source_trust: T0
freshness_cycle: 12mo
---

# Vendor Access Controls for Small Freight Operations: A Practical Policy

This policy applies to freight operations of five to fifty employees. It does not require enterprise tools, dedicated security staff, or vendor risk management software. It requires a spreadsheet, discipline, and 30 minutes per quarter. The underlying principle — drawn from NIST SP 800-161 Rev.1 adapted for SMB environments — is: know what access you have granted, keep it minimal, and pull it back when it is no longer needed. Everything in this policy serves that principle.

## The Vendor Access Register

Maintain a single, current list of every vendor with access to your business systems. This is your vendor access register. A shared spreadsheet in your document management system or a tab in your operations workbook is sufficient. The register must include the following columns at minimum:

- **Vendor Name** — the company name, not just the contact person's name
- **System Access** — which specific system(s) they can access (TMS, email admin, ELD portal, payroll, accounting, fuel card platform, load board account, etc.)
- **Access Level** — read-only, read/write, or admin/full access
- **Named Contact at Vendor** — the specific individual at the vendor company who holds or manages the access
- **Access Granted Date** — when access was first provisioned
- **Next Review Date** — set 90 days from the last review; do not leave this blank
- **Offboarding Status** — for vendors whose relationships have ended; document completion date

The register must be updated every time a new vendor is granted access or an existing vendor's access changes. Keeping it current is not optional. A register that is six months out of date is not a control — it is a false sense of security.

## MFA Requirement

All vendor remote access to your systems must use multi-factor authentication. This requirement is not negotiable and must be included in every vendor agreement. An MSP or IT consultant accessing your systems without MFA creates a risk that a single stolen password opens a door into your entire environment. If a vendor cannot or will not support MFA, that vendor is not appropriate for remote access to your systems.

Confirm with each vendor that MFA is enabled for the accounts and credentials they use to access your environment. Do not assume it is in place. Ask, and document the answer.

## Time-Limited Access for Project-Based Vendors

When a vendor is given access for a defined project or one-time engagement, set an expiration date at the time of provisioning. Do not leave "temporary" access open indefinitely on the assumption that someone will close it when the project ends. Projects end without clear offboarding; temporary accounts become permanent ones by inattention.

At the time of provisioning, define: what access is being granted, why, and when it expires. Put the expiration date in the vendor access register. If the project extends, renew with written authorization — do not just leave the access running.

## Access Notification

Vendors who remotely access your systems should notify you when they do. For your MSP, this means access reports should be available and requested quarterly — a log showing who accessed your systems, from which accounts, and when. Ask your MSP to provide this report as part of your quarterly review. If your cloud platform or TMS supports audit logging for vendor accounts, confirm that logging is enabled.

You do not need to monitor access in real time. You do need to be able to look back and answer the question: "What did this vendor account do in our systems over the past 90 days?" If you cannot answer that question, logging is not in place and that gap should be closed.

## Incident Notification Clause

Every vendor agreement must include a contractual requirement for the vendor to notify you within 24 hours of any security incident or breach that may affect your data or systems. This clause belongs in the initial agreement, not as an amendment after an incident occurs.

When a vendor is breached, the notification timeline is the difference between days of exposure you know about and weeks of exposure you do not. Your cyber insurer will also ask about vendor notification timelines in the event of a claim. Having the clause in your agreement is the baseline.

## The Quarterly Review Ritual

Block 30 minutes on the calendar every quarter. In that time:

1. Pull the vendor access register.
2. For each vendor, confirm with the relationship owner that the vendor relationship is still active and the access level is still appropriate.
3. Identify any vendors whose access has not been reviewed in over 90 days and schedule a review.
4. Remove or flag vendors whose relationships have ended but whose offboarding is not documented as complete.
5. Update the "Next Review Date" column for each vendor you have reviewed.

That is the entire ritual. It does not require an audit firm or security consultants. It requires a responsible owner and a calendar event. If the quarterly review consistently does not happen, it means no one owns it — and that is the issue to fix first.

## Policy Ownership

The owner of this policy is the person responsible for IT or operations management. For a five-person brokerage, that may be the owner or general manager. For a fifty-person carrier, it may be the operations director or a designated IT lead. The responsibility does not disappear because the company is small — it scales to what is practical for the company's size. What is practical for every size of freight operation is: a current vendor access register, MFA on vendor access, and a quarterly review.
