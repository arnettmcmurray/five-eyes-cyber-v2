import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, LearnerProgressDetail, type LearnerStatSummary } from '../api/client';
import { getAdminToken } from '../lib/adminSession';

// Module ID → topic category + study material recs
const MODULE_TOPICS: Record<string, { category: string; recs: string[] }> = {
  't1-phishing-email-security':   { category: 'Email & Phishing',            recs: ['Phishing Recognition Field Guide', 'Email Authentication (SPF/DKIM/DMARC)'] },
  't2-bec-payment-protection':    { category: 'Business Email Compromise',    recs: ['BEC & Payment Fraud Prevention', 'BEC Recovery Playbook'] },
  't3-account-security-mfa':      { category: 'Account Security & MFA',       recs: ['Identity & Credential Security', 'Access Control & Least Privilege'] },
  't4-invoice-fraud':             { category: 'Invoice Fraud',                recs: ['BEC & Payment Fraud Prevention', 'Operational Controls Checklist'] },
  't5-ransomware-response':       { category: 'Ransomware Response',          recs: ['Ransomware: The Full Picture', 'Incident Response Fundamentals'] },
};

const RISK_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  no_activity: { label: 'No Activity',  color: 'var(--text-dim)',    bg: 'rgba(255,255,255,0.06)' },
  stuck:       { label: 'Stuck',        color: 'var(--gold-accent)', bg: 'rgba(245,158,11,0.12)' },
  failing:     { label: 'Failing',      color: 'rgb(244,63,94)',     bg: 'rgba(244,63,94,0.12)' },
  inactive:    { label: 'Inactive',     color: 'var(--text-muted)',  bg: 'rgba(255,255,255,0.08)' },
};

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

function computeReadiness(detail: LearnerProgressDetail, totalModules: number): number {
  if (totalModules === 0) return 0;
  const completed = detail.modules.filter(m => m.status === 'completed');
  const completionRate = Math.min(completed.length / totalModules, 1) * 100;
  const pcts = completed.map(m => m.percentage).filter((p): p is number => p !== null);
  const avgScore = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;
  const passRate = completed.length > 0
    ? (pcts.filter(p => p >= 80).length / completed.length) * 100
    : 0;
  return Math.round(completionRate * 0.5 + avgScore * 0.4 + passRate * 0.1);
}

