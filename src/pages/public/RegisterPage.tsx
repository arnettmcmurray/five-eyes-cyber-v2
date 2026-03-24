import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Shield } from 'lucide-react';
import { api } from '../../api/client';
import { setSession } from '../../lib/session';

type Step = 'details' | 'otp';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('details');

  // Step 1 — details
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  // Step 2 — OTP
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // /auth/register: persists profile fields + triggers OTP delivery
      await api.auth.register(
        email.trim().toLowerCase(),
        fullName.trim() || undefined,
        company.trim() || undefined,
        role.trim() || undefined,
      );
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
      // Redirect to learn dashboard — tier gating handles free vs paid
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
        className="w-full max-w-md"
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

        {/* Panel */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="label-tag" style={{ color: 'var(--gold-accent)' }}>Create Account</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Step 1 / 2</span>
                </div>
                <h1 className="font-display font-black text-2xl uppercase tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                  Get Started
                </h1>
                <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Enter your details to create a free account. No password required.
                </p>

                <form onSubmit={requestOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Work Email <span style={{ color: 'var(--gold-accent)' }}>*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                      <input
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Company</label>
                      <input
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Role</label>
                    <input
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      placeholder="Head of IT, Operations Manager…"
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
                    {loading ? 'Sending code…' : 'Send Verification Code'}
                  </button>
                </form>

                <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold underline underline-offset-4" style={{ color: 'var(--gold-accent)' }}>
                    Sign in
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
                <div className="flex items-center justify-between mb-1">
                  <span className="label-tag" style={{ color: 'var(--gold-accent)' }}>Verify Email</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Step 2 / 2</span>
                </div>
                <h1 className="font-display font-black text-2xl uppercase tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                  Check Your Email
                </h1>
                <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                  A 6-digit code was sent to <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{email}</span>.
                  Enter it below to complete setup.
                </p>

                <form onSubmit={verifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Verification Code
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
                    {loading ? 'Verifying…' : 'Activate Account'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('details'); setError(null); setOtp(''); }}
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

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-dim)' }}>
          By registering you agree to our{' '}
          <Link to="/terms-conditions" className="underline underline-offset-2" style={{ color: 'var(--text-muted)' }}>Terms</Link>
          {' '}and{' '}
          <Link to="/privacy-policy" className="underline underline-offset-2" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}
