import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api, TtxScenarioDetail, TtxSection, TtxStep, TtxInject, TtxDraftScenario, TtxDraftInject } from '../api/client';
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

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    load();
  }, [id]);

  async function load() {
    try {
      const s = await api.ttx.scenarios.get(id!);
      setScenario(s);
      setTitle(s.title);
      setDescription(s.description);
      setObjective(s.objective);
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

  if (loading) return <div className="p-6">Loading…</div>;
  if (!scenario) return <div className="p-6 text-red-600">{error ?? 'Not found'}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Link to="/ttx/scenarios" className="text-gray-400 hover:underline text-sm">← Scenarios</Link>
          <h1 className="text-2xl font-bold">{scenario.title}</h1>
        </div>
        <div className="flex gap-3 text-sm">
          <Link to="/ttx/sessions" className="text-blue-600 hover:underline">Sessions</Link>
          <span className="text-gray-400">{getAdminUsername()}</span>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Scenario meta */}
      <div className="border rounded p-4 mb-6">
        {editingMeta ? (
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Title</label>
              <input className="border w-full px-2 py-1 rounded text-sm" value={title}
                onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Description</label>
              <textarea className="border w-full px-2 py-1 rounded text-sm" rows={2} value={description}
                onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Objective</label>
              <textarea className="border w-full px-2 py-1 rounded text-sm" rows={2} value={objective}
                onChange={e => setObjective(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={saveMeta} disabled={saving} className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50">
                Save
              </button>
              <button onClick={() => setEditingMeta(false)} className="px-3 py-1 border rounded text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-1">{scenario.description || <em className="text-gray-400">No description</em>}</p>
            <p className="text-gray-600 text-sm"><span className="font-medium">Objective:</span> {scenario.objective || <em className="text-gray-400">None</em>}</p>
            <div className="flex gap-3 mt-2">
            <button onClick={() => setEditingMeta(true)} className="text-xs text-blue-600 hover:underline">Edit</button>
            {scenario.objective && (
              <button onClick={() => draftScenarioWithAI()} disabled={aiDrafting}
                className="text-xs text-purple-600 hover:underline disabled:opacity-50">
                {aiDrafting ? 'Drafting…' : '✦ Draft structure with AI'}
              </button>
            )}
          </div>
          </div>
        )}
      </div>

      {/* AI error */}
      {aiError && <p className="text-red-500 text-sm mb-4">{aiError}</p>}

      {/* AI draft panel */}
      {aiDraft && (
        <div className="border border-purple-200 rounded p-4 mb-6 bg-purple-50">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-sm text-purple-800">✦ AI Draft — {aiDraft.sections.length} sections suggested</span>
            <button onClick={() => setAiDraft(null)} className="text-xs text-gray-400 hover:underline">Dismiss</button>
          </div>
          <div className="space-y-3">
            {aiDraft.sections.map((sec, si) => (
              <div key={si} className="border border-purple-100 rounded bg-white p-3 text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">{sec.title}</span>
                  <button onClick={() => applyDraftSection(sec)}
                    className="text-xs px-2 py-0.5 bg-purple-600 text-white rounded ml-3 shrink-0">
                    Add section
                  </button>
                </div>
                {sec.steps.map((step, sti) => (
                  <div key={sti} className="ml-3 mt-1 text-gray-600 text-xs">
                    <span className="font-medium text-gray-700">{sti + 1}. {step.title}</span>
                    {step.injects.map((inj, ii) => (
                      <div key={ii} className="ml-3 mt-0.5 flex gap-1 items-start">
                        <span className={`font-mono px-1 rounded shrink-0 ${inj.injectType === 'technical' ? 'bg-blue-100' : inj.injectType === 'media' ? 'bg-yellow-100' : inj.injectType === 'legal' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                          {inj.injectType}
                        </span>
                        <span>{inj.content}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inject suggestions panel */}
      {injectSuggestions && (
        <div className="border border-blue-200 rounded p-4 mb-6 bg-blue-50">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-sm text-blue-800">✦ Suggested injects</span>
            <button onClick={() => setInjectSuggestions(null)} className="text-xs text-gray-400 hover:underline">Dismiss</button>
          </div>
          <div className="space-y-2">
            {injectSuggestions.injects.map((inj, ii) => {
              const sectionId = scenario.sections.flatMap(s => s.steps).find(st => st.id === injectSuggestions.stepId)
                ? scenario.sections.find(s => s.steps.some(st => st.id === injectSuggestions.stepId))!.id
                : '';
              return (
                <div key={ii} className="border rounded bg-white p-3 text-sm flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${inj.injectType === 'technical' ? 'bg-blue-100 text-blue-800' : inj.injectType === 'media' ? 'bg-yellow-100 text-yellow-800' : inj.injectType === 'legal' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                        {inj.injectType}
                      </span>
                      {inj.targetRoles.length > 0 && <span className="text-xs text-gray-400">→ {inj.targetRoles.join(', ')}</span>}
                      {inj.consequenceLogic && <span className="text-xs text-gray-400">— {inj.consequenceLogic}</span>}
                    </div>
                    <p className="text-gray-800">{inj.content}</p>
                  </div>
                  <button onClick={() => applyInjectSuggestion(sectionId, injectSuggestions.stepId, inj)}
                    className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded shrink-0">Use</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">Sections</h2>
        <button onClick={() => setAddingSection(a => !a)} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">
          + Section
        </button>
      </div>

      {addingSection && (
        <div className="border rounded p-3 mb-4 bg-gray-50 flex gap-2">
          <input className="border flex-1 px-2 py-1 rounded text-sm" placeholder="Section title"
            value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} />
          <button onClick={addSection} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Add</button>
          <button onClick={() => setAddingSection(false)} className="px-3 py-1 border rounded text-sm">Cancel</button>
        </div>
      )}

      {scenario.sections.length === 0 && <p className="text-gray-400 text-sm mb-4">No sections yet.</p>}

      {scenario.sections.map((section, si) => (
        <div key={section.id} className="border rounded mb-4">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b">
            <span className="font-medium">
              {si + 1}. {section.title}
              {aiCreated.has(section.id) && <span className="ml-2 text-xs text-purple-500 font-normal">✦ AI</span>}
            </span>
            <button onClick={() => deleteSection(section.id)} className="text-xs text-red-500 hover:underline">Delete</button>
          </div>

          <div className="p-4 space-y-4">
            {section.steps.map((step, sti) => (
              <div key={step.id} className="border rounded">
                <div className="flex justify-between items-start px-3 py-2 bg-gray-50 border-b">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {si + 1}.{sti + 1} {step.title}
                      {aiCreated.has(step.id) && <span className="ml-2 text-xs text-purple-500 font-normal">✦ AI</span>}
                    </p>
                    {step.facilitatorNarrative && (
                      <p className="text-xs text-gray-500 mt-1 italic">Narrative: {step.facilitatorNarrative.slice(0, 100)}…</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-3 shrink-0">
                    <button onClick={() => suggestInjects(step.id, step.title)} disabled={suggestingInjects === step.id}
                      className="text-xs text-purple-600 hover:underline disabled:opacity-50">
                      {suggestingInjects === step.id ? 'Suggesting…' : '✦ Suggest injects'}
                    </button>
                    <button onClick={() => deleteStep(section.id, step.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  {step.injects.map((inject, ii) => (
                    <div key={inject.id} className="flex justify-between items-start border rounded px-3 py-2 text-sm bg-white">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${inject.injectType === 'media' ? 'bg-yellow-100 text-yellow-800' : inject.injectType === 'technical' ? 'bg-blue-100 text-blue-800' : inject.injectType === 'legal' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                            {inject.injectType}
                          </span>
                          {inject.targetRoles.length > 0 && (
                            <span className="text-xs text-gray-400">→ {inject.targetRoles.join(', ')}</span>
                          )}
                          {inject.consequenceLogic && (
                            <span className="text-xs text-gray-400">| {inject.consequenceLogic}</span>
                          )}
                          {aiCreated.has(inject.id) && <span className="text-xs text-purple-400">✦ AI</span>}
                        </div>
                        <p className="text-gray-800 leading-snug">{inject.content}</p>
                      </div>
                      <button onClick={() => deleteInject(section.id, step.id, inject.id)} className="text-xs text-red-400 hover:underline ml-3 shrink-0">✕</button>
                    </div>
                  ))}

                  {addingInject === step.id ? (
                    <div className="border rounded p-3 bg-gray-50 space-y-2">
                      <textarea className="border w-full px-2 py-1 rounded text-sm" rows={2} placeholder="Inject content *"
                        value={newInject.content} onChange={e => setNewInject(n => ({ ...n, content: e.target.value }))} />
                      <div className="flex gap-2">
                        <select className="border px-2 py-1 rounded text-sm" value={newInject.injectType}
                          onChange={e => setNewInject(n => ({ ...n, injectType: e.target.value }))}>
                          {INJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input className="border flex-1 px-2 py-1 rounded text-sm" placeholder="Target roles (comma-separated)"
                          value={newInject.targetRoles} onChange={e => setNewInject(n => ({ ...n, targetRoles: e.target.value }))} />
                        <input className="border flex-1 px-2 py-1 rounded text-sm" placeholder="Consequence logic"
                          value={newInject.consequenceLogic} onChange={e => setNewInject(n => ({ ...n, consequenceLogic: e.target.value }))} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addInject(section.id, step.id)} className="px-2 py-1 bg-green-600 text-white rounded text-sm">Add Inject</button>
                        <button onClick={() => setAddingInject(null)} className="px-2 py-1 border rounded text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setAddingInject(step.id); setNewInject({ content: '', injectType: 'other', targetRoles: '', consequenceLogic: '' }); }}
                      className="text-xs text-blue-600 hover:underline">+ Inject</button>
                  )}
                </div>
              </div>
            ))}

            {addingStep === section.id ? (
              <div className="border rounded p-3 bg-gray-50 space-y-2">
                <textarea className="border w-full px-2 py-1 rounded text-sm" rows={2} placeholder="Step prompt *"
                  value={newStep.title} onChange={e => setNewStep(s => ({ ...s, title: e.target.value }))} />
                <input className="border w-full px-2 py-1 rounded text-sm" placeholder="Facilitator narrative (read-aloud)"
                  value={newStep.facilitatorNarrative} onChange={e => setNewStep(s => ({ ...s, facilitatorNarrative: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={() => addStep(section.id)} className="px-2 py-1 bg-green-600 text-white rounded text-sm">Add Step</button>
                  <button onClick={() => setAddingStep(null)} className="px-2 py-1 border rounded text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setAddingStep(section.id); setNewStep({ title: '', facilitatorNarrative: '' }); }}
                className="text-xs text-blue-600 hover:underline">+ Step</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
