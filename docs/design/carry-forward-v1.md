# Carry Forward

These elements from the old project are worth preserving in v2.

---

## Landing Page

- Hero headline: "Five Eyes Cyber Training" — clean, confident
- Subheading: "Unified AI Influenced Training Interface" (can be revised but the positioning is right)
- Three tactical cards on the landing: Operations, Intel Hub, Contact Agent
- CTA: "View Packages" — connects public visitors to the commercial side
- Visual language: dark background, gold accent, cinematic card layout with hover effects

## About Page

- Core positioning line: "Former FBI & Military Intelligence Experts Bringing Elite Security to the Logistics and Supply Chain Sector"
- Trust markers: "Trusted by Governments. Built for Logistics. Dedicated to You."
- The framing of the problem: logistics firms lack access to the same protection governments and Fortune 500s rely on
- Bio/credential positioning (intelligence-grade protection for supply chain)

## Capabilities Page

- Four capability areas — these are solid business descriptions worth keeping:
  1. Freight Security Analysis — threat modeling for physical + digital supply chain
  2. Cyber Resilience Training — modules, phishing scenarios, incident drills
  3. Strategic Threat Intelligence — curated intel feeds from former military analysts
  4. Rapid Incident Response — executive-level guidance for the first 72 hours of a breach

## Enterprise Contact Page

- Enterprise contact form (first name, last name, email, phone, company, message, newsletter opt-in)
- Hero section with "Contact Us" — clean, credible
- Serves as the primary business development intake

## Legal Pages

- PrivacyPolicyPage — carry forward as-is, content is stable
- TermsConditionsPage — carry forward as-is, content is stable

## Public Tool

- PublicEmailHealthCheck — a public-facing free tool, good lead-gen mechanic, worth preserving

## Brand / Visual System

- Dark canvas background with transparency layers
- Gold accent color (`gold-accent`, ~amber-400/500)
- Uppercase tracking-widest labels
- Military/intelligence aesthetic: muted overlays, cinematic hero images, glass-card surfaces
- Font: Helvetica/Arial base with tight tracking

## Tier / Access Model (concept only)

- The tier concept is sound: free → individual → premium → supervisor → admin
- Gate training, tabletop, and team features behind paid tiers
- Keep the concept; redesign the implementation

## Data Model Concepts

- `users` (id, email, tier, company, department) — valid, preserve
- `kb_items` + `kb_revisions` — versioned KB articles with publish status, preserve
- `event_logs` and `aggregates_user_readiness` — telemetry and readiness scoring, preserve
- `kb_audit_log` — admin governance trail, preserve
