import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type LearnModulesResponse } from '../api/client';
import { getSessionToken, getStoredHandle } from '../lib/session';
import { STUDY_CHAPTERS } from '../data/studyMaterial';

const FEATURED_TOPICS = [
  'phishing-recognition-field-guide',
  'bec-payment-fraud',
  'ransomware-full-picture',
  'bec-recovery-playbook',
];

/* Map module slug keywords → owned images */
const IMAGE_MAP: Record<string, string> = {
  phishing: '/assets/dashboard/phishing_defense.png',
  ransomware: '/assets/dashboard/ransomware.png',
  supply_chain: '/assets/dashboard/supply_chain.png',
  supply: '/assets/dashboard/supply_chain.png',
  freight: '/assets/dashboard/freight_fraud.png',
  passwords: '/assets/dashboard/passwords.png',
  password: '/assets/dashboard/passwords.png',
  social: '/assets/dashboard/social_engineering.png',
  data_breach: '/assets/dashboard/data_breach.png',
  breach: '/assets/dashboard/data_breach.png',
  data_privacy: '/assets/dashboard/data_privacy.png',
  privacy: '/assets/dashboard/data_privacy.png',
  eld: '/assets/dashboard/eld_security.png',
  iot: '/assets/dashboard/iot_sensor.png',
  port: '/assets/dashboard/port_protocols.png',
  remote: '/assets/dashboard/remote_work.png',
  customs: '/assets/dashboard/customs_data.png',
  last_mile: '/assets/dashboard/last_mile.png',
  cyber_essentials: '/assets/dashboard/cyber_essentials.png',
  cyber_quest: '/assets/dashboard/cyber_quest.png',
  tactical: '/assets/dashboard/tactical_simulations.png',
};

function moduleImage(title: string, slug?: string): string {
  const key = (slug ?? title).toLowerCase().replace(/[\s-]/g, '_');
  for (const [k, v] of Object.entries(IMAGE_MAP)) {
    if (key.includes(k)) return v;
  }
  return '/assets/dashboard/cyber_essentials.png';
}

const STATUS_STYLES: Record<string, { label: string; color: string; dot: string }> = {
  completed: { label: 'Completed', color: 'rgba(16,185,129,0.85)', dot: '#10b981' },
  in_progress: { label: 'In Progress', color: 'rgba(245,158,11,0.85)', dot: '#f59e0b' },
  not_started: { label: 'Not Started', color: 'rgba(255,255,255,0.35)', dot: 'rgba(255,255,255,0.3)' },
  locked: { label: 'Locked', color: 'rgba(255,255,255,0.25)', dot: 'rgba(255,255,255,0.2)' },
};

