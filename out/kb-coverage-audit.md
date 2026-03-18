# KB Coverage Audit (2026-03-16)

## Scoring Key

| Score | Meaning |
|-------|---------|
| **Yes** | Complete enough to stand alone without AI improvisation |
| **Weak** | Exists but missing freight workflows, procedures, examples, or escalation paths |
| **No** | Absent or too generic to rely upon |

Launch Risk: **High** = missing coverage can enable theft, unauthorized payments, or outage. **Medium** = increases likelihood or blast radius. **Low** = inconvenient but not dangerous at launch.

---

## Reality Check

**The KB currently has zero items.** Zero training-content articles. Zero threat briefs. Zero policies. Zero FAQ entries. Zero glossary terms. All 12 topics score "No" across all five surfaces. This is not a gap analysis — it is a build plan. Every cell in the table below is a to-do.

---

## Coverage Matrix

| # | Topic | KB/Reference | Module | Practice | Remediation | Launch Risk |
|---|-------|-------------|--------|----------|-------------|-------------|
| 1 | Phishing and email security | **No** | **No** | **No** | **No** | **High** |
| 2 | BEC and payment fraud | **No** | **No** | **No** | **No** | **High** |
| 3 | Ransomware / operational resilience | **No** | **No** | **No** | **No** | **High** |
| 4 | Passwords and credential security | **No** | **No** | **No** | **No** | **High** |
| 5 | MFA | **No** | **No** | **No** | **No** | **High** |
| 6 | Incident reporting and response | **No** | **No** | **No** | **No** | **High** |
| 7 | Invoice/payment fraud | **No** | **No** | **No** | **No** | **High** |
| 8 | Load board scams / double brokering | **No** | **No** | **No** | **No** | **High** |
| 9 | Broker/carrier impersonation | **No** | **No** | **No** | **No** | **High** |
| 10 | Document fraud / BOL/POD | **No** | **No** | **No** | **No** | **High** |
| 11 | Mobile device / BYOD security | **No** | **No** | **No** | **No** | **Medium–High** |
| 12 | Third-party/vendor risk | **No** | **No** | **No** | **No** | **Medium–High** |

---

## Per-Topic Gap Detail

### 1. Phishing and Email Security
**Research anchor:** FBI cargo theft patterns explicitly tie phishing to malware/data theft used to create fictitious pickup paperwork. FTC connects phishing to ransomware for small businesses. StopRansomware guidance calls for user awareness training on identifying/reporting suspicious activity.

**What's missing:**
- KB articles: "Phishing in freight" (dispatch-themed lures, load board alerts, delivery exception texts, HR/payroll bait), smishing/vishing guide for drivers, safe link-handling, reporting standard
- Module: Email phishing basics, SMS/messaging scams, phone social engineering, psychology of urgency in freight time pressure
- Practice: "Choose safest next action" items, manipulation technique identification, reporting behavior true/false
- Remediation: "I clicked" quick card (disconnect/report/reset), "I entered credentials" card (MFA reset, session revocation, notify IT)

---

### 2. BEC and Payment Fraud
**Research anchor:** FBI frames BEC as one of the most financially damaging online crimes. FinCEN advisory provides concrete freight-relevant scenarios: supplier impersonation to redirect invoices, executive impersonation for urgent wires.

**What's missing:**
- KB articles: "Payment change verification policy" (non-negotiable: no bank detail change via email alone, independent callback, dual approval), freight-specific BEC map (factoring changes, fuel card changes, detention/layover urgent requests), BEC indicators library (urgency, domain spoofing, lookalike emails), financial escalation tree
- Module: Finance-focused lesson with realistic freight invoices, "how attackers exploit operations urgency" lesson
- Practice: Decision-tree questions (approve/reject/verify/escalate), verification channel validity items
- Remediation: "If you already sent money" playbook (bank contact + incident escalation), evidence capture checklist

**Note:** Topics 2 and 7 (Invoice/payment fraud) share the same KB content surface — build once, tag both.

---

### 3. Ransomware / Operational Resilience
**Research anchor:** FTC describes ransomware as serious toll on operations with common vectors (phishing, exploited vulnerabilities, remote access protocols). Average freight ransomware incident: $5.08M total cost, 24-day dispatch paralysis (per compass artifact).

**What's missing:**
- KB articles: Ransomware explained in freight terms (dispatch down, WMS/TMS down, routing blind, billing halted), backup standard ("not connected to network" principle), ransomware triage ("how to recognize it, what not to do"), business continuity minimum manual ops (paper-based fallback for dispatch)
- Module: Role-based "first hour" module (drivers, dispatch, finance, leadership), "why backups fail" lesson (untested restores, shared credentials, online-only copies)
- Practice: Prioritization items (what to shut down, who to notify, restoration order), "my screen says…" recognition questions
- Remediation: Calm stepwise incident card (isolate/report/do not reconnect/document), manager card (activate continuity plan, control communications)

---

