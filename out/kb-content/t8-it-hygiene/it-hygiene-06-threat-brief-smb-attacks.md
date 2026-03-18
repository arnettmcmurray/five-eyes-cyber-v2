---
title: "How SMB Freight Companies Get Compromised: RDP, Phishing, and Vendor Trust Abuse"
type: threat-brief
topics:
  - Secure Systems Hygiene
source_trust: T1
freshness_cycle: 6mo
---

# How SMB Freight Companies Get Compromised: RDP, Phishing, and Vendor Trust Abuse

## The Threat Picture

ENISA's 2025 transport sector threat assessment found ransomware accounts for 83.9% of cybercrime against EU transport organizations. IBM X-Force's 2025 threat intelligence report ranks transportation as the fifth most attacked industry globally. These numbers are not driven by sophisticated nation-state actors targeting large multinationals — a significant portion of freight sector incidents involve small and mid-size carriers, brokerages, and logistics companies.

The attacks that hit SMB freight companies are not novel. They follow repeatable patterns. Understanding those patterns is the first step toward closing them.

## Attack Chain 1: Exposed RDP + Credential Spray → Ransomware

**How it works:** Attackers run automated scanners across the public internet looking for systems with TCP port 3389 open — the default port for Windows Remote Desktop Protocol. This scanning is continuous and global. When an open RDP system is found, the attacker runs a credential spray attack: trying thousands of username and password combinations from breached credential lists purchased on criminal markets.

Many freight SMBs use RDP because it is built into Windows and lets owners or MSPs remotely manage systems without additional software. When RDP is exposed directly to the internet and the account password is weak, common, or appears in a prior breach, access is typically gained within minutes to hours.

Once inside, the attacker explores the network, escalates privileges, disables backup software and security tools, then deploys ransomware — often at a time chosen to maximize disruption (Friday afternoon, the start of a holiday weekend).

**What makes this fast:** No phishing required. No human interaction needed. The entire initial access phase is automated. The attacker may not even review the access themselves — automated tools flag successful logins for manual follow-up.

**The close:** Blocking RDP from the public internet and requiring VPN + MFA eliminates this attack path entirely.

---

## Attack Chain 2: Phishing + Admin Credential Theft → Lateral Movement

**How it works:** A freight company employee — dispatcher, owner, finance manager — receives a convincingly crafted phishing email. Common freight lures include fake FMCSA compliance notices, fake load board credential resets, fake carrier setup requests, and fake invoices from spoofed vendor addresses. The employee, under time pressure, clicks the link and enters their credentials into a fake login page.

If the account that was phished has admin rights — or if the attacker can use the compromised account to access email and find saved passwords or password reset links — the attacker begins lateral movement. They access the TMS, the accounting software, the email server. They search email for banking details, payment instructions, customer data, and access credentials to other systems.

From this position, the attacker has two options: exfiltrate customer data and move to extortion, launch a Business Email Compromise attack using the trusted email account to redirect payments, or deploy ransomware to encrypt everything and demand payment.

**What makes this dangerous:** A single compromised account belonging to someone with broad system access can expose the entire business. Freight operators who use one account for everything — email, TMS, admin functions — are giving attackers maximum leverage from a single credential capture.

**The close:** Admin account separation ensures that a phished dispatcher account cannot reach admin functions. MFA means a captured password alone does not grant access. EDR can detect lateral movement before ransomware deploys.

---

## Attack Chain 3: Compromised MSP or Vendor Access → Data Exfil or Ransomware

**How it works:** Freight SMBs rely heavily on MSPs, TMS vendors, ELD providers, and other technology partners. These vendors often have remote access to client systems — sometimes broad, always-on access without per-session authentication. CISA has documented multiple incidents in which ransomware was delivered to SMB clients through a compromised MSP's management tools.

The attacker does not target the freight company directly. They target the MSP, which may have weaker security controls despite having access to dozens or hundreds of client environments. Once the MSP's management platform is compromised, the attacker can deploy ransomware or exfiltrate data across all MSP clients simultaneously.

This attack vector is particularly concerning because freight companies often trust their MSP's access without auditing it — the MSP relationship is inherently based on trust. Permanent, unmonitored vendor access with no MFA requirement is the vulnerability.

**The close:** Require individual, MFA-protected accounts for all vendor and MSP access. Require time-limited access for specific engagements. Request session logs from your MSP. Confirm that your MSP's own security practices meet the same standards you apply internally.

---

## What These Attacks Have in Common

Three attack chains, one underlying pattern: poor patch hygiene, exposed or uncontrolled remote access, shared or non-MFA credentials, and no visibility or logging to detect the intrusion before damage is done.

None of these require advanced capabilities. The tools and techniques used in the vast majority of SMB freight incidents are commodity — available for purchase or free download on criminal forums, requiring minimal technical skill to operate.

## Why SMB Freight Is Targeted

SMB freight companies are attractive targets for several specific reasons:

- **Cargo and payment data.** Load schedules, pickup locations, carrier banking details, and factoring payment flows represent actionable intelligence for cargo theft and payment fraud — separate from the ransomware threat.
- **Limited IT resources.** A 20-truck carrier may have no dedicated IT staff. The owner manages everything. Attackers know that security monitoring, patching, and incident response are likely weak.
- **Trust-based MSP relationships.** Freight operators trust their MSPs without auditing them — a pattern attackers have learned to exploit.
- **Legacy systems.** Older TMS platforms, ELD systems running outdated firmware, and Windows versions no longer receiving security updates are common in the freight SMB space.

## The Defender's Takeaway

The controls that close the majority of these attack paths are not complex or expensive:

- Patch operating systems and applications within 30 days
- Put VPN + MFA in front of all remote access — no direct RDP
- Deploy EDR on all endpoints
- Separate admin accounts from daily-use accounts
- Require MFA on all admin accounts
- Review and limit vendor remote access

No single control is sufficient. Together, they close the entry paths that account for the overwhelming majority of documented freight SMB incidents. Complexity is not required — consistency is.
