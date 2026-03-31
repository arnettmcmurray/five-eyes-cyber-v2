https://vscode.dev/github/arnettmcmurray/five-eyes-cyber-v2/blob/main7-4a46-a6d9-a0ad4d865c07

Five Eyes Demo Base Plan
For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

Goal: Build the strongest honest demo from what already exists — stable auth, clean learner journey through 3 solid modules, rich Study Material surface, one clear admin path, and public frontend that only claims what the app can show.

Architecture: KB-first content platform with OTP learner auth, password admin auth, and a static+dynamic study material surface. AI chat is paid-tier only, KB-grounded. TTX framework exists but is demo-thin and should not be the centerpiece.

Tech Stack: React/Vite (frontend), Express/Node (backend), PostgreSQL + pgvector (DB), Drizzle ORM, Docker Compose (DB + Mailpit), Claude Haiku (KB-grounded chat)

Context
The previous session fixed the critical infrastructure issues (Mailpit, AdminGuard, session handling). The platform is now structurally sound. This plan addresses what to show, what to say, and what to build next — in that order.

The honest state of the product:

T1/T2/T3 are solid, seeded, and ready
T4/T5 are seeded but less battle-tested
Study Material (9 chapters, 30+ topics) is fully authored as static frontend data in src/data/studyMaterial.ts — it is the richest surface in the product
The public site over-promises on service capabilities (FBI/military, on-call response, threat briefings) that are company-level credentials, not app-native features
GET CYBER SMART v2 exists in docs/ but is not integrated
A. Demo Base Plan
What to show in the demo
Surface What to demonstrate Status
Learner login (OTP) /login → OTP → /learn/dashboard ✅ Fixed
Module list 3 modules visible, progress states ✅ Seeded T1–T3
Module flow T1 full run: briefing → checkpoint → debrief ✅ Ready
Study Material library /learn/library → 9 chapters → article deep-dive ✅ Rich
KB-grounded chat Ask a question, get KB-sourced answer ✅ Works (needs ANTHROPIC_API_KEY)
Admin login (password) /admin/login → /admin dashboard ✅ Fixed
Admin KB view /kb → items, topics, modules ✅ Ready
Admin progress /admin/progress → learner completion data ✅ Ready
What NOT to show in the demo
Surface Why not
TTX platform Only 1 bootstrap scenario; framework works but content is thin
Phishing simulator Not built
Quarterly threat briefings Service promise, not app feature
On-call incident response Service promise, not app feature
Security game Fun but not core to the value proposition
T4/T5 modules Less tested; save as "next cohort" content
B. Scope Corrections
Study Material is not a gap — it is the product's strongest surface. 9 chapters, 30+ topics, fully authored, with professional depth. It should be positioned as the "Cyber Security Learning Material" reference library and demonstrated first in the learner path.

The module count on the public site says "3 Training Modules: Phishing · BEC · MFA" — this is accurate for T1-T3 and does not need to be inflated. T4/T5 exist but should be shown as the roadmap, not the demo.

GET CYBER SMART v2 is Darren's (the client's) book. It is in docs/kb-content/GET CYBER SMART v2.0.docx but not integrated. It should be read and used to fill in cyber foundation gaps in the Study Material chapters, particularly around: network security basics, zero-trust principles, cloud hygiene, and incident reporting patterns. Do not replicate logistics specificity that already exists — use it for foundational broadening only.

AI is correctly scoped. Chat is paid-tier only, KB-grounded, Claude Haiku, 500-token limit. This is honest and defensible. Do not expand AI surface for the demo.

TTX is not ready for demo. The framework is solid (scenarios, sessions, conduct, participate, SSE). But 1 scenario is too thin to show confidently. Defer TTX demo to after the demo base is stable.

C. Priority Fix List
These are ordered. Do not skip ahead.

