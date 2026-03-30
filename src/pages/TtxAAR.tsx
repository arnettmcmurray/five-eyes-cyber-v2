import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, TtxAARSummary, TtxExport } from '../api/client';
import { getAdminToken, getAdminUsername } from '../lib/adminSession';

export default function TtxAAR() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exportData, setExportData] = useState<TtxExport | null>(null);
  const [aar, setAar] = useState<TtxAARSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    if (!confirm('Finalize After-Action Report? This will mark the session as complete.')) return;
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

  if (loading) return (
    <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-dim)' }}>
      <span className="text-xs font-bold uppercase tracking-widest">Generating Report…</span>
    </div>
  );

  if (!exportData || !aar) return (
    <div className="p-8 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
      {error || 'Session failed to export'}
    </div>
  );

  const session = exportData.session;
  const isFinal = session.status === 'complete';
  const durationMin = session.startedAt && session.endedAt
    ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
    : null;
  const observationCount = exportData.events.filter(e => ['decision', 'action'].includes(e.eventType)).length;
  const timelineEvents = exportData.events.filter(e => ['decision', 'action', 'narrative_delivered', 'inject_delivered'].includes(e.eventType));

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    borderRadius: '0.75rem',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">

      {/* Status bar */}
      <div
        className="h-1 rounded-full"
        style={{ background: isFinal ? '#10b981' : 'var(--gold-accent)' }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/ttx/sessions"
              className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-dim)' }}
            >
              ← Sessions
            </Link>
            <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>|</span>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
              Post-Exercise Documentation
            </span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            After-Action <span style={{ color: 'var(--gold-accent)' }}>Report</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{session.title}</p>
          {session.startedAt && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
              Conducted: {new Date(session.startedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
            style={isFinal
              ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
              : { background: 'rgba(245,158,11,0.12)', color: 'var(--gold-accent)', border: '1px solid rgba(245,158,11,0.3)' }
            }
          >
            {isFinal ? 'Official Record' : 'Draft Report'}
          </span>
          {!isFinal && (
            <button
              onClick={finalizeAAR}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40"
              style={{ background: 'var(--gold-accent)', color: '#000' }}
            >
              Finalize Report
            </button>
          )}
          <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{getAdminUsername()}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Duration', value: durationMin !== null ? `${durationMin} min` : '—' },
          { label: 'Participants', value: exportData.participants.length },
          { label: 'Observations', value: observationCount },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl p-5 text-center"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <p className="font-display font-black text-2xl mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Executive Summary */}
      <section className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Executive Summary</p>
          {!isFinal && !editingAAR && (
            <button
              onClick={() => setEditingAAR(true)}
              className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: 'var(--gold-accent)' }}
            >
              Edit
            </button>
          )}
        </div>
        <div className="p-6">
          {editingAAR ? (
            <div className="space-y-4">
              <textarea
                style={{ ...inputStyle, minHeight: '160px', resize: 'vertical' }}
                placeholder="Draft the executive summary of exercise outcomes…"
                value={summary}
                onChange={e => setSummary(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={saveAAR}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40"
                  style={{ background: 'var(--gold-accent)', color: '#000' }}
                >
                  Save Narrative
                </button>
                <button
                  onClick={() => setEditingAAR(false)}
                  className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:opacity-70"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: aar.summary ? 'var(--text-secondary)' : 'var(--text-dim)', fontStyle: aar.summary ? 'normal' : 'italic' }}>
              {aar.summary || 'No narrative summary drafted yet.'}
            </p>
          )}
        </div>
      </section>

      {/* Remediation Action Catalog */}
      <section className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Remediation Action Catalog</p>
          {!isFinal && (
            <button
              onClick={() => setAddingItem(v => !v)}
              className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: addingItem ? 'var(--text-dim)' : 'var(--gold-accent)' }}
            >
              {addingItem ? 'Close' : '+ New Finding'}
            </button>
          )}
        </div>

        {addingItem && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-4"
            style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Finding Heading</label>
              <input style={inputStyle} placeholder="e.g. Identity Management Gap" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Required Action</label>
              <textarea style={{ ...inputStyle, minHeight: '96px', resize: 'vertical' }} placeholder="Detail the remedial steps required…" value={newItem.body} onChange={e => setNewItem(p => ({ ...p, body: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Owner</label>
                <input style={inputStyle} placeholder="e.g. SOC_MANAGER" value={newItem.owner} onChange={e => setNewItem(p => ({ ...p, owner: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Due Date</label>
                <input type="date" style={inputStyle} value={newItem.dueAt} onChange={e => setNewItem(p => ({ ...p, dueAt: e.target.value }))} />
              </div>
            </div>
            <button
              onClick={addActionItem}
              disabled={saving || !newItem.body}
              className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40"
              style={{ background: 'var(--gold-accent)', color: '#000' }}
            >
              Confirm Finding
            </button>
          </motion.div>
        )}

        {aar.actionItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm italic" style={{ color: 'var(--text-dim)' }}>No remediation items identified.</p>
          </div>
        ) : (
          <div>
            {aar.actionItems.map((item, i) => (
              <div
                key={item.id}
                className="px-6 py-5"
                style={{ borderBottom: i < aar.actionItems.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title || 'Untitled Finding'}</p>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                      <span>Owner: <span style={{ color: 'var(--gold-accent)' }}>{item.owner || 'UNASSIGNED'}</span></span>
                      {item.dueAt && <span>Due: {new Date(item.dueAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={
                        item.status === 'open'
                          ? { background: 'rgba(244,63,94,0.12)', color: 'rgb(244,63,94)' }
                          : item.status === 'retesting'
                            ? { background: 'rgba(245,158,11,0.12)', color: 'var(--gold-accent)' }
                            : { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                      }
                    >
                      {item.status}
                    </span>
                    {!isFinal && item.status !== 'closed' && (
                      <button
                        onClick={() => updateItemStatus(item.id, 'closed')}
                        className="text-[10px] font-bold uppercase tracking-widest transition-colors"
                        style={{ color: 'var(--text-dim)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#10b981')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tactical Timeline */}
      <section className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Tactical Timeline Snapshot</p>
        </div>
        {timelineEvents.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm italic" style={{ color: 'var(--text-dim)' }}>No timeline events recorded.</p>
          </div>
        ) : (
          <div>
            {timelineEvents.map((ev, i) => (
              <div
                key={ev.id}
                className="flex items-start gap-4 px-6 py-3"
                style={{ borderBottom: i < timelineEvents.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
              >
                <span className="font-mono text-[10px] shrink-0 pt-0.5 w-20" style={{ color: 'var(--text-dim)' }}>
                  {new Date(ev.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                  style={ev.eventType.includes('delivered')
                    ? { background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-dim)' }
                  }
                >
                  {ev.eventType.replace('_delivered', '')}
                </span>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{ev.actorHandle} </span>
                  {ev.body.slice(0, 140)}{ev.body.length > 140 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Export */}
      <div className="flex justify-center pt-4">
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
          className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-dim)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export JSON Intelligence Packet
        </button>
      </div>

    </div>
  );
}
