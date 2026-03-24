# Preserve vs Remove — Five Eyes V2
_Generated 2026-03-22 | Phase 1 Reference Pack_

---

## A — Preserve Exactly

These elements must appear in V2 unchanged, verbatim, or functionally identical.

### Copy / Content
- About H1: "Former FBI & Military Intelligence Experts Bringing Elite Security to the Logistics and Supply Chain Sector"
- About trust marker: "Trusted by Governments. Built for Logistics. Dedicated to You."
- About leadership credentials (MI, FBI, national cyber defence)
- About client mentions: AWS, Microsoft, UK government, US government
- About problem framing: "Until now, logistics firms..."
- Contact urgency: "Your competitors are upgrading their security..."
- Contact H1: "Contact Us"
- Contact CTA: "Book Your Free Confidential Threat Assessment Call"
- Phone: 07825 371263
- Email: info@fiveeyesltd.com
- Trust quote: "Security is not a product. It's a continuous operational state..."
- Trust quote attribution: "Director of Operations, Enterprise Client"
- Four capability titles + descriptions + benefit bullets (Freight / Cyber / Intel / Incident)
- Footer: All Rights Reserved. © 2026 Five Eyes Ltd.
- Footer tagline: "UK Transport, Logistics & Cyber Security Specialists"
- Legal pages content (Privacy Policy, Terms and Conditions)

### Navigation / Footer Structure
- Footer 4-col grid: Platform / Company / Legal / Media
- Footer Media links to fiveeyesltd.com/five-eyes-blog, fiveeyesltd.com/, fiveeyesltd.com/media
- Footer Company links: About, Contact
- Footer Legal links: Privacy Policy, Terms & Conditions
- Footer Platform links: Capabilities, Packages
- Executive/company footer path to fiveeyesltd.com — **NON-NEGOTIABLE**

### Visual System
- Deep navy base: `#050b14`
- Gold accent: `#f59e0b` as single primary accent throughout public site
- NeuralBackground canvas particle system with gold node/line animation
- Typography signature: 10px font-black uppercase tracking-[0.5em] label treatment
- Framer Motion entrance pattern: `initial opacity:0 y:20 → animate opacity:1 y:0`
- Three-column landing hero card layout (tall cinematic cards)

### Image Assets
- `/public/assets/dashboard/` — all 17 module images
- `/public/assets/ttx/` — all 4 TTX scenario images

### Functional
- Enterprise contact form fields: firstName, lastName, email, phone, company, message, newsletter
- Enterprise contact form submission flow
- Legal pages (route + content)

---

## B — Adapt Carefully

These elements are structurally correct but need visual or content improvement.

### Landing Hero Cards (3-card)
- KEEP: tall cinematic card layout, 3-col grid, 3D hover transform
- KEEP: gold icon + label + CTA arrow treatment
- CHANGE: Replace Unsplash photos with owned assets (ttx/, dashboard/) or abstract dark treatment
- CHANGE: Labels "Operations / Intel Hub / Contact Agent" — update to map to actual v2 routes

### About Hero Background
- KEEP: full-bleed parallax hero format, teal-shifted dark overlay tone, white text on dark
- CHANGE: Replace Unsplash warehouse photo. Use owned image if available; else dark branded treatment

### Contact Hero Background
- KEEP: same format and urgency copy
- CHANGE: Replace Unsplash port photo. Same treatment as About.

### Capabilities Page Layout
- KEEP: 4-area structure, 2x2 grid, benefit bullet lists, gold icon treatment
- CHANGE: Expand from thin flat cards to more dimensional layout with better depth and editorial weight

### Navigation (Public)
- KEEP: centered logo concept, split-link layout, backdrop blur
- CHANGE: Add proper mobile hamburger (hidden md:flex is not sufficient)
- CHANGE: Increase visual precision — cleaner borders, tighter tracking, gold active indicator

### Intelligence Ticker
- KEEP: only if connected to real data — otherwise remove entirely
- V2 default: REMOVE (hardcoded placeholder is worse than nothing)

### Capability Cards on Landing (Bottom Section)
- KEEP: expand-on-hover grid behavior, icon + description format
- CHANGE: Replace Unsplash images. Use owned logistics/supply chain imagery or abstract dark treatment
- CHANGE: Consolidate to gold accent only (remove cyan/purple/emerald/rose per-card accents)

---

## C — Discard / Remove

These elements must not appear in v2 under any circumstance.

| Element | Reason |
|---------|--------|
| Unsplash image URLs in code | Generic stock; replace with owned assets or dark treatment |
| `SafeImage` Unsplash fallback component | Designed around Unsplash; remove entirely |
| Intelligence Ticker with hardcoded copy | Placeholder is misleading. Remove unless real data exists |
| `PublicEmailHealthCheck` standalone tool | Not wired to real data in v1; not in v2 scope for phase 1 |
| OracleChatPage and floating AI chat widget | Removed in v2 design explicitly |
| SecurityGame | Descoped from v2 |
| OpFlowWrapper | Descoped from v2 |
| Secondary accent colors on capability cards (cyan/purple/emerald/rose) | Breaks gold-only system |

---

## D — Placeholder / Problem Areas

| Area | Problem | Required Action |
|------|---------|-----------------|
| Landing card images | All 3 are Unsplash URLs | Replace before ship |
| About page hero | Unsplash URL | Replace or controlled dark overlay |
| Contact page hero | Unsplash URL | Replace or controlled dark overlay |
| Landing capability card images | 4x Unsplash URLs | Replace with owned module imagery |
| Brand Design Direction.txt | File not found | User to provide or derive from v1-design-summary |
| V2 has no public pages | App routes to /learn/dashboard | Must build all public routes in Phase 3 |
| V2 has no CSS token system | Only bare Tailwind | Must define tokens in src/index.css |
| V2 tailwind.config missing gold-accent | Only `gold.DEFAULT` | Must add `gold-accent` alias |

---

## E — Mobile / Responsiveness Concerns

| Area | Issue | Priority |
|------|-------|----------|
| Public nav mobile | No hamburger on V1 public layout | HIGH — fix in v2 |
| Landing hero cards | 3-col collapses to 1 on mobile | MED — test and verify |
| About hero text | Large tracking typography on narrow viewport | MED — cap font size on mobile |
| Footer grid | 4-col must collapse gracefully | MED — 2-col or stacked on mobile |
| Contact form | Should stack to single column on mobile | LOW — already handled in v1 |
| Capabilities 2x2 grid | Should stack to 1-col on mobile | LOW — standard behavior |
