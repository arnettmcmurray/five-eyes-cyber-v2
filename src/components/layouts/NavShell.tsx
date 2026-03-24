import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAdminUsername, clearAdminSession } from '../../lib/adminSession';
import { getStoredHandle, clearSession } from '../../lib/session';

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
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  kb: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  progress: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  assignments: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  profile: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  training: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  menu: 'M4 6h16M4 12h16M4 18h7',
  chevronLeft: 'M15 19l-7-7 7-7',
  ttx: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
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
    else { clearSession(); navigate('/learn'); }
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
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
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
            title={collapsed ? 'Public site' : undefined}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-semibold mb-2 transition-colors"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
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
