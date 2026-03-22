# Content Intelligence Plan
**Date:** 2026-03-17
**Purpose:** Gap detection signals, freshness model, learner-behavior diagnostics, and scoring framework for the Five Eyes freight cybersecurity KB.

Based on: `reference/compass_artifact_wf-52276199-e87f-49e0-8126-9824bd5dd233_text_markdown.md`

---

## 1. Coverage Standard (What "Enough" Looks Like)

### Minimum content unit per risk topic

Each topic in the risk taxonomy requires at minimum **three content layers**:
1. A foundational KB explainer article (what the threat is, why it matters, correct response)
2. A scenario-based application article or module segment (freight-specific context)
3. An assessment component with remediation pathway

General topics: 3 of 4 components (foundational + scenario + assessment + remediation).
**Freight-specific and compliance-linked topics: all 4 required.** No exceptions.

### Module completeness threshold (ADDIE-based)

A module is learner-safe when all six ADDIE components are present:
1. Stated learning objectives in measurable behavioral terms
2. Core instructional content
3. Interactive practice or scenario exercises
4. Post-assessment with **15–20 questions per topic** (commercial standard)
5. Elaborated corrective feedback for each question (not just "wrong — try again")
6. Defined remediation pathway for learners who fail

Modules missing any component: flagged incomplete, ineligible for learner deployment.

### Freight-specific coverage multiplier

Freight topics require 1.5x coverage versus general awareness topics:
- General phishing module: 3 content units minimum
- Freight-specific load board fraud module: 4–5 content units minimum, including ≥1 recent case study updated quarterly

Rationale: freight-specific threats have fewer redundant learning sources available to employees outside this platform; double-brokering fraud via spoofed MC numbers is likely an employee's *only* source of structured learning.

---

## 2. Gap Types and Detection Logic

### Coverage gaps (most critical)
**Definition:** Topic exists in curriculum framework but has zero or near-zero content.
**Detection:** Map content inventory against NIST CSF 2.0 subcategories, NICE Framework KSA statements, and the platform's freight threat taxonomy (load board fraud, BEC patterns, cargo theft tactics, ELD/fleet management security, ransomware, supply chain attacks, MC number fraud).
**Severity:** Critical — platform is silent on a real threat.

