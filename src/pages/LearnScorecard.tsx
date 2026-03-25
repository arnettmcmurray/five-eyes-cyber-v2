import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, type LearnModulesResponse, type AttemptSummary } from '../api/client';
import { getSessionToken, getStoredHandle } from '../lib/session';

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
      <div>
        <p className="label-tag-muted mb-2">Progress Report</p>
        <h1 className="font-display font-black text-2xl tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
          Scorecard
        </h1>
        {handle && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{handle}</p>
        )}
      </div>

      {/* Summary row */}
      {scores.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Completed', value: completed.length, color: '#10b981' },
            { label: 'In Progress', value: inProgress.length, color: 'var(--gold-accent)' },
            { label: 'Passed', value: `${passedCount}/${totalWithAttempts || completed.length}`, color: '#10b981' },
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

              {/* Score */}
              {s.bestPct !== null ? (
                <div className="text-right shrink-0">
                  <p
                    className="font-display font-black text-lg leading-none"
                    style={{ color: s.passed ? '#10b981' : 'rgb(244,63,94)' }}
                  >
                    {s.bestPct}%
                  </p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: s.passed ? '#10b981' : 'rgb(244,63,94)' }}>
                    {s.passed ? 'Passed' : 'Review'}
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

      <div className="text-center">
        <Link to="/learn/dashboard" className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          ← Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}
