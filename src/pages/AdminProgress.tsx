import { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/kb" className="text-sm text-gray-500 hover:text-gray-800">← KB</Link>
          <Link to="/kb/modules" className="text-sm text-gray-500 hover:text-gray-800">Modules</Link>
          <Link to="/admin/assignments" className="text-sm text-gray-500 hover:text-gray-800">Assignments</Link>
          <h1 className="text-xl font-bold">Progress</h1>
        </div>
        <button
          onClick={() => { clearAdminSession(); navigate('/admin/login'); }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {getAdminUsername() ?? 'admin'} · Logout
        </button>
      </div>
      <div className="flex gap-1 border-b mb-5">
        {(['learners', 'modules', 'groups'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
              tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
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

function ByLearner() {
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<LearnerProgressDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [overrides, setOverrides] = useState<Map<string, string>>(new Map());
  const [actionPending, setActionPending] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.adminProgress.learners(),
      api.admin.access.list(),
    ])
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
      setOverrides(prev => {
        const next = new Map(prev);
        next.delete(learnerId);
        return next;
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Revoke failed');
    } finally {
      setActionPending(null);
    }
  }

  if (error) return <div className="p-3 bg-red-100 text-red-800 rounded text-sm">{error}</div>;
  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>;
  if (learners.length === 0) return <p className="text-gray-400 text-sm">No learners yet.</p>;

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b text-left text-gray-500">
          <th className="py-2 pr-4 font-medium">Handle</th>
          <th className="py-2 pr-4 font-medium">Access</th>
          <th className="py-2 pr-4 font-medium">Started</th>
          <th className="py-2 pr-4 font-medium">Completed</th>
          <th className="py-2 font-medium">Last activity</th>
        </tr>
      </thead>
      <tbody>
        {learners.map(l => {
          const tier = overrides.get(l.learnerId);
          const isPending = actionPending === l.learnerId;
          return (
            <Fragment key={l.learnerId}>
              <tr
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => selectLearner(l.learnerId)}
              >
                <td className="py-2 pr-4 font-mono text-blue-700">
                  {l.handle}
                  {l.company && <span className="ml-2 text-xs text-gray-400 font-sans">{l.company}</span>}
                </td>
                <td className="py-2 pr-4" onClick={e => e.stopPropagation()}>
                  {tier === 'individual' || tier === 'professional' || tier === 'paid' ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        tier === 'professional' || tier === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tier === 'paid' ? 'Active' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </span>
                      {tier === 'individual' && (
                        <button
                          disabled={isPending}
                          onClick={() => grantAccess(l.learnerId, 'professional')}
                          className="text-xs text-green-600 hover:text-green-800 disabled:opacity-40"
                        >
                          {isPending ? '…' : '↑ Pro'}
                        </button>
                      )}
                      <button
                        disabled={isPending}
                        onClick={() => revokeAccess(l.learnerId)}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                      >
                        Revoke
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        disabled={isPending}
                        onClick={() => grantAccess(l.learnerId, 'individual')}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 disabled:opacity-40"
                      >
                        {isPending ? '…' : 'Individual'}
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() => grantAccess(l.learnerId, 'professional')}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 disabled:opacity-40"
                      >
                        {isPending ? '…' : 'Professional'}
                      </button>
                    </div>
                  )}
                </td>
                <td className="py-2 pr-4">{l.totalStarted}</td>
                <td className="py-2 pr-4">{l.totalCompleted}</td>
                <td className="py-2 text-gray-400">
                  {l.lastActivityAt ? new Date(l.lastActivityAt).toLocaleDateString() : '—'}
                </td>
              </tr>
              {selected === l.learnerId && (
                <tr className="bg-gray-50">
                  <td colSpan={5} className="py-3 px-2">
                    {detailLoading ? (
                      <p className="text-gray-400 text-xs">Loading…</p>
                    ) : detail && detail.modules.length > 0 ? (
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="text-gray-400 border-b">
                            <th className="py-1 pr-3 text-left font-medium">Module</th>
                            <th className="py-1 pr-3 text-left font-medium">Status</th>
                            <th className="py-1 pr-3 text-left font-medium">Score</th>
                            <th className="py-1 text-left font-medium">Completed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.modules.map(m => (
                            <tr key={m.moduleId} className="border-b border-gray-100">
                              <td className="py-1 pr-3">{m.moduleTitle}</td>
                              <td className="py-1 pr-3"><StatusBadge status={m.status} /></td>
                              <td className="py-1 pr-3">
                                {m.score != null && m.total != null
                                  ? `${m.score}/${m.total} (${m.percentage}%)`
                                  : '—'}
                              </td>
                              <td className="py-1 text-gray-400">
                                {m.completedAt ? new Date(m.completedAt).toLocaleDateString() : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-400 text-xs">No module activity.</p>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
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

  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>;
  if (modules.length === 0) return <p className="text-gray-400 text-sm">No modules yet.</p>;

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b text-left text-gray-500">
          <th className="py-2 pr-4 font-medium">Module</th>
          <th className="py-2 font-medium">Published</th>
        </tr>
      </thead>
      <tbody>
        {modules.map(m => (
          <Fragment key={m.id}>
            <tr
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => selectModule(m.id)}
            >
              <td className="py-2 pr-4 font-medium text-blue-700">{m.title}</td>
              <td className="py-2 text-gray-400">{m.published ? 'Yes' : 'No'}</td>
            </tr>
            {selected === m.id && (
              <tr className="bg-gray-50">
                <td colSpan={2} className="py-3 px-2">
                  {detailLoading ? (
                    <p className="text-gray-400 text-xs">Loading…</p>
                  ) : detail && detail.learners.length > 0 ? (
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="text-gray-400 border-b">
                          <th className="py-1 pr-3 text-left font-medium">Handle</th>
                          <th className="py-1 pr-3 text-left font-medium">Status</th>
                          <th className="py-1 pr-3 text-left font-medium">Score</th>
                          <th className="py-1 text-left font-medium">Last attempt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.learners.map(l => (
                          <tr key={l.learnerId} className="border-b border-gray-100">
                            <td className="py-1 pr-3 font-mono">{l.handle}</td>
                            <td className="py-1 pr-3"><StatusBadge status={l.status} /></td>
                            <td className="py-1 pr-3">
                              {l.score != null && l.total != null
                                ? `${l.score}/${l.total} (${l.percentage}%)`
                                : '—'}
                            </td>
                            <td className="py-1 text-gray-400">
                              {new Date(l.lastAttemptAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-400 text-xs">No learner activity yet.</p>
                  )}
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

function ByGroup() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.adminProgress.groups()
      .then(setGroups)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div className="p-3 bg-red-100 text-red-800 rounded text-sm">{error}</div>;
  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>;
  if (groups.length === 0) return <p className="text-gray-400 text-sm">No groups yet.</p>;

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b text-left text-gray-500">
          <th className="py-2 pr-4 font-medium">Group</th>
          <th className="py-2 pr-4 font-medium">Members</th>
          <th className="py-2 pr-4 font-medium">Completions</th>
          <th className="py-2 font-medium">Avg score</th>
        </tr>
      </thead>
      <tbody>
        {groups.map(g => (
          <tr key={g.groupId} className="border-b hover:bg-gray-50">
            <td className="py-2 pr-4 font-medium">{g.name}</td>
            <td className="py-2 pr-4 text-gray-600">{g.memberCount}</td>
            <td className="py-2 pr-4 text-gray-600">{g.totalCompleted}</td>
            <td className="py-2 text-gray-400">
              {g.avgPercentage != null ? `${g.avgPercentage}%` : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'completed'
    ? 'bg-green-100 text-green-800'
    : 'bg-yellow-100 text-yellow-800';
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}
