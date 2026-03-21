import { useState, useEffect, useCallback } from 'react';
import { api, type GovernanceAdminSummary, type Source, type FreshnessRule, type ReviewQueueItem, type ContentAlert } from '../../api/client';
import { Link } from 'react-router-dom';
import { getAdminUsername } from '../../lib/adminSession';

type Tab = 'summary' | 'sources' | 'rules' | 'queue' | 'alerts';

export default function GovernancePanel() {
  const [tab, setTab] = useState<Tab>('summary');
  const [summary, setSummary] = useState<GovernanceAdminSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await api.governance.summary());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'summary') loadSummary();
  }, [tab, loadSummary]);

  async function runScan() {
    setActing('runScan');
    setError(null);
    try {
      const res = await api.governance.runScan();
      alert(`Scan complete. Scanned: ${res.itemsScanned}, Next Reviews Set: ${res.nextReviewAtSet}, Freshness Updated: ${res.freshnessUpdated}, Enqueued: ${res.reviewQueueEnqueued}, Alerts: ${res.alertsCreated}`);
      loadSummary();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActing(null);
    }
  }

  async function backfill() {
    setActing('backfill');
    setError(null);
    try {
      const res = await api.governance.backfill();
      alert(`Backfilled defaults for ${res.updated} items.`);
      loadSummary();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="border rounded bg-white shadow-sm">
      <div className="flex items-center gap-1 border-b bg-gray-50 px-4 py-2">
        <h2 className="font-bold text-gray-700 mr-4">Governance</h2>
        {(['summary', 'sources', 'rules', 'queue', 'alerts'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-sm rounded capitalize ${tab === t ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            {t}
          </button>
        ))}
        <div className="flex-1"></div>
        <button onClick={backfill} disabled={acting !== null} className="text-xs px-2 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50">
          {acting === 'backfill' ? 'Backfilling...' : 'Seed Defaults'}
        </button>
        <button onClick={runScan} disabled={acting !== null} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 ml-2">
          {acting === 'runScan' ? 'Scanning...' : 'Run Scan'}
        </button>
      </div>

      <div className="p-4">
        {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded text-sm">{error}</div>}
        {tab === 'summary' && <SummaryTab summary={summary} loading={loading} />}
        {tab === 'sources' && <SourcesTab />}
        {tab === 'rules' && <RulesTab />}
        {tab === 'queue' && <QueueTab />}
        {tab === 'alerts' && <AlertsTab />}
      </div>
    </div>
  );
}

function SummaryTab({ summary, loading }: { summary: GovernanceAdminSummary | null, loading: boolean }) {
  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (!summary) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard title="Total Items" value={summary.total.toString()} sub={`${summary.published} published / ${summary.learnerVisible} visible`} />
      <MetricCard title="Pending Reviews" value={summary.pendingReviews.toString()} error={summary.blockingReviews > 0} sub={`${summary.blockingReviews} blocking`} />
      <MetricCard title="Open Alerts" value={summary.openAlerts.toString()} error={summary.criticalAlerts > 0} sub={`${summary.criticalAlerts} critical`} />
      
      <div className="col-span-3 grid grid-cols-2 gap-4 mt-2">
        <div className="border rounded p-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-2">By Freshness Status</h3>
          {Object.entries(summary.byFreshnessStatus).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm py-1">
              <span className="capitalize">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
        <div className="border rounded p-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-2">By Review Status</h3>
          {Object.entries(summary.byReviewStatus).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm py-1">
              <span className="capitalize">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, error }: { title: string; value: string; sub?: string; error?: boolean }) {
  return (
    <div className={`p-4 rounded border ${error ? 'border-red-300 bg-red-50' : 'bg-gray-50'}`}>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{title}</div>
      <div className={`text-2xl font-bold mt-1 ${error ? 'text-red-700' : 'text-gray-800'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function SourcesTab() {
  const [sources, setSources] = useState<Source[]>([]);
  const [trustLevels, setTrustLevels] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Source> | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.governance.sources.list(), api.governance.trustLevels()])
      .then(([s, t]) => { setSources(s); setTrustLevels(t); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setActing('saving');
    try {
      if (editing.id) {
        await api.governance.sources.update(editing.id, editing);
      } else {
        await api.governance.sources.create(editing);
      }
      setEditing(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex justify-end mb-2">
        {!editing && <button onClick={() => setEditing({ status: 'active', sourceType: 'organization' })} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ Add Source</button>}
      </div>
      {editing && (
        <form onSubmit={save} className="mb-4 p-3 border rounded bg-gray-50 grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input required className="w-full border rounded px-2 py-1" value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Domain</label>
            <input required className="w-full border rounded px-2 py-1" value={editing.domain || ''} onChange={e => setEditing({...editing, domain: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Source Type</label>
            <select required className="w-full border rounded px-2 py-1" value={editing.sourceType || ''} onChange={e => setEditing({...editing, sourceType: e.target.value})}>
              <option value="">Select...</option>
              <option value="organization">Organization</option>
              <option value="government">Government</option>
              <option value="news">News</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Trust Level</label>
            <select required className="w-full border rounded px-2 py-1" value={editing.trustLevelId || ''} onChange={e => setEditing({...editing, trustLevelId: e.target.value})}>
              <option value="">Select...</option>
              {trustLevels.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select required className="w-full border rounded px-2 py-1" value={editing.status || ''} onChange={e => setEditing({...editing, status: e.target.value})}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setEditing(null)} className="px-3 py-1 border rounded bg-white">Cancel</button>
            <button type="submit" disabled={acting !== null} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">
              {acting === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
      <table className="w-full text-sm text-left">
        <thead><tr className="border-b"><th className="py-2">Name</th><th>Domain</th><th>Status</th><th>Type</th><th></th></tr></thead>
        <tbody>
          {sources.map(s => (
            <tr key={s.id} className="border-b">
              <td className="py-2 font-medium">{s.name}</td>
              <td>{s.domain}</td>
              <td>{s.status}</td>
              <td>{s.sourceType}</td>
              <td className="text-right">
                <button onClick={() => setEditing(s)} className="text-blue-600 hover:underline text-xs">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RulesTab() {
  const [rules, setRules] = useState<FreshnessRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<FreshnessRule> | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.governance.freshnessRules.list().then(setRules).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setActing('saving');
    try {
      const payload = { ...editing };
      if ((payload as any).alertBeforeDays === '') payload.alertBeforeDays = null;
      if (payload.id) {
        await api.governance.freshnessRules.update(payload.id, payload);
      } else {
        await api.governance.freshnessRules.create(payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex justify-end mb-2">
        {!editing && <button onClick={() => setEditing({ active: true, appliesToType: 'type', reviewAfterDays: 180, expireAfterDays: 365, alertBeforeDays: 30 })} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ Add Rule</button>}
      </div>
      {editing && (
        <form onSubmit={save} className="mb-4 p-3 border rounded bg-gray-50 grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Applies To Type</label>
            <select required className="w-full border rounded px-2 py-1" value={editing.appliesToType || ''} onChange={e => setEditing({...editing, appliesToType: e.target.value})}>
              <option value="">Select...</option>
              <option value="type">Content Type</option>
              <option value="source">Source Trust Level</option>
              <option value="global">Global Default</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Applies To Value</label>
            <input className="w-full border rounded px-2 py-1" value={editing.appliesToValue || ''} onChange={e => setEditing({...editing, appliesToValue: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Review After (Days)</label>
            <input type="number" required className="w-full border rounded px-2 py-1" value={editing.reviewAfterDays || ''} onChange={e => setEditing({...editing, reviewAfterDays: parseInt(e.target.value)})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Expire After (Days)</label>
            <input type="number" required className="w-full border rounded px-2 py-1" value={editing.expireAfterDays || ''} onChange={e => setEditing({...editing, expireAfterDays: parseInt(e.target.value)})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Alert Before (Days)</label>
            <input type="number" className="w-full border rounded px-2 py-1" value={editing.alertBeforeDays || ''} onChange={e => setEditing({...editing, alertBeforeDays: e.target.value === '' ? null : parseInt(e.target.value) as any})} />
          </div>
          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active ?? true} onChange={e => setEditing({...editing, active: e.target.checked})} />
              Active
            </label>
          </div>
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setEditing(null)} className="px-3 py-1 border rounded bg-white">Cancel</button>
            <button type="submit" disabled={acting !== null} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">
              {acting === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
      <table className="w-full text-sm text-left">
        <thead><tr className="border-b"><th className="py-2">Applies To</th><th>Value</th><th>Review After</th><th>Expire After</th><th>Alert</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {rules.map(r => (
            <tr key={r.id} className="border-b">
              <td className="py-2">{r.appliesToType}</td>
              <td className="font-medium">{r.appliesToValue}</td>
              <td>{r.reviewAfterDays}d</td>
              <td>{r.expireAfterDays}d</td>
              <td>{r.alertBeforeDays ? r.alertBeforeDays + 'd' : '-'}</td>
              <td>{r.active ? 'Yes' : 'No'}</td>
              <td className="text-right">
                <button onClick={() => setEditing(r)} className="text-blue-600 hover:underline text-xs">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QueueTab() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  
  const load = useCallback(() => {
    setLoading(true);
    api.governance.reviewQueue.list({ status: 'pending' }).then(setQueue).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, st: string) => {
    setActing(id + ':' + st);
    try {
      await api.governance.reviewQueue.decision(id, { status: st });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (queue.length === 0) return <div className="text-sm text-gray-500">Queue is empty.</div>;

  return (
    <div className="space-y-2">
      {queue.map(q => (
        <div key={q.id} className="border rounded p-3 flex justify-between items-center bg-gray-50">
          <div>
            <Link to={`/kb/${q.contentItemId}`} className="font-medium text-blue-600 hover:underline">
              Item {q.contentItemId.substring(0,8)}...
            </Link>
            <div className="text-sm text-gray-500 mt-1">Priority: {q.priority} | Reason: {q.reasonCode}</div>
            <div className="text-xs text-gray-400">Opened: {new Date(q.openedAt).toLocaleString()}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => act(q.id, 'approved')} disabled={acting !== null} className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50">
              {acting === q.id + ':approved' ? '...' : 'Approve'}
            </button>
            <button onClick={() => act(q.id, 'rejected')} disabled={acting !== null} className="px-3 py-1 border border-red-600 text-red-600 rounded text-sm hover:bg-red-50 disabled:opacity-50">
              {acting === q.id + ':rejected' ? '...' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertsTab() {
  const [alerts, setAlerts] = useState<ContentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  
  const load = useCallback(() => {
    setLoading(true);
    api.governance.contentAlerts.list({ status: 'open' }).then(setAlerts).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);
  
  const resolve = async (id: string) => {
    setActing(id);
    try {
      await api.governance.contentAlerts.update(id, { status: 'resolved' });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (alerts.length === 0) return <div className="text-sm text-gray-500">No open alerts.</div>;

  return (
    <div className="space-y-2">
      {alerts.map(a => (
        <div key={a.id} className={`border rounded p-3 flex justify-between items-center ${a.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase rounded px-1.5 py-0.5 ${a.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>{a.severity}</span>
              <Link to={`/kb/${a.contentItemId}`} className="font-medium text-gray-800 hover:underline">
                Item {a.contentItemId.substring(0,8)}...
              </Link>
            </div>
            <div className="text-sm text-gray-700 mt-1.5">{a.message}</div>
            <div className="text-xs text-gray-500 mt-0.5">Type: {a.alertType} | Created: {new Date(a.createdAt).toLocaleString()}</div>
          </div>
          <button onClick={() => resolve(a.id)} disabled={acting !== null} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-100 disabled:opacity-50">
            {acting === a.id ? '...' : 'Resolve'}
          </button>
        </div>
      ))}
    </div>
  );
}
