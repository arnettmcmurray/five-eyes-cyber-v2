# Five Eyes — Layout & Style Strategy
_Planning pass: 2026-03-23 | Planning mode only — no code_

---

## 1. Shared Design System Direction

### Typography Scale

| Level | Font | Size | Weight | Letter Spacing | Use |
|-------|------|------|--------|---------------|-----|
| H1 | Barlow Condensed | 56–72px | 700 | -0.01em | Public hero headlines only |
| H2 | Barlow Condensed | 36–48px | 600 | 0 | Public section headers, TTX phase titles |
| H3 | Inter | 20–24px | 600 | 0 | App section headers, card titles, modal titles |
| H4 | Inter | 16px | 600 | 0 | Subsection labels, sidebar group headers |
| Body | Inter | 14–15px | 400 | 0 | All prose, descriptions, learner content |
| Label | Inter | 10px | 900 | 0.5em | Signature uppercase labels, tier badges, status chips |
| Caption | Inter | 12px | 400 | 0.02em | Meta info, timestamps, secondary row data |
| Code | Monospace (system) | 13px | 400 | 0 | KB content, scenario injects, code blocks |

**Rule:** Barlow Condensed stays strictly on public pages and TTX phase headers. Inter is the app font everywhere else. Do not let Barlow Condensed bleed into learner or admin UI.

### Spacing Rhythm

Base unit: 4px. All spacing is multiples of 4.

| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | Icon gaps, inline badge padding |
| sm | 8px | Compact row padding, list item gaps |
| md | 16px | Card inner padding, form field gaps |
| lg | 24px | Card gutters, section sub-groupings |
| xl | 40px | Major section dividers within a page |
| 2xl | 64px | Between full-width sections (public pages) |
| 3xl | 96px | Hero section vertical breathing room (public only) |

App shells breathe at md/lg. Public pages breathe at xl/2xl/3xl. TTX shell is compact — md throughout, no decorative spacing.

### Color Hierarchy — Priority Order

1. **Gold** (`--gold-accent`) — primary CTAs, active nav item, key metric values in KPI cards, progress indicators, scenario stage markers, checkpoint correct-answer indicators, tier badge for highest tier
2. **Gold-muted** (`--gold-muted` fill + `--gold-border` border) — card hover states, focused form fields, selected items, featured/highlighted cards
3. **Steel-blue** `#1e3a5f` — functional status only: "in session", "active", "connected" states. Never decorative
4. **White** (`--text-primary`) — all body text, headings in app
5. **Secondary/muted** — metadata, captions, placeholder text
6. **Destructive** (red, system default) — error states, access revoked badge, wrong-answer indicator — use sparingly, never styled as brand color

Gold does NOT appear on every element. Its scarcity creates signal value. When in doubt: white text and a subtle border, not gold.

### Surface Hierarchy

