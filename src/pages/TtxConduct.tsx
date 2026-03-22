import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  api,
  TtxExerciseRunDetail,
  TtxStep,
  TtxInject,
  TtxEvent,
  TtxParticipant,
  TtxActionItem
} from '../api/client';
import { getAdminToken, getAdminUsername } from '../lib/adminSession';

export default function TtxConduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<TtxExerciseRunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'narrative' | 'log' | 'actions'>('narrative');

  // Form states
  const [actionItem, setActionItem] = useState({ title: '', body: '', owner: '' });
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const eventLogRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    load();
    return () => esRef.current?.close();
  }, [id]);

  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [run?.events]);

  async function load() {
    try {
      const detail = await api.ttx.sessions.get(id!);
      setRun(detail);
      setSelectedStepId(detail.currentStepId || (detail.snapshot.sections[0]?.steps[0]?.id ?? null));
      connectSse();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function connectSse() {
    esRef.current?.close();
    const es = new EventSource(api.ttx.sessions.streamUrl(id!));
    esRef.current = es;
    es.onopen = () => setSseConnected(true);
    es.onerror = () => setSseConnected(false);
    es.onmessage = (evt) => {
      setSseConnected(true);
      try {
        const data = JSON.parse(evt.data);
        handleSseEvent(data);
      } catch {}
    };
  }

  function handleSseEvent(data: any) {
    switch (data.type) {
      case 'state':
        setRun(data.session);
        break;
      case 'session_started':
      case 'session_ended':
        setRun(prev => prev ? { ...prev, status: data.session.status, startedAt: data.session.startedAt, endedAt: data.session.endedAt } : prev);
        break;
      case 'step_advanced':
      case 'inject_advanced':
        setRun(prev => {
          if (!prev) return prev;
          const alreadyHas = prev.events.find((e: any) => e.id === data.event.id);
          return {
            ...prev,
            currentStepId: data.currentStepId,
            events: alreadyHas ? prev.events : [...prev.events, data.event]
          };
        });
        break;
      case 'participant_joined':
        setRun(prev => {
          if (!prev) return prev;
          const exists = prev.participants.find(x => x.handle === data.participant.handle);
          return {
            ...prev,
            participants: exists
              ? prev.participants.map(x => x.handle === data.participant.handle ? data.participant : x)
              : [...prev.participants, data.participant]
          };
        });
        break;
      case 'event_logged':
        setRun(prev => {
          if (!prev) return prev;
          const alreadyHas = prev.events.find(e => e.id === data.event.id);
          return alreadyHas ? prev : { ...prev, events: [...prev.events, data.event] };
        });
        break;
    }
  }

  async function startRun() {
    setBusy(true);
    try {
      await api.ttx.sessions.start(id!);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function advance(stepId?: string, injectId?: string) {
    setBusy(true);
    try {
      await api.ttx.sessions.advance(id!, { stepId, injectId });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function addActionItem() {
    if (!actionItem.body) return;
    setBusy(true);
    try {
      await api.ttx.sessions.aar.addActionItem(id!, actionItem);
      setActionItem({ title: '', body: '', owner: '' });
      // Reload AAR data or similar if needed, or just let SSE handle events if I log them
      alert('Action item added to AAR catalog.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Initializing Command Center...</div>;
  if (!run) return <div className="p-8 text-red-600">Error: {error || 'Session not found'}</div>;

  const isActive = run.status === 'active';
  const snapshot = run.snapshot;
  const currentStep = snapshot.sections.flatMap(s => s.steps).find(st => st.id === run.currentStepId);
  const selectedStep = snapshot.sections.flatMap(s => s.steps).find(st => st.id === selectedStepId);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100 overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/ttx/sessions" className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{run.title}</h1>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
              <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              {sseConnected ? 'Unified Stream Connected' : 'Stream Disconnected'}
              <span className="mx-1">|</span>
              <span className={isActive ? 'text-green-400' : 'text-yellow-400'}>{run.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isActive && run.status === 'planned' && (
            <button onClick={startRun} disabled={busy} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50">
              Initialize Exercise
            </button>
          )}
          {isActive && (
            <button onClick={() => navigate(`/ttx/sessions/${id}/aar`)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
              Hotwash / AAR
            </button>
          )}
          <div className="text-right">
            <div className="text-xs text-gray-400">Facilitator</div>
            <div className="text-xs font-mono">{getAdminUsername()}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Scenario Hierarchy */}
        <nav className="w-72 border-r border-gray-800 bg-gray-900 overflow-y-auto shrink-0 p-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Scenario Flow</h2>
          <div className="space-y-6">
            {snapshot.sections.map((section, si) => (
              <div key={section.id}>
                <h3 className="text-xs font-semibold text-gray-400 mb-2 truncate" title={section.title}>
                  SEC {si + 1}: {section.title}
                </h3>
                <div className="space-y-1">
                  {section.steps.map((step, sti) => {
                    const isCurrent = step.id === run.currentStepId;
                    const isSelected = step.id === selectedStepId;
                    const wasDelivered = run.events.some(e => e.eventType === 'narrative_delivered' && e.body === step.participantSituationRoom);
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => setSelectedStepId(step.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-all group ${
                          isSelected ? 'bg-gray-800 text-white ring-1 ring-gray-700' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate flex-1">
                            {si + 1}.{sti + 1} {step.title}
                          </span>
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                          )}
                        </div>
                        {wasDelivered && !isCurrent && (
                          <div className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-tighter">Delivered</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Center Pane: Active Controls */}
        <main className="flex-1 bg-gray-950 flex flex-col overflow-hidden">
          {selectedStep ? (
            <>
              <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2 text-blue-400 font-mono text-xs uppercase tracking-widest font-bold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    Narrative Prompter
                  </div>
                  <h2 className="text-3xl font-bold mb-6 text-white leading-tight">
                    {selectedStep.title}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="space-y-4">
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Facilitator Guide (Internal)</div>
                      <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 leading-relaxed italic">
                        {selectedStep.facilitatorNarrative || "No facilitator narrative provided."}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-[10px] uppercase tracking-widest text-blue-500 font-bold">Situation Room Feed (Public)</div>
                      <div className="p-5 bg-blue-900/10 border border-blue-900/30 rounded-lg text-sm text-blue-100 leading-relaxed">
                        {selectedStep.participantSituationRoom || "No public situation room feed provided."}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-12">
                    <button
                      onClick={() => advance(selectedStep.id)}
                      disabled={busy || !isActive}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                      Deliver Narrative to Room
                    </button>
                    <div className="text-xs text-gray-500 max-w-[200px]">
                      This will update all participants' feeds and log the narrative event.
                    </div>
                  </div>

                  {/* Discussion Prompts */}
                  {selectedStep.titles.length > 0 && (
                    <div className="mb-12">
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Discussion Facilitation</div>
                      <ul className="space-y-3">
                        {selectedStep.titles.map((p, idx) => (
                          <li key={idx} className="flex gap-4 p-4 bg-gray-900/30 border border-gray-800 rounded text-sm text-gray-400">
                            <span className="text-blue-500 font-mono font-bold">0{idx+1}</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Step Injects */}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-4">Step Injects (Tactical Comms)</div>
                    <div className="space-y-3">
                      {selectedStep.injects.length === 0 && (
                        <div className="text-sm text-gray-600 italic">No tactical injects for this step.</div>
                      )}
                      {selectedStep.injects.map((inj, idx) => {
                        const wasDelivered = run.events.some(e => e.linkedInjectId === inj.id && e.eventType === 'inject_delivered');
                        return (
                          <div key={inj.id} className={`p-4 border rounded relative group transition-all ${wasDelivered ? 'bg-gray-900/20 border-gray-800 opacity-60' : 'bg-gray-900 border-gray-700 hover:border-orange-900/50'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                                inj.injectType === 'technical' ? 'bg-blue-900/40 text-blue-400' :
                                inj.injectType === 'media' ? 'bg-yellow-900/40 text-yellow-400' :
                                'bg-purple-900/40 text-purple-400'
                              }`}>
                                {inj.injectType}
                              </span>
                              {!wasDelivered && isActive && (
                                <button
                                  onClick={() => advance(undefined, inj.id)}
                                  disabled={busy}
                                  className="text-[10px] font-bold text-orange-500 hover:text-orange-400 uppercase tracking-widest"
                                >
                                  Deploy Inject →
                                </button>
                              )}
                              {wasDelivered && (
                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Deployed</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-300">{inj.content}</p>
                            {inj.targetRoles.length > 0 && (
                              <div className="mt-2 text-[10px] text-gray-500">Targets: {inj.targetRoles.join(', ')}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
              <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Select a step from the flow to begin facilitation.</p>
            </div>
          )}
        </main>

        {/* Right Pane: Intel & Logs */}
        <aside className="w-80 border-l border-gray-800 flex flex-col shrink-0 bg-gray-900/50">
          <div className="flex border-b border-gray-800 shrink-0">
            {(['narrative', 'log', 'actions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-all ${
                  activeTab === tab ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'narrative' && (
              <div className="p-4 flex-1 flex flex-col">
                 <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Participants ({run.participants.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                       {run.participants.length === 0 && <div className="text-xs text-gray-600 italic">No operators on station.</div>}
                       {run.participants.map(p => (
                         <div key={p.id} className="flex items-center justify-between p-2 bg-gray-800/40 rounded border border-gray-800">
                            <span className="text-xs font-medium text-gray-300">{p.handle}</span>
                            <span className="text-[10px] text-gray-500 uppercase">{p.role || "Observer"}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="flex-1 border-t border-gray-800 pt-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Live Response Feed</h4>
                    <div ref={eventLogRef} className="space-y-4 overflow-y-auto h-full pr-2 text-xs">
                       {run.events.filter(e => ['decision', 'note', 'action'].includes(e.eventType)).length === 0 && (
                         <div className="text-gray-600 italic text-xs">Awaiting field intelligence...</div>
                       )}
                       {run.events.filter(e => ['decision', 'note', 'action'].includes(e.eventType)).slice().reverse().map(ev => (
                         <div key={ev.id} className="border-l-2 border-gray-700 pl-3 py-1">
                            <div className="flex justify-between items-center mb-1">
                               <span className="font-bold text-[10px] text-blue-400 uppercase">{ev.actorHandle}</span>
                               <span className="text-[8px] text-gray-600">{new Date(ev.occurredAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-gray-400 leading-snug">{ev.body}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'log' && (
              <div className="flex-1 flex flex-col bg-gray-950/50">
                 <div className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">Master Event Log</div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[10px]">
                    {run.events.map(ev => (
                      <div key={ev.id} className="text-gray-500 break-words">
                        <span className="text-gray-700">[{new Date(ev.occurredAt).toLocaleTimeString()}]</span>{" "}
                        <span className="text-gray-400 underline">{ev.eventType}</span>:{" "}
                        <span className="text-gray-300">{ev.body.slice(0, 100)}{ev.body.length > 100 ? '...' : ''}</span>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="p-4 flex-1 flex flex-col">
                 <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 font-mono">Capture Remediation Item</h4>
                 <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">Item Heading</label>
                      <input 
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white" 
                        placeholder="e.g. Communication Lag"
                        value={actionItem.title}
                        onChange={e => setActionItem(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">Observation / Action Required</label>
                      <textarea 
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white h-32" 
                        placeholder="Describe the weakness or required fix..."
                        value={actionItem.body}
                        onChange={e => setActionItem(prev => ({ ...prev, body: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">Owner (Handle)</label>
                      <input 
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white" 
                        placeholder="e.g. SOC_LEAD"
                        value={actionItem.owner}
                        onChange={e => setActionItem(prev => ({ ...prev, owner: e.target.value }))}
                      />
                    </div>
                    <button 
                      onClick={addActionItem}
                      disabled={busy || !actionItem.body}
                      className="w-full py-2 bg-gray-100 hover:bg-white text-gray-900 rounded font-bold text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                      Commit to Action Catalog
                    </button>
                 </div>

                 <div className="mt-8 border-t border-gray-800 pt-6">
                    <p className="text-[10px] text-gray-500 leading-relaxed italic">
                      Items committed here will appear in the After-Action Report (AAR) for post-exercise tracking.
                    </p>
                 </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
