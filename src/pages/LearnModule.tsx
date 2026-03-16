import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  api,
  type LearnModuleResponse,
  type LearnStudyItem,
  type LearnReference,
  type LearnPracticeQuestion,
  type PracticeResult,
  type LearnTopicRef,
  type RemediationItem,
} from '../api/client';
import { getSessionToken } from '../lib/session';

type Phase = 'study' | 'practice' | 'results';

const ROLE_LABEL: Record<string, string> = {
  'prerequisite-reading': 'Prerequisite Reading',
  primary: 'Core Content',
};

export default function LearnModule() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<LearnModuleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('study');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<PracticeResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHits, setSearchHits] = useState<Array<{ title: string; excerpt: string }> | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (!getSessionToken()) {
      navigate('/learn', { replace: true });
      return;
    }
    api.learn.module(id)
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !searchQuery.trim()) return;
    setSearching(true);
    setSearchHits(null);
    try {
      const result = await api.learn.help(id, searchQuery.trim());
      setSearchHits(result.hits.map(h => ({ title: h.title, excerpt: h.excerpt })));
    } catch {
      setSearchHits([]);
    } finally {
      setSearching(false);
    }
  }

  async function submitPractice() {
    if (!id || !data) return;
    const payload = data.practiceQuestions.map(q => ({
      questionId: q.id,
      selectedIndex: answers[q.id] ?? -1,
    }));
    setSubmitting(true);
    try {
      const result = await api.learn.practice(id, payload);
      setResults(result);
      setPhase('results');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (error) {
    const isLocked = error === 'Prerequisites not completed';
    if (isLocked) return <LockedScreen moduleId={id!} />;
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="rounded border p-5 bg-red-50 border-red-200">
          <p className="font-semibold text-red-700">Error</p>
          <p className="text-sm mt-1 text-red-600">{error}</p>
          <a href="/learn" className="inline-block mt-3 text-sm text-blue-600 hover:underline">← Back</a>
        </div>
      </div>
    );
  }
  if (!data) return <div className="p-6 text-gray-500">Not found.</div>;

  const allAnswered = data.practiceQuestions.every(q => answers[q.id] !== undefined);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <Link to="/learn" className="text-blue-600 text-sm hover:underline">&larr; Learning Hub</Link>
        <h1 className="text-2xl font-bold mt-2">{data.module.title}</h1>
        {data.module.description && (
          <p className="text-gray-500 mt-1">{data.module.description}</p>
        )}
      </div>

      {/* Phase tabs */}
      <div className="flex gap-1 border-b">
        {(['study', 'practice'] as Phase[]).map(p => (
          <button
            key={p}
            onClick={() => { setPhase(p); setResults(null); }}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
              phase === p ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {p === 'practice' ? `Practice (${data.practiceQuestions.length})` : 'Study'}
          </button>
        ))}
        {results && (
          <button
            onClick={() => setPhase('results')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              phase === 'results' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Results
          </button>
        )}
      </div>

      {/* Study phase */}
      {phase === 'study' && (
        <div className="space-y-6">
          {/* KB Search */}
          <div className="border rounded p-4 bg-gray-50">
            <form onSubmit={runSearch} className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-1.5 text-sm"
                placeholder="Search knowledge base…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {searching ? '…' : 'Search'}
              </button>
              {searchHits && (
                <button type="button" onClick={() => setSearchHits(null)} className="text-xs text-gray-400 px-2">
                  clear
                </button>
              )}
            </form>
            {searchHits !== null && (
              <div className="mt-3 space-y-2">
                {searchHits.length === 0 ? (
                  <p className="text-sm text-gray-400">No results.</p>
                ) : searchHits.map((h, i) => (
                  <div key={i} className="text-sm border rounded p-2 bg-white">
                    <p className="font-medium text-gray-800">{h.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{h.excerpt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Study content */}
          {data.studyItems.length === 0 && data.references.length === 0 ? (
            <p className="text-gray-400 text-sm">No published content available for this module yet.</p>
          ) : (
            <>
              {(['prerequisite-reading', 'primary'] as const).map(role => {
                const items = data.studyItems.filter(i => i.role === role);
                if (items.length === 0) return null;
                return (
                  <div key={role}>
                    <h2 className="font-semibold text-gray-700 border-b pb-1 mb-4">{ROLE_LABEL[role]}</h2>
                    <div className="space-y-4">
                      {items.map(item => <StudyCard key={item.id} item={item} />)}
                    </div>
                  </div>
                );
              })}

              {data.references.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-700 border-b pb-1 mb-4">Supporting References</h2>
                  <div className="space-y-3">
                    {data.references.map(ref => <ReferenceCard key={ref.id} ref_={ref} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Practice phase */}
      {phase === 'practice' && (
        <div className="space-y-4">
          {data.practiceQuestions.length === 0 ? (
            <p className="text-gray-400 text-sm">No practice questions available for this module yet.</p>
          ) : (
            <>
              {data.practiceQuestions.map((q, qi) => (
                <PracticeQuestionCard
                  key={q.id}
                  question={q}
                  index={qi}
                  selected={answers[q.id]}
                  onSelect={idx => setAnswers(prev => ({ ...prev, [q.id]: idx }))}
                />
              ))}
              <button
                onClick={submitPractice}
                disabled={submitting || !allAnswered}
                className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Grading…' : allAnswered ? 'Submit answers' : `Answer all ${data.practiceQuestions.length} questions to submit`}
              </button>
            </>
          )}
        </div>
      )}

      {/* Results / Remediation phase */}
      {phase === 'results' && results && (
        <RemediationScreen
          results={results}
          nextModuleId={data.module.nextModuleId}
          moduleId={id!}
          onRetry={() => { setAnswers({}); setPhase('practice'); }}
        />
      )}
    </div>
  );
}

function StudyCard({ item }: { item: LearnStudyItem }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 600;
  const isLong = item.content.length > LIMIT;

  return (
    <div className="border rounded overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
        <span className="font-medium">{item.title}</span>
        <span className="px-1.5 py-0.5 bg-white border rounded text-xs text-gray-500">{item.type}</span>
        {item.topics.map(t => (
          <span key={t.slug} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{t.name}</span>
        ))}
      </div>
      <div className="px-4 py-3">
        <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-gray-800">
          {expanded || !isLong ? item.content : item.content.slice(0, LIMIT) + '…'}
        </pre>
        {isLong && (
          <button onClick={() => setExpanded(v => !v)} className="mt-2 text-xs text-blue-600 hover:underline">
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  );
}

function ReferenceCard({ ref_ }: { ref_: LearnReference }) {
  return (
    <div className="border rounded p-3 flex items-start gap-3">
      <span className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs text-gray-500 shrink-0 mt-0.5">{ref_.type}</span>
      <div className="min-w-0">
        <p className="font-medium text-sm">{ref_.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-3">{ref_.excerpt}</p>
        {ref_.topics.length > 0 && (
          <div className="flex gap-1 mt-1">
            {ref_.topics.map(t => (
              <span key={t.slug} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{t.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PracticeQuestionCard({ question, index, selected, onSelect }: {
  question: LearnPracticeQuestion;
  index: number;
  selected: number | undefined;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="border rounded p-4">
      <p className="font-medium mb-3">
        <span className="text-gray-400 mr-2">{index + 1}.</span>
        {question.questionText}
      </p>
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 px-3 py-2 border rounded cursor-pointer text-sm ${
              selected === i ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              checked={selected === i}
              onChange={() => onSelect(i)}
              className="shrink-0"
            />
            <span className="text-gray-400 font-mono text-xs">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

function RemediationScreen({ results, nextModuleId, moduleId, onRetry }: {
  results: PracticeResult;
  nextModuleId: string | null;
  moduleId: string;
  onRetry: () => void;
}) {
  const pct = results.percentage;
  const passed = pct >= 70;
  const [helpQuery, setHelpQuery] = useState('');
  const [helpHits, setHelpHits] = useState<Array<{ title: string; excerpt: string }> | null>(null);
  const [helpSearching, setHelpSearching] = useState(false);

  async function runHelp(e: React.FormEvent) {
    e.preventDefault();
    if (!helpQuery.trim()) return;
    setHelpSearching(true);
    try {
      const result = await api.learn.help(moduleId, helpQuery.trim());
      setHelpHits(result.hits.map(h => ({ title: h.title, excerpt: h.excerpt })));
    } catch {
      setHelpHits([]);
    } finally {
      setHelpSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Score summary */}
      <div className={`rounded border p-5 ${passed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold ${passed ? 'text-green-700' : 'text-yellow-700'}`}>
            {pct}%
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {results.score} of {results.total} correct
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {passed ? 'Good work — you passed this module.' : 'Review the missed questions below, then try again.'}
            </p>
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Question breakdown</h2>
        <div className="space-y-3">
          {results.results.map((r, i) => (
            <div key={r.questionId} className={`border rounded p-4 ${r.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start gap-2 mb-2">
                <span className={`text-sm font-bold ${r.correct ? 'text-green-700' : 'text-red-600'}`}>
                  {r.correct ? '✓' : '✗'}
                </span>
                <p className="text-sm font-medium text-gray-800">
                  {i + 1}. {r.questionText}
                </p>
              </div>
              {r.options.length > 0 && (
                <div className="ml-5 space-y-1">
                  {r.options.map((opt, oi) => {
                    let cls = 'text-xs px-2 py-1 rounded ';
                    if (oi === r.correctIndex) cls += 'bg-green-200 text-green-900 font-medium';
                    else if (oi === r.selectedIndex && !r.correct) cls += 'bg-red-200 text-red-800 line-through';
                    else cls += 'text-gray-500';
                    return <p key={oi} className={cls}>{String.fromCharCode(65 + oi)}. {opt}</p>;
                  })}
                </div>
              )}
              {!r.correct && r.explanation && (
                <p className="ml-5 mt-2 text-xs text-gray-600 italic">{r.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations + KB help */}
      {!passed && (
        <div className="space-y-3">
          {results.recommendedTopics.length > 0 && (
            <div className="border rounded p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-800 text-sm mb-2">Review these topics</h3>
              <div className="flex flex-wrap gap-2">
                {results.recommendedTopics.map((t: LearnTopicRef) => (
                  <span key={t.slug} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {results.remediationItems.length > 0 && (
            <div className="border rounded p-4 bg-white">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">Suggested reading</h3>
              <div className="space-y-2">
                {results.remediationItems.map((item: RemediationItem, i: number) => (
                  <div key={i} className="text-sm border rounded p-2 bg-gray-50">
                    <p className="font-medium text-gray-800">{item.title}</p>
                    {item.topics.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {item.topics.map(t => (
                          <span key={t.slug} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{t.name}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="border rounded p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Search the knowledge base</h3>
            <form onSubmit={runHelp} className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-1.5 text-sm"
                placeholder="Search for a concept or topic…"
                value={helpQuery}
                onChange={e => setHelpQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={helpSearching || !helpQuery.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {helpSearching ? '…' : 'Search'}
              </button>
            </form>
            {helpHits !== null && (
              <div className="mt-3 space-y-2">
                {helpHits.length === 0 ? (
                  <p className="text-sm text-gray-400">No results.</p>
                ) : helpHits.map((h, i) => (
                  <div key={i} className="text-sm border rounded p-2 bg-white">
                    <p className="font-medium text-gray-800">{h.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{h.excerpt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-4 py-2 border rounded text-sm text-gray-700 hover:bg-gray-50"
        >
          Try again
        </button>
        {passed && nextModuleId ? (
          <Link
            to={`/learn/modules/${nextModuleId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Next module →
          </Link>
        ) : (
          <Link
            to="/learn"
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            {passed ? 'Back to Learning Hub' : 'Back to Learning Hub'}
          </Link>
        )}
      </div>
    </div>
  );
}

function LockedScreen({ moduleId }: { moduleId: string }) {
  const [prereqs, setPrereqs] = useState<Array<{ id: string; title: string; completed: boolean }>>([]);

  useEffect(() => {
    api.learn.prerequisites(moduleId)
      .then(setPrereqs)
      .catch(() => {});
  }, [moduleId]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="rounded border p-5 bg-yellow-50 border-yellow-200">
        <p className="font-semibold text-yellow-800">Module locked</p>
        {prereqs.length > 0 ? (
          <div className="mt-2">
            <p className="text-sm text-yellow-700 mb-2">Complete these modules first:</p>
            <ul className="space-y-1">
              {prereqs.map(p => (
                <li key={p.id} className="text-sm flex items-center gap-2">
                  <span className={p.completed ? 'text-green-600' : 'text-yellow-700'}>
                    {p.completed ? '✓' : '○'}
                  </span>
                  {p.completed ? (
                    <span className="text-green-700">{p.title}</span>
                  ) : (
                    <Link to={`/learn/modules/${p.id}`} className="text-blue-600 hover:underline">
                      {p.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-yellow-700 mt-1">You must complete prerequisite modules before accessing this one.</p>
        )}
        <Link to="/learn" className="inline-block mt-3 text-sm text-blue-600 hover:underline">← Back to My Training</Link>
      </div>
    </div>
  );
}
