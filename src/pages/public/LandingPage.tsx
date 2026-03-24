import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Shield, BookOpen, Mail, Lock, Map, Zap, ArrowRight } from 'lucide-react';
import { SignalMapCanvas } from '../../components/SignalMapCanvas';
import EmailAssessment from '../../components/EmailAssessment';

// ── Tactical section cards ────────────────────────────────────────────────────

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

// ── Capabilities grid ─────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: Lock,
    title: 'Freight Security Analysis',
    desc: 'Intelligence-grade assessment of physical and digital supply chain vulnerabilities, modeled after defence sector threat analysis.',
    image: '/assets/dashboard/freight_fraud.png',
  },
  {
    icon: Shield,
    title: 'Cyber Resilience Training',
    desc: 'Specialised training modules targeting the specific tactics used by ransomware gangs and nation-state actors against logistics.',
    image: '/assets/dashboard/ransomware.png',
  },
  {
    icon: Map,
    title: 'Strategic Threat Intelligence',
    desc: 'Actionable intelligence curated by former military and intelligence analysts, translating global events to supply chain impact.',
    image: '/assets/dashboard/supply_chain.png',
  },
  {
    icon: Zap,
    title: 'Rapid Incident Response',
    desc: 'On-call expertise to guide your executive team through the critical first 72 hours of a major cyber or physical breach.',
    image: '/assets/dashboard/data_breach.png',
  },
];

// ── Hero proof cluster ────────────────────────────────────────────────────────

const STATS = [
  { value: '3', label: 'Training Modules', sub: 'Phishing · BEC · MFA' },
  { value: 'KB', label: 'Knowledge-Grounded', sub: 'No hallucinated guidance' },
  { value: 'TTX', label: 'Tabletop Exercises', sub: 'Professional tier included' },
];

// ── Magnetic CTA button ───────────────────────────────────────────────────────

function MagneticLink({
  to,
  children,
  className,
  style,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 420, damping: 28 });
  const y = useSpring(rawY, { stiffness: 420, damping: 28 });

  const onMove = (e: React.MouseEvent) => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    rawX.set((e.clientX - r.left - r.width / 2) * 0.30);
    rawY.set((e.clientY - r.top - r.height / 2) * 0.30);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <motion.div
      ref={wrapRef}
      style={{ x, y, display: 'inline-block' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <Link to={to} className={className} style={style}>{children}</Link>
    </motion.div>
  );
}

