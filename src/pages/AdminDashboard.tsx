import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    learners: 0,
    modules: 0,
    pendingJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
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
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
        <p className="text-slate-500 mt-2">Oversee governance, content, and learner progress.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Total Learners" 
          value={loading ? '...' : stats.learners} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          color="blue"
        />
        <StatCard 
          title="Active Modules" 
          value={loading ? '...' : stats.modules} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          color="indigo"
        />
        <StatCard 
          title="Pending Jobs" 
          value={loading ? '...' : stats.pendingJobs} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="amber"
          alert={stats.pendingJobs > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <section className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <ActionLink to="/kb" label="Ingest Content" description="Add new PDF/URL sources" />
            <ActionLink to="/kb/modules" label="Manage Modules" description="Edit curricula and prerequisites" />
            <ActionLink to="/admin/assignments" label="Assign Training" description="Bulk assign to learners" />
            <ActionLink to="/admin/progress" label="Audit Progress" description="View detailed learner logs" />
          </div>
        </section>

        {/* System Health / Status */}
        <section className="bg-slate-900 rounded-xl p-6 text-white self-start">
          <h2 className="text-lg font-semibold mb-4">Staging Status</h2>
          <div className="space-y-4">
             <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Environment</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded">AWS Staging</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Backend API</span>
                <span className="flex items-center gap-2 text-emerald-400 font-medium">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Healthy
                </span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Database (RDS)</span>
                <span className="text-emerald-400">Wired (SSL: Bypassed)</span>
             </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800">
             <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-widest font-bold mb-3">Governance Rule</p>
             <p className="text-sm text-slate-300">
                Knowledge Base truth first. AI support only when grounded in verified content.
             </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, alert }: { title: string; value: string | number; icon: React.ReactNode; color: 'blue' | 'indigo' | 'amber'; alert?: boolean }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className={`bg-white rounded-xl border p-6 flex items-center justify-between ${alert ? 'border-amber-400' : ''}`}>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}

function ActionLink({ to, label, description }: { to: string; label: string; description: string }) {
  return (
    <Link to={to} className="group p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </Link>
  );
}
