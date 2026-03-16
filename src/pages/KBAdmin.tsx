import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type KBItem, type IngestJob } from '../api/client';
import { getAdminToken, getAdminUsername, clearAdminSession } from '../lib/adminSession';

const STATUSES = ['', 'draft', 'under-review', 'published', 'archived'];
const TYPES = ['', 'training-content', 'threat-brief', 'policy', 'faq', 'glossary-term'];

export default function KBAdmin() {
  const navigate = useNavigate();
  const adminToken = getAdminToken();
  const adminUsername = getAdminUsername();

  useEffect(() => {
    if (!adminToken) navigate('/admin/login', { replace: true });
  }, [adminToken, navigate]);

  const [items, setItems] = useState<KBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIngest, setShowIngest] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [jobs, setJobs] = useState<IngestJob[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params['status'] = filterStatus;
      if (filterType) params['type'] = filterType;
      setItems(await api.items.list(Object.keys(params).length ? params : undefined));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <div className="flex gap-2">
          <Link to="/learn" className="px-3 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">
            Learn
          </Link>
          <Link to="/kb/search" className="px-3 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">
            Search
          </Link>
          <Link to="/kb/topics" className="px-3 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">
            Topics
          </Link>
          <Link to="/kb/modules" className="px-3 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">
            Modules
          </Link>
          <Link to="/admin/progress" className="px-3 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">
            Progress
          </Link>
          <Link to="/admin/assignments" className="px-3 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">
            Assignments
          </Link>
          <Link to="/admin/profile" className="px-3 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">
            Profile
          </Link>
          <button
            onClick={() => { clearAdminSession(); navigate('/admin/login'); }}
            className="px-3 py-2 border rounded text-sm text-gray-400 hover:bg-gray-50"
            title={`Logged in as ${adminUsername}`}
          >
            Log out
          </button>
          <button
            onClick={async () => {
              if (!showJobs) setJobs(await api.ingestJobs.list());
              setShowJobs(v => !v);
            }}
            className="px-3 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50"
          >
            Jobs
          </button>
          <button
            onClick={() => setShowIngest(v => !v)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showIngest ? 'Cancel' : '+ Ingest'}
          </button>
        </div>
      </div>

      {showIngest && (
        <IngestForm
          onDone={() => { setShowIngest(false); load(); }}
        />
      )}

      {showJobs && (
        <div className="mb-6 border rounded p-4 bg-gray-50">
          <h2 className="font-semibold text-gray-700 mb-3">Ingestion Jobs</h2>
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-400">No jobs found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-1 pr-4">Label</th>
                  <th className="py-1 pr-4">Type</th>
                  <th className="py-1 pr-4">Status</th>
                  <th className="py-1 pr-4">By</th>
                  <th className="py-1 pr-4">Created</th>
                  <th className="py-1">Result</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.id} className="border-b">
                    <td className="py-1 pr-4">{j.label ?? '—'}</td>
                    <td className="py-1 pr-4 text-gray-500">{j.sourceType}</td>
                    <td className="py-1 pr-4">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        j.status === 'completed' ? 'bg-green-100 text-green-800' :
                        j.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{j.status}</span>
                    </td>
                    <td className="py-1 pr-4 text-gray-500">{j.createdBy}</td>
                    <td className="py-1 pr-4 text-gray-400 text-xs">{new Date(j.createdAt).toLocaleString()}</td>
                    <td className="py-1">
                      {j.resultItemId && (
                        <Link
                          to={`/kb/${j.resultItemId}`}
                          className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Review →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {jobs.some(j => j.errorMessage) && (
            <div className="mt-3 space-y-1">
              {jobs.filter(j => j.errorMessage).map(j => (
                <div key={j.id} className="text-xs text-red-700 bg-red-50 p-2 rounded">
                  <strong>{j.label || j.id}:</strong> {j.errorMessage}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          {TYPES.map(t => <option key={t} value={t}>{t || 'All types'}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No items match.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Trust</th>
              <th className="py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">
                  <Link
                    to={`/kb/${item.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {item.title}
                  </Link>
                  <span className="ml-2 text-gray-400 text-xs">{item.slug}</span>
                </td>
                <td className="py-2 pr-4 text-gray-600">{item.type}</td>
                <td className="py-2 pr-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="py-2 pr-4 text-gray-600">{item.sourceTrust}</td>
                <td className="py-2 text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    'under-review': 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? 'bg-gray-100'}`}>
      {status}
    </span>
  );
}

type IngestTab = 'manual' | 'file' | 'url';

function IngestForm({ onDone }: { onDone: () => void }) {
  const [tab, setTab] = useState<IngestTab>('manual');
  const [actor, setActor] = useState('admin');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // manual
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');

  // file
  const [filename, setFilename] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [mimeType, setMimeType] = useState('text/plain');

  // url
  const [url, setUrl] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      if (tab === 'manual') {
        await api.ingest.manual({ content, label, createdBy: actor });
      } else if (tab === 'file') {
        await api.ingest.file({ rawContent: fileContent, filename, mimeType, uploadedBy: actor });
      } else {
        await api.ingest.url({ url, fetchedBy: actor });
      }
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  const tabs: IngestTab[] = ['manual', 'file', 'url'];

  return (
    <form onSubmit={submit} className="mb-6 p-4 border rounded bg-gray-50 space-y-3">
      <div className="flex gap-2 border-b pb-2 mb-1">
        {tabs.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-sm rounded-t capitalize ${tab === t ? 'bg-white border border-b-white font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {err && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">{err}</div>}

      {tab === 'manual' && (
        <>
          <Field label="Label">
            <input className="w-full border rounded px-3 py-1.5 text-sm" value={label} onChange={e => setLabel(e.target.value)} required />
          </Field>
          <Field label="Content">
            <textarea className="w-full border rounded px-3 py-1.5 text-sm font-mono" rows={6} value={content} onChange={e => setContent(e.target.value)} required />
          </Field>
        </>
      )}

      {tab === 'file' && (
        <>
          <Field label="Filename">
            <input className="w-full border rounded px-3 py-1.5 text-sm" value={filename} onChange={e => setFilename(e.target.value)} required />
          </Field>
          <Field label="MIME type">
            <select className="border rounded px-3 py-1.5 text-sm" value={mimeType} onChange={e => setMimeType(e.target.value)}>
              <option value="text/plain">text/plain</option>
              <option value="text/markdown">text/markdown</option>
              <option value="text/html">text/html</option>
              <option value="application/pdf">application/pdf</option>
            </select>
          </Field>
          <Field label="Content">
            <textarea className="w-full border rounded px-3 py-1.5 text-sm font-mono" rows={6} value={fileContent} onChange={e => setFileContent(e.target.value)} required />
          </Field>
        </>
      )}

      {tab === 'url' && (
        <Field label="URL">
          <input type="url" className="w-full border rounded px-3 py-1.5 text-sm" value={url} onChange={e => setUrl(e.target.value)} required />
        </Field>
      )}

      <Field label="By">
        <input className="w-40 border rounded px-3 py-1.5 text-sm" value={actor} onChange={e => setActor(e.target.value)} required />
      </Field>

      <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
        {saving ? 'Ingesting…' : 'Ingest'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
