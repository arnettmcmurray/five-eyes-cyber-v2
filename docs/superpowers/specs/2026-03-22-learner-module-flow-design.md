# Learner Module Flow — Design Spec
_Date: 2026-03-22 | Status: Approved_

## Problem

The current `LearnModule.tsx` (544 lines) has three fatal UX flaws:
1. Learner can freely tab between Study / Practice / Results at any time — no lock-out
2. All practice questions are dumped at once on the Practice tab
3. No overview or task structure — learner drops straight into a flat content list

The rewrite must enforce forward-only progression: read content → answer checkpoint → proceed. No going back once a checkpoint is active.

---

## Scope

**In scope:** `src/pages/LearnModule.tsx` — full rewrite
**Out of scope:** Backend API, KB architecture, admin system, `LearnHub.tsx`, `LearnDashboard.tsx`, routing, auth

---

## Data Shape (existing API, unchanged)

```
GET /learn/modules/:id  →  LearnModuleResponse {
  module: { id, slug, title, description, nextModuleId }
  studyItems: LearnStudyItem[]        // flat, ordered by role (primary first)
  practiceQuestions: LearnPracticeQuestion[]  // flat, no task assignment
  references: LearnReference[]
}

POST /learn/modules/:id/practice  →  PracticeResult {
  score, total, percentage,
  results: PracticeResultItem[],
  remediationItems: RemediationItem[]
}
```

`estimatedMinutes` exists on `LearningModule` (hub list) but NOT on `LearnModuleResponse.module`. Handled gracefully (omit if absent).

---

## Task Synthesis (client-side)

No backend changes. Tasks are constructed from flat arrays at load time:

```typescript
type Task = {
  index: number;          // 0-based
  studyItem: LearnStudyItem;
  question?: LearnPracticeQuestion;
};

// Construction: zip studyItems and practiceQuestions 1:1
// If fewer questions than items → later tasks have no checkpoint (question: undefined)
// If MORE questions than items → extras are appended to the LAST task only (multi-question final task)
//   OR discarded if implementation complexity is high — cap at studyItems.length tasks
// Recommended: cap tasks at studyItems.length; distribute questions 1:1, extras ignored
// Edge case: 0 studyItems → render error state (should not occur for published modules)
// Edge case: 0 practiceQuestions → all tasks have no checkpoint; debrief shows "no questions" state (no score ring)
```

---

## State Machine

```
'overview' → 'briefing' → 'checkpoint' → 'briefing' → ... → 'debrief'
                              (if task has question)
```

**States:**
| State | Description |
|---|---|
| `overview` | Entry screen — module summary, task list, Begin/Resume CTA |
| `briefing` | Task N content — study item rendered, forward CTA |
| `checkpoint` | Task N quiz — locked after answer, inline feedback, Continue |
| `debrief` | Final — score, per-task results, remediation, next module |

**Invariants:**
- `overview → briefing`: one-way. No return after entering.
- `briefing → checkpoint`: one-way. "Proceed to Checkpoint" visible only if task has a question.
- `checkpoint → briefing/debrief`: one-way after answer submitted. No "review content" link shown.
- `debrief`: terminal state. Only exit is navigating away.

---

## Screen Specifications

### Overview
- Module title (large), description
- `estimatedMinutes` badge if present
- Numbered task list (all items visible, all dimmed, first item highlighted)
- No mid-task resume: learner always starts from overview. No state persistence between sessions for task position.
- CTA: "Begin Training" (always — resume to mid-task is out of scope)

### Briefing (Task N of Total)
- `TASK N / TOTAL` label + progress bar
- Study item title as heading
- Content body (markdown-rendered or plain text)
- If task has question: "Proceed to Checkpoint →" button
- If no question: "Task Complete — Continue →" button
- No back button

### Checkpoint (Task N)
- `CHECKPOINT` label (gold accent, visually distinct)
- Question text
- 4 answer option cards (selectable, mutually exclusive)
- On selection: immediately lock options, submit single answer `[selectedIndex]` to `POST /practice`
- Show inline feedback: ✓ Correct / ✗ Incorrect + explanation text from `remediationItems`
- "Continue →" button appears after feedback (not before)
- No "Review Content" link

### Debrief
- Score ring/badge: `N / TOTAL correct (X%)`
- Pass/fail threshold visual (if applicable)
- Per-task result list: task title + ✓/✗ per question answered
- Remediation section: any wrong answers + KB links from `recommendedTopics`
- CTAs: "Next Module →" (if `nextModuleId`) and "Back to Dashboard"

---

## Component Structure

```
LearnModule.tsx (single file, ~300 lines)
├── useModuleFlow() hook  — state machine, task synthesis, answer submission
├── <OverviewScreen />   — props: module, tasks, onBegin
├── <BriefingScreen />   — props: task, taskIndex, totalTasks, onNext
├── <CheckpointScreen /> — props: task, onAnswer, onContinue
└── <DebriefScreen />    — props: results, module, onNext, onDashboard
```

All sub-components defined in the same file (no new files).

---

## Answer Submission Strategy

Single-question submit per checkpoint (not batched at end):
```
POST /learn/modules/:id/practice  { answers: [optionIndex] }
// optionIndex: 0-3, the index of the selected option in question.options[]
// The backend treats answers[i] as the selected option for question i in practiceQuestions[]
// Submitting a 1-element array grades only that one question
```

Per-checkpoint response shape used:
- `results[0].correct` — whether the answer was right
- `results[0].explanation` — feedback text
- `remediationItems[0]` (if present) — remediation for the single wrong answer

Store each result locally: `storedResults: Map<questionId, PracticeResultItem>`.
At debrief, sum stored results for final score. If no questions were answered (0 checkpoints), show "Module Complete" state instead of score ring.

**Edge case — API error on checkpoint submit:** Show inline error with retry button. Do not advance to next task until submission succeeds or learner explicitly skips (skip marks answer as incorrect locally).

---

## Design Token Alignment

- Background: `var(--bg-surface)` for cards, `var(--bg-canvas)` for page
- Progress: gold gradient `var(--gold-accent)` → `#d97706`
- Checkpoint label: `var(--gold-accent)` border + glow
- Correct answer: `rgba(16,185,129,0.15)` border `rgba(16,185,129,0.5)`
- Wrong answer: `rgba(244,63,94,0.12)` border `rgba(244,63,94,0.4)`
- All typography via existing `font-display`, `label-tag`, `label-tag-muted` classes
