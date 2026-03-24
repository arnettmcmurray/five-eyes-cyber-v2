# V1 Design Summary — Five Eyes Frontend

**Purpose:** V2 design handoff reference. Covers what V1 did visually, what worked, what didn't, and what to carry forward.

---

## Visual Tone

Dark military/intelligence aesthetic. Deep navy canvas (`#050b14`), gold accent (`#f59e0b`), white text hierarchy. Feels like a classified ops terminal or threat intelligence platform. Cinematic — motion entrances, parallax, glowing effects. Typography is aggressive: ultra-wide tracking, all-caps labels, font-black weights.

Secondary accent palette on landing capabilities section: cyan (TTX), purple (intel), emerald (phishing), rose (risk). These are not used consistently across the product.

---

## Layout Structure

- **Global background**: Animated `NeuralBackground` component — gold node-and-line SVG texture with radial glow from top, fixed and behind all content. Consistent across all public pages.
- **Nav**: Centered logo between two link columns. `backdrop-blur`, `bg-white/5`, `border-b border-white/10`, `rounded-b-3xl`. Floats above content. Height: 96px.
- **Footer**: 4-column grid — Platform, Company, Legal, Media. Logo + tagline left. Consistent across public.
- **Page-level layout**: Full-width sections stacked vertically. Max-width containers (`max-w-4xl` / `max-w-7xl`) centered.

---

## Landing Page Composition

1. **Hero block**: Centered vertically. Eyebrow label with flanking `h-px` dividers in gold. H1 stacked in two lines (brand name + product name). Single gold CTA button "View Packages".
2. **Three tactical cards**: 3-col grid, `h-[450px]`, `rounded-[2.5rem]`. Each card = full-bleed Unsplash photo background + gradient overlay + icon + title + label + CTA text. 3D hover (framer-motion `rotateX`). Cards are the visual centerpiece.
3. **Email audit CTA**: Centered panel — `backdrop-blur`, `border-cyan-500/20`, cyan accent. "Validate Your Defenses" section break.
4. **Intelligence ticker**: Scrolling text strip. Thin horizontal divider treatment.
5. **Capabilities cards**: 2x2 grid with image header + icon + expand-on-hover description. Per-card color accent (cyan/purple/emerald/rose).
6. **Trust quote**: Italic serif centered quote with gold rule and attribution.

---

## Card Usage

Three types across the product:

| Type | Where | Treatment |
|------|-------|-----------|
| Hero image cards | Landing (tactical 3) | Full-bleed photo BG, gradient overlay, content bottom-aligned, 3D hover |
| Capability cards | Landing bottom, Capabilities page | Image header strip + icon + text, expand-on-hover |
| Content/data cards | Internal admin/dashboard | `bg-black/40 backdrop-blur border border-white/10`, flat, no image |

---

## Imagery / Background Treatment

**Global background (NeuralBackground)**: SVG node/line pattern on `#050b14`, animated with `pulseNodes` and `moveNeural` keyframes. Radial gold glow at top center. Fixed position, behind all content. This is the foundational atmosphere.

**Hero backgrounds (About, Contact)**: Full-bleed Unsplash photo (`bg-fixed` parallax), overlaid with `#3A4E53/75 mix-blend-multiply` + gradient fade to `#2A3B3F`. Teal-shifted color grade — intentional military ops feel. Not dark navy — this is a distinct green-grey tone.

**Landing card backgrounds**: Three Unsplash photos (ops terminal, satellite earth, laptop screens). Grayscale-desaturated at rest, full-color on hover.

**Owned image assets** (`public/assets/`):
- `dashboard/` — 17 module card images (phishing, ransomware, freight_fraud, passwords, etc.)
- `ttx/` — 4 TTX scenario images (cargo-ship-night, port-operations-center, bec_scenario_hero, fraudulent_transfer_alert)

These are the only non-Unsplash imagery in the product. They are used for module cards in the learner dashboard.

---

## Strengths

- **NeuralBackground is distinctive** — immediately signals intelligence/ops platform, not generic SaaS
- **Gold accent system is tight** — single accent color used consistently for CTAs, labels, dividers, icons, form focus states
- **Landing card layout is strong** — tall cinematic cards with photo + gradient + content are the best-looking element in V1
- **About page hero copy is excellent** — "Former FBI & Military Intelligence..." headline with the teal overlay is credible and direct
- **Footer is complete** — Platform / Company / Legal / Media columns, phone, email, copyright
- **Framer Motion use is appropriate** — entrance animations and hover transforms add premium feel without being excessive
- **Typography scale** — 10px tracking-widest labels under h1/h2 headings is a signature visual detail worth keeping
- **Backdrop-blur glass panels** — used well for About/Capabilities section cards; feels premium

---

## Weaknesses

- **Unsplash dependency on landing hero cards** — stock photos that don't represent Five Eyes specifically; generic cyber imagery (server rooms, satellites)
- **Landing card images are decorative, not informational** — Operations / Intel Hub / Contact Agent labels don't map to actual platform features clearly
- **No background photo owned** — both page heroes (About, Contact) use Unsplash. No Five Eyes branded photography
- **Color accent inconsistency** — cyan/purple/emerald/rose on capability cards breaks the gold-only system used everywhere else
- **Intelligence ticker is cosmetic** — text is hardcoded placeholder copy ("RANSOMWARE VARIANT DETECTED"), no real data
- **Capabilities page is thin** — 2x2 card grid, no real depth; should carry more weight as a marketing page
- **No mobile nav** — `hidden md:flex` on nav links with no hamburger fallback
- **"Email Health Check" tool** — standalone lead-gen tool, currently not wired to anything real

