import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api, TtxScenarioDetail, TtxSection, TtxStep, TtxInject, TtxDraftScenario, TtxDraftInject, TtxKbRef, SearchHit } from '../api/client';
import { getAdminToken, getAdminUsername } from '../lib/adminSession';

const INJECT_TYPES = ['legal', 'media', 'technical', 'customer', 'other'];

export default function TtxScenarioEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const autoDraftTriggered = useRef(false);
  const [scenario, setScenario] = useState<TtxScenarioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit scenario fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [editingMeta, setEditingMeta] = useState(false);

  // Add section form
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Add step: keyed by sectionId
  const [addingStep, setAddingStep] = useState<string | null>(null);
  const [newStep, setNewStep] = useState({ title: '', facilitatorNarrative: '' });

  // Add inject: keyed by stepId
  const [addingInject, setAddingInject] = useState<string | null>(null);
  const [newInject, setNewInject] = useState({ content: '', injectType: 'other', targetRoles: '', consequenceLogic: '' });

  // AI assist
  const [aiDrafting, setAiDrafting] = useState(false);
  const [aiDraft, setAiDraft] = useState<TtxDraftScenario | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [suggestingInjects, setSuggestingInjects] = useState<string | null>(null); // stepId
  const [injectSuggestions, setInjectSuggestions] = useState<{ stepId: string; injects: TtxDraftInject[] } | null>(null);
  // Track AI-created entity IDs for this session (badge display only, not persisted)
  const [aiCreated, setAiCreated] = useState<Set<string>>(new Set());
  const injectFromAI = useRef(false); // flag: current inject form was pre-filled by AI suggest

  // KB refs
  const [kbRefs, setKbRefs] = useState<TtxKbRef[]>([]);
  const [addingKbRef, setAddingKbRef] = useState(false);
  const [kbRefSearch, setKbRefSearch] = useState('');
  const [kbRefHits, setKbRefHits] = useState<SearchHit[]>([]);
  const [kbRefSearching, setKbRefSearching] = useState(false);
  const [kbRefSelectedItem, setKbRefSelectedItem] = useState<SearchHit | null>(null);
  const [kbRefScopeStepId, setKbRefScopeStepId] = useState<string>('');
  const [kbRefAdding, setKbRefAdding] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    load();
  }, [id]);

  async function load() {
    try {
      const [s, refs] = await Promise.all([
        api.ttx.scenarios.get(id!),
        api.ttx.scenarios.kbRefs.list(id!),
      ]);
      setScenario(s);
      setTitle(s.title);
      setDescription(s.description);
      setObjective(s.objective);
      setKbRefs(refs);
      // Auto-trigger AI draft if navigated here with ?draft=ai and objective exists
      if (searchParams.get('draft') === 'ai' && s.objective && !autoDraftTriggered.current) {
        autoDraftTriggered.current = true;
        setSearchParams({}, { replace: true }); // clean URL
        // Trigger after state settles
        setTimeout(() => draftScenarioWithAI(s.title, s.objective), 0);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function saveMeta() {
    setSaving(true);
    try {
      await api.ttx.scenarios.update(id!, { title, description, objective });
      setScenario(s => s ? { ...s, title, description, objective } : s);
      setEditingMeta(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function addSection() {
    if (!newSectionTitle) return;
    try {
      const order = (scenario?.sections.length ?? 0) + 1;
      const section = await api.ttx.scenarios.sections.create(id!, { title: newSectionTitle, order });
      setScenario(s => s ? { ...s, sections: [...s.sections, { ...section, steps: [] }] } : s);
      setNewSectionTitle('');
      setAddingSection(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function deleteSection(sectionId: string) {
    if (!confirm('Delete this section and all its steps/injects?')) return;
    try {
      await api.ttx.scenarios.sections.delete(id!, sectionId);
      setScenario(s => s ? { ...s, sections: s.sections.filter(x => x.id !== sectionId) } : s);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function addStep(sectionId: string) {
    if (!newStep.title) return;
    try {
      const section = scenario!.sections.find(s => s.id === sectionId)!;
      const order = section.steps.length + 1;
      const step = await api.ttx.scenarios.steps.create(id!, sectionId, { ...newStep, order });
      setScenario(s => s ? {
        ...s,
        sections: s.sections.map(sec =>
          sec.id === sectionId ? { ...sec, steps: [...sec.steps, { ...step, injects: [] }] } : sec
        ),
      } : s);
      setNewStep({ title: '', facilitatorNarrative: '' });
      setAddingStep(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function deleteStep(sectionId: string, stepId: string) {
    if (!confirm('Delete this step and all its injects?')) return;
    try {
      await api.ttx.scenarios.steps.delete(id!, sectionId, stepId);
      setScenario(s => s ? {
        ...s,
        sections: s.sections.map(sec =>
          sec.id === sectionId ? { ...sec, steps: sec.steps.filter(st => st.id !== stepId) } : sec
        ),
      } : s);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function addInject(sectionId: string, stepId: string) {
    if (!newInject.content) return;
    try {
      const section = scenario!.sections.find(s => s.id === sectionId)!;
      const step = section.steps.find(s => s.id === stepId)!;
      const order = step.injects.length + 1;
      const roles = newInject.targetRoles.split(',').map(r => r.trim()).filter(Boolean);
      const inject = await api.ttx.scenarios.injects.create(id!, sectionId, stepId, {
        content: newInject.content,
        injectType: newInject.injectType,
        targetRoles: roles,
        consequenceLogic: newInject.consequenceLogic,
        order,
      });
      setScenario(s => s ? {
        ...s,
        sections: s.sections.map(sec =>
          sec.id === sectionId ? {
            ...sec,
            steps: sec.steps.map(st =>
              st.id === stepId ? { ...st, injects: [...st.injects, inject] } : st
            ),
          } : sec
        ),
      } : s);
      if (injectFromAI.current) {
        setAiCreated(prev => new Set([...prev, inject.id]));
        injectFromAI.current = false;
      }
      setNewInject({ content: '', injectType: 'other', targetRoles: '', consequenceLogic: '' });
      setAddingInject(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function deleteInject(sectionId: string, stepId: string, injectId: string) {
    try {
      await api.ttx.scenarios.injects.delete(id!, sectionId, stepId, injectId);
      setScenario(s => s ? {
        ...s,
        sections: s.sections.map(sec =>
          sec.id === sectionId ? {
            ...sec,
            steps: sec.steps.map(st =>
              st.id === stepId ? { ...st, injects: st.injects.filter(i => i.id !== injectId) } : st
            ),
          } : sec
        ),
      } : s);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function draftScenarioWithAI(overrideTitle?: string, overrideObjective?: string) {
    setAiDrafting(true);
    setAiError(null);
    setAiDraft(null);
    try {
      const t = overrideTitle ?? scenario?.title ?? title;
      const o = overrideObjective ?? scenario?.objective ?? objective;
      const draft = await api.ttx.assist.draftScenario({ title: t, objective: o });
      setAiDraft(draft);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
    } finally {
      setAiDrafting(false);
    }
  }

  async function applyDraftSection(draftSection: TtxDraftScenario['sections'][0]) {
    if (!scenario) return;
    try {
      const order = (scenario.sections.length) + 1;
      const section = await api.ttx.scenarios.sections.create(id!, { title: draftSection.title, order });
      const newIds: string[] = [section.id];
      let sectionWithSteps = { ...section, steps: [] as TtxStep[] };
      for (let si = 0; si < draftSection.steps.length; si++) {
        const ds = draftSection.steps[si];
        const step = await api.ttx.scenarios.steps.create(id!, section.id, { title: ds.title, facilitatorNarrative: ds.facilitatorNarrative, order: si + 1 });
        newIds.push(step.id);
        let stepWithInjects = { ...step, injects: [] as TtxInject[] };
        for (let ii = 0; ii < ds.injects.length; ii++) {
          const di = ds.injects[ii];
          const inject = await api.ttx.scenarios.injects.create(id!, section.id, step.id, {
            content: di.content, injectType: di.injectType, targetRoles: di.targetRoles,
            consequenceLogic: di.consequenceLogic, order: ii + 1,
          });
          newIds.push(inject.id);
          stepWithInjects = { ...stepWithInjects, injects: [...stepWithInjects.injects, inject] };
        }
        sectionWithSteps = { ...sectionWithSteps, steps: [...sectionWithSteps.steps, stepWithInjects] };
      }
      setScenario(s => s ? { ...s, sections: [...s.sections, sectionWithSteps] } : s);
      setAiCreated(prev => new Set([...prev, ...newIds]));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function suggestInjects(stepId: string, stepPrompt: string) {
    setSuggestingInjects(stepId);
    setInjectSuggestions(null);
    try {
      const result = await api.ttx.assist.draftInjects({
        stepPrompt,
        scenarioContext: scenario?.objective,
        count: 3,
      });
      setInjectSuggestions({ stepId, injects: result.injects });
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
    } finally {
      setSuggestingInjects(null);
    }
  }

  function applyInjectSuggestion(sectionId: string, stepId: string, di: TtxDraftInject) {
    injectFromAI.current = true;
    setAddingInject(stepId);
    setNewInject({
      content: di.content,
      injectType: di.injectType,
      targetRoles: di.targetRoles.join(', '),
      consequenceLogic: di.consequenceLogic,
    });
    setInjectSuggestions(null);
  }

  async function searchKbItems(q: string) {
    if (!q.trim()) { setKbRefHits([]); return; }
    setKbRefSearching(true);
    try {
      const result = await api.kb.search(q, 'fts', 8);
      setKbRefHits(result.mode === 'fts' ? result.hits : []);
    } catch {
      setKbRefHits([]);
    } finally {
      setKbRefSearching(false);
    }
  }

  async function addKbRef() {
    if (!kbRefSelectedItem) return;
    setKbRefAdding(true);
    try {
      const ref = await api.ttx.scenarios.kbRefs.add(id!, {
        kbItemId: kbRefSelectedItem.itemId,
        stepId: kbRefScopeStepId || null,
        injectId: null,
      });
      setKbRefs(prev => [...prev, ref]);
      setKbRefSelectedItem(null);
      setKbRefSearch('');
      setKbRefHits([]);
      setKbRefScopeStepId('');
      setAddingKbRef(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setKbRefAdding(false);
    }
  }

  async function removeKbRef(refId: string) {
    try {
      await api.ttx.scenarios.kbRefs.remove(id!, refId);
      setKbRefs(prev => prev.filter(r => r.id !== refId));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-dim)' }}>
      <span className="text-xs font-bold uppercase tracking-widest">Loading…</span>
    </div>
  );
  if (!scenario) return (
    <div className="p-6 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
      {error ?? 'Not found'}
    </div>
  );

  const inputCls = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    borderRadius: '0.75rem',
    padding: '0.5rem 0.875rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties;

  const injectTypePill = (type: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      technical: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
      media:     { bg: 'rgba(245,158,11,0.12)', color: 'var(--gold-accent)' },
      legal:     { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' },
      customer:  { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
      other:     { bg: 'var(--bg-elevated)',     color: 'var(--text-dim)' },
    };
    return map[type] ?? map.other;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to="/ttx/scenarios"
            className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70 mb-2 inline-block"
            style={{ color: 'var(--text-dim)' }}
          >
            ← Scenarios
          </Link>
          <h1 className="font-display font-black text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {scenario.title}
          </h1>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/ttx/sessions" className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>Sessions →</Link>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{getAdminUsername()}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
          {error}
        </div>
      )}

      {/* Scenario meta */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {editingMeta ? (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Title</label>
              <input style={inputCls} value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
              <textarea style={{ ...inputCls, minHeight: '64px', resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Objective</label>
              <textarea style={{ ...inputCls, minHeight: '64px', resize: 'vertical' }} value={objective} onChange={e => setObjective(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={saveMeta} disabled={saving} className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40" style={{ background: 'var(--gold-accent)', color: '#000' }}>
                Save
              </button>
              <button onClick={() => setEditingMeta(false)} className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:opacity-70" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{scenario.description || <em style={{ color: 'var(--text-dim)' }}>No description</em>}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>Objective: </span>
              {scenario.objective || <em style={{ color: 'var(--text-dim)' }}>None</em>}
            </p>
            <div className="flex gap-4 mt-3">
              <button onClick={() => setEditingMeta(true)} className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>Edit</button>
              {scenario.objective && (
                <button onClick={() => draftScenarioWithAI()} disabled={aiDrafting} className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70 disabled:opacity-40" style={{ color: '#a78bfa' }}>
                  {aiDrafting ? 'Drafting…' : '✦ Draft structure with AI'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI error */}
      {aiError && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
          {aiError}
        </div>
      )}

      {/* AI draft panel */}
      {aiDraft && (
        <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: '#a78bfa' }}>✦ AI Draft — {aiDraft.sections.length} sections suggested</span>
            <button onClick={() => setAiDraft(null)} className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--text-dim)' }}>Dismiss</button>
          </div>
          <div className="space-y-3">
            {aiDraft.sections.map((sec, si) => (
              <div key={si} className="rounded-lg p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{sec.title}</span>
                  <button onClick={() => applyDraftSection(sec)} className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0 ml-3" style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                    Add Section
                  </button>
                </div>
                {sec.steps.map((step, sti) => (
                  <div key={sti} className="ml-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>{sti + 1}. {step.title}</span>
                    {step.injects.map((inj, ii) => {
                      const pill = injectTypePill(inj.injectType);
                      return (
                        <div key={ii} className="ml-3 mt-0.5 flex gap-1 items-start">
                          <span className="font-mono px-1 rounded shrink-0 text-[9px]" style={{ background: pill.bg, color: pill.color }}>{inj.injectType}</span>
                          <span>{inj.content}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inject suggestions */}
      {injectSuggestions && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: '#60a5fa' }}>✦ Suggested Injects</span>
            <button onClick={() => setInjectSuggestions(null)} className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--text-dim)' }}>Dismiss</button>
          </div>
          {injectSuggestions.injects.map((inj, ii) => {
            const sectionId = scenario.sections.find(s => s.steps.some(st => st.id === injectSuggestions.stepId))?.id ?? '';
            const pill = injectTypePill(inj.injectType);
            return (
              <div key={ii} className="rounded-lg p-3 flex items-start justify-between gap-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: pill.bg, color: pill.color }}>{inj.injectType}</span>
                    {inj.targetRoles.length > 0 && <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>→ {inj.targetRoles.join(', ')}</span>}
                    {inj.consequenceLogic && <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>— {inj.consequenceLogic}</span>}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{inj.content}</p>
                </div>
                <button onClick={() => applyInjectSuggestion(sectionId, injectSuggestions.stepId, inj)} className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>Use</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="label-tag-muted">Sections & Steps</p>
          <button onClick={() => setAddingSection(a => !a)} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-ultra transition-all hover:brightness-110" style={{ background: addingSection ? 'var(--bg-elevated)' : 'var(--gold-accent)', color: addingSection ? 'var(--text-muted)' : '#000', border: addingSection ? '1px solid var(--border-subtle)' : undefined }}>
            {addingSection ? 'Cancel' : '+ Section'}
          </button>
        </div>

        {addingSection && (
          <div className="rounded-xl p-4 mb-4 flex gap-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)' }}>
            <input style={{ ...inputCls, flex: 1 }} placeholder="Section title" value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} />
            <button onClick={addSection} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-ultra" style={{ background: 'var(--gold-accent)', color: '#000' }}>Add</button>
          </div>
        )}

        {scenario.sections.length === 0 && (
          <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>No sections yet. Add one above or use AI draft.</p>
          </div>
        )}

        <div className="space-y-4">
          {scenario.sections.map((section, si) => (
            <div key={section.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {/* Section header */}
              <div className="flex items-center justify-between px-5 py-3" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {si + 1}. {section.title}
                  {aiCreated.has(section.id) && <span className="ml-2 text-[9px] font-black uppercase tracking-widest" style={{ color: '#a78bfa' }}>✦ AI</span>}
                </span>
                <button onClick={() => deleteSection(section.id)} className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'rgb(244,63,94)' }}>Delete</button>
              </div>

              <div className="p-4 space-y-3">
                {section.steps.map((step, sti) => (
                  <div key={step.id} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                    {/* Step header */}
                    <div className="flex items-start justify-between px-4 py-3" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {si + 1}.{sti + 1} {step.title}
                          {aiCreated.has(step.id) && <span className="ml-2 text-[9px] font-black uppercase tracking-widest" style={{ color: '#a78bfa' }}>✦ AI</span>}
                        </p>
                        {step.facilitatorNarrative && (
                          <p className="text-[10px] mt-0.5 italic" style={{ color: 'var(--text-dim)' }}>
                            Narrative: {step.facilitatorNarrative.slice(0, 100)}…
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3 ml-3 shrink-0">
                        <button onClick={() => suggestInjects(step.id, step.title)} disabled={suggestingInjects === step.id} className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70 disabled:opacity-40" style={{ color: '#a78bfa' }}>
                          {suggestingInjects === step.id ? 'Suggesting…' : '✦ Injects'}
                        </button>
                        <button onClick={() => deleteStep(section.id, step.id)} className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'rgb(244,63,94)' }}>Delete</button>
                      </div>
                    </div>

                    {/* Injects */}
                    <div className="p-3 space-y-2">
                      {step.injects.map((inject) => {
                        const pill = injectTypePill(inject.injectType);
                        return (
                          <div key={inject.id} className="flex items-start justify-between rounded-lg px-3 py-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: pill.bg, color: pill.color }}>{inject.injectType}</span>
                                {inject.targetRoles.length > 0 && <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>→ {inject.targetRoles.join(', ')}</span>}
                                {inject.consequenceLogic && <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>| {inject.consequenceLogic}</span>}
                                {aiCreated.has(inject.id) && <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#a78bfa' }}>✦ AI</span>}
                              </div>
                              <p className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>{inject.content}</p>
                            </div>
                            <button onClick={() => deleteInject(section.id, step.id, inject.id)} className="text-xs ml-3 shrink-0 transition-opacity hover:opacity-70" style={{ color: 'rgb(244,63,94)' }}>✕</button>
                          </div>
                        );
                      })}

                      {addingInject === step.id ? (
                        <div className="rounded-lg p-3 space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)' }}>
                          <textarea style={{ ...inputCls, minHeight: '64px', resize: 'vertical' }} placeholder="Inject content *" value={newInject.content} onChange={e => setNewInject(n => ({ ...n, content: e.target.value }))} />
                          <div className="flex gap-2 flex-wrap">
                            <select style={{ ...inputCls, width: 'auto', flex: '0 0 auto' }} value={newInject.injectType} onChange={e => setNewInject(n => ({ ...n, injectType: e.target.value }))}>
                              {INJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <input style={{ ...inputCls, flex: 1 }} placeholder="Target roles (comma-separated)" value={newInject.targetRoles} onChange={e => setNewInject(n => ({ ...n, targetRoles: e.target.value }))} />
                            <input style={{ ...inputCls, flex: 1 }} placeholder="Consequence logic" value={newInject.consequenceLogic} onChange={e => setNewInject(n => ({ ...n, consequenceLogic: e.target.value }))} />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => addInject(section.id, step.id)} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-ultra" style={{ background: 'var(--gold-accent)', color: '#000' }}>Add Inject</button>
                            <button onClick={() => setAddingInject(null)} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-ultra" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setAddingInject(step.id); setNewInject({ content: '', injectType: 'other', targetRoles: '', consequenceLogic: '' }); }} className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--gold-accent)' }}>+ Inject</button>
                      )}
                    </div>
                  </div>
                ))}

                {addingStep === section.id ? (
                  <div className="rounded-lg p-3 space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)' }}>
                    <textarea style={{ ...inputCls, minHeight: '64px', resize: 'vertical' }} placeholder="Step prompt *" value={newStep.title} onChange={e => setNewStep(s => ({ ...s, title: e.target.value }))} />
                    <input style={inputCls} placeholder="Facilitator narrative (read-aloud)" value={newStep.facilitatorNarrative} onChange={e => setNewStep(s => ({ ...s, facilitatorNarrative: e.target.value }))} />
                    <div className="flex gap-2">
                      <button onClick={() => addStep(section.id)} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-ultra" style={{ background: 'var(--gold-accent)', color: '#000' }}>Add Step</button>
                      <button onClick={() => setAddingStep(null)} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-ultra" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setAddingStep(section.id); setNewStep({ title: '', facilitatorNarrative: '' }); }} className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--text-dim)' }}>+ Step</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KB References */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: kbRefs.length > 0 || addingKbRef ? '1px solid var(--border-subtle)' : undefined }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>KB References</p>
          <button onClick={() => setAddingKbRef(a => !a)} className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: addingKbRef ? 'var(--text-dim)' : 'var(--gold-accent)' }}>
            {addingKbRef ? 'Close' : '+ Add Reference'}
          </button>
        </div>

        {kbRefs.length === 0 && !addingKbRef && (
          <div className="px-5 py-6">
            <p className="text-sm italic" style={{ color: 'var(--text-dim)' }}>No KB items linked. Add references to surface relevant content to TTX participants.</p>
          </div>
        )}

        {kbRefs.length > 0 && (
          <div>
            {kbRefs.map((ref, i) => (
              <div key={ref.id} className="flex items-start justify-between px-5 py-3" style={{ borderBottom: i < kbRefs.length - 1 ? '1px solid var(--border-subtle)' : undefined }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ref.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    {ref.stepId ? `Scoped to step ${ref.stepId.slice(0, 8)}…` : 'Scenario-wide'}
                    {ref.topics.length > 0 && ` · ${ref.topics.map(t => t.name).join(', ')}`}
                  </p>
                  {ref.excerpt && <p className="text-[10px] mt-1 line-clamp-2" style={{ color: 'var(--text-dim)' }}>{ref.excerpt}</p>}
                </div>
                <button onClick={() => removeKbRef(ref.id)} className="text-[10px] font-black uppercase tracking-widest ml-3 shrink-0 transition-opacity hover:opacity-70" style={{ color: 'rgb(244,63,94)' }}>Remove</button>
              </div>
            ))}
          </div>
        )}

        {addingKbRef && (
          <div className="p-5 space-y-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Search KB items</label>
              <div className="flex gap-2">
                <input
                  style={{ ...inputCls, flex: 1 }}
                  placeholder="Type to search published KB items…"
                  value={kbRefSearch}
                  onChange={e => { setKbRefSearch(e.target.value); setKbRefSelectedItem(null); searchKbItems(e.target.value); }}
                />
                {kbRefSearching && <span className="text-[10px] self-center" style={{ color: 'var(--text-dim)' }}>Searching…</span>}
              </div>
              {kbRefHits.length > 0 && !kbRefSelectedItem && (
                <div className="rounded-xl mt-1 overflow-hidden max-h-48 overflow-y-auto" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                  {kbRefHits.map(hit => (
                    <button key={hit.itemId} className="w-full text-left px-4 py-2.5 transition-opacity hover:opacity-80" style={{ borderBottom: '1px solid var(--border-subtle)' }} onClick={() => { setKbRefSelectedItem(hit); setKbRefHits([]); setKbRefSearch(hit.title); }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{hit.title}</p>
                      {hit.excerpt && <p className="text-[10px] line-clamp-1" style={{ color: 'var(--text-dim)' }}>{hit.excerpt}</p>}
                    </button>
                  ))}
                </div>
              )}
              {kbRefSelectedItem && (
                <p className="text-[10px] mt-1 font-bold" style={{ color: '#10b981' }}>✓ Selected: {kbRefSelectedItem.title}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Scope (optional)</label>
              <select style={inputCls} value={kbRefScopeStepId} onChange={e => setKbRefScopeStepId(e.target.value)}>
                <option value="">Scenario-wide (shown at all steps)</option>
                {scenario.sections.flatMap((sec, si) =>
                  sec.steps.map((step, sti) => (
                    <option key={step.id} value={step.id}>{si + 1}.{sti + 1} {step.title}</option>
                  ))
                )}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={addKbRef} disabled={!kbRefSelectedItem || kbRefAdding} className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40" style={{ background: 'var(--gold-accent)', color: '#000' }}>
                {kbRefAdding ? 'Adding…' : 'Add'}
              </button>
              <button onClick={() => { setAddingKbRef(false); setKbRefSearch(''); setKbRefHits([]); setKbRefSelectedItem(null); setKbRefScopeStepId(''); }} className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:opacity-70" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
