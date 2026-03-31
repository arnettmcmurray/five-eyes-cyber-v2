import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type LearningModule, type LearnerSummary, type Assignment, type GroupSummary, type GroupProgressDetail } from '../api/client';
import { getAdminToken } from '../lib/adminSession';

function displayName(l: { fullName?: string | null; rawEmail?: string | null; handle: string }): string {
  return l.fullName ?? l.rawEmail ?? l.handle;
}

export default function AdminAssignments() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getAdminToken()) navigate('/admin/login', { replace: true });
  }, [navigate]);

  const [modules, setModules] = useState<LearningModule[]>([]);
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  // Individual assign
  const [learnerId, setLearnerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group assign
  const [groupId, setGroupId] = useState('');
  const [groupDetail, setGroupDetail] = useState<GroupProgressDetail | null>(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupAssigning, setGroupAssigning] = useState(false);
  const [groupResult, setGroupResult] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.modules.list(), api.adminProgress.learners(), api.adminProgress.groups()])
      .then(([mods, lrns, grps]) => { setModules(mods); setLearners(lrns); setGroups(grps); })
      .catch(() => {});
  }, []);

  async function loadAssignments(modId: string) {
    setSelectedModule(modId);
    setError(null);
    setGroupResult(null);
    if (!modId) { setAssignments([]); return; }
    setLoading(true);
    try {
      setAssignments(await api.assignments.forModule(modId));
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }

  async function assignIndividual(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedModule || !learnerId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.assignments.create({ moduleId: selectedModule, learnerId });
      await loadAssignments(selectedModule);
      setLearnerId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function loadGroupDetail(gid: string) {
    setGroupId(gid);
    setGroupResult(null);
    if (!gid) { setGroupDetail(null); return; }
    setGroupLoading(true);
    try {
      setGroupDetail(await api.adminProgress.groupDetail(gid));
    } catch {
      setGroupDetail(null);
    } finally {
      setGroupLoading(false);
    }
  }

  async function assignGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedModule || !groupDetail) return;
    const already = new Set(assignments.map(a => a.learnerId).filter(Boolean));
    const toAssign = groupDetail.learners.filter(m => !already.has(m.learnerId));
    if (toAssign.length === 0) {
      setGroupResult('All group members are already assigned to this module.');
      return;
    }
    setGroupAssigning(true);
    setGroupResult(null);
    let assigned = 0;
    for (const m of toAssign) {
      try {
        await api.assignments.create({ moduleId: selectedModule, learnerId: m.learnerId });
        assigned++;
      } catch {
        // skip individual failures
      }
    }
    await loadAssignments(selectedModule);
    setGroupResult(`Assigned ${assigned} of ${toAssign.length} unassigned group members.`);
    setGroupAssigning(false);
  }

  async function remove(id: string) {
    await api.assignments.remove(id);
    setAssignments(a => a.filter(x => x.id !== id));
  }

  const assignedIds = new Set(assignments.map(a => a.learnerId).filter(Boolean) as string[]);
  const unassignedLearners = learners.filter(l => !assignedIds.has(l.learnerId));
  const selectedGroupUnassigned = groupDetail
    ? groupDetail.learners.filter(m => !assignedIds.has(m.learnerId)).length
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-tag-muted mb-1">Administration</p>
          <h1 className="font-display font-black text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Module <span style={{ color: 'var(--gold-accent)' }}>Assignments</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Assign learners or groups to modules to grant access and track progress.
          </p>
        </div>
        <Link to="/admin" className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70 shrink-0" style={{ color: 'var(--text-muted)' }}>
          ← Overview
        </Link>
      </div>

      {/* Module selector */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-dim)' }}>Select Module</label>
        <select
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          value={selectedModule}
          onChange={e => loadAssignments(e.target.value)}
        >
          <option value="">— choose a module —</option>
          {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>

      {selectedModule && (
        <>
          {/* ── Assign individual ── */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>Assign Individual Learner</p>
            <form onSubmit={assignIndividual} className="flex gap-2 flex-wrap">
              <select
                className="flex-1 min-w-[200px] px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                value={learnerId}
                onChange={e => setLearnerId(e.target.value)}
              >
                <option value="">— select learner —</option>
                {unassignedLearners.map(l => (
                  <option key={l.learnerId} value={l.learnerId}>
                    {displayName(l)}{l.company ? ` · ${l.company}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={submitting || !learnerId}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:brightness-110 disabled:opacity-40"
                style={{ background: 'var(--gold-accent)', color: '#000' }}
              >
                {submitting ? '…' : 'Assign'}
              </button>
            </form>
            {error && <p className="text-xs mt-2" style={{ color: 'rgb(244,63,94)' }}>{error}</p>}
            {unassignedLearners.length === 0 && assignments.length > 0 && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>All learners are already assigned to this module.</p>
            )}
          </div>

          {/* ── Assign group ── */}
          {groups.length > 0 && (
            <div className="rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>Assign Entire Group</p>
              <div className="flex gap-2 flex-wrap mb-3">
                <select
                  className="flex-1 min-w-[200px] px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  value={groupId}
                  onChange={e => loadGroupDetail(e.target.value)}
                >
                  <option value="">— select group —</option>
                  {groups.map(g => (
                    <option key={g.groupId} value={g.groupId}>{g.name} ({g.memberCount} members)</option>
                  ))}
                </select>
              </div>
              {groupLoading && <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Loading group…</p>}
              {groupDetail && !groupLoading && (
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{groupDetail.memberCount}</span> total members ·{' '}
                      <span className="font-bold" style={{ color: selectedGroupUnassigned > 0 ? 'var(--gold-accent)' : '#10b981' }}>{selectedGroupUnassigned}</span> not yet assigned
                    </p>
                    <form onSubmit={assignGroup}>
                      <button
                        type="submit"
                        disabled={groupAssigning || selectedGroupUnassigned === 0}
                        className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:brightness-110 disabled:opacity-40"
                        style={{ background: 'var(--gold-accent)', color: '#000' }}
                      >
                        {groupAssigning ? 'Assigning…' : `Assign ${selectedGroupUnassigned} unassigned`}
                      </button>
                    </form>
                  </div>
                  {/* Group member list */}
                  <div className="space-y-1">
                    {groupDetail.learners.map(m => {
                      const isAssigned = assignedIds.has(m.learnerId);
                      return (
                        <div
                          key={m.learnerId}
                          className="flex items-center justify-between px-3 py-2 rounded-lg"
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
                              <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{m.rawEmail}</p>
                            )}
                          </div>
                          <span
                            className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                            style={isAssigned
                              ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                              : { background: 'rgba(245,158,11,0.12)', color: 'var(--gold-accent)' }
                            }
                          >
                            {isAssigned ? 'Assigned' : 'Pending'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {groupResult && (
                    <p className="text-xs mt-2 font-bold" style={{ color: '#10b981' }}>{groupResult}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Current assignments ── */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                Current Assignments{assignments.length > 0 ? ` (${assignments.length})` : ''}
              </p>
            </div>
            {loading ? (
              <p className="px-5 py-4 text-xs" style={{ color: 'var(--text-dim)' }}>Loading…</p>
            ) : assignments.length === 0 ? (
              <p className="px-5 py-4 text-sm" style={{ color: 'var(--text-dim)' }}>No assignments yet for this module.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {assignments.map(a => {
                  const learner = learners.find(l => l.learnerId === a.learnerId);
                  const name = learner ? displayName(learner) : (a.learnerId ?? a.groupId ?? '—');
                  return (
                    <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        {learner ? (
                          <Link
                            to={`/admin/progress/${learner.learnerId}`}
                            className="text-sm font-semibold hover:underline"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {name}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</p>
                        )}
                        {learner?.company && (
                          <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{learner.company}</p>
                        )}
                      </div>
                      <p className="text-xs shrink-0" style={{ color: 'var(--text-dim)' }}>
                        {a.assignedBy} · {new Date(a.assignedAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => remove(a.id)}
                        className="text-xs shrink-0 transition-opacity hover:opacity-70"
                        style={{ color: 'rgb(244,63,94)' }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
