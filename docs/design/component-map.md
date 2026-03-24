# Component Map — Five Eyes V2
_Generated 2026-03-22 | Phase 2_

---

## Public Layer Components

### Shared / Global

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| `NeuralBackground` | `src/components/NeuralBackground.tsx` | BUILD | Canvas particle system — gold nodes + lines. Port from V1. |
| `PublicLayout` | `src/components/PublicLayout.tsx` | BUILD | Nav + Footer + NeuralBackground. Wraps all public routes. |
| `PublicNav` | embedded in PublicLayout | BUILD | Centered logo, split nav links, mobile hamburger |
| `PublicFooter` | embedded in PublicLayout | BUILD | 4-col grid: Platform/Company/Legal/Media. fiveeyesltd.com links. |
| `FiveEyesLogo` | `src/components/FiveEyesLogo.tsx` | BUILD | Brand logo SVG — port from V1 |

### Landing Page Primitives

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| `HeroBlock` | inline in LandingPage | BUILD | Eyebrow label + H1 + CTA button |
| `TacticalCard` | inline in LandingPage | BUILD | Tall cinematic card — image BG + overlay + icon + label + CTA |
| `EmailAuditCTA` | inline in LandingPage | BUILD | "Validate Your Defenses" panel — keep or simplify |
| `LandingCapabilityCard` | inline in LandingPage | BUILD | Image header + icon + expand-on-hover description |
| `TrustQuote` | inline in LandingPage | BUILD | Italic quote + gold rule + attribution |

### Reusable Public Primitives

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| `PageHero` | `src/components/PageHero.tsx` | BUILD | Full-bleed hero section with overlay + title + subtitle + CTA |
| `GlassPanel` | `src/components/GlassPanel.tsx` | BUILD | backdrop-blur glass card — `--bg-surface/0.3` + border |
| `GoldRule` | inline | BUILD | `w-12 h-1 bg-gold-accent` divider with glow |
| `SectionLabel` | inline | BUILD | 10px uppercase tracking-[0.5em] label with flanking dividers |
| `ComparisonGrid` | inline in AboutPage | BUILD | "Others do X / We do Y" 2-col layout |

---

## App Layer Components

### Navigation / Shell

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| `NavShell` | `src/components/layouts/NavShell.tsx` | EXISTING — polish | Authenticated app shell with sidebar/topbar |

### Admin Components

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| `GovernancePanel` | `src/components/admin/GovernancePanel.tsx` | EXISTING | KB governance view |
| `ItemGovernanceDetail` | `src/components/admin/ItemGovernanceDetail.tsx` | EXISTING | KB item governance detail |

### Data Display Primitives

| Component | Usage | Status | Description |
|-----------|-------|--------|-------------|
| `DataCard` | Admin/Learn | BUILD | `--bg-surface`, border, flat, no image. Title + value + label. |
| `StatusBadge` | Tables | BUILD | Pill: complete/in-progress/error/idle states |
| `ModuleCard` | LearnHub | BUILD | Module thumbnail (owned image) + title + progress + CTA |
| `SectionHeader` | All app pages | BUILD | Eyebrow label + H2. No gold theatrics. |

---

## Page → Component Dependency Map

```
LandingPage
  └── PublicLayout
       ├── NeuralBackground
       ├── PublicNav
       └── PublicFooter
  ├── HeroBlock
       ├── SectionLabel (eyebrow)
  ├── TacticalCard × 3
  ├── EmailAuditCTA (optional/simplified)
  ├── LandingCapabilityCard × 4
  └── TrustQuote

AboutPage
  └── PublicLayout
  ├── PageHero (About variant)
  ├── GlassPanel (Problem section)
  ├── GlassPanel (Who We Are)
  └── ComparisonGrid × 3 (What Makes Us Different)

CapabilitiesPage
  └── PublicLayout
  ├── SectionLabel + H1
  └── CapabilityCard × 4

EnterprisePage
  └── PublicLayout
  ├── PageHero (Contact variant)
  └── ContactForm

LegalPages (Privacy, Terms)
  └── PublicLayout
  └── ProseContent (styled markdown)

LearnDashboard
  └── NavShell
  └── ModuleCard × n (with owned /assets/dashboard/ images)

AdminDashboard
  └── NavShell
  └── DataCard × n

TtxConduct / TtxParticipate
  (Full-screen, no NavShell — existing structure, visual polish only)
```

---

## Build Sequence

```
1. src/index.css — CSS custom properties + font import
2. tailwind.config.js — token aliases
3. NeuralBackground.tsx
4. FiveEyesLogo.tsx
5. PublicLayout.tsx (nav + footer)
6. LandingPage.tsx
7. AboutPage.tsx
8. CapabilitiesPage.tsx
9. EnterprisePage.tsx
10. PrivacyPolicyPage.tsx
11. TermsPage.tsx
12. App.tsx — add public routes
13. NavShell.tsx — visual polish pass
14. LearnDashboard.tsx — module card polish with owned images
15. AdminDashboard.tsx — card polish
```
