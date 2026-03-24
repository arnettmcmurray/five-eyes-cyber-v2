# KB Second Tranche Content Build Plan
**Date:** 2026-03-16

## Source intelligence applied

These research files were read and used to shape this plan — not referenced decoratively:
- `reference/deep-research-report.md` — source registry for freight/logistics KB (source tiers, ingest rules, pipeline strategy)
- `reference/compass_artifact_wf-52276199-e87f-49e0-8126-9824bd5dd233_text_markdown.md` — content intelligence framework (coverage standards, freshness model, psychometric thresholds, scoring system)

---

## T5 — Ransomware & Operational Resilience

### Why this is urgent (from research files)

- ENISA 2025: ransomware = **83.9%** of cybercrime targeting EU transport sector
- ORBCOMM attack (September 2023): ransomware disabled ELD systems across major carriers for **3 weeks**; ELD-dependent carriers lost operational visibility entirely
- Transportation = **5th most-attacked industry** per IBM X-Force 2025
- NMFTA researchers discovered **CVE-2024-12054** in ELD systems — freight-specific attack surface
- CISA #StopRansomware advisories contain TTPs and IOCs → must go through human curation before learner publication (per deep-research-report.md pipeline rules)
- Freshness window for ransomware content: **6 months** max before staleness; ELD/telematics threat content: **90 days** (freight-specific 1.5x multiplier applies)

### Topic group
- Ransomware & Operational Resilience

### KB items planned (8 articles)

| Slug | Title | Type | Topics assigned |
|------|-------|------|-----------------|
| t5-ransomware-in-freight | Ransomware in Freight: What You're Actually Facing | threat-brief | Ransomware & Operational Resilience |
| t5-operational-impact | How Ransomware Stops Operations: Dispatch, ELD, TMS, Load Boards | training-content | Ransomware & Operational Resilience |
| t5-prevention-controls | Ransomware Prevention Controls: What Actually Works | training-content | Ransomware & Operational Resilience |
| t5-backup-recovery-standard | Backup and Recovery Standard | policy | Ransomware & Operational Resilience |
| t5-early-warning-signs | Recognizing Ransomware Before It Locks Everything | training-content | Ransomware & Operational Resilience |
| t5-eld-telematics-threat | ELD and Fleet Telematics: The Ransomware Attack Surface | threat-brief | Ransomware & Operational Resilience |
| t5-response-playbook | Ransomware Response Playbook | policy | Ransomware & Operational Resilience |
| t5-ransom-payment-policy | Should We Pay? Policy, FinCEN Obligations, and Process | faq | Ransomware & Operational Resilience |

**Article breakdown:** 3 training-content (study), 2 threat-brief (reference), 2 policy (reference), 1 faq (reference)

### Module planned

| Slug | Title | estimatedMinutes | Study items | Reference items |
|------|-------|-----------------|-------------|-----------------|
| t5-ransomware-operational-resilience | Ransomware and Operational Resilience | 30 | 3 | 5 |

### Practice questions planned
- **30 questions** — scenario-based MCQ
- Bloom's target: mix of apply (situation recognition) and analyze (response decision)
- Scenarios include: "ELD just went offline and drivers can't update HOS — what's the first call?", "You find an encrypted file on the TMS server — what do you NOT do?", "A vendor says they need $50K in Bitcoin to decrypt carrier records — what's the correct first step?"
- Sources for question grounding: ORBCOMM attack timeline, CISA ransomware response guidance, FinCEN ransomware SAR obligations
- Target 15–20 per topic (compass framework standard); 30 achievable across 8 items

### Remediation planned
- `remediation-01-ransomware-discovered.md` — I found ransomware: isolate, preserve, report (first 60 minutes)
- `remediation-02-eld-offline-operations.md` — ELD/TMS knocked offline: operational continuity without digital dispatch

### Trusted source notes