export default function LearnDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<LearnModulesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getSessionToken()) { navigate('/login', { replace: true }); return; }
    api.learn.modules()
      .then(setData)
      .catch(e => {
        // req() clears learner_token on 401 — redirect to login instead of showing a raw error.
        if (!getSessionToken()) { navigate('/login', { replace: true }); return; }
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
        Loading…
      </span>
    </div>
  );

  if (error) return (
    <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
      {error}
    </div>
  );

  const modules = data?.modules ?? [];
  const completed = modules.filter(m => m.completed).length;
  const inProgress = modules.filter(m => m.inProgress && !m.completed).length;
  const total = modules.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const nextModule = data?.nextRecommendedId ? modules.find(m => m.id === data.nextRecommendedId) : null;
  const handle = getStoredHandle();

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <p className="label-tag-muted mb-1">Training Platform</p>
        <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Welcome back, <span style={{ color: 'var(--gold-accent)' }}>{handle ?? 'Operator'}</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your current training status and recommendations.</p>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Modules Total', value: total },
          { label: 'Completed', value: completed, accent: true },
          { label: 'In Progress', value: inProgress },
          { label: 'Completion', value: `${pct}%` },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="rounded-xl px-5 py-4"
            style={{
              background: 'var(--bg-surface)',
              border: accent ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
            }}
          >
            <p className="label-tag-muted mb-1">{label}</p>
            <p
              className="font-display font-black text-xl md:text-2xl"
              style={{ color: accent ? 'var(--gold-accent)' : 'var(--text-primary)' }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Progress bar + Next ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Progress bar */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="label-tag-muted mb-4">Curriculum Progress</p>
          <div className="relative h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--border-subtle)' }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--gold-accent), #d97706)',
                boxShadow: '0 0 10px rgba(245,158,11,0.4)',
              }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{completed} of {total} modules</span>
            <span className="font-bold" style={{ color: 'var(--gold-accent)' }}>{pct}%</span>
          </div>
          <Link
            to="/learn"
            className="mt-5 inline-block text-xs font-bold transition-colors"
            style={{ color: 'var(--gold-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            View all modules →
          </Link>
        </div>

        {/* Next recommended */}
        <div
          className="rounded-xl p-6 flex flex-col justify-between"
          style={{
            background: nextModule ? 'var(--gold-muted)' : 'var(--bg-surface)',
            border: nextModule ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <p className="label-tag mb-3">{nextModule ? 'Recommended Next' : 'Status'}</p>
            {nextModule ? (
              <>
                <h2 className="font-display font-black text-xl mb-2 leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {nextModule.title}
                </h2>
                <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                  {nextModule.description ?? 'Continue your Five Eyes training curriculum.'}
                </p>
              </>
            ) : (
              <h2 className="font-display font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                All modules completed
              </h2>
            )}
          </div>
          <div className="mt-6">
            {nextModule ? (
              <Link
                to={`/learn/modules/${nextModule.id}`}
                className="inline-block px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.02]"
                style={{ background: 'var(--gold-accent)', color: '#000' }}
              >
                {nextModule.inProgress ? 'Continue Training' : 'Start Module'}
              </Link>
            ) : (
              <Link
                to="/learn/library"
                className="inline-block px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.02]"
                style={{ background: 'var(--bg-elevated)', color: 'var(--gold-accent)', border: '1px solid var(--border-gold)' }}
              >
                Explore Reference Library
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Module grid ── */}
      {modules.length > 0 && (
        <div>
          <p className="label-tag-muted mb-4">All Modules</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(m => {
              const status = m.completed ? 'completed' : m.inProgress ? 'in_progress' : m.locked ? 'locked' : 'not_started';
              const s = STATUS_STYLES[status];
              return (
                <Link
                  key={m.id}
                  to={m.locked ? '#' : `/learn/modules/${m.id}`}
                  className="group rounded-xl overflow-hidden transition-all duration-300 block"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    opacity: m.locked ? 0.5 : 1,
                    pointerEvents: m.locked ? 'none' : undefined,
                  }}
                  onMouseEnter={e => {
                    if (!m.locked) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-gold)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--glow-gold)';
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Module image */}
                  <div className="h-28 w-full overflow-hidden relative">
                    <div
                      className="absolute inset-0 z-10"
                      style={{ background: 'linear-gradient(to top, var(--bg-surface) 0%, rgba(7,16,32,0.3) 60%, transparent 100%)' }}
                    />
                    <img
                      src={moduleImage(m.title, m.slug)}
                      alt={m.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {/* Module info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: s.dot }}
                      />
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                      {m.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Reference Library Quick Access ── */}
      {(() => {
        const featured = FEATURED_TOPICS.flatMap(id => {
          for (const ch of STUDY_CHAPTERS) {
            const t = ch.topics.find(tp => tp.id === id);
            if (t) return [{ id: t.id, label: t.label, tagline: t.tagline }];
          }
          return [];
        });
        return (
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="label-tag-muted">Reference Library — Featured Articles</p>
              <Link to="/learn/library" className="text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>
                All Articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {featured.map(t => (
                <Link
                  key={t.id}
                  to={`/learn/library/${t.id}`}
                  className="flex items-start gap-3 px-4 py-3 rounded-lg transition-all"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <span className="text-xs mt-0.5 shrink-0" style={{ color: 'var(--gold-accent)' }}>→</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                    <p className="text-[10px] mt-0.5 leading-snug line-clamp-1" style={{ color: 'var(--text-muted)' }}>{t.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Guidelines ── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <p className="label-tag-muted mb-3">Training Guidelines</p>
        <ul className="space-y-2">
          {[
            'Always consult the Knowledge Base before submitting practice answers if unsure.',
            'Remediation steps are provided for all incorrect answers.',
            'Staging environment uses simulated handles. Do not use personal metadata.',
          ].map(line => (
            <li key={line} className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--gold-accent)' }}>—</span>
              {line}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
