import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  api,
  type LearnModuleResponse,
  type LearnStudyItem,
  type LearnPracticeQuestion,
  type PracticeResultItem,
  type LearnTopicRef,
  type RemediationItem,
  type LearnReference,
  type KBHelpResult,
} from '../api/client';
import { getSessionToken } from '../lib/session';
import { STUDY_CHAPTERS } from '../data/studyMaterial';

// Module slug → relevant Study Material topic IDs
const MODULE_STUDY_LINKS: Record<string, string[]> = {
  't1-phishing-email-security': [
    'phishing-recognition-field-guide',
    'social-engineering',
    'email-authentication',
    'identity-credential-security',
  ],
  't2-bec-payment-protection': [
    'bec-payment-fraud',
    'operational-controls',
    'bec-recovery-playbook',
    'double-brokering-cargo-theft',
  ],
  't3-account-security-mfa': [
    'identity-credential-security',
    'access-control-least-privilege',
    'email-authentication',
    'ransomware-full-picture',
  ],
  't4-invoice-fraud': [
    'bec-payment-fraud',
    'bec-recovery-playbook',
    'operational-controls',
  ],
  't5-ransomware-response': [
    'ransomware-full-picture',
    'ransomware-syndicates',
    'incident-response',
    'pre-incident-indicators',
  ],
};

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
  remediationItems?: RemediationItem[];
};

// ── Task synthesis ────────────────────────────────────────────────────────────

function buildTasks(
  studyItems: LearnStudyItem[],
  questions: LearnPracticeQuestion[],
): Task[] {
  const ordered = [...studyItems].sort((a, b) => {
    if (a.role === 'primary' && b.role !== 'primary') return -1;
    if (b.role === 'primary' && a.role !== 'primary') return 1;
    return 0;
  });
  return ordered.map((item, i) => ({
    index: i,
    studyItem: item,
    question: questions[i],
  }));
}

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
      const result = await api.learn.practice(moduleId, [
        { questionId: task.question.id, selectedIndex: optionIndex },
      ]);
      const item: PracticeResultItem | undefined = result.results[0];
      const checkpoint: CheckpointResult = {
        questionId: task.question.id,
        correct: item?.correct ?? false,
        explanation: item?.explanation ?? result.remediationItems[0]?.excerpt,
        recommendedTopics: result.recommendedTopics,
        remediationItems: result.remediationItems,
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
        references={data.references}
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
        moduleId={id!}
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
      moduleId={id!}
    />
  );
}

// ── OverviewScreen ────────────────────────────────────────────────────────────

function OverviewScreen({
  module,
  tasks,
  references,
  onBegin,
}: {
  module: LearnModuleResponse['module'];
  tasks: Task[];
  references: LearnReference[];
  onBegin: () => void;
}) {
  const studyLinks = useMemo(() => {
    const topicIds = MODULE_STUDY_LINKS[module.slug] ?? [];
    const results: { id: string; label: string; tagline: string; chapterLabel: string }[] = [];
    for (const chapter of STUDY_CHAPTERS) {
      for (const topic of chapter.topics) {
        if (topicIds.includes(topic.id)) {
          results.push({ id: topic.id, label: topic.label, tagline: topic.tagline, chapterLabel: chapter.label });
        }
      }
    }
    return results;
  }, [module.slug]);

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
        className="rounded-xl p-5 space-y-1"
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
              style={{
                background: i === 0 ? 'var(--gold-muted)' : 'var(--bg-elevated)',
                border: `1px solid ${i === 0 ? 'var(--border-gold)' : 'var(--border-subtle)'}`,
                color: i === 0 ? 'var(--gold-accent)' : 'var(--text-muted)',
              }}
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

      {/* Reference materials */}
      {references.length > 0 && (
        <ReferencesSection references={references} />
      )}

      {/* Study Material cross-references */}
      {studyLinks.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="label-tag-muted mb-4">Recommended Reading — Reference Library</p>
          <div className="space-y-2">
            {studyLinks.map(link => (
              <Link
                key={link.id}
                to={`/learn/library/${link.id}`}
                className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{link.label}</p>
                  <p className="text-[10px] mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{link.tagline}</p>
                </div>
                <span className="text-[10px] shrink-0 mt-0.5" style={{ color: 'var(--gold-accent)' }}>→</span>
              </Link>
            ))}
          </div>
          <p className="text-[10px] mt-3" style={{ color: 'var(--text-dim)' }}>
            These articles support deeper understanding. Reading them before or after the module is recommended.
          </p>
        </div>
      )}

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
          to="/learn/dashboard"
          className="text-xs font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}

