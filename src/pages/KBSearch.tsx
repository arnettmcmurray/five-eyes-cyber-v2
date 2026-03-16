import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type SearchResult, type SearchHit, type QuizAidHint, type QuizAidRelated, type TopicRef } from '../api/client';

export default function KBSearch() {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'fts' | 'quiz-aid'>('fts');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await api.search(q, mode));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/kb" className="text-blue-600 text-sm hover:underline">&larr; Back to KB</Link>
        <h1 className="text-2xl font-bold mt-2">Search</h1>
      </div>

      <form onSubmit={search} className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Search knowledge base…"
          value={q}
          onChange={e => setQ(e.target.value)}
          autoFocus
        />
        <select
          className="border rounded px-2 py-2 text-sm"
          value={mode}
          onChange={e => { setMode(e.target.value as 'fts' | 'quiz-aid'); setResult(null); }}
        >
          <option value="fts">FTS</option>
          <option value="quiz-aid">Quiz-aid</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '…' : 'Search'}
        </button>
      </form>

      {error && <div className="p-3 bg-red-100 text-red-800 rounded text-sm mb-4">{error}</div>}

      {result && (
        <div>
          <Meta confidence={result.confidence} band={result.band} />
          {result.mode === 'fts' ? (
            <FtsResults hits={result.hits} />
          ) : (
            <QuizAidResults
              kbBacked={result.kbBacked}
              hint={result.hint}
              relatedItems={result.relatedItems}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Meta({ confidence, band }: { confidence: number; band: string }) {
  const bandColor = band === 'high' ? 'text-green-700' : band === 'medium' ? 'text-yellow-700' : 'text-gray-500';
  return (
    <div className="flex gap-4 mb-4 text-sm text-gray-500">
      <span>band: <strong className={bandColor}>{band}</strong></span>
      <span>confidence: <strong>{(confidence * 100).toFixed(0)}%</strong></span>
    </div>
  );
}

function TopicTags({ topics }: { topics: TopicRef[] }) {
  if (!topics.length) return null;
  return (
    <span className="ml-2">
      {topics.map(t => (
        <span key={t.topicId} className="inline-block mr-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
          {t.topicName}
        </span>
      ))}
    </span>
  );
}

function FtsResults({ hits }: { hits: SearchHit[] }) {
  if (hits.length === 0) return <p className="text-sm text-gray-400">No results.</p>;
  return (
    <ul className="space-y-4">
      {hits.map(hit => (
        <li key={hit.itemId} className="border rounded p-4">
          <div className="flex items-start justify-between">
            <Link to={`/kb/${hit.itemId}`} className="font-semibold text-blue-600 hover:underline">
              {hit.title}
            </Link>
            <span className="text-xs text-gray-400 ml-2 shrink-0">score: {hit.score.toFixed(3)}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5 mb-2">
            {hit.slug}
            <TopicTags topics={hit.topics} />
          </div>
          <p className="text-sm text-gray-600">{hit.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}

function QuizAidResults({ kbBacked, hint, relatedItems }: {
  kbBacked: boolean;
  hint: QuizAidHint | null;
  relatedItems: QuizAidRelated[];
}) {
  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium w-fit ${
        kbBacked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}>
        {kbBacked ? 'KB-backed answer' : 'Low confidence — no strong KB match'}
      </div>

      {hint ? (
        <div className="border rounded p-4 bg-blue-50">
          <div className="flex items-start justify-between mb-1">
            <Link to={`/kb/${hint.itemId}`} className="font-semibold text-blue-700 hover:underline">
              {hint.title}
            </Link>
            <span className="text-xs text-gray-400 ml-2 shrink-0">score: {hint.referenceScore.toFixed(3)}</span>
          </div>
          <div className="text-xs text-gray-400 mb-3">
            {hint.slug}
            <TopicTags topics={hint.topics} />
          </div>
          <div className="text-sm text-gray-800 leading-relaxed border-l-2 border-blue-300 pl-3">
            {hint.learningHint}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No hint available.</p>
      )}

      {relatedItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Related</h3>
          <ul className="space-y-1">
            {relatedItems.map(item => (
              <li key={item.itemId} className="flex items-center gap-2 text-sm">
                <Link to={`/kb/${item.itemId}`} className="text-blue-600 hover:underline">{item.title}</Link>
                <TopicTags topics={item.topics} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
