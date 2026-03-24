import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay },
});

export default function AboutPage() {

  return (
    <div className="relative z-10">

      {/* ── Hero ── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '62vh' }}
      >
        {/* Atmospheric dark overlay — no Unsplash */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 80% 60% at 80% 100%, rgba(30,58,95,0.15) 0%, transparent 50%),
              linear-gradient(180deg, rgba(5,11,20,0.4) 0%, var(--bg-canvas) 100%)
            `,
          }}
        />
        {/* Structured grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(var(--border-strong) 1px, transparent 1px), linear-gradient(90deg, var(--border-strong) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8 py-16 md:py-24 text-center">
          <motion.div {...fadeUp(0.0)} className="mb-6">
            <span className="label-tag">About Five Eyes</span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="font-display font-black leading-tight mb-8 mx-auto"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: 'var(--text-primary)', maxWidth: '900px' }}
          >
            Former <span style={{ textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '8px' }}>FBI</span> &amp; Military Intelligence Experts Bringing Elite Security to the Logistics and Supply Chain Sector
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="text-lg font-bold tracking-wide mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Trusted by Governments. Built for Logistics.<br />Dedicated to You.
          </motion.p>

          <motion.p
            {...fadeUp(0.3)}
            className="text-sm leading-relaxed mb-10 mx-auto"
            style={{ color: 'var(--text-secondary)', maxWidth: '520px' }}
          >
            For decades, our team protected some of the world's most sensitive assets. Now, we bring that same intelligence-grade protection to the firms that keep global trade moving.
          </motion.p>

          <motion.div {...fadeUp(0.4)}>
            <Link
              to="/enterprise"
              className="inline-block px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.03] hover:brightness-110"
              style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
            >
              Book your Security Analysis Call
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Problem Section ── */}
      <GlassSection delay={0}>
        <SectionHeader title="The Problem We See" />
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <p className="text-base leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
            Your clients rely on you to move high-value cargo and sensitive data across borders every day.
            That makes you a prime target for ransomware, espionage, and compliance failures.
          </p>
          <p className="text-base leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
            The truth? Until now, logistics firms like yours have been operating without access to the same
            level of protection that governments and Fortune 500 companies rely on.
          </p>
        </div>
      </GlassSection>

      {/* ── Who We Are ── */}
      <GlassSection delay={0.1}>
        <SectionHeader title="Who We Are" />
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-base font-bold mb-6" style={{ color: 'var(--gold-accent)' }}>
            We've protected governments, Fortune 500 companies, and Critical Infrastructure.
          </p>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Now, our mission is to safeguard the logistics sector and supply chain industry,
            the overlooked backbone of global commerce.
          </p>

          <div
            className="text-left rounded-2xl p-7 mb-8"
            style={{ background: 'rgba(10,24,48,0.6)', border: '1px solid var(--border-subtle)' }}
          >
            <p className="label-tag-muted mb-4">Our leadership team:</p>
            <ul className="space-y-3 pl-4">
              {[
                'Former British Military Intelligence operatives',
                'Former FBI cybersecurity specialists',
                'Veterans of national-level cyber defence and threat operations',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--gold-accent)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            From dismantling international cybercrime rings to designing security frameworks for{' '}
            <UnderlinedTerm>AWS</UnderlinedTerm>,{' '}
            <UnderlinedTerm>Microsoft</UnderlinedTerm>,{' '}
            the <UnderlinedTerm>UK government</UnderlinedTerm>, and the{' '}
            <UnderlinedTerm>US government</UnderlinedTerm>,
            we've operated at the highest level.
          </p>

          <p
            className="font-display font-black uppercase text-base tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Now, we're focused on protecting firms like yours.
          </p>
        </div>
      </GlassSection>

      {/* ── What Makes Us Different ── */}
      <section className="py-12 md:py-20 px-4 md:px-8 relative z-10">
        <div
          className="max-w-5xl mx-auto rounded-[2rem] p-6 md:p-12"
          style={{ background: 'rgba(7,16,32,0.5)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)' }}
        >
          <h2
            className="font-display font-black uppercase text-center mb-8 md:mb-16"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.15em', color: 'var(--text-primary)' }}
          >
            What Makes Us Different
          </h2>

          <div className="space-y-8 md:space-y-14">
            {[
              {
                title: 'Security Level',
                others: 'Basic compliance or outsourced IT.',
                us: 'Intelligence-grade threat analysis, elite-level protection, delivered by former government cyber and intelligence specialists.',
              },
              {
                title: 'Focus',
                others: 'Generic "one-size-fits-all" solutions across industries.',
                us: 'Exclusive focus on UK & USA businesses within the logistics and supply chain industry.',
              },
              {
                title: 'Integration',
                others: 'Disjointed tech tools and multiple vendors.',
                us: 'Seamless integration of cyber protection, physical protection and threat intelligence into one elite system.',
              },
            ].map(({ title, others, us }) => (
              <div
                key={title}
                className="pb-14 last:pb-0"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className="flex flex-col items-center text-center gap-3 mb-8">
                  <div
                    className="w-14 h-1 rounded-full"
                    style={{ background: 'var(--gold-accent)', boxShadow: '0 0 12px rgba(245,158,11,0.4)' }}
                  />
                  <h3 className="font-display font-black uppercase tracking-widest text-2xl" style={{ color: 'var(--text-primary)' }}>
                    {title}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className="p-5 rounded-xl"
                    style={{ background: 'rgba(10,24,48,0.35)', border: '1px solid var(--border-subtle)' }}
                  >
                    <span className="label-tag-muted block mb-2">What Others Do</span>
                    <p className="text-base italic" style={{ color: 'var(--text-secondary)' }}>{others}</p>
                  </div>
                  <div
                    className="p-5 rounded-xl"
                    style={{
                      background: 'var(--gold-muted)',
                      border: '1px solid var(--border-gold)',
                      borderLeft: '4px solid var(--gold-accent)',
                    }}
                  >
                    <span className="label-tag block mb-2">What We Do</span>
                    <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{us}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── Local helpers ── */

function GlassSection({ children, delay }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: delay ?? 0 }}
      className="py-10 md:py-16 px-4 md:px-8 relative z-10"
    >
      <div
        className="max-w-4xl mx-auto rounded-[2rem] p-10 md:p-12"
        style={{
          background: 'rgba(7,16,32,0.5)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {children}
      </div>
    </motion.section>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center text-center mb-10">
      <div
        className="w-10 h-1 rounded-full mb-5"
        style={{ background: 'var(--gold-accent)', boxShadow: '0 0 12px rgba(245,158,11,0.4)' }}
      />
      <h2 className="font-display font-black uppercase tracking-widest text-3xl" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
    </div>
  );
}

function UnderlinedTerm({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-bold"
      style={{
        color: 'var(--text-primary)',
        textDecoration: 'underline',
        textDecorationColor: 'var(--gold-accent)',
        textUnderlineOffset: '4px',
      }}
    >
      {children}
    </span>
  );
}
