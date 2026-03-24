# KB Build Order (2026-03-16)

## Principle

Build the topics that stop the most expensive failures first. The ordering below follows four criteria from the deep-research-report:
1. **Direct business risk** — does a gap here enable theft, cash loss, or outage today?
2. **Frequency in freight operations** — how often does this threat pattern show up?
3. **Training leverage** — does training meaningfully reduce risk in this area?
4. **AI fill risk** — how dangerous is it if Claude has to improvise because the KB has nothing?

---

## First Tranche — Ship with Platform

These four topics block everything else. They are the primary initial access vectors for the threats that actually hurt freight companies: BEC causes direct cash loss, phishing enables account takeover and ransomware, credential theft is the entry point for both, and load board/identity fraud causes cargo diversion. Without solid content here, every other feature of the platform rests on nothing.

**Deliverable standard per topic:** 6–10 KB articles + 1 role-based module path + 25–40 scenario practice questions + 2 one-page remediation cards.

---

### T1. Phishing and Email Security
**Why first:** Common entry point to all other threats. Gateway to credential theft, ransomware, and BEC. Affects every persona — drivers, dispatch, finance, admin. Highest training leverage of any topic (behavior change = fewer incidents).

**KB articles to author (7):**
1. `Phishing in freight: recognizing load board lures and fake FMCSA emails` (threat-brief)
2. `Email red flags: header spoofing, lookalike domains, urgent language patterns` (training-content)
3. `Smishing and vishing for drivers and night dispatch` (training-content)
4. `Safe link handling: hover, verify, approved channels` (training-content)
5. `How to report a suspicious email or text` (policy)
6. `Phishing → ransomware: the kill chain in three steps` (threat-brief)
7. `What happens after you click: immediate steps` (faq)

**Module:** "Phishing and Social Engineering" — email, SMS, phone. Include "psychology of urgency" lesson (freight time pressure is weaponized).

**Remediation cards:**
- "I clicked a link" (disconnect, report, reset password, notify IT)
- "I entered my credentials" (MFA reset, session revocation, account review, notify IT)

---

### T2. BEC and Payment Fraud / Invoice/Payment Fraud
**Why first:** BEC is cited by FBI as one of the most financially damaging online crimes. FinCEN scenarios map directly to freight: factoring payment changes, fuel card redirection, detention urgent-payment requests. Topics 2 and 7 from the audit are the same content surface.

**KB articles to author (8):**
1. `Payment change verification policy: the non-negotiable rules` (policy)
2. `BEC in freight: factoring fraud, invoice redirection, executive impersonation` (threat-brief)
3. `Freight-specific BEC map: where to expect it in the payment cycle` (training-content)
4. `BEC indicator library: urgency, domain spoofing, lookalike emails, out-of-band tells` (training-content)
5. `Financial escalation tree: bank contact → internal → insurer → law enforcement` (policy)
6. `What "dual approval" means and when to invoke it` (training-content)
7. `If you already sent money: the first 60 minutes` (faq)
8. `Evidence capture checklist: what to preserve when fraud is suspected` (policy)

**Module:** "BEC and Payment Protection" — finance/AP/AR focus. Include realistic freight invoice and factoring communication examples. Include "how attackers exploit operations urgency" lesson.

**Remediation cards:**
- "I already sent money" (immediate bank contact, incident report, evidence freeze)
- "I received a suspicious payment-change request" (hold, verify, escalate)

---

### T3. Passwords and Credential Security / MFA
**Why first:** Compromised credentials are the primary initial access vector per StopRansomware guidance. Credential theft at email, TMS, and load board portals enables cargo diversion, payment changes, and ransomware deployment. Topics 4 and 5 from the audit share the same module.

**KB articles to author (7):**
1. `Account security standard for freight apps: email, TMS, load boards, document portals` (policy)
2. `Password guidance: length, blocklists, no forced rotation, why password managers work` (training-content)
3. `MFA deployment guide: drivers, dispatch, finance, and admins` (training-content)
4. `MFA FAQ: what it is, why it matters, what to do when your device changes` (faq)
5. `Privilege separation basics: why admin and user accounts must differ` (training-content)
6. `Account takeover in freight: how stolen credentials become a rerouted shipment` (threat-brief)
7. `Lost phone: MFA recovery step-by-step` (faq)

