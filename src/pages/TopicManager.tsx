import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type Topic } from '../api/client';
import { getAdminUsername, clearAdminSession } from '../lib/adminSession';

export default function TopicManager() {
  const navigate = useNavigate();
  const adminUsername = getAdminUsername();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTopics(await api.topics.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <Link to="/kb" className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50">← KB</Link>
          <Link to="/kb/search" className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50">Search</Link>
          <Link to="/kb/modules" className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50">Modules</Link>
          <Link to="/admin/progress" className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50">Progress</Link>
          <Link to="/admin/assignments" className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50">Assignments</Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(v => !v)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {showForm ? 'Cancel' : '+ New topic'}
          </button>
          <button
            onClick={() => { clearAdminSession(); navigate('/admin/login'); }}
            className="text-xs text-gray-400 hover:text-gray-600 border rounded px-2 py-1.5"
            title={`Logged in as ${adminUsername}`}
          >
            Logout
          </button>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">Topics</h1>

      {showForm && (
        <CreateTopicForm
          onDone={() => { setShowForm(false); load(); }}
          existingSlugs={topics.map(t => t.slug)}
          topics={topics}
        />
      )}

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded text-sm">{error}</div>}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : topics.length === 0 ? (
        <p className="text-gray-500">No topics yet.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Slug</th>
              <th className="py-2 pr-4">Parent</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {topics.map(t => (
              <tr key={t.id} className="border-b">
                <td className="py-2 pr-4 font-medium">{t.name}</td>
                <td className="py-2 pr-4 text-gray-500 font-mono text-xs">{t.slug}</td>
                <td className="py-2 pr-4 text-gray-500">
                  {t.parentTopicId ? topics.find(p => p.id === t.parentTopicId)?.name ?? t.parentTopicId : '—'}
                </td>
                <td className="py-2 text-gray-500">{t.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CreateTopicForm({ onDone, existingSlugs, topics }: {
  onDone: () => void;
  existingSlugs: string[];
  topics: Topic[];
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function derivedSlug(n: string) {
    return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const finalSlug = slug || derivedSlug(name);
    if (existingSlugs.includes(finalSlug)) {
      setErr(`Slug "${finalSlug}" already exists.`);
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await api.topics.create({
        name,
        slug: finalSlug,
        description,
        ...(parentId ? { parentTopicId: parentId } : {}),
      });
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-6 p-4 border rounded bg-gray-50 space-y-3">
      <h2 className="font-semibold text-gray-700">New Topic</h2>
      {err && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">{err}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
        <input
          className="w-full border rounded px-3 py-1.5 text-sm"
          value={name}
          onChange={e => { setName(e.target.value); if (!slug) setSlug(''); }}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Slug <span className="text-gray-400 font-normal">(auto-derived if blank)</span>
        </label>
        <input
          className="w-full border rounded px-3 py-1.5 text-sm font-mono"
          value={slug || derivedSlug(name)}
          onChange={e => setSlug(e.target.value)}
          pattern="[a-z0-9\-]+"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
        <input
          className="w-full border rounded px-3 py-1.5 text-sm"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      {topics.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Parent topic</label>
          <select
            className="border rounded px-3 py-1.5 text-sm"
            value={parentId}
            onChange={e => setParentId(e.target.value)}
          >
            <option value="">None</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}

      <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm">
        {saving ? 'Creating…' : 'Create'}
      </button>
    </form>
  );
}
