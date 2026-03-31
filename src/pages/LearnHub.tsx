import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, type LearnModuleWithProgress, type LearnModulesResponse } from '../api/client';
import { getSessionToken, getStoredHandle, setSession, clearSession } from '../lib/session';

export default function LearnHub() {
  const [hasSession, setHasSession] = useState<boolean>(() => !!getSessionToken());
  const [handle, setHandle] = useState<string>(() => getStoredHandle() ?? '');
  const [response, setResponse] = useState<LearnModulesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSession) return;
    setLoading(true);
    api.learn.modules()
      .then(setResponse)
      .catch(e => {
        // req() clears learner_token on 401; check token presence rather than matching error strings.
        if (!getSessionToken()) {
          clearSession();
          setHasSession(false);
          return;
        }
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => setLoading(false));
  }, [hasSession]);

  function handleLoggedIn(token: string, newHandle: string) {
    setSession(token, newHandle);
    setHandle(newHandle);
    setHasSession(true);
  }

  function handleSwitch() {
    clearSession();
    setHasSession(false);
    setHandle('');
    setResponse(null);
    setError(null);
  }

  if (!hasSession) return <OtpLoginForm onLoggedIn={handleLoggedIn} />;

  const modules = response?.modules ?? [];
  const nextRecommendedId = response?.nextRecommendedId ?? null;

  // Exclude the recommended module from in-progress list to avoid showing it twice
  const inProgress = modules.filter(m => m.inProgress && !m.locked && m.id !== nextRecommendedId);
  const notStarted = modules.filter(m => !m.completed && !m.inProgress && !m.locked);
  const completed = modules.filter(m => m.completed);
  const locked = modules.filter(m => m.locked);

  const nextModule = nextRecommendedId ? modules.find(m => m.id === nextRecommendedId) : null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Training</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track your progress across all modules.</p>
        </div>
        <button onClick={handleSwitch} className="text-xs text-gray-400 hover:text-gray-600">
          {handle ? `@${handle}` : 'Switch learner'} &middot; Log out
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded text-sm">{error}</div>}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : modules.length === 0 ? (
        <p className="text-gray-400 text-sm">No modules available yet.</p>
      ) : (
        <div className="space-y-8">
          {/* Next recommended call-out */}
          {nextModule && (
            <div className="border border-blue-200 rounded p-4 bg-blue-50">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                {nextModule.inProgress ? 'Continue where you left off' : 'Up next'}
              </p>
              <Link
                to={`/learn/modules/${nextModule.id}`}
                className="font-semibold text-blue-900 hover:underline"
              >
                {nextModule.title}
              </Link>
              {nextModule.description && (
                <p className="text-sm text-blue-700 mt-0.5">{nextModule.description}</p>
              )}
            </div>
          )}

          {/* In-progress */}
          {inProgress.length > 0 && (
            <Section title="In Progress">
              {inProgress.map(m => <ModuleCard key={m.id} module={m} />)}
            </Section>
          )}

          {/* Available */}
          {notStarted.length > 0 && (
            <Section title="Available">
              {notStarted.map(m => <ModuleCard key={m.id} module={m} />)}
            </Section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <Section title="Completed">
              {completed.map(m => <ModuleCard key={m.id} module={m} />)}
            </Section>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <Section title="Locked">
              {locked.map(m => <ModuleCard key={m.id} module={m} />)}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ModuleCard({ module: m }: { module: LearnModuleWithProgress }) {
  const badge = m.completed ? (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
      {m.score != null && m.total != null
        ? `${m.score}/${m.total} · ${m.percentage}%`
        : m.percentage != null
        ? `${m.percentage}%`
        : 'Completed'}
    </span>
  ) : m.inProgress ? (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
      In progress
    </span>
  ) : m.locked ? (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      Locked
    </span>
  ) : null;

  const inner = (
    <div className="border rounded p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium ${m.locked ? 'text-gray-400' : 'text-gray-900'}`}>
            {m.title}
          </span>
          {badge}
        </div>
        {m.description && (
          <p className={`text-sm mt-0.5 truncate ${m.locked ? 'text-gray-400' : 'text-gray-500'}`}>
            {m.description}
          </p>
        )}
        {m.estimatedMinutes != null && !m.completed && (
          <p className="text-xs text-gray-400 mt-0.5">{m.estimatedMinutes} min</p>
        )}
      </div>
      {m.completed && m.nextModuleId && (
        <Link
          to={`/learn/modules/${m.nextModuleId}`}
          onClick={e => e.stopPropagation()}
          className="shrink-0 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next →
        </Link>
      )}
      {m.completed && !m.nextModuleId && <span className="text-green-500 shrink-0" aria-hidden>✓</span>}
      {m.locked && <span className="text-gray-300 shrink-0" aria-hidden>🔒</span>}
    </div>
  );

  if (m.locked) return <div className="opacity-60 cursor-not-allowed">{inner}</div>;

  return (
    <Link to={`/learn/modules/${m.id}`} className="block hover:bg-gray-50 rounded transition-colors">
      {inner}
    </Link>
  );
}

function OtpLoginForm({ onLoggedIn }: { onLoggedIn: (token: string, handle: string) => void }) {
  const [step, setStep] = useState<'handle' | 'code'>('handle');
  const [handle, setHandle] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.auth.requestOtp(handle.trim());
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.auth.verifyOtp(handle.trim(), code.trim());
      onLoggedIn(result.token, result.handle);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 mt-16">
      <h1 className="text-xl font-bold mb-1">My Training</h1>

      {step === 'handle' ? (
        <>
          <p className="text-gray-500 text-sm mb-6">Enter your learner handle to receive a login code.</p>
          <form onSubmit={requestCode} className="space-y-3">
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="e.g. alice, trainee-01"
              value={handle}
              onChange={e => setHandle(e.target.value)}
              autoFocus
            />
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !handle.trim()}
              className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send code'}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-1">Code sent for <strong>{handle}</strong>.</p>
          <p className="text-gray-400 text-xs mb-6">Your code was sent. Check your inbox or contact your administrator.</p>
          <form onSubmit={verifyCode} className="space-y-3">
            <input
              className="w-full border rounded px-3 py-2 text-sm tracking-widest text-center"
              placeholder="6-digit code"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoFocus
            />
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={submitting || code.length < 6}
              className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Verifying…' : 'Verify code'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('handle'); setCode(''); setError(null); }}
              className="w-full py-1 text-xs text-gray-400 hover:text-gray-600"
            >
              Back
            </button>
          </form>
        </>
      )}
    </div>
  );
}
