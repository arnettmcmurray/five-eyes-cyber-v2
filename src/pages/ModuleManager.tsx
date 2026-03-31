import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, type LearningModule, type ModulePrerequisite, type AdminModuleLink, type KBItem } from '../api/client';
import { getAdminUsername } from '../lib/adminSession';

export default function ModuleManager() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<LearningModule | null>(null);
  const [managingPrereqs, setManagingPrereqs] = useState<LearningModule | null>(null);
  const [managingContent, setManagingContent] = useState<LearningModule | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setModules(await api.modules.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function patch(updated: LearningModule) {
    setModules(ms => ms.map(m => m.id === updated.id ? updated : m).sort(
      (a, b) => a.displayOrder - b.displayOrder || a.createdAt.localeCompare(b.createdAt)
    ));
  }

  async function togglePublish(m: LearningModule) {
    setActing(m.id + ':pub');
    setError(null);
    try {
      patch(m.published ? await api.modules.unpublish(m.id) : await api.modules.publish(m.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActing(null);
    }
  }

  async function deleteModule(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? Lesson links using this module will remain orphaned.`)) return;
    try {
      await api.modules.delete(id);
      setModules(ms => ms.filter(m => m.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/kb" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>← KB</Link>
          <Link to="/admin/progress" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>Progress</Link>
          <Link to="/admin/assignments" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>Assignments</Link>
          <h1 className="text-2xl font-bold">Modules</h1>
        </div>
        <button
          onClick={() => { setShowCreate(v => !v); setEditing(null); setManagingPrereqs(null); setManagingContent(null); }}
          className="px-4 py-2 rounded hover:opacity-90 text-sm"
          style={{ background: 'var(--gold-accent)', color: '#000' }}
        >
          {showCreate ? 'Cancel' : '+ New module'}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded text-sm">{error}</div>}

      {showCreate && (
        <ModuleForm
          allModules={modules}
          onSave={async data => {
            const created = await api.modules.create({ ...data, createdBy: getAdminUsername() ?? 'admin' });
            setModules(ms => [...ms, created].sort((a, b) => a.displayOrder - b.displayOrder));
            setShowCreate(false);
          }}
        />
      )}

      {editing && (
        <ModuleForm
          initial={editing}
          allModules={modules.filter(m => m.id !== editing.id)}
          onSave={async data => {
            const updated = await api.modules.update(editing.id, data);
            patch(updated);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {managingPrereqs && (
        <PrerequisiteManager
          module={managingPrereqs}
          allModules={modules.filter(m => m.id !== managingPrereqs.id)}
          onClose={() => setManagingPrereqs(null)}
        />
      )}

      {managingContent && (
        <ContentPanel
          module={managingContent}
          onClose={() => setManagingContent(null)}
        />
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : modules.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No modules yet.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              <th className="py-2 pr-3 w-8">#</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Next</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(m => {
              const nextTitle = m.nextModuleId ? modules.find(x => x.id === m.nextModuleId)?.title : null;
              return (
                <tr key={m.id} className="border-b" style={{ ['--hover-bg' as string]: 'var(--bg-elevated)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td className="py-2 pr-3 text-xs" style={{ color: 'var(--text-muted)' }}>{m.displayOrder}</td>
                  <td className="py-2 pr-4">
                    <div className="font-medium flex items-center gap-2">
                      {m.title}
                      {m.estimatedMinutes != null && (
                        <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{m.estimatedMinutes} min</span>
                      )}
                    </div>
                    <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{m.slug}</div>
                    {m.description && <div className="text-xs mt-0.5 max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>{m.description}</div>}
                  </td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => togglePublish(m)}
                      disabled={acting === m.id + ':pub'}
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        m.published
                          ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                          : 'border-transparent hover:opacity-80'
                      } disabled:opacity-50`}
                      style={!m.published ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)' } : undefined}
                    >
                      {acting === m.id + ':pub' ? '…' : m.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-2 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{nextTitle ?? '—'}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditing(m); setShowCreate(false); setManagingPrereqs(null); setManagingContent(null); }}
                        className="text-xs hover:underline"
                        style={{ color: 'var(--gold-accent)' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setManagingContent(m); setEditing(null); setShowCreate(false); setManagingPrereqs(null); }}
                        className="text-xs hover:underline"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Content
                      </button>
                      <button
                        onClick={() => { setManagingPrereqs(m); setEditing(null); setShowCreate(false); setManagingContent(null); }}
                        className="text-xs hover:underline"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Prerequisites
                      </button>
                      <button
                        onClick={() => deleteModule(m.id, m.title)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ModuleForm({
  initial,
  allModules,
  onSave,
  onCancel,
}: {
  initial?: LearningModule;
  allModules: LearningModule[];
  onSave: (data: { slug: string; title: string; description: string; displayOrder: number; nextModuleId: string | null; estimatedMinutes: number | null }) => Promise<void>;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [displayOrder, setDisplayOrder] = useState(initial?.displayOrder ?? 0);
  const [nextModuleId, setNextModuleId] = useState<string>(initial?.nextModuleId ?? '');
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>(initial?.estimatedMinutes != null ? String(initial.estimatedMinutes) : '');
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function deriveSlug(t: string) {
    return t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugTouched) setSlug(deriveSlug(val));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const mins = estimatedMinutes !== '' ? Number(estimatedMinutes) : null;
      await onSave({ slug, title, description, displayOrder, nextModuleId: nextModuleId || null, estimatedMinutes: mins && !isNaN(mins) ? mins : null });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-6 p-4 border rounded space-y-3" style={{ background: 'var(--bg-elevated)' }}>
      {err && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">{err}</div>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Title</label>
          <input className="w-full border rounded px-3 py-1.5 text-sm" value={title} onChange={e => handleTitleChange(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Slug {initial && <span style={{ color: 'var(--text-muted)' }}>(locked)</span>}</label>
          <input
            className="w-full border rounded px-3 py-1.5 text-sm font-mono"
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
            required pattern="[a-z0-9-]+"
            disabled={!!initial}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Description</label>
        <textarea className="w-full border rounded px-3 py-1.5 text-sm" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Display order</label>
          <input type="number" className="w-full border rounded px-3 py-1.5 text-sm" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} min={0} />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Est. minutes</label>
          <input type="number" className="w-full border rounded px-3 py-1.5 text-sm" value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} min={1} placeholder="optional" />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Next module</label>
          <select className="w-full border rounded px-3 py-1.5 text-sm" value={nextModuleId} onChange={e => setNextModuleId(e.target.value)}>
            <option value="">— none —</option>
            {allModules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-4 py-1.5 rounded text-sm disabled:opacity-50" style={{ background: 'var(--gold-accent)', color: '#000' }}>
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create module'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-1.5 border rounded text-sm" style={{ color: 'var(--text-muted)' }}>Cancel</button>
        )}
      </div>
    </form>
  );
}

const ROLES = ['primary', 'prerequisite-reading', 'supplementary'] as const;
type LinkRole = typeof ROLES[number];

const STATUS_COLORS: Record<string, string> = {
  'under-review': 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-red-100 text-red-700',
};

function ContentPanel({ module, onClose }: { module: LearningModule; onClose: () => void }) {
  const [links, setLinks] = useState<AdminModuleLink[]>([]);
  const [allItems, setAllItems] = useState<KBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  // add-item form state
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [role, setRole] = useState<LinkRole>('primary');
  const [order, setOrder] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Promise.all([
      api.modules.content(module.id),
      api.items.list(),
    ])
      .then(([content, items]) => {
        setLinks(content.items);
        setAllItems(items);
      })
      .catch(e => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [module.id]);

  const linkedItemIds = new Set(links.map(l => l.item.id));
  const filteredItems = allItems.filter(
    i => !linkedItemIds.has(i.id) &&
      (filter === '' || i.title.toLowerCase().includes(filter.toLowerCase()) || i.slug.includes(filter.toLowerCase()))
  );

  async function removeLink(linkId: string) {
    setRemoving(linkId);
    setErr(null);
    try {
      await api.lessons.remove(linkId);
      setLinks(prev => prev.filter(l => l.link.id !== linkId));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRemoving(null);
    }
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItemId) return;
    setAdding(true);
    setErr(null);
    try {
      await api.lessons.link(module.id, { kbItemId: selectedItemId, role, order, addedBy: getAdminUsername() ?? 'admin' });
      // Reload content to get enriched item details
      const updated = await api.modules.content(module.id);
      setLinks(updated.items);
      setShowAdd(false);
      setSelectedItemId('');
      setFilter('');
      setOrder(0);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mb-6 p-4 border rounded space-y-3" style={{ background: 'var(--bg-elevated)' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Content: {module.title} <span className="font-normal text-sm" style={{ color: 'var(--text-muted)' }}>({links.length} item{links.length !== 1 ? 's' : ''})</span></h3>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAdd(v => !v); setFilter(''); setSelectedItemId(''); }}
            className="text-xs hover:underline"
            style={{ color: 'var(--gold-accent)' }}
          >
            {showAdd ? 'cancel add' : '+ Add item'}
          </button>
          <button onClick={onClose} className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>close</button>
        </div>
      </div>

      {err && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">{err}</div>}

      {showAdd && (
        <form onSubmit={addLink} className="p-3 border rounded space-y-2" style={{ background: 'var(--bg-surface)' }}>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Search KB items</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Filter by title or slug…"
              value={filter}
              onChange={e => { setFilter(e.target.value); setSelectedItemId(''); }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Item</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={selectedItemId}
              onChange={e => setSelectedItemId(e.target.value)}
              required
              size={filteredItems.length > 6 ? 6 : undefined}
            >
              <option value="" disabled>Select item…</option>
              {filteredItems.map(i => (
                <option key={i.id} value={i.id}>
                  [{i.status}] {i.title} ({i.type})
                </option>
              ))}
            </select>
            {filteredItems.length === 0 && filter && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>No unlinked items match "{filter}".</p>
            )}
          </div>
          <div className="flex gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Role</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={role}
                onChange={e => setRole(e.target.value as LinkRole)}
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
            <div className="flex items-end">
              <button
                type="submit"
                disabled={adding || !selectedItemId}
                className="px-3 py-1.5 rounded text-sm disabled:opacity-50"
                style={{ background: 'var(--gold-accent)', color: '#000' }}
              >
                {adding ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : links.length === 0 ? (
        <div className="text-sm border rounded p-3" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
          <p className="font-medium mb-1" style={{ color: 'var(--text-muted)' }}>No items linked yet.</p>
          <p>Click <span className="font-mono px-1 rounded" style={{ background: 'var(--bg-elevated)' }}>+ Add item</span> above to link KB items to this module. Published items become study content for learners; approved quiz candidates on those items appear as practice questions.</p>
        </div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-xs" style={{ color: 'var(--text-muted)' }}>
              <th className="py-1 pr-3">Order</th>
              <th className="py-1 pr-4">Title</th>
              <th className="py-1 pr-3">Type</th>
              <th className="py-1 pr-3">Status</th>
              <th className="py-1 pr-3">Role</th>
              <th className="py-1"></th>
            </tr>
          </thead>
          <tbody>
            {[...links]
              .sort((a, b) => a.link.order - b.link.order)
              .map(({ link, item }) => (
                <tr key={link.id} className="border-b">
                  <td className="py-1 pr-3 text-xs" style={{ color: 'var(--text-muted)' }}>{link.order}</td>
                  <td className="py-1 pr-4">
                    <span className="font-medium">{item.title}</span>
                    <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>{item.slug}</span>
                  </td>
                  <td className="py-1 pr-3 text-xs" style={{ color: 'var(--text-muted)' }}>{item.type}</td>
                  <td className="py-1 pr-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[item.status] ?? ''}`}
                      style={!STATUS_COLORS[item.status] ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)' } : undefined}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-1 pr-3 text-xs" style={{ color: 'var(--text-muted)' }}>{link.role}</td>
                  <td className="py-1">
                    <button
                      onClick={() => removeLink(link.id)}
                      disabled={removing === link.id}
                      className="text-xs text-red-500 hover:underline disabled:opacity-50"
                    >
                      {removing === link.id ? '…' : 'remove'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PrerequisiteManager({ module, allModules, onClose }: {
  module: LearningModule;
  allModules: LearningModule[];
  onClose: () => void;
}) {
  const [prereqs, setPrereqs] = useState<ModulePrerequisite[]>([]);
  const [dependents, setDependents] = useState<ModulePrerequisite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      api.modules.prerequisites.get(module.id),
      api.modules.dependents(module.id),
    ])
      .then(([list, deps]) => {
        setPrereqs(list);
        setDependents(deps);
        setSelectedIds(new Set(list.map(p => p.id)));
      })
      .catch(e => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [module.id]);

  function toggle(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const updated = await api.modules.prerequisites.set(module.id, [...selectedIds]);
      setPrereqs(updated);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-6 p-4 border rounded space-y-3" style={{ background: 'var(--bg-elevated)' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Prerequisites for: {module.title}</h3>
        <button onClick={onClose} className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>close</button>
      </div>

      {err && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">{err}</div>}

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : allModules.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No other modules to set as prerequisites.</p>
      ) : (
        <div className="space-y-1">
          {allModules.map(m => (
            <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.has(m.id)}
                onChange={() => toggle(m.id)}
              />
              <span>{m.title}</span>
              {!m.published && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(draft)</span>}
            </label>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving || loading}
          className="px-3 py-1.5 rounded text-sm disabled:opacity-50"
          style={{ background: 'var(--gold-accent)', color: '#000' }}
        >
          {saving ? 'Saving…' : 'Save prerequisites'}
        </button>
        <button onClick={onClose} className="px-3 py-1.5 border rounded text-sm" style={{ color: 'var(--text-muted)' }}>Cancel</button>
      </div>

      {prereqs.length > 0 && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Currently: {prereqs.map(p => p.title).join(', ')}
        </p>
      )}

      {dependents.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Required by:</p>
          <ul className="space-y-0.5">
            {dependents.map(d => (
              <li key={d.id} className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