### 4. Passwords and Credential Security
**Research anchor:** NIST SP 800-63B provides behavior-relevant guidance: minimum length, blocklists, no forced periodic rotation absent compromise, support paste/password managers. StopRansomware identifies compromised credentials as primary initial access vector.

**What's missing:**
- KB articles: "Account security standard for freight apps" (email, TMS, load boards, document portals, remote access), password guidance aligned to NIST 800-63B (length, blocklists, no forced rotation, password manager support), privilege basics (separate admin/user access for ops software)
- Module: How credential theft happens in freight (stolen credentials → portal access → rerouting/payment changes)
- Practice: Prioritization questions ("which account needs MFA most urgently"), recovery method scenario items
- Remediation: Account suspected compromised card (reset, revoke sessions, review forwarding rules, notify)

**Note:** Topics 4 and 5 (MFA) share a module and KB surface — build as a unified "Account Security" module, separate into two KB topics.

---

### 5. MFA
**Research anchor:** StopRansomware explicitly recommends phishing-resistant MFA for email, VPNs, and accounts accessing critical systems. GSA's IDManagement resources cover MFA maturity path.

**What's missing:**
- KB articles: MFA deployment FAQ (what MFA is, why it matters, what to do when devices change), role-based MFA deployment guide (drivers vs dispatch vs finance vs admins), "Lost phone" recovery workflow
- Module: Role-based MFA within unified Account Security module — demonstrate how account takeovers happen without MFA
- Practice: "Which account needs MFA most urgently" prioritization, "What's the safest recovery method" scenario items
- Remediation: "Lost phone" MFA recovery one-pager, session revocation steps

---

### 6. Incident Reporting and Response
**Research anchor:** NIST SP 800-61 Rev. 3 positions incident response integration into risk management to reduce incidents and improve detection/response/recovery. FTC breach-response guidance stresses moving quickly and mobilizing response team.

**What's missing:**
- KB articles: "What counts as an incident here" (freight-specific examples: suspicious pickup change, bank change request, load board anomaly), single reporting path ("one throat to choke"), evidence preservation primer (emails with headers, portal logs, payment instructions), external reporting guide (bank, law enforcement sequencing for funds transfer fraud)
- Module: "Report fast, report well" micro-module for everyone, manager triage module (preserve evidence, avoid contaminating systems)
- Practice: "Is this reportable?" classification questions, "What details are required?" checklist items
- Remediation: Printable incident card for dispatch floor and docks, "who to call" directory template (bank, MSP, cyber insurer hotline)

---

