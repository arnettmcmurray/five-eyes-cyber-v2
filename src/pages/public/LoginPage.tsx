import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Shield } from 'lucide-react';
import { api } from '../../api/client';
import { setSession } from '../../lib/session';

type Step = 'email' | 'otp';

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.auth.requestOtp(email.trim().toLowerCase());
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.auth.verifyOtp(email.trim().toLowerCase(), otp.trim());
      setSession(result.token, result.handle);
      navigate('/learn/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-sm"
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--gold-muted)', border: '1px solid var(--border-gold)', boxShadow: 'var(--glow-gold)' }}
          >
            <Shield size={22} style={{ color: 'var(--gold-accent)' }} />
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="p-8"
              >
                <span className="label-tag block mb-1" style={{ color: 'var(--gold-accent)' }}>Sign In</span>
                <h1 className="font-display font-black text-2xl uppercase tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                  Welcome Back
                </h1>
                <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Enter your email. We'll send a one-time code — no password needed.
                </p>

                <form onSubmit={requestOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoFocus
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                    />
                  </div>

                  {error && (
                    <p className="text-xs" style={{ color: 'var(--status-error)' }}>{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
                  >
                    <Mail size={14} />
                    {loading ? 'Sending…' : 'Send Code'}
                  </button>
                </form>

                <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
                  New here?{' '}
                  <Link to="/register" className="font-bold underline underline-offset-4" style={{ color: 'var(--gold-accent)' }}>
                    Create a free account
                  </Link>
                </p>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="p-8"
              >
                <span className="label-tag block mb-1" style={{ color: 'var(--gold-accent)' }}>Verify</span>
                <h1 className="font-display font-black text-2xl uppercase tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                  Check Your Email
                </h1>
                <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Code sent to <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{email}</span>.
                </p>

                <form onSubmit={verifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      6-Digit Code
                    </label>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      autoFocus
                      className="w-full px-4 py-3 rounded-lg text-xl font-black text-center tracking-[0.5em] outline-none transition-all"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                    />
                  </div>

                  {error && (
                    <p className="text-xs" style={{ color: 'var(--status-error)' }}>{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('email'); setError(null); setOtp(''); }}
                    className="w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-ultra transition-all hover:opacity-80"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                  >
                    Back
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
