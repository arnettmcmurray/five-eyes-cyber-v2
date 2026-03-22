---
title: "Who Should Have Access to What: Document Access Controls in Small Freight Operations"
type: training-content
topics:
  - Data and Document Security
source_trust: T1
freshness_cycle: 12mo
---

# Who Should Have Access to What: Document Access Controls in Small Freight Operations

In most small freight companies, access to business documents grows organically over time. A new dispatcher is added to the shared drive. A driver file folder gets shared with a billing staff member who needed one document once. An IT contractor is given full access during an implementation and never removed. Within a year, every employee has access to nearly everything — including driver SSNs, customer rate data, and carrier payment information — not because anyone made that decision deliberately, but because access was never restricted to begin with.

This is not an edge case. It is the default state of document management in small freight operations. And it is a meaningful security problem: every person with access to a document is an exposure point if their credentials are compromised, their device is stolen, or they make an error.

The fix is not complex technology. It is applying a consistent principle and a documented structure.

## The Principle of Least Privilege

Access to documents should be limited to the people who need it to do their job — and no one else. A dispatcher needs access to active BOLs and PODs. They do not need access to driver drug test results. A billing staff member needs access to settled shipment records. They do not need access to carrier payment routing numbers. The HR manager needs access to driver qualification files. Finance handles carrier banking information.

This is the principle of least privilege: give each person the minimum access required for their role, and no more.

## Access Map for Freight Operations

**Driver qualification files** (SSN, CDL, drug test results, DOB, medical records):
Access limited to HR manager and DOT compliance officer. No other staff, including operations managers and dispatchers, have routine access. Temporary access for a specific need — such as retrieving a CDL copy for an audit — requires a documented request and access revocation after the need is met.

**Customer rate data and pricing**:
Access limited to dispatch, brokerage operations, and management. Customer pricing is business-sensitive data that enables competitor intelligence and carrier impersonation if exposed. Billing staff have access to invoice records but not to rate negotiation history or customer-specific margin data.

**Carrier payment and banking information** (ACH routing, wire details, factoring account data):
Access limited to finance only. Dispatch staff do not need to see carrier banking details to book or manage loads. Keeping payment data out of operations reduces the attack surface for BEC payment fraud.

**BOLs and PODs (active shipments)**:
Dispatch operations staff need access to active load documents. After settlement, closed shipment records transition to restricted access for billing and finance only. Operations staff do not require ongoing access to closed load documents.

**TMS administrative controls and user management**:
IT/MSP and management only. Dispatch staff have data-entry access for load management, not admin-level access to configure integrations, add users, or modify system settings. Admin credential compromise is significantly more damaging than a standard user credential compromise — minimizing the number of admin accounts minimizes that risk.

## Cloud Storage Hygiene

OneDrive, Google Drive, and Dropbox default to sharing settings that are broader than most users intend. Specific actions to take now:

1. **Review top-level folder sharing settings** in your cloud storage. Any folder containing driver files, customer rate data, or carrier banking information should be set to "Specific people" with a named list — not "Anyone in the organization" and never "Anyone with the link."

2. **Remove links that should not exist.** In Google Drive, open each sensitive folder and check "Share" — look for any "Anyone with the link" access that was set up and forgotten. Remove it.

3. **Audit who is on the access list.** Check that the named users in each restricted folder are still with the company and still in the role that requires that access.

## SharePoint and Microsoft Teams

SharePoint site and Teams channel permissions default to broad organizational access unless deliberately restricted. Specific configuration required:

- Driver files should be in a SharePoint site or Teams channel restricted to HR and compliance staff only — not in a general "company documents" Teams channel
- Customer rate data should be restricted to dispatch and management; not in a shared Teams channel accessible to all staff
- Do not use "All Company" Teams channels for any document containing driver PII or carrier payment data

## Quarterly Access Review

Access control is not a one-time setup. People leave, roles change, and contractors complete their engagements. A quarterly access review should verify:

- Employees who have left the company no longer have access to any company document system
- Contractors and temporary workers have had access removed at the conclusion of their engagement
- Current employees have access appropriate to their current role — not their previous role
- No shared credentials or team accounts exist for sensitive document folders

A quarterly review takes under an hour in a 10-person company. It does not require a security tool. A spreadsheet with access owner, system, access level, and last review date is sufficient.

## The Practical Minimum

For a five-person freight company, the minimum viable access control structure is:

1. A Google Drive or SharePoint folder structure with clearly named, role-based folders — "Driver Files (HR Only)," "Customer Rates (Dispatch + Mgmt)," "Carrier Payments (Finance Only)"
2. Each sensitive folder configured for specific named users, not organization-wide or link-based access
3. A written list of who has access to what, reviewed twice per year
4. A process for removing access within 24 hours of an employee or contractor departure

This is not enterprise security infrastructure. It is basic document hygiene, and it eliminates the most common source of PII exposure in small freight operations: documents left broadly accessible long after the original need has passed.
