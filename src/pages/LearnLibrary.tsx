import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, type KBHelpResult } from '../api/client';
import { getSessionToken } from '../lib/session';
import { STUDY_CHAPTERS } from '../data/studyMaterial';

export default function LearnLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KBHelpResult | null>(null);
  const [searching, setSearching] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!getSessionToken()) { navigate('/learn', { replace: true }); return; }
  }, [navigate]);

  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    searchDebounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const result = await api.learn.kbSearch(searchQuery.trim());
        setSearchResults(result);
      } catch {
        setSearchResults(null);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
  }, [searchQuery]);

  const totalTopics = STUDY_CHAPTERS.reduce((acc, ch) => acc + ch.topics.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-3xl mx-auto space-y-10"
    >
      {/* Header */}
      <div>
        <p className="label-tag-muted mb-2">Cyber Security Learning Material</p>
        <h1 className="font-display font-black text-2xl tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
          Logistics Cybersecurity Reference Manual
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          A structured reference for freight and logistics professionals. {STUDY_CHAPTERS.length} chapters,{' '}
          {totalTopics} topics — use this alongside your modules for deeper concept understanding, or explore
          independently to build background knowledge.
        </p>
      </div>

      {/* Chapter sections */}
      <div className="space-y-8">
        {STUDY_CHAPTERS.map((chapter, ci) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: ci * 0.06 }}
          >
            {/* Chapter header */}
            <div className="flex items-start gap-3 mb-3">
              <span
                className="mt-0.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shrink-0"
                style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)' }}
              >
                Ch. {chapter.number}
              </span>
              <div>
                <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                  {chapter.label}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {chapter.description}
                </p>
              </div>
            </div>

            {/* Topic rows */}
            <div className="space-y-1.5 pl-0">
              {chapter.topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => navigate(`/learn/library/${topic.id}`)}
                  className="w-full rounded-xl flex items-center justify-between px-5 py-3.5 text-left transition-all group"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {topic.label}
                    </p>
                    <p className="text-xs mt-0.5 leading-snug line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                      {topic.tagline}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                      {topic.sections.length} sections
                    </span>
                    <span className="text-xs" style={{ color: 'var(--gold-accent)' }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          Search across all material
        </p>
        <div className="relative">
          <input
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--border-gold)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
            placeholder="e.g. BEC, DMARC, ransomware containment, SAFER registry…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searching && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
              Searching…
            </span>
          )}
        </div>

        {searchResults && searchQuery.trim() && (
          <div className="mt-3 space-y-2">
            {searchResults.hits.length === 0 ? (
              <p className="text-xs px-1" style={{ color: 'var(--text-dim)' }}>No articles matched that query.</p>
            ) : (
              searchResults.hits.map((hit, i) => (
                <div
                  key={i}
                  className="rounded-xl px-4 py-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{hit.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{hit.excerpt}</p>
                  {hit.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {hit.topics.map(t => (
                        <span key={t.slug} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)' }}>
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="text-center pb-4">
        <Link to="/learn/dashboard" className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          ← Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}