P0 — Pre-demo blockers (must be done before any demo)
Confirm bootstrap runs clean. Run cd backend && npm run bootstrap on a fresh DB and verify T1–T3 modules appear in learner view with correct content and questions. This is the single gate before anything else.
Confirm learner OTP flow end-to-end. With Mailpit running: register → check localhost:8025 → OTP code → /learn/dashboard shows modules. Fix anything blocking this.
Confirm paid-tier learner sees modules. The bootstrap seeds 3 learners with tier assignments. Verify a professional-tier learner sees T1–T3 and can start a module.
Confirm ANTHROPIC_API_KEY is set in backend/.env. Without it, KB chat returns "AI unavailable" and TTX AI features are dead. Note: the key must be non-empty (not ANTHROPIC_API_KEY=).
P1 — Study Material surface (highest-value visible work)
Read GET CYBER SMART v2 (docs/kb-content/GET CYBER SMART v2.0.docx). Extract: core cyber topics, definitions, frameworks, and principles that are NOT already in src/data/studyMaterial.ts. Focus on foundational cyber content (network security, zero trust, cloud hygiene, NIST/ISO basics).
Expand src/data/studyMaterial.ts with 2–3 new topic entries. Target: topics that broaden from logistics-specific to cyber foundations (network segmentation basics, zero-trust principles, NIST CSF overview). Keep logistics as the application layer in examples. Each new topic needs: intro, 3–5 sections with headings+bodies, 3–4 key points, relatedTopicIds.
Verify the Study Material search works end-to-end. /learn/library search calls GET /learn/modules/kb-search?q=... (backend). Confirm: API call works, results return, article links open correctly.
P2 — Public frontend alignment
Update LandingPage stat block. Currently says "3 Training Modules". Keep this as accurate. If T4/T5 are stable enough, consider changing to "5 Training Modules" — but only if they are genuinely demo-ready. Do not inflate.
Reframe the 4 capabilities on CapabilitiesPage. "Strategic Threat Intelligence" and "Rapid Incident Response" describe services, not app features. They should be reframed as company capabilities/services, clearly distinct from the platform features (Training, TTX). This prevents a demo audience from expecting app functionality that isn't there.
PackagesPage: verify the feature matrix matches reality. Professional tier promises "Full training academy — all modules, Tabletop exercise (TTX) platform". The TTX platform exists (framework). The "all modules" claim is accurate if T1–T5 are assigned. Confirm individual tier only gets T1–T3.
P3 — Visual clarity on demo path (only the critical path)
LearnDashboard: confirm the module grid renders correctly when all 3 modules are in different states (not-started, in-progress, completed). This is the most-viewed learner screen in the demo.
AdminDashboard: confirm health indicator shows green. The dashboard calls /health endpoint. If DB is up, it should show api: ok, db: ok. This is visible evidence that the stack is running.
LearnLibrary: confirm chapter cards render cleanly and clicking through to an article (/learn/library/{topicId}) works without errors.
D. Content Expansion Plan
Strategy
Cyber foundations taught through a logistics-aware lens
GET CYBER SMART v2 = source for foundational broadening
logistics-specific incidents + scenarios = applied layer
Do not add fluff, do not remove logistics identity
Current Study Material (src/data/studyMaterial.ts) — 9 chapters
Logistics Cyber Threat Landscape (2 topics) ✓
Adversarial Profiling & Case Studies (2 topics) ✓
Social Engineering & Freight Fraud (2 topics) ✓
Business Email Compromise & Payment Security (2 topics) ✓
Pre-Incident Detection & Incident Response (2 topics) ✓
Identity, Credentials, Email Authentication (2 topics) ✓
Technical Protocols & Systemic Vulnerabilities (3 topics) ✓
Regulatory Frameworks & Sector Standards (3 topics) ✓
Role-Specific Cybersecurity Playbooks (4 topics) ✓
Recommended Expansions (Phase 1 — for demo)
Add to Chapter 7 (Technical Protocols) or as a new Chapter 10:

