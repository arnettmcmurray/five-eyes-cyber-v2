---
title: Email Red Flags: Header Spoofing, Lookalike Domains, and Urgency Patterns
type: training-content
topics: Phishing and Email Security
source_trust: internal
---

# Email Red Flags: Header Spoofing, Lookalike Domains, and Urgency Patterns

Not every phishing email is obvious. The most dangerous ones are the ones that look almost exactly right. This article teaches you the specific signals to check before clicking any link or responding to any request — especially in a freight environment where fast decisions are the norm.

## Check 1: The Sender's Actual Email Address

The display name — what you see before the email address — can say anything. "DAT Freight & Analytics" or "FMCSA Compliance Team" are not controlled labels. What matters is the actual email address in angle brackets.

**How to check:** Click on or hover over the sender name to reveal the full email address.

**What you're looking for:**
- Does the domain match the company's actual domain? `@dat.com` for DAT, `@fmcsa.dot.gov` for FMCSA.
- Is the domain a lookalike? `@dat-freight.com`, `@dat.support`, `@fmcsa-compliance.com` are not official.
- Is it a free email provider (Gmail, Yahoo, Outlook.com) claiming to be from a major vendor or agency? That is never legitimate for business communications.

## Check 2: Lookalike Domains

Attackers register domains that look like real ones at a glance. Common tricks:

| Legitimate | Lookalike |
|-----------|-----------|
| `dat.com` | `dat-support.com`, `dat.co`, `daтcom.com` (Cyrillic 'т') |
| `fmcsa.dot.gov` | `fmcsa-dot.gov`, `fmcsa.compliance.com` |
| `quickbooks.com` | `quickbooksinvoice.com`, `quickbooks-billing.net` |
| `[your TMS vendor]` | `[vendor]-support.com`, `[vendor]-login.net` |

Always read the full domain carefully. If you are even slightly unsure, do not click. Go to the site directly by typing the known URL.

## Check 3: Urgency and Pressure Language

Urgency is the most reliable indicator of phishing. Real business processes have review times. Phishing emails demand immediate action to prevent "account suspension," "load cancellation," "authority revocation," or "payment delays."

**High-risk phrases to pause on:**
- "Immediate action required"
- "Your account will be suspended in 24 hours"
- "Respond before your load is cancelled"
- "Verify now to avoid penalties"
- "This is your final notice"
- "Wire must be sent today"

**The rule:** If the urgency is the main message, the email deserves more scrutiny, not less.

## Check 4: Mismatched Links

Hover over any link in an email — without clicking — to see where it actually goes. The displayed link text can say `www.dat.com/login` while the actual destination is `dat-login-portal.com/secure`.

**How to check without clicking:** On desktop, hover over the link and look at the URL shown in the bottom left of your browser or email client. On mobile, press and hold the link to preview the destination URL.

**Red flags in the URL:**
- The domain doesn't match the expected company.
- There are extra words in the domain (`login.dat.customer-portal.com` — `dat` is a subdomain, not the main domain; the main domain here is `customer-portal.com`).
- The URL uses a URL shortener (`bit.ly`, `tinyurl.com`) hiding the destination.
- The URL has a long string of random characters before a recognizable-looking domain.

## Check 5: Unexpected Attachments

Phishing attacks often deliver malware through attachments. Be suspicious of:
- Unexpected invoices, payment confirmations, or "rate sheets" from unknown senders.
- `.zip`, `.exe`, `.js`, `.docm` (macro-enabled Word), or `.xlsm` (macro-enabled Excel) files.
- PDFs that ask you to "enable editing" or "enable content" — legitimate PDFs do not require this.

**The rule:** If you did not request it and you did not expect it, verify before opening. Call the sender on a known number — not a number provided in the email itself.

## Check 6: Generic Greetings and Inconsistent Branding

Targeted phishing is getting better, but many attacks still use generic greetings ("Dear Customer," "Dear User," "Valued Partner") rather than your name. Legitimate vendors who have your business relationship know your name.

Similarly, look for low-quality logos, inconsistent fonts, or layout that looks slightly off compared to emails you've received from the same vendor before.

## Quick Reference Card

Before clicking any link or opening any attachment from an unexpected email, run these five checks:

1. **Sender address** — does it match the real domain exactly?
2. **Link destination** — hover before you click.
3. **Urgency** — is this pressure realistic?
4. **Attachment** — did you request this?
5. **When in doubt** — go to the site directly or call the sender on a known number.

These checks take about 30 seconds. That 30 seconds is the difference between a near-miss and a breach.
