# Design Execution Brief — Five Eyes V2
_Last Updated: 2026-03-22 | Phase 2_

---

## Current Status

| Phase | Status |
|-------|--------|
| Prep Pack | COMPLETE |
| Phase 1 — Reference Lock | COMPLETE |
| Phase 2 — Design System | IN PROGRESS |
| Phase 3 — Public Site Redesign | PENDING |
| Phase 4 — App Shell Redesign | PENDING |
| Phase 5 — QA + Screenshot Proof | PENDING |

---

## Product Vision

**Five Eyes is a premium intelligence-grade cybersecurity platform for the logistics and supply chain sector, built by former FBI and Military Intelligence operators.**

The V2 frontend must reflect this without theater. Two distinct product surfaces:

1. **Public marketing site** — atmospheric, editorial, refined. Premium but grounded. Trust-building without hype.
2. **Operational app** — tight, calm, readable, dependable. Functions like a real operational platform.

The public site should feel like it belongs alongside enterprise intelligence products. The app should feel like a well-engineered professional tool.

---

## Design System Lock

### Color

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-canvas` | `#050b14` | Page background — deep midnight navy |
| `--bg-surface` | `#071020` | Raised surfaces, cards |
| `--bg-elevated` | `#0a1830` | Elevated UI (modals, dropdowns) |
| `--bg-overlay` | `rgba(5,11,20,0.85)` | Overlay layers |
| `--gold-accent` | `#f59e0b` | PRIMARY ACCENT — CTAs, labels, icons, highlights |
| `--gold-muted` | `rgba(245,158,11,0.15)` | Subtle gold fills, icon backgrounds |
| `--gold-border` | `rgba(245,158,11,0.25)` | Gold borders |
| `--text-primary` | `#ffffff` | Primary text |
| `--text-secondary` | `rgba(255,255,255,0.65)` | Secondary text |
| `--text-muted` | `rgba(255,255,255,0.40)` | Muted text, labels |
| `--text-dim` | `rgba(255,255,255,0.25)` | Very dim text |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Subtle borders |
| `--border-strong` | `rgba(255,255,255,0.15)` | Stronger borders |
| `--border-gold` | `rgba(245,158,11,0.30)` | Gold accent borders |

**HARD RULE: No secondary accent colors (no cyan, purple, emerald, rose) on public pages. Gold only.**

For app pages: steel-blue (`#1e3a5f`) is permitted as a functional secondary only for status indicators.

### Typography

**Primary:** `Inter` (system-ui fallback) — the app layer. Clean, readable, dependable.
**Display:** `Barlow Condensed` or `Space Mono` — NOT generic Inter for editorial/public moments. Sharp, technical character.
**Signature label treatment:** `font-size: 10px; font-weight: 900; letter-spacing: 0.5em; text-transform: uppercase`

Font import (Google Fonts):
```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Inter:wght@300;400;500;600;700;900&display=swap');
```

### Surfaces

- All cards: `background: var(--bg-surface)`, `backdrop-filter: blur(20px)`, `border: 1px solid var(--border-subtle)`
- Hero sections: NeuralBackground canvas behind all content. Fixed, z-index behind all.
- Glass panels: `background: rgba(7,16,32,0.6)`, `backdrop-filter: blur(20px)`, `border: 1px solid var(--border-subtle)`
- Gold-accent cards: `border-left: 4px solid var(--gold-accent)`, `background: var(--gold-muted)`

### Motion System

**Public pages — atmospheric:**
- Page entrances: `initial: {opacity:0, y:20}` → `animate: {opacity:1, y:0}`, `duration: 0.8–1.0s`
- Card 3D hover: `whileHover: {y:-10, rotateX:5}`, `transition: spring`
- Staggered reveals: `delay: idx * 0.12s`
- Section scroll reveals: `Intersection Observer` + motion.div

**App pages — functional only:**
- Route transitions: fade only, `duration: 0.2s`
- Hover states: CSS `transition-all duration-200`
- No 3D transforms in app shell
- No staggered entrances in data tables

### Reusable Primitives

