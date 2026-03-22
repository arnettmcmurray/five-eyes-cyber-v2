# Learner Module Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `src/pages/LearnModule.tsx` to enforce a forward-only task-based learning flow: overview → per-task briefing → per-task checkpoint quiz → debrief, replacing the current free-tab-switching study/practice/results UI.

**Architecture:** Single file rewrite. A `useModuleFlow` hook manages the state machine and task synthesis (zipping flat `studyItems[]` + `practiceQuestions[]` into `Task[]`). Four sub-components (`OverviewScreen`, `BriefingScreen`, `CheckpointScreen`, `DebriefScreen`) are defined in the same file. No backend or routing changes.

**Tech Stack:** React 18, TypeScript, Framer Motion, Tailwind CSS + CSS design tokens, existing API client (`src/api/client.ts`)

**Spec:** `docs/superpowers/specs/2026-03-22-learner-module-flow-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| **Rewrite** | `src/pages/LearnModule.tsx` | Entire module experience — hook + 4 screens |
| **Read-only ref** | `src/api/client.ts` | Type definitions (`LearnModuleResponse`, `LearnPracticeQuestion`, `PracticeResult`, etc.) |
| **Read-only ref** | `src/lib/session.ts` | `getSessionToken()` for auth guard |

No new files. No backend changes. No routing changes.

---

## Task 1: Define types, state machine, and `useModuleFlow` hook skeleton

**Files:**
- Modify: `src/pages/LearnModule.tsx` (full rewrite starts here)

### Steps

- [ ] **Step 1.1: Replace file header — imports and type definitions**

Replace the entire file content with the following (this is the foundation everything builds on):

```typescript
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  api,
  type LearnModuleResponse,
  type LearnStudyItem,
  type LearnPracticeQuestion,
  type PracticeResultItem,
  type LearnTopicRef,
} from '../api/client';
import { getSessionToken } from '../lib/session';

// ── Types ────────────────────────────────────────────────────────────────────

type Task = {
  index: number;
  studyItem: LearnStudyItem;
  question?: LearnPracticeQuestion;
};

type FlowState =
  | { screen: 'overview' }
  | { screen: 'briefing'; taskIndex: number }
  | { screen: 'checkpoint'; taskIndex: number }
  | { screen: 'debrief' };

type CheckpointResult = {
  questionId: string;
  correct: boolean;
  explanation?: string;
  recommendedTopics?: LearnTopicRef[];
};

// ── Task synthesis ────────────────────────────────────────────────────────────

function buildTasks(
  studyItems: LearnStudyItem[],
  questions: LearnPracticeQuestion[],
): Task[] {
  // Primary items first, then by existing order
  const ordered = [...studyItems].sort((a, b) => {
    if (a.role === 'primary' && b.role !== 'primary') return -1;
    if (b.role === 'primary' && a.role !== 'primary') return 1;
    return 0;
  });
  return ordered.map((item, i) => ({
    index: i,
    studyItem: item,
    question: questions[i], // undefined if no question for this index
  }));
}
```

- [ ] **Step 1.2: Add `useModuleFlow` hook**

Append after the types section:

```typescript
// ── Hook ─────────────────────────────────────────────────────────────────────