---

## Preserve for V2

| Element | Notes |
|---------|-------|
| NeuralBackground | Foundational atmosphere. Keep as-is or refine. |
| Gold accent token system | `#f59e0b` + `gold-accent` everywhere. Don't introduce competing accents. |
| Navy deep canvas `#050b14` | The correct base. |
| Three-column landing hero cards | The best visual on the page. Rebuild with better images. |
| About page hero copy | "Former FBI & Military Intelligence..." — do not rewrite. |
| "Trusted by Governments..." | Subheadline. Keep verbatim. |
| Capabilities 4-area structure | Freight Security Analysis / Cyber Resilience Training / Strategic Threat Intelligence / Rapid Incident Response — keep these exact descriptions. |
| Enterprise contact form fields | firstName, lastName, email, phone, company, message, newsletter. Complete. |
| Contact urgency copy | "Your competitors are upgrading their security. Cybercriminals are probing your systems. Now is the time to act." — keep. |
| Footer structure | 4-column nav + legal + media. Complete. |
| Module card images (`dashboard/`) | 17 owned images. High-quality, topic-specific. Carry to V2 unchanged. |
| TTX scenario images (`ttx/`) | 4 owned images. cargo-ship-night, port-operations-center, bec_scenario_hero, fraudulent_transfer_alert. Use in TTX pages. |
| Typography signature | 10px font-black uppercase tracking-[0.5em] label treatment. Keep. |
| Framer Motion entrance pattern | `initial opacity:0 y:20 → animate opacity:1 y:0`. Keep. |
| Trust quote section | Quote + gold rule + attribution. Keep structure. |
| Legal pages | PrivacyPolicyPage and TermsConditionsPage — carry as-is. |

---

## Adapt for V2

| Element | Change |
|---------|--------|
| Landing hero cards | Replace Unsplash with owned imagery or brand photography. Operations/Intel Hub/Contact Agent labels should map to real product sections. |
| About page hero background | Replace Unsplash warehouse photo with Five Eyes brand photo if available; else keep but acknowledge it's placeholder. |
| Contact hero background | Same as above — Unsplash port/aerial photo is generic. |
| Capabilities page | Expand from 2x2 flat card grid to a more dimensional layout. Add real benefit depth. |
| Ticker | Wire to real data or remove. Current hardcoded placeholder is worse than no ticker. |
| Nav | Add mobile nav (hamburger) — `hidden md:flex` leaves mobile with no navigation. |
| Secondary accent colors | Consolidate cyan/purple/emerald/rose capability accents. Either justify them as a system or drop to gold-only. |

---

## Discard for V2

| Element | Reason |
|---------|--------|
| Unsplash card images (landing 3-card) | Generic. Should be replaced — preserve the card layout, not the images. |
| `PublicEmailHealthCheck` (lead-gen tool) | Not wired to real data; placeholder. Do not carry unless rebuilt properly. |
| Hardcoded ticker content | Placeholder text. Either build real feed or remove the component. |
| `SafeImage` Unsplash fallback pattern | V1 used `SafeImage` to gracefully fail Unsplash loads. V2 should use owned assets only. |

---

## Asset Inventory (to copy to V2)

```
frontend/public/assets/dashboard/
  customs_data.png         cyber_essentials.png     cyber_quest.png
  data_breach.png          data_privacy.png         eld_security.png
  freight_fraud.png        iot_sensor.png           last_mile.png
  passwords.png            phishing_defense.png     port_protocols.png
  ransomware.png           remote_work.png          social_engineering.png
  supply_chain.png         tactical_simulations.png

frontend/public/assets/ttx/
  bec_scenario_hero.png    cargo-ship-night.png
  fraudulent_transfer_alert.png    port-operations-center.png
```

These 21 images are the only owned visual assets in V1. All other imagery is Unsplash URLs.

---

## Key Copy to Preserve Verbatim

- **Hero eyebrow**: "Unified AI Influenced Training Interface"
- **Brand headline**: "Five Eyes / Cyber Training"
- **About H1**: "Former FBI & Military Intelligence Experts Bringing Elite Security to the Logistics and Supply Chain Sector"
- **Trust marker**: "Trusted by Governments. Built for Logistics. Dedicated to You."
- **Problem framing**: "Until now, logistics firms like yours have been operating without access to the same level of protection that governments and Fortune 500 companies rely on."
- **Contact urgency**: "Your competitors are upgrading their security. Cybercriminals are probing your systems. Now is the time to act."
- **Trust quote**: "Security is not a product. It's a continuous operational state. Five Eyes moves your workforce from vulnerability to resilience."
- **CTA label**: "Book Your Free Confidential Threat Assessment Call"
- **Contact phone**: 07825 371263
- **Contact email**: info@fiveeyesltd.com