| Source | Trust tier | Use | Ingest rule |
|--------|-----------|-----|-------------|
| CISA #StopRansomware advisories | T0 | Threat framing, defensive posture | Curate only — contains TTPs/IOCs, never direct learner publish |
| FBI/IC3 annual report (2024 data) | T0 | Loss quantification, frequency trends | Ingest after editorial review; good for practice scenario grounding |
| FinCEN ransomware typologies | T0 | Payment policy obligations | Safe for learner content after review |
| ENISA Threat Landscape 2025 | T1 | 83.9% transport ransomware statistic | Annual ingest; learner-safe after synthesis |
| ORBCOMM attack (Sept 2023) | Event record | ELD case study | Public incident; safe to cite; verify against NMFTA/news corroboration |
| NMFTA CVE-2024-12054 | T1 (original discovery) | ELD attack surface detail | Reference only for training context; do not publish exploit detail |

---

## T6 — Incident Reporting & Response

### Why this matters now (from research files)

- **NIST SP 800-61r2 was withdrawn and superseded by SP 800-61r3 in 2025** — any IR content citing r2 is now citing a withdrawn document (deep-research-report.md flags this explicitly as the kind of change a KB must catch)
- **TSA Security Directive 1580-21-01** for freight railroad cybersecurity: currently version C, effective October 2024, annual renewal — time-sensitive for covered carriers
- **TSA NPRM November 2024**: proposes extending cyber risk management requirements to ~300 surface transportation operators — rulemaking in progress; content must note proposed vs. final
- **CIRCIA**: ongoing rulemaking is explicitly flagged as "active and time-sensitive" in the research — reporting thresholds still being defined; content must not overstate certainty
- **SEC Item 1.05 Form 8-K**: material cyber incidents must be disclosed within 4 business days — relevant for publicly traded logistics companies
- **NYDFS 23 NYCRR 500**: requires annual cybersecurity training explicitly covering social engineering; reporting obligations for NY-licensed financial services entities operating in freight payments
- Freshness: regulatory/compliance content = **12 months or event-driven**; must have explicit review triggers for TSA directive renewal (annual) and CIRCIA final rule publication

### Topic group
- Incident Reporting & Response

### KB items planned (8 articles)

| Slug | Title | Type | Topics assigned |
|------|-------|------|-----------------|
| t6-what-counts-as-incident | What Counts as a Cyber Incident: Definitions and Thresholds | training-content | Incident Reporting & Response |
| t6-internal-escalation | Internal Escalation Chain: Who to Call and When | policy | Incident Reporting & Response |
| t6-reporting-obligations | Reporting to Regulators: TSA, CIRCIA, SEC, NYDFS | training-content | Incident Reporting & Response |
| t6-law-enforcement-reporting | Reporting to Law Enforcement: FBI/IC3, FMCSA, Why It Matters | policy | Incident Reporting & Response |
| t6-evidence-preservation | Evidence Preservation: What Not to Touch and Why | training-content | Incident Reporting & Response |
| t6-freight-specific-ir | Freight-Specific Incident Response: Impersonation, BEC Wire Fraud, Cargo Theft | training-content | Incident Reporting & Response |
| t6-tsa-directive | TSA Directive 1580-21-01 Version C: What Railroad and Surface Carriers Must Do | threat-brief | Incident Reporting & Response |
| t6-incident-communications | Incident Communications: What to Say and Not Say | faq | Incident Reporting & Response |

**Article breakdown:** 4 training-content (study), 2 policy (reference), 1 threat-brief (reference), 1 faq (reference)

### Module planned

| Slug | Title | estimatedMinutes | Study items | Reference items |
|------|-------|-----------------|-------------|-----------------|
| t6-incident-reporting-response | Incident Reporting and Response | 25 | 4 | 4 |

### Practice questions planned
- **30 questions** — scenario-based MCQ
- Scenarios include: "A driver's ELD sends a GPS ping from a city you didn't dispatch to — is this a reportable incident?", "You discover a payment wire was redirected 6 hours ago — what's the order of your next 4 actions?", "Regulator calls asking about an incident — what do you say before looping in legal?"
- Sources: NIST SP 800-61r3 (2025), CISA incident response guidance, FBI/IC3 reporting pathway, TSA directive text

### Remediation planned
- `remediation-01-incident-first-hour.md` — First 60 minutes after discovering an incident: the 6-step sequence
- `remediation-02-do-i-need-to-report.md` — Decision card: which incidents trigger which reporting obligations

### Trusted source notes

