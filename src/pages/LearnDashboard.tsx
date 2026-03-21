import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type LearnModulesResponse } from '../api/client';
import { getSessionToken, getStoredHandle } from '../lib/session';

export default function LearnDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<LearnModulesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getSessionToken()) {
      navigate('/learn', { replace: true });
      return;
    }
    api.learn.modules()
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="text-slate-500">Loading your progress…</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>;

  const modules = data?.modules ?? [];
  const completed = modules.filter(m => m.completed).length;
  const total = modules.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const nextModule = data?.nextRecommendedId 
    ? modules.find(m => m.id === data.nextRecommendedId) 
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {getStoredHandle()}</h1>
        <p className="text-slate-500 mt-2">Here is your current training status.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Progress Card */}
        <section className="bg-white rounded-2xl border p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="relative w-32 h-32 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-600" strokeDasharray={364.42} strokeDashoffset={364.42 * (1 - percentage / 100)} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Curriculum Progress</h2>
          <p className="text-sm text-slate-500 mt-1">{completed} of {total} modules completed</p>
          <Link to="/learn" className="mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View all modules →
          </Link>
        </section>

        {/* Up Next Card */}
        <section className="bg-indigo-600 rounded-2xl p-8 text-white shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2">Recommended</p>
            {nextModule ? (
              <>
                <h2 className="text-2xl font-bold leading-tight mb-3">{nextModule.title}</h2>
                <p className="text-indigo-100 text-sm opacity-90 line-clamp-3">
                  {nextModule.description || 'Continue your journey through the Five Eyes curriculum.'}
                </p>
              </>
            ) : (
              <h2 className="text-2xl font-bold leading-tight">All modules completed!</h2>
            )}
          </div>
          <div className="mt-8">
            {nextModule ? (
              <Link
                to={`/learn/modules/${nextModule.id}`}
                className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
              >
                {nextModule.inProgress ? 'Continue Training' : 'Start Module'}
              </Link>
            ) : (
              <Link
                to="/kb/search"
                className="inline-block bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-400 transition-colors"
              >
                Explore Knowledge Base
              </Link>
            )}
          </div>
        </section>
      </div>

      {/* Announcements or Rules */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Training Guidelines</h3>
        <ul className="space-y-3">
          <li className="flex gap-3 text-sm text-slate-600">
            <span className="text-indigo-500 font-bold">•</span>
            <span>Always consult the Knowledge Base before submitting practice answers if unsure.</span>
          </li>
          <li className="flex gap-3 text-sm text-slate-600">
            <span className="text-indigo-500 font-bold">•</span>
            <span>Remediation steps are provided for all incorrect answers.</span>
          </li>
          <li className="flex gap-3 text-sm text-slate-600">
            <span className="text-indigo-500 font-bold">•</span>
            <span>Staging environment uses simulated handles. Do not use personal metadata.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