// ── BriefingScreen ────────────────────────────────────────────────────────────

function BriefingScreen({
  task,
  taskIndex,
  totalTasks,
  moduleId,
  onNext,
}: {
  task: Task;
  taskIndex: number;
  totalTasks: number;
  moduleId: string;
  onNext: () => void;
}) {
  const pct = Math.round((taskIndex / totalTasks) * 100);
  const [expanded, setExpanded] = useState(false);

  const content = task.studyItem.content ?? '';
  const firstBreak = content.indexOf('\n\n');
  const preview = firstBreak > 0 && firstBreak < 600 ? content.slice(0, firstBreak) : content.slice(0, 400);
  const hasMore = content.length > preview.length;

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
          {expanded || !hasMore ? content : preview}
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-3 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--gold-accent)' }}
          >
            {expanded ? '← Show less' : 'Read full article →'}
          </button>
        )}
      </div>

      {/* Help panel — available during study, not during checkpoint */}
      <HelpPanel moduleId={moduleId} />

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

// ── CheckpointScreen ──────────────────────────────────────────────────────────

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
    if (selected !== null || submitting) return;
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
            const isCorrect = result?.correct === true && isSelected;
            const isWrong = result?.correct === false && isSelected;

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
                    background: isSelected
                      ? (isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)')
                      : 'var(--bg-elevated)',
                    border: `1px solid ${isSelected ? borderColor : 'var(--border-subtle)'}`,
                    color: 'var(--text-muted)',
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

      {/* Submitting indicator */}
      {submitting && (
        <p className="text-center text-xs" style={{ color: 'var(--text-dim)' }}>Submitting…</p>
      )}

      {/* Continue — appears only after result */}
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

// ── DebriefScreen ─────────────────────────────────────────────────────────────

