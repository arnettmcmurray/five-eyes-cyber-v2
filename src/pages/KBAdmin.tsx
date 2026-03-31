import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type KBItem, type IngestJob } from '../api/client';
import { getAdminToken, getAdminUsername, clearAdminSession } from '../lib/adminSession';
import GovernancePanel from '../components/admin/GovernancePanel';

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
  const [showGovernance, setShowGovernance] = useState(false);
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
          <a href="/learn" target="_blank" rel="noopener noreferrer" className="px-3 py-2 border rounded text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            Learner ↗
          </a>
          <Link to="/kb/search" className="px-3 py-2 border rounded text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            Search
          </Link>
          <Link to="/kb/topics" className="px-3 py-2 border rounded text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            Topics
          </Link>
          <Link to="/kb/modules" className="px-3 py-2 border rounded text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            Modules
          </Link>
          <Link to="/admin/progress" className="px-3 py-2 border rounded text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            Progress
          </Link>
          <Link to="/admin/assignments" className="px-3 py-2 border rounded text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            Assignments
          </Link>
          <Link to="/admin/profile" className="px-3 py-2 border rounded text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            Profile
          </Link>
          <button
            onClick={() => { clearAdminSession(); navigate('/admin/login'); }}
            className="px-3 py-2 border rounded text-sm hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            title={`Logged in as ${adminUsername}`}
          >
            Logout
          </button>
          <button
            onClick={() => setShowGovernance(v => !v)}
            className="px-3 py-2 border rounded text-sm"
            style={showGovernance ? { background: 'var(--bg-elevated)', color: 'var(--text-primary)' } : { color: 'var(--text-muted)' }}
          >
            Governance
          </button>
          <button
            onClick={async () => {
              if (!showJobs) setJobs(await api.ingestJobs.list());
              setShowJobs(v => !v);
            }}
            className="px-3 py-2 border rounded text-sm hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            Jobs
          </button>
          <button
            onClick={() => setShowIngest(v => !v)}
            className="px-4 py-2 rounded hover:opacity-90"
            style={{ background: 'var(--gold-accent)', color: '#000' }}
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
        <div className="mb-6 border rounded p-4" style={{ background: 'var(--bg-elevated)' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Ingestion Jobs</h2>
          {jobs.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No jobs found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ color: 'var(--text-muted)' }}>
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
                    <td className="py-1 pr-4" style={{ color: 'var(--text-muted)' }}>{j.sourceType}</td>
                    <td className="py-1 pr-4">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        j.status === 'completed' ? 'bg-green-100 text-green-800' :
                        j.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{j.status}</span>
                    </td>
                    <td className="py-1 pr-4" style={{ color: 'var(--text-muted)' }}>{j.createdBy}</td>
                    <td className="py-1 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(j.createdAt).toLocaleString()}</td>
                    <td className="py-1">
                      {j.resultItemId && (
                        <Link
                          to={`/kb/${j.resultItemId}`}
                          className="px-2 py-0.5 text-xs rounded hover:opacity-90"
                          style={{ background: 'var(--gold-accent)', color: '#000' }}
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

      {showGovernance && (
        <div className="mb-6">
          <GovernancePanel />
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
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No items match.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left" style={{ color: 'var(--text-muted)' }}>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Trust</th>
              <th className="py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b" onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <td className="py-2 pr-4">
                  <Link
                    to={`/kb/${item.id}`}
                    className="font-medium hover:underline"
                    style={{ color: 'var(--gold-accent)' }}
                  >
                    {item.title}
                  </Link>
                  <div className="text-xs mt-0.5 max-w-xs truncate" style={{ color: 'var(--text-muted)' }} title={item.slug}>{item.slug}</div>
                </td>
                <td className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>{item.type}</td>
                <td className="py-2 pr-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>{item.sourceTrust}</td>
                <td className="py-2" style={{ color: 'var(--text-muted)' }}>
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
    'under-review': 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-700',
  };
  const cls = colors[status];
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${cls ?? ''}`}
      style={!cls ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)' } : undefined}
    >
      {status}
    </span>
  );
}

const ACCEPTED_EXTENSIONS = ['.txt', '.md', '.markdown', '.html', '.htm', '.pdf', '.docx'];
const MIME_MAP: Record<string, string> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function getExtension(name: string): string {
  const m = name.match(/(\.[^.]+)$/);
  return m ? m[1].toLowerCase() : '';
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

type IngestTab = 'manual' | 'file' | 'url';

function IngestForm({ onDone }: { onDone: () => void }) {
  const [tab, setTab] = useState<IngestTab>('manual');
  const [actor, setActor] = useState(() => getAdminUsername() ?? 'admin');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ingestResult, setIngestResult] = useState<IngestJob | null>(null);

  // manual
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');

  // file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // url
  const [url, setUrl] = useState('');

  function loadFile(file: File) {
    setFileErr(null);
    setSelectedFile(null);
    const ext = getExtension(file.name);
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setFileErr(`Unsupported file type "${ext || '(none)'}". Accepted: .txt, .md, .markdown, .html, .htm, .pdf, .docx`);
      return;
    }
    setSelectedFile(file);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      let result: IngestJob;
      if (tab === 'manual') {
        result = await api.ingest.manual({ content, label, createdBy: actor });
      } else if (tab === 'file') {
        result = await api.ingest.file(selectedFile!, actor);
      } else {
        result = await api.ingest.url({ url, fetchedBy: actor });
      }
      setIngestResult(result);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  const tabs: IngestTab[] = ['manual', 'file', 'url'];
  const fileReady = tab === 'file' && !!selectedFile && !fileErr;

  if (ingestResult) {
    return (
      <div className="mb-6 p-4 border rounded space-y-3" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-gold)' }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Ingest complete
          </p>
          <button type="button" onClick={onDone} className="text-xs hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            ✕ Close
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Label</span><span style={{ color: 'var(--text-primary)' }}>{ingestResult.label}</span>
          <span>Status</span><span style={{ color: 'var(--text-primary)' }}>{ingestResult.status}</span>
          <span>Source</span><span style={{ color: 'var(--text-primary)' }}>{ingestResult.sourceType}</span>
          {ingestResult.errorMessage && (
            <><span className="text-red-600 col-span-2">{ingestResult.errorMessage}</span></>
          )}
        </div>
        {ingestResult.resultItemId && (
          <Link
            to={`/kb/${ingestResult.resultItemId}`}
            className="inline-block px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90"
            style={{ background: 'var(--gold-accent)', color: '#000' }}
          >
            Review draft →
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mb-6 p-4 border rounded space-y-3" style={{ background: 'var(--bg-elevated)' }}>
      <div className="flex gap-2 border-b pb-2 mb-1">
        {tabs.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-sm rounded-t capitalize ${tab === t ? 'font-medium' : 'hover:opacity-80'}`}
            style={tab === t ? { background: 'var(--bg-surface)', color: 'var(--text-primary)' } : { color: 'var(--text-muted)' }}
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
          <div
            onDragEnter={e => { e.preventDefault(); setDragOver(true); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className="relative border-2 border-dashed rounded-lg px-6 py-8 text-center transition-colors"
            style={{
              borderColor: dragOver ? 'var(--gold-accent)' : 'var(--border-subtle)',
              background: dragOver ? 'var(--gold-muted)' : 'var(--bg-surface)',
            }}
          >
            <input
              type="file"
              accept=".txt,.md,.markdown,.html,.htm,.pdf,.docx"
              onChange={onFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Drop a file here or click to select
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Supported: .txt, .md, .html, .pdf, .docx
            </p>
          </div>

          {fileErr && (
            <div className="p-2 bg-red-100 text-red-800 rounded text-sm">{fileErr}</div>
          )}

          {selectedFile && !fileErr && (
            <div className="flex items-center gap-3 px-3 py-2 rounded border text-sm" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</span>
              <span className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                {MIME_MAP[getExtension(selectedFile.name)] ?? selectedFile.type}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{formatBytes(selectedFile.size)}</span>
              <button
                type="button"
                className="ml-auto text-xs hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => { setSelectedFile(null); setFileErr(null); }}
              >
                ✕ Clear
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'url' && (
        <Field label="URL" hint="Fetches the page content and creates a draft KB item.">
          <input type="url" className="w-full border rounded px-3 py-1.5 text-sm" placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} required />
        </Field>
      )}

      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <span>Ingested by:</span>
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{actor}</span>
      </div>

      <button
        type="submit"
        disabled={saving || (tab === 'file' && !fileReady)}
        className="px-4 py-2 rounded disabled:opacity-50"
        style={{ background: 'var(--gold-accent)', color: '#000' }}
      >
        {saving ? 'Ingesting…' : 'Ingest'}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {hint && <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      {children}
    </div>
  );
}
