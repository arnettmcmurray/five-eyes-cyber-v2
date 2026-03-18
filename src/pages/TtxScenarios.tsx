import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, TtxScenario } from '../api/client';
import { getAdminToken, getAdminUsername } from '../lib/adminSession';

export default function TtxScenarios() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<TtxScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ slug: '', title: '', description: '', objective: '' });

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    load();
  }, []);

  async function load() {
    try {
      setScenarios(await api.ttx.scenarios.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    if (!form.slug || !form.title) return;
    try {
      const s = await api.ttx.scenarios.create(form);
      // If objective provided, offer AI draft on the edit page
      const qs = form.objective ? '?draft=ai' : '';
      navigate(`/ttx/scenarios/${s.id}${qs}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this scenario?')) return;
    try {
      await api.ttx.scenarios.delete(id);
      setScenarios(s => s.filter(x => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">TTX Scenarios</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/ttx/sessions" className="text-blue-600 hover:underline">Sessions</Link>
          <Link to="/kb" className="text-gray-500 hover:underline">KB</Link>
          <span className="text-gray-400">{getAdminUsername()}</span>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-6">
        <button
          onClick={() => setCreating(c => !c)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          {creating ? 'Cancel' : '+ New Scenario'}
        </button>
      </div>

      {creating && (
        <div className="border rounded p-4 mb-6 bg-gray-50 space-y-3">
          <h2 className="font-semibold">New Scenario</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug *</label>
              <input className="border w-full px-2 py-1 rounded text-sm" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title *</label>
              <input className="border w-full px-2 py-1 rounded text-sm" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea className="border w-full px-2 py-1 rounded text-sm" rows={2} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Objective</label>
            <textarea className="border w-full px-2 py-1 rounded text-sm" rows={2} value={form.objective}
              onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} />
          </div>
          <button onClick={create} className="px-3 py-1 bg-green-600 text-white rounded text-sm">
            Create
          </button>
        </div>
      )}

      {scenarios.length === 0 ? (
        <p className="text-gray-500">No scenarios yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Slug</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map(s => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">
                  <Link to={`/ttx/scenarios/${s.id}`} className="text-blue-600 hover:underline font-medium">
                    {s.title}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-gray-500 font-mono text-xs">{s.slug}</td>
                <td className="py-2 pr-4 text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="py-2">
                  <button onClick={() => remove(s.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