| Primitive | Surface | Notes |
|-----------|---------|-------|
| `PublicHero` | Public | Full-bleed hero with overlay + headline + CTA |
| `TacticalCard` | Public | Tall cinematic card, image BG + gradient + content |
| `EditorialSection` | Public | Text-heavy section with gold rule + heading |
| `CapabilityCard` | Public | Icon + title + description + benefits, hover expand |
| `TrustSection` | Public | Quote + gold rule + attribution |
| `ContactForm` | Public | Labeled inputs, gold focus states |
| `DataCard` | App | `bg-surface`, border, flat, no image |
| `StatusBadge` | App | Pill with status color |
| `SectionHeader` | Both | Eyebrow label + H2 |

---

## Public Site Design Direction

**Tone:** Premium, dark, strategic, structured. Editorial without being precious. Military-precise without being cartoonish.

**What it is:**
- Atmospheric dark pages with the NeuralBackground particle system as a constant presence
- Cinematic photography treatment (own or abstract — no stock)
- Editorial hierarchy with restrained gold accents
- Copy-forward — the real credentials are the design

**What it is NOT:**
- Hacker aesthetic (no green code rain, no blinking cursors for decoration)
- Fake exclusivity theater
- Vague AI imagery
- Random glowing shapes
- Generic SaaS purple-gradient-on-white

### Landing Page Redesign Notes
- Hero: Keep "Unified AI Influenced Training Interface" eyebrow + "Five Eyes / Cyber Training" H1
- Three tactical cards: Replace Unsplash with owned ttx/ and dashboard/ imagery
- Map cards to real v2 routes: Training → `/learn`, Simulations → `/ttx/sessions`, Contact → `/enterprise`
- Remove intelligence ticker (placeholder data)
- Capabilities section: Replace Unsplash, consolidate to gold accent
- Trust quote: Keep verbatim

### About Page Redesign Notes
- Hero: Keep ALL copy verbatim. Replace Unsplash BG with dark abstract treatment
- Problem section: Keep verbatim
- Who We Are section: Keep leadership credentials verbatim
- What Makes Us Different: Keep comparison grid structure

### Capabilities Page Redesign Notes
- Keep all 4 capability definitions exactly
- Upgrade from flat 2x2 to dimensional editorial layout
- Add visual depth without breaking the content

### Contact Page Redesign Notes
- Keep all copy verbatim
- Keep all form fields exactly
- Replace Unsplash hero background
- Keep gold accent on labels and CTA

---

## App Shell Design Direction

**Tone:** Tight, calm, exact, readable. More like a real operational console than a marketing page.

**Priorities:**
1. Readability at density — data must be scannable
2. Status clarity — active/inactive/error states immediately obvious
3. Structure — sidebar/header hierarchy must be crisp and navigable
4. Restraint — no public-page motion or theatrics inside the app

### Current NavShell
- Already exists at `components/layouts/NavShell.tsx` — needs visual polish pass
- Keep structure; improve hierarchy, spacing, active states

### App Color Treatment
- Same dark canvas `#050b14` as base
- Cards use `--bg-surface` not glass blur (performance + readability)
- Gold accent only for important CTAs and active states
- Status colors: emerald (complete), amber (in-progress), rose (error), white/muted (idle)

---

## Implementation Order

### Phase 3 — Public Pages (execute next)

1. Update `src/index.css` — define CSS custom properties + font import
2. Update `tailwind.config.js` — add token aliases
3. Create `src/components/NeuralBackground.tsx` — port from V1
4. Create `src/components/PublicLayout.tsx` — nav + footer + NeuralBackground wrapper
5. Create `src/pages/public/LandingPage.tsx`
6. Create `src/pages/public/AboutPage.tsx`
7. Create `src/pages/public/CapabilitiesPage.tsx`
8. Create `src/pages/public/EnterprisePage.tsx`
9. Create `src/pages/public/PrivacyPolicyPage.tsx`
10. Create `src/pages/public/TermsPage.tsx`
11. Add public routes to `src/App.tsx`

### Phase 4 — App Shell

12. Polish `NavShell.tsx` — visual pass
13. Polish `AdminDashboard.tsx` — cards, spacing, hierarchy
14. Polish `LearnDashboard.tsx` — module cards with owned images
15. TTX pages — visual refinement pass

---

## Content Rules

1. **NEVER rewrite real company copy.** Improve hierarchy and layout around it.
2. **NEVER remove the fiveeyesltd.com footer links.** Non-negotiable.
3. **NEVER invent company claims.** Use only copy from V1 source files.
4. **NEVER use Unsplash URLs in production code.** Owned assets or dark treatment only.
5. **NEVER introduce random accent colors.** Gold only on public. Steel-blue functional only in app.
