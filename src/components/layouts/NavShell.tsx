import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAdminUsername, clearAdminSession } from '../../lib/adminSession';
import { getStoredHandle, clearSession } from '../../lib/session';
import { clearTierCache } from '../../hooks/useLearnerTier';

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('five-eyes-theme') as 'dark' | 'light') ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('five-eyes-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}

interface NavShellProps {
  children: React.ReactNode;
}

/* ── Icons ─────────────────────────────────────────────── */
const Icon = ({ d, className = 'w-4 h-4' }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={d} />
  </svg>
);

const ICONS = {
  // Grid of 4 squares — cleaner dashboard feel
  dashboard: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
  // Open book with centre line
  kb: 'M12 6v13M6 4h3a3 3 0 013 3v10a3 3 0 01-3-3H6V4zm12 0h-3a3 3 0 00-3 3v10a3 3 0 003-3h3V4z',
  // Rising bars chart
  progress: 'M5 20v-6m4 6v-9m4 9V9m4 11V4',
  // Checklist with tick
  assignments: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0h4M9 12l2 2 4-4',
  // Single circle person — cleaner than double silhouette
  profile: 'M12 11a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 1114 0H5z',
  // Play circle — training / learn
  training: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  // Magnifier clean
  search: 'M10 18a8 8 0 100-16 8 8 0 000 16zm5.293-2.707l4 4a1 1 0 01-1.414 1.414l-4-4a1 1 0 011.414-1.414z',
  // Game controller / play
  game: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  // Arrow right-out of box
  logout: 'M10 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-3m-5-9l5 5m0 0l-5 5m5-5H9',
  // Three lines + dot (hamburger variant)
  menu: 'M4 6h16M4 12h16M4 18h7',
  chevronLeft: 'M15 19l-7-7 7-7',
  // Shield with inner lightning — TTX / exercises
  ttx: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
};

export default function NavShell({ children }: NavShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();

  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/kb') || location.pathname.startsWith('/ttx');
  const username = isAdmin ? getAdminUsername() : getStoredHandle();
  const initials = username ? username.slice(0, 2).toUpperCase() : '??';

  const handleLogout = () => {
    if (isAdmin) { clearAdminSession(); navigate('/admin/login'); }
    else { clearSession(); clearTierCache(); navigate('/login'); }
  };

  const closeMobile = () => setMobileOpen(false);

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: ICONS.dashboard, exact: true },
    { to: '/kb', label: 'Knowledge Base', icon: ICONS.kb, exact: false },
    { to: '/ttx/scenarios', label: 'TTX Scenarios', icon: ICONS.ttx, exact: false },
    { to: '/ttx/sessions', label: 'TTX Sessions', icon: ICONS.assignments, exact: false },
    { to: '/admin/progress', label: 'Learner Progress', icon: ICONS.progress, exact: true },
    { to: '/admin/assignments', label: 'Assignments', icon: ICONS.assignments, exact: true },
    { to: '/admin/profile', label: 'Profile', icon: ICONS.profile, exact: true },
  ];

  const learnerLinks = [
    { to: '/learn/dashboard', label: 'Dashboard', icon: ICONS.dashboard, exact: true },
    { to: '/learn', label: 'Training Hub', icon: ICONS.training, exact: true },
    { to: '/learn/library', label: 'Study Material', icon: ICONS.kb, exact: false },
    { to: '/learn/ttx', label: 'Tactical Simulations', icon: ICONS.ttx, exact: false },
    { to: '/learn/scorecard', label: 'Scorecard', icon: ICONS.progress, exact: false },
    { to: '/learn/game', label: 'Security Game', icon: ICONS.game, exact: false },
  ];

  const links = isAdmin ? adminLinks : learnerLinks;

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const roleLabel = isAdmin ? 'Admin Console' : 'Training Platform';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
    >
      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={closeMobile}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          'flex flex-col shrink-0 transition-all duration-300 overflow-hidden',
          // Mobile: fixed overlay drawer, hidden by default
          'fixed inset-y-0 left-0 z-40 md:relative md:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        style={{
          width: collapsed ? '68px' : '220px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-4 py-5 shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)', minHeight: '64px' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'var(--gold-muted)',
              border: '1px solid var(--border-gold)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
              style={{ color: 'var(--gold-accent)', flexShrink: 0 }}>
              <path fillRule="evenodd" clipRule="evenodd"
                d="M12 2L4 5v6.5C4 18 12 22 12 22s8-4 8-10.5V5L12 2zm0 5.5c.5 2 2 3.5 4 4-2 .5-3.5 2-4 4-.5-2-2-3.5-4-4 2-.5 3.5-2 4-4z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Five Eyes</p>
              <p className="text-[9px] font-bold uppercase tracking-widest truncate" style={{ color: 'var(--text-dim)' }}>
                {roleLabel}
              </p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
          {links.map(({ to, label, icon, exact }) => {
            const active = isActive(to, exact);
            return (
              <Link
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                onClick={closeMobile}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap"
                style={{
                  background: active ? 'var(--gold-muted)' : 'transparent',
                  color: active ? 'var(--gold-accent)' : 'var(--text-muted)',
                  borderLeft: active ? '2px solid var(--gold-accent)' : '2px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <Icon d={icon} className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-2 py-4 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold mb-3 transition-colors"
            style={{ color: 'rgba(244,63,94,0.6)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgb(244,63,94)'; e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,63,94,0.6)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon d={ICONS.logout} className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          <Link
            to="/"
            title="Public site"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-semibold mb-2 transition-colors"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Globe icon — not an arrow, clearly a site link not a back button */}
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0c-1.657 3-2 7-2 10s.343 7 2 10m0-20c1.657 3 2 7 2 10s-.343 7-2 10M2 12h20" />
            </svg>
            {!collapsed && <span>Public site</span>}
          </Link>

          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
              style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)', border: '1px solid var(--border-gold)' }}
            >
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{username ?? 'User'}</p>
                <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                  {isAdmin ? 'Administrator' : 'Learner'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-0">
        {/* Top bar */}
        <header
          className="h-14 shrink-0 flex items-center px-5 gap-4"
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Mobile: toggle drawer; Desktop: collapse sidebar */}
          <button
            onClick={() => {
              if (window.innerWidth < 768) setMobileOpen(o => !o);
              else setCollapsed(c => !c);
            }}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon d={collapsed ? ICONS.menu : ICONS.chevronLeft} className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <span className="text-xs font-bold uppercase tracking-widest flex-1" style={{ color: 'var(--text-dim)' }}>
            {location.pathname.split('/').filter(Boolean).join(' / ')}
          </span>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold-accent)'; e.currentTarget.style.background = 'var(--gold-muted)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            {theme === 'dark' ? (
              /* Sun icon */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M12 3v1m0 16v1m8.66-9H21M3 12H2m15.36-6.36l-.7.7M7.34 17.66l-.7.7M17.66 17.66l-.7-.7M7.34 6.34l-.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              /* Moon icon */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              </svg>
            )}
          </button>
        </header>

        {/* Page content */}
        <div
          className="flex-1 overflow-auto p-6 lg:p-8"
          style={{ background: 'var(--bg-canvas)' }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
