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
  type AccessOverride,
} from '../api/client';
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

type SortOption = 'name' | 'last_active' | 'completions';

function ByLearner() {
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
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
    Promise.all([api.adminProgress.learners(), api.admin.access.list()])
      .then(([ls, acs]) => {
        setLearners(ls);
        setOverrides(new Map(acs.map((a: AccessOverride) => [a.learnerId, a.tier])));
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
    // last_active
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
                  {/* Stats */}
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-bold" style={{ color: 'var(--gold-accent)' }}>{l.totalCompleted} completed</p>
                    <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{l.totalStarted} started · {l.lastActivityAt ? new Date(l.lastActivityAt).toLocaleDateString() : 'no activity'}</p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{isOpen ? '▲' : '▼'}</span>
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
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<ModuleProgressDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api.modules.list()
      .then(setModules)
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
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.title}</p>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={m.published ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' } : { background: 'var(--bg-elevated)', color: 'var(--text-dim)' }}
                  >
                    {m.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {detailLoading ? (
                    <p className="text-xs py-3" style={{ color: 'var(--text-dim)' }}>Loading…</p>
                  ) : detail && detail.learners.length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {detail.learners.map(l => (
                        <div
                          key={l.learnerId}
                          className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                        >
                          <p className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{l.handle}</p>
                          <div className="flex items-center gap-4 shrink-0">
                            <ModuleStatusBadge status={l.status} />
                            <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                              {l.score != null && l.total != null ? `${l.score}/${l.total} (${l.percentage}%)` : '—'}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                              {new Date(l.lastAttemptAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
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

function ByGroup() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [memberMap, setMemberMap] = useState<Map<string, LearnerSummary[]>>(new Map());
  const [memberLoading, setMemberLoading] = useState<string | null>(null);

  useEffect(() => {
    api.adminProgress.groups()
      .then(setGroups)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  function toggleGroup(groupId: string) {
    if (expanded === groupId) { setExpanded(null); return; }
    setExpanded(groupId);
    if (memberMap.has(groupId)) return;
    setMemberLoading(groupId);
    api.adminProgress.groupDetail(groupId)
      .then(d => setMemberMap(prev => new Map(prev).set(groupId, d.learners)))
      .catch(() => setMemberMap(prev => new Map(prev).set(groupId, [])))
      .finally(() => setMemberLoading(null));
  }

  if (error) return <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>{error}</div>;
  if (loading) return <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Loading…</p>;
  if (groups.length === 0) return <p className="text-sm" style={{ color: 'var(--text-dim)' }}>No groups yet.</p>;

  return (
    <div className="space-y-2">
      {groups.map((g, i) => {
        const isOpen = expanded === g.groupId;
        const members = memberMap.get(g.groupId) ?? [];
        return (
          <motion.div
            key={g.groupId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: isOpen ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)' }}
          >
            <button
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-all"
              onClick={() => toggleGroup(g.groupId)}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
                <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--text-dim)' }}>{g.slug}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{g.memberCount}</p>
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>members</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: 'var(--gold-accent)' }}>{g.totalCompleted}</p>
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>completions</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    {g.avgPercentage != null ? `${g.avgPercentage}%` : '—'}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>avg score</p>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>
            {isOpen && (
              <div className="px-5 pb-4 pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {memberLoading === g.groupId ? (
                  <p className="text-xs py-3" style={{ color: 'var(--text-dim)' }}>Loading members…</p>
                ) : members.length === 0 ? (
                  <p className="text-xs py-3" style={{ color: 'var(--text-dim)' }}>No members in this group.</p>
                ) : (
                  <div className="space-y-1 mt-3">
                    {members.map(m => (
                      <div
                        key={m.learnerId}
                        className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                      >
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/admin/progress/${m.learnerId}`}
                            className="text-xs font-bold hover:underline"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {m.fullName ?? m.rawEmail ?? m.handle}
                          </Link>
                          {m.rawEmail && m.fullName && (
                            <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{m.rawEmail}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <p className="text-[10px] font-bold" style={{ color: 'var(--gold-accent)' }}>{m.totalCompleted} completed</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                            {m.lastActivityAt ? new Date(m.lastActivityAt).toLocaleDateString() : 'no activity'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
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