function useModuleFlow(moduleId: string | undefined) {
  const navigate = useNavigate();
  const [data, setData] = useState<LearnModuleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<FlowState>({ screen: 'overview' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkpointResults, setCheckpointResults] = useState<CheckpointResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId) return;
    if (!getSessionToken()) { navigate('/learn', { replace: true }); return; }
    api.learn.module(moduleId)
      .then(d => {
        setData(d);
        setTasks(buildTasks(d.studyItems, d.practiceQuestions));
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [moduleId, navigate]);

  function beginTraining() {
    setFlow({ screen: 'briefing', taskIndex: 0 });
  }

  function advanceFromBriefing(taskIndex: number) {
    const task = tasks[taskIndex];
    if (task?.question) {
      setFlow({ screen: 'checkpoint', taskIndex });
    } else {
      advanceFromCheckpoint(taskIndex);
    }
  }

  async function submitCheckpointAnswer(
    taskIndex: number,
    optionIndex: number,
  ): Promise<CheckpointResult | null> {
    if (!moduleId || !data) return null;
    const task = tasks[taskIndex];
    if (!task?.question) return null;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await api.learn.practice(moduleId, [optionIndex]);
      const item: PracticeResultItem | undefined = result.results[0];
      const checkpoint: CheckpointResult = {
        questionId: task.question.id,
        correct: item?.correct ?? false,
        explanation: result.remediationItems[0]?.content ?? item?.explanation,
        recommendedTopics: result.recommendedTopics,
      };
      setCheckpointResults(prev => [...prev, checkpoint]);
      return checkpoint;
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Submission failed');
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  function advanceFromCheckpoint(taskIndex: number) {
    const nextIndex = taskIndex + 1;
    if (nextIndex < tasks.length) {
      setFlow({ screen: 'briefing', taskIndex: nextIndex });
    } else {
      setFlow({ screen: 'debrief' });
    }
  }

  const score = checkpointResults.filter(r => r.correct).length;
  const total = checkpointResults.length;

  return {
    data,
    loading,
    error,
    flow,
    tasks,
    checkpointResults,
    submitting,
    submitError,
    score,
    total,
    beginTraining,
    advanceFromBriefing,
    submitCheckpointAnswer,
    advanceFromCheckpoint,
  };
}
```

- [ ] **Step 1.3: Add the root `LearnModule` component (thin orchestrator)**

Append after the hook:

```typescript
// ── Root component ────────────────────────────────────────────────────────────

export default function LearnModule() {
  const { id } = useParams<{ id: string }>();
  const hook = useModuleFlow(id);

  if (hook.loading) return (
    <div className="flex items-center justify-center h-48">
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
        Loading…
      </span>
    </div>
  );

  if (hook.error) return (
    <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
      {hook.error}
    </div>
  );

  if (!hook.data) return null;

  const { flow, tasks, data, checkpointResults, submitting, submitError, score, total } = hook;

  if (flow.screen === 'overview') {
    return (
      <OverviewScreen
        module={data.module}
        tasks={tasks}
        onBegin={hook.beginTraining}
      />
    );
  }

  if (flow.screen === 'briefing') {
    return (
      <BriefingScreen
        task={tasks[flow.taskIndex]}
        taskIndex={flow.taskIndex}
        totalTasks={tasks.length}
        onNext={() => hook.advanceFromBriefing(flow.taskIndex)}
      />
    );
  }

  if (flow.screen === 'checkpoint') {
    return (
      <CheckpointScreen
        task={tasks[flow.taskIndex]}
        submitting={submitting}
        submitError={submitError}
        onAnswer={(optionIndex) => hook.submitCheckpointAnswer(flow.taskIndex, optionIndex)}
        onContinue={() => hook.advanceFromCheckpoint(flow.taskIndex)}
      />
    );
  }

  return (
    <DebriefScreen
      module={data.module}
      score={score}
      total={total}
      checkpointResults={checkpointResults}
      tasks={tasks}
    />
  );
}
```

- [ ] **Step 1.4: Add placeholder sub-components (enough to compile)**

Append at the end of the file — these are stubs so TypeScript compiles. They'll be replaced in later tasks:

```typescript
// ── Sub-components (stubs — replaced in later tasks) ─────────────────────────

function OverviewScreen(_props: {
  module: LearnModuleResponse['module'];
  tasks: Task[];
  onBegin: () => void;
}) {
  return <div>Overview</div>;
}

function BriefingScreen(_props: {
  task: Task;
  taskIndex: number;
  totalTasks: number;
  onNext: () => void;
}) {
  return <div>Briefing</div>;
}

function CheckpointScreen(_props: {
  task: Task;
  submitting: boolean;
  submitError: string | null;
  onAnswer: (optionIndex: number) => Promise<CheckpointResult | null>;
  onContinue: () => void;
}) {
  return <div>Checkpoint</div>;
}

function DebriefScreen(_props: {
  module: LearnModuleResponse['module'];
  score: number;
  total: number;
  checkpointResults: CheckpointResult[];
  tasks: Task[];
}) {
  return <div>Debrief</div>;
}
```

- [ ] **Step 1.5: Verify TypeScript compiles**

```bash
cd /Users/arnettmcmurray/Desktop/five-eyes-dashboard-v2 && npx tsc --noEmit
```

Expected: no output (clean). If errors appear, fix them before proceeding.

- [ ] **Step 1.6: Check `PracticeResultItem` has `correct` and `explanation` fields**

Open `src/api/client.ts` and verify `PracticeResultItem` interface. If `explanation` is not a field, remove it from the `CheckpointResult` type and the `submitCheckpointAnswer` function. Use `remediationItems[0]?.content` only.

- [ ] **Step 1.7: Commit**

```bash
git add src/pages/LearnModule.tsx
git commit -m "feat(module): add flow state machine and useModuleFlow hook skeleton"
```

---

## Task 2: Build `OverviewScreen`

**Files:**
- Modify: `src/pages/LearnModule.tsx` — replace `OverviewScreen` stub

- [ ] **Step 2.1: Replace the `OverviewScreen` stub with the full implementation**

```typescript
function OverviewScreen({
  module,
  tasks,
  onBegin,
}: {
  module: LearnModuleResponse['module'];
  tasks: Task[];
  onBegin: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <div>
        <p className="label-tag-muted mb-2">Training Module</p>
        <h1
          className="font-display font-black text-2xl md:text-3xl tracking-tight mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          {module.title}
        </h1>
        {module.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {module.description}
          </p>
        )}
      </div>

      {/* Task list */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <p className="label-tag-muted mb-4">
          {tasks.length} Task{tasks.length !== 1 ? 's' : ''} in this module
        </p>
        {tasks.map((task, i) => (
          <div
            key={task.studyItem.id}
            className="flex items-center gap-4 py-3"
            style={{
              borderBottom: i < tasks.length - 1 ? '1px solid var(--border-subtle)' : undefined,
              opacity: i === 0 ? 1 : 0.5,
            }}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {task.studyItem.title}
              </p>
              {task.question && (
                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--gold-accent)', opacity: 0.7 }}>
                  Includes checkpoint
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onBegin}
        className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.01] hover:brightness-110"
        style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
      >
        Begin Training
      </button>

      {/* Back link */}
      <div className="text-center">
        <Link
          to="/learn/hub"
          className="text-xs font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back to modules
        </Link>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2.2: Verify compile**

```bash
cd /Users/arnettmcmurray/Desktop/five-eyes-dashboard-v2 && npx tsc --noEmit
```

- [ ] **Step 2.3: Smoke-test in browser**

Start dev server if not running: `npm run dev`
Navigate to any module URL (e.g. `/learn/modules/<id>`).
Expected: overview screen renders with module title, task list, "Begin Training" button.

- [ ] **Step 2.4: Commit**

```bash
git add src/pages/LearnModule.tsx
git commit -m "feat(module): implement OverviewScreen with task list"
```

---

## Task 3: Build `BriefingScreen`

**Files:**
- Modify: `src/pages/LearnModule.tsx` — replace `BriefingScreen` stub

- [ ] **Step 3.1: Replace the `BriefingScreen` stub**

```typescript
function BriefingScreen({
  task,
  taskIndex,
  totalTasks,
  onNext,
}: {
  task: Task;
  taskIndex: number;
  totalTasks: number;
  onNext: () => void;
}) {
  const pct = Math.round(((taskIndex) / totalTasks) * 100);

  return (
    <motion.div
      key={taskIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Task {taskIndex + 1} of {totalTasks}
          </span>
          <span className="text-[10px] font-black" style={{ color: 'var(--gold-accent)' }}>
            {pct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--gold-accent), #d97706)',
              boxShadow: '0 0 8px rgba(245,158,11,0.35)',
            }}
          />
        </div>
      </div>

      {/* Content card */}
      <div
        className="rounded-xl p-6 md:p-8"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <p className="label-tag-muted mb-4">
          {task.studyItem.role === 'primary' ? 'Core Content' : 'Reading'}
        </p>
        <h2
          className="font-display font-black text-xl md:text-2xl mb-5 leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {task.studyItem.title}
        </h2>
        <div
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--text-secondary)' }}
        >
          {task.studyItem.content}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.01] hover:brightness-110"
        style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
      >
        {task.question ? 'Proceed to Checkpoint →' : 'Task Complete — Continue →'}
      </button>
    </motion.div>
  );
}
```

- [ ] **Step 3.2: Verify compile**

```bash
cd /Users/arnettmcmurray/Desktop/five-eyes-dashboard-v2 && npx tsc --noEmit
```

- [ ] **Step 3.3: Smoke-test**

Click "Begin Training" on the overview. Expected: briefing screen shows task 1 content, progress bar at 0%, correct CTA label based on whether a question exists.

- [ ] **Step 3.4: Commit**

```bash
git add src/pages/LearnModule.tsx
git commit -m "feat(module): implement BriefingScreen with progress bar"
```

---

## Task 4: Build `CheckpointScreen`

**Files:**
- Modify: `src/pages/LearnModule.tsx` — replace `CheckpointScreen` stub

- [ ] **Step 4.1: Replace the `CheckpointScreen` stub**

```typescript
function CheckpointScreen({
  task,
  submitting,
  submitError,
  onAnswer,
  onContinue,
}: {
  task: Task;
  submitting: boolean;
  submitError: string | null;
  onAnswer: (optionIndex: number) => Promise<CheckpointResult | null>;
  onContinue: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<CheckpointResult | null>(null);

  async function handleSelect(i: number) {
    if (selected !== null || submitting) return; // locked after first selection
    setSelected(i);
    const r = await onAnswer(i);
    setResult(r);
  }

  if (!task.question) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Checkpoint header */}
      <div
        className="rounded-xl px-5 py-4 flex items-center gap-3"
        style={{
          background: 'var(--gold-muted)',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--glow-gold)',
        }}
      >
        <span
          className="text-[10px] font-black uppercase tracking-ultra"
          style={{ color: 'var(--gold-accent)' }}
        >
          ⬡ Checkpoint
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Select the correct answer. You cannot go back.
        </span>
      </div>

      {/* Question */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <p
          className="text-base font-bold leading-snug mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {task.question.questionText}
        </p>

        <div className="space-y-3">
          {task.question.options.map((opt, i) => {
            const isSelected = selected === i;
            const locked = selected !== null;
            const isCorrect = result?.correct && isSelected;
            const isWrong = !result?.correct && isSelected;

            let borderColor = 'var(--border-subtle)';
            let bg = 'transparent';
            if (isCorrect) { borderColor = 'rgba(16,185,129,0.5)'; bg = 'rgba(16,185,129,0.1)'; }
            if (isWrong) { borderColor = 'rgba(244,63,94,0.4)'; bg = 'rgba(244,63,94,0.08)'; }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={locked || submitting}
                className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  border: `1px solid ${borderColor}`,
                  background: bg,
                  color: 'var(--text-primary)',
                  cursor: locked ? 'default' : 'pointer',
                  opacity: locked && !isSelected ? 0.4 : 1,
                }}
              >
                <span
                  className="inline-block w-5 h-5 rounded-full text-center text-[10px] font-black mr-3 leading-5"
                  style={{
                    background: isSelected ? (isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)') : 'var(--bg-elevated)',
                    border: `1px solid ${isSelected ? borderColor : 'var(--border-subtle)'}`,
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Inline feedback */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-4 rounded-xl"
            style={{
              background: result.correct ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
              border: `1px solid ${result.correct ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.2)'}`,
            }}
          >
            <p
              className="text-sm font-bold mb-1"
              style={{ color: result.correct ? '#10b981' : 'rgb(244,63,94)' }}
            >
              {result.correct ? '✓ Correct' : '✗ Incorrect'}
            </p>
            {result.explanation && (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {result.explanation}
              </p>
            )}
          </motion.div>
        )}

        {/* Submit error + retry/skip */}
        {submitError && !result && (
          <div className="mt-4 p-3 rounded-lg text-xs space-y-2" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
            <p>{submitError}</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setSelected(null); }}
                className="underline"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  // Skip: mark incorrect locally, allow advancing without a successful API call
                  setResult({ questionId: task.question!.id, correct: false });
                }}
                className="underline opacity-70"
              >
                Skip (mark incorrect)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator while submitting */}
      {submitting && (
        <p className="text-center text-xs" style={{ color: 'var(--text-dim)' }}>Submitting…</p>
      )}

      {/* Continue button — appears only after result */}
      {result && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onContinue}
          className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.01] hover:brightness-110"
          style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
        >
          Continue →
        </motion.button>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 4.2: Verify compile**

