import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { setAdminSession } from '../lib/adminSession';
import { NeuralBackground } from '../components/NeuralBackground';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.auth.adminLogin(username.trim(), password);
      setAdminSession(result.token, result.username);
      navigate('/kb');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-20" style={{ background: 'var(--bg-canvas)' }}>
      <NeuralBackground />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--gold-muted)', border: '1px solid var(--border-gold)', boxShadow: 'var(--glow-gold)' }}
          >
            <Settings size={20} style={{ color: 'var(--gold-accent)' }} />
          </div>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <span className="label-tag block mb-1" style={{ color: 'var(--gold-accent)' }}>Admin Console</span>
          <h1 className="font-display font-black text-2xl uppercase tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            Admin Sign In
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Platform management access. Authorised personnel only.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Username
              </label>
              <input
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                placeholder="admin username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-xs" style={{ color: 'var(--status-error)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !username.trim() || !password}
              className="w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="text-center mt-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={12} />
            Back to login portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
