# KB Governance Model
**Date:** 2026-03-17
**Purpose:** Review-first publish rules, alert priorities, publish decision criteria, and governance workflow for the Five Eyes freight cybersecurity KB.

Based on: `reference/deep-research-report.md` + `reference/compass_artifact_wf-*.md`

---

## Core Principle

> **Separate ingestion from publication.** Many high-value sources contain sensitive technical details (IOCs, TTPs, exploit instructions) and must route through human curation before any learner sees them. The KB stays sharp if content is boring where it should be stable and fast where it must be current — but never autopublished.

---

## Content Lifecycle

```
Not Started
    ↓
In Development   ← content being authored
    ↓
In Review        ← human review: accuracy, source trust, freshness, learner-safety
    ↓
Published        ← learner-visible
    ↓
Needs Update     ← freshness trigger fired or event-driven review needed
    ↓
Retired          ← intentionally removed from learner view
```

**Hard rule:** No content moves from In Development directly to Published without an In Review step. No exceptions.

---

## Review-First Publish Rules

### Always goes to review (never direct-to-learner)

| Content Category | Why Review Required |
|-----------------|-------------------|
| Any advisory containing IOCs, TTPs, or exploit details | CISA #StopRansomware advisories explicitly include these; raw content could train attackers |
| Vulnerability streams (KEV, NVD, CVE) | Learner-visible outputs must be synthesized (why patching matters, what to change) — not enumerations of targets |
| Commercial intelligence datasets (CargoNet, TT Club, Overhaul) | Methodology and bias must be checked; numbers must be contextualized |
| Regulatory content | Must confirm: is this rule final or proposed? Is the version cited current? Has a newer directive been issued? |
| Any content referencing legal thresholds or penalties | Risk of providing incorrect compliance guidance; verify with primary source |

### Hard "no autopublish" categories

| Category | Rule |
|----------|------|
| Raw ISAC member reports | Never learner-visible: licensing + sensitivity |
| TIA fraud framework subscriber content | Redistribution explicitly prohibited |
| Step-by-step exploit instructions or PoC code | Never ingested, regardless of public availability |
| Vendor marketing pages without transparent methodology | Watch-only; never sole authority |
| News reports without primary confirmation | Watch-only |

### What can be safely ingested (still review before publishing)

- Primary standards and guidance (NIST, CIS Controls, CISA CPGs) — distill into learner-facing lessons
- Regulator alerts and definitions for freight fraud and identity theft (FMCSA, FinCEN) — cite accurately
- High-level maritime cyber risk guidance (IMO, USCG NVIC 01-20) — extract policy intent
- FBI IC3 annual report findings — synthesize into awareness content; do not reproduce specific IOC detail

---

## Publish Decision Criteria

A KB item is eligible for publish when all of the following are true:

| Criterion | Requirement |
|-----------|------------|
| Source trust | T0 or T1 anchor source present; T2 sources corroborated |
| Accuracy | No factual errors; all statistics trace to named primary source |
| Learner safety | No IOCs, TTPs, exploit details, or PoC code in learner-visible content |
| Freshness | Within the freshness window for its volatility tier |
| Licensing | No redistribution-restricted content republished without rights |
| Topic alignment | Tagged to correct topic(s); searchable |
| Assessment linkage | At least one quiz question exists for the item (except remediation cards) |
| Regulatory accuracy | Any regulatory claims reflect current rule status (final vs. proposed) |

**Blocking failures** (item cannot publish until resolved):
- Source is T3-only with no T0/T1 corroboration
- Content contains raw IOCs, TTPs, or exploit steps
- Regulatory claim cites a withdrawn or superseded rule
- Redistribution-restricted content reproduced without rights

---

## Gap and Thin-Topic Logic

### Gap detection priority order