```bash
cd /Users/arnettmcmurray/Desktop/five-eyes-dashboard-v2 && npx tsc --noEmit
```

- [ ] **Step 4.3: Smoke-test**

Progress through to a task that has a checkpoint. Expected:
- Gold banner at top ("⬡ Checkpoint")
- Question text and 4 lettered options
- Clicking an option: locks all other options (dimmed), submits, shows correct/incorrect feedback inline
- "Continue →" button appears only after feedback
- Cannot re-select an option once one is chosen

- [ ] **Step 4.4: Commit**

```bash
git add src/pages/LearnModule.tsx
git commit -m "feat(module): implement CheckpointScreen with answer lock and inline feedback"
```

---

## Task 5: Build `DebriefScreen`

**Files:**
- Modify: `src/pages/LearnModule.tsx` — replace `DebriefScreen` stub

- [ ] **Step 5.1: Replace the `DebriefScreen` stub**

```typescript
function DebriefScreen({
  module,
  score,
  total,
  checkpointResults,
  tasks,
}: {
  module: LearnModuleResponse['module'];
  score: number;
  total: number;
  checkpointResults: CheckpointResult[];
  tasks: Task[];
  // Note: navigation uses <Link> directly (simpler than callback injection for this use-case)
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : null;
  const passed = pct !== null && pct >= 70;

  // Map questionId → task title for result rows
  const questionTaskMap = new Map<string, string>();
  for (const task of tasks) {
    if (task.question) questionTaskMap.set(task.question.id, task.studyItem.title);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <p className="label-tag-muted mb-2">Module Complete</p>
        <h1
          className="font-display font-black text-2xl md:text-3xl tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {module.title}
        </h1>
      </div>

      {/* Score ring / badge */}
      {pct !== null ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: passed ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)',
            border: `1px solid ${passed ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.2)'}`,
          }}
        >
          <p
            className="font-display font-black text-5xl mb-1"
            style={{ color: passed ? '#10b981' : 'rgb(244,63,94)' }}
          >
            {pct}%
          </p>
          <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
            {score} of {total} correct
          </p>
          <p
            className="text-xs font-black uppercase tracking-ultra mt-2"
            style={{ color: passed ? '#10b981' : 'rgb(244,63,94)' }}
          >
            {passed ? 'Passed' : 'Needs Review'}
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="font-display font-black text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            Training Complete
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No checkpoint questions in this module.</p>
        </div>
      )}

      {/* Per-task result list */}
      {checkpointResults.length > 0 && (
        <div
          className="rounded-xl p-5 space-y-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="label-tag-muted mb-3">Results by Task</p>
          {checkpointResults.map((r) => (
            <div key={r.questionId} className="flex items-center gap-3">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                style={{
                  background: r.correct ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)',
                  color: r.correct ? '#10b981' : 'rgb(244,63,94)',
                }}
              >
                {r.correct ? '✓' : '✗'}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {questionTaskMap.get(r.questionId) ?? 'Task'}
              </span>
              {!r.correct && r.explanation && (
                <span className="text-[10px] italic ml-auto" style={{ color: 'var(--text-muted)' }}>
                  {r.explanation.slice(0, 60)}{r.explanation.length > 60 ? '…' : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Remediation — recommended topics from wrong answers */}
      {(() => {
        const allTopics: LearnTopicRef[] = [];
        const seen = new Set<string>();
        for (const r of checkpointResults) {
          if (!r.correct && r.recommendedTopics) {
            for (const t of r.recommendedTopics) {
              if (!seen.has(t.slug)) { seen.add(t.slug); allTopics.push(t); }
            }
          }
        }
        if (allTopics.length === 0) return null;
        return (
          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)' }}
          >
            <p className="label-tag-muted mb-3">Recommended Review</p>
            <ul className="space-y-2">
              {allTopics.map(t => (
                <li key={t.slug}>
                  <Link
                    to={`/kb/search?q=${encodeURIComponent(t.name)}`}
                    className="text-xs font-medium underline transition-opacity hover:opacity-75"
                    style={{ color: 'var(--gold-accent)' }}
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        {module.nextModuleId && (
          <Link
            to={`/learn/modules/${module.nextModuleId}`}
            className="flex-1 text-center py-4 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.01] hover:brightness-110"
            style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
          >
            Next Module →
          </Link>
        )}
        <Link
          to="/learn/dashboard"
          className="flex-1 text-center py-4 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:opacity-80"
          style={{ background: 'var(--bg-surface)', color: 'var(--gold-accent)', border: '1px solid var(--border-gold)' }}
        >
          Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 5.2: Verify compile**

```bash
cd /Users/arnettmcmurray/Desktop/five-eyes-dashboard-v2 && npx tsc --noEmit
```

- [ ] **Step 5.3: Smoke-test full flow**

Run through an entire module. Verify:
1. Overview screen renders with task list
2. "Begin Training" enters first briefing
3. Briefing shows study content, correct CTA
4. Checkpoint locks after answer, shows feedback, "Continue →" appears
5. After last task, debrief shows score, per-task results
6. "Back to Dashboard" navigates to `/learn/dashboard`
7. If `nextModuleId` is set, "Next Module →" link is correct

- [ ] **Step 5.4: Commit**

```bash
git add src/pages/LearnModule.tsx
git commit -m "feat(module): implement DebriefScreen with score, per-task results, and CTAs"
```

---

## Task 6: Final verification

- [ ] **Step 6.1: Full TypeScript check**

```bash
cd /Users/arnettmcmurray/Desktop/five-eyes-dashboard-v2 && npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 6.2: Check that old imports from `LearnModule.tsx` are cleaned up**

The new file should NOT import `LearnTopicRef`, `RemediationItem`, `LearnReference`, or `PracticeResult` — those were used by the old implementation. Verify the import block at the top of the file matches exactly what the new code uses.

- [ ] **Step 6.3: Verify no regressions in unrelated files**

```bash
cd /Users/arnettmcmurray/Desktop/five-eyes-dashboard-v2 && npx tsc --noEmit
```

Ensure `LearnHub.tsx`, `LearnDashboard.tsx`, `App.tsx` still compile (they don't import from `LearnModule.tsx` directly — just route to it — so no change expected).

- [ ] **Step 6.4: Final commit**

```bash
git add src/pages/LearnModule.tsx
git commit -m "feat(module): complete learner module flow rewrite — forward-only task/checkpoint/debrief"
```

---

## Edge Cases Checklist

Before marking complete, verify:

| Scenario | Expected |
|----------|----------|
| Module with 0 study items | Error state (API returns 404 for unpublished) |
| Module with 0 practice questions | All tasks show "Task Complete — Continue" CTA; debrief shows "Training Complete" without score ring |
| API error on checkpoint submit | Inline error message with Retry button; selected state resets |
| Module with `nextModuleId: null` | Debrief shows only "Back to Dashboard" |
| Navigating directly to `/learn/modules/:id` without session | Redirects to `/learn` (auth guard in hook) |