**Module:** "Account Security and MFA" — unified. Show the full path from credential theft to rerouted load or redirected payment.

**Remediation cards:**
- "My account may be compromised" (reset, revoke sessions, check forwarding rules, notify)
- "I lost my phone" (MFA recovery sequence, what accounts to prioritize)

---

### T4. Load Board Scams / Double Brokering / Broker–Carrier Impersonation / Document Fraud
**Why first:** These are the freight-specific threats that have no analog in generic office security training. FBI explicitly warns on fictitious pickups, load board fraud, and carrier identity theft. FMCSA frames double brokering as a regulated fraud category. CargoNet warns document fraud is increasingly prevalent. All three audit topics (8, 9, 10) live under the same "Freight Identity and Verification" KB umbrella.

**KB articles to author (9):**
1. `Freight fraud kill chain: tender → vet → pickup → in-transit → delivery → settlement` (training-content)
2. `Carrier identity verification: what to check, where to check it, FMCSA lookup` (training-content)
3. `Load board red flags: too-low rates, pressure tactics, unusual contact channels` (threat-brief)
4. `Double brokering mechanics: how it works, how to detect it` (threat-brief)
5. `Pickup integrity: matching driver, equipment, tractor, trailer, and seal` (training-content)
6. `BOL/POD document integrity: what a BOL controls, how it is abused, when to escalate` (training-content)
7. `Exception-handling rules: destination changes, carrier swaps, reconsignment requests` (policy)
8. `Red flags library by workflow stage: tender, pickup, in-transit, delivery, settlement` (training-content)
9. `Role-based verification checklists: dispatch, dock, brokerage ops, management` (policy)

**Module:** "Freight Identity, Verification, and Fraud Controls" — scenario-driven ("You are dispatch, you receive X…"). Include dock release controls, dispatcher identity confirmation, and customer-service exception handling as sub-lessons.

**Remediation cards:**
- "Dock refusal script" (and when to use it)
- "Suspicious pickup detected" (hold, call-back verification, escalate, log)

---

## Second Tranche — Ship Within 30 Days of Launch

These three topics are high-risk but benefit from having the First Tranche content in place — learners need the credential and phishing foundation before ransomware and incident response training fully land.

---

### T5. Ransomware / Operational Resilience
**Why second:** Downtime is existential in logistics ($5.08M average, 24 days of paralysis). But ransomware prevention training builds on phishing and credential security — the First Tranche sets the attack-entry context. Operational resilience content (backups, continuity) requires leadership buy-in that follows once they understand the entry vectors.

**KB articles (6):**
1. `Ransomware in freight: dispatch down, WMS dark, billing halted` (threat-brief)
2. `Backup standard: what must be backed up, how often, the offline copy rule` (policy)
3. `Ransomware triage: how to recognize it, what not to do first` (training-content)
4. `Business continuity minimum manual ops: dispatch fallback, paper-based pickup verification` (policy)
5. `Role-based first hour: drivers, dispatch, finance, leadership` (training-content)
6. `Why backups fail: untested restores, shared credentials, online-only copies` (training-content)

**Module:** "Ransomware and Operational Resilience" — role-based tracks.

**Remediation cards:**
- "I think I have ransomware" (isolate, report, do not reconnect, document)
- "Manager card: activate continuity plan" (what to freeze, control communications)

---

### T6. Incident Reporting and Response
**Why second:** NIST SP 800-61 Rev. 3 positions response integration as reducing incident impact. Minutes matter in payment fraud and cargo diversion — but effective response requires learners to know what incidents look like (First Tranche content). Reporting training without scenario context produces box-checking, not behavior.

**KB articles (5):**
1. `What counts as an incident: freight-specific examples and thresholds` (policy)
2. `Single reporting path: where to report, what details to include` (policy)
3. `Evidence preservation primer: emails with headers, portal logs, payment instructions` (training-content)
4. `External reporting guide: bank, law enforcement, and insurer contact sequence` (policy)
5. `Incident vs. near-miss: why both get reported` (training-content)

**Module:** "Incident Reporting and First Response" — two tracks: everyone (report fast, report well) + manager (triage, preserve evidence, avoid contaminating systems).

**Remediation cards:**
- Printable incident card for dispatch floor and docks
- "Who to call" directory template (bank, MSP, cyber insurer hotline, internal leads)

---