1. **Coverage gaps** (no content at all on a mapped threat) — highest severity; see content-intelligence-plan.md
2. **Support gaps** (assessments have no KB article backing) — urgent; breaks remediation loop
3. **Depth gaps** (surface only; learners can't apply) — high; blocks competency
4. **Alignment gaps** (content exists but doesn't match search queries) — medium; taxonomy or naming issue

### Thin-topic threshold

A topic is "thin" when:
- Fewer than 3 KB articles exist for it
- Or: the topic has only one content type (e.g., all policy articles, no training-content)
- Or: the topic has no practice questions

Thin topics should be flagged in the admin alert queue at "Review" tier and added to the content roadmap.

### Freight-specific topics require quarterly review regardless of freshness tier

Topics with 90-day freshness cycles:
- Load board fraud / double brokering
- BEC-enabled cargo theft tactics
- Carrier impersonation patterns
- ELD/telematics security (firmware vulnerabilities)

These change faster than generic security awareness content. A module on double-brokering fraud via spoofed MC numbers is likely an employee's only structured source of learning — it cannot be allowed to go stale.

---

## Alert Priorities

### Tier 1 — Blocking (stop the learner clock)

| Trigger | Required Action |
|---------|----------------|
| KB item published with factually incorrect security guidance | Immediately unpublish; correct; re-review |
| Assessment answer unsupported by any current KB article | Unpublish quiz question; create supporting KB article |
| Zero content on a compliance-required topic (FMCSA, TSA, CIRCIA when final) | Create content before any learner reaches that topic in the module path |
| Published content contradicts current incident response plan | Reconcile and republish |

### Tier 2 — Urgent (24–48 hours)

| Trigger | Required Action |
|---------|----------------|
| CISA advisory affecting a covered topic | Review related KB items; update or add as-changed note |
| Major logistics sector incident (ransomware, cargo theft wave) | Review affected topics; add event-triggered content if needed |
| TSA Security Directive renewal (October annually) | Review T6 incident response content; confirm version C or later cited |
| New FBI IC3 annual report (Q1) | Review all fraud-pattern content; update statistics |
| CargoNet quarterly report with tactical shift | Review T2/T4 BEC and cargo theft content |
| Published content citing a now-superseded NIST publication (e.g., SP 800-61 r2) | Update to current version (r3) |
| Assessment failure rate >40% on a topic with no remediation pathway | Create remediation pathway |

### Tier 3 — Review (1–2 weeks)

| Trigger | Required Action |
|---------|----------------|
| Thin topic detected (< 3 articles) | Add to content roadmap |
| Quiz question missing explanation text | Add elaborated feedback |
| Content approaching review deadline (within 30 days) | Schedule review |
| Search zero-result rate >40% | Review taxonomy and content gaps |

### Tier 4 — Watch (monthly digest)

| Trigger | Action |
|---------|--------|
| Declining module completion rate below 70% | Review content for perceived irrelevance or difficulty mismatch |
| Time-on-task anomaly (modules completed far faster than estimated_minutes) | Review for click-through behavior; add friction or scenario depth |
| Source age accumulation on non-critical content | Note in monthly digest |

---

## Freshness Rules (Operational)

| Freshness Tier | Volatility | Review Cycle | Auto-Sunset |
|---------------|-----------|-------------|-------------|
| high | Threat intel, KEV-derived, freight fraud tactics | 30–90 days | Unpublish at 90 days unless re-approved |
| medium | Ransomware response, BEC patterns, cargo theft | 3–6 months | Flag at 4 months; unpublish at 6 months unless re-approved |
| low | Technical controls (MFA, endpoint, email) | 6–12 months | Flag at 9 months |
| regulatory | TSA directives, CIRCIA status, SEC rules | 12 months + event-driven | Flag immediately when rule is amended or superseded |
| framework | NIST/CIS framework content | 2–3 years | Flag when framework version changes |

---

## Review Roles and Responsibilities

| Role | Responsibility |
|------|---------------|
| Content author | Writes KB item with correct frontmatter, source citations, no IOCs/TTPs |
| Reviewer (admin) | Confirms accuracy, source trust tier, learner safety, freshness, regulatory accuracy |
| Publisher (admin) | Moves from In Review → Published after reviewer approval |
| Freshness monitor | Tracks next-review-due dates; generates alert queue items |
| Legal/compliance check | Required for any content citing specific regulatory thresholds, penalties, or breach notification obligations |

**Minimum review requirement:** At least one admin review before any item is published. For regulatory content: reviewer must confirm rule is current and correctly characterized (proposed vs. final, version number, effective date).

---

## Coverage Score Targets by Tranche

| Tranche | Target Coverage Score | Target Freshness Score |
|---------|-----------------------|------------------------|
| First Tranche (T1–T4) | ≥ 4.0 | ≥ 4.0 |
| Second Tranche (T5–T7) | ≥ 3.5 | ≥ 4.0 |
| Third Tranche (T8–T10) | ≥ 3.0 at launch | ≥ 4.0 |

**Blocking threshold:** No topic below 2.0 on any dimension when in learner-facing modules.

---

## Regulatory Accuracy Rules

These specific claims require source verification before any KB publish:

| Claim Type | Required Verification |
|------------|----------------------|
| CIRCIA reporting thresholds | Check federalregister.gov — as of 2026-03-17, rulemaking in progress; final rule not yet published; must state "proposed" |
| TSA Security Directive version | Current version: SD 1580-21-01 version C, effective October 2024; annual renewal |
| NIST IR guidance | SP 800-61 Rev.2 was withdrawn; cite Rev.3 (2025) only |
| NYDFS 23 NYCRR 500 | Confirm current amendment and effective date |
| State breach notification laws | Vary by state; do not cite specific timelines without jurisdiction-specific verification |
| SEC 4-day material cyber incident rule | Item 1.05 Form 8-K; confirm rule has not been amended |

---

## Audit Trail Requirements

Every KB item must maintain:
- `createdBy` — admin username of item creator
- `reviewedBy` — admin username of reviewer who approved publish
- `publishedAt` — timestamp of publication
- `lastReviewedAt` — timestamp of most recent human review
- `revisionHistory` — all content revisions with author and timestamp

These fields are non-negotiable. They are the mechanism by which a future audit (legal, regulatory, customer) can confirm that content was accurate at time of training delivery.

*Last updated: 2026-03-17*
