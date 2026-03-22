# Source Registry Plan
**Date:** 2026-03-17
**Purpose:** Approved source categories, domains, trust levels, and ingest modes for the Five Eyes freight cybersecurity KB.

Based on: `reference/deep-research-report.md` (source acquisition and ingestion plan)

---

## Trust Tier Definitions

| Tier | Label | Description | Examples |
|------|-------|-------------|---------|
| T0 | Authoritative | Primary regulators, standards bodies, official government sources, canonical data repositories | NIST, CISA, FBI/IC3, FMCSA, FinCEN, TSA, FTC, Federal Register, NVD, CVE Program |
| T1 | High-Trust | Sector nonprofits, ISACs, well-governed industry bodies, transportation-specific research orgs with original research | NMFTA, CIS, MITRE ATT&CK, CargoNet/Verisk, ENISA, CERT/CC, Surface Transportation ISAC |
| T2 | Useful Commercial | Vendors, insurers, commercial threat intel with good methodology but inherent bias | IBM X-Force, Verizon DBIR, TT Club/BSI, Overhaul, Mandiant M-Trends, CrowdStrike, Microsoft MSRC |
| T3 | Watch Only | News, social, secondary commentary — never a sole authority | Trade press, vendor blogs, social media, forums |

---

## Platform Trust Field Mapping

The platform's `sourceTrust` field accepts: `internal` | `external-curated` | `raw-upload`

| Research Tier | Platform Value | When to Use |
|---------------|---------------|-------------|
| T0 | `external-curated` | Authoritative gov/standards sources — reviewed before publish |
| T1 | `external-curated` | High-trust industry sources — reviewed before publish |
| T2 | `external-curated` | Commercial intel — reviewed with methodology check |
| T3 | Not ingested | Watch-only; never direct to KB |
| Platform admin content | `internal` | Content authored directly by platform team |
| Raw uploads from users | `raw-upload` | Submissions requiring full review before any publish |

---

## Source Registry

### Category 1: Foundational Frameworks (slow-changing)

| Source | Domain | Trust | Ingest Mode | Cadence | Learner-Safe | Review Required |
|--------|--------|-------|-------------|---------|--------------|-----------------|
| NIST Cybersecurity Framework 2.0 | nist.gov | T0 | Manual per revision | Annual check | Yes (distilled) | Yes (editorial) |
| CISA Cross-Sector CPGs 2.0 | cisa.gov | T0 | Manual per update | Quarterly check | Yes (checklist) | Yes |
| CIS Controls v8/8.1 | cisecurity.org | T1 | Manual per version | Annual check | Yes (mapped safeguards) | Yes |
| NIST SP 800-82 Rev.3 (OT Security) | nvlpubs.nist.gov | T0 | Manual per revision | Annual check | Yes (concept-level) | Yes |
| NIST SP 800-161 Rev.1 (C-SCRM) | nvlpubs.nist.gov | T0 | Manual per revision | Annual check | Yes (concept-level) | Yes |
| NIST SP 800-50 Rev.1 (Training) | nvlpubs.nist.gov | T0 | Manual per revision | Annual check | Yes | Yes |
| NIST SP 800-122 (PII) | nvlpubs.nist.gov | T0 | Manual per revision | Annual check | Yes | Yes |
| NIST SP 800-61 Rev.3 (IR) | nvlpubs.nist.gov | T0 | Manual per revision | Annual check | Yes | Yes |

### Category 2: Transportation-Sector Regulatory (mixed cadence)

| Source | Domain | Trust | Ingest Mode | Cadence | Learner-Safe | Review Required |
|--------|--------|-------|-------------|---------|--------------|-----------------|
| FMCSA fraud and identity theft alerts | fmcsa.dot.gov | T0 | Scheduled + review | Weekly monitor | Yes (operational) | Yes |
| TSA Security Directives (SD 1580-21-01) | tsa.gov | T0 | Monitor + ingest on renewal | Annual (October renewal) | Yes | Yes |
| CIRCIA rulemaking updates | federalregister.gov | T0 | Monitor only (rule not final) | Monthly | Yes (stated as proposed) | Yes |
| SEC Item 1.05 Form 8-K | sec.gov | T0 | Monitor | Quarterly | Yes | Yes |
| NYDFS 23 NYCRR 500 | dfs.ny.gov | T0 | Manual per amendment | Event-driven | Yes | Yes |
| USCG Maritime Cyber (NVIC 01-20) | uscg.mil | T0 | Manual + annual review | Annual | Yes | Yes |
| U.S. DOT cybersecurity resources | transportation.gov | T0 | Monitor | Quarterly | Yes (as pointers) | Yes |
| IMO maritime cyber risk guidance | imo.org | T0 | Manual + annual | Annual | Yes | Yes |

### Category 3: Fraud, Cargo Crime, and Exploitation Signals (fast-changing tactics)