### T7. Mobile Device / BYOD Security
**Why second:** Distributed workforce with BYOD is a persistent exposure, especially for drivers. But this content assumes learners already understand phishing/smishing (First Tranche #1) — mobile security training makes more sense after the credential and phishing foundation is set.

**KB articles (5):**
1. `Mobile security basics for freight workers: lock screen, updates, app permissions` (training-content)
2. `BYOD policy starter: what is allowed, what is forbidden` (policy)
3. `Public Wi-Fi and hotspot safety for drivers` (training-content)
4. `Lost or stolen phone: immediate response checklist` (faq)
5. `Suspicious texts and calls at the dock: how to recognize and respond` (training-content)

**Module:** "Mobile Device and BYOD Security" — driver-first track (10–15 min), supervisor enforcement track.

**Remediation cards:**
- "Device lost" (immediate steps, who to call, accounts to secure first)
- "Suspicious text/call" (do not respond, report, document)

---

## Third Tranche — Ship Within 60 Days of Launch

These topics are important but require some organizational maturity or prior content to land effectively. They also have lower immediate training leverage than First and Second Tranche — the org must stabilize on the basics before these resonate.

---

### T8. Secure Systems Hygiene for SMB IT
**Why third:** Patching, remote access control, and endpoint health reduce exposure but require IT/MSP coordination beyond what individual learner training can drive. The "leadership buy-in" module works better after leadership has been through ransomware resilience content (Second Tranche).

**KB articles (4), Module, 2 Remediation cards.**

---

### T9. Third-Party/Vendor Risk
**Why third:** Requires awareness of what vendors have access to (TMS, email, admin portals). NIST SP 800-161 is the appropriate anchor. Effective training requires the org to have its own access inventory first — which is a post-launch operations task.

**KB articles (4), Module, 2 Remediation cards.**

---

### T10. Data and Document Security (expanded)
**Why third:** The core document fraud content (BOL/POD) is already in First Tranche T4. This tranche covers the broader data security layer — HR/driver PII handling, secure sharing, breach response — which matters once there is real data flowing through the platform.

**KB articles (4), Module, 2 Remediation cards.**

---

## TTX Layer — After First Tranche Is Stable

Do not run tabletop exercises until:
- All First Tranche KB articles are published (status: `published`)
- Remediation cards are live in the KB
- At least one learner module per First Tranche topic is active

Start with these three TTX packages (scenarios map directly to First Tranche KB procedures):

1. **"Fictitious Pickup + Document Spoofing"** — release controls and escalation. Maps to T4 KB.
2. **"Invoice Redirection + Urgent Wire"** — verification controls and bank escalation. Maps to T2 KB.
3. **"Ransomware Hits Dispatch"** — continuity, backups, and communications. Maps to T5 KB.

---

## Content Velocity Target

| Tranche | Topics | KB Articles | Modules | Practice Qs | Remediation Cards | Target |
|---------|--------|-------------|---------|-------------|-------------------|--------|
| First | 4 (as 4 content groups) | ~31 | 4 | ~120–160 | 8 | Pre-launch |
| Second | 3 | ~16 | 3 | ~60–90 | 6 | 30 days post-launch |
| Third | 3 | ~12 | 3 | ~45–60 | 6 | 60 days post-launch |
| **Total** | **10** | **~59** | **10** | **~225–310** | **20** | |

These targets align with the deep-research-report deliverable standard: 6–10 KB articles, 1 role-based module path, 25–40 scenario questions, and 2 remediation cards per topic for the First Tranche.

---

## Authoring Notes

**Use the deep-research-report as primary spec.** Each topic section in that document defines exactly what KB/reference, module, practice, and remediation content must cover. Do not improvise scope — the research already defines the minimum.

**Source materials available for rewrite:**
- `reference/TTX_examples/` — TTX PDFs and PPTX files contain scenario structures and inject patterns usable as practice question seeds
- `reference/deep-research-report.md` — complete per-topic specs with authoritative source citations (FBI, FMCSA, FinCEN, NIST, CargoNet, NMFTA)
- `reference/compass_artifact_*.md` — 22-topic priority matrix with NIST CSF mapping and persona coverage

**Content model reminder:** All KB items ingest as one of: `training-content`, `threat-brief`, `policy`, `faq`, `glossary-term`. Tag each with the appropriate topic(s) on ingest. Set status to `draft` initially; move to `published` after review.

*Last updated: 2026-03-16*
