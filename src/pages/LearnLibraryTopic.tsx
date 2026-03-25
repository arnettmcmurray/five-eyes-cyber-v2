import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSessionToken } from '../lib/session';
import { findTopic, STUDY_CHAPTERS } from '../data/studyMaterial';

export default function LearnLibraryTopic() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const found = topicId ? findTopic(topicId) : null;

  useEffect(() => {
    if (!getSessionToken()) { navigate('/learn', { replace: true }); return; }
    if (!found) { navigate('/learn/library', { replace: true }); return; }
  }, [found, navigate]);

  if (!found) return null;
  const { topic, chapter } = found;

  // Find related topics from other chapters for cross-linking
  const relatedTopics = topic.relatedTopicIds
    .map(id => {
      const r = findTopic(id);
      return r ? { id, label: r.topic.label, chapterLabel: r.chapter.label } : null;
    })
    .filter(Boolean) as { id: string; label: string; chapterLabel: string }[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Link to="/learn/library" className="hover:opacity-70 transition-opacity">
          Study Material
        </Link>
        <span style={{ color: 'var(--text-dim)' }}>›</span>
        <span style={{ color: 'var(--text-dim)' }}>Ch. {chapter.number} — {chapter.label}</span>
        <span style={{ color: 'var(--text-dim)' }}>›</span>
        <span style={{ color: 'var(--text-primary)' }}>{topic.label}</span>
      </div>

      {/* Article header */}
      <div>
        <span
          className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded inline-block mb-3"
          style={{ background: 'var(--gold-muted)', color: 'var(--gold-accent)' }}
        >
          Chapter {chapter.number} · {chapter.label}
        </span>
        <h1 className="font-display font-black text-2xl tracking-tight mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
          {topic.label}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {topic.intro}
        </p>
      </div>

      {/* Article sections */}
      <div className="space-y-6">
        {topic.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.07 }}
            className="rounded-xl px-6 py-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <h2 className="text-sm font-black mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {section.body}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Key points */}
      <div
        className="rounded-xl px-6 py-5"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)' }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--gold-accent)' }}>
          Key Points
        </p>
        <ul className="space-y-2">
          {topic.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <span className="mt-1 shrink-0" style={{ color: 'var(--gold-accent)' }}>·</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Related topics */}
      {relatedTopics.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Continue Studying
          </p>
          <div className="space-y-1.5">
            {relatedTopics.map(rel => (
              <button
                key={rel.id}
                onClick={() => navigate(`/learn/library/${rel.id}`)}
                className="w-full rounded-xl flex items-center justify-between px-5 py-3 text-left transition-all"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{rel.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{rel.chapterLabel}</p>
                </div>
                <span className="text-xs ml-3" style={{ color: 'var(--gold-accent)' }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chapter navigation */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          More from this chapter
        </p>
        <div className="space-y-1.5">
          {chapter.topics.filter(t => t.id !== topic.id).map(t => (
            <button
              key={t.id}
              onClick={() => navigate(`/learn/library/${t.id}`)}
              className="w-full rounded-xl flex items-center justify-between px-5 py-3 text-left transition-all"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: 'var(--text-dim)' }}>{t.tagline}</p>
              </div>
              <span className="text-xs ml-3" style={{ color: 'var(--gold-accent)' }}>→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Full contents link */}
      <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link to="/learn/library" className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          ← All Chapters
        </Link>
        <div className="flex items-center gap-3">
          {/* Previous/Next in same chapter */}
          {(() => {
            const idx = chapter.topics.findIndex(t => t.id === topic.id);
            const prev = chapter.topics[idx - 1];
            const next = chapter.topics[idx + 1];
            return (
              <>
                {prev && (
                  <button
                    onClick={() => navigate(`/learn/library/${prev.id}`)}
                    className="text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ← {prev.label}
                  </button>
                )}
                {next && (
                  <button
                    onClick={() => navigate(`/learn/library/${next.id}`)}
                    className="text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: 'var(--gold-accent)' }}
                  >
                    {next.label} →
                  </button>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
}
