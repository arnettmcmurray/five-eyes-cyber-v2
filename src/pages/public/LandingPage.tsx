import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Mail, Lock, Map, Zap } from 'lucide-react';
import EmailAssessment from '../../components/EmailAssessment';

const TACTICAL_CARDS = [
  {
    title: 'Training',
    desc: 'Cyber resilience academy — live modules, assessments, and knowledge base.',
    img: '/assets/dashboard/tactical_simulations.png',
    path: '/learn',
    btn: 'Enter Academy',
    icon: BookOpen,
  },
  {
    title: 'Simulations',
    desc: 'Live breach simulation and tabletop exercise terminal.',
    img: '/assets/ttx/port-operations-center.png',
    path: '/ttx/sessions',
    btn: 'Run Exercise',
    icon: Shield,
  },
  {
    title: 'Contact',
    desc: 'Partner with Five Eyes for enterprise security ecosystems.',
    img: '/assets/ttx/cargo-ship-night.png',
    path: '/enterprise',
    btn: 'Begin Assessment',
    icon: Mail,
  },
];

const CAPABILITIES = [
  {
    icon: Lock,
    title: 'Freight Security Analysis',
    desc: 'Intelligence-grade assessment of physical and digital supply chain vulnerabilities, modeled after defense sector threat analysis.',
    image: '/assets/dashboard/freight_fraud.png',
  },
  {
    icon: Shield,
    title: 'Cyber Resilience Training',
    desc: 'Specialized training modules focusing on the specific tactics used by ransomware gangs and nation-state actors targeting logistics.',
    image: '/assets/dashboard/ransomware.png',
  },
  {
    icon: Map,
    title: 'Strategic Threat Intelligence',
    desc: 'Actionable intelligence feeds curated by former military and intelligence analysts, translating global events to supply chain impacts.',
    image: '/assets/dashboard/supply_chain.png',
  },
  {
    icon: Zap,
    title: 'Rapid Incident Response',
    desc: 'On-call expertise to guide your executive team through the critical first 72 hours of a major cyber or physical breach.',
    image: '/assets/dashboard/data_breach.png',
  },
];

export default function LandingPage() {
  return (
    <div className="relative w-full overflow-hidden">

      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12 md:py-24 text-center"
        style={{ perspective: '2000px' }}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="mb-10 md:mb-20 max-w-2xl"
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-4 mb-7">
            <div className="h-px w-10" style={{ background: 'var(--border-gold)' }} />
            <span className="label-tag">Unified AI Influenced Training Interface</span>
            <div className="h-px w-10" style={{ background: 'var(--border-gold)' }} />
          </div>

          {/* Headline */}
          <h1 className="font-display font-black leading-none mb-2 tracking-tight"
            style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: 'var(--text-primary)' }}>
            Five Eyes
          </h1>
          <h2 className="font-display font-light tracking-tight mb-10"
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
              color: 'var(--gold-accent)',
            }}>
            Cyber Training
          </h2>

          {/* CTA */}
          <Link
            to="/packages"
            className="inline-block px-10 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.03] hover:brightness-110"
            style={{
              background: 'var(--gold-accent)',
              color: '#000',
              boxShadow: 'var(--glow-gold-strong)',
            }}
          >
            View Packages
          </Link>
        </motion.div>

        {/* Tactical Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {TACTICAL_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 32, rotateX: -8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.12 }}
              whileHover={{ y: -10, rotateX: 4 }}
              className="relative h-[280px] sm:h-[340px] md:h-[420px] rounded-[2rem] overflow-hidden group"
              style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--surface)' }}
            >
              {/* Image BG */}
              <div
                className="absolute inset-0 transition-all duration-700 group-hover:scale-108 saturate-50 group-hover:saturate-100"
                style={{
                  backgroundImage: `url('${card.img}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'grayscale(0.35)',
                }}
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-80"
                style={{
                  background: 'linear-gradient(to top, var(--bg-canvas) 0%, rgba(5,11,20,0.7) 50%, transparent 100%)',
                  opacity: 0.92,
                }}
              />

              {/* Content */}
              <Link to={card.path} className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end z-10">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110"
                  style={{
                    background: 'var(--gold-muted)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--gold-accent)',
                    boxShadow: 'var(--glow-gold)',
                  }}
                >
                  <card.icon size={20} />
                </div>
                <h3
                  className="font-display font-black uppercase mb-2 transition-colors group-hover:text-gold-accent"
                  style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', color: 'var(--text-primary)' }}
                >
                  {card.title}
                </h3>
                <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-6"
                  style={{ color: 'var(--text-muted)' }}>
                  {card.desc}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-ultra"
                  style={{ color: 'var(--gold-accent)' }}>
                  {card.btn}
                  <div
                    className="h-px transition-all duration-500 group-hover:w-12"
                    style={{ width: '24px', background: 'var(--border-gold)' }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="py-14 md:py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <span className="label-tag block mb-4">Capabilities</span>
            <h2
              className="font-display font-black uppercase tracking-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-primary)' }}
            >
              Intelligence-Grounded <span style={{ color: 'var(--gold-accent)' }}>Defense.</span>
            </h2>
            <p className="mt-3 max-w-xl text-base" style={{ color: 'var(--text-secondary)' }}>
              Explore the modules powering the modern defense-in-depth strategy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl gold-hover transition-all duration-500 flex flex-col"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                {/* Image strip */}
                <div className="h-40 w-full overflow-hidden relative shrink-0">
                  <div
                    className="absolute inset-0 z-10"
                    style={{ background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 60%)' }}
                  />
                  <img
                    src={cap.image}
                    alt={cap.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-7 z-20 relative">
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className="p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)' }}
                    >
                      <cap.icon size={20} />
                    </div>
                    <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{cap.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {cap.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Email Assessment ── */}
      <EmailAssessment />

      {/* ── Trust Quote ── */}
      <section className="py-16 md:py-28 px-6 flex justify-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <h2
            className="text-xl md:text-2xl font-serif italic leading-relaxed mb-10"
            style={{ color: 'rgba(255,255,255,0.78)' }}
          >
            "Security is not a product. It's a continuous operational state.
            Five Eyes moves your workforce from vulnerability to resilience."
          </h2>
          <div
            className="w-10 h-px mx-auto mb-5"
            style={{ background: 'var(--gold-accent)', boxShadow: '0 0 10px rgba(245,158,11,0.5)' }}
          />
          <p className="label-tag-muted">Director of Operations, Enterprise Client</p>
        </motion.div>
      </section>

    </div>
  );
}
