---
title: "Smishing and Mobile-Specific Phishing in Freight"
type: training-content
topics:
  - Mobile Device and BYOD Security
source_trust: T1
freshness_cycle: 6mo
---

# Smishing and Mobile-Specific Phishing in Freight

Email phishing gets the most attention in security training. But drivers, dispatchers, and owner-operators are increasingly targeted through the channels they use most on the job: text messages, WhatsApp, and QR codes. The techniques are the same as email phishing — urgency, impersonation, a link you're supposed to click — delivered on the device that's in your hand every minute of the workday.

## Smishing: What Freight Workers Actually Receive

Smishing is SMS phishing. The message arrives as a text. In freight, the lures are built around freight concerns:

**Fake DOT compliance texts.** "Your ELD records show an HOS violation. You have 24 hours to review your logs before an audit is initiated. Tap here." A driver who knows they've been running close to limits is exactly the right target for this message. The link goes to a credential-harvesting page that looks like the FMCSA portal or their ELD provider's login screen.

**Fake load offers.** "Urgent: $4,200 load from Chicago to Atlanta, available now. Confirm availability here." The link either installs malware or redirects to a fake broker portal that captures DAT or Truckstop login credentials.

**Fake carrier verification requests.** "Before we can release this load, please verify your MC number and current insurance certificate here." Owner-operators receive these from "shippers" they've never worked with. The page collects their MC number, insurance info, and sometimes banking details.

In each case, the text arrives from an unknown number with just enough operational detail to seem plausible. The urgency is engineered. The link is the attack.

## WhatsApp Freight Fraud

WhatsApp is a legitimate dispatch communication tool for many small carriers and owner-operators — and that legitimacy is what attackers exploit. Fraudsters contact drivers and dispatchers on WhatsApp posing as:

- Dispatchers at their own company ("I'm covering for Marcus today — we need you to re-verify your load board login before the next assignment")
- Shippers or brokers offering loads directly ("We have a consistent lane available and want to book you. Send your carrier packet here.")
- Factoring companies or fuel card providers requesting account re-verification

WhatsApp display names are set by the account holder and can say anything. A contact showing up as "Cargill Freight Dispatch" is not authenticated — the phone number is the only identifier, and attackers use numbers that are one digit off from real contacts, or freshly created numbers with convincing display names.

Red flags on WhatsApp:
- You've never interacted with this contact before
- They're asking you to click a link, submit credentials, or change payment information
- The request has urgency attached ("the load releases in 90 minutes")
- The number does not match any contact already in your phone

## QR Code Attacks

QR codes at truck stops, printed on BOLs from unfamiliar shippers, or sent via text do not show their destination until you scan them. A QR code posted on a bulletin board near the driver's lounge could point to a credential-harvesting page or a malicious app download. When your phone's camera shows the preview URL before opening, read it. If the domain looks unfamiliar or unrelated to the stated purpose of the QR code, back out.

Do not scan QR codes that arrive via unsolicited text messages. The only reason to send a QR code via text is to obscure the URL.

## How to Recognize It

Across smishing, WhatsApp fraud, and QR attacks, the common signals are:

- **Urgency:** "Act in the next 2 hours," "before the audit," "the load releases at 3 PM"
- **Unknown sender:** a number you don't have saved, a WhatsApp contact you've never interacted with
- **Request for credentials or sensitive info:** login credentials, MC number, insurance info, banking details, SSN
- **A link or QR code attached to the request:** the payload always requires you to go somewhere or input something
- **Offer that's notably better than market rate:** $8/mile loads from an unknown contact are not real loads

## What to Do

Do not tap links in unsolicited freight-related texts. If you receive a text about an ELD issue or HOS violation, call your dispatcher directly on a number you already have — not a number provided in the text. If a WhatsApp contact is offering a load or requesting credentials, verify through the load board where that load was originally posted. If you received a "shipper" contact on WhatsApp, call the shipper's published phone number directly.

If you tapped a link and entered credentials: change the password for that account immediately, without waiting for IT to instruct you. Then report it to your dispatcher or supervisor so the account can be monitored for unauthorized activity. Speed matters — attackers move fast once credentials are captured.
