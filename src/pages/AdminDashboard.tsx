import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ learners: 0, modules: 0, pendingJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<{ api: 'ok' | 'error' | null; db: 'ok' | 'error' | null }>({ api: null, db: null });

  useEffect(() => {
    async function load() {
      try {
        const [learners, modules, jobs] = await Promise.all([
          api.adminProgress.learners(),
          api.modules.list(),
          api.ingestJobs.list(),
        ]);
        setStats({
          learners: learners.length,
          modules: modules.length,
          pendingJobs: jobs.filter(j => j.status === 'processing' || j.status === 'pending').length,
        });
      } catch (err) {
        console.error('Dashboard stats error', err);
      } finally {
        setLoading(false);
      }
    }
    async function checkHealth() {
      try {
        const h = await api.health.get();
        setHealth({ api: h.status === 'ok' ? 'ok' : 'error', db: h.db === 'ok' ? 'ok' : 'error' });
      } catch {
        setHealth({ api: 'error', db: null });
      }
    }
    load();
    checkHealth();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <p className="label-tag-muted mb-1">Administration</p>
        <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Admin <span style={{ color: 'var(--gold-accent)' }}>Control Center</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Oversee governance, content, and learner progress.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Total Learners" value={loading ? '—' : stats.learners} />
        <StatCard title="Active Modules" value={loading ? '—' : stats.modules} accent />
        <StatCard
          title="Pending Jobs"
          value={loading ? '—' : stats.pendingJobs}
          alert={!loading && stats.pendingJobs > 0}
        />
      </div>

      {/* ── Actions + Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Quick actions */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="label-tag-muted mb-5">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            <ActionLink to="/kb" label="Ingest Content" desc="Add PDF / URL sources" />
            <ActionLink to="/kb/modules" label="Manage Modules" desc="Edit curricula and prerequisites" />
            <ActionLink to="/admin/assignments" label="Assign Training" desc="Bulk assign to learners" />
            <ActionLink to="/admin/progress" label="Audit Progress" desc="View detailed learner logs" />
          </div>
        </div>

        {/* System status */}
        <div
          className="rounded-xl p-6 self-start"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="label-tag-muted mb-5">System Status</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Environment</span>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ background: 'var(--bg-canvas)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                Local / Staging
              </span>
            </div>
            <HealthRow label="Backend API" status={health.api} />
            <HealthRow label="Database" status={health.db} />
          </div>

          <div
            className="mt-6 pt-5"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <p className="label-tag-muted mb-2">Governance Rule</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Knowledge Base truth first. AI support only when grounded in verified content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Local components ── */

function HealthRow({ label, status }: { label: string; status: 'ok' | 'error' | null }) {
  const color = status === 'ok' ? '#10b981' : status === 'error' ? '#f43f5e' : 'var(--text-dim)';
  const dotColor = status === 'ok' ? 'bg-emerald-500' : status === 'error' ? 'bg-rose-500' : 'bg-gray-400';
  const text = status === 'ok' ? (label === 'Backend API' ? 'Healthy' : 'Connected') : status === 'error' ? 'Unreachable' : '…';
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color }}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} style={status === 'ok' ? { animation: 'pulse 2s infinite' } : {}} />
        {text}
      </span>
    </div>
  );
}

function StatCard({ title, value, accent, alert }: {
  title: string; value: string | number; accent?: boolean; alert?: boolean;
}) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{
        background: 'var(--bg-surface)',
        border: alert
          ? '1px solid rgba(245,158,11,0.5)'
          : accent
          ? '1px solid var(--border-gold)'
          : '1px solid var(--border-subtle)',
      }}
    >
      <p className="label-tag-muted mb-1">{title}</p>
      <p
        className="font-display font-black text-2xl"
        style={{ color: alert ? 'var(--gold-accent)' : accent ? 'var(--gold-accent)' : 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}

function ActionLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <Link
      to={to}
      className="block p-4 rounded-lg transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-gold)';
        (e.currentTarget as HTMLElement).style.background = 'var(--gold-muted)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
      }}
    >
      <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
      <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{desc}</p>
    </Link>
  );
}
