---
title: "My MSP Said Everything Is Patched — Verification Questions to Ask"
type: remediation-card
topics:
  - Secure Systems Hygiene
---

# Remediation Card: My MSP Said Everything Is Patched — Verification Questions to Ask

## Use this card at your next MSP call or meeting.

Your MSP saying "everything is patched" is a starting point, not an answer. These six questions produce verifiable answers — not verbal reassurances. A good MSP will answer them directly and be able to show documentation. If they cannot, you have identified a gap.

---

**1. Can you show me a patch status report for all managed endpoints, right now?**

What you are looking for: a report showing each managed device, the last patch date, and any outstanding critical or high-severity updates. If the MSP cannot pull this report during the call, they do not have central patch visibility — that is a gap.

---

**2. What is your patch scope — does "monthly patching" include third-party applications like Chrome, Adobe Reader, and VPN clients, or only Windows Update?**

What you are looking for: explicit confirmation that the patch process covers third-party software, not just Windows OS updates. If the answer is "mostly Windows," ask which specific third-party applications are included and which are not.

---

**3. When was the last time you patched our remote access software (VPN client, RDP gateway), and what version are we running?**

What you are looking for: a specific date within the past 30 days and a version number you can cross-reference against the vendor's current release. Remote access software is a priority patch target — it should never be running a version with known, unpatched vulnerabilities.

---

**4. What is your process when Microsoft or a major vendor releases an emergency out-of-cycle patch for a critical vulnerability?**

What you are looking for: a documented process that does not wait for the next scheduled monthly window. CISA requires critical vulnerabilities to be patched within 14 days. If the answer is "we'll get it in the next monthly cycle," that process does not meet the standard for critical patches.

---

**5. Do you have a way to confirm our ELD firmware versions and whether vendor-issued firmware updates have been applied?**

What you are looking for: either confirmation that the MSP has visibility into ELD firmware status, or a clear acknowledgment that ELD firmware is the responsibility of the ELD vendor and fleet manager — and that your company has a process for receiving and applying vendor firmware updates. NMFTA research has identified real CVEs in ELD systems (CVE-2024-12054). This is not theoretical.

---

**6. Can you show me the last 30 days of patch activity in a format I can keep for my records?**

What you are looking for: an exported report, not a verbal summary. You need documentation for cyber insurance purposes, and you need to be able to verify the same information at the next quarterly review. A good MSP will provide this without hesitation.

---

## If the answers are incomplete or unavailable

Document what was and was not confirmed. Set a deadline — "please send me the patch status report and last-30-days activity log by [date]." Include this in any MSP contract renewal discussion. An MSP that cannot produce basic documentation is an MSP that does not have the visibility to manage your security.