Network Security Fundamentals — segmentation, firewalls, VLANs, explained through warehouse/fleet network architecture. Pull from GET CYBER SMART v2 foundational content.
Zero Trust in Logistics Operations — "never trust, always verify" applied to carrier credential verification, driver app access, third-party portal access.
Add to Chapter 8 (Regulatory Frameworks):

NIST CSF in Plain English — Identify, Protect, Detect, Respond, Recover mapped to concrete logistics operations actions. More accessible than the current regulatory deep-dive.
Each new topic: intro + 3–5 sections + 3–4 key points + relatedTopicIds pointing to existing topics.

KB Articles (module-supporting content)
The bootstrap-local-proof.ts creates 31 KB items (all First Tranche). No new KB articles are needed for the demo unless a new module is added. The Study Material expansion (above) lives in src/data/studyMaterial.ts, not in the KB item system — that's the correct architecture (KB = admin-managed training content, Study Material = static reference library).

E. Frontend Promise Alignment
Already Supported (show this in the demo)
Claim App support
"3 Training Modules: Phishing · BEC · MFA" T1/T2/T3 seeded and published
"KB Knowledge-Grounded: No hallucinated guidance" KB retrieval grounding confirmed
"Cyber Resilience Training — interactive modules, assessments" Module flow + checkpoint + debrief ✅
"Learner progress tracking" Scorecard + admin progress dashboard ✅
"Admin dashboard & reporting" AdminDashboard + AdminProgress ✅
"Email delivery protection guidance (SPF, DKIM, DMARC)" Covered in T1 study material ✅
"Knowledge base" Study Material + KB items ✅
Partially Supported — needs reframing (say what it is)
Claim Reality Reframe to
"TTX Tabletop Exercises: Professional tier" Framework built, 1 demo scenario "Tabletop Exercise Platform (preview)" or "available in early access"
"Ransomware & BEC simulation exercises" Modules cover these topics. No live simulator. Change "simulation" to "scenario-based training"
"Realistic phishing scenarios" No live phishing simulator built Remove or say "scenario-based awareness training"
"Incident response drills" Covered in T5 module as case study "Incident response training" not "drills"
Company/Service Promises — not app-native (say this is the team, not the platform)
Claim Status
"Former FBI & Military Intelligence" Credibility claim, not a platform feature — keep in About/landing but make it a team/service statement
"Strategic Threat Intelligence — quarterly threat briefs, flash reports, geopolitical analysis" Service offering, not app feature. Move to Enterprise consulting section.
"Rapid Incident Response — first 72 hours, legal notification, containment protocols" Consulting service. Not app-native. Keep in Enterprise tier as "access to Five Eyes analysts".
"Freight Security Analysis — real-time threat mapping, route vulnerability analysis" Consulting offering. Not a platform feature.
F. Minimum Believable Demo
A demo that is honest, defensible, and impressive within what exists right now.

Duration: 15–20 minutes Entry point: Learner login (/login)