| Source | Trust tier | Use | Notes |
|--------|-----------|-----|-------|
| NIST SP 800-61r3 (2025) | T0 | IR lifecycle, definitions | Supersedes r2 (withdrawn); must cite r3, not r2 |
| TSA Security Directive 1580-21-01 v.C | T0 | Railroad/surface transport obligations | Annual renewal cycle; flag review trigger for October annually |
| CIRCIA (CISA) | T0 | Reporting thresholds | Rulemaking in progress — note proposed vs. final; do not overstate requirements |
| FBI/IC3 | T0 | Law enforcement reporting pathways | Reporting even when no recovery expected — builds sector intelligence |
| FMCSA | T0 | Freight fraud incident response | Directly recommends steps for carrier/broker identity theft victims |
| SEC Item 1.05 Form 8-K | T0 | Material incident disclosure | 4-day deadline; relevant to publicly traded entities only |
| NYDFS 23 NYCRR 500 | T0 | NY-regulated entity obligations | Social engineering training requirement; training and reporting linked |

---

## T7 — Mobile Device / BYOD Security

### Why this is distinct (from research files)

- **Freight is uniquely exposed on mobile**: drivers use personal phones for load board access, dispatch communication, BOL photo apps, and HOS recording — often outside any MDM or access policy
- **NMFTA CVE-2024-12054** (original discovery): vulnerability in ELD systems demonstrates that fleet telematics are a real attack surface with documented freight-sector CVEs
- **ORBCOMM attack**: ELD systems are networked, remotely accessible, and when compromised take entire carrier operations offline
- **BEC via WhatsApp and SMS**: compass framework cites CargoNet Q1 2025 data showing BEC-enabled cargo theft shifted to account compromise — mobile channel increasingly used for social engineering of freight workers
- Freshness: mobile/BYOD policy = 6–12 months; ELD/telematics threat content = **90 days** (freight-specific volatility)
- Coverage multiplier: mobile freight content (ELD security, load board app safety) requires **4–5 content units** per compass framework's 1.5x freight multiplier — general BYOD guidance alone is insufficient

### Topic group
- Mobile Device and BYOD Security

### KB items planned (7 articles)

| Slug | Title | Type | Topics assigned |
|------|-------|------|-----------------|
| t7-byod-risk-in-freight | Why Freight Is More Exposed on Mobile | threat-brief | Mobile Device and BYOD Security |
| t7-mobile-security-baseline | Mobile Device Security Baseline | policy | Mobile Device and BYOD Security |
| t7-safe-app-usage | Safe App Usage for Freight Workers | training-content | Mobile Device and BYOD Security |
| t7-eld-telematics-security | ELD and Telematics Security: What Drivers Can Do | training-content | Mobile Device and BYOD Security |
| t7-smishing-mobile-phishing | Smishing and Mobile-Specific Phishing in Freight | training-content | Mobile Device and BYOD Security |
| t7-lost-stolen-device | Lost or Stolen Device: Steps and Timeline | policy | Mobile Device and BYOD Security |
| t7-mobile-mfa-authentication | Mobile MFA and Authentication: What Works and What Doesn't | faq | Mobile Device and BYOD Security |

**Article breakdown:** 3 training-content (study), 2 policy (reference), 1 threat-brief (reference), 1 faq (reference)

### Module planned

| Slug | Title | estimatedMinutes | Study items | Reference items |
|------|-------|-----------------|-------------|-----------------|
| t7-mobile-byod-security | Mobile Device and BYOD Security | 20 | 3 | 4 |

### Practice questions planned
- **28 questions** — scenario-based MCQ
- Scenarios include: "A driver gets a WhatsApp message from 'dispatch' asking them to update their load board credentials — what should they do?", "The ELD app is asking for a software update from an unknown URL — what's the risk?", "You left your phone in a truck stop. It has the company TMS app with saved credentials. What's the first call?"
- Sources: NMFTA CVE-2024-12054 context, CISA mobile security guidance, CIS Controls v8 mobile safeguards, ORBCOMM attack case study (ELD angle)

### Remediation planned
- `remediation-01-lost-device-freight.md` — Lost or stolen device: 5-step immediate response for freight operations context
- `remediation-02-suspicious-mobile-contact.md` — Got a suspicious text or WhatsApp from 'dispatch' or 'shipper' — verification steps

### Trusted source notes