### Depth gaps
**Definition:** Topic has surface treatment but lacks detail needed for competency.
**Detection signal:** Learners pass knowledge-recall items (Bloom's "remember") but fail application-level items on the same topic.
**Severity:** High — content taught recognition but not response.

### Support gaps
**Definition:** Content exists but lacks the infrastructure learners need.
**Detection signals:**
- Quiz questions reference concepts with no corresponding KB article
- Modules with no post-assessment
- Assessments with no remediation pathway
- Content-to-assessment ratio imbalance: flag when one topic has 3x more questions than another equally complex topic

### Alignment gaps (hardest to detect)
**Definition:** Content exists but doesn't match what learners actually encounter.
**Detection signal:** Zero-result searches — the single most actionable gap indicator.
**Threshold:** Below 60% search success rate = significant content or taxonomy problem (mature KBs achieve 80%+).
**Secondary signal:** Search refinement chains (user searches "phishing" → "phishing attack" → "email security" in rapid succession = KB isn't meeting the need).

### Distinguishing gaps from pipeline items

| Status | Meaning |
|--------|---------|
| Not Started + on roadmap with owner + target date | Pipeline item — not a gap |
| Not Started + not on roadmap | Content gap — needs action |
| In Development | Pipeline — track, not a gap |
| In Review | Pipeline — track |
| Published | Live — track freshness |
| Needs Update | Freshness gap — action required |
| Retired | Expected — verify intentional |

---

## 3. Freshness Model

### Volatility classification

| Content Type | Staleness Threshold | Review Trigger |
|-------------|--------------------|--------------------|
| Threat intelligence / current threat landscape | 30–90 days | New CISA advisory, major incident |
| Freight fraud tactics (load board scams, BEC cargo theft, identity fraud) | **90 days** | CargoNet quarterly report, NMFTA intelligence |
| Ransomware/malware threats to logistics | 6 months | Major sector incident, new strain targeting transportation |
| BEC patterns (general) | 3–6 months | FBI IC3 annual report, new campaign intelligence |
| Technical controls (MFA, endpoint, email security) | 6–12 months | Major product changes, new bypass techniques |
| Regulatory/compliance references | 12 months or upon change | New framework version, regulatory deadline, TSA directive renewal |
| General security hygiene | 12 months | NIST guidance changes, major methodology shifts |
| NIST/standards framework content | 2–3 years | Framework revision publication |

### Required KB object metadata fields

Every KB item must carry:
- `sourcePublicationDate` — date of the source material
- `ingestDate` — when item was ingested into platform
- `lastReviewedAt` — last human review date
- `nextReviewDue` — computed from freshness tier
- `freshnessTier` — high / medium / low / regulatory
- `autoSunsetBehavior` — high-volatility content auto-unpublishes at 30–45 days unless re-approved

### Event-driven triggers (override calendar cycles)

Seven categories require immediate out-of-cycle content review:
1. CISA alert or advisory affecting freight/logistics or commonly used business systems
2. Major ransomware or cyber incident affecting a logistics company (e.g., ORBCOMM-scale)
3. New FBI IC3 annual report (typically Q1 — triggers review of all fraud-pattern content)
4. New FMCSA guidance, TSA security directive renewal, or DOT cybersecurity initiative
5. New CargoNet quarterly report documenting tactical shifts in cargo theft
6. Significant new NMFTA research or advisory
7. Major vulnerability disclosure in fleet management or logistics software (e.g., CVE-2024-12054 pattern)

---

## 4. Learner Behavior Diagnostics

### Item analysis metrics (classical test theory)

| Metric | Acceptable Range | Red Flag |
|--------|-----------------|---------|
| Item difficulty (p-value: % answering correctly) | 0.25–0.75 | p < 0.20 across all learner groups = content gap |
| Item discrimination (point-biserial) | ≥ 0.20 acceptable; ≥ 0.35 excellent | Negative = bad question; keyed answer wrong |

### Diagnostic patterns

| Pattern | Likely Cause | Action |
|---------|-------------|--------|
| p < 0.25, discrimination < 0.15, uniform across learner groups | Content gap — concept not taught | Add/improve KB content |
| p < 0.25, discrimination > 0.25 | Hard topic but item discriminates | Review content depth |
| Single distractor selected by >40% of test-takers | Systematic misconception | Add targeted content addressing that misconception |
| Negative point-biserial on correct answer | Bad question — miskeyed or ambiguous | Immediate removal or revision |
| p > 0.85, discrimination < 0.15 | Too easy — testing nothing | Revise or replace |

**Critical distinction:** When p < 0.20 AND holds even for high-performing learners → content problem, not learner problem.

### Remediation quality floor

Post-remediation improvement rate is the key quality metric:
- **Target:** 89–94% passing rate after remediation (PharmD research benchmark)
- **Red flag:** < 50% post-remediation improvement = remediation content inadequate
- **Failure signal:** learner selects same incorrect distractor before and after remediation = specific misconception never addressed

Remediation content requirements:
1. Immediate feedback after incorrect response
2. Explanation of why correct answer is correct
3. Refutative content addressing the specific misconception
4. Re-teaching approach that differs from the original presentation (not just repeated exposure)

### Search behavior signals

- **Zero-result queries by frequency** — highest-priority content gap indicator
- **Search-to-click ratio** — low ratio means content exists but doesn't match the need
- **Search refinement chains** — multiple query variations in rapid succession = poor findability or insufficient content

### Completion rate benchmarks

| Benchmark | Value | Source |
|-----------|-------|--------|
| Mandatory compliance training (self-paced) | 18–25% industry average | ATD |
| Microlearning format | ~80% completion | Industry research |
| ATD overall compliance average | 72% | ATD |
| Completion below 70% → risk signal | 3.5x more likely to face compliance violations | Brandon Hall Group |

High skip rates = perceived irrelevance or wrong difficulty level.
Time-on-task far below expected = click-through without engagement.

---

## 5. Source Health Evaluation

### Three-tier source trust model (adapted from NATO Admiralty Code + CRAAP test)

**Tier 1 — Primary trustworthy sources:**
CISA, FBI/IC3, NIST, TSA, FMCSA, GAO, NMFTA (preeminent cybersecurity voice in trucking; original vulnerability discoveries including CVE-2024-12054), CargoNet/Verisk (authoritative cargo theft database since 2010; 144 data fields per incident), SAE International, peer-reviewed academic research.

**Tier 2 — Secondary reference sources:**
TIA (valuable for broker-specific fraud context), FreightWaves, vendor threat intel (Proofpoint, CrowdStrike, Trellix — useful for attack chain analysis; biased toward threats their products address), Munich Re, Cloudflare, law firm advisories.

**Tier 3 — Background/contextual only:**
Individual practitioner blogs, vendor marketing, press releases, social media, forum posts. Never sole authority for any KB claim.

### Source-specific decay rates

| Source | Useful Lifespan |
|--------|----------------|
| CISA vulnerability alerts (IOC/TTP level) | Days to weeks (tactical); 6–12 months (strategic TTPs) |
| FBI IC3 annual reports | ~18 months as trend context; specific dollar figures stale after 1 year |
| NIST Special Publications | 3–10 years between major revisions |
| CargoNet quarterly reports | 90 days — tactics demonstrably shift quarter-over-quarter |
| NMFTA annual reports | 12 months |
| TSA security directives | 12 months (aligned to annual renewal cycle) |

---

## 6. Scoring Framework

### Five dimensions (scored 1–5 per topic)

**Coverage score:**
1 = No content
2 = Single content unit only
3 = Meets minimum general threshold (3/4 components)
4 = Complete infrastructure with depth
5 = Comprehensive with multiple scenarios, tiered difficulty, cross-referenced articles

**Freshness score:**
1 = Expired (past 2x the review cycle)
2 = Overdue (past the review cycle)
3 = Approaching deadline (within 30 days of review)
4 = Current (within cycle)
5 = Recently reviewed with event-triggered updates applied

**Assessment quality score:**
1 = No assessment
2 = Assessment present but <10 questions or single Bloom's level
3 = Meets minimum (15–20 questions, multiple Bloom's levels)
4 = Good quality with discrimination data showing items function correctly
5 = Excellent — item analysis clean, freight-specific scenarios, tiered difficulty

**Remediation quality score:**
1 = No remediation pathway
2 = Remediation pathway exists but no elaborated feedback
3 = Meets minimum (correct answer + explanation)
4 = Good — addresses specific misconceptions
5 = Excellent — post-remediation improvement rate documented ≥89%

**Source health score:**
1 = No sources or all T3/watch-only
2 = T2-only sources (vendor bias risk)
3 = Mix of T1/T2 with adequate coverage
4 = T0/T1 anchor sources with corroboration
5 = T0 primary with T1 corroboration, freight-specific source included, all within freshness window

### Composite topic score

**Minimum passing threshold per topic:** Average ≥ 3.0 across all five dimensions, with no individual dimension below 2.

**Blocking threshold:** Any dimension score of 1 = topic flagged as incomplete and ineligible for learner deployment until resolved.

**Freight-specific multiplier:** Apply 1.25x weight to Coverage and Freshness dimensions for freight-specific topics (load board fraud, BEC cargo theft, ELD security, cargo theft tactics).

---

## 7. Admin Alert Model

### Four-tier severity

**Blocking (Critical) — address before next learner access:**
- Factually incorrect security guidance that could increase vulnerability
- Assessment answers unsupported by any current KB article
- Zero coverage on a compliance-required topic
- Content that contradicts current incident response plans

**Urgent (24–48 hours):**
- Stale content on high-risk topics exceeding review cycle
- Source expiration on compliance-referenced content (cited regulation superseded)
- Missing remediation pathway for assessments with >40% failure rate
- CISA advisory or major incident affecting a covered topic

**Review (1–2 weeks):**
- Thin KB coverage for emerging topics
- Quiz questions lacking explanation text
- Content approaching review deadline (within 30 days)
- Moderate content-to-assessment ratio imbalances

**Watch (monthly digest):**
- Declining engagement metrics
- Metadata gaps on non-critical content
- Minor source age accumulation
- Low-traffic content utilization

### Fatigue prevention targets

- Critical interruptive alerts: ≤ 2–5 per week
- Total daily actionable alerts: ≤ 10–20
- Deduplicate: if same issue fires repeatedly, aggregate into one alert with escalating status
- Smart aggregation: group related alerts by topic, not by individual KB item

*Last updated: 2026-03-17*
