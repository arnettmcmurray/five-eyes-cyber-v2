import { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  api,
  type LearnerSummary,
  type LearnerProgressDetail,
  type LearningModule,
  type ModuleProgressDetail,
  type GroupSummary,
  type GroupProgressDetail,
  type AccessOverride,
  type LearnerStatSummary,
  type ModuleStatSummary,
} from '../api/client';

const RISK_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  no_activity: { label: 'No Activity',  color: 'var(--text-dim)',    bg: 'rgba(255,255,255,0.06)' },
  stuck:       { label: 'Stuck',         color: 'var(--gold-accent)', bg: 'rgba(245,158,11,0.12)' },
  failing:     { label: 'Failing',       color: 'rgb(244,63,94)',     bg: 'rgba(244,63,94,0.12)' },
  inactive:    { label: 'Inactive',      color: 'var(--text-muted)',  bg: 'rgba(255,255,255,0.08)' },
};

const DIFF_STYLE: Record<string, { label: string; color: string }> = {
  easy:   { label: 'Easy',   color: '#10b981' },
  medium: { label: 'Medium', color: 'var(--gold-accent)' },
  hard:   { label: 'Hard',   color: 'rgb(244,63,94)' },
};

function scoreColor(pct: number) {
  if (pct >= 80) return '#10b981';
  if (pct >= 60) return 'var(--gold-accent)';
  return 'rgb(244,63,94)';
}
import { getAdminToken, getAdminUsername, clearAdminSession } from '../lib/adminSession';

type Tab = 'learners' | 'modules' | 'groups';

export default function AdminProgress() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getAdminToken()) navigate('/admin/login', { replace: true });
  }, [navigate]);

  const [tab, setTab] = useState<Tab>('learners');

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="label-tag-muted mb-1">Administration</p>
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Learner <span style={{ color: 'var(--gold-accent)' }}>Progress</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Track completion, manage access, and view activity across learners, modules, and groups.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/admin" className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            ← Dashboard
          </Link>
          <button
            onClick={() => { clearAdminSession(); navigate('/admin/login'); }}
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-dim)' }}
          >
            {getAdminUsername() ?? 'admin'} · Logout
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {(['learners', 'modules', 'groups'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
            style={tab === t
              ? { background: 'var(--gold-accent)', color: '#000' }
              : { color: 'var(--text-muted)' }
            }
          >
            {t === 'learners' ? 'By Learner' : t === 'modules' ? 'By Module' : 'Groups'}
          </button>
        ))}
      </div>

      {tab === 'learners' && <ByLearner />}
      {tab === 'modules' && <ByModule />}
      {tab === 'groups' && <ByGroup />}
    </div>
  );
}

type SortOption = 'name' | 'last_active' | 'completions' | 'at_risk' | 'score';

