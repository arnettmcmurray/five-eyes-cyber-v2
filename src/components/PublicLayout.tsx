import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSessionToken } from '../lib/session';
import { getAdminToken } from '../lib/adminSession';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NeuralBackground } from './NeuralBackground';
import { FiveEyesLogo } from './FiveEyesLogo';
import { ThemeToggle } from './ThemeToggle';

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return (localStorage.getItem('five-eyes-theme') as 'light' | 'dark') ?? 'dark'; } catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('five-eyes-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggleTheme };
}

const NAV_LEFT = [
  { to: '/', label: 'Home' },
  { to: '/capabilities', label: 'Capabilities' },
  { to: '/packages', label: 'Packages' },
];

const NAV_RIGHT = [
  { to: '/about', label: 'About' },
  { to: '/enterprise', label: 'Contact' },
];

const FOOTER_PLATFORM = [
  { to: '/capabilities', label: 'Capabilities' },
  { to: '/packages', label: 'Packages' },
  { to: '/admin/login', label: 'Admin Login' },
];

const FOOTER_COMPANY = [
  { to: '/about', label: 'About' },
  { to: '/enterprise', label: 'Contact' },
];

const FOOTER_LEGAL = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms-conditions', label: 'Terms & Conditions' },
];

const FOOTER_MEDIA = [
  { href: 'https://fiveeyesltd.com/five-eyes-blog', label: 'Blog' },
  { href: 'https://fiveeyesltd.com/', label: 'Newsletter' },
  { href: 'https://fiveeyesltd.com/media', label: 'Media' },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const logoTo = getAdminToken() ? '/admin/dashboard' : getSessionToken() ? '/learn' : '/';

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ color: 'var(--text-primary)' }}
    >
      {/* Background */}
      <NeuralBackground />

      {/* ── Nav ── */}
      <nav className="public-nav sticky top-0 z-50">
        <div
          className="mx-auto max-w-7xl px-4 md:px-6 h-16 md:h-18 flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(5,11,20,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Left links */}
          <div className="hidden md:flex items-center gap-8 flex-1">
            {NAV_LEFT.map(({ to, label }) => (
              <NavLink key={to} to={to} label={label} active={location.pathname === to} />
            ))}
          </div>

          {/* Center logo */}
          <Link
            to={logoTo}
            className="flex flex-col items-center gap-1 shrink-0 mx-6 group"
            aria-label="Five Eyes home"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
              style={{
                background: 'var(--gold-muted)',
                border: '1px solid var(--border-gold)',
                boxShadow: 'var(--glow-gold)',
              }}
            >
              <FiveEyesLogo size={24} className="text-gold-accent" />
            </div>
          </Link>

          {/* Right links */}
          <div className="hidden md:flex items-center justify-end gap-6 flex-1">
            {NAV_RIGHT.map(({ to, label }) => (
              <NavLink key={to} to={to} label={label} active={location.pathname === to} />
            ))}
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} className="[--width:72px]" />
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-ultra transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--gold-accent)',
                color: '#000',
                boxShadow: 'var(--glow-gold)',
              }}
            >
              Access Terminal
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
            style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-full left-0 right-0 z-50 p-4 space-y-2"
              style={{
                background: 'rgba(7,16,32,0.97)',
                borderBottom: '1px solid var(--border-subtle)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {[...NAV_LEFT, ...NAV_RIGHT].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-lg text-[11px] font-black uppercase tracking-ultra transition-colors"
                  style={{
                    border: '1px solid var(--border-subtle)',
                    color: location.pathname === to ? 'var(--gold-accent)' : 'var(--text-muted)',
                    background: location.pathname === to ? 'var(--gold-muted)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              ))}
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[10px] font-black uppercase tracking-ultra" style={{ color: 'var(--text-muted)' }}>
                  Theme
                </span>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} className="[--width:72px]" />
              </div>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg text-[11px] font-black uppercase tracking-ultra text-center"
                style={{ background: 'var(--gold-accent)', color: '#000' }}
              >
                Access Terminal
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer
        className="relative z-20 pt-10 pb-8 md:pt-16 md:pb-10 px-5 md:px-8"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            {/* Brand block */}
            <div className="shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <FiveEyesLogo size={20} className="text-gold-accent" />
                <span className="font-black tracking-tighter uppercase text-sm" style={{ color: 'var(--text-primary)' }}>
                  Five Eyes
                </span>
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                All Rights Reserved. © 2026 Five Eyes Ltd.
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                UK Transport, Logistics &amp; Cyber Security Specialists
              </p>
            </div>

            {/* Nav grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <FooterCol title="Platform" links={FOOTER_PLATFORM} />
              <FooterCol title="Company" links={FOOTER_COMPANY} />
              <FooterCol title="Legal" links={FOOTER_LEGAL} />
              <FooterColExt title="Media ↗" links={FOOTER_MEDIA} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Helpers ── */

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className="relative text-[11px] font-black uppercase tracking-ultra py-1 transition-colors"
      style={{ color: active ? 'var(--gold-accent)' : 'var(--text-muted)' }}
    >
      {label}
      {active && (
        <motion.div
          layoutId="pub-nav-indicator"
          className="absolute -bottom-1 left-0 right-0 h-px"
          style={{ background: 'var(--gold-accent)', boxShadow: '0 0 8px rgba(245,158,11,0.6)' }}
        />
      )}
    </Link>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h5 className="label-tag mb-5">{title}</h5>
      <ul className="space-y-3">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterColExt({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h5 className="label-tag-muted mb-5">{title}</h5>
      <ul className="space-y-3">
        {links.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
