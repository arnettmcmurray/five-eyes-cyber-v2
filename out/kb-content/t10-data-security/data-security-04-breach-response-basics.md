---
title: "What to Do If Freight Business Data Is Exposed: A Breach Response Primer"
type: policy
topics:
  - Data and Document Security
source_trust: T0
freshness_cycle: 12mo
---

# What to Do If Freight Business Data Is Exposed: A Breach Response Primer

A data breach in a freight company is not always a headline event. It is often quieter: a shared Google Drive folder discovered to be publicly accessible for six months; an email sent to the wrong carrier with driver SSNs attached; a TMS system accessed by a former employee's credentials that were never deactivated. The legal and notification obligations triggered by these events are the same regardless of how they occurred.

This policy defines what events trigger breach response procedures, establishes the response sequence, and identifies the notification obligations that apply under U.S. law.

## Triggering Events

Any of the following events should be treated as a potential data breach and should initiate this response process:

- Unauthorized access to driver qualification files containing SSNs, CDL numbers, dates of birth, or medical records
- Exposed or improperly shared rate confirmations or BOLs containing customer PII or commodity detail
- Compromised email account containing customer, vendor, or driver data — including email that was monitored without active exfiltration
- TMS data exfiltration or unauthorized export of shipment, customer, or carrier records
- Ransomware that encrypted systems with access to driver files, customer records, or financial data — even if no data was confirmed exfiltrated
- A shared cloud folder discovered to have been set to "anyone with the link" for any period while it contained personal data

When in doubt, treat the event as a potential breach and begin the response process. It is operationally easier to stand down from breach response than to discover you delayed required notification.

## Response Sequence

**Step 1: Contain**

Isolate the affected system, account, or access point immediately. This may mean disconnecting a device from the network, revoking a compromised user account, removing incorrect sharing permissions from a cloud folder, or blocking an unauthorized user's access. Do not delete logs, emails, or access records — preserve them. Containment stops the exposure from expanding; it does not erase evidence of what happened.

**Step 2: Document**

While containment is underway, begin a written record. Document: what happened and when it was discovered, which systems or files were involved, what categories of data may have been exposed, who had access to the affected system or file, and what actions you have taken so far. Preserve all logs, access records, emails, and any other evidence of the event. Do not modify, delete, or reorganize anything in the affected system until IT and legal counsel have assessed it.

**Step 3: Notify IT or your Managed Service Provider**

Within hours of discovery, your IT contact or MSP must be notified. They will assess the technical scope of the exposure — what data was actually accessible, whether it was accessed or copied, and whether the exposure is fully contained. Do not wait for a complete internal investigation before contacting IT. Their assessment is part of determining your notification obligations.

**Step 4: Notify your cyber insurance carrier**

Most cyber insurance policies require timely notification of potential breach events as a condition of coverage. Delay in notifying your insurer can affect your right to coverage. Many insurers provide breach response services as part of the policy — including access to breach response legal counsel, forensic investigators, and notification services. Contact your insurer's claims line, not just your insurance agent.

**Step 5: Assess notification obligations**

If personal data was exposed — name combined with SSN, CDL, DOB, medical records, or financial account numbers — most U.S. states require you to notify affected individuals. This is a legal obligation, not a voluntary disclosure.

Key benchmarks:
- Most states: written notification within 30 to 60 days of discovery
- New York (SHIELD Act) and California (CCPA): notification as expediently as possible; no safe harbor for delay
- Some states: notify the state Attorney General simultaneously with or before individual notifications
- HIPAA-covered entities or their business associates: 60-day notification window for breaches of protected health information
- If any affected individual is in a state with a 72-hour notification requirement, that state's window governs for those individuals

Do not assess notification obligations without legal counsel. State breach notification laws vary in their definitions of "personal information," their notification window calculations, and their AG reporting requirements.

**Step 6: Notify affected individuals**

Affected drivers, employees, or customers whose personal data was exposed must receive written notification. The notification must describe: what information was involved, when the breach occurred (if known), what you are doing to address it, and what steps affected individuals can take to protect themselves (credit monitoring enrollment is commonly offered for SSN exposure).

Notifications for driver SSN exposure should include information about placing a fraud alert with the credit bureaus (Equifax, Experian, TransUnion) and monitoring for fraudulent employment or credit applications.

**Step 7: File a law enforcement report**

For breaches involving financial data, identity theft risk, or significant operational harm, file a report with the FBI Internet Crime Complaint Center (ic3.gov). For breaches affecting large numbers of individuals, notify your state Attorney General per the applicable state breach notification law. Some states require AG notification for breaches above a threshold number of affected residents.

**Step 8: Post-incident review**

After containment and initial notifications, conduct a written post-incident review documenting: the timeline of the event and its discovery, the scope of data involved, the notification actions taken with dates, and what control failures contributed to the breach. Identify specific changes to access controls, sharing settings, or handling practices that will prevent recurrence. This review is evidence of reasonable response and required by most cyber insurance policies as part of the claims process.

## The Core Legal Standard

The FTC Act requires "reasonable security measures" for personal data. What constitutes reasonable security is assessed based on the sensitivity of the data, the size and sophistication of the organization, and the available controls. Storing driver SSNs in an unprotected shared folder and failing to implement access controls is not reasonable security for any size freight company. The post-incident review exists partly to demonstrate that reasonable security was in place, or to document what you are putting in place in response.

When in doubt, act quickly, preserve everything, and engage legal counsel before the notification window closes.
