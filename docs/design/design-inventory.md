# Design Inventory — Five Eyes v2
_Generated 2026-03-22 | Phase 1 Reference Pack_

---

## Section 1 — Page Inventory

### Public (unauthenticated) — NOT YET IN V2

| Page | V1 Source | V2 Status | Priority |
|------|-----------|-----------|----------|
| `/` Landing | `LandingPage.tsx` | **MISSING** — must build | P1 |
| `/about` About | `AboutPage.tsx` | **MISSING** — must build | P1 |
| `/capabilities` | `CapabilitiesPage.tsx` | **MISSING** — must build | P1 |
| `/enterprise` Contact | `EnterpriseContactPage.tsx` | **MISSING** — must build | P1 |
| `/packages` Packages | `PackageSelection.tsx` | **MISSING** — must build | P2 |
| `/email-health-check` | `PublicEmailHealthCheck.tsx` | **OMIT** — placeholder only | — |
| `/privacy-policy` | `PrivacyPolicyPage.tsx` | **MISSING** — must port | P2 |
| `/terms-conditions` | `TermsConditionsPage.tsx` | **MISSING** — must port | P2 |
| `/login` | `LoginWithOTP.tsx` | **MISSING** — must build | P1 |
| `/register` | `Registration.tsx` | **MISSING** — must build | P2 |

### App — FUNCTIONAL IN V2

| Page | V2 File | Status |
|------|---------|--------|
| `/learn/dashboard` | `LearnDashboard.tsx` | Working |
| `/learn` | `LearnHub.tsx` | Working |
| `/learn/modules/:id` | `LearnModule.tsx` | Working |
| `/admin` | `AdminDashboard.tsx` | Working |
| `/admin/login` | `AdminLogin.tsx` | Working |
| `/admin/profile` | `AdminProfile.tsx` | Working |
| `/admin/progress` | `AdminProgress.tsx` | Working |
| `/admin/assignments` | `AdminAssignments.tsx` | Working |
| `/kb` | `KBAdmin.tsx` | Working |
| `/kb/:id` | `KBItemDetail.tsx` | Working |
| `/kb/search` | `KBSearch.tsx` | Working |
| `/kb/topics` | `TopicManager.tsx` | Working |
| `/kb/modules` | `ModuleManager.tsx` | Working |
| `/ttx/scenarios` | `TtxScenarios.tsx` | Working |
| `/ttx/scenarios/:id` | `TtxScenarioEdit.tsx` | Working |
| `/ttx/sessions` | `TtxSessions.tsx` | Working |
| `/ttx/sessions/:id/conduct` | `TtxConduct.tsx` | Working (full-screen) |
| `/ttx/sessions/:id/participate` | `TtxParticipate.tsx` | Working (full-screen) |
| `/ttx/sessions/:id/aar` | `TtxAAR.tsx` | Working |

---

## Section 2 — Component Inventory

### V2 Existing Components

| Component | File | Purpose |
|-----------|------|---------|
| `NavShell` | `components/layouts/NavShell.tsx` | Authenticated nav shell |
| `GovernancePanel` | `components/admin/GovernancePanel.tsx` | Admin KB governance |
| `ItemGovernanceDetail` | `components/admin/ItemGovernanceDetail.tsx` | KB item governance detail |

### V1 Components Worth Porting to V2

| Component | V1 Source | Port Priority | Notes |
|-----------|-----------|---------------|-------|
| `NeuralBackground` | `components/shared/NeuralBackground.tsx` | **P1** | Canvas particle system — foundational atmosphere |
| `Navbar` (public) | `components/layout/PublicMarketingLayout.tsx` | **P1** | Public nav — centered logo, split links |
| `Footer` | embedded in `PublicMarketingLayout.tsx` | **P1** | 4-column grid with fiveeyesltd.com links |
| `FiveEyesLogo` | `components/shared/FiveEyesLogo.tsx` | **P1** | Brand logo SVG |
| `PublicMarketingLayout` | `components/layout/PublicMarketingLayout.tsx` | **P1** | Wraps all public pages |

### Components to Build New in V2

| Component | Purpose |
|-----------|---------|
| `PublicNav` | Redesigned centered nav with mobile hamburger |
| `PublicFooter` | Preserve 4-col structure, polish hierarchy |
| `HeroBlock` | Reusable public-page hero |
| `TacticalCard` | Landing cinematic cards (ported + improved) |
| `CapabilityCard` | Capabilities section card |
| `ContactForm` | Enterprise contact form |
| `TrustSection` | Trust quote block |
| `NeuralBackground` | Port from V1 as-is |

---

## Section 3 — Asset Inventory

### Owned Image Assets (now in V2 `/public/assets/`)