export default function AdminLearnerDetail() {
  const { learnerId } = useParams<{ learnerId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<LearnerProgressDetail | null>(null);
  const [stat, setStat] = useState<LearnerStatSummary | null>(null);
  const [totalModules, setTotalModules] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    if (!learnerId) return;
    Promise.all([
      api.adminProgress.learner(learnerId),
      api.adminProgress.overview(),
      api.modules.list(),
    ])
      .then(([d, ov, mods]) => {
        setDetail(d);
        setStat(ov.learnerStats.find(s => s.learnerId === learnerId) ?? null);
        setTotalModules(mods.length);
      })
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
  const passedCount = detail.modules.filter(m => (m.percentage ?? 0) >= 80).length;

  const bestModule = detail.modules.reduce<typeof detail.modules[0] | null>((best, m) => {
    if (m.percentage === null) return best;
    if (!best || m.percentage > (best.percentage ?? -1)) return m;
    return best;
  }, null);
  const worstModule = detail.modules.reduce<typeof detail.modules[0] | null>((worst, m) => {
    if (m.percentage === null || m.status !== 'completed') return worst;
    if (!worst || m.percentage < (worst.percentage ?? 101)) return m;
    return worst;
  }, null);

  const readiness = computeReadiness(detail, totalModules);

  // Topic struggles: completed modules where score < 70
  const struggles = detail.modules
    .filter(m => m.status === 'completed' && m.percentage !== null && (m.percentage as number) < 70)
    .map(m => ({ ...m, topic: MODULE_TOPICS[m.moduleId] }));

  // Recommendations from struggle topics
  const recs = [...new Set(struggles.flatMap(s => s.topic?.recs ?? []))].slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Back */}
      <Link to="/admin/progress" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>
        ← Progress
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-tag-muted mb-1">Learner Detail</p>
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {displayName}
          </h1>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            {detail.rawEmail && detail.fullName && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{detail.rawEmail}</p>
            )}
            {detail.company && <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{detail.company}</p>}
            {detail.role && <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{detail.role}</p>}
            <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{detail.handle}</p>
          </div>
          {stat?.riskFlags.length ? (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {stat.riskFlags.map(f => {
                const s = RISK_LABEL[f];
                return (
                  <span key={f} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Readiness gauge */}
        <div className="rounded-xl p-5 text-center shrink-0" style={{ background: 'var(--bg-surface)', border: `1px solid ${scoreColor(readiness)}40`, minWidth: '120px' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>Readiness</p>
          <p className="font-display font-black text-3xl leading-none mb-1" style={{ color: scoreColor(readiness) }}>{readiness}%</p>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: scoreColor(readiness) }}>{readinessLabel(readiness)}</p>
          <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${readiness}%`, background: scoreColor(readiness) }} />
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Modules Completed" value={`${completedModules} / ${totalModules || detail.modules.length}`} />
        <SummaryCard label="Avg Score" value={avgScore !== null ? `${avgScore}%` : '—'} highlight={avgScore !== null ? scoreColor(avgScore) : undefined} />
        <SummaryCard label="Passed (≥80%)" value={`${passedCount} / ${completedModules}`} highlight={completedModules > 0 ? scoreColor(Math.round(passedCount / completedModules * 100)) : undefined} />
        <SummaryCard label="Pass Rate" value={completedModules > 0 ? `${Math.round(passedCount / completedModules * 100)}%` : '—'} highlight={completedModules > 0 ? scoreColor(Math.round(passedCount / completedModules * 100)) : undefined} />
      </div>

      {/* Strongest / Weakest */}
      {(bestModule || worstModule) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bestModule && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#10b981' }}>▲ Strongest Module</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{bestModule.moduleTitle}</p>
              <p className="text-xl font-black mt-1" style={{ color: '#10b981' }}>{bestModule.percentage}%</p>
            </div>
          )}
          {worstModule && worstModule.moduleId !== bestModule?.moduleId && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(244,63,94,0.3)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(244,63,94)' }}>▼ Needs Improvement</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{worstModule.moduleTitle}</p>
              <p className="text-xl font-black mt-1" style={{ color: 'rgb(244,63,94)' }}>{worstModule.percentage}%</p>
            </div>
          )}
        </div>
      )}

      {/* Topic Struggles */}
      {struggles.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <p className="label-tag-muted mb-3" style={{ color: 'rgb(244,63,94)' }}>Topic Struggles Detected</p>
          <div className="space-y-2">
            {struggles.map(s => (
              <div key={s.moduleId} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{s.moduleTitle}</p>
                  {s.topic && <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{s.topic.category}</p>}
                </div>
                <span className="text-sm font-black" style={{ color: 'rgb(244,63,94)' }}>{s.percentage}%</span>
              </div>
            ))}
          </div>
          {recs.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(244,63,94,0.2)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>Recommended Study Material</p>
              <div className="flex flex-wrap gap-2">
                {recs.map(r => (
                  <span key={r} className="text-[10px] px-2 py-1 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
              const isStruggle = m.status === 'completed' && m.percentage !== null && (m.percentage as number) < 70;
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
                    borderLeft: isStruggle ? '3px solid rgba(244,63,94,0.5)' : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{m.moduleTitle}</p>
                        <StatusPill status={m.status} />
                        {isStruggle && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(244,63,94,0.12)', color: 'rgb(244,63,94)' }}>
                            Struggle Area
                          </span>
                        )}
                      </div>
                      {m.percentage !== null && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-deep)' }}>
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
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
    completed:   { bg: 'rgba(16,185,129,0.12)',   color: '#10b981',            label: 'Completed' },
    in_progress: { bg: 'rgba(245,158,11,0.12)',   color: 'var(--gold-accent)', label: 'In Progress' },
    started:     { bg: 'rgba(245,158,11,0.12)',   color: 'var(--gold-accent)', label: 'Started' },
    not_started: { bg: 'rgba(255,255,255,0.06)',  color: 'var(--text-dim)',    label: 'Not Started' },
  };
  const s = map[status] ?? map.not_started;
  return (
    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
