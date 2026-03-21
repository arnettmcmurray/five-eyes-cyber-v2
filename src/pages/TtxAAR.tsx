import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, TtxAARSummary, TtxExport, TtxActionItem } from '../api/client';
import { getAdminToken, getAdminUsername } from '../lib/adminSession';

export default function TtxAAR() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exportData, setExportData] = useState<TtxExport | null>(null);
  const [aar, setAar] = useState<TtxAARSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit states
  const [summary, setSummary] = useState('');
  const [editingAAR, setEditingAAR] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', body: '', owner: '', dueAt: '' });
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    load();
  }, [id]);

  async function load() {
    try {
      const [exp, aarData] = await Promise.all([
        api.ttx.sessions.export(id!),
        api.ttx.sessions.aar.get(id!)
      ]);
      setExportData(exp);
      setAar(aarData);
      setSummary(aarData.summary || '');
      if (!aarData.summary) setEditingAAR(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function saveAAR() {
    setSaving(true);
    try {
      await api.ttx.sessions.aar.save(id!, { summary });
      setAar(prev => prev ? { ...prev, summary } : prev);
      setEditingAAR(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function finalizeAAR() {
    if (!confirm('Finalize After-Action Report? This will lock all remediation items.')) return;
    setSaving(true);
    try {
      const saved = await api.ttx.sessions.aar.finalize(id!);
      setExportData(prev => prev ? { ...prev, session: { ...prev.session, status: saved.status } } : prev);
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
      const item = await api.ttx.sessions.aar.addActionItem(id!, newItem);
      setAar(prev => prev ? { ...prev, actionItems: [...prev.actionItems, item] } : prev);
      setNewItem({ title: '', body: '', owner: '', dueAt: '' });
      setAddingItem(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function updateItemStatus(itemId: string, status: string) {
    try {
      const updated = await api.ttx.sessions.aar.updateActionItem(id!, itemId, { status });
      setAar(prev => prev ? { ...prev, actionItems: prev.actionItems.map(x => x.id === itemId ? updated : x) } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Generating Report...</div>;
  if (!exportData || !aar) return <div className="p-8 text-red-600">Error: {error || 'Session failed to export'}</div>;

  const session = exportData.session;
  const isFinal = session.status === 'complete';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Report Header */}
      <div className={`h-2 ${isFinal ? 'bg-green-600' : 'bg-yellow-500'} mb-8`} />
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Link to={`/ttx/sessions/${id}/conduct`} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
               </Link>
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Post-Exercise Documentation</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">After-Action Report: {session.title}</h1>
            <p className="text-gray-500 font-medium">Exercise Conducted: {session.startedAt ? new Date(session.startedAt).toLocaleDateString() : 'Pending'}</p>
          </div>
          <div className="text-right">
             <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${isFinal ? 'text-green-700 bg-green-100 border border-green-200' : 'text-yellow-700 bg-yellow-100 border border-yellow-200'}`}>
                {isFinal ? 'Official Record' : 'Draft Report'}
             </div>
             {!isFinal && (
               <button 
                 onClick={finalizeAAR} 
                 disabled={saving}
                 className="mt-3 px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-black transition-colors disabled:opacity-50"
               >
                 Finalize Report
               </button>
             )}
          </div>
        </div>

        {/* Executive Overview */}
        <div className="grid grid-cols-3 gap-6 mb-12">
           <div className="bg-white p-6 border rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</div>
              <div className="text-xl font-bold">
                 {session.startedAt && session.endedAt 
                   ? `${Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)} MIN`
                   : "—"}
              </div>
           </div>
           <div className="bg-white p-6 border rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Participants</div>
              <div className="text-xl font-bold">{exportData.participants.length} ASSETS</div>
           </div>
           <div className="bg-white p-6 border rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Observations</div>
              <div className="text-xl font-bold">{exportData.events.filter(e => ['decision', 'action'].includes(e.eventType)).length} CAPTURED</div>
           </div>
        </div>

        {/* Narrative Summary */}
        <section className="mb-12">
           <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Executive Summary</h2>
              {!isFinal && !editingAAR && (
                <button onClick={() => setEditingAAR(true)} className="text-xs text-blue-600 font-bold uppercase tracking-tighter">Modify Content</button>
              )}
           </div>
           {editingAAR ? (
             <div className="space-y-4">
                <textarea 
                  className="w-full bg-white border border-gray-300 rounded-lg p-4 text-sm min-h-[200px] focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Draft the executive summary of the exercise outcomes..."
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                />
                <div className="flex gap-3">
                   <button onClick={saveAAR} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded uppercase tracking-widest">Save Narrative</button>
                   <button onClick={() => setEditingAAR(false)} className="px-4 py-2 border border-gray-300 text-gray-600 text-xs font-bold rounded uppercase tracking-widest">Cancel</button>
                </div>
             </div>
           ) : (
             <div className="bg-white p-8 border rounded-xl shadow-sm text-gray-700 leading-relaxed font-serif text-lg text-pre-wrap">
                {aar.summary || <em className="text-gray-400 font-sans text-sm">No narrative summary has been drafted for this exercise yet.</em>}
             </div>
           )}
        </section>

        {/* Action Catalog */}
        <section className="mb-12">
           <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Remediation Action Catalog</h2>
              {!isFinal && (
                <button onClick={() => setAddingItem(!addingItem)} className="text-xs text-blue-600 font-bold uppercase tracking-tighter">
                   {addingItem ? 'Close Form' : 'New Finding'}
                </button>
              )}
           </div>

           {addingItem && (
             <div className="bg-gray-100 p-6 border rounded-xl mb-6 space-y-4">
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Finding Heading</label>
                   <input 
                     className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm" 
                     placeholder="e.g. Identity Management Gap"
                     value={newItem.title}
                     onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                   />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Required Action</label>
                   <textarea 
                     className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm h-24" 
                     placeholder="Detail the remedial steps required..."
                     value={newItem.body}
                     onChange={e => setNewItem(prev => ({ ...prev, body: e.target.value }))}
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Owner</label>
                      <input 
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm" 
                        placeholder="e.g. SOC_MANAGER"
                        value={newItem.owner}
                        onChange={e => setNewItem(prev => ({ ...prev, owner: e.target.value }))}
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Due Date</label>
                      <input 
                        type="date"
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm" 
                        value={newItem.dueAt}
                        onChange={e => setNewItem(prev => ({ ...prev, dueAt: e.target.value }))}
                      />
                   </div>
                </div>
                <button 
                  onClick={addActionItem} 
                  disabled={saving || !newItem.body}
                  className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded uppercase tracking-widest"
                >
                  Confirm Finding
                </button>
             </div>
           )}

           <div className="space-y-4">
              {aar.actionItems.length === 0 && <div className="text-center py-12 bg-white border border-dashed rounded-xl text-gray-400 text-sm italic">No remediation items identified.</div>}
              {aar.actionItems.map(item => (
                <div key={item.id} className="bg-white border rounded-xl shadow-sm p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title || "Untitled Finding"}</h3>
                         <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            <span>Owner: <span className="text-blue-600">{item.owner || "UNASSIGNED"}</span></span>
                            {item.dueAt && <span>Due: {new Date(item.dueAt).toLocaleDateString()}</span>}
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                            item.status === 'open' ? 'bg-red-50 text-red-600 border border-red-100' :
                            item.status === 'retesting' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                            'bg-green-50 text-green-600 border border-green-100'
                         }`}>
                            {item.status}
                         </span>
                         {!isFinal && item.status !== 'closed' && (
                           <button onClick={() => updateItemStatus(item.id, 'closed')} className="text-[10px] font-bold text-gray-400 hover:text-green-600 uppercase transition-colors">Resolve</button>
                         )}
                      </div>
                   </div>
                   <p className="text-sm text-gray-600 leading-relaxed">
                      {item.body}
                   </p>
                </div>
              ))}
           </div>
        </section>

        {/* Timeline Snapshot */}
        <section>
           <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 border-b pb-2">Tactical Timeline Snapshot</h2>
           <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                 <thead>
                    <tr className="bg-gray-50 border-b text-[10px] uppercase tracking-widest font-bold text-gray-500">
                       <th className="px-6 py-3 w-32">Timestamp</th>
                       <th className="px-6 py-3 w-32">Event Class</th>
                       <th className="px-6 py-3">Observation</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y">
                    {exportData.events.filter(e => ['decision', 'action', 'narrative_delivered', 'inject_delivered'].includes(e.eventType)).map(ev => (
                      <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 font-mono text-gray-400">{new Date(ev.occurredAt).toLocaleTimeString()}</td>
                         <td className="px-6 py-4">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                               ev.eventType.includes('delivered') ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                               {ev.eventType.replace('_delivered', '')}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-gray-600">
                            <span className="font-bold text-gray-800 mr-2">{ev.actorHandle}</span>
                            {ev.body.slice(0, 120)}{ev.body.length > 120 ? '...' : ''}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>

        <div className="mt-16 pt-8 border-t text-center">
            <button 
              onClick={() => {
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `five-eyes-aar-${id}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export JSON Intelligence Packet
            </button>
        </div>
      </div>
    </div>
  );
}
