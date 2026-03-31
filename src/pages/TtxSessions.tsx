import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const [copied, setCopied] = useState<string | null>(null);

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

  function copyJoinLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/ttx/sessions/${id}/participate`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-dim)' }}>
      <span className="text-xs font-bold uppercase tracking-widest">Loading…</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="label-tag-muted mb-1">Tabletop Exercises</p>
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            TTX <span style={{ color: 'var(--gold-accent)' }}>Sessions</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Schedule, run, and review exercise sessions. Each session produces an After-Action Report for leadership review.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/ttx/scenarios" className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>
            Scenarios →
          </Link>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{getAdminUsername()}</span>
        </div>
      </div>

      {/* Session lifecycle strip */}
      <div className="rounded-xl px-5 py-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>Session Lifecycle</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: '01', label: 'Schedule', detail: 'Select a scenario and set the session date. Share the join link with participants.' },
            { step: '02', label: 'Conduct', detail: 'Open the command center. Advance injects in real time, track participant responses.' },
            { step: '03', label: 'After-Action Review', detail: 'Run the AAR with the team. Document gaps, decisions, and agreed follow-on actions.' },
            { step: '04', label: 'Leadership Report', detail: 'The AAR becomes the documented evidence of preparedness testing for leadership review.' },
          ].map(({ step, label, detail }) => (
            <div key={step} className="rounded-lg px-3 py-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black" style={{ color: 'var(--gold-accent)' }}>{step}</span>
                <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{label}</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
          {error}
        </div>
      )}

      {/* New Session Toggle */}
      <div>
        <button
          onClick={() => setCreating(c => !c)}
          className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.02]"
          style={creating
            ? { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }
            : { background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }
          }
        >
          {creating ? 'Cancel' : '+ New Session'}
        </button>
      </div>

      {/* Create Form */}
      {creating && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl p-6 space-y-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)' }}
        >
          <p className="label-tag-muted">New Session</p>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Scenario *</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: form.scenarioId ? 'var(--text-primary)' : 'var(--text-dim)' }}
              value={form.scenarioId}
              onChange={e => setForm(f => ({ ...f, scenarioId: e.target.value }))}
            >
              <option value="">— select scenario —</option>
              {scenarios.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Session Title *</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
              placeholder="e.g. Q2 Finance Team BEC Exercise"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Scheduled Date/Time (optional)</label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              value={form.scheduledAt}
              onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
            />
          </div>
          <button
            onClick={create}
            disabled={!form.scenarioId || !form.title}
            className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40"
            style={{ background: 'var(--gold-accent)', color: '#000' }}
          >
            Create &amp; Open Command Center
          </button>
        </motion.div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>No sessions yet. Create one above to begin an exercise.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="label-tag-muted">{sessions.length} Session{sessions.length !== 1 ? 's' : ''}</p>
          {sessions.map((s, i) => {
            const isActive = s.status === 'active';
            const isEnded = s.status === 'ended' || s.status === 'complete';
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="rounded-xl px-5 py-4 flex items-center justify-between gap-4"
                style={{
                  background: 'var(--bg-surface)',
                  border: isActive ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border-subtle)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                    <StatusPill status={s.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    {s.scheduledAt && (
                      <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                        Scheduled: {new Date(s.scheduledAt).toLocaleString()}
                      </p>
                    )}
                    {s.startedAt && (
                      <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                        Started: {new Date(s.startedAt).toLocaleString()}
                      </p>
                    )}
                    <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                      {s.participantCount ?? 0} participant{(s.participantCount ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isEnded && (
                    <button
                      onClick={() => copyJoinLink(s.id)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: copied === s.id ? '#10b981' : 'var(--text-muted)' }}
                    >
                      {copied === s.id ? '✓ Copied' : 'Join Link'}
                    </button>
                  )}
                  {isEnded && (
                    <Link
                      to={`/ttx/sessions/${s.id}/aar`}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                    >
                      View AAR
                    </Link>
                  )}
                  <Link
                    to={`/ttx/sessions/${s.id}/conduct`}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110"
                    style={{ background: isActive ? 'rgba(16,185,129,0.15)' : 'var(--gold-muted)', border: isActive ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border-gold)', color: isActive ? '#10b981' : 'var(--gold-accent)' }}
                  >
                    {isActive ? 'Live Control' : isEnded ? 'Review' : 'Initialize'}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    active:   { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Live' },
    planned:  { bg: 'rgba(245,158,11,0.12)', color: 'var(--gold-accent)', label: 'Planned' },
    ended:    { bg: 'var(--bg-elevated)', color: 'var(--text-dim)', label: 'Ended' },
    complete: { bg: 'var(--bg-elevated)', color: 'var(--text-dim)', label: 'Complete' },
  };
  const s = styles[status] ?? styles.planned;
  return (
    <span
      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
