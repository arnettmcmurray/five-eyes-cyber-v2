# Public Email Security Assessment Source
**Source type:** internal content source for landing-page questionnaire and educational recommendations  
**Derived from:** `GMAIL or MICROSOFT Email Security HOW TO.docx`

## Purpose
This file is the cleaned working source for the **public Email Security Assessment**. It is not a fake scanner and should not be presented as one. It supports a questionnaire-based lead funnel that:

- appears on the **landing page only**
- helps visitors self-identify likely gaps in email security
- captures contact and company details through registration
- routes users into a **free-tier** marketing/education flow
- supports later admin search by company, contact, and saved progress snippets

## Product framing
The assessment should be framed honestly as:

> A guided email security readiness questionnaire that gives practical recommendations based on the visitor's current setup.

It should **not** claim to directly inspect the visitor's DNS, mailbox, or tenant unless that capability actually exists.

## Core topics to cover
The source material centers on these subjects:

1. **SPF**
   - Defines which mail servers can send on behalf of a domain.
   - Common examples:
     - Google Workspace: `v=spf1 include:_spf.google.com ~all`
     - Microsoft 365: `v=spf1 include:spf.protection.outlook.com ~all`
   - Mixed-provider environments may require multiple includes.
   - SPF has a **10 DNS lookup limit**, so bloated records become a real risk.

2. **DKIM**
   - Adds a cryptographic signature to help prove the message was authorized and not altered in transit.
   - Google Workspace typically uses a TXT record beginning with something like `google._domainkey`.
   - Microsoft 365 commonly uses DKIM-related CNAME records for selectors such as `selector1` and `selector2`.

3. **DMARC**
   - Tells receiving mail systems what to do when SPF or DKIM checks fail.
   - Provides reporting visibility.
   - Common starter example:
     - `v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com`
   - Recommended maturity path:
     - start with `p=none`
     - move toward `p=quarantine`
     - eventually move toward `p=reject`

4. **Verification and monitoring**
   - DNS propagation must complete before records can be trusted.
   - Verification should include:
     - DNS lookups / record inspection
     - sending test emails
     - reviewing message headers
     - monitoring DMARC reports

5. **Operational maturity**
   - Organizations should know:
     - who manages DNS
     - which provider handles mail
     - whether reports are monitored
     - whether there is an inventory of authorized mail sources

6. **Advanced protections**
   - MTA-STS
   - TLS-RPT
   - BIMI (after DMARC enforcement is mature)

## Platform-specific guidance

### Google Workspace
**SPF example**
```txt
v=spf1 include:_spf.google.com ~all
```

**DKIM setup path**
- Admin console
- Apps → Google Workspace → Gmail → Authenticate email
- Generate new record
- Prefer 2048-bit key length
- Publish the provided TXT record
- Start authentication after DNS is live

**DMARC starter example**
```txt
v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com
```

### Microsoft 365
**SPF example**
```txt
v=spf1 include:spf.protection.outlook.com ~all
```

**DKIM setup path**
- Microsoft 365 Defender portal
- Email & collaboration → Policies & rules → Threat policies → Email authentication settings
- Select domain
- Enable signing for the domain
- Publish the two required DKIM-related CNAME records if prompted

**DMARC starter example**
```txt
v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com; pct=100
```

## Recommended assessment structure
The public assessment should stay short enough to finish, but serious enough to feel useful. A good target is **10–14 questions** plus registration.

### Section 1 — Environment
Use questions like:
1. Which platform do you use for business email?
   - Google Workspace
   - Microsoft 365
   - Other / mixed setup
   - Not sure

2. Who manages your domain DNS?
   - Internal IT
   - MSP / contractor
   - Marketing / web vendor
   - No one clearly owns it
   - Not sure

3. Do you know whether your organization sends email from more than one service?
   - Yes
   - No
   - Not sure

### Section 2 — Authentication basics
4. Do you know whether SPF is set up for your domain?
   - Yes
   - No
   - Not sure

5. Do you know whether DKIM signing is enabled?
   - Yes
   - No
   - Not sure

6. Do you know whether DMARC is configured?
   - Yes
   - No
   - Not sure

7. If DMARC exists, what policy is currently in place?
   - None / not configured
   - `p=none`
   - `p=quarantine`
   - `p=reject`
   - Not sure

### Section 3 — Visibility and testing
8. Does anyone review DMARC reports or authentication failures?
   - Yes, regularly
   - Occasionally
   - No
   - Not sure

9. Have you recently tested whether external email sent from your domain passes SPF, DKIM, and DMARC?
   - Yes
   - No
   - Not sure

