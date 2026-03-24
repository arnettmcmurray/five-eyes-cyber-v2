import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Shield, BookOpen, Zap } from 'lucide-react';

// ── Package definitions ───────────────────────────────────────
const PACKAGES = [
  {
    tier: 'Individual',
    tagline: 'Core training for the self-directed professional',
    price: 'Contact Us',
    priceDetail: 'Individual licence',
    icon: BookOpen,
    highlight: false,
    cta: 'Enquire Now',
    ctaPath: '/enterprise',
    features: [
      'Email security readiness assessment',
      'Core training modules',
      'Freight & logistics threat awareness',
      'Cyber essentials knowledge base',
      'Email delivery protection guidance',
      'SPF, DKIM & DMARC recommendations',
    ],
  },
  {
    tier: 'Professional',
    tagline: 'For teams that need to stay operational',
    price: 'Contact Us',
    priceDetail: 'Tailored to team size',
    icon: Shield,
    highlight: true,
    cta: 'Enquire Now',
    ctaPath: '/enterprise',
    features: [
      'Everything in Individual',
      'Full training academy — all modules',
      'Tabletop exercise (TTX) platform',
      'Ransomware & BEC simulation exercises',
      'Learner progress tracking',
      'Admin dashboard & reporting',
      'Priority support',
    ],
  },
  {
    tier: 'Enterprise',
    tagline: 'Intelligence-grade security at scale',
    price: 'Bespoke',
    priceDetail: 'Engagement scoping required',
    icon: Zap,
    highlight: false,
    cta: 'Book Assessment Call',
    ctaPath: '/enterprise',
    features: [
      'Everything in Professional',
      'AI-assisted training & simulation',
      'Custom scenario development',
      'Executive TTX facilitation',
      'Threat intelligence briefings',
      'On-call incident response guidance',
      'White-glove onboarding',
      'Dedicated Five Eyes analyst',
    ],
  },
];

export default function PackagesPage() {
  return (
    <div className="relative w-full overflow-hidden">

      {/* ── Hero ── */}
      <section className="pt-20 pb-10 md:pt-32 md:pb-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10" style={{ background: 'var(--border-gold)' }} />
            <span className="label-tag">Packages</span>
            <div className="h-px w-10" style={{ background: 'var(--border-gold)' }} />
          </div>

          <h1 className="font-display font-black uppercase tracking-tight mb-4"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--text-primary)' }}>
            Choose Your <span style={{ color: 'var(--gold-accent)' }}>Level</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            From individual training access to full enterprise resilience programs —
            built by former FBI and Military Intelligence operators.
          </p>
        </motion.div>
      </section>

      {/* ── Packages grid ── */}
      <section className="pb-16 md:pb-28 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PACKAGES.map((pkg, i) => {
            const Icon = pkg.icon;
            return (
              <motion.div
                key={pkg.tier}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.12 }}
                className="relative rounded-2xl flex flex-col"
                style={{
                  background: pkg.highlight ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  border: pkg.highlight
                    ? '1px solid var(--border-gold)'
                    : '1px solid var(--border-subtle)',
                  boxShadow: pkg.highlight ? 'var(--glow-gold)' : 'none',
                }}
              >
                {pkg.highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-ultra"
                    style={{ background: 'var(--gold-accent)', color: '#000' }}
                  >
                    Most Popular
                  </div>
                )}

                <div className="p-5 md:p-7">
                  {/* Tier header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--gold-muted)', border: '1px solid var(--border-gold)', color: 'var(--gold-accent)' }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="label-tag" style={{ color: 'var(--gold-accent)' }}>{pkg.tier}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pkg.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <p className="font-display font-black text-4xl" style={{ color: 'var(--text-primary)' }}>
                      {pkg.price}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pkg.priceDetail}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--gold-accent)' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5 md:px-7 md:pb-7 mt-auto">
                  <Link
                    to={pkg.ctaPath}
                    className="block w-full text-center py-3 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.02] hover:brightness-110"
                    style={pkg.highlight
                      ? { background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }
                      : { background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', color: 'var(--gold-accent)' }
                    }
                  >
                    {pkg.cta}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom note ── */}
      <section className="pb-20 px-6 text-center">
        <div className="w-10 h-px mx-auto mb-6" style={{ background: 'var(--gold-accent)', boxShadow: '0 0 10px rgba(245,158,11,0.4)' }} />
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          Not sure which level is right for your team?
        </p>
        <Link
          to="/enterprise"
          className="text-sm font-bold underline underline-offset-4 transition-opacity hover:opacity-80"
          style={{ color: 'var(--gold-accent)' }}
        >
          Book a free confidential threat assessment call →
        </Link>
      </section>

    </div>
  );
}
