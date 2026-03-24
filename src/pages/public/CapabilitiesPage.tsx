import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Map, Zap, CheckCircle2 } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: Lock,
    title: 'Freight Security Analysis',
    description:
      'Intelligence-grade assessment of physical and digital supply chain vulnerabilities, modeled after defense sector threat analysis.',
    benefits: ['Real-time threat mapping', 'Route vulnerability analysis', 'Vendor risk profiling'],
    image: '/assets/dashboard/freight_fraud.png',
  },
  {
    icon: Shield,
    title: 'Cyber Resilience Training',
    description:
      'Specialized training modules focusing on the specific tactics used by ransomware gangs and nation-state actors targeting logistics.',
    benefits: ['Interactive tabletop exercises', 'Realistic phishing scenarios', 'Incident response drills'],
    image: '/assets/dashboard/ransomware.png',
  },
  {
    icon: Map,
    title: 'Strategic Threat Intelligence',
    description:
      'Actionable intelligence feeds curated by former military and intelligence analysts, translating global events to supply chain impacts.',
    benefits: ['Quarterly threat briefs', 'Emergency flash reports', 'Geopolitical risk analysis'],
    image: '/assets/dashboard/supply_chain.png',
  },
  {
    icon: Zap,
    title: 'Rapid Incident Response',
    description:
      'On-call expertise to guide your executive team through the critical first 72 hours of a major cyber or physical breach.',
    benefits: [
      'Executive communication strategy',
      'Legal notification guidance',
      'Containment protocols',
    ],
    image: '/assets/ttx/bec_scenario_hero.png',
  },
];

export default function CapabilitiesPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="relative z-10 min-h-screen">

      {/* ── Page header ── */}
      <section className="pt-14 md:pt-20 pb-10 md:pb-14 px-6 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <span className="label-tag block mb-5">Our Capabilities</span>
          <h1
            className="font-display font-black uppercase tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: 'var(--text-primary)' }}
          >
            Our <span style={{ color: 'var(--gold-accent)' }}>Capabilities</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
            Elite security solutions built specifically for the complexities of the modern logistics and supply chain sector.
          </p>
        </motion.div>
      </section>

      {/* ── Capability Cards ── */}
      <section className="px-4 md:px-8 pb-14 md:pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: i * 0.1 }}
              className="group rounded-[1.75rem] overflow-hidden gold-hover transition-all duration-500"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              {/* Image header */}
              <div className="relative h-36 md:h-48 overflow-hidden">
                <div
                  className="absolute inset-0 z-10"
                  style={{ background: 'linear-gradient(to top, var(--bg-surface) 0%, rgba(7,16,32,0.4) 50%, transparent 100%)' }}
                />
                <img
                  src={cap.image}
                  alt={cap.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-5 md:p-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: 'var(--gold-muted)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--gold-accent)',
                  }}
                >
                  <cap.icon size={26} />
                </div>

                <h3
                  className="font-display font-black text-2xl mb-4 tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {cap.title}
                </h3>

                <p className="text-sm leading-relaxed mb-7" style={{ color: 'var(--text-secondary)' }}>
                  {cap.description}
                </p>

                <ul className="space-y-3">
                  {cap.benefits.map(b => (
                    <li key={b} className="flex items-center gap-3 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>
                      <CheckCircle2 size={15} style={{ color: 'var(--gold-accent)', flexShrink: 0 }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto rounded-[2rem] p-7 md:p-12 text-center"
          style={{
            background: 'var(--gold-muted)',
            border: '1px solid var(--border-gold)',
            boxShadow: 'var(--glow-gold)',
          }}
        >
          <h2
            className="font-display font-black uppercase tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}
          >
            Ready to Elevate Your Security?
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Book a free confidential threat assessment call with our senior consultants.
          </p>
          <Link
            to="/enterprise"
            className="inline-block px-10 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.03] hover:brightness-110"
            style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
          >
            Book Your Free Confidential Threat Assessment Call
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