function DebriefScreen({
  module,
  score,
  total,
  checkpointResults,
  tasks,
  moduleId,
}: {
  module: LearnModuleResponse['module'];
  score: number;
  total: number;
  checkpointResults: CheckpointResult[];
  tasks: Task[];
  moduleId: string;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : null;
  const passed = pct !== null && pct >= 70;

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

      {/* Score badge */}
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

      {/* Per-task results */}
      {checkpointResults.length > 0 && (
        <div
          className="rounded-xl p-5 space-y-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="label-tag-muted mb-3">Results by Task</p>
          {checkpointResults.map((r) => (
            <div key={r.questionId} className="space-y-1.5 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                  style={{
                    background: r.correct ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)',
                    color: r.correct ? '#10b981' : 'rgb(244,63,94)',
                  }}
                >
                  {r.correct ? '✓' : '✗'}
                </span>
                <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
                  {questionTaskMap.get(r.questionId) ?? 'Task'}
                </span>
                <span
                  className="text-[9px] font-black uppercase tracking-widest shrink-0"
                  style={{ color: r.correct ? '#10b981' : 'rgb(244,63,94)' }}
                >
                  {r.correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              {!r.correct && r.explanation && (
                <p className="text-xs leading-relaxed pl-8" style={{ color: 'var(--text-secondary)' }}>
                  {r.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Remediation — KB items for wrong answers */}
      <RemediationSection checkpointResults={checkpointResults} tasks={tasks} />

      {/* Help panel */}
      <HelpPanel moduleId={moduleId} />

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

      {/* Study Material nudge */}
      <div
        className="rounded-xl px-5 py-4 flex items-center justify-between"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Want to go deeper?</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            The Study Material library has full reference articles on every topic in this module.
          </p>
        </div>
        <Link
          to="/learn/library"
          className="shrink-0 ml-4 text-[10px] font-black uppercase tracking-ultra px-3 py-2 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)', border: '1px solid var(--border-gold)' }}
        >
          Browse →
        </Link>
      </div>
    </motion.div>
  );
}

// ── HelpPanel ─────────────────────────────────────────────────────────────────
// Grounded KB help — calls GET /learn/modules/:id/help?q=...
// Available during briefing (study) and debrief. NOT during checkpoint.

function HelpPanel({ moduleId }: { moduleId: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KBHelpResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await api.learn.help(moduleId, q);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border-subtle)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: 'var(--bg-surface)' }}
      >
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Knowledge Base
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 space-y-3" style={{ background: 'var(--bg-surface)' }}>
          <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
            Search for definitions, context, or related concepts from this module's knowledge base.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') search(); }}
              placeholder="Ask a question…"
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              onClick={search}
              disabled={loading || !query.trim()}
              className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
              style={{ background: 'var(--gold-accent)', color: '#000' }}
            >
              {loading ? '…' : 'Search'}
            </button>
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'rgb(244,63,94)' }}>{error}</p>
          )}

          {result && result.hits.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              No results found. Try different terms.
            </p>
          )}

          {result && result.hits.length > 0 && (
            <div className="space-y-3 pt-1">
              {result.hits.map((hit, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3 space-y-1"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                >
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {hit.title}
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {hit.excerpt}
                  </p>
                  {hit.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {hit.topics.map(t => (
                        <span
                          key={t.slug}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest"
                          style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)', border: '1px solid var(--border-gold)' }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ReferencesSection ─────────────────────────────────────────────────────────
// Renders the references[] array (faq, glossary-term, policy, threat-brief items)
// shown on the overview screen as supplementary material.

function ReferencesSection({ references }: { references: LearnReference[] }) {
  const [open, setOpen] = useState(false);

  const TYPE_LABELS: Record<string, string> = {
    'faq': 'FAQ',
    'glossary-term': 'Glossary',
    'policy': 'Policy',
    'threat-brief': 'Threat Brief',
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border-subtle)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 text-left"
        style={{ background: 'var(--bg-surface)' }}
      >
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Reference Materials ({references.length})
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-2 space-y-3" style={{ background: 'var(--bg-surface)' }}>
          {references.map(ref => (
            <div
              key={ref.id}
              className="rounded-lg p-3 space-y-1"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                >
                  {TYPE_LABELS[ref.type] ?? ref.type}
                </span>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {ref.title}
                </p>
              </div>
              {ref.excerpt && (
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {ref.excerpt}
                </p>
              )}
              {ref.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {ref.topics.map(t => (
                    <span
                      key={t.slug}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest"
                      style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)', border: '1px solid var(--border-gold)' }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── RemediationSection ────────────────────────────────────────────────────────
// Shows KB item cards for wrong answers in debrief.
// Falls back to topic search links when remediationItems is empty
// (e.g. bootstrap accounts with no FTS chunks — Phase B will fix this).

function RemediationSection({
  checkpointResults,
  tasks,
}: {
  checkpointResults: CheckpointResult[];
  tasks: Task[];
}) {
  const wrongAnswers = checkpointResults.filter(r => !r.correct);
  if (wrongAnswers.length === 0) return null;

  const questionTaskMap = new Map<string, string>();
  for (const task of tasks) {
    if (task.question) questionTaskMap.set(task.question.id, task.studyItem.title);
  }

  // Collect all remediation items across wrong answers (deduped by title)
  const allItems: RemediationItem[] = [];
  const seenTitles = new Set<string>();
  for (const r of wrongAnswers) {
    if (r.remediationItems) {
      for (const item of r.remediationItems) {
        if (!seenTitles.has(item.title)) {
          seenTitles.add(item.title);
          allItems.push(item);
        }
      }
    }
  }

  // Fallback: collect topic links when no KB items were returned
  const fallbackTopics: LearnTopicRef[] = [];
  const seenTopics = new Set<string>();
  if (allItems.length === 0) {
    for (const r of wrongAnswers) {
      if (r.recommendedTopics) {
        for (const t of r.recommendedTopics) {
          if (!seenTopics.has(t.slug)) { seenTopics.add(t.slug); fallbackTopics.push(t); }
        }
      }
    }
  }

  if (allItems.length === 0 && fallbackTopics.length === 0) return null;

  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.15)' }}
    >
      <p className="label-tag-muted">Recommended Review</p>

      {allItems.length > 0 ? (
        <div className="space-y-3">
          {allItems.map((item, i) => (
            <div
              key={i}
              className="rounded-lg p-3 space-y-1"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </p>
              {item.excerpt && (
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {item.excerpt}
                </p>
              )}
              {item.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.topics.map(t => (
                    <Link
                      key={t.slug}
                      to={`/learn/library`}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest transition-opacity hover:opacity-75"
                      style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)', border: '1px solid var(--border-gold)' }}
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Review these topics in the Study Material library:
          </p>
          <ul className="space-y-1.5">
            {fallbackTopics.map(t => (
              <li key={t.slug}>
                <Link
                  to="/learn/library"
                  className="text-xs font-semibold transition-opacity hover:opacity-75 flex items-center gap-1.5"
                  style={{ color: 'var(--gold-accent)' }}
                >
                  <span>→</span> {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
