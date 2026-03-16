# Local Proof Status (2026-03-16)

## Core Flows — End-to-End Status

| Flow | Status | Notes |
|------|--------|-------|
| Admin login | ✅ Works | Redirects to /kb on success |
| KB admin — list, filter, ingest | ✅ Works | Full nav, status/type filters, ingest modal |
| KB item detail — view, edit, revisions, workflow | ✅ Works | Topics, quiz candidates, module links shown |
| KB search — full-text + quiz assist | ✅ Works | FTS returns ranked hits; quiz assist returns hints |
| Topics — list, create | ✅ Works | Hierarchy supported |
| Modules — list, create, edit, content links, prereqs | ✅ Works | Publish/unpublish, content panel, prereq manager |
| Admin progress — by learner, by module | ✅ Works | Expandable rows per learner/module |
| Admin assignments — assign learner to module | ✅ Works | Shows assigned learners per module |
| Learner OTP login | ✅ Works | Handle → code request → verify → session |
| Learner hub — module list with progress state | ✅ Works | In-progress, available, locked, completed sections |
| Module study content | ⚠️ Requires data | No KB items linked to Phishing 101 yet (admin task: use Content panel in Modules) |
| Module practice | ⚠️ Requires data | No quiz items linked to module (admin task) |
| Module results / remediation | ✅ Works | Score, question breakdown, topic tags, KB search, retry |
| TTX scenarios — list, create, edit, AI draft | ✅ Works | Section/step/inject structure, AI suggest |
| TTX sessions — list, create | ✅ Works | Scenario binding, schedule |
| TTX console — facilitator | ✅ Works | Live SSE, inject delivery, event log, participant URL |
| TTX participant view | ✅ Works | OTP auth, join, live inject feed, response submission |
| TTX AAR | ✅ Works | Session summary, event timeline, narrative editing, action items, export |

## Screens — Presentation Ready

**Admin hub (KB):** Yes — full nav bar, list/filter, ingest workflow, item detail with all metadata
**KB Search:** Yes — full-text and quiz assist modes, topic tags, scored results
**Modules:** Yes — clean list with publish toggle, content/prereq panels
**Progress:** Yes — clickable learner/module rows with expandable detail
**Assignments:** Yes — module selector → learner assignment table
**Learner hub:** Yes — clean sectioned view, recommended module banner
**TTX Console:** Yes — 3-column live facilitator view, inject delivery, event log
**TTX Participant:** Yes — mobile-friendly single-page, inject feed, response form
**TTX AAR:** Yes — clean structured review, timeline, action items, JSON export

## Gaps Before "Fully Working App + Visual Proof"

1. **Module content not linked** — Phishing 101 exists but has no KB items in its content list. Admin must use the Content panel in Modules to link KB items to modules. (Admin task, not a bug.)
2. **No practice questions linked** — Same reason. Quiz candidates exist on KB items but need to be linked. (Admin task.)
3. **Email handle display** — Learners created via email handle (e.g. `testlearner@example.com`) are stored with `@` and `.` stripped (`testlearnerexamplecom`). Functional but cosmetically odd in admin tables.
4. **Single admin user** — Only one admin in DB. Multi-admin workflows untested.

## What Was Fixed This Session

- Admin login redirect (broken `/kb-admin` → `/kb`)
- AdminAssignments: replaced all hardcoded fetch() with api.assignments.*
- Removed "check server logs" dev note from learner OTP screen
- Admin "Learner" nav link opens new tab (preserves admin session)
- Full admin nav added to KBSearch and TopicManager (no nav dead ends)
- Consistent `← Back to KB` links across all admin sub-pages
- Slug display truncated in KB list (long auto-generated slugs no longer blow layout)
- React key prop warning fixed in AdminProgress (Fragment keying)
- TTX inject type badge visually separated from body on own line
- TTX participant URL is a clickable link
- TTX Log Event button shows tooltip hint when fields missing
- AdminAssignments: added descriptive subtitle
- "Content v1" heading spacing fixed in KB item detail
- "FTS" → "Full-text", "Quiz-aid" → "Quiz assist" labels
- AdminProfile: "Back to KB" is now a proper Link element
- Duplicate module suppressed in learner hub recommended banner