| Source | Trust tier | Use | Notes |
|--------|-----------|-----|-------|
| NMFTA CVE-2024-12054 | T1 (original researcher) | ELD attack surface | Do not publish exploit detail; use for defensive framing only |
| NIST SP 800-124r2 | T0 | Mobile device security guidance | Base policy content; stable (annual check sufficient) |
| CIS Controls v8/8.1 | T1 | Mobile safeguards mapping | Prioritized, directly usable for policy baseline |
| CISA KEV (mobile/telematics entries) | T0 | Active exploitation signals | Scheduled ingest + review; never raw-publish to learners |
| CargoNet Q1 2025 data | T1/T2 | BEC via mobile shift | Quarterly freshness cycle; update when Q2 2025 report publishes |
| ORBCOMM attack record | Event record | ELD real-world impact | Cross-reference NMFTA and news sources before citing specific claims |

---

## Second Tranche Totals

| Group | Articles | Module | Practice Qs | Remediation cards |
|-------|----------|--------|-------------|-------------------|
| T5: Ransomware & Operational Resilience | 8 | 1 | 30 | 2 |
| T6: Incident Reporting & Response | 8 | 1 | 30 | 2 |
| T7: Mobile Device / BYOD Security | 7 | 1 | 28 | 2 |
| **Total** | **23** | **3** | **88** | **6** |

---

## Missing pieces (honest gaps)

**Regulatory content:**
- CIRCIA final rule not published. Content must be written with "proposed" framing and cannot state specific thresholds. Review trigger: when CISA publishes final CIRCIA rule (expected 2025–2026).
- TSA NPRM (November 2024, ~300 surface transport operators) is proposed, not final. Content must state this explicitly.
- No FMCSA mandate exists for private carrier cybersecurity training. Do not imply compliance requirement where none exists.

**Source access gaps:**
- TIA fraud framework: redistribution prohibited per subscriber agreement. Cannot be ingested directly. Convert insights into original text citing public sources.
- Surface Transportation ISAC and Maritime ISAC: member-only content. Cannot ingest directly. Monitor and synthesize from public reporting only.
- CISA #StopRansomware advisories: contain TTPs/IOCs. Must route through human curation queue, never direct learner publish. This means T5 ransomware content cannot cite specific IOCs even if they are technically public.

**Content stack dependencies:**
- Mobile/BYOD policy content (t7-mobile-security-baseline) will need customer-specific MDM tool guidance to be operationally useful. The generic policy works; specific MDM setup steps require knowing whether target operators use Jamf, Intune, etc. Flag as a gap for enterprise deployments.
- ELD content (t5 and t7 both touch ELD) will overlap. Cross-link rather than duplicate; t5 covers ELD as ransomware target; t7 covers ELD as mobile security topic (driver behavior, anomaly recognition, app hygiene).

**Assessment quality targets (from compass framework):**
- Compass framework standard: **15–20 questions per topic area** for learner-safe modules. Our 30-question-per-module approach distributes across 7–8 items (avg 3–4 per item). This meets the per-topic floor only if each item maps to a clear topic thread.
- No item analysis data exists yet (no learners have taken Second Tranche practice). First 90 days post-launch should establish p-value and discrimination baselines; items with p < 0.25 AND discrimination < 0.15 indicate content gaps, not just hard questions.

**Freshness review triggers to set at ingest:**
| Topic group | Review cycle | Specific triggers |
|-------------|-------------|-------------------|
| T5: Ransomware | 6 months | New CISA #StopRansomware advisory; major logistics sector incident |
| T5: ELD/telematics | 90 days | New NMFTA research; new CVE in ELD/fleet telematics category |
| T6: Incident Reporting | 12 months + event | TSA directive renewal (October annually); CIRCIA final rule publication |
| T7: Mobile/BYOD | 6–12 months | CargoNet quarterly report (BEC-via-mobile tactics); NMFTA annual report (January) |

---

## Output directory
`out/kb-content/t5-ransomware/`
`out/kb-content/t6-incident-response/`
`out/kb-content/t7-mobile-byod/`

All article files follow the same frontmatter format used in First Tranche:
```yaml
---
title: ...
type: training-content | threat-brief | policy | faq
topics:
  - Ransomware & Operational Resilience
source_trust: T0 | T1 | T2
freshness_cycle: 90d | 6mo | 12mo
---
```