// ── Fade-in variants ──────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] },
});

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="relative w-full overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex overflow-hidden">

        {/* Left — editorial command column */}
        <div className="relative z-10 w-full lg:w-[58%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-28 lg:py-0">

          {/* Eyebrow */}
          <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 shrink-0" style={{ background: 'var(--border-gold)' }} />
            <span className="label-tag tracking-ultra">
              Freight · Logistics · Cyber Security
            </span>
          </motion.div>

          {/* Headline */}
          <div className="mb-7 overflow-hidden">
            <motion.h1
              className="font-display font-black leading-[0.92] tracking-tight"
              style={{ fontSize: 'clamp(3.6rem, 7.5vw, 6.5rem)', color: 'var(--text-primary)' }}
            >
              <motion.span {...fadeUp(0.08)} style={{ display: 'block' }}>
                PROTECT YOUR
              </motion.span>
              <motion.span
                {...fadeUp(0.18)}
                style={{ display: 'block', color: 'var(--gold-accent)' }}
              >
                SUPPLY CHAIN.
              </motion.span>
            </motion.h1>
          </div>

          {/* Subhead */}
          <motion.p
            {...fadeUp(0.32)}
            className="max-w-sm text-[15px] leading-relaxed mb-10"
            style={{ color: 'var(--text-secondary)' }}
          >
            Intelligence-grounded training and tabletop exercises for transport and
            logistics operations. Built for the threats targeting your sector.
          </motion.p>

          {/* CTA row */}
          <motion.div {...fadeUp(0.44)} className="flex flex-wrap items-center gap-4 mb-12">
            <MagneticLink
              to="/packages"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all duration-base hover:brightness-110"
              style={{
                background: 'var(--gold-accent)',
                color: '#000',
                boxShadow: 'var(--glow-gold-strong)',
              }}
            >
              View Packages
            </MagneticLink>

            <Link
              to="/capabilities"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all duration-base hover:brightness-125 group"
              style={{
                border: '1px solid var(--border-strong)',
                color: 'var(--text-secondary)',
              }}
            >
              See Capabilities
              <ArrowRight
                size={12}
                className="transition-transform duration-base group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>

          {/* Stat cluster */}
          <motion.div
            {...fadeUp(0.56)}
            className="flex flex-wrap gap-0 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.value}
                className="flex flex-col pt-5 pr-8 mr-8"
                style={{
                  borderRight: i < STATS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <span
                  className="font-display font-black leading-none mb-1"
                  style={{ fontSize: '1.6rem', color: 'var(--gold-accent)' }}
                >
                  {s.value}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {s.label}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                  {s.sub}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — signal map canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.15, ease: 'easeOut' }}
          className="hidden lg:block lg:flex-1 relative"
        >
          <SignalMapCanvas />
          {/* Fade: canvas blends into bg on the left edge */}
          <div
            className="absolute inset-y-0 left-0 w-40 pointer-events-none"
            style={{ background: 'linear-gradient(to right, var(--bg-canvas), transparent)' }}
          />
          {/* Fade: top */}
          <div
            className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, var(--bg-canvas), transparent)' }}
          />
          {/* Fade: bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(to top, var(--bg-canvas), transparent)' }}
          />
        </motion.div>

        {/* Full-width bottom scroll-signal fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--bg-canvas), transparent)' }}
        />
      </section>

      {/* ── Tactical Cards ── */}
      <section className="py-16 md:py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="label-tag block mb-3">Platform</span>
            <h2
              className="font-display font-black uppercase tracking-tight"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', color: 'var(--text-primary)' }}
            >
              Training. Simulation.{' '}
              <span style={{ color: 'var(--gold-accent)' }}>Intelligence.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TACTICAL_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="relative h-[280px] sm:h-[320px] md:h-[400px] rounded-2xl overflow-hidden group cursor-pointer"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                {/* Image */}
                <div
                  className="absolute inset-0 transition-transform duration-slower group-hover:scale-105"
                  style={{
                    backgroundImage: `url('${card.img}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(0.25) brightness(0.9)',
                  }}
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, var(--bg-canvas) 0%, rgba(5,11,20,0.65) 50%, transparent 100%)',
                  }}
                />
                {/* Content */}
                <Link to={card.path} className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-base group-hover:scale-105"
                    style={{
                      background: 'var(--gold-muted)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--gold-accent)',
                    }}
                  >
                    <card.icon size={18} />
                  </div>
                  <h3
                    className="font-display font-black uppercase mb-2 transition-colors duration-base group-hover:text-gold-accent"
                    style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.9rem)', color: 'var(--text-primary)' }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-[11px] font-semibold leading-relaxed mb-5"
                    style={{ color: 'var(--text-muted)' }}>
                    {card.desc}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-ultra"
                    style={{ color: 'var(--gold-accent)' }}>
                    {card.btn}
                    <div
                      className="h-px transition-all duration-slow group-hover:w-10"
                      style={{ width: '20px', background: 'var(--border-gold)' }}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="py-14 md:py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="label-tag block mb-3">Capabilities</span>
            <h2
              className="font-display font-black uppercase tracking-tight"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', color: 'var(--text-primary)' }}
            >
              Intelligence-Grounded{' '}
              <span style={{ color: 'var(--gold-accent)' }}>Defence.</span>
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Built around the threats facing UK transport, logistics, and freight operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl gold-hover transition-all duration-slow flex flex-col"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                {/* Image strip */}
                <div className="h-36 w-full overflow-hidden relative shrink-0">
                  <div
                    className="absolute inset-0 z-10"
                    style={{ background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 60%)' }}
                  />
                  <img
                    src={cap.image}
                    alt={cap.title}
                    className="w-full h-full object-cover transition-transform duration-slower group-hover:scale-105"
                  />
                </div>
                <div className="p-6 z-20 relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2 rounded-lg transition-transform duration-base group-hover:scale-105"
                      style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)' }}
                    >
                      <cap.icon size={18} />
                    </div>
                    <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
                      {cap.title}
                    </h3>
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

      {/* ── Trust quote ── */}
      <section className="py-20 md:py-32 px-6 flex justify-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-xl"
        >
          <div className="w-8 h-px mx-auto mb-8" style={{ background: 'var(--border-gold)' }} />
          <blockquote
            className="font-display font-light leading-tight mb-8"
            style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              color: 'rgba(255,255,255,0.80)',
            }}
          >
            "Security is not a product. It's a continuous operational state.
            Five Eyes moves your workforce from vulnerability to resilience."
          </blockquote>
          <p className="label-tag-muted">Director of Operations, Enterprise Client</p>
        </motion.div>
      </section>

    </div>
  );
}
