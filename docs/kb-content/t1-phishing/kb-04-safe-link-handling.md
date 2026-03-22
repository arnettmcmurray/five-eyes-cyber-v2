---
title: Safe Link Handling: Hover, Verify, and Approved Channels
type: training-content
topics: Phishing and Email Security
source_trust: internal
---

# Safe Link Handling: Hover, Verify, and Approved Channels

Links are the mechanism that turns a phishing email into a real compromise. Clicking the wrong link takes you to a page that steals your credentials, downloads malware, or both. This article gives you a repeatable process for handling every link you receive — whether by email, text, or messaging app.

## The Three-Second Rule

Before clicking any link in a business communication, spend three seconds on these checks:

1. **Where is it going?** Hover your cursor over the link (or press and hold on mobile) to preview the destination URL.
2. **Does the domain match the sender?** If the email claims to be from your TMS vendor and the link goes to a domain you do not recognize, do not click.
3. **Is this communication expected?** If you did not initiate a request and you did not expect this email, treat the link with extra skepticism.

## How to Read a URL

The most important part of a URL is the **domain** — the part just before the first single forward slash, reading from the right of the top-level domain (`.com`, `.gov`, `.net`).

**Example:** `https://login.customer-portal.com/dat/verify`

Reading from right: `.com` → `customer-portal.com` is the domain. The `login` and `dat` pieces are subdomains. This URL is controlled by whoever owns `customer-portal.com`, not DAT.

**Legitimate:** `https://auth.dat.com/login` — the domain is `dat.com`. ✓

**Lookalike:** `https://dat.auth-secure.com/login` — the domain is `auth-secure.com`. ✗

**The rule:** Find the domain (the part just before `.com` / `.gov` / `.net` / etc.) and confirm it is the real company's domain before clicking.

## Approved Channels for Freight Business

If you receive an unexpected link asking you to take a business action, the safest response is to bypass the link entirely and use an approved channel:

| What the link claims to do | Approved alternative |
|---------------------------|---------------------|
| Log in to your TMS | Open the TMS app or type the URL directly |
| View a load board alert | Log in directly at the load board's known URL |
| FMCSA compliance notice | Go to `fmcsa.dot.gov` directly; call FMCSA at their official number |
| Invoice or payment update | Log in to your accounting portal directly; call the vendor on a known number |
| Track a shipment | Use the carrier's official tracking page — not a link in an email |
| Reset your password | Go to the service's login page and use "Forgot password" |

The pattern is the same every time: **bypass the link, go direct.**

## URL Shorteners Are a Red Flag

Shortened URLs (`bit.ly/abc123`, `tinyurl.com/xyz`) hide the destination. In freight business communications, there is no legitimate reason for a vendor, load board, or partner to send you a shortened URL. Treat shortened URLs in email or text as a red flag and do not click.

## What About QR Codes?

QR codes at truck stops, on trailers, at docks, and in emails are increasingly used in scams. A QR code is just a visual link — you cannot hover over it to preview the destination. Rules:

- Only scan QR codes from physical sources you trust (your company's printed materials, official carrier documents).
- Do not scan QR codes embedded in unsolicited emails.
- After scanning, check the URL your phone shows before opening it.
- If the URL looks unfamiliar, close it.

## If You Are Not Sure

The most defensive action is to **not click** and instead:

1. Call the sender on a number you already have (not a number in the email).
2. Go to the company's website by typing the URL directly.
3. Ask your supervisor or IT contact before proceeding.

The worst outcome from not clicking a legitimate link is a small delay. The worst outcome from clicking a malicious link is a compromised account, a stolen load, or a ransomware infection that takes your company offline.

The delay is worth it.
