# TTX Scenario: Election Infrastructure Compromise (V1 Thin Slice)

## Metadata
- **Title**: 2024 Election Logistics Compromise
- **Category**: Incident Response / Election Security
- **Target Audience**: County Election Officials, IT Security, Legal
- **Estimated Duration**: 1 Hour (Condensed for Staging)
- **Focus Areas**: Detection, Containment, Communication

## 1. Story & Context
An adversary group has gained unauthorized access to the voter registration database of several counties. The breach occurred via a zero-day exploit in the third-party logistics provider's portal. It is 30 days before the general election.

## 2. Objectives
- **Objective 1**: Validate the IT team's ability to detect and isolate the compromised portal.
- **Objective 2**: Verify the communication chain between County IT and State Election Boards.

## 3. Script (Sections & Steps)

### Section 1: Initial Detection
**Background**: IT monitoring alerts on unusual outbound traffic from the logistics server.

#### Step 1.1: The Alert
- **Narrative**: "It is 8:45 AM on a Monday. Your SIEM triggers a high-severity alert for data exfiltration from the logistics server to an unknown IP in Eastern Europe."
- **Inject Triggers**: IT-01 (Technical Alert)
- **Facilitator Prompts**:
  - What is your first action upon seeing this alert?
  - Who needs to be notified within the first 15 minutes?

### Section 2: Escalation & Containment
**Background**: The breach is confirmed; voter data is verified as the target.

#### Step 2.1: Confirmation of Data Loss
- **Narrative**: "Forensics confirms that roughly 50,000 voter records have been copied. The media is starting to ask questions about 'system instability' reported by postal workers."
- **Inject Triggers**: MED-01 (Media Inquiry), LEG-01 (Legal Disclosure Requirement)
- **Facilitator Prompts**:
  - Do you shut down the portal immediately? What are the logistics consequences?
  - How do you handle the media inquiry?

## 4. Injects
- **IT-01**: Roles: IT Security. Content: "SIEM Alert: Outbound exfiltration detected on 10.0.4.12 via Port 443."
- **MED-01**: Roles: PR/Legal. Content: "Local news reporter calls asking why the logistics portal has been 'offline' for some users."
- **LEG-01**: Roles: Legal. Content: "State statute requires disclosure of PII breach within 48 hours. When does the clock start?"

## 5. Evaluation & AAR Plan
- **Primary Metrics**: Time to decision (containment), Accuracy of notification list.
- **AAR Focus**: Was the third-party provider contacted? Was the state board notified?
