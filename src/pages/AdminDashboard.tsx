import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, type OverviewStats, type LearnerStatSummary } from '../api/client';

const RISK_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  no_activity:  { label: 'No Activity',  color: '#94a3b8',              bg: 'rgba(148,163,184,0.12)' },
  stuck:        { label: 'Stuck',        color: '#f59e0b',              bg: 'rgba(245,158,11,0.15)' },
  failing:      { label: 'Failing',      color: 'rgb(244,63,94)',        bg: 'rgba(244,63,94,0.15)' },
  inactive:     { label: 'Inactive',     color: '#94a3b8',              bg: 'rgba(148,163,184,0.12)' },
};

const DIFF_LABEL: Record<string, { label: string; color: string }> = {
  easy:   { label: 'Easy',   color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  hard:   { label: 'Hard',   color: 'rgb(244,63,94)' },
};

function scoreColor(pct: number) {
  if (pct >= 80) return '#10b981';
  if (pct >= 60) return '#f59e0b';
  return 'rgb(244,63,94)';
}

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [pendingJobs, setPendingJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<{ api: 'ok' | 'error' | null; db: 'ok' | 'error' | null }>({ api: null, db: null });

  useEffect(() => {
    async function load() {
      try {
        const [ov, jobs] = await Promise.all([
          api.adminProgress.overview(),
          api.ingestJobs.list(),
        ]);
        setOverview(ov);
        setPendingJobs(jobs.filter(j => j.status === 'processing' || j.status === 'pending').length);
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    }
    async function checkHealth() {
      try {
        const h = await api.health.get();
        setHealth({ api: h.status === 'ok' ? 'ok' : 'error', db: h.db === 'ok' ? 'ok' : 'error' });
      } catch {
        setHealth({ api: 'error', db: null });
      }
    }
    load();
    checkHealth();
  }, []);

  const gs = overview?.globalStats;
  const learnerStats = overview?.learnerStats ?? [];
  const moduleStats = overview?.moduleStats ?? [];
  const groupStats = overview?.groupStats ?? [];

  // Active learner counts
  const active7d = learnerStats.filter(l => l.lastActivityAt && daysAgo(l.lastActivityAt) <= 7).length;
  const active30d = learnerStats.filter(l => l.lastActivityAt && daysAgo(l.lastActivityAt) <= 30).length;

  // Risk
  const atRisk = learnerStats.filter(l => l.riskFlags.length > 0);
  const riskBreakdown: Record<string, number> = {};
  for (const l of atRisk) for (const f of l.riskFlags) riskBreakdown[f] = (riskBreakdown[f] ?? 0) + 1;

  // Top performers
  const topPerformers = [...learnerStats]
    .filter(l => l.totalCompleted > 0)
    .sort((a, b) => (b.totalCompleted * 0.6 + (b.avgScore ?? 0) * 0.4) - (a.totalCompleted * 0.6 + (a.avgScore ?? 0) * 0.4))
    .slice(0, 5);

  // Module analytics
  const modulesByScore = [...moduleStats].filter(m => m.totalLearners > 0).sort((a, b) => (a.avgScore ?? 100) - (b.avgScore ?? 100));
  const hardestModule = modulesByScore[0] ?? null;
  const mostStruggled = modulesByScore[0] ?? null; // lowest avg score

  // Group analytics
  const groupsSorted = [...groupStats].sort((a, b) => (b.avgPercentage ?? 0) - (a.avgPercentage ?? 0));
  const lowestGroup = [...groupStats].filter(g => g.avgPercentage !== null).sort((a, b) => (a.avgPercentage ?? 100) - (b.avgPercentage ?? 100))[0] ?? null;
  const strongestGroup = groupsSorted[0] ?? null;

  // Learner completion distribution buckets
  const totalModuleCount = moduleStats.length;
  function completionBucket(learner: LearnerStatSummary): string {
    if (totalModuleCount === 0) return '0%';
    const pct = (learner.totalCompleted / totalModuleCount) * 100;
    if (pct === 0) return '0%';
    if (pct <= 25) return '1–25%';
    if (pct <= 50) return '26–50%';
    if (pct <= 75) return '51–75%';
    return '76–100%';
  }
  const buckets = ['0%', '1–25%', '26–50%', '51–75%', '76–100%'];
  const bucketCounts: Record<string, number> = Object.fromEntries(buckets.map(b => [b, 0]));
  for (const l of learnerStats) bucketCounts[completionBucket(l)]++;

  // Risk distribution for chart
  const riskFlags = ['no_activity', 'stuck', 'failing', 'inactive'] as const;

  // Priority actions — derived from live data
  interface PriorityAction { severity: 'critical' | 'warning' | 'info'; text: string; linkTo: string; cta: string; }
  const priorityActions: PriorityAction[] = [];
  if (!loading && overview) {
    const failingCount = atRisk.filter(l => l.riskFlags.includes('failing')).length;
    const noActivityCount = atRisk.filter(l => l.riskFlags.includes('no_activity')).length;
    const stuckCount = atRisk.filter(l => l.riskFlags.includes('stuck')).length;
    if (failingCount > 0) {
      priorityActions.push({ severity: 'critical', text: `${failingCount} learner${failingCount > 1 ? 's' : ''} failing — scoring below pass threshold. Review and consider retraining.`, linkTo: '/admin/progress', cta: 'View Progress' });
    }
    if (noActivityCount > 0) {
      priorityActions.push({ severity: 'warning', text: `${noActivityCount} learner${noActivityCount > 1 ? 's' : ''} have never started training. Verify assignment and follow up.`, linkTo: '/admin/assignments', cta: 'Review Assignments' });
    }
    if (stuckCount > 0) {
      priorityActions.push({ severity: 'warning', text: `${stuckCount} learner${stuckCount > 1 ? 's' : ''} started training but have not progressed. Consider a check-in.`, linkTo: '/admin/progress', cta: 'View Progress' });
    }
    if (gs && gs.totalLearners > 0 && gs.totalCompletions === 0) {
      priorityActions.push({ severity: 'info', text: 'No modules completed yet across the platform. Assign training and confirm learners can access the platform.', linkTo: '/admin/assignments', cta: 'Assign Training' });
    }
    if (gs && gs.avgCompletionRate != null && gs.avgCompletionRate < 30 && gs.totalLearners >= 3) {
      priorityActions.push({ severity: 'warning', text: `Platform completion rate is ${gs.avgCompletionRate}% — below expected level. Consider a team-wide reminder.`, linkTo: '/admin/progress', cta: 'Audit Progress' });
    }
  }

  // Recent active
  const recentActive = [...learnerStats]
    .filter(l => l.lastActivityAt)
    .sort((a, b) => new Date(b.lastActivityAt!).getTime() - new Date(a.lastActivityAt!).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <p className="label-tag-muted mb-1">Administration</p>
        <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Admin <span style={{ color: 'var(--gold-accent)' }}>Control Center</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Oversee governance, content, and learner progress.
        </p>
      </div>

      {/* ── Global Stats — with base counts ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Learners"
          value={loading ? '—' : String(gs?.totalLearners ?? 0)}
          sub={loading || !gs ? undefined : `${gs.totalWithActivity} with activity`}
        />
        <StatCard
          title="Active (7d / 30d)"
          value={loading ? '—' : `${active7d} / ${active30d}`}
          sub={loading || !gs ? undefined : `of ${gs.totalLearners} total`}
          accent
        />
        <StatCard
          title="Avg Score"
          value={loading ? '—' : gs?.avgScore != null ? `${gs.avgScore}%` : '—'}
          sub={loading || !gs ? undefined : `${gs.totalCompletions} scored completions`}
          highlight={gs?.avgScore != null ? scoreColor(gs.avgScore) : undefined}
        />
        <StatCard
          title="Platform Pass Rate"
          value={loading ? '—' : gs?.passRate != null ? `${gs.passRate}%` : '—'}
          sub={loading || !gs ? undefined : `${gs.totalCompletions} completions scored · ≥80% threshold`}
          highlight={gs?.passRate != null ? scoreColor(gs.passRate) : undefined}
        />
      </div>

      {/* ── At-Risk + Active learners row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="At-Risk Learners"
          value={loading ? '—' : String(atRisk.length)}
          sub={loading || !gs ? undefined : `of ${gs.totalLearners} learners`}
          highlight={!loading && atRisk.length > 0 ? 'rgb(244,63,94)' : !loading ? '#10b981' : undefined}
        />
        <StatCard
          title="Avg Completion Rate"
          value={loading ? '—' : gs ? `${gs.avgCompletionRate}%` : '—'}
          sub={loading || !gs ? undefined : `${gs.totalCompletions} completions · ${totalModuleCount} modules`}
          accent={false}
          highlight={gs?.avgCompletionRate != null ? scoreColor(gs.avgCompletionRate) : undefined}
        />
        <StatCard
          title="Most Struggled Module"
          value={loading ? '—' : mostStruggled ? `${mostStruggled.avgScore ?? '—'}%` : '—'}
          sub={loading ? undefined : mostStruggled ? mostStruggled.moduleTitle : 'No attempt data yet'}
          highlight={mostStruggled?.avgScore != null ? scoreColor(mostStruggled.avgScore) : undefined}
          small
        />
        <StatCard
          title="Lowest Group"
          value={loading ? '—' : lowestGroup ? `${lowestGroup.avgPercentage ?? '—'}%` : '—'}
          sub={loading ? undefined : lowestGroup ? `${lowestGroup.name} · ${lowestGroup.memberCount} members` : 'No groups yet'}
          highlight={lowestGroup?.avgPercentage != null ? scoreColor(lowestGroup.avgPercentage) : undefined}
          small
        />
      </div>

      {/* ── Priority Actions ── */}
      {!loading && priorityActions.length > 0 && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="label-tag-muted">Priority Actions</p>
          {priorityActions.map((action, i) => {
            const borderColor = action.severity === 'critical' ? 'rgba(244,63,94,0.3)' : action.severity === 'warning' ? 'rgba(245,158,11,0.3)' : 'var(--border-subtle)';
            const labelColor = action.severity === 'critical' ? 'rgb(244,63,94)' : action.severity === 'warning' ? '#f59e0b' : 'var(--text-muted)';
            const label = action.severity === 'critical' ? 'Action Required' : action.severity === 'warning' ? 'Attention Needed' : 'Recommendation';
            return (
              <div key={i} className="flex items-center justify-between gap-4 rounded-lg px-4 py-3" style={{ background: 'var(--bg-elevated)', border: `1px solid ${borderColor}` }}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-[9px] font-black uppercase tracking-widest shrink-0 px-2 py-0.5 rounded-full" style={{ color: labelColor, background: `${labelColor}18` }}>{label}</span>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{action.text}</p>
                </div>
                <Link
                  to={action.linkTo}
                  className="text-[10px] font-black uppercase tracking-widest shrink-0 px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
                  style={{ background: 'var(--gold-muted)', border: '1px solid var(--border-gold)', color: 'var(--gold-accent)' }}
                >
                  {action.cta} →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Outlier / Standout Callouts ── */}
      {!loading && overview && (hardestModule || strongestGroup || lowestGroup) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hardestModule && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(244,63,94,0.25)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(244,63,94)' }}>Hardest Module</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{hardestModule.moduleTitle}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {hardestModule.avgScore != null ? `${hardestModule.avgScore}% avg` : '—'} ·{' '}
                {hardestModule.passRate != null ? `${hardestModule.passRate}% pass rate` : '—'} ·{' '}
                {hardestModule.totalCompleted}/{hardestModule.totalLearners} done
              </p>
            </div>
          )}
          {strongestGroup && strongestGroup.avgPercentage != null && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#10b981' }}>▲ Strongest Group</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{strongestGroup.name}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {strongestGroup.avgPercentage}% avg · {strongestGroup.memberCount} members · {strongestGroup.totalCompleted} completions
              </p>
            </div>
          )}
          {lowestGroup && lowestGroup.avgPercentage != null && groupStats.length > 1 && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(244,63,94,0.25)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(244,63,94)' }}>▼ Needs Attention</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{lowestGroup.name}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {lowestGroup.avgPercentage}% avg · {lowestGroup.memberCount} members · {lowestGroup.totalCompleted} completions
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Risk Signals + Top Performers ── */}
      {!loading && overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Risk Signals */}
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="label-tag-muted">Risk Signals</p>
              <Link to="/admin/progress" className="text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>
                View All →
              </Link>
            </div>
            {atRisk.length === 0 ? (
              <div className="flex items-center gap-2 py-4">
                <span style={{ color: '#10b981' }}>✓</span>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No at-risk learners detected.</p>
              </div>
            ) : (
              <>
                {/* Risk type breakdown */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {riskFlags.filter(f => riskBreakdown[f]).map(f => {
                    const s = RISK_LABEL[f];
                    return (
                      <span key={f} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                        {riskBreakdown[f]} {s.label}
                      </span>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  {atRisk.slice(0, 6).map(l => (
                    <Link
                      key={l.learnerId}
                      to={`/admin/progress/${l.learnerId}`}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all hover:opacity-90"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          {l.fullName ?? l.rawEmail ?? l.handle}
                        </p>
                        {l.company && <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{l.company}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 ml-3 shrink-0 flex-wrap justify-end">
                        {l.riskFlags.map(f => {
                          const s = RISK_LABEL[f];
                          return (
                            <span key={f} className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                              {s.label}
                            </span>
                          );
                        })}
                      </div>
                    </Link>
                  ))}
                  {atRisk.length > 6 && (
                    <p className="text-[10px] text-center pt-1" style={{ color: 'var(--text-dim)' }}>+{atRisk.length - 6} more at-risk learners</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Top Performers */}
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <p className="label-tag-muted mb-4">Top Performers</p>
            {topPerformers.length === 0 ? (
              <p className="text-xs py-4" style={{ color: 'var(--text-dim)' }}>No completed modules yet.</p>
            ) : (
              <div className="space-y-2">
                {topPerformers.map((l, i) => (
                  <Link
                    key={l.learnerId}
                    to={`/admin/progress/${l.learnerId}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:opacity-90"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}
                  >
                    <span className="text-xs font-black w-5 text-center shrink-0" style={{ color: i === 0 ? 'var(--gold-accent)' : 'var(--text-dim)' }}>
                      #{i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {l.fullName ?? l.rawEmail ?? l.handle}
                      </p>
                      {l.company && <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{l.company}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <p className="text-[10px] font-bold" style={{ color: 'var(--gold-accent)' }}>{l.totalCompleted}</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>done</p>
                      </div>
                      {l.avgScore !== null && (
                        <div>
                          <p className="text-[10px] font-bold" style={{ color: scoreColor(l.avgScore) }}>{l.avgScore}%</p>
                          <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>avg</p>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Charts: Module Difficulty + Group Comparison ── */}
      {!loading && overview && moduleStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Module Score + Difficulty */}
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <p className="label-tag-muted mb-1">Module Difficulty</p>
            <p className="text-[10px] mb-4" style={{ color: 'var(--text-dim)' }}>Ranked by avg score — lower = harder</p>
            {modulesByScore.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>No attempt data yet.</p>
            ) : (
              <div className="space-y-3">
                {modulesByScore.map(m => {
                  const diff = DIFF_LABEL[m.difficulty];
                  const score = m.avgScore ?? 0;
                  return (
                    <div key={m.moduleId}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs truncate flex-1" style={{ color: 'var(--text-primary)' }}>{m.moduleTitle}</p>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ color: diff.color, background: `${diff.color}20` }}>{diff.label}</span>
                          <span className="text-[10px] font-bold" style={{ color: diff.color }}>{m.avgScore != null ? `${m.avgScore}%` : '—'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: diff.color }} />
                        </div>
                        <span className="text-[9px] shrink-0 w-16 text-right" style={{ color: 'var(--text-dim)' }}>
                          {m.totalCompleted}/{m.totalLearners} done
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group Comparison */}
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="label-tag-muted">Group Comparison</p>
              <Link to="/admin/progress" className="text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>
                Groups →
              </Link>
            </div>
            <p className="text-[10px] mb-4" style={{ color: 'var(--text-dim)' }}>Avg score across all completions · completion rate shown as bar fill</p>
            {groupStats.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>No groups configured yet.</p>
            ) : (
              <div className="space-y-3">
                {groupsSorted.map((g, i) => {
                  const pct = g.avgPercentage ?? 0;
                  const color = scoreColor(pct);
                  const completionPct = g.memberCount > 0 && totalModuleCount > 0
                    ? Math.round(g.totalCompleted / (g.memberCount * totalModuleCount) * 100)
                    : 0;
                  return (
                    <div key={g.groupId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {i === 0 && groupStats.length > 1 && <span className="text-[9px]" style={{ color: '#10b981' }}>▲</span>}
                          {i === groupsSorted.length - 1 && groupStats.length > 1 && <span className="text-[9px]" style={{ color: 'rgb(244,63,94)' }}>▼</span>}
                          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-2 shrink-0">
                          <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{completionPct}% complete</span>
                          <span className="text-[10px] font-bold" style={{ color }}>{g.avgPercentage != null ? `${g.avgPercentage}%` : '—'}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${completionPct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Learner Distribution + Risk Distribution Charts ── */}
      {!loading && overview && learnerStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Completion Distribution */}
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <p className="label-tag-muted mb-1">Learner Completion Distribution</p>
            <p className="text-[10px] mb-4" style={{ color: 'var(--text-dim)' }}>How far along learners are across all {totalModuleCount} modules</p>
            <div className="space-y-3">
              {buckets.map(bucket => {
                const count = bucketCounts[bucket] ?? 0;
                const pct = learnerStats.length > 0 ? Math.round(count / learnerStats.length * 100) : 0;
                const bucketColor = bucket === '0%' ? 'var(--border-subtle)' : bucket === '76–100%' ? '#10b981' : bucket === '51–75%' ? '#10b981' : bucket === '26–50%' ? '#f59e0b' : 'rgb(244,63,94)';
                return (
                  <div key={bucket}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold" style={{ color: bucket === '0%' ? 'var(--text-dim)' : 'var(--text-primary)' }}>{bucket}</p>
                      <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{count} learner{count !== 1 ? 's' : ''} · {pct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: bucketColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <p className="label-tag-muted mb-1">Risk Distribution</p>
            <p className="text-[10px] mb-4" style={{ color: 'var(--text-dim)' }}>Learners by risk type · {atRisk.length} of {learnerStats.length} flagged</p>
            {atRisk.length === 0 ? (
              <div className="flex items-center gap-2 py-6">
                <span className="text-lg">✓</span>
                <p className="text-sm font-bold" style={{ color: '#10b981' }}>No at-risk learners</p>
              </div>
            ) : (
              <div className="space-y-3">
                {riskFlags.map(flag => {
                  const count = riskBreakdown[flag] ?? 0;
                  const pct = learnerStats.length > 0 ? Math.round(count / learnerStats.length * 100) : 0;
                  const s = RISK_LABEL[flag];
                  return (
                    <div key={flag}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                        <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{count} · {pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Actions + Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="label-tag-muted mb-5">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            <ActionLink to="/kb" label="Ingest Content" desc="Add PDF / URL sources" />
            <ActionLink to="/kb/modules" label="Manage Modules" desc="Edit curricula and prerequisites" />
            <ActionLink to="/admin/assignments" label="Assign Training" desc="Bulk assign to learners" />
            <ActionLink to="/admin/progress" label="Audit Progress" desc="View detailed learner logs" />
            <ActionLink to="/ttx/scenarios" label="TTX Scenarios" desc="Manage scenario library" />
            <ActionLink to="/ttx/sessions" label="TTX Sessions" desc="Schedule, run, and review exercises" />
          </div>
        </div>

        <div className="rounded-xl p-6 self-start" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <p className="label-tag-muted mb-5">System Status</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Environment</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'var(--bg-canvas)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Local / Staging
              </span>
            </div>
            <HealthRow label="Backend API" status={health.api} />
            <HealthRow label="Database" status={health.db} />
          </div>
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="label-tag-muted mb-2">Pending Jobs</p>
            <p className="font-display font-black text-2xl" style={{ color: pendingJobs > 0 ? 'var(--gold-accent)' : 'var(--text-primary)' }}>
              {loading ? '—' : pendingJobs}
            </p>
          </div>
        </div>
      </div>

      {/* ── Recent Learner Activity ── */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-5">
          <p className="label-tag-muted">Recent Activity</p>
          <Link to="/admin/progress" className="text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>
            View All →
          </Link>
        </div>
        {loading ? (
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Loading…</p>
        ) : recentActive.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>No learner activity recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {recentActive.map(l => (
              <RecentLearnerRow key={l.learnerId} l={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecentLearnerRow({ l }: { l: LearnerStatSummary }) {
  return (
    <Link
      to={`/admin/progress/${l.learnerId}`}
      className="flex items-center justify-between px-4 py-3 rounded-lg transition-all"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {l.fullName ?? l.rawEmail ?? l.handle}
          </p>
          {l.riskFlags.length > 0 && (
            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(244,63,94,0.15)', color: 'rgb(244,63,94)' }}>
              At Risk
            </span>
          )}
        </div>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
          {l.company ? `${l.company} · ` : ''}{l.handle}
        </p>
      </div>
      <div className="flex items-center gap-4 ml-4 shrink-0 text-right">
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--gold-accent)' }}>{l.totalCompleted}</p>
          <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>done</p>
        </div>
        {l.avgScore !== null && (
          <div>
            <p className="text-xs font-bold" style={{ color: scoreColor(l.avgScore) }}>{l.avgScore}%</p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>avg</p>
          </div>
        )}
        {l.lastActivityAt && (
          <p className="text-[10px] hidden md:block" style={{ color: 'var(--text-dim)' }}>
            {new Date(l.lastActivityAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
  );
}

function HealthRow({ label, status }: { label: string; status: 'ok' | 'error' | null }) {
  const color = status === 'ok' ? '#10b981' : status === 'error' ? '#f43f5e' : 'var(--text-dim)';
  const text = status === 'ok' ? (label === 'Backend API' ? 'Healthy' : 'Connected') : status === 'error' ? 'Unreachable' : '…';
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, ...(status === 'ok' ? { animation: 'pulse 2s infinite' } : {}) }} />
        {text}
      </span>
    </div>
  );
}

function StatCard({ title, value, sub, accent, highlight, small }: {
  title: string; value: string; sub?: string; accent?: boolean; highlight?: string; small?: boolean;
}) {
  return (
    <div className="rounded-xl px-5 py-4" style={{ background: 'var(--bg-surface)', border: accent ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)' }}>
      <p className="label-tag-muted mb-1">{title}</p>
      <p className={small ? 'font-display font-black text-xl' : 'font-display font-black text-2xl'} style={{ color: highlight ?? (accent ? 'var(--gold-accent)' : 'var(--text-primary)') }}>
        {value}
      </p>
      {sub && <p className="text-[10px] mt-1 leading-snug" style={{ color: 'var(--text-dim)' }}>{sub}</p>}
    </div>
  );
}

function ActionLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <Link
      to={to}
      className="block p-4 rounded-lg transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-gold)';
        (e.currentTarget as HTMLElement).style.background = 'var(--gold-muted)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
      }}
    >
      <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
      <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{desc}</p>
    </Link>
  );
}
