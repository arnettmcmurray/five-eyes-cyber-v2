import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, TtxAAR as TtxAARType, TtxExport, TtxActionItem } from '../api/client';
import { getAdminToken, getAdminUsername } from '../lib/adminSession';

export default function TtxAAR() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exportData, setExportData] = useState<TtxExport | null>(null);
  const [aar, setAar] = useState<TtxAARType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [summary, setSummary] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [editingAAR, setEditingAAR] = useState(false);

  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ body: '', owner: '', dueAt: '' });

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    load();
  }, [id]);

  async function load() {
    try {
      const exp = await api.ttx.sessions.export(id!);
      setExportData(exp);
      if (exp.aar) {
        setAar(exp.aar);
        setSummary(exp.aar.summary);
        setStrengths(exp.aar.strengths);
        setImprovements(exp.aar.improvements);
      } else {
        setEditingAAR(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function saveAAR() {
    setSaving(true);
    try {
      const saved = await api.ttx.sessions.aar.save(id!, { summary, strengths, improvements });
      setAar(prev => ({ ...(prev ?? { actionItems: [] }), ...saved }));
      setEditingAAR(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function finalizeAAR() {
    if (!confirm('Finalize this AAR? It will be marked as final.')) return;
    setSaving(true);
    try {
      const saved = await api.ttx.sessions.aar.finalize(id!);
      setAar(prev => prev ? { ...prev, status: saved.status } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function addActionItem() {
    if (!newItem.body) return;
    setSaving(true);
    try {
      const item = await api.ttx.sessions.aar.addActionItem(id!, {
        body: newItem.body,
        owner: newItem.owner || undefined,
        dueAt: newItem.dueAt || undefined,
      });
      setAar(prev => prev ? { ...prev, actionItems: [...prev.actionItems, item] } : prev);
      setNewItem({ body: '', owner: '', dueAt: '' });
      setAddingItem(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function updateItemStatus(item: TtxActionItem, status: string) {
    try {
      const updated = await api.ttx.sessions.aar.updateActionItem(id!, item.id, { status });
      setAar(prev => prev ? { ...prev, actionItems: prev.actionItems.map(x => x.id === item.id ? updated : x) } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!exportData) return <div className="p-6 text-red-600">{error ?? 'Not found'}</div>;

  const session = exportData.session;
  const isFinal = aar?.status === 'final';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/ttx/sessions/${id}`} className="text-gray-400 hover:underline text-sm">← Console</Link>
          <h1 className="text-2xl font-bold">After-Action Review</h1>
          {aar && (
            <span className={`px-2 py-0.5 rounded text-xs font-mono ${isFinal ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {aar.status}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-400">{getAdminUsername()}</span>
      </div>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* Session summary */}
      <div className="border rounded p-4 mb-6 bg-gray-50 text-sm">
        <div className="grid grid-cols-3 gap-4">
          <div><span className="text-gray-500">Session:</span> {session.title}</div>
          <div><span className="text-gray-500">Status:</span> {session.status}</div>
          <div><span className="text-gray-500">Scenario:</span> {exportData.scenario?.title ?? '—'}</div>
          <div><span className="text-gray-500">Started:</span> {session.startedAt ? new Date(session.startedAt).toLocaleString() : '—'}</div>
          <div><span className="text-gray-500">Ended:</span> {session.endedAt ? new Date(session.endedAt).toLocaleString() : '—'}</div>
          <div><span className="text-gray-500">Participants:</span> {exportData.participants.length}</div>
        </div>
      </div>

      {/* Participants */}
      {exportData.participants.length > 0 && (
        <div className="border rounded mb-6">
          <div className="px-4 py-2 border-b bg-gray-50 font-medium text-sm">Participants</div>
          <div className="divide-y text-sm">
            {exportData.participants.map(p => (
              <div key={p.id} className="flex gap-4 px-4 py-2">
                <span className="font-medium w-40">{p.handle}</span>
                <span className="text-gray-500">{p.role || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event log */}
      <div className="border rounded mb-6">
        <div className="px-4 py-2 border-b bg-gray-50 font-medium text-sm">
          Event Timeline ({exportData.events.length})
        </div>
        <div className="divide-y text-sm max-h-64 overflow-y-auto">
          {exportData.events.length === 0 && <p className="p-3 text-gray-400">No events.</p>}
          {exportData.events.map(ev => (
            <div key={ev.id} className="flex gap-3 px-4 py-2">
              <span className="text-gray-400 text-xs w-24 shrink-0 mt-0.5">{new Date(ev.occurredAt).toLocaleTimeString()}</span>
              <span className={`text-xs font-mono px-1 rounded shrink-0 self-start mt-0.5 ${ev.eventType === 'inject_delivered' ? 'bg-blue-100 text-blue-700' : ev.eventType === 'decision' ? 'bg-green-100 text-green-700' : ev.eventType === 'action' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}>
                {ev.eventType}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-medium mr-2">{ev.actorHandle}</span>
                <span className="text-gray-700">{ev.body}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AAR content */}
      <div className="border rounded mb-6">
        <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-50">
          <span className="font-medium text-sm">AAR Content</span>
          {aar && !isFinal && !editingAAR && (
            <div className="flex gap-2">
              <button onClick={() => setEditingAAR(true)} className="text-xs text-blue-600 hover:underline">Edit</button>
              <button onClick={finalizeAAR} disabled={saving} className="text-xs text-green-600 hover:underline disabled:opacity-50">Finalize</button>
            </div>
          )}
        </div>
        <div className="p-4">
          {editingAAR ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Summary</label>
                <textarea className="border w-full px-2 py-1 rounded text-sm" rows={3} value={summary}
                  onChange={e => setSummary(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Strengths</label>
                <textarea className="border w-full px-2 py-1 rounded text-sm" rows={3} value={strengths}
                  onChange={e => setStrengths(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Areas for Improvement</label>
                <textarea className="border w-full px-2 py-1 rounded text-sm" rows={3} value={improvements}
                  onChange={e => setImprovements(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button onClick={saveAAR} disabled={saving} className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50">Save</button>
                {aar && <button onClick={() => setEditingAAR(false)} className="px-3 py-1 border rounded text-sm">Cancel</button>}
              </div>
            </div>
          ) : aar ? (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-1">Summary</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{aar.summary || <em className="text-gray-400">None</em>}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Strengths</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{aar.strengths || <em className="text-gray-400">None</em>}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Areas for Improvement</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{aar.improvements || <em className="text-gray-400">None</em>}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No AAR yet.</p>
          )}
        </div>
      </div>

      {/* Action items */}
      {aar && (
        <div className="border rounded mb-6">
          <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-50">
            <span className="font-medium text-sm">Action Items ({aar.actionItems.length})</span>
            {!isFinal && (
              <button onClick={() => setAddingItem(a => !a)} className="text-xs text-blue-600 hover:underline">
                {addingItem ? 'Cancel' : '+ Add'}
              </button>
            )}
          </div>

          {addingItem && (
            <div className="px-4 py-3 border-b bg-gray-50 space-y-2">
              <textarea className="border w-full px-2 py-1 rounded text-sm" rows={2} placeholder="Action item *"
                value={newItem.body} onChange={e => setNewItem(n => ({ ...n, body: e.target.value }))} />
              <div className="flex gap-2">
                <input className="border flex-1 px-2 py-1 rounded text-sm" placeholder="Owner"
                  value={newItem.owner} onChange={e => setNewItem(n => ({ ...n, owner: e.target.value }))} />
                <input type="date" className="border px-2 py-1 rounded text-sm" value={newItem.dueAt}
                  onChange={e => setNewItem(n => ({ ...n, dueAt: e.target.value }))} />
                <button onClick={addActionItem} disabled={saving || !newItem.body}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50">Add</button>
              </div>
            </div>
          )}

          <div className="divide-y text-sm">
            {aar.actionItems.length === 0 && <p className="p-3 text-gray-400">No action items yet.</p>}
            {aar.actionItems.map(item => (
              <div key={item.id} className="flex justify-between items-start px-4 py-3">
                <div className="flex-1">
                  <p className="text-gray-800">{item.body}</p>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                    {item.owner && <span>Owner: {item.owner}</span>}
                    {item.dueAt && <span>Due: {new Date(item.dueAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${item.status === 'closed' ? 'bg-green-100 text-green-700' : item.status === 'retesting' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.status}
                  </span>
                  {!isFinal && item.status === 'open' && (
                    <button onClick={() => updateItemStatus(item, 'closed')} className="text-xs text-green-600 hover:underline">Close</button>
                  )}
                  {!isFinal && item.status === 'open' && (
                    <button onClick={() => updateItemStatus(item, 'retesting')} className="text-xs text-yellow-600 hover:underline">Retest</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <div className="text-sm text-gray-500">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ttx-export-${id}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="text-blue-600 hover:underline">
          Download export JSON ↓
        </button>
      </div>
    </div>
  );
}
