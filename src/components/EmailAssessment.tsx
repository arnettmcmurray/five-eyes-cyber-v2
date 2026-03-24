import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ChevronRight, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────
type Option = { label: string; value: string };
type Question = {
  id: string;
  section: string;
  text: string;
  options: Option[];
};

// ── Questions ────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  // Section 1 — Environment
  {
    id: 'platform',
    section: 'Environment',
    text: 'Which platform do you use for business email?',
    options: [
      { label: 'Google Workspace', value: 'google' },
      { label: 'Microsoft 365', value: 'microsoft' },
      { label: 'Other / mixed setup', value: 'other' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  {
    id: 'dns_owner',
    section: 'Environment',
    text: 'Who manages your domain DNS?',
    options: [
      { label: 'Internal IT', value: 'internal' },
      { label: 'MSP / contractor', value: 'msp' },
      { label: 'Marketing / web vendor', value: 'marketing' },
      { label: "No one clearly owns it", value: 'none' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  {
    id: 'multi_sender',
    section: 'Environment',
    text: 'Does your organisation send email from more than one service?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  // Section 2 — Authentication basics
  {
    id: 'spf',
    section: 'Authentication basics',
    text: 'Do you know whether SPF is set up for your domain?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  {
    id: 'dkim',
    section: 'Authentication basics',
    text: 'Do you know whether DKIM signing is enabled?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  {
    id: 'dmarc',
    section: 'Authentication basics',
    text: 'Do you know whether DMARC is configured?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  {
    id: 'dmarc_policy',
    section: 'Authentication basics',
    text: 'If DMARC exists, what policy is currently in place?',
    options: [
      { label: 'None / not configured', value: 'none' },
      { label: 'p=none (monitoring only)', value: 'p_none' },
      { label: 'p=quarantine', value: 'p_quarantine' },
      { label: 'p=reject', value: 'p_reject' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  // Section 3 — Visibility
  {
    id: 'dmarc_reports',
    section: 'Visibility & testing',
    text: 'Does anyone review DMARC reports or authentication failures?',
    options: [
      { label: 'Yes, regularly', value: 'yes_regular' },
      { label: 'Occasionally', value: 'occasional' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  {
    id: 'tested',
    section: 'Visibility & testing',
    text: 'Have you recently tested whether email from your domain passes SPF, DKIM, and DMARC?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  // Section 4 — Risk & maturity
  {
    id: 'sender_inventory',
    section: 'Risk & maturity',
    text: 'Do you maintain a list of all approved systems allowed to send email as your domain?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  {
    id: 'incidents',
    section: 'Risk & maturity',
    text: 'Has your organisation experienced spoofing, phishing impersonation, or delivery failures?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
  {
    id: 'advanced',
    section: 'Risk & maturity',
    text: 'Are advanced protections such as MTA-STS or TLS reporting in place?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
];

// ── Scoring ──────────────────────────────────────────────────
type Band = 'needs_attention' | 'developing' | 'stronger';

function score(answers: Record<string, string>): Band {
  let risk = 0;
  const r = answers;

  if (['no', 'unknown'].includes(r.dns_owner ?? '')) risk++;
  if (r.multi_sender === 'yes' && ['no', 'unknown'].includes(r.spf ?? '')) risk++;
  if (['no', 'unknown'].includes(r.spf ?? '')) risk++;
  if (['no', 'unknown'].includes(r.dkim ?? '')) risk++;
  if (['no', 'unknown'].includes(r.dmarc ?? '')) risk++;
  if (['no', 'unknown', 'none', 'p_none'].includes(r.dmarc_policy ?? '')) risk++;
  if (['no', 'unknown'].includes(r.dmarc_reports ?? '')) risk++;
  if (['no', 'unknown'].includes(r.tested ?? '')) risk++;
  if (['no', 'unknown'].includes(r.sender_inventory ?? '')) risk++;
  if (r.incidents === 'yes') risk++;

  if (risk >= 7) return 'needs_attention';
  if (risk >= 4) return 'developing';
  return 'stronger';
}

const BAND_META: Record<Band, { label: string; color: string; icon: typeof Shield; desc: string }> = {
  needs_attention: {
    label: 'Needs Attention',
    color: '#f43f5e',
    icon: AlertTriangle,
    desc: 'Significant gaps or uncertainty detected in your email security posture. Core controls — SPF, DKIM, DMARC — may be missing or unverified.',
  },
  developing: {
    label: 'Developing',
    color: '#f59e0b',
    icon: Shield,
    desc: 'Some controls appear to be in place, but visibility or enforcement is weak. Practical next steps can close these gaps quickly.',
  },
  stronger: {
    label: 'Stronger Foundation',
    color: '#10b981',
    icon: CheckCircle,
    desc: 'Core controls appear in place. Your focus should shift to enforcement hardening, monitoring, and advanced protections.',
  },
};

// ── Registration form ─────────────────────────────────────────
interface RegData {
  fullName: string;
  workEmail: string;
  company: string;
  role: string;
  companySize: string;
  consent: boolean;
}

const COMPANY_SIZES = [
  '1–10', '11–50', '51–200', '201–500', '500+',
];

// ── Main component ────────────────────────────────────────────
export default function EmailAssessment() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'intro' | 'questions' | 'register' | 'done'>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reg, setReg] = useState<RegData>({ fullName: '', workEmail: '', company: '', role: '', companySize: '', consent: false });
  const [submitting, setSubmitting] = useState(false);
  const [resultBand, setResultBand] = useState<Band | null>(null);

  function selectAnswer(value: string) {
    const q = QUESTIONS[qIndex];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(i => i + 1);
    } else {
      setResultBand(score(next));
      setStep('register');
    }
  }

  async function submitRegistration(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reg,
          platform: answers.platform,
          resultBand,
          answers,
          source: 'email_assessment',
        }),
      }).catch(() => null); // best-effort — don't block on failure
      setStep('done');
    } finally {
      setSubmitting(false);
    }
  }

  const currentQ = QUESTIONS[qIndex];
  const progress = Math.round(((qIndex) / QUESTIONS.length) * 100);

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Section header */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10" style={{ background: 'var(--border-gold)' }} />
            <span className="label-tag">Free Assessment</span>
            <div className="h-px w-10" style={{ background: 'var(--border-gold)' }} />
          </div>

          <h2 className="font-display font-black uppercase tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text-primary)' }}>
            Email Security <span style={{ color: 'var(--gold-accent)' }}>Readiness</span>
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Answer a few quick questions to get a practical readiness snapshot for SPF, DKIM, DMARC, and email delivery protection.
            Honest guidance — not a fake scanner.
          </p>

          {!open && (
            <button
              onClick={() => { setOpen(true); setStep('questions'); }}
              className="inline-flex items-center gap-3 px-10 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.03] hover:brightness-110"
              style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold-strong)' }}
            >
              <Mail size={16} />
              Start Email Assessment
            </button>
          )}
        </motion.div>
      </div>

      {/* ── Assessment panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto mt-12 rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >

            {/* Questions */}
            {step === 'questions' && (
              <div className="p-8">
                {/* Progress bar */}
                <div className="flex items-center justify-between mb-2">
                  <span className="label-tag" style={{ color: 'var(--gold-accent)' }}>{currentQ.section}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {qIndex + 1} / {QUESTIONS.length}
                  </span>
                </div>
                <div className="w-full h-0.5 rounded-full mb-8" style={{ background: 'var(--border-subtle)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: 'var(--gold-accent)' }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={qIndex}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 className="font-bold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>
                      {currentQ.text}
                    </h3>
                    <div className="space-y-3">
                      {currentQ.options.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => selectAnswer(opt.value)}
                          className="w-full text-left px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.01]"
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-gold)';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                          }}
                        >
                          <span className="flex items-center gap-3">
                            <ChevronRight size={14} style={{ color: 'var(--gold-accent)', flexShrink: 0 }} />
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Registration */}
            {step === 'register' && resultBand && (
              <div className="p-8">
                {/* Result band preview */}
                <div
                  className="rounded-xl px-5 py-4 mb-8 flex items-start gap-4"
                  style={{ background: 'var(--bg-elevated)', border: `1px solid ${BAND_META[resultBand].color}33` }}
                >
                  {(() => {
                    const Meta = BAND_META[resultBand];
                    const Icon = Meta.icon;
                    return (
                      <>
                        <Icon size={22} style={{ color: Meta.color, flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: Meta.color }}>
                            Result — {Meta.label}
                          </p>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {Meta.desc}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="label-tag" style={{ color: 'var(--gold-accent)' }}>Get Your Full Report</span>
                </div>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Enter your details to receive specific recommendations for your environment.
                </p>

                <form onSubmit={submitRegistration} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                      <input
                        required
                        value={reg.fullName}
                        onChange={e => setReg(r => ({ ...r, fullName: e.target.value }))}
                        placeholder="Jane Smith"
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Work Email</label>
                      <input
                        required
                        type="email"
                        value={reg.workEmail}
                        onChange={e => setReg(r => ({ ...r, workEmail: e.target.value }))}
                        placeholder="jane@company.com"
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Company</label>
                      <input
                        required
                        value={reg.company}
                        onChange={e => setReg(r => ({ ...r, company: e.target.value }))}
                        placeholder="Company Ltd"
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Role / Title</label>
                      <input
                        value={reg.role}
                        onChange={e => setReg(r => ({ ...r, role: e.target.value }))}
                        placeholder="Head of IT"
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Team / Company Size</label>
                    <div className="flex gap-2 flex-wrap">
                      {COMPANY_SIZES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReg(r => ({ ...r, companySize: s }))}
                          className="px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all"
                          style={{
                            background: reg.companySize === s ? 'var(--gold-muted)' : 'var(--bg-elevated)',
                            border: reg.companySize === s ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                            color: reg.companySize === s ? 'var(--gold-accent)' : 'var(--text-muted)',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reg.consent}
                      onChange={e => setReg(r => ({ ...r, consent: e.target.checked }))}
                      className="mt-0.5 accent-amber-400"
                    />
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      I consent to Five Eyes contacting me with relevant security guidance based on my assessment results. No spam.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting || !reg.fullName || !reg.workEmail || !reg.company}
                    className="w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
                  >
                    {submitting ? 'Sending…' : 'Get My Recommendations'}
                  </button>
                </form>
              </div>
            )}

            {/* Done */}
            {step === 'done' && resultBand && (
              <div className="p-10 text-center">
                {(() => {
                  const Meta = BAND_META[resultBand];
                  const Icon = Meta.icon;
                  return (
                    <>
                      <Icon size={40} className="mx-auto mb-4" style={{ color: Meta.color }} />
                      <p className="label-tag mb-2" style={{ color: Meta.color }}>{Meta.label}</p>
                      <h3 className="font-bold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>Assessment complete</h3>
                      <p className="text-sm leading-relaxed max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
                        {Meta.desc}
                        {' '}Your full recommendations have been sent to your email — and our team will follow up with practical next steps.
                      </p>
                      <div className="w-10 h-px mx-auto mb-4" style={{ background: 'var(--gold-accent)' }} />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Questions? Contact us at{' '}
                        <a href="mailto:info@fiveeyesltd.com" style={{ color: 'var(--gold-accent)' }}>info@fiveeyesltd.com</a>
                      </p>
                    </>
                  );
                })()}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
