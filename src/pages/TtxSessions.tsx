import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, TtxExerciseRun, TtxScenario } from '../api/client';
import { getAdminToken, getAdminUsername } from '../lib/adminSession';

export default function TtxSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TtxExerciseRun[]>([]);
  const [scenarios, setScenarios] = useState<TtxScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ scenarioId: '', title: '', scheduledAt: '' });

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    load();
  }, []);

  async function load() {
    try {
      const [s, sc] = await Promise.all([api.ttx.sessions.list(), api.ttx.scenarios.list()]);
      setSessions(s);
      setScenarios(sc);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    if (!form.scenarioId || !form.title) return;
    try {
      const s = await api.ttx.sessions.create({
        scenarioId: form.scenarioId,
        title: form.title,
        scheduledAt: form.scheduledAt || undefined,
      });
      navigate(`/ttx/sessions/${s.id}/conduct`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const statusBadge = (status: string) => {
    const cls = status === 'active' ? 'bg-green-100 text-green-800' : status === 'ended' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800';
    return <span className={`px-2 py-0.5 rounded text-xs font-mono ${cls}`}>{status}</span>;
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">TTX Sessions</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/ttx/scenarios" className="text-blue-600 hover:underline">Scenarios</Link>
          <Link to="/kb" className="text-gray-500 hover:underline">KB</Link>
          <span className="text-gray-400">{getAdminUsername()}</span>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-6">
        <button onClick={() => setCreating(c => !c)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
          {creating ? 'Cancel' : '+ New Session'}
        </button>
      </div>

      {creating && (
        <div className="border rounded p-4 mb-6 bg-gray-50 space-y-3">
          <h2 className="font-semibold">New Session</h2>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Scenario *</label>
            <select className="border w-full px-2 py-1 rounded text-sm" value={form.scenarioId}
              onChange={e => setForm(f => ({ ...f, scenarioId: e.target.value }))}>
              <option value="">— select —</option>
              {scenarios.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Session Title *</label>
            <input className="border w-full px-2 py-1 rounded text-sm" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Scheduled (optional)</label>
            <input type="datetime-local" className="border px-2 py-1 rounded text-sm" value={form.scheduledAt}
              onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
          </div>
          <button onClick={create} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Create</button>
        </div>
      )}

      {sessions.length === 0 ? (
        <p className="text-gray-500">No sessions yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Participants</th>
              <th className="py-2 pr-4">Scheduled</th>
              <th className="py-2 pr-4">Started</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">
                  <Link to={`/ttx/sessions/${s.id}/conduct`} className="text-blue-600 hover:underline font-medium">
                    {s.title}
                  </Link>
                </td>
                <td className="py-2 pr-4">{statusBadge(s.status)}</td>
                <td className="py-2 pr-4 text-gray-500 text-xs text-center">
                  {(s as any).participantCount ?? 0}
                </td>
                <td className="py-2 pr-4 text-gray-400 text-xs">
                  {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : '—'}
                </td>
                <td className="py-2 pr-4 text-gray-400 text-xs">
                  {s.startedAt ? new Date(s.startedAt).toLocaleString() : '—'}
                </td>
                <td className="py-2 flex gap-3 items-center">
                  <Link to={`/ttx/sessions/${s.id}/conduct`} className="text-xs text-blue-600 hover:underline">
                    {s.status === 'active' ? 'Conduct' : s.status === 'complete' ? 'View' : 'Initialize'}
                  </Link>
                  {s.status !== 'complete' && (
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/ttx/sessions/${s.id}/participate`)}
                      className="text-xs text-gray-400 hover:text-gray-600 hover:underline border px-1.5 py-0.5 rounded">
                      Join link
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
