import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';

/**
 * Shown inside NavShell when a registered user has no active package.
 * Registration alone does not grant platform access — a package is required.
 */
export default function FreeTierGate({ onCheckAccess }: { onCheckAccess?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'var(--gold-muted)', border: '1px solid var(--border-gold)', boxShadow: 'var(--glow-gold)' }}
      >
        <Lock size={24} style={{ color: 'var(--gold-accent)' }} />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="h-px w-8" style={{ background: 'var(--border-gold)' }} />
        <span className="label-tag" style={{ color: 'var(--gold-accent)' }}>Access Required</span>
        <div className="h-px w-8" style={{ background: 'var(--border-gold)' }} />
      </div>

      <h2
        className="font-display font-black uppercase tracking-tight mb-3"
        style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}
      >
        Choose a Package
      </h2>
      <p className="text-sm leading-relaxed max-w-md mb-8" style={{ color: 'var(--text-secondary)' }}>
        Your account has been created. Select a package to activate your training access —
        from individual modules to full team resilience programs.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/packages"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:scale-[1.03] hover:brightness-110"
          style={{ background: 'var(--gold-accent)', color: '#000', boxShadow: 'var(--glow-gold)' }}
        >
          <Shield size={14} />
          View Packages
        </Link>
        <Link
          to="/enterprise"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:opacity-80"
          style={{ border: '1px solid var(--border-gold)', color: 'var(--gold-accent)' }}
        >
          Talk to Sales
        </Link>
      </div>
      {onCheckAccess && (
        <button
          onClick={onCheckAccess}
          className="mt-4 text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-dim)' }}
        >
          Access granted? Check now
        </button>
      )}
    </motion.div>
  );
}
