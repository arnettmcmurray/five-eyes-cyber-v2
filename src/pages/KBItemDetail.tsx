import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, type KBItem, type WorkflowEvent, type Topic, type TopicRelationship, type Revision, type LessonLink, type QuizCandidate, type LearningModule } from '../api/client';
import { getAdminUsername } from '../lib/adminSession';
import ItemGovernanceDetail from '../components/admin/ItemGovernanceDetail';

const WORKFLOW_ACTIONS: Record<string, string[]> = {
  draft: ['submit', 'archive'],
  'under-review': ['approve', 'publish', 'reject', 'changes', 'archive'],
  published: ['unpublish', 'archive'],
  archived: [],
};

const ITEM_TYPES = ['training-content', 'threat-brief', 'policy', 'faq', 'glossary-term'];

export default function KBItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<KBItem | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [history, setHistory] = useState<WorkflowEvent[]>([]);
  const [assigned, setAssigned] = useState<TopicRelationship[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<LessonLink[]>([]);
  const [quizCandidates, setQuizCandidates] = useState<QuizCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actor, setActor] = useState(() => getAdminUsername() ?? 'admin');
  const [acting, setActing] = useState<string | null>(null);

  // section toggles
  const [editingMeta, setEditingMeta] = useState(false);
  const [addingRevision, setAddingRevision] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [i, revs, h, a, all, lnks, qcs] = await Promise.all([
        api.items.get(id),
        api.revisions.list(id),
        api.workflow.history(id),
        api.topics.forItem(id),
        api.topics.list(),
        api.lessons.forItem(id),
        api.quizCandidates.forItem(id),
      ]);
      setItem(i);
      setRevisions(revs);
      setHistory(h);
      setAssigned(a);
      setAllTopics(all);
      setLessons(lnks);
      setQuizCandidates(qcs);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function doAction(action: string, note?: string) {
    if (!id) return;
    setActing(action);
    setError(null);
    try {
      await api.workflow.action(id, action, actor, note);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActing(null);
    }
  }

  async function assignTopic(topicId: string) {
    if (!id) return;
    try {
      await api.topics.assign(topicId, id);
      setAssigned(await api.topics.forItem(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function unassignTopic(topicId: string) {
    if (!id) return;
    try {
      await api.topics.unassign(topicId, id);
      setAssigned(await api.topics.forItem(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function deleteItem() {
    if (!id || !window.confirm('Delete this item? This cannot be undone.')) return;
    try {
      await api.items.delete(id);
      navigate('/kb');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function doRollback(revisionId: string) {
    if (!id) return;
    try {
      await api.revisions.rollback(id, revisionId, actor);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return <div className="p-6" style={{ color: 'var(--text-muted)' }}>Loading…</div>;
  if (!item) return <div className="p-6" style={{ color: 'var(--text-muted)' }}>Not found.</div>;

  const currentRevision = revisions.find(r => r.id === item.currentRevisionId) ?? revisions[revisions.length - 1];
  const actions = WORKFLOW_ACTIONS[item.status] ?? [];
  const assignedIds = new Set(assigned.map(r => r.topicId));
  const unassignedTopics = allTopics.filter(t => !assignedIds.has(t.id));

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link to="/kb" className="text-sm hover:underline" style={{ color: 'var(--gold-accent)' }}>&larr; Back to KB</Link>

      {error && <div className="p-3 bg-red-100 text-red-800 rounded text-sm">{error}</div>}

      <ReviewPanel
        status={item.status}
        actor={actor}
        acting={acting}
        onAction={doAction}
      />

      {/* Header + meta */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{item.title}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{item.slug} &middot; {item.type} &middot; {item.sourceTrust}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingMeta(v => !v)}
              className="text-sm border rounded px-2 py-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {editingMeta ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={deleteItem}
              className="text-sm border border-red-200 rounded px-2 py-1"
              style={{ color: 'rgb(244,63,94)' }}
            >
              Delete
            </button>
          </div>
        </div>

        {editingMeta ? (
          <EditMetaForm item={item} onSave={async updated => {
            await api.items.update(item.id, updated);
            setEditingMeta(false);
            await load();
          }} />
        ) : (
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <Field label="Status" value={item.status} />
            <Field label="Created by" value={item.createdBy} />
            <Field label="Tags" value={item.tags.join(', ') || '—'} />
            <Field label="Updated" value={new Date(item.updatedAt).toLocaleString()} />
          </div>
        )}
      </div>

      {/* Governance details */}
      <ItemGovernanceDetail itemId={item.id} />

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            Content
            {currentRevision && <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>v{currentRevision.version}</span>}
          </h2>
          <button
            onClick={() => setAddingRevision(v => !v)}
            className="text-sm border rounded px-2 py-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {addingRevision ? 'Cancel' : '+ New revision'}
          </button>
        </div>

        {addingRevision && (
          <NewRevisionForm
            itemId={item.id}
            actor={actor}
            currentContent={currentRevision?.content ?? ''}
            onSave={async () => { setAddingRevision(false); await load(); }}
          />
        )}

        {currentRevision ? (
          <pre className="border rounded p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed" style={{ background: 'var(--bg-elevated)' }}>
            {currentRevision.content}
          </pre>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No content yet. Add a revision to get started.</p>
        )}

        {revisions.length > 1 && (
          <details className="mt-2">
            <summary className="text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}>
              {revisions.length} revision{revisions.length !== 1 ? 's' : ''}
            </summary>
            <ul className="mt-2 space-y-1">
              {[...revisions].reverse().map(rev => (
                <li key={rev.id} className="flex items-center gap-3 text-sm">
                  <span className="w-6" style={{ color: 'var(--text-muted)' }}>v{rev.version}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{rev.createdBy}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(rev.createdAt).toLocaleString()}</span>
                  {rev.id !== item.currentRevisionId && (
                    <button
                      onClick={() => doRollback(rev.id)}
                      className="text-xs hover:underline"
                      style={{ color: 'var(--gold-accent)' }}
                    >
                      rollback
                    </button>
                  )}
                  {rev.id === item.currentRevisionId && (
                    <span className="text-xs text-green-600">current</span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Topics */}
      <div>
        <h2 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Topics</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {assigned.length === 0 && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>None assigned.</span>}
          {assigned.map(rel => {
            const t = allTopics.find(x => x.id === rel.topicId);
            return (
              <span key={rel.id} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-sm">
                {t?.name ?? rel.topicId}
                <button onClick={() => unassignTopic(rel.topicId)} className="ml-1 text-blue-500 hover:text-red-600 font-bold leading-none">&times;</button>
              </span>
            );
          })}
        </div>
        {unassignedTopics.length > 0 && (
          <select
            className="border rounded px-2 py-1 text-sm"
            defaultValue=""
            onChange={e => { if (e.target.value) assignTopic(e.target.value); e.target.value = ''; }}
          >
            <option value="" disabled>Add topic…</option>
            {unassignedTopics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
        {allTopics.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No topics exist. <Link to="/kb/topics" className="hover:underline" style={{ color: 'var(--gold-accent)' }}>Create one</Link>.</p>
        )}
      </div>

      {/* Lessons */}
      <LessonsSection
        itemId={item.id}
        actor={actor}
        lessons={lessons}
        onUpdate={updated => setLessons(updated)}
      />

      {/* Quiz Candidates */}
      <QuizCandidatesSection
        itemId={item.id}
        revisionId={item.currentRevisionId}
        candidates={quizCandidates}
        actor={actor}
        onUpdate={setQuizCandidates}
      />

      {/* Workflow */}
      <div>
        <h2 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Workflow</h2>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>As:</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{actor}</span>
        </div>
        {actions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No actions available for "{item.status}".</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {actions.map(action => (
              <button
                key={action}
                onClick={() => doAction(action)}
                disabled={acting !== null}
                className="px-3 py-1.5 rounded text-sm border font-medium disabled:opacity-50 capitalize"
                style={{ color: 'var(--text-muted)' }}
              >
                {acting === action ? `${action}ing…` : action}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Workflow history */}
      {history.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>History</h2>
          <ul className="space-y-2">
            {[...history].reverse().map(ev => (
              <li key={ev.id} className="text-sm border-l-2 pl-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="font-medium capitalize">{ev.action}</span>
                <span style={{ color: 'var(--text-muted)' }}> by {ev.performedBy}</span>
                {ev.note && <span style={{ color: 'var(--text-muted)' }}> — {ev.note}</span>}
                <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(ev.performedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ReviewPanel({ status, actor: _actor, acting, onAction }: {
  status: string;
  actor: string;
  acting: string | null;
  onAction: (action: string, note?: string) => Promise<void>;
}) {
  const [noteAction, setNoteAction] = useState<string | null>(null);
  const [note, setNote] = useState('');

  async function fire(action: string, noteText?: string) {
    setNoteAction(null);
    setNote('');
    await onAction(action, noteText);
  }

  if (status !== 'draft' && status !== 'under-review') return null;

  const isDraft = status === 'draft';

  return (
    <div className={`rounded border p-4 ${isDraft ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${isDraft ? 'bg-yellow-200 text-yellow-900' : 'bg-blue-200 text-blue-900'}`}>
          {isDraft ? 'Draft' : 'Under Review'}
        </span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {isDraft
            ? 'Review content below, then submit for review when ready.'
            : 'Ready to review — publish, approve, or send back for changes.'}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {isDraft ? (
          <>
            <button
              onClick={() => fire('submit')}
              disabled={acting !== null}
              className="px-4 py-1.5 rounded text-sm font-medium disabled:opacity-50"
              style={{ background: 'var(--gold-accent)', color: '#000' }}
            >
              {acting === 'submit' ? 'Submitting…' : 'Submit for review'}
            </button>
            <button
              onClick={() => fire('archive')}
              disabled={acting !== null}
              className="px-3 py-1.5 border rounded text-sm disabled:opacity-50"
              style={{ color: 'var(--text-muted)' }}
            >
              Archive
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => fire('publish')}
              disabled={acting !== null}
              className="px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {acting === 'publish' ? 'Publishing…' : 'Publish'}
            </button>
            <button
              onClick={() => fire('approve')}
              disabled={acting !== null}
              className="px-3 py-1.5 border rounded text-sm font-medium disabled:opacity-50"
              style={{ color: 'var(--text-muted)' }}
            >
              {acting === 'approve' ? '…' : 'Approve'}
            </button>
            <button
              onClick={() => setNoteAction(noteAction === 'reject' ? null : 'reject')}
              disabled={acting !== null}
              className="px-3 py-1.5 border border-red-200 text-red-700 rounded text-sm hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => setNoteAction(noteAction === 'changes' ? null : 'changes')}
              disabled={acting !== null}
              className="px-3 py-1.5 border rounded text-sm disabled:opacity-50"
              style={{ color: 'var(--text-muted)' }}
            >
              Request changes
            </button>
            <button
              onClick={() => fire('archive')}
              disabled={acting !== null}
              className="px-3 py-1.5 border rounded text-sm disabled:opacity-50"
              style={{ color: 'var(--text-muted)' }}
            >
              Archive
            </button>
          </>
        )}
      </div>
      {noteAction && (
        <div className="mt-3 flex items-start gap-2">
          <textarea
            className="flex-1 border rounded px-2 py-1.5 text-sm"
            rows={2}
            placeholder={noteAction === 'reject' ? 'Reason for rejection…' : 'Describe changes needed…'}
            value={note}
            onChange={e => setNote(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={() => fire(noteAction, note)}
              disabled={!note.trim() || acting !== null}
              className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={() => { setNoteAction(null); setNote(''); }}
              className="text-xs text-center"
              style={{ color: 'var(--text-muted)' }}
            >
              cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<QuizCandidate['status'], string> = {
  'pending-review': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-700',
  'promoted': 'bg-blue-100 text-blue-800',
};

function QuizCandidatesSection({ itemId, revisionId, candidates, actor, onUpdate }: {
  itemId: string;
  revisionId: string | null;
  candidates: QuizCandidate[];
  actor: string;
  onUpdate: (updated: QuizCandidate[]) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<string | null>(null);
  const [promoteModuleId, setPromoteModuleId] = useState('');
  const [modules, setModules] = useState<LearningModule[]>([]);

  function patch(updated: QuizCandidate) {
    onUpdate(candidates.map(c => c.id === updated.id ? updated : c));
  }

  async function doApprove(id: string) {
    setActing(id + ':approve');
    setErr(null);
    try {
      patch(await api.quizCandidates.approve(id, actor));
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setActing(null); }
  }

  async function doReject(id: string) {
    setActing(id + ':reject');
    setErr(null);
    try {
      patch(await api.quizCandidates.reject(id, actor));
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setActing(null); }
  }

  async function doPromote(id: string) {
    if (!promoteModuleId.trim()) return;
    setActing(id + ':promote');
    setErr(null);
    try {
      patch(await api.quizCandidates.promote(id, promoteModuleId.trim()));
      setPromoteTarget(null);
      setPromoteModuleId('');
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setActing(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          Quiz Candidates
          {candidates.length > 0 && <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{candidates.length}</span>}
        </h2>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="text-sm border rounded px-2 py-1"
          style={{ color: 'var(--text-muted)' }}
        >
          {showCreate ? 'Cancel' : '+ New candidate'}
        </button>
      </div>
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
        Approved candidates appear as practice questions in any module this item is linked to.
      </p>

      {err && <div className="mb-2 p-2 bg-red-100 text-red-800 rounded text-sm">{err}</div>}

      {showCreate && (
        revisionId ? (
          <CreateQuizCandidateForm
            itemId={itemId}
            revisionId={revisionId}
            onSave={created => {
              onUpdate([...candidates, created]);
              setShowCreate(false);
            }}
          />
        ) : (
          <p className="mb-3 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
            Add a revision first before creating quiz candidates.
          </p>
        )
      )}

      {candidates.length === 0 && !showCreate ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No candidates yet.</p>
      ) : (
      <ul className="space-y-3">
        {candidates.map(c => (
          <li key={c.id} className="border rounded p-3 text-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-medium">{c.questionText}</p>
              <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                {c.status}
              </span>
            </div>

            <ol className="list-decimal list-inside space-y-0.5 mb-2" style={{ color: 'var(--text-muted)' }}>
              {c.options.map((opt, i) => (
                <li key={i} className={i === c.suggestedCorrectIndex ? 'font-semibold text-green-700' : ''}>
                  {opt}
                </li>
              ))}
            </ol>

            <p className="text-xs mb-2 italic" style={{ color: 'var(--text-muted)' }}>{c.explanation}</p>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>confidence: {(c.confidence * 100).toFixed(0)}%</span>

              {c.status === 'pending-review' && (
                <>
                  <button
                    onClick={() => doApprove(c.id)}
                    disabled={acting !== null}
                    className="px-2 py-0.5 text-xs border rounded disabled:opacity-50"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {acting === c.id + ':approve' ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => doReject(c.id)}
                    disabled={acting !== null}
                    className="px-2 py-0.5 text-xs border rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {acting === c.id + ':reject' ? '…' : 'Reject'}
                  </button>
                </>
              )}

              {c.status === 'approved' && (
                promoteTarget === c.id ? (
                  <span className="flex items-center gap-1 flex-wrap">
                    {modules.length > 0 ? (
                      <select
                        className="border rounded px-2 py-0.5 text-xs"
                        value={promoteModuleId}
                        onChange={e => setPromoteModuleId(e.target.value)}
                        autoFocus
                      >
                        <option value="">Select module…</option>
                        {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading modules…</span>
                    )}
                    <button
                      onClick={() => doPromote(c.id)}
                      disabled={acting !== null || !promoteModuleId}
                      className="px-2 py-0.5 text-xs rounded disabled:opacity-50"
                      style={{ background: 'var(--gold-accent)', color: '#000' }}
                    >
                      {acting === c.id + ':promote' ? '…' : 'Confirm'}
                    </button>
                    <button onClick={() => { setPromoteTarget(null); setPromoteModuleId(''); }} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={async () => {
                      setPromoteTarget(c.id);
                      if (modules.length === 0) {
                        try { setModules(await api.modules.list()); } catch { /* fall through */ }
                      }
                    }}
                    className="px-2 py-0.5 text-xs border rounded"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Promote to module
                  </button>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}

function CreateQuizCandidateForm({ itemId, revisionId, onSave }: {
  itemId: string;
  revisionId: string;
  onSave: (created: QuizCandidate) => void;
}) {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [confidence, setConfidence] = useState(0.5);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function setOption(i: number, val: string) {
    const next = [...options] as [string, string, string, string];
    next[i] = val;
    setOptions(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (options.some(o => !o.trim())) { setErr('All 4 options are required.'); return; }
    setSaving(true);
    setErr(null);
    try {
      const created = await api.quizCandidates.create(itemId, {
        revisionId,
        questionText,
        options,
        suggestedCorrectIndex: correctIndex,
        explanation,
        confidence,
      });
      onSave(created);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-4 p-3 border rounded space-y-3 text-sm" style={{ background: 'var(--bg-elevated)' }}>
      {err && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">{err}</div>}

      <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Question</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>Options — select correct answer</label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
            />
            <input
              className={`flex-1 border rounded px-2 py-1 text-sm ${correctIndex === i ? 'border-green-400' : ''}`}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={e => setOption(i, e.target.value)}
              required
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Explanation</label>
        <textarea
          className="w-full border rounded px-2 py-1.5 text-sm"
          rows={2}
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Confidence: {(confidence * 100).toFixed(0)}%</label>
        <input
          type="range"
          min={0} max={1} step={0.05}
          value={confidence}
          onChange={e => setConfidence(Number(e.target.value))}
          className="w-32"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-3 py-1.5 rounded text-sm disabled:opacity-50"
        style={{ background: 'var(--gold-accent)', color: '#000' }}
      >
        {saving ? 'Saving…' : 'Create candidate'}
      </button>
    </form>
  );
}

const ROLES: LessonLink['role'][] = ['primary', 'supplementary', 'prerequisite-reading'];

function LessonsSection({ itemId, actor, lessons, onUpdate }: {
  itemId: string;
  actor: string;
  lessons: LessonLink[];
  onUpdate: (updated: LessonLink[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [moduleId, setModuleId] = useState('');
  const [role, setRole] = useState<LessonLink['role']>('primary');
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function openForm() {
    if (!showForm) {
      try {
        setModules(await api.modules.list());
      } catch {
        // fall through — will show text input fallback
      }
    }
    setShowForm(v => !v);
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!moduleId) return;
    setSaving(true);
    setErr(null);
    try {
      await api.lessons.link(moduleId, { kbItemId: itemId, role, order, addedBy: actor });
      const updated = await api.lessons.forItem(itemId);
      onUpdate(updated);
      setShowForm(false);
      setModuleId('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function removeLink(linkId: string) {
    try {
      await api.lessons.remove(linkId);
      onUpdate(lessons.filter(l => l.id !== linkId));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  // Resolve module title from loaded list, fall back to raw ID
  function moduleLabel(mid: string) {
    return modules.find(m => m.id === mid)?.title ?? mid;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Module Links</h2>
        <button
          onClick={openForm}
          className="text-sm border rounded px-2 py-1"
          style={{ color: 'var(--text-muted)' }}
        >
          {showForm ? 'Cancel' : '+ Link to module'}
        </button>
      </div>

      {err && <div className="mb-2 p-2 bg-red-100 text-red-800 rounded text-sm">{err}</div>}

      {showForm && (
        <form onSubmit={addLink} className="mb-3 p-3 border rounded flex flex-wrap gap-2 items-end" style={{ background: 'var(--bg-elevated)' }}>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Module</label>
            {modules.length > 0 ? (
              <select
                className="border rounded px-2 py-1 text-sm w-56"
                value={moduleId}
                onChange={e => setModuleId(e.target.value)}
                required
              >
                <option value="" disabled>Select module…</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            ) : (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No modules yet. <Link to="/kb/modules" className="hover:underline" style={{ color: 'var(--gold-accent)' }}>Create one</Link>.
              </span>
            )}
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Role</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={role}
              onChange={e => setRole(e.target.value as LessonLink['role'])}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Order</label>
            <input
              type="number"
              className="border rounded px-2 py-1 text-sm w-16"
              value={order}
              onChange={e => setOrder(Number(e.target.value))}
              min={0}
            />
          </div>
          {modules.length > 0 && (
            <button
              type="submit"
              disabled={saving || !moduleId}
              className="px-3 py-1.5 rounded text-sm disabled:opacity-50"
              style={{ background: 'var(--gold-accent)', color: '#000' }}
            >
              {saving ? 'Linking…' : 'Link'}
            </button>
          )}
        </form>
      )}

      {lessons.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Not linked to any modules. Use <span className="font-mono px-1 rounded" style={{ background: 'var(--bg-elevated)' }}>+ Link to module</span> or the Content panel in Modules.</p>
      ) : (
        <ul className="space-y-1">
          {lessons.map(l => (
            <li key={l.id} className="flex items-center gap-3 text-sm border-b py-1.5">
              <span className="font-medium text-sm">{moduleLabel(l.moduleId)}</span>
              <span className="font-mono text-xs truncate max-w-[120px]" style={{ color: 'var(--text-muted)' }}>{l.moduleId}</span>
              <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--bg-elevated)' }}>{l.role}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>order {l.order}</span>
              <button
                onClick={() => removeLink(l.id)}
                className="ml-auto text-red-400 hover:text-red-600 text-xs"
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function EditMetaForm({ item, onSave }: {
  item: KBItem;
  onSave: (updated: Partial<Pick<KBItem, 'title' | 'type' | 'tags'>>) => Promise<void>;
}) {
  const [title, setTitle] = useState(item.title);
  const [type, setType] = useState(item.type);
  const [tags, setTags] = useState(item.tags.join(', '));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await onSave({
        title,
        type: type as KBItem['type'],
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      {err && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">{err}</div>}
      <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Title</label>
        <input className="w-full border rounded px-3 py-1.5 text-sm" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Type</label>
        <select className="border rounded px-3 py-1.5 text-sm" value={type} onChange={e => setType(e.target.value)}>
          {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Tags (comma-separated)</label>
        <input className="w-full border rounded px-3 py-1.5 text-sm" value={tags} onChange={e => setTags(e.target.value)} />
      </div>
      <button type="submit" disabled={saving} className="px-3 py-1.5 rounded text-sm disabled:opacity-50" style={{ background: 'var(--gold-accent)', color: '#000' }}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}

function NewRevisionForm({ itemId, actor, currentContent, onSave }: {
  itemId: string;
  actor: string;
  currentContent: string;
  onSave: () => Promise<void>;
}) {
  const [content, setContent] = useState(currentContent);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await api.revisions.create(itemId, content, actor);
      await onSave();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-3 space-y-2">
      {err && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">{err}</div>}
      <textarea
        className="w-full border rounded px-3 py-2 text-sm font-mono"
        rows={10}
        value={content}
        onChange={e => setContent(e.target.value)}
        required
      />
      <button type="submit" disabled={saving} className="px-3 py-1.5 rounded text-sm disabled:opacity-50" style={{ background: 'var(--gold-accent)', color: '#000' }}>
        {saving ? 'Saving…' : 'Save revision'}
      </button>
    </form>
  );
}