10. Do you know how to inspect email headers or use a validation tool to confirm mail authentication?
   - Yes
   - No
   - Not sure

### Section 4 — Risk and maturity
11. Do you maintain a list of all approved systems allowed to send email as your domain?
   - Yes
   - No
   - Not sure

12. Has your organization ever had issues with spoofing, phishing impersonation, or delivery failures?
   - Yes
   - No
   - Not sure

13. Are advanced protections such as MTA-STS or TLS reporting in place?
   - Yes
   - No
   - Not sure

14. Would you like a guided recommendation for the next safest step?
   - Yes
   - No

## Simple scoring guidance
Keep scoring honest and understandable. Do not pretend this is a technical audit.

### Lower readiness signals
Count these as risk-increasing answers:
- "No" or "Not sure" on SPF, DKIM, DMARC
- no clear DNS ownership
- no DMARC report review
- no recent validation/testing
- no approved sender inventory
- history of spoofing/delivery issues without known controls

### Higher readiness signals
Count these as maturity-increasing answers:
- clear platform ownership
- SPF, DKIM, and DMARC are known to be configured
- DMARC policy is beyond `p=none`
- reports are reviewed
- sender inventory exists
- testing/validation is part of normal operations

### Suggested result bands
- **Needs attention** — major uncertainty or missing controls
- **Developing** — some controls exist, but visibility or enforcement is weak
- **Stronger foundation** — core controls appear in place, but may still need verification and enforcement hardening

## Recommendation logic
Map answers to practical next steps.

### Example recommendation blocks
**If SPF is missing or unknown**
- Confirm which providers send mail on behalf of the domain.
- Publish or review a valid SPF record.
- Remove unused or duplicate sender entries.
- Watch the SPF lookup count.

**If DKIM is missing or unknown**
- Enable DKIM in the primary mail platform.
- Publish the required DNS records exactly as provided by the vendor.
- Verify selector names and propagation before assuming signing works.

**If DMARC is missing**
- Start with a monitoring policy:
```txt
v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com
```
- Review reports before tightening enforcement.

**If DMARC is only at `p=none`**
- Review legitimate mail sources.
- Fix alignment/authentication failures.
- Progress carefully toward `p=quarantine`, then `p=reject`.

**If testing and monitoring are weak**
- Validate DNS records after changes
- send test messages externally
- inspect message headers
- review DMARC reports on a recurring basis

## DMARC progression guidance
Use this as educational guidance, not a hard promise.

- **Weeks 1–2:** `p=none`
- **Weeks 3–4:** `p=quarantine; pct=10`
- **Week 5 and beyond:** gradually increase enforcement, working toward `p=reject` when legitimate sources are clean and aligned

## Common issues to surface in recommendations
- SPF record includes too many lookups
- DKIM selectors do not match exactly
- DNS changes have not propagated yet
- DMARC exists but no one reads the reports
- multiple sending services exist but only one is represented in SPF
- teams assume mail authentication is configured but cannot verify it

## Copy guidance for the landing-page funnel
Use plain language. Avoid theatrical security jargon.

Good framing:
- "Find out whether your email security basics appear to be in place."
- "Answer a few quick questions to get a practical readiness snapshot."
- "Get clear next steps for SPF, DKIM, DMARC, and email delivery protection."

Avoid:
- "We scanned your environment"
- "Live threat detection complete"
- "Military-grade AI audit"
- anything implying automatic technical verification if it is only a questionnaire

## Registration data to capture after assessment
Registration should exist before OTP login and should not store user passwords.

Capture only what is useful for follow-up and admin search, such as:
- full name
- work email
- company name
- role/title
- company size or team size
- selected email platform
- assessment result band
- key answer summary / progress snippet
- consent to be contacted, if required by product/legal policy

## Notes for implementation
- This feature belongs to the **landing page funnel**, not as a detached side feature.
- The assessment should lead naturally into **Register**.
- After registration, the visitor becomes a **free-tier user**.
- Free-tier users may view only the next level of product/package information.
- Paid product areas remain gated by tier.
- Later user authentication is OTP-only for non-admin users.
- Admin should be able to search leads/users by company, contact info, and saved progress snippets.

## Raw source reference
The original source doc covered:
- SPF, DKIM, and DMARC basics
- Google Workspace setup
- Microsoft 365 setup
- verification/testing
- DMARC policy progression
- common issues
- advanced protections such as MTA-STS, TLS-RPT, and BIMI

This markdown is the cleaned product-ready source for rebuilding the public assessment properly.
