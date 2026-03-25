import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearnerTier, hasTtxAccess } from '../hooks/useLearnerTier';

const SHIELD_PATH = 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'The facilitator opens a scenario',
    body: 'A security lead or Five Eyes facilitator selects a threat scenario and launches a session. The scenario is drawn from real freight and logistics incident patterns — BEC fraud, ransomware, cargo diversion, supply chain compromise.',
  },
  {
    n: '02',
    title: 'The scenario unfolds in steps',
    body: 'The facilitator advances the scenario through timed steps and injects — unexpected developments that the team must respond to. Each step presents a situation: new information arrives, a decision must be made, or the crisis escalates.',
  },
  {
    n: '03',
    title: 'Participants submit decisions and rationale',
    body: 'Each participant responds through the platform: what they would do, why, and which internal protocols or contacts they would involve. There are no single correct answers — the exercise surfaces decision-making patterns, not test scores.',
  },
  {
    n: '04',
    title: 'After-action review',
    body: 'After the scenario concludes, the facilitator runs an after-action review (AAR). The team reviews decisions made, identifies gaps in process or knowledge, and agrees on actions to take before the next real incident.',
  },
];

const PREP_ITEMS = [
  {
    label: 'Payment and wire transfer procedures',
    detail: 'Know your company\'s escalation path for payment fraud. Who do you call first? What is the approval chain for urgent transfers?',
  },
  {
    label: 'Incident reporting contacts',
    detail: 'Have your IT contact, operations manager, and security lead details accessible. TTX scenarios often start with "who do you call?"',
  },
  {
    label: 'Business email compromise indicators',
    detail: 'Review the BEC module if you have not completed it. TTX scenarios frequently involve BEC patterns — the preparation pays off.',
  },
  {
    label: 'Your company\'s vendor verification policy',
    detail: 'If you process payments or manage carrier/vendor relationships, know the out-of-band verification rule before you are asked to apply it under pressure.',
  },
  {
    label: 'Your ransomware response steps',
    detail: 'Know what to do in the first fifteen minutes of a ransomware event. Isolation steps, who to call, what not to do.',
  },
  {
    label: 'Regulatory and compliance context',
    detail: 'Freight operations interact with FMCSA, CISA, and sector-specific guidance. Understanding the regulatory environment makes your responses more grounded.',
  },
];

export default function LearnTTX() {
  const { tier, loading } = useLearnerTier();

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Loading…</span>
    </div>
  );

  const hasAccess = hasTtxAccess(tier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-10"
    >
      {/* Header */}
      <div>
        <p className="label-tag-muted mb-2">Tactical Simulations</p>
        <h1 className="font-display font-black text-2xl tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
          Tabletop Exercises
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          A tabletop exercise (TTX) is a facilitated team simulation. Your team walks through a realistic threat scenario in a low-stakes environment and practises the decisions, communications, and escalation steps that a real incident demands.
          The goal is not to score points — it is to find the gaps before a real attacker does.
        </p>
      </div>

      {/* Access status */}
      {hasAccess ? (
        <div
          className="rounded-xl p-5 flex items-center gap-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--gold-muted)', border: '1px solid var(--border-gold)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--gold-accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={SHIELD_PATH} />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Professional Access — TTX Enabled</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Your facilitator will share a session link when a session is active. Use the direct link to join.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-5 flex items-start gap-4"
          style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid var(--border-gold)' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'var(--gold-muted)', border: '1px solid var(--border-gold)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--gold-accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={SHIELD_PATH} />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-black mb-1" style={{ color: 'var(--text-primary)' }}>Professional Plan Required for Live Sessions</p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              TTX participation requires the Professional plan. You can read through how it works and prepare using the training modules below.
            </p>
            <Link
              to="/packages"
              className="inline-block px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra"
              style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
            >
              View Plans
            </Link>
          </div>
        </div>
      )}

      {/* How a session works */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          How a session works
        </p>
        <div className="space-y-3">
          {HOW_IT_WORKS.map(({ n, title, body }) => (
            <div
              key={n}
              className="rounded-xl p-5 flex gap-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <span
                className="text-[11px] font-black shrink-0 mt-0.5 w-7 text-right"
                style={{ color: 'var(--gold-accent)', fontVariantNumeric: 'tabular-nums' }}
              >
                {n}
              </span>
              <div>
                <p className="text-sm font-black mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What to expect */}
      <div
        className="rounded-xl p-6 space-y-3"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
          What to expect as a participant
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          You will be presented with a scenario and asked to describe what you would do. There is no live system access required — decisions are submitted as text. You may be asked to explain your reasoning, identify who you would escalate to, or describe which policy or protocol you would follow.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          The most valuable TTX participants are not those who give the "right" answers — they are those who think out loud, identify their own uncertainty, and engage honestly with the scenario. The AAR is where the learning happens.
        </p>
      </div>

      {/* Preparation checklist */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          How to prepare
        </p>
        <div className="space-y-2">
          {PREP_ITEMS.map(({ label, detail }) => (
            <div
              key={label}
              className="rounded-xl px-5 py-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Module link suggestion */}
      <div
        className="rounded-xl px-5 py-4 flex items-center justify-between gap-4"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Build your knowledge first</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Complete your assigned modules before a TTX session to get more from the exercise.</p>
        </div>
        <Link
          to="/learn/dashboard"
          className="shrink-0 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-ultra"
          style={{ background: 'var(--gold-accent)', color: '#000' }}
        >
          Modules →
        </Link>
      </div>

      <div className="text-center pb-4">
        <Link to="/learn/dashboard" className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          ← Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}