**Dashboard module images (`/public/assets/dashboard/`):**
```
customs_data.png         cyber_essentials.png     cyber_quest.png
data_breach.png          data_privacy.png         eld_security.png
freight_fraud.png        iot_sensor.png           last_mile.png
passwords.png            phishing_defense.png     port_protocols.png
ransomware.png           remote_work.png          social_engineering.png
supply_chain.png         tactical_simulations.png
```
Status: **OWNED — use freely**

**TTX scenario images (`/public/assets/ttx/`):**
```
bec_scenario_hero.png    cargo-ship-night.png
fraudulent_transfer_alert.png    port-operations-center.png
```
Status: **OWNED — use freely**

### Missing Assets

| Asset | Current State | Action |
|-------|---------------|--------|
| Brand Design Direction.txt | Not found on disk | Provide or recreate from v1-design-summary |
| About page hero photo | Unsplash dependency | Replace with owned or brand-consistent treatment |
| Contact page hero photo | Unsplash dependency | Replace or controlled dark overlay |
| Landing card photos (3) | Unsplash URLs | Replace with owned assets or abstract dark treatment |
| Landing capability card images | Unsplash URLs | Replace with owned assets |

---

## Section 4 — Visual System Inventory

### Existing Tokens (V1 CSS Variables)

V2 has no CSS custom properties yet — only bare Tailwind config. These must be ported:

```css
/* Must define in v2 src/index.css */
--bg-canvas: #050b14          /* near-black navy */
--bg-surface: (dark surface layer)
--bg-elevated: (elevated surface)
--bg-glow: (ambient glow layer)
--text-primary: white
--text-secondary: white/60 approx
--text-muted: white/40 approx
--border-subtle: white/10
--border-strong: white/20
--gold-accent: #f59e0b
```

### Tailwind Extensions Needed

```js
// tailwind.config.js additions
colors: {
  'gold-accent': '#f59e0b',
}
fontFamily: {
  /* Add display/serif for editorial use */
}
```

---

## Section 5 — Content Preservation Inventory

### Copy to Preserve Verbatim

| Copy | Location | Status |
|------|----------|--------|
| "Unified AI Influenced Training Interface" | Landing hero eyebrow | PRESERVE |
| "Five Eyes / Cyber Training" | Landing H1 | PRESERVE |
| "Former FBI & Military Intelligence Experts Bringing Elite Security to the Logistics and Supply Chain Sector" | About H1 | PRESERVE EXACTLY |
| "Trusted by Governments. Built for Logistics. Dedicated to You." | About subhead | PRESERVE |
| "Until now, logistics firms like yours have been operating without access to the same level of protection..." | About problem | PRESERVE |
| "Your competitors are upgrading their security. Cybercriminals are probing your systems. Now is the time to act." | Contact hero | PRESERVE |
| "Security is not a product. It's a continuous operational state. Five Eyes moves your workforce from vulnerability to resilience." | Trust quote | PRESERVE |
| "Book Your Free Confidential Threat Assessment Call" | Contact CTA | PRESERVE |
| Phone: 07825 371263 | Contact | PRESERVE |
| Email: info@fiveeyesltd.com | Contact | PRESERVE |
| Four capability descriptions (Freight/Cyber/Intel/Incident) | Capabilities | PRESERVE |
| Footer nav: Platform / Company / Legal / Media | Footer | PRESERVE STRUCTURE |
| Footer links to fiveeyesltd.com/* | Footer | PRESERVE URLS |
| Legal pages (Privacy Policy, Terms) | Legal | PRESERVE CONTENT |

### Leadership Credentials (About Page)

Preserve verbatim:
- Former British Military Intelligence operatives
- Former FBI cybersecurity specialists
- Veterans of national-level cyber defence and threat operations
- Clients: AWS, Microsoft, UK government, US government

---

## Section 6 — Mobile / Responsiveness Concerns

| Issue | Severity | Notes |
|-------|----------|-------|
| V1 public nav: `hidden md:flex` with no hamburger | HIGH | V1 had this fixed in authenticated nav but not public layout |
| Landing 3-col card grid: stacks on mobile | MED | Acceptable behavior — needs visual check |
| About hero text size | MED | Large tracking text can overflow on mobile |
| Footer 4-col grid | MED | Should collapse to 2-col on mobile |
| Contact form layout | LOW | flex-row should stack on mobile — already handled in v1 |

---

## Section 7 — Known Problems in V1

| Problem | Type | V2 Action |
|---------|------|-----------|
| Unsplash images on landing cards | Visual | Replace with owned assets or dark abstract treatment |
| Unsplash images on About/Contact heroes | Visual | Replace with owned or controlled dark overlay |
| Ticker with hardcoded placeholder copy | Content | Remove unless real data feed exists |
| `SafeImage` Unsplash fallback pattern | Tech | Remove — use owned assets only |
| Email Health Check not wired | Functional | Omit in v2 phase 1 |
| No mobile nav on public layout | UX | Fix in v2 |
| Secondary accent colors (cyan/purple/emerald/rose) | Visual | Consolidate to gold-only system |