### 7. Invoice/Payment Fraud
**Research anchor:** FinCEN BEC scenarios map directly to freight: supplier impersonation to change payment destination. IC3 PSAs describe EAC patterns. Shares root cause with BEC topic (#2).

**What's missing:** See Topic 2 — same KB articles, module, and remediation content cover this. Differentiate with freight-specific examples: factoring payment changes, driver per-diem fraud, fuel card redirection, settlement disputes weaponized.

---

### 8. Load Board Scams / Double Brokering
**Research anchor:** FBI warns to exercise increased caution when using online load boards and to confirm driver/equipment identifiers at pickup. FMCSA frames double brokering as misuse of another carrier's USDOT number or acting as unregistered broker.

**What's missing:**
- KB articles: Load board fraud patterns (fake carrier profiles, USDOT hijacking, double brokering mechanics), carrier/broker identity verification steps (what to verify, where: FMCSA lookup, independent contact confirmation), "Red flags library" at tender stage (pressure tactics, too-low rates, unusual contact channels)
- Module: Scenario-driven dispatch lesson ("You receive a load board match — here's the verification sequence"), "Two-person rule" for high-value tender decisions
- Practice: "Spot the red flag" items using realistic load board scenarios, verification step selection
- Remediation: Dispatch freeze checklist (what to hold, who to call) when fraud suspected

**Note:** Topics 8, 9, and 10 all live under the "Freight Identity, Verification, and Fraud Controls" KB umbrella — build the overarching framework first, then sub-articles per topic.

---

### 9. Broker/Carrier Impersonation
**Research anchor:** FMCSA fraud guidance: identity theft via USDOT number misuse. NICB describes VoIP spoofing, synthetic IDs, and phishing as enabling technologies in cargo theft. FBI warns on fictitious pickups using stolen identity data.

**What's missing:**
- KB articles: Carrier identity verification at pickup (driver + equipment + tractor + trailer + seal matching), "Fraud Kill Chain" article tracing tender → vet → pickup → in-transit → delivery → settlement with verification checkpoints, exception-handling rules for late-stage changes (destination, carrier swap, reconsignment)
- Module: Dock release controls micro-lesson, dispatcher identity confirmation lesson
- Practice: "Correct verification step" selection, "Identify the highest-risk change" items
- Remediation: "Dock refusal script" template, "call-back verification script" template

---

### 10. Document Fraud / BOL/POD
**Research anchor:** CargoNet warns complex cargo theft schemes involving document fraud and identity theft are increasingly prevalent. NMFTA operational guidance emphasizes verifying driver identity, tractor/trailer identifiers, and seal numbers; treats late-stage changes as high-risk. FBI connects hacked logistics data to fictitious-pickup paperwork.

**What's missing:**
- KB articles: Document integrity primer (what a BOL controls, how it's abused, what triggers approval for changes), BOL/POD/rate confirmation secure handling rules, freight document integrity: approved sharing channels, record retention and disposal basics (driver PII, customer docs)
- Module: "Documents are power" module (how small edits enable big fraud), dock worker / dispatch edition with realistic scenarios
- Practice: "Which document is most sensitive?" classification, "What is the safest sharing method?" scenario items
- Remediation: "I sent the wrong document" checklist (revoke access, notify, document, mitigate)

---

### 11. Mobile Device / BYOD Security
**Research anchor:** NIST SP 800-124 Rev. 2 emphasizes mobile devices as permanent enterprise fixtures accessing networks and processing sensitive data. Cargo theft intelligence highlights driver mobile devices as an exposure point.

**What's missing:**
- KB articles: Mobile security basics (lock screen, OS updates, app permissions, unknown profiles/APKs), BYOD policy starter (what's allowed, what's forbidden), public Wi-Fi / hotspot safety for drivers, lost/stolen phone response checklist
- Module: 10–15 min driver-first module ("Your phone is a key to the freight"), supervisor enforcement module
- Practice: "Safe/unsafe" quick checks for common driver situations (QR codes at docks, texts from "dispatcher," app login prompts), lost-phone scenario questions
- Remediation: "Device lost" one-pager (immediate steps, who to call, what accounts to secure first), "Suspicious text/call" one-pager with example scripts

---

### 12. Third-Party/Vendor Risk
**Research anchor:** NIST SP 800-161 Rev. 1 frames C-SCRM as addressing risks from suppliers/products/services that may be malicious, counterfeit, or vulnerable. Freight operations are interconnected (MSPs, TMS vendors, telematics, EDI/API partners).

**What's missing:**
- KB articles: Vendor access inventory template (who has access to what, especially "deep access" admins), vendor onboarding minimums (MFA, incident notification, access revocation), partner data-sharing rules (least data, secure transfer, retention)
- Module: Leadership/procurement module ("the vendor's breach is your outage"), ops manager module (request access safely, document it)
- Practice: "Which vendor clause would have prevented this?" scenario items, "Who should have access?" least-privilege reasoning
- Remediation: "Vendor incident intake" template, access freeze checklist when vendor compromise suspected

---

## Existing Source Material

The following reference material exists and can be used for initial KB ingestion:

| File | Type | Usable for |
|------|------|-----------|
| `reference/TTX_examples/2020_11_Table_Top_Exercise_Phishing.pdf` | TTX example | Phishing module scenarios, practice question source |
| `reference/TTX_examples/2021_04_Table_Top_Exercise_Policy_Breach.pdf` | TTX example | Incident response, document security scenarios |
| `reference/TTX_examples/2021_06_Table_Top_Exercise_Asset_Management.pdf` | TTX example | Systems hygiene, endpoint security |
| `reference/TTX_examples/2021_07_Table_Top_Exercise_Asset_Management.pdf` | TTX example | Systems hygiene, endpoint security |
| `reference/TTX_examples/2021_09_Table_Top_Exercise_Staffing_Readiness.pptx` | TTX example | Continuity planning, incident response |
| `reference/TTX_examples/2021_11_Table_Top_Exercise_Utility_Outage.pptx` | TTX example | Operational resilience, continuity |
| `reference/TTX_examples/Incident_Response_Guide.pdf` | IR guide | Incident reporting, evidence preservation |
| `reference/TTX_examples/Cybersecurity-Tabletop-Exercise-Tips_508c.pdf` | TTX guidance | TTX scenario design structure |
| `reference/TTX_examples/CybersecurityTabletop_508C.pdf` | TTX guidance | TTX scenario design structure |
| `reference/TTX_examples/Six-tabletop-exercises-FINAL.pdf` | TTX exercises | Multiple topic scenarios |
| `reference/TTX_examples/FiveEyes_TTX Examples.docx` | TTX examples | Proprietary scenario drafts |
| `reference/deep-research-report.md` | Research | Primary KB authoring source (10 topics with complete specs) |
| `reference/compass_artifact_*.md` | Research | 22-topic launch matrix, priority tiers, NIST CSF mapping |

These files are ingestion candidates, not finished KB items. Each requires rewriting for the platform's content model (training-content, threat-brief, policy, faq, glossary-term) and tagging with appropriate topics.

---

## Summary

**12 of 12 topics: all surfaces, all scores — No.**

The platform is fully built. The KB is empty. Before AWS, before marketing, before any learner is enrolled: the content must exist. A well-built LMS with no lessons is not a product.

*Last updated: 2026-03-16*
