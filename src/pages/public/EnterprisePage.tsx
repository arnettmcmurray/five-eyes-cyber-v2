import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../api/client';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  newsletter: boolean;
};

const EMPTY: FormData = {
  firstName: '', lastName: '', email: '', phone: '', company: '', message: '', newsletter: false,
};

export default function EnterprisePage() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.public.contact({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        company: form.company || undefined,
        message: form.message || undefined,
        newsletter: form.newsletter,
      });
      setSubmitted(true);
      setForm(EMPTY);
    } catch {
      setSubmitError('Something went wrong. Please try again or email us directly at info@fiveeyesltd.com.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <div className="relative z-10">

      {/* ── Hero ── */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: '52vh' }}
      >
        {/* Full-bleed photo */}
        <img
          src="/assets/ttx/cargo-ship-night.png"
          alt="Cargo ship at night"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.40) saturate(0.6)' }}
        />
        {/* Gradient scrim */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 55%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 50%, var(--bg-canvas) 100%)',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="label-tag block mb-5">Contact</span>
            <h1
              className="font-display font-black mb-7 leading-none"
              style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', color: '#ffffff' }}
            >
              Contact Us
            </h1>
            <p
              className="text-xl font-bold leading-relaxed max-w-md"
              style={{ color: 'rgba(255,255,255,0.82)' }}
            >
              Your competitors are upgrading their security.<br />
              Cybercriminals are probing your systems.<br />
              <br />
              Now is the time to act.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Form Section ── */}
      <section id="contact-form-section" className="py-10 md:py-16 px-5 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 md:gap-14">

          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex-1"
          >
            <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Book Your Free Confidential Threat Assessment Call
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Please fill out the form below, and one of our senior consultants will be in touch within{' '}
              <strong style={{ color: 'var(--gold-accent)' }}>24 hours.</strong>
            </p>
            <div
              className="text-sm space-y-4 pl-5"
              style={{ borderLeft: '2px solid var(--gold-accent)' }}
            >
              <p style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Call us directly:</strong> 07825 371263
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Email:</strong> info@fiveeyesltd.com
              </p>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <h3 className="font-bold text-emerald-400 mb-2">Request Received</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Thank you. A senior consultant will contact you within 24 hours to schedule your assessment.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="label-tag-muted border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  Information Required
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <FormField label="First Name" type="text" value={form.firstName} onChange={set('firstName')} required />
                  <FormField label="Last Name" type="text" value={form.lastName} onChange={set('lastName')} required />
                </div>

                <FormField label="Email Address" type="email" value={form.email} onChange={set('email')} required>
                  <label className="flex items-center gap-3 mt-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={set('newsletter')}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--gold-accent)' }}
                    />
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest transition-colors group-hover:text-white"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Sign up for intelligence updates
                    </span>
                  </label>
                </FormField>

                <div className="flex flex-col sm:flex-row gap-4">
                  <FormField label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} />
                  <FormField label="Company" type="text" value={form.company} onChange={set('company')} required />
                </div>

                <div>
                  <label className="label-tag block mb-2">Security Requirements / Message</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={set('message')}
                    className="w-full rounded-lg p-3 text-sm resize-none transition-all focus:outline-none"
                    style={{
                      background: 'rgba(0,0,0,0.35)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'var(--gold-accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                  />
                </div>

                {submitError && (
                  <p className="text-xs" style={{ color: 'var(--status-error)' }}>{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-10 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.02] hover:brightness-110 disabled:opacity-50"
                  style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
                >
                  {submitting ? 'Sending…' : 'SUBMIT REQUEST'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

    </div>
  );
}

/* ── FormField helper ── */
function FormField({
  label, type, value, onChange, required = false, children,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      <label className="label-tag block mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg p-3 text-sm transition-all focus:outline-none"
        style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--gold-accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
      />
      {children}
    </div>
  );
}
