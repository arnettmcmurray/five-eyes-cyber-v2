import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Shield, BookOpen, Mail, Lock, Map, Zap, ArrowRight } from 'lucide-react';
import { FiveEyesLogo } from '../../components/FiveEyesLogo';
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
  transition: { duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] as const },
});

// ── SVG route overlay paths (draw-on animation) ───────────────────────────────

function RouteOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      style={{ zIndex: 10 }}
    >
      {/* Main shipping lane */}
      <motion.path
        d="M 80 750 C 120 600, 280 500, 350 320 C 420 140, 500 80, 560 40"
        stroke="rgba(245,158,11,0.55)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.2, delay: 0.6, ease: 'easeInOut' }}
      />
      {/* Secondary route */}
      <motion.path
        d="M 20 680 C 100 580, 200 520, 300 440 C 400 360, 450 260, 480 160"
        stroke="rgba(245,158,11,0.28)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="6 8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.8, delay: 1.0, ease: 'easeInOut' }}
      />
      {/* Threat arc */}
      <motion.path
        d="M 560 720 C 480 600, 350 500, 260 380"
        stroke="rgba(239,68,68,0.35)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="4 10"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.0, delay: 1.5, ease: 'easeInOut' }}
      />
      {/* Port node */}
      <motion.circle
        cx="350" cy="320"
        r="5"
        fill="rgba(245,158,11,0.9)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.8 }}
      />
      <motion.circle
        cx="350" cy="320"
        r="14"
        fill="none"
        stroke="rgba(245,158,11,0.35)"
        strokeWidth="1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 1], opacity: [0, 0.6, 0.3] }}
        transition={{ duration: 1.2, delay: 2.0, repeat: Infinity, repeatDelay: 3 }}
      />
      {/* Threat node */}
      <motion.circle
        cx="260" cy="380"
        r="4"
        fill="rgba(239,68,68,0.8)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 2.2 }}
      />
    </svg>
  );
}

// ── Cinematic Entry Screen ────────────────────────────────────────────────────

function CinematicEntry({ onEnter }: { onEnter: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {/* autoplay blocked — fine */});
    }
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-end overflow-hidden"
      style={{ background: '#000' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Video background */}
      <video
        ref={videoRef}
        src="/assets/video/premium-logistics.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.65 }}
        muted
        loop
        playsInline
      />

      {/* Dark gradient scrim — heavier at top and bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom,
              rgba(0,0,0,0.72) 0%,
              rgba(0,0,0,0.28) 40%,
              rgba(0,0,0,0.28) 60%,
              rgba(0,0,0,0.80) 100%
            )
          `,
        }}
      />

      {/* Center lock-up */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex items-center justify-center mb-6"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.5)',
              boxShadow: '0 0 40px rgba(245,158,11,0.25)',
            }}
          >
            <FiveEyesLogo size={28} className="text-gold-accent" />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="font-display font-black uppercase tracking-ultra text-[10px] mb-4"
          style={{ color: 'rgba(245,158,11,0.7)', letterSpacing: '0.35em' }}
        >
          Five Eyes
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="font-display font-black uppercase leading-tight mb-3 mx-auto"
          style={{
            fontSize: 'clamp(1.8rem, 5vw, 3.4rem)',
            color: '#fff',
            maxWidth: '700px',
            letterSpacing: '-0.01em',
          }}
        >
          Intelligence-Grade Security<br />for Freight &amp; Logistics
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '48px' }}
          transition={{ duration: 0.6, delay: 1.7 }}
          className="h-px mx-auto mb-10"
          style={{ background: 'var(--gold-accent)' }}
        />
      </div>

      {/* ENTER button — bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.0 }}
        className="relative z-10 mb-14"
      >
        <button
          onClick={onEnter}
          className="px-10 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.03] hover:brightness-110 focus:outline-none"
          style={{
            background: 'var(--gold-accent)',
            color: '#000',
            boxShadow: '0 0 40px rgba(245,158,11,0.5)',
          }}
        >
          Enter Platform →
        </button>
        <p
          className="text-center mt-3 text-[10px] uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Former FBI &amp; Military Intelligence
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [showEntry, setShowEntry] = useState(() => {
    try {
      return !sessionStorage.getItem('five-eyes-entered');
    } catch {
      return false;
    }
  });

  const handleEnter = () => {
    try { sessionStorage.setItem('five-eyes-entered', '1'); } catch { /* ignore */ }
    setShowEntry(false);
  };

  return (
    <>
      {/* ── Cinematic pre-home entry ── */}
      <AnimatePresence>
        {showEntry && <CinematicEntry onEnter={handleEnter} />}
      </AnimatePresence>

      <div className="relative w-full overflow-hidden">

        {/* ── Hero ── */}
        <section className="relative min-h-screen flex overflow-hidden">

          {/* Left — editorial command column */}
          <div className="relative z-10 w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-28 lg:py-0">

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
                style={{ fontSize: 'clamp(3.2rem, 6.5vw, 5.8rem)', color: 'var(--text-primary)' }}
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

          {/* Right — photography + route overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.2, ease: 'easeOut' }}
            className="hidden lg:block lg:w-[55%] relative overflow-hidden"
          >
            {/* Port cranes photography */}
            <img
              src="/assets/port-cranes.avif"
              alt="Port operations"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.72) saturate(0.85)' }}
            />

            {/* Dark tint + left-edge fade into bg */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, var(--bg-canvas) 0%, transparent 18%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, var(--bg-canvas) 0%, transparent 30%)',
              }}
            />

            {/* SVG intelligence route overlay */}
            <RouteOverlay />

            {/* Intel badge — top right */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 2.4 }}
              className="absolute top-10 right-8 z-20 px-4 py-2 rounded-xl"
              style={{
                background: 'rgba(5,11,20,0.82)',
                border: '1px solid var(--border-gold)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p className="text-[9px] font-black uppercase tracking-ultra mb-0.5" style={{ color: 'var(--gold-accent)' }}>
                Threat Active
              </p>
              <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>
                UK–EU Corridor · BEC Variant
              </p>
            </motion.div>
          </motion.div>

          {/* Full-width bottom fade */}
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
                  <div
                    className="absolute inset-0 transition-transform duration-slower group-hover:scale-105"
                    style={{
                      backgroundImage: `url('${card.img}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'grayscale(0.25) brightness(0.9)',
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, var(--img-overlay-bottom) 0%, var(--img-overlay-mid) 50%, transparent 100%)',
                    }}
                  />
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
                  <div className="h-36 w-full overflow-hidden relative shrink-0">
                    <div
                      className="absolute inset-0 z-10"
                      style={{ background: 'linear-gradient(to top, var(--img-overlay-bottom) 0%, transparent 60%)' }}
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
                color: 'var(--text-secondary)',
              }}
            >
              "Security is not a product. It's a continuous operational state.
              Five Eyes moves your workforce from vulnerability to resilience."
            </blockquote>
            <p className="label-tag-muted">Director of Operations, Enterprise Client</p>
          </motion.div>
        </section>

      </div>
    </>
  );
}