| Source | Domain | Trust | Ingest Mode | Cadence | Learner-Safe | Review Required |
|--------|--------|-------|-------------|---------|--------------|-----------------|
| FBI/IC3 annual report | ic3.gov | T0 | Manual (annual) | Annual + monthly monitor | Yes (awareness) | Yes |
| FinCEN advisories (ransomware/BEC) | fincen.gov | T0 | Monitor + reviewer queue | Monthly + event-driven | Yes (red flags) | Yes |
| NMFTA cargo crime + cyber | nmfta.org | T1 | Scheduled + review | Monthly monitor | Yes (after curation) | Yes |
| CargoNet quarterly reports | cargonet.com | T2 | Manual (quarterly) | Quarterly | Yes (trends) | Yes |
| TT Club/BSI Annual Cargo Theft | ttclub.com | T2 | Manual (annual) | Annual | Yes (synthesized) | Yes |
| Overhaul cargo theft reporting | over-haul.com | T2 | Selective ingest | Quarterly | Yes (after synthesis) | Yes |
| TIA fraud framework | tianet.org | T1 | Reference-only (no redistribution) | Quarterly reference | No (rights risk) | Yes — rights check required |
| TAPA standards and alerts | tapaonline.org | T1–T2 | Monitor; ingest only with rights | Monthly | No (raw member intel) | Yes |

### Category 4: Threat Intelligence and Incident Trends (periodic)

| Source | Domain | Trust | Ingest Mode | Cadence | Learner-Safe | Review Required |
|--------|--------|-------|-------------|---------|--------------|-----------------|
| CISA #StopRansomware advisories | cisa.gov | T0 | Monitor + staging (never direct-to-learner) | Event-driven | No (raw IOCs/TTPs) | Yes — sanitize before learner publish |
| CISA KEV data mirror | github.com/cisagov | T0 | Scheduled metadata ingest | Daily | No (raw) | Yes — derive curated outputs only |
| ENISA Threat Landscape | enisa.europa.eu | T1 | Manual (annual) | Annual | Yes (strategic trends) | Yes |
| IBM X-Force Threat Intelligence | ibm.com | T2 | Manual (annual) | Annual | Yes (exec summaries) | Yes |
| Verizon DBIR | verizon.com | T2 | Manual (annual) | Annual | Yes (patterns) | Yes |
| Mandiant M-Trends | cloud.google.com | T2 | Manual (annual) | Annual | Yes (high-level) | Yes |
| Microsoft Digital Defense Report | microsoft.com | T2 | Manual (annual) | Annual | Yes (exec summaries) | Yes |
| CERT/CC Vulnerability Notes | kb.cert.org | T1 | Monitor + selective | Weekly | No (raw) | Yes |
| Surface Transportation ISAC | surfacetransportationisac.org | T1 | Monitor (membership gated) | Daily/weekly | No (raw member) | Yes |
| Maritime Transportation ISAC | mtsisac.org | T1 | Monitor (membership gated) | Weekly | No (raw) | Yes |

### Category 5: Stack-Dependent Operational Alerts (sharp knives — monitor, don't mass-ingest)

| Source | Domain | Trust | Ingest Mode | Cadence | Learner-Safe | Review Required |
|--------|--------|-------|-------------|---------|--------------|-----------------|
| Microsoft MSRC Security Update Guide | msrc.microsoft.com | T1 | Monitor + targeted ingest | Weekly (Patch Tuesday) | No (raw) | Yes |
| Fortinet PSIRT advisories | fortiguard.com | T2 | Scheduled + review | Daily | No (raw) | Yes |
| Palo Alto Networks advisories | security.paloaltonetworks.com | T2 | Monitor | Daily | No (raw) | Yes |
| Cisco Talos threat advisories | talosintelligence.com | T2 | Monitor | Weekly | No (raw) | Yes |
| MITRE ATT&CK | attack.mitre.org | T1 | Manual ingest of stable concepts | Quarterly | No (raw technique pages) | Yes — concept-level only |
| NVD / CVE Program | nvd.nist.gov / cve.org | T0 | Scheduled metadata ingest | Daily | No (raw) | Yes — derive curated summaries |

---

## Hard Rules

1. **Raw ISAC member reports** → never learner-visible without curation and rights check
2. **TIA fraud framework** → reference-only; redistribution explicitly prohibited; no direct KB items
3. **CISA #StopRansomware advisories** → contain IOCs/TTPs; internal staging only; derive sanitized training derivatives
4. **Step-by-step exploit instructions or PoC code** → never ingested, regardless of public availability
5. **Single-source T2/T3 claims** → require corroboration from T0/T1 source before KB item creation
6. **Vendor marketing pages without transparent methodology** → watch-only; never sole authority
7. **News reports without primary source confirmation** → watch-only

---

## Source Balance Targets (healthy KB)

| Category | Target % of KB Content |
|----------|------------------------|
| Government/regulatory (T0) | 20–30% |
| Freight-specific industry associations (T1) | 15–25% |
| Practitioner/threat intelligence | 15–20% |
| Data/analytics sources | 10–15% |
| Academic research | 5–10% |
| Insurance/legal | 5–10% |
| Trade press | 5–10% |

Red flags:
- Any single source > 25% of content
- Vendor reports > 20% without counterbalancing T0/T1 sources
- Zero freight-specific sources
- Press coverage cited without tracing to primary data

*Last updated: 2026-03-17*
