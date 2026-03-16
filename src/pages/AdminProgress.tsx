import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  api,
  type LearnerSummary,
  type LearnerProgressDetail,
  type LearningModule,
  type ModuleProgressDetail,
} from '../api/client';
import { getAdminToken } from '../lib/adminSession';

type Tab = 'learners' | 'modules';

export default function AdminProgress() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getAdminToken()) navigate('/admin/login', { replace: true });
  }, [navigate]);

  const [tab, setTab] = useState<Tab>('learners');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Learner Progress</h1>
      <div className="flex gap-1 border-b mb-5">
        {(['learners', 'modules'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
              tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            By {t === 'learners' ? 'Learner' : 'Module'}
          </button>
        ))}
      </div>
      {tab === 'learners' ? <ByLearner /> : <ByModule />}
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

  useEffect(() => {
    api.adminProgress.learners()
      .then(setLearners)
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

  if (error) return <div className="p-3 bg-red-100 text-red-800 rounded text-sm">{error}</div>;
  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>;
  if (learners.length === 0) return <p className="text-gray-400 text-sm">No learners yet.</p>;

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b text-left text-gray-500">
          <th className="py-2 pr-4 font-medium">Handle</th>
          <th className="py-2 pr-4 font-medium">Started</th>
          <th className="py-2 pr-4 font-medium">Completed</th>
          <th className="py-2 font-medium">Last activity</th>
        </tr>
      </thead>
      <tbody>
        {learners.map(l => (
          <Fragment key={l.learnerId}>
            <tr
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => selectLearner(l.learnerId)}
            >
              <td className="py-2 pr-4 font-mono text-blue-700">{l.handle}</td>
              <td className="py-2 pr-4">{l.totalStarted}</td>
              <td className="py-2 pr-4">{l.totalCompleted}</td>
              <td className="py-2 text-gray-400">
                {l.lastActivityAt ? new Date(l.lastActivityAt).toLocaleDateString() : '—'}
              </td>
            </tr>
            {selected === l.learnerId && (
              <tr className="bg-gray-50">
                <td colSpan={4} className="py-3 px-2">
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
        ))}
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
