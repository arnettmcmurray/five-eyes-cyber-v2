# TTX MVP Direction

**Source:** `reference/TTX_examples/deep-research-report.md`
**Status:** Planning only — do not build until this doc is approved.

---

## What TTX Is (Product Framing)

A tabletop exercise is a facilitated, discussion-based simulation. A facilitator presents a scenario, delivers timed injects (new information/events), and participants (playing organizational roles) make decisions. The exercise is not the product — the after-action review and closed-loop improvement plan are.

This is **not the same as the learning module system.** TTX is event-driven, collaborative, and live. It has no overlap with KB ingestion, quiz grading, or learner progress.

---

## Roles

| Role | Responsibility |
|---|---|
| Facilitator | Drives session, delivers injects, controls pace |
| Player/SME | Makes decisions within their role (CEO, Security Lead, Legal, etc.) |
| Observer/Scribe | Captures decisions, actions, key moments |
| Admin | Creates scenarios, schedules sessions, reviews AARs |

For MVP: facilitator + players only. Observers are read-only facilitators.

---

## Manual vs AI-Assisted Responsibilities

| Task | Manual | AI-Assisted |
|---|---|---|
| Scenario creation | Facilitator drafts | AI generates draft from prompt + optional PDF |
| Inject authoring | Facilitator writes injects | AI suggests 5-10 injects aligned to objectives |
| Session conduct | Fully manual (facilitator controls pace) | Not applicable |
| Decision/event logging | Scribe enters in real-time | Not applicable |
| AAR generation | Facilitator reviews and approves | AI drafts AAR from session timeline |
| Improvement plan | Owner fills in | AI suggests patterns from action catalog |

For MVP: manual only. AI assistance is Phase 2.

---

## Exercise Structure

```
Scenario
  └── Sections (phases: Intro → Investigation → Mitigation → Resolution → Wrap-Up)
        └── Steps (facilitation units within a section)
              └── Injects (timed information drops per step)
```

---

## Backend Objects (MVP Scope)

```
ttx_scenarios
  id, slug, title, description, objective, createdBy, createdAt

ttx_scenario_sections
  id, scenarioId, title, order

ttx_scenario_steps
  id, sectionId, prompt, facilitatorNotes, order

ttx_injects
  id, stepId, body, injectType (legal|media|technical|customer|other)
  targetRoles (text[]), suggestedTimingMinutes, order

ttx_sessions
  id, scenarioId, title, scheduledAt, startedAt, endedAt
  status (planned|active|ended), facilitatorId

ttx_session_participants
  id, sessionId, handle, role, joinedAt

ttx_session_events
  id, sessionId, eventType (inject_delivered|decision|note|action)
  actorHandle, body, linkedInjectId, occurredAt

ttx_after_action_reviews
  id, sessionId, summary, strengths (text), improvements (text)
  status (draft|final), createdBy, createdAt

ttx_action_items
  id, aarId, body, owner, dueAt
  status (open|closed|retesting), closedAt, evidence
```

---

## What to Borrow from References

- HSEEP inject structure and type taxonomy
- AAR section breakdown (overview → objectives → strengths → improvements → IP)
- Action item lifecycle: open → owner assigned → evidence submitted → retest → closed
- "Improvement plan is the real deliverable" framing — surface this prominently in UI
- Exercise calendar view (schedule, past sessions)

---

## Build Constraints

- TTX lives in `feature/ttx-core` branch — **never merged to main until facilitator console + participant join + AAR export all work end-to-end**
- No connection to learner progress, KB items, or module assignments
- Auth: facilitators are admin users; participants use learner OTP auth with a TTX-specific session flag
- No analytics or scoring in Phase 1 — capture only
- Scenario snapshots are stored per session (so AARs reflect what was actually run)
- Phase 2 only: AI scenario generation, AI inject drafting, AI AAR drafting

---

## Next Step to Build

When ready: `git checkout -b feature/ttx-core`

Build order:
1. Schema migration
2. Scenario CRUD (admin)
3. Session creation + participant join
4. Facilitator console (inject delivery, event log)
5. Participant view (read injects, submit decisions)
6. AAR creation + action items
7. Export (PDF/print friendly)