Demo Script
Learner login — /login → Learner Access → email → OTP arrives in Mailpit (or on device) → code → /learn/dashboard
Dashboard — show 3 modules, progress states, "Welcome back" header
Start T1 — click into Phishing module → briefing → checkpoint question → show remediation on wrong answer → debrief score
Study Material — navigate to /learn/library → "Here is the full reference library" → open one article (e.g., "Why Logistics Is a High-Value Target") → show depth of content, key points, cross-links
KB-grounded chat — open chat widget → ask "what is BEC fraud in logistics?" → show KB-sourced answer
Switch to admin — /admin/login → admin dashboard → health check green → navigate to /admin/progress → show learner completion data
KB management — navigate to /kb → show published items, topics, module structure — "this is how content is managed"
What this demo proves
Auth separation works (two distinct login flows, no crossing)
Learner flow is stable (OTP → modules → content → scoring)
Content has real depth (Study Material is not thin)
AI is grounded, not hallucinating
Admin can see what learners are doing
The KB is the source of truth
What to NOT show
TTX (say it's in development)
Security game
T4/T5 modules (say they're in the next cohort release)
Any "quarterly briefing" or "incident response hotline" claim
G. Post-Demo Next Phase
Once the demo base is stable and shown:

Phase 2 — Cohort 1 readiness (first real learners)
Add T4 (Invoice Fraud) and T5 (Ransomware Response) to the demo-facing module set after confirmation they are stable
Expand Study Material with GET CYBER SMART v2 foundational topics (P1 above)
Add one real TTX scenario (BEC-focused) with proper steps, injects, and facilitator notes
Wire up package assignment so new learners get the right tier on registration
Phase 3 — TTX depth
Author 2–3 more TTX scenarios based on the docs/ttx/ttx-v1-spec.md and real freight incidents
Build the facilitator brief view and inject timing controls
Connect learner TTX participation flow to scoring/debrief
Phase 4 — Threat intelligence surface
This is not an in-app feature — it's a content operation
Quarterly: admin-curated threat brief published to KB, pushed to learners via email
Use content-blocks (kind: news) for the admin-facing surface
Learner sees it in a "Latest Intelligence" section of the dashboard
What to defer indefinitely
Live phishing simulator (requires separate infrastructure)
Real-time threat mapping (requires live data feeds)
On-call incident response system (human service, not app feature)
Critical Files
File What it does
src/data/studyMaterial.ts Static Study Material content — all 9 chapters, 30+ topics
src/pages/LearnLibrary.tsx Study Material chapter browser
src/pages/LearnLibraryTopic.tsx Single article view
src/pages/LearnDashboard.tsx Learner dashboard with module grid
src/pages/LearnModule.tsx Module flow (briefing, checkpoint, debrief)
src/components/ChatAssistant.tsx KB-grounded chat widget
src/pages/public/LandingPage.tsx Public promise source #1
src/pages/public/CapabilitiesPage.tsx Public promise source #2 — needs reframing
src/pages/public/PackagesPage.tsx Feature matrix — needs accuracy check
backend/scripts/bootstrap-local-proof.ts Seeds T1–T3, KB items, learners
backend/scripts/seed-t4-t5.ts Seeds T4–T5
backend/src/server.ts Startup banner (just added)
docker-compose.yml DB + Mailpit (just added)
src/App.tsx AdminGuard + route separation (just fixed)
docs/kb-build-order.md Master content roadmap
docs/kb-content/GET CYBER SMART v2.0.docx Client's book — source for foundational expansion
Verification
Before calling the demo ready:

# 1. Fresh start

docker compose down -v && docker compose up -d

# 2. Run backend

cd backend && npm run dev

# Check: startup banner shows SMTP → localhost:1025, AI key set ✓

# 3. Run bootstrap

npm run bootstrap

# Check: no errors, modules T1-T3 visible in admin /kb

# 4. Start frontend

cd .. && npm run dev

# Check: browser console shows [Five Eyes] Frontend config — API base

# 5. Test learner flow

# Go to /login → Learner Access → enter a seeded email (e.g. eva@example.com handle)

# Check: Mailpit at localhost:8025 shows OTP email

# Enter code → should land on /learn/dashboard with 3 modules

# 6. Test admin flow

# Go to /admin/login → use seeded admin email + password from ADMIN_PASSWORD in backend/.env

# Check: /admin dashboard shows health green, /admin/progress shows learner data

# 7. Test Study Material

# As learner, go to /learn/library → verify 9 chapters render

# Click a topic → verify full article loads with sections and key points

# 8. Test chat (requires ANTHROPIC_API_KEY to be set in backend/.env)

# As paid-tier learner, click chat widget → ask "what is a BEC attack in freight?"

# Check: response references logistics-specific content, not hallucinated

# 9. Test admin guard

# Open incognito → go to /kb → should redirect to /admin/login

# Open incognito → go to /admin → should redirect to /admin/login
