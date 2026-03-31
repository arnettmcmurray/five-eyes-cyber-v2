import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
            TTX <span style={{ color: 'var(--gold-accent)' }}>Scenarios</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Build and manage your exercise scenario library. Each scenario can be run as one or more live sessions with different teams.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/ttx/sessions" className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>
            Sessions →
          </Link>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{getAdminUsername()}</span>
        </div>
      </div>

      {/* Executive context banner */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg px-4 py-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--gold-accent)' }}>What is TTX</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              A tabletop exercise (TTX) is a facilitated team simulation. Participants walk through a realistic threat scenario and practise the decisions, communications, and escalation steps a real incident demands — before one happens.
            </p>
          </div>
          <div className="rounded-lg px-4 py-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--gold-accent)' }}>What It Produces</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Each session generates an After-Action Report (AAR): documented decision patterns, identified process gaps, and agreed follow-on actions. The AAR is the deliverable leadership reviews — not a score, a real gap analysis.
            </p>
          </div>
          <div className="rounded-lg px-4 py-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--gold-accent)' }}>Workflow</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {['Build scenario', 'Run session', 'Conduct & injects', 'AAR report'].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{step}</span>
                  {i < arr.length - 1 && <span style={{ color: 'var(--text-dim)' }}>→</span>}
                </span>
              ))}
            </div>
            <p className="text-[10px] mt-2" style={{ color: 'var(--text-dim)' }}>
              Scenarios are reusable. Run the same scenario against different teams or quarterly.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
          {error}
        </div>
      )}

      {/* New Scenario Toggle */}
      <div>
        <button
          onClick={() => setCreating(c => !c)}
          className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.02]"
          style={creating
            ? { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }
            : { background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }
          }
        >
          {creating ? 'Cancel' : '+ New Scenario'}
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
          <p className="label-tag-muted">New Scenario</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Slug *</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                placeholder="e.g. bec-freight-hijack"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Title *</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                placeholder="Scenario title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              rows={2}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Objective <span style={{ color: 'var(--gold-accent)' }}>(AI will draft sections if provided)</span>
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              rows={2}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
              value={form.objective}
              onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
            />
          </div>
          <button
            onClick={create}
            disabled={!form.slug || !form.title}
            className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40"
            style={{ background: 'var(--gold-accent)', color: '#000' }}
          >
            Create Scenario
          </button>
        </motion.div>
      )}

      {/* Scenario List */}
      {scenarios.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>No scenarios yet. Create one above or run the bootstrap to seed the BEC and Ransomware scenarios.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="label-tag-muted">{scenarios.length} Scenario{scenarios.length !== 1 ? 's' : ''}</p>
          {scenarios.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="rounded-xl px-5 py-4 flex items-center justify-between gap-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                  {s.signatureTheme && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)', border: '1px solid var(--border-gold)' }}>
                      {s.signatureTheme}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>{s.slug}</p>
                  {(s.sectionCount !== undefined || s.stepCount !== undefined) && (
                    <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                      {s.sectionCount ?? 0} section{s.sectionCount !== 1 ? 's' : ''} · {s.stepCount ?? 0} step{s.stepCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                {s.executiveSummary && (
                  <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{s.executiveSummary}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
                <Link
                  to={`/ttx/scenarios/${s.id}`}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', color: 'var(--gold-accent)' }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => remove(s.id)}
                  className="text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-100 opacity-40"
                  style={{ color: 'rgb(244,63,94)' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
