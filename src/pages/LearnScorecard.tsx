import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, type LearnModulesResponse, type AttemptSummary } from '../api/client';
import { getSessionToken, getStoredHandle } from '../lib/session';
import { STUDY_CHAPTERS } from '../data/studyMaterial';

const MODULE_STUDY_RECS: Record<string, string[]> = {
  't1-phishing-email-security':   ['phishing-recognition-field-guide', 'email-authentication'],
  't2-bec-payment-protection':    ['bec-payment-fraud', 'bec-recovery-playbook'],
  't3-account-security-mfa':      ['identity-credential-security', 'access-control-least-privilege'],
  't4-invoice-fraud':             ['bec-payment-fraud', 'operational-controls'],
  't5-ransomware-response':       ['ransomware-full-picture', 'incident-response'],
};

const MODULE_TOPICS: Record<string, { category: string }> = {
  't1-phishing-email-security':   { category: 'Email & Phishing' },
  't2-bec-payment-protection':    { category: 'Business Email Compromise' },
  't3-account-security-mfa':      { category: 'Account Security & MFA' },
  't4-invoice-fraud':             { category: 'Invoice Fraud' },
  't5-ransomware-response':       { category: 'Ransomware Response' },
};

function findTopic(id: string) {
  for (const ch of STUDY_CHAPTERS) {
    const t = ch.topics.find(t => t.id === id);
    if (t) return { topic: t, chapter: ch };
  }
  return null;
}

function scoreColor(pct: number): string {
  if (pct >= 80) return '#10b981';
  if (pct >= 60) return 'var(--gold-accent)';
  return 'rgb(244,63,94)';
}

function readinessLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Developing';
  if (score >= 40) return 'Needs Attention';
  return 'At Risk';
}

function computeReadiness(scores: ModuleScore[]): number {
  if (scores.length === 0) return 0;
  const completed = scores.filter(s => s.status === 'completed');
  const completionRate = Math.min(completed.length / scores.length, 1) * 100;
  const pcts = completed.map(s => s.bestPct).filter((p): p is number => p !== null);
  const avgScore = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;
  const passRate = completed.length > 0
    ? (pcts.filter(p => p >= 80).length / completed.length) * 100
    : 0;
  return Math.round(completionRate * 0.5 + avgScore * 0.4 + passRate * 0.1);
}

interface ModuleScore {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'not_started';
  bestScore: number | null;
  bestTotal: number | null;
  bestPct: number | null;
  attemptCount: number;
  passed: boolean;
}

