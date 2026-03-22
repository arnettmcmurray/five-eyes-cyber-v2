---
title: "You Found RDP Open to the Internet — Do This Now"
type: remediation-card
topics:
  - Secure Systems Hygiene
---

# Remediation Card: You Found RDP Open to the Internet — Do This Now

## Immediate Response Steps

Do these steps in order. Do not wait for your next scheduled IT call.

---

**1. Call your MSP or IT contact right now.**

Tell them: "A port scan shows TCP port 3389 open to the internet. I need you to block this at the firewall today." If they cannot act immediately, get a written commitment with a specific time — not "we'll look at it." An open RDP port is an active attack surface being scanned continuously.

---

**2. While waiting for the block, check whether the exposed system has a strong, unique password and MFA.**

If the account accessible via RDP is using a simple or reused password, change it immediately from a separate, unaffected device. Use a long, unique password — at least 16 characters. Enable MFA on the account if your system supports it. This is not a fix for the open port, but it raises the cost of a brute-force attack while the firewall rule is being applied.

---

**3. Ask your MSP to check whether the port has been scanned or accessed by unauthorized parties.**

Request a review of Windows Event Log for RDP login activity (Event IDs 4624, 4625, 4648). Look for failed login attempts from unusual IP addresses — these indicate active brute-force attempts. If successful logins from unknown sources appear, treat this as a potential compromise.

---

**4. If there is any indication of unauthorized access, treat it as an active incident.**

Do not wait. Disconnect the affected system from the network. Do not shut it down — powered-off devices cannot be investigated. Call your MSP and, if you have cyber insurance, call your insurer's breach response line. Follow your incident response procedure.

---

## Short-Term Hardening Steps

Once the immediate RDP port is blocked, take these steps to close the underlying risk permanently.

---

**5. Confirm RDP is blocked at the firewall, not just disabled at the system level.**

A firewall rule blocking port 3389 inbound from the internet is the correct fix. Disabling RDP on the individual computer is not sufficient if the firewall does not block the port — another machine on the same network may be exposed. Ask your MSP to confirm the firewall rule in writing.

---

**6. If remote access is needed, set it up correctly: VPN first, then RDP.**

Users and MSP technicians who need remote desktop access should connect to the VPN first, authenticate (with MFA), then use RDP over the VPN tunnel. RDP should never be reachable from the public internet — only from inside the VPN. Your MSP can configure this. WireGuard and OpenVPN are both free and work well for small freight operations.

---

**7. Conduct a scan of all your public-facing IP addresses to confirm no other ports are unexpectedly open.**

Use Shodan.io (free basic search), your ISP's firewall management portal, or ask your MSP to run a scan. Confirm that only the ports your business intentionally exposes (typically HTTPS on port 443 for any web-facing services) are open. Any unexpected open port is a question to investigate.

---

**8. Document what was found, what was done, and when.**

Write down: when you discovered the open port, what it was connected to, what steps you took, and when the firewall rule was confirmed as applied. This documentation matters for cyber insurance claims and demonstrates that you responded appropriately when a risk was identified.

---

## Bottom Line

An open RDP port is not a minor misconfiguration — it is a door that attackers are actively knocking on, around the clock. Getting it closed is an hours-level priority, not a weeks-level one.