- `--bg-canvas` (#050b14): the page itself. Nothing sits behind this.
- `--bg-surface` (#071020): cards, sidebar, table rows, module cards. The default "raised" layer.
- `--bg-elevated` (#0a1830): modals, dropdowns, tooltips, KB help panel when open, popovers. Always floats above surface elements.

**Rule:** Never place canvas-level content on an elevated surface. Never skip a layer. Exception: TTX full-screen views operate on canvas directly by design.

### Card Taxonomy

| Card Type | Background | Border | Use |
|-----------|-----------|--------|-----|
| Standard | --bg-surface | --border-subtle | Default content cards, learner modules, KB items |
| Featured | --bg-surface | --gold-border | Highlighted modules, recommended content |
| Elevated | --bg-elevated | --border-strong | Modals, detail panels, KB help panel |
| Stat/KPI | --bg-surface | --border-subtle | Admin dashboard metrics |
| Inert/Locked | --bg-surface at 50% opacity | --border-subtle dashed | FreeTierGate blocked content, disabled modules |
| Operational | --bg-elevated | --border-strong | TTX inject cards, decision cards — dense, no decoration |

### Motion Philosophy

**Public shell:**
- Entry: `opacity 0 → 1` with `translateY(16px → 0)`, duration 400ms, ease-out
- Stagger: 60–80ms per element in reveal sequences
- Hover: spring-style scale `1 → 1.015` on cards, 200ms
- NeuralBackground: always on, ambient only — mouse interaction subtle, not distracting

**App shell (learner + admin):**
- Transitions: opacity fade 200ms ease, no transforms
- Hover: background color shift only, 150ms
- Active states: immediate (no transition delay)
- No entrance animations in app — content loads in place
- Exception: module flow step transitions use a 250ms horizontal slide to reinforce forward-only directionality

**TTX shell:**
- No entrance animations
- State changes: 150ms fade only
- Inject arrivals: brief pulse on new inject card (single pulse, not loop)
- No ambient motion — operational register demands stillness

### Background Philosophy

**NeuralBackground (canvas particle network):**

| Shell | Use NeuralBackground? | Reason |
|-------|-----------------------|--------|
| Public | YES — every page | Environmental brand signature, renders fixed/full-viewport behind all content |
| Learner | NO | Content-dense, reading-focus. Canvas animation competes with cognitive tasks |
| Admin | NO | Data-density environment. No ambient animation |
| TTX | NO | Operational focus. Full-screen environment is its own visual register |

The NeuralBackground is a public-facing brand signal only. Its absence in the app is intentional contrast — crossing the login threshold means entering the product proper.

### Status and Badge Language

| State | Color | Use |
|-------|-------|-----|
| Active / In Session | Steel-blue filled chip | TTX sessions, live admin status |
| Completed | Muted white outline chip | Module progress, TTX AAR |
| In Progress | Gold-muted fill, gold dot | Module cards, learner dashboard |
| Locked / Blocked | Dashed outline, muted text | FreeTierGate, restricted modules |
| Access Granted | White outline chip | Admin learner table |
| Access Revoked | Red filled chip (system) | Admin learner table |
| Tier: Free | Muted text chip | Learner table, profile |
| Tier: Individual | White chip | Learner table, profile |
| Tier: Professional | Gold-muted fill chip | Learner table, profile |
| Tier: Enterprise | Gold fill, dark text | Learner table, profile — highest tier, most prominent |

Tier badges escalate in visual weight from Free (least) to Enterprise (most). This creates a visible aspiration gradient.

---

## 2. Public Shell Layout Strategy

### Navigation

- Fixed top, full-width, `--bg-canvas` background with 1px `--border-subtle` bottom border
- Scrolled state: subtle backdrop blur (no solid color change)
- Layout: centered FiveEyesLogo flanked by nav links — Left: Platform, Capabilities, About | Right: Packages, Enterprise, Login | Far right: "Request Access" gold-filled CTA button
- Active states: 2px gold underline beneath active link only. No background fill.
- Mobile ≤768px: hamburger → full-viewport overlay, `--bg-canvas`, links stacked vertically centered. NeuralBackground continues to render behind open menu. Close via X or outside tap. No drawer — full overlay only.

### Footer

- Desktop: 4-column grid | Tablet: 2-column | Mobile: stacked
- Columns: Platform / Company / Legal / Media
- Above columns: full-width `--border-subtle` rule, then logo left + tagline right
- Below columns: copyright line, centered, caption, muted
- fiveeyesltd.com links preserved exactly

### Hero Strategy

| Type | Pages | Height | Headline Font |
|------|-------|--------|--------------|
| Full-bleed | LandingPage only | 100vh | H1 Barlow Condensed, max scale |
| Compact | About, Capabilities, Enterprise, Packages | padding 3xl 0 | H2 Barlow Condensed |
| None | Privacy, Terms | — | H3 Inter, content begins immediately |

NeuralBackground renders on all three types — subdued via gradient overlay on content-heavy pages.

### Page-by-Page Layout Intention

**LandingPage:** Full-bleed hero → feature highlights (alternating 2-col rows) → trust/credibility band (text-only, no fake logos) → CTA section → footer. Sections breathe at 2xl.

**AboutPage:** Compact hero → 2-col split (mission left, body right) → founders/background section (text-only or owned imagery) → CTA band → footer.

**CapabilitiesPage:** Compact hero → 3-col capability card grid (icon, H4 title, body) → 2-col feature callout for KB and TTX → CTA → footer.

**EnterprisePage:** Compact hero → bold headline callout → feature list (icon + text rows) → contact section → footer.

**PackagesPage:** Compact hero → tier comparison (3–4 card grid: Free, Individual, Professional, Enterprise) → FAQ accordion → CTA → footer. Cards visually escalate using tier badge weight system.

**LoginPage / RegisterPage:** No hero. Centered `--bg-elevated` card on canvas, NeuralBackground behind. Logo, form, single CTA, link to the other page.

**Privacy / Terms:** No hero. Constrained content block (~720px), Inter body, H4 section headers. NeuralBackground present but recessive.

### NeuralBackground Integration

Rendered once, fixed position, full viewport, z-index 0. All public content at z-index 1+. Does not re-mount between route changes — persistent for public shell session lifetime. On content-heavy pages (legal): subtle dark gradient overlay reduces contrast competition without removing the background.

### Image / Asset Treatment

No Unsplash. Priority order:
1. Owned assets from `/public/assets/` (ttx/, dashboard/ subdirectories)
2. Dark geometric/abstract SVG compositions
3. Strong typographic sections (intel-brief aesthetic) — preferred fallback

Where photography would appear: dark overlay panel with a quote or data point. If owned photography becomes available later: `brightness(0.6) contrast(1.1)` + subtle gold tint overlay.

---

## 3. Learner Shell Layout Strategy

### Dashboard

- Desktop: module card grid (3-col) with optional right sidebar
- Tablet: 2-col grid, no sidebar
- Mobile: 1-col
- Module card: owned image (16:9 crop, `brightness(0.7)` overlay), title in H4, tier badge, description in caption, progress bar (horizontal, gold fill, not circular)
- In-progress modules: Featured card (gold border)
- Locked modules: Inert card (50% opacity, dashed border)

### Module Flow Visual Hierarchy

**Overview:** Full-width. Module image banner at top. Metadata row (tier, time, topics). Body in Inter. Reference materials as compact horizontal card row at bottom. "Start Module" CTA gold-filled at bottom.

**Briefing task:** Constrained width (~720px), centered, reading-focused. KB Help panel collapsed to right-side pull-tab by default. Pull-tab label: "References" in signature label style.

**Checkpoint:** Full-width center-constrained. Question prominent. Answer options as stacked `--bg-surface` bordered buttons — selected state: `--gold-muted` fill. Submit: gold-filled. After submit: correct shows green system indicator, wrong shows red + remediation cards below. Forward button appears only after answering.

**Debrief:** Same layout as briefing task. Summary text, key takeaways bulleted. KB Help panel available. "Complete Module" or "Next Module" CTA at bottom.

Step transitions: 250ms horizontal slide reinforces forward-only directionality.

### KB Help Panel

- Trigger: right-side pull-tab on briefing and debrief screens only (NOT checkpoint)
- Tier gate: Free tier sees pull-tab but gets inline FreeTierGate prompt on click
- Open state: right panel ~340px, `--bg-elevated`, `--border-strong` left edge. Search input top, results list below. Each result: title (Inter 14px semi-bold), excerpt (caption), topic chips.
- Desktop: overlays content with dim backdrop
- Mobile: full-width overlay from bottom
- Collapsed: thin vertical strip with "References" label rotated 90°

### Remediation Cards

- Appear directly below checkpoint question after wrong answer
- Standard card, compact, gold 3px left border accent
- Contents: KB item title, 2-line excerpt, topic tag chips
- Multiple cards stack vertically if multiple KB items mapped

### Reference Materials (Module Overview)

- Horizontal scrollable row at bottom of overview screen
- Compact cards: title + type label chip (FAQ / Glossary / Policy / Threat Brief)
- Clicking any card opens in an elevated modal overlay

### FreeTierGate

- Inert card overlay on locked content
- Lock icon (gold), short explanation, single gold CTA ("Upgrade Access" or "Contact Enterprise")
- Underlying content: visible but desaturated and blurred behind gate. Intentional — show what they're missing.

### NavShell in Learner Context

- Sidebar nav: Dashboard, My Modules, Help/Support
- No admin items
- User profile + tier badge in sidebar footer
- Theme toggle in topbar
- Sidebar collapses to icon-only on smaller screens
- Back-to-public: subdued, caption, muted color — sidebar footer

---

## 4. Admin Shell Layout Strategy

### KPI Cards

- 4-card row at top of AdminDashboard
- Standard card type, `--bg-surface`
- Contents: metric label (signature label style), metric value (H3 Inter), secondary descriptor (caption)
- Live status: small dot — steel-blue for live/active, muted for offline
- No icons — value is the visual anchor

### Learner Table

- Full-width on AdminProgress
- Columns: Learner name, email, tier badge, access status, last active, actions
- Tier badge follows escalation system
- Action column: compact ghost button group (Grant / Revoke) — not gold-filled to avoid noise in data-dense rows
- Row hover: `--gold-muted` background, subtle

### Groups Tab

- Tab component: Inter 14px, active tab with gold underline (same pattern as public nav)
- Content: group name, member count, assigned modules — informational, less dense than learner table

### KB Admin Pages

**KBAdmin (list):** Full-width table. Columns: title, type chip (signature label), topics, last updated, icon-button actions. Row height: compact 32px. Above: search left, "New Item" gold-filled right.

**KBItemDetail (editor):** 2-col layout. Left (~65%): title input, content textarea (monospace for KB content), topic multi-select. Right (~35%): `--bg-elevated` metadata panel — type selector, linked modules, publish status. Save button gold-filled in right-column footer.

### TTX Admin Pages

**TtxScenarios (list):** Same table pattern. Columns: scenario name, tier requirement, session count, status, actions.

**TtxScenarioEdit:** Three sections:
1. Top: scenario metadata form (title, description, tier, objectives)
2. Middle: inject/step sequence — vertical ordered list of Operational cards with drag-handle affordance
3. Bottom: KB Refs panel — horizontally scrollable compact KB item cards. "Add KB Ref" opens search modal.

### NavShell in Admin Context

- Sidebar nav groups (with signature label section headers): Overview, Learners, Knowledge Base, TTX
- Admin badge in sidebar footer to distinguish from learner session
- Same NavShell component, different nav manifest

### Light Mode

Light mode (via theme toggle) inverts surfaces: canvas → #f8f9fa, surface → #ffffff, elevated → #f0f1f3. Gold accent remains gold. Text inverts to near-black. Steel-blue status remains. Dark mode is the primary design register — implement and stabilize dark before touching light.

---

## 5. TTX Shell Layout Strategy

### Full-Screen Conduct View (Facilitator)

No NavShell. Custom minimal topbar: scenario title left (H4 Inter), session status chip center (steel-blue "In Session"), facilitator controls right (Pause / End Session ghost buttons + timer).

Two-panel layout:
- Left (~60%): Active inject card (Operational type, large). Inject title H3, body Inter, type label in signature label style. Below: previous injects collapsed (caption, muted). Navigation: "Previous Inject" ghost left, "Next Inject" gold right.
- Right (~40%): Participant status list — compact, `--bg-elevated`, `--border-strong` left edge.

### Full-Screen Participate View (Learner/Participant)

No NavShell. Custom minimal topbar: scenario title left, session status chip, participant name/role right.

Main area: decision timeline. Central vertical timeline of inject cards. Active inject: full-width Operational card, prominent. Past injects: collapsed single-line with muted checkmark. Decision input directly below active inject.

Right side panel (~320px): KB Reference Material, `--bg-elevated`, collapsible. Contains KB items from TtxScenarioEdit refs — title, excerpt, topic chips. No FreeTierGate here — TTX itself is the gate.

### AAR View

Uses NavShell (navigation context back to admin/learner shell). KPI-card-style summary row at top. Below: sequential inject replay — Operational cards with participant responses indented below each. Export/Print ghost button top-right.

### TTX Visual Register

No gold decorative elements. No card hover effects. No ambient motion. Borders: `--border-strong` throughout (not `--border-subtle`). Text slightly denser. The inject card is the primary object — everything else secondary. Command briefing environment, not a learning app.

### Access-Blocked Screen

Full-screen centered panel, `--bg-canvas`. No NeuralBackground. Lock icon in muted white (not gold — this is a hard stop, not a CTA). Short copy stating tier requirement. Two ghost buttons: "Return to Dashboard" and "Contact Enterprise". Communicates finality, not upsell.

---

## 6. Future Styling Execution Order

### Batch 1 — Token Foundation (prerequisite for all)
Verify and finalize CSS variables in `src/index.css`. Confirm typography loaded (Inter + Barlow Condensed). Confirm Tailwind config reflects token values. Nothing else styled until tokens are stable.

### Batch 2 — Public Shell
**Priority: highest.** Public is the product's front door and most self-contained shell. Validates NeuralBackground, Barlow Condensed editorial voice, and atmospheric motion without app interference.

Order within batch: PublicLayout + NeuralBackground → Nav + Footer → LandingPage hero → About → Capabilities → Packages → Enterprise → Login/Register → Legal.

### Batch 3 — NavShell + Shared App Components
The shared container must be styled before either app shell. Includes: sidebar structure, nav item styles, topbar, theme toggle, sidebar footer. Also: shared card components, badge/chip components, status indicators, button variants (filled gold, ghost, destructive).

### Batch 4 — Learner Shell
After NavShell is stable. Most complex functional flows — visual hierarchy in the module flow requires careful execution. Order: LearnDashboard → LearnModule (full flow) → FreeTierGate → KB Help panel.

### Batch 5 — Admin Shell
After Learner shell. Data-dense but visually simpler. Order: AdminDashboard (KPI cards) → AdminProgress (learner table + badge system) → KB admin pages → TTX admin pages (TtxScenarioEdit last — most complex).

### Batch 6 — TTX Shell
Last. Most visually isolated, no shared styling dependencies beyond tokens. Order: TtxConduct → TtxParticipate → TtxAAR → access-blocked screen.

### Parallelization Opportunities
- Public shell (Batch 2) is independent of NavShell (Batch 3) — can run in parallel with two developers
- TTX shell (Batch 6) is independent of Admin after tokens are stable — can overlap with late Admin work

---

## 7. Stitch Strategy

### What Stitch Is

Stitch generates visual mockups and screen variants from text prompts. The risk for Five Eyes: without constraints, Stitch defaults to a generic SaaS aesthetic (purple gradients, glassmorphism, excessive rounded corners) that directly contradicts the established visual register. Use Stitch selectively and with tight constraints.

### How to Constrain Stitch for Five Eyes

Every Stitch prompt must explicitly include:

```
Background: #050b14 (deep midnight navy). No gradients on background.
Accent: #f59e0b amber/gold only. No cyan, purple, emerald, or rose.
Fonts: Inter for UI text. Barlow Condensed for headlines only.
Surfaces: #071020 cards, #0a1830 elevated panels.
Tone: "premium intelligence-grade cybersecurity platform. Military-precise. Editorial. Not SaaS. Not hacker aesthetic. No glow effects. No glassmorphism. No excessive rounded corners."
Color swatch: canvas #050b14, surface #071020, elevated #0a1830, gold #f59e0b, text white.
```

Always provide specific component names from the real product to anchor generated layouts to real structure.

### Which Screens to Run Through Stitch

| Screen | Priority | Reason |
|--------|----------|--------|
| LandingPage hero | 1 | Highest visual ambiguity, most benefit from variants |
| PackagesPage tier cards | 2 | Tier escalation layout complex to design abstractly |
| LearnDashboard module grid | 3 | Owned image integration + progress indicators |
| AdminDashboard KPI cards | 4 | Density and layout benefit from quick visual variants |
| TtxParticipate full-screen | 5 | Decision timeline layout novel enough to warrant mockup |

**Do NOT run through Stitch:** LoginPage (simple form), legal pages, module flow checkpoint/debrief (too logic-coupled), TtxConduct (too operationally specific).

### What Stitch Output to Accept vs Override

**Accept:** Spatial layout decisions (grid vs list, column widths, panel proportions), typographic hierarchy demonstrations, card layout structure.

**Override immediately:**
- Any color not in the defined token set
- Any gradient background
- Any font other than Inter or Barlow Condensed
- Any glassmorphism or blur treatment
- Corner radius >6px on functional elements
- Any animation description involving 3D transforms or continuous loops

The Stitch output is a **spatial reference only**. It is never a final design. The implementation developer interprets the layout intent, not the visual details.

### Using Stitch for Public Shell Only

Public shell is the best Stitch use case — most visual latitude, least functional coupling. For LandingPage: run 2–3 variants with different hero treatments:
1. Full-bleed text-only
2. Text + abstract geometric element
3. Text + owned image with dark overlay

Evaluate each variant: would the layout work without the NeuralBackground particle network? Stitch cannot render canvas animations — the layout must not depend on it structurally.

Keep app shells (learner, admin, TTX) manually controlled. NavShell, module flow, and data tables have too much functional specificity to benefit from Stitch exploration.

### Review Criteria Before Stitch Output Goes to Code

Before any Stitch output moves to implementation, verify:

1. All colors match defined token values exactly — no approximations
2. No decorative elements not present in this strategy document
3. Typography hierarchy matches the scale in Section 1
4. Surface layering is correct (canvas → surface → elevated, no skipped layers)
5. Motion implied is consistent with motion philosophy for that shell
6. No component represents a feature or flow that does not exist in the actual product
7. For public pages: layout works without NeuralBackground (background is enhancement, not structural)

If Stitch output fails more than two criteria: discard and re-prompt with tighter constraints. Do not try to fix a failing mock.

---

## Key Files for Implementation

| File | Role |
|------|------|
| `src/index.css` | CSS token definitions — source of truth, start here |
| `tailwind.config.js` | Token bridge to Tailwind utilities — verify before any component styling |
| `src/components/layouts/NavShell.tsx` | Shared app shell — must be styled before any app-shell page work |
| `src/components/PublicLayout.tsx` | Public shell wrapper with NeuralBackground — entry point for public styling |
| `src/components/NeuralBackground.tsx` | Canvas particle network — verify integration before public page work |
| `src/pages/LearnModule.tsx` | Most complex functional page — highest-risk styling execution in learner shell |
| `src/pages/TtxParticipate.tsx` | Full-screen operational view — validate Stitch mockup here before coding |
