# out/kb-content/ — Generated Curriculum Content

**Type:** Generated output / staging area
**Status:** Produced content — not canonical strategy docs

This directory contains AI-generated KB curriculum for the Five Eyes platform, organized by topic tranche. Each tranche has the same internal structure.

---

## Structure

```
t{N}-{topic}/
  kb-{NN}-{slug}.md         # Knowledge base articles (ingested into platform)
  module-outline.md         # Module structure outline
  practice-questions.md     # Assessment questions
  remediation-{NN}-*.md     # Remediation content for wrong answers
```

## Tranches

| Dir | Topic |
|-----|-------|
| t1-phishing | Phishing awareness (email, SMS, voice) |
| t2-bec-payment | Business Email Compromise / payment fraud |
| t3-passwords-mfa | Passwords and multi-factor authentication |
| t4-freight-identity | Freight-specific identity verification |
| t5-ransomware | Ransomware prevention and response |
| t6-incident-response | Incident response procedures |
| t7-mobile-byod | Mobile device and BYOD policies |
| t8-it-hygiene | IT hygiene and patch management |
| t9-vendor-risk | Third-party / vendor risk management |
| t10-data-security | Data classification and handling |

---

## What this is NOT

- Not the canonical source of KB strategy or governance → see `docs/kb-governance-model.md`
- Not the content build order → see `docs/kb-build-order.md`
- Not the ingestion pipeline design → see `docs/content-intelligence-plan.md`

## Workflow

1. Content is generated here as draft markdown
2. Reviewed/edited as needed
3. Ingested into the platform via Admin → KB Management (Manual or File trigger)
4. Once ingested, the platform DB is the live source — these files are the pre-ingestion drafts

---

*These files are safe to regenerate. The platform DB is the authoritative runtime state.*
