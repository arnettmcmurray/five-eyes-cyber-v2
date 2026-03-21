import { useState, useEffect, useCallback } from 'react';
import { api, type KBGovernanceSummary, type Source, type SourceTrustLevel } from '../../api/client';

export default function ItemGovernanceDetail({ itemId }: { itemId: string }) {
  const [summary, setSummary] = useState<KBGovernanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  // For editing
  const [editing, setEditing] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [trustLevels, setTrustLevels] = useState<SourceTrustLevel[]>([]);
  const [editForm, setEditForm] = useState<{ sourceId: string; sourceUrl: string; sourceTrustLevelId: string; freshnessCycle: string; reviewStatus: string; learnerVisible: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await api.itemsGov.summary(itemId));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => { load(); }, [load]);

  async function startEditing() {
    setEditing(true);
    try {
      if (sources.length === 0) setSources(await api.governance.sources.list());
      if (trustLevels.length === 0) setTrustLevels(await api.governance.trustLevels());
      if (summary) {
        setEditForm({
          sourceId: summary.item.sourceId ?? '',
          sourceUrl: summary.item.sourceUrl ?? '',
          sourceTrustLevelId: summary.item.sourceTrustLevelId ?? '',
          freshnessCycle: summary.item.freshnessCycle ?? '',
          reviewStatus: summary.item.reviewStatus ?? '',
          learnerVisible: summary.item.learnerVisible ?? false,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm) return;
    setActing('saving');
    try {
      await api.itemsGov.update(itemId, {
        sourceId: editForm.sourceId || null,
        sourceUrl: editForm.sourceUrl || null,
        sourceTrustLevelId: editForm.sourceTrustLevelId || null,
        freshnessCycle: editForm.freshnessCycle || null,
        reviewStatus: editForm.reviewStatus || null,
        learnerVisible: editForm.learnerVisible,
      });
      setEditing(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActing(null);
    }
  }

  async function enqueueReview() {
    setActing('enqueue');
    try {
      await api.itemsGov.enqueue(itemId, { reasonCode: 'manual', priority: 'normal' });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActing(null);
    }
  }

  if (loading) return <div className="text-sm text-gray-400">Loading governance details...</div>;
  if (!summary) return null;

  return (
    <div className="border rounded p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-gray-700">Governance Details</h2>
        <div>
          {!editing && (
            <button onClick={startEditing} className="text-xs px-2 py-1 border rounded bg-white mr-2">
              Edit Policy
            </button>
          )}
          <button onClick={enqueueReview} disabled={acting !== null} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded">
             {acting === 'enqueue' ? 'Enqueuing...' : 'Request Review'}
          </button>
        </div>
      </div>

      {error && <div className="mb-3 p-2 bg-red-100 text-red-800 rounded text-sm">{error}</div>}

      {editing && editForm ? (
        <form onSubmit={saveEdit} className="space-y-3 mb-4 p-3 bg-white border rounded">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Source Registry</label>
              <select className="w-full border rounded text-sm p-1"
                value={editForm.sourceId} onChange={e => setEditForm({ ...editForm, sourceId: e.target.value })}>
                <option value="">None</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Trust Level</label>
              <select className="w-full border rounded text-sm p-1"
                value={editForm.sourceTrustLevelId} onChange={e => setEditForm({ ...editForm, sourceTrustLevelId: e.target.value })}>
                <option value="">None</option>
                {trustLevels.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Source URL (Direct)</label>
              <input type="text" className="w-full border rounded text-sm p-1"
                value={editForm.sourceUrl} onChange={e => setEditForm({ ...editForm, sourceUrl: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Freshness Cycle</label>
              <select className="w-full border rounded text-sm p-1"
                value={editForm.freshnessCycle} onChange={e => setEditForm({ ...editForm, freshnessCycle: e.target.value })}>
                <option value="">None</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="regulatory">Regulatory</option>
                <option value="framework">Framework</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">&nbsp;</label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editForm.learnerVisible} onChange={e => setEditForm({ ...editForm, learnerVisible: e.target.checked })} />
                Learner Visible
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="px-3 py-1 text-sm border rounded">Cancel</button>
            <button type="submit" disabled={acting !== null} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
              {acting === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <div className="text-xs text-gray-500 uppercase">Freshness</div>
            <div className="font-medium">
              <span className={`px-1.5 py-0.5 rounded text-xs mr-1 ${summary.item.freshnessStatus === 'expired' ? 'bg-red-100 text-red-800' : summary.item.freshnessStatus === 'stale' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {summary.item.freshnessStatus || 'Unknown'}
              </span>
              {summary.item.freshnessCycle ? `(${summary.item.freshnessCycle})` : ''}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Review Status</div>
            <div className="font-medium capitalize">
              {summary.item.reviewStatus || 'None'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Next Review</div>
            <div className="font-medium">{summary.item.nextReviewAt ? new Date(summary.item.nextReviewAt).toLocaleDateString() : 'Unscheduled'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Learner Visible</div>
            <div className="font-medium">{summary.item.learnerVisible ? 'Yes' : 'No'}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-500 uppercase">Source</div>
            <div className="font-medium">{summary.source?.name || 'Not mapped'}</div>
            {summary.item.sourceUrl && <div className="text-xs text-blue-600 truncate"><a href={summary.item.sourceUrl} target="_blank" rel="noreferrer">{summary.item.sourceUrl}</a></div>}
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-500 uppercase">Trust Level</div>
            <div className="font-medium">{summary.trustLevel?.name || 'Not mapped'}</div>
          </div>
        </div>
      )}

      {summary.openAlerts.length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-bold text-red-700 uppercase mb-1">Active Alerts</h3>
          {summary.openAlerts.map(a => (
            <div key={a.id} className="text-sm p-2 bg-red-50 border border-red-200 rounded mb-1">
              <span className="font-bold mr-2">{a.severity}</span>{a.message}
            </div>
          ))}
        </div>
      )}

      {summary.openReviewItems.length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-bold text-yellow-700 uppercase mb-1">Active Reviews</h3>
          {summary.openReviewItems.map(q => (
            <div key={q.id} className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded mb-1">
              Priority: {q.priority} | Reason: {q.reasonCode} 
            </div>
          ))}
        </div>
      )}

      {summary.recentDecisions.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Publish Decisions</h3>
          {summary.recentDecisions.map(d => (
            <div key={d.id} className="text-xs text-gray-600 flex justify-between">
              <span className="capitalize font-medium">{d.decision}</span>
              <span className="truncate mx-2">{d.notes || d.reasonCode || 'No notes'}</span>
              <span className="text-gray-400">{new Date(d.decidedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