function ByLearner() {
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [statMap, setStatMap] = useState<Map<string, LearnerStatSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<LearnerProgressDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [overrides, setOverrides] = useState<Map<string, string>>(new Map());
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('last_active');

  useEffect(() => {
    Promise.all([api.adminProgress.learners(), api.admin.access.list(), api.adminProgress.overview()])
      .then(([ls, acs, ov]) => {
        setLearners(ls);
        setOverrides(new Map(acs.map((a: AccessOverride) => [a.learnerId, a.tier])));
        setStatMap(new Map(ov.learnerStats.map(s => [s.learnerId, s])));
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  function selectLearner(id: string) {
    if (selected === id) { setSelected(null); setDetail(null); return; }
    setSelected(id);
    setDetailLoading(true);
    api.adminProgress.learner(id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }

  async function grantAccess(learnerId: string, tier: 'individual' | 'professional') {
    setActionPending(learnerId);
    try {
      await api.admin.access.grant(learnerId, tier);
      setOverrides(prev => new Map(prev).set(learnerId, tier));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Grant failed');
    } finally {
      setActionPending(null);
    }
  }

  async function revokeAccess(learnerId: string) {
    setActionPending(learnerId);
    try {
      await api.admin.access.revoke(learnerId);
      setOverrides(prev => { const next = new Map(prev); next.delete(learnerId); return next; });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Revoke failed');
    } finally {
      setActionPending(null);
    }
  }

  if (error) return <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>{error}</div>;
  if (loading) return <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Loading…</p>;
  if (learners.length === 0) return <p className="text-sm" style={{ color: 'var(--text-dim)' }}>No learners yet.</p>;

  const q = search.toLowerCase();
  const filtered = learners.filter(l =>
    !q ||
    (l.fullName ?? '').toLowerCase().includes(q) ||
    (l.rawEmail ?? '').toLowerCase().includes(q) ||
    l.handle.toLowerCase().includes(q) ||
    (l.company ?? '').toLowerCase().includes(q)
  ).sort((a, b) => {
    if (sort === 'name') return (a.fullName ?? a.rawEmail ?? a.handle).localeCompare(b.fullName ?? b.rawEmail ?? b.handle);
    if (sort === 'completions') return b.totalCompleted - a.totalCompleted;
    if (sort === 'score') return (statMap.get(b.learnerId)?.avgScore ?? -1) - (statMap.get(a.learnerId)?.avgScore ?? -1);
    if (sort === 'at_risk') return (statMap.get(b.learnerId)?.riskFlags.length ?? 0) - (statMap.get(a.learnerId)?.riskFlags.length ?? 0);
    const ta = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
    const tb = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
    return tb - ta;
  });

  return (
    <div className="space-y-4">
      {/* Search + Sort bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          placeholder="Search by name, email, company…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
        <select
          className="px-3 py-2 rounded-xl text-xs outline-none font-bold uppercase tracking-widest"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
        >
          <option value="last_active">Last Active</option>
          <option value="name">Name A–Z</option>
          <option value="completions">Most Completions</option>
          <option value="score">Best Score</option>
          <option value="at_risk">At Risk First</option>
        </select>
        <p className="text-[10px] font-bold uppercase tracking-widest shrink-0" style={{ color: 'var(--text-dim)' }}>
          {filtered.length} of {learners.length}
        </p>
      </div>
      <div className="space-y-2">
      {filtered.map((l, i) => {
        const tier = overrides.get(l.learnerId);
        const isPending = actionPending === l.learnerId;
        const isOpen = selected === l.learnerId;
        return (
          <Fragment key={l.learnerId}>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: isOpen ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)' }}
            >
              {/* Learner Row */}
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all"
                onClick={() => selectLearner(l.learnerId)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link
                      to={`/admin/progress/${l.learnerId}`}
                      onClick={e => e.stopPropagation()}
                      className="text-sm font-bold hover:underline"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {l.fullName ?? l.rawEmail ?? l.handle}
                    </Link>
                    {l.rawEmail && l.fullName && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.rawEmail}</p>}
                    {!l.fullName && !l.rawEmail && <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{l.handle}</p>}
                    {l.company && <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{l.company}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {/* Access tier */}
                  <div onClick={e => e.stopPropagation()} className="flex items-center gap-2">
                    {tier === 'individual' || tier === 'professional' || tier === 'paid' ? (
                      <div className="flex items-center gap-2">
                        <TierBadge tier={tier} />
                        {tier === 'individual' && (
                          <button disabled={isPending} onClick={() => grantAccess(l.learnerId, 'professional')} className="text-[9px] font-black uppercase tracking-widest transition-opacity hover:opacity-70 disabled:opacity-30" style={{ color: '#10b981' }}>
                            {isPending ? '…' : '↑ Pro'}
                          </button>
                        )}
                        <button disabled={isPending} onClick={() => revokeAccess(l.learnerId)} className="text-[9px] font-black uppercase tracking-widest transition-opacity hover:opacity-70 disabled:opacity-30" style={{ color: 'rgb(244,63,94)' }}>
                          Revoke
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button disabled={isPending} onClick={() => grantAccess(l.learnerId, 'individual')} className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest transition-all hover:brightness-110 disabled:opacity-30" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                          {isPending ? '…' : 'Individual'}
                        </button>
                        <button disabled={isPending} onClick={() => grantAccess(l.learnerId, 'professional')} className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest transition-all hover:brightness-110 disabled:opacity-30" style={{ background: 'var(--gold-muted)', border: '1px solid var(--border-gold)', color: 'var(--gold-accent)' }}>
                          {isPending ? '…' : 'Professional'}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Stats + risk badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    {(() => {
                      const stat = statMap.get(l.learnerId);
                      return stat?.riskFlags.length ? stat.riskFlags.slice(0, 2).map(f => {
                        const s = RISK_LABEL[f];
                        return (
                          <span key={f} className="hidden md:inline text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                            {s.label}
                          </span>
                        );
                      }) : null;
                    })()}
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-bold" style={{ color: 'var(--gold-accent)' }}>{l.totalCompleted} done</p>
                      {(() => {
                        const stat = statMap.get(l.learnerId);
                        return stat?.avgScore != null
                          ? <p className="text-[9px] font-bold" style={{ color: scoreColor(stat.avgScore) }}>{stat.avgScore}% avg</p>
                          : <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{l.lastActivityAt ? new Date(l.lastActivityAt).toLocaleDateString() : 'no activity'}</p>;
                      })()}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
              </button>

              {/* Detail Drawer */}
              {isOpen && (
                <div className="px-5 pb-4 pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {detailLoading ? (
                    <p className="text-xs py-3" style={{ color: 'var(--text-dim)' }}>Loading…</p>
                  ) : detail && detail.modules.length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {detail.modules.map(m => (
                        <div
                          key={m.moduleId}
                          className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                        >
                          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{m.moduleTitle}</p>
                          <div className="flex items-center gap-4 shrink-0">
                            <ModuleStatusBadge status={m.status} />
                            <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                              {m.score != null && m.total != null ? `${m.score}/${m.total} (${m.percentage}%)` : '—'}
                            </p>
                            <p className="text-[10px] hidden md:block" style={{ color: 'var(--text-dim)' }}>
                              {m.completedAt ? new Date(m.completedAt).toLocaleDateString() : '—'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-3" style={{ color: 'var(--text-dim)' }}>No module activity recorded.</p>
                  )}
                </div>
              )}
            </motion.div>
          </Fragment>
        );
      })}
      </div>
    </div>
  );
}

function ByModule() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [modStatMap, setModStatMap] = useState<Map<string, ModuleStatSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<ModuleProgressDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.modules.list(), api.adminProgress.overview()])
      .then(([mods, ov]) => {
        setModules(mods);
        setModStatMap(new Map(ov.moduleStats.map(s => [s.moduleId, s])));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function selectModule(id: string) {
    if (selected === id) { setSelected(null); setDetail(null); return; }
    setSelected(id);
    setDetailLoading(true);
    api.adminProgress.module(id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }

  if (loading) return <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Loading…</p>;
  if (modules.length === 0) return <p className="text-sm" style={{ color: 'var(--text-dim)' }}>No modules yet.</p>;

  return (
    <div className="space-y-2">
      {modules.map((m, i) => {
        const isOpen = selected === m.id;
        return (
          <Fragment key={m.id}>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: isOpen ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)' }}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => selectModule(m.id)}
              >
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.title}</p>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={m.published ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' } : { background: 'var(--bg-elevated)', color: 'var(--text-dim)' }}
                  >
                    {m.published ? 'Published' : 'Draft'}
                  </span>
                  {(() => {
                    const s = modStatMap.get(m.id);
                    if (!s || s.totalLearners === 0) return null;
                    const diff = DIFF_STYLE[s.difficulty];
                    return (
                      <>
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full hidden md:inline" style={{ color: diff.color, background: `${diff.color}18` }}>{diff.label}</span>
                        {s.avgScore != null && <span className="text-[10px] font-bold hidden md:inline" style={{ color: diff.color }}>{s.avgScore}% avg</span>}
                        {s.passRate != null && <span className="text-[10px] hidden md:inline" style={{ color: 'var(--text-dim)' }}>{s.passRate}% pass</span>}
                        <span className="text-[10px] hidden md:inline" style={{ color: 'var(--text-dim)' }}>{s.totalCompleted}/{s.totalLearners} done</span>
                      </>
                    );
                  })()}
                </div>
                <span className="text-xs shrink-0 ml-3" style={{ color: 'var(--text-dim)' }}>{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {detailLoading ? (
                    <p className="text-xs py-3" style={{ color: 'var(--text-dim)' }}>Loading…</p>
                  ) : detail && detail.learners.length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {detail.learners.map(l => {
                        const pct = l.percentage ?? 0;
                        const col = l.percentage !== null ? scoreColor(pct) : 'var(--text-dim)';
                        return (
                          <div
                            key={l.learnerId}
                            className="flex items-center gap-4 px-4 py-2.5 rounded-lg"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                          >
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/admin/progress/${l.learnerId}`}
                                className="text-xs font-bold hover:underline"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {l.fullName ?? l.rawEmail ?? l.handle}
                              </Link>
                              {(l.rawEmail && l.fullName) && (
                                <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{l.rawEmail}</p>
                              )}
                              {l.percentage !== null && (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bg-canvas)' }}>
                                    <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: col }} />
                                  </div>
                                  <span className="text-[9px] font-bold shrink-0" style={{ color: col }}>{pct}%</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <ModuleStatusBadge status={l.status} />
                              <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                                {new Date(l.lastAttemptAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs py-3" style={{ color: 'var(--text-dim)' }}>No learner activity yet.</p>
                  )}
                </div>
              )}
            </motion.div>
          </Fragment>
        );
      })}
    </div>
  );
}

const RISK_LABEL_GROUP: Record<string, { label: string; color: string; bg: string }> = {
  no_activity: { label: 'No Activity',  color: '#94a3b8',              bg: 'rgba(148,163,184,0.12)' },
  stuck:       { label: 'Stuck',        color: 'var(--gold-accent)',   bg: 'rgba(245,158,11,0.15)' },
  failing:     { label: 'Failing',      color: 'rgb(244,63,94)',        bg: 'rgba(244,63,94,0.15)' },
  inactive:    { label: 'Inactive',     color: '#94a3b8',              bg: 'rgba(148,163,184,0.12)' },
};

function ByGroup() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailMap, setDetailMap] = useState<Map<string, GroupProgressDetail>>(new Map());
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  useEffect(() => {
    api.adminProgress.groups()
      .then(setGroups)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  function toggleGroup(groupId: string) {
    if (expanded === groupId) { setExpanded(null); return; }
    setExpanded(groupId);
    if (detailMap.has(groupId)) return;
    setDetailLoading(groupId);
    api.adminProgress.groupDetail(groupId)
      .then(d => setDetailMap(prev => new Map(prev).set(groupId, d)))
      .catch(() => {})
      .finally(() => setDetailLoading(null));
  }

  if (error) return <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>{error}</div>;
  if (loading) return <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Loading…</p>;
  if (groups.length === 0) return <p className="text-sm" style={{ color: 'var(--text-dim)' }}>No groups yet.</p>;

  return (
    <div className="space-y-3">
      {groups.map((g, i) => {
        const isOpen = expanded === g.groupId;
        const detail = detailMap.get(g.groupId);
        return (
          <motion.div
            key={g.groupId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: isOpen ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)' }}
          >
            {/* Group header row */}
            <button
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-all"
              onClick={() => toggleGroup(g.groupId)}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
                <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--text-dim)' }}>{g.slug}</p>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{g.memberCount}</p>
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>members</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold" style={{ color: 'var(--gold-accent)' }}>{g.totalCompleted}</p>
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>completions</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: g.avgPercentage != null ? scoreColor(g.avgPercentage) : 'var(--text-dim)' }}>
                    {g.avgPercentage != null ? `${g.avgPercentage}%` : '—'}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>avg score</p>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* Expanded group detail */}
            {isOpen && (
              <div className="px-5 pb-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {detailLoading === g.groupId ? (
                  <p className="text-xs py-4" style={{ color: 'var(--text-dim)' }}>Loading group detail…</p>
                ) : !detail ? (
                  <p className="text-xs py-4" style={{ color: 'var(--text-dim)' }}>Failed to load group detail.</p>
                ) : (
                  <GroupDetailPanel detail={detail} />
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function GroupDetailPanel({ detail }: { detail: GroupProgressDetail }) {
  // Strongest + most at-risk learner
  const learnersSorted = [...detail.learners].filter(l => l.avgScore !== null).sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0));
  const strongestLearner = learnersSorted[0] ?? null;
  const mostAtRisk = [...detail.learners]
    .filter(l => l.riskFlags.length > 0)
    .sort((a, b) => b.riskFlags.length - a.riskFlags.length)[0] ?? null;

  // Weakest module (lowest avgScore among modules with attempts)
  const weakestModule = [...detail.moduleStats]
    .filter(m => m.avgScore !== null)
    .sort((a, b) => (a.avgScore ?? 100) - (b.avgScore ?? 100))[0] ?? null;

  // Recommended action
  function recommendedAction(): string {
    if (detail.atRiskCount > detail.memberCount / 2) return 'More than half the group is at risk — prioritize re-engagement and schedule a group review session.';
    if (weakestModule && (weakestModule.avgScore ?? 100) < 60) return `Struggling most on "${weakestModule.moduleTitle}" — consider a focused session or additional reading on that topic.`;
    if (detail.passRate !== null && detail.passRate < 70) return 'Pass rate below 70% — review module difficulty and consider supplementary material.';
    if (detail.completionRate < 30) return 'Completion rate is low — check assignment awareness and consider deadline nudges.';
    return 'Group is progressing well — focus on top performers to complete remaining modules.';
  }

  return (
    <div className="space-y-5 mt-4">

      {/* Summary stat bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GroupStatCell label="Completion Rate" value={`${detail.completionRate}%`} sub={`${detail.totalCompletions} of ${detail.memberCount * (detail.moduleStats.length || 1)} assigned`} color={scoreColor(detail.completionRate)} />
        <GroupStatCell label="Avg Score" value={detail.avgScore != null ? `${detail.avgScore}%` : '—'} sub={`${detail.totalCompletions} scored completions`} color={detail.avgScore != null ? scoreColor(detail.avgScore) : undefined} />
        <GroupStatCell label="Pass Rate" value={detail.passRate != null ? `${detail.passRate}%` : '—'} sub={`≥80% threshold`} color={detail.passRate != null ? scoreColor(detail.passRate) : undefined} />
        <GroupStatCell label="At Risk" value={String(detail.atRiskCount)} sub={`of ${detail.memberCount} members`} color={detail.atRiskCount > 0 ? 'rgb(244,63,94)' : '#10b981'} />
      </div>

      {/* Callouts: Strongest + Most At-Risk */}
      {(strongestLearner || mostAtRisk) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {strongestLearner && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>▲ Top Performer</p>
              <Link to={`/admin/progress/${strongestLearner.learnerId}`} className="text-sm font-bold hover:underline block" style={{ color: 'var(--text-primary)' }}>
                {strongestLearner.fullName ?? strongestLearner.rawEmail ?? strongestLearner.handle}
              </Link>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{strongestLearner.totalCompleted} completed · {strongestLearner.avgScore}% avg</p>
            </div>
          )}
          {mostAtRisk && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(244,63,94,0.3)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgb(244,63,94)' }}>⚠ Most At Risk</p>
              <Link to={`/admin/progress/${mostAtRisk.learnerId}`} className="text-sm font-bold hover:underline block" style={{ color: 'var(--text-primary)' }}>
                {mostAtRisk.fullName ?? mostAtRisk.rawEmail ?? mostAtRisk.handle}
              </Link>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {mostAtRisk.riskFlags.map(f => {
                  const s = RISK_LABEL_GROUP[f] ?? { label: f, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
                  return <span key={f} className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Module-by-module completion chart */}
      {detail.moduleStats.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>Module Completion — {detail.group.name}</p>
          <div className="space-y-3">
            {detail.moduleStats.map(m => {
              const completionPct = detail.memberCount > 0 ? Math.round(m.completedCount / detail.memberCount * 100) : 0;
              const scoreColor_ = m.avgScore != null ? scoreColor(m.avgScore) : 'var(--border-subtle)';
              return (
                <div key={m.moduleId}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <p className="text-xs truncate flex-1" style={{ color: 'var(--text-primary)' }}>{m.moduleTitle}</p>
                    <div className="flex items-center gap-3 shrink-0">
                      {m.avgScore != null && (
                        <span className="text-[10px] font-bold" style={{ color: scoreColor_ }}>{m.avgScore}% avg</span>
                      )}
                      {m.passRate != null && (
                        <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{m.passRate}% pass</span>
                      )}
                      <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.completedCount}/{detail.memberCount}</span>
                    </div>
                  </div>
                  {/* Dual bar: completion fill with score overlay color */}
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all"
                      style={{ width: `${completionPct}%`, background: scoreColor_ }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended action */}
      <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <span className="text-sm shrink-0 mt-0.5" style={{ color: 'var(--gold-accent)' }}>→</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--gold-accent)' }}>Recommended Action</p>
          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{recommendedAction()}</p>
        </div>
      </div>

      {/* Member table */}
      {detail.learners.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>Members ({detail.learners.length})</p>
          <div className="space-y-1.5">
            {[...detail.learners]
              .sort((a, b) => (b.avgScore ?? -1) - (a.avgScore ?? -1))
              .map(m => {
                const nameDisplay = m.fullName ?? m.rawEmail ?? m.handle;
                const hasRisk = m.riskFlags.length > 0;
                return (
                  <div
                    key={m.learnerId}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: `1px solid ${hasRisk ? 'rgba(244,63,94,0.2)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/admin/progress/${m.learnerId}`}
                        className="text-xs font-bold hover:underline"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {nameDisplay}
                      </Link>
                      {m.rawEmail && m.fullName && (
                        <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{m.rawEmail}</p>
                      )}
                    </div>
                    {/* Avg score mini bar */}
                    {m.avgScore !== null ? (
                      <div className="flex items-center gap-2 shrink-0 w-24">
                        <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bg-canvas)' }}>
                          <div className="h-1 rounded-full" style={{ width: `${m.avgScore}%`, background: scoreColor(m.avgScore) }} />
                        </div>
                        <span className="text-[10px] font-bold w-8 text-right" style={{ color: scoreColor(m.avgScore) }}>{m.avgScore}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] shrink-0 w-24 text-right" style={{ color: 'var(--text-dim)' }}>—</span>
                    )}
                    <div className="shrink-0 text-right hidden sm:block" style={{ minWidth: '56px' }}>
                      <p className="text-[10px] font-bold" style={{ color: 'var(--gold-accent)' }}>{m.totalCompleted} done</p>
                      <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>
                        {m.lastActivityAt ? new Date(m.lastActivityAt).toLocaleDateString() : 'no activity'}
                      </p>
                    </div>
                    {m.riskFlags.length > 0 && (
                      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end" style={{ maxWidth: '100px' }}>
                        {m.riskFlags.slice(0, 2).map(f => {
                          const s = RISK_LABEL_GROUP[f] ?? { label: f, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
                          return <span key={f} className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function GroupStatCell({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)' }}>
      <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>{label}</p>
      <p className="text-lg font-black" style={{ color: color ?? 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-[9px] mt-0.5 leading-snug" style={{ color: 'var(--text-dim)' }}>{sub}</p>}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    professional: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    paid:         { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    individual:   { bg: 'var(--gold-muted)', color: 'var(--gold-accent)' },
  };
  const s = styles[tier] ?? styles.individual;
  const label = tier === 'paid' ? 'Active' : tier.charAt(0).toUpperCase() + tier.slice(1);
  return (
    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {label}
    </span>
  );
}

function ModuleStatusBadge({ status }: { status: string }) {
  const completed = status === 'completed';
  return (
    <span
      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full capitalize"
      style={completed
        ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
        : { background: 'rgba(245,158,11,0.12)', color: 'var(--gold-accent)' }
      }
    >
      {status.replace('_', ' ')}
    </span>
  );
}
