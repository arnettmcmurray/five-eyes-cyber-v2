# Screenshot Checklist — Five Eyes V2
_Generated 2026-03-22 | Phase 5 QA_

---

## QA Pass Results

### Mobile Nav
- [x] Public nav has hamburger button (`Menu` icon from lucide-react)
- [x] Mobile drawer uses `AnimatePresence` + `motion.div` for animation
- [x] Drawer renders all nav links + Access Terminal CTA
- [x] Drawer closes on link click (`setOpen(false)`)
- [x] `hidden md:flex` only hides desktop links, not the hamburger

### Footer Links
- [x] Footer renders 4 columns: Platform / Company / Legal / Media
- [x] Platform links: `/capabilities`, `/packages`
- [x] Company links: `/about`, `/enterprise`
- [x] Legal links: `/privacy-policy`, `/terms-conditions`
- [x] Media links: `fiveeyesltd.com/five-eyes-blog`, `fiveeyesltd.com/`, `fiveeyesltd.com/media`
- [x] Media column uses `<a target="_blank">` for external links
- [x] Executive/company footer path: **VERIFIED — fiveeyesltd.com links present**

### Copy Preservation
- [x] About H1: "Former FBI & Military Intelligence Experts..." — VERIFIED
- [x] About trust marker: "Trusted by Governments. Built for Logistics. Dedicated to You." — VERIFIED
- [x] Contact urgency: "Your competitors are upgrading their security..." — VERIFIED
- [x] Contact phone: 07825 371263 — VERIFIED
- [x] Contact email: info@fiveeyesltd.com — VERIFIED
- [x] Trust quote: "Security is not a product..." — VERIFIED
- [x] Contact CTA: "Book Your Free Confidential Threat Assessment Call" — VERIFIED
- [x] Capabilities: All 4 titles and descriptions — VERIFIED
- [x] Legal pages: Company Number 16616326, Wenlock Road address — VERIFIED
- [x] Legal pages: Privacy Policy and Terms full content — VERIFIED

### No Stock Placeholders
- [x] ZERO Unsplash URLs in new public pages — VERIFIED
- [x] Landing tactical cards use owned `/assets/ttx/` images
- [x] Capability cards use owned `/assets/dashboard/` images
- [x] Intelligence ticker: REMOVED (placeholder copy not carried forward)
- [x] No `SafeImage` component dependency in v2

### Routes
- [x] `/` → LandingPage (via PublicLayout)
- [x] `/about` → AboutPage
- [x] `/capabilities` → CapabilitiesPage
- [x] `/enterprise` → EnterprisePage
- [x] `/privacy-policy` → PrivacyPolicyPage
- [x] `/terms-conditions` → TermsPage
- [x] `/admin/login` → AdminLogin (standalone, no layout)
- [x] `/admin` → AdminDashboard (via NavShell)
- [x] `/learn/dashboard` → LearnDashboard (via NavShell)
- [x] `/ttx/sessions/:id/conduct` → TtxConduct (full-screen, no shell)
- [x] `/ttx/sessions/:id/participate` → TtxParticipate (full-screen, no shell)
- [x] `*` → redirect to `/` (not `/learn/dashboard` like before — correct for public-first)

### Build
- [x] TypeScript compile: PASS
- [x] Vite build: PASS
- [x] Zero type errors in new files
- [x] Pre-existing TtxConduct.tsx `titles` bug fixed → `prompts`

---

## Screenshots To Capture (manually)

Label each by reason, save to `design_refs/`:

| Screenshot | Filename | Location |
|-----------|----------|----------|
| Landing hero + cards | `landing/01-landing-hero-tactical-cards.png` | `/` |
| Landing capabilities | `landing/02-landing-capabilities-gold.png` | `/#features` |
| Landing trust quote | `landing/03-landing-trust-quote.png` | scroll down |
| Public nav desktop | `landing/04-nav-desktop-centered.png` | top of any page |
| Public nav mobile | `landing/05-nav-mobile-hamburger.png` | < 768px viewport |
| Footer company path | `landing/06-footer-fiveeyesltd-links.png` | footer |
| About hero | `about/01-about-hero-fbi-headline.png` | `/about` |
| About comparison grid | `about/02-about-what-makes-different.png` | scroll |
| Capabilities page | `about/03-capabilities-4-card-grid.png` | `/capabilities` |
| Contact form | `contact/01-contact-form-gold.png` | `/enterprise` |
| Admin shell | `admin/01-admin-nav-dark.png` | `/admin` |
| Admin dashboard | `admin/02-admin-control-center.png` | `/admin` |
| Learn dashboard | `app-shell/01-learn-dashboard-module-grid.png` | `/learn/dashboard` |
| Legal page | `about/04-privacy-policy.png` | `/privacy-policy` |

---

## Outstanding Items

| Item | Status | Notes |
|------|--------|-------|
| `/packages` page | NOT BUILT | V1 `PackageSelection.tsx` not ported — no route in v2 yet |
| `/login` page | NOT BUILT | Learner OTP login not routed publicly |
| `/register` page | NOT BUILT | Not in v2 scope yet |
| Brand Design Direction.txt | NOT FOUND | User to provide if needed |
| Landing card images on mobile | NOT TESTED | Needs browser verification |
| About leadership list on mobile | NOT TESTED | Needs browser verification |
| Contact form submission | NOT WIRED | Currently client-side only (no backend endpoint) |

---

## Notes

- Public root `/` now lands on LandingPage (not `/learn/dashboard` redirect)
- All app routes require manual auth — no change to auth logic
- TtxConduct.tsx pre-existing bug fixed in this pass (`.titles` → `.prompts`)
