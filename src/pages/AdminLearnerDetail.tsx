import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, LearnerProgressDetail } from '../api/client';
import { getAdminToken } from '../lib/adminSession';

export default function AdminLearnerDetail() {
  const { learnerId } = useParams<{ learnerId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<LearnerProgressDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    if (!learnerId) return;
    api.adminProgress.learner(learnerId)
      .then(setDetail)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [learnerId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-dim)' }}>
      <span className="text-xs font-bold uppercase tracking-widest">Loading…</span>
    </div>
  );

  if (error || !detail) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/admin/progress" className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>
        ← Back to Progress
      </Link>
      <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
        {error ?? 'Learner not found.'}
      </div>
    </div>
  );

  const displayName = detail.fullName ?? detail.rawEmail ?? detail.handle;
  const completedModules = detail.modules.filter(m => m.status === 'completed').length;
  const scores = detail.modules.filter(m => m.percentage !== null).map(m => m.percentage as number);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const bestModule = detail.modules.reduce<typeof detail.modules[0] | null>((best, m) => {
    if (m.percentage === null) return best;
    if (!best || m.percentage > (best.percentage ?? -1)) return m;
    return best;
  }, null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Back */}
      <Link to="/admin/progress" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>
        ← Progress
      </Link>

      {/* Header */}
      <div>
        <p className="label-tag-muted mb-1">Learner Detail</p>
        <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {displayName}
        </h1>
        <div className="flex items-center gap-4 mt-1 flex-wrap">
          {detail.rawEmail && detail.fullName && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{detail.rawEmail}</p>
          )}
          {detail.company && (
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{detail.company}</p>
          )}
          {detail.role && (
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{detail.role}</p>
          )}
          <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{detail.handle}</p>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Modules Completed" value={`${completedModules} / ${detail.modules.length}`} />
        <SummaryCard label="Avg Score" value={avgScore !== null ? `${avgScore}%` : '—'} highlight={avgScore !== null ? scoreColor(avgScore) : undefined} />
        <SummaryCard label="Total Attempts" value={String(detail.modules.length)} />
        <SummaryCard label="Best Module" value={bestModule?.moduleTitle ?? '—'} small />
      </div>

      {/* Module Table */}
      {detail.modules.length === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>No module activity yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="label-tag-muted">{detail.modules.length} Module{detail.modules.length !== 1 ? 's' : ''}</p>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            {detail.modules.map((m, i) => {
              const pct = m.percentage ?? 0;
              const color = scoreColor(pct);
              return (
                <motion.div
                  key={m.moduleId}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="px-5 py-4"
                  style={{
                    background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                    borderTop: i > 0 ? '1px solid var(--border-subtle)' : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{m.moduleTitle}</p>
                        <StatusPill status={m.status} />
                      </div>
                      {/* Score bar */}
                      {m.percentage !== null && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-deep)' }}>
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{ width: `${pct}%`, background: color }}
                            />
                          </div>
                          <span className="text-xs font-bold shrink-0 w-10 text-right" style={{ color }}>{pct}%</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {m.score !== null && m.total !== null && (
                        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{m.score}/{m.total}</p>
                      )}
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
                        {new Date(m.lastAttemptAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, highlight, small }: { label: string; value: string; highlight?: string; small?: boolean }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>{label}</p>
      <p className={small ? 'text-sm font-bold truncate' : 'text-xl font-black'} style={{ color: highlight ?? 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    completed: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Completed' },
    in_progress: { bg: 'rgba(245,158,11,0.12)', color: 'var(--gold-accent)', label: 'In Progress' },
    started: { bg: 'rgba(245,158,11,0.12)', color: 'var(--gold-accent)', label: 'Started' },
    not_started: { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)', label: 'Not Started' },
  };
  const s = map[status] ?? map.not_started;
  return (
    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function scoreColor(pct: number): string {
  if (pct >= 80) return '#10b981';
  if (pct >= 60) return 'var(--gold-accent)';
  return 'rgb(244,63,94)';
}