export default function LearnScorecard() {
  const navigate = useNavigate();
  const handle = getStoredHandle();
  const [scores, setScores] = useState<ModuleScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getSessionToken()) { navigate('/learn', { replace: true }); return; }

    api.learn.modules()
      .then(async (data: LearnModulesResponse) => {
        const results: ModuleScore[] = [];

        for (const m of data.modules) {
          if (m.locked) continue;

          const status: ModuleScore['status'] = m.completed
            ? 'completed'
            : m.inProgress
              ? 'in_progress'
              : 'not_started';

          let bestScore: number | null = null;
          let bestTotal: number | null = null;
          let bestPct: number | null = null;
          let attemptCount = 0;
          let passed = false;

          if (m.inProgress || m.completed) {
            try {
              const attempts: AttemptSummary[] = await api.learn.attempts(m.id);
              attemptCount = attempts.length;
              if (attempts.length > 0) {
                const best = attempts.reduce((a, b) => a.percentage >= b.percentage ? a : b);
                bestScore = best.score;
                bestTotal = best.total;
                bestPct = best.percentage;
                passed = best.passed;
              }
            } catch {
              // Attempt fetch failed — show module without score detail
            }
          }

          results.push({ id: m.id, title: m.title, status, bestScore, bestTotal, bestPct, attemptCount, passed });
        }

        setScores(results);
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [navigate]);

  const completed = scores.filter(s => s.status === 'completed');
  const inProgress = scores.filter(s => s.status === 'in_progress');
  const notStarted = scores.filter(s => s.status === 'not_started');
  const passedCount = scores.filter(s => s.passed).length;
  const totalWithAttempts = scores.filter(s => s.attemptCount > 0).length;

  const allPcts = scores.filter(s => s.bestPct !== null).map(s => s.bestPct as number);
  const avgScore = allPcts.length > 0 ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : null;

  const bestModule = scores.reduce<ModuleScore | null>((best, s) => {
    if (s.bestPct === null) return best;
    if (!best || s.bestPct > (best.bestPct ?? -1)) return s;
    return best;
  }, null);
  const worstModule = scores.reduce<ModuleScore | null>((worst, s) => {
    if (s.bestPct === null || s.status !== 'completed') return worst;
    if (!worst || s.bestPct < (worst.bestPct ?? 101)) return s;
    return worst;
  }, null);

  const struggles = scores.filter(s => s.status === 'completed' && s.bestPct !== null && (s.bestPct as number) < 70);

  const readiness = computeReadiness(scores);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Loading…</span>
    </div>
  );

  if (error) return (
    <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
      {error}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-tag-muted mb-2">Progress Report</p>
          <h1 className="font-display font-black text-2xl tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            Scorecard
          </h1>
          {handle && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{handle}</p>
          )}
        </div>
        {scores.length > 0 && (
          <div className="rounded-xl p-5 text-center shrink-0" style={{ background: 'var(--bg-surface)', border: `1px solid ${scoreColor(readiness)}40`, minWidth: '110px' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>Readiness</p>
            <p className="font-display font-black text-3xl leading-none mb-1" style={{ color: scoreColor(readiness) }}>{readiness}%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: scoreColor(readiness) }}>{readinessLabel(readiness)}</p>
            <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${readiness}%`, background: scoreColor(readiness) }} />
            </div>
          </div>
        )}
      </div>

      {/* Summary row */}
      {scores.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Completed', value: String(completed.length), color: '#10b981' },
            { label: 'In Progress', value: String(inProgress.length), color: 'var(--gold-accent)' },
            { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', color: avgScore !== null ? scoreColor(avgScore) : 'var(--text-primary)' },
            { label: 'Passed', value: `${passedCount} / ${totalWithAttempts || completed.length}`, color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-4 text-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="font-display font-black text-2xl mb-0.5" style={{ color }}>{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Strongest / Weakest */}
      {(bestModule || worstModule) && completed.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bestModule && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#10b981' }}>▲ Strongest Module</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{bestModule.title}</p>
              <p className="text-xl font-black mt-1" style={{ color: '#10b981' }}>{bestModule.bestPct}%</p>
            </div>
          )}
          {worstModule && worstModule.id !== bestModule?.id && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(244,63,94,0.3)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(244,63,94)' }}>▼ Needs Improvement</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{worstModule.title}</p>
              <p className="text-xl font-black mt-1" style={{ color: 'rgb(244,63,94)' }}>{worstModule.bestPct}%</p>
            </div>
          )}
        </div>
      )}

      {/* Topic Struggles */}
      {struggles.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgb(244,63,94)' }}>Topic Struggles Detected</p>
          <div className="space-y-2">
            {struggles.map(s => {
              const slugKey = Object.keys(MODULE_TOPICS).find(k => s.id.includes(k));
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                    {slugKey && <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{MODULE_TOPICS[slugKey].category}</p>}
                  </div>
                  <span className="text-sm font-black" style={{ color: 'rgb(244,63,94)' }}>{s.bestPct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Module score rows */}
      {scores.length > 0 ? (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Module Results</p>
          </div>
          {scores.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottom: i < scores.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
            >
              {/* Status dot */}
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: s.status === 'completed'
                    ? '#10b981'
                    : s.status === 'in_progress'
                      ? 'var(--gold-accent)'
                      : 'var(--border-subtle)',
                }}
              />

              {/* Title + status */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {s.status === 'completed' ? 'Completed' : s.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  {s.attemptCount > 0 && ` · ${s.attemptCount} attempt${s.attemptCount !== 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Score + bar */}
              {s.bestPct !== null ? (
                <div className="text-right shrink-0 min-w-[72px]">
                  <p
                    className="font-display font-black text-lg leading-none"
                    style={{ color: scoreColor(s.bestPct) }}
                  >
                    {s.bestPct}%
                  </p>
                  <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)', width: '72px' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${s.bestPct}%`,
                        background: scoreColor(s.bestPct),
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <p className="text-[9px] font-bold mt-0.5" style={{ color: s.passed ? '#10b981' : 'rgb(244,63,94)' }}>
                    {s.passed ? 'Passed' : 'Retake'}
                  </p>
                </div>
              ) : (
                <span className="text-xs shrink-0" style={{ color: 'var(--text-dim)' }}>—</span>
              )}

              <Link
                to={`/learn/modules/${s.id}`}
                className="shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                {s.status === 'not_started' ? 'Start' : 'Review'}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No modules assigned yet.</p>
          <Link
            to="/learn/dashboard"
            className="inline-block mt-3 text-xs font-black uppercase tracking-widest"
            style={{ color: 'var(--gold-accent)' }}
          >
            Go to Dashboard →
          </Link>
        </div>
      )}

      {/* Study recommendations for modules not yet passed */}
      {(() => {
        const unpassed = scores.filter(s => !s.passed && s.status !== 'not_started');
        if (unpassed.length === 0) return null;
        const recs: { moduleTitle: string; topicId: string; topicTitle: string; href: string }[] = [];
        for (const m of unpassed) {
          const slugMatch = Object.keys(MODULE_STUDY_RECS).find(k => m.id.includes(k) || m.title.toLowerCase().includes(k.split('-')[1]));
          if (!slugMatch) continue;
          for (const tid of MODULE_STUDY_RECS[slugMatch].slice(0, 2)) {
            const found = findTopic(tid);
            if (found) recs.push({ moduleTitle: m.title, topicId: tid, topicTitle: found.topic.title, href: `/learn/library/${tid}` });
          }
        }
        if (recs.length === 0) return null;
        return (
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Recommended Reading</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>Based on modules not yet passed</p>
            </div>
            {recs.slice(0, 4).map((r, i) => (
              <Link
                key={i}
                to={r.href}
                className="flex items-center gap-4 px-5 py-3 transition-opacity hover:opacity-80"
                style={{ borderBottom: i < Math.min(recs.length, 4) - 1 ? '1px solid var(--border-subtle)' : undefined, textDecoration: 'none' }}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--gold-accent)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{r.topicTitle}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>Supports: {r.moduleTitle}</p>
                </div>
                <span className="text-[10px] font-bold shrink-0" style={{ color: 'var(--gold-accent)' }}>Read →</span>
              </Link>
            ))}
          </div>
        );
      })()}

      <div className="text-center">
        <Link to="/learn/dashboard" className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          ← Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}
