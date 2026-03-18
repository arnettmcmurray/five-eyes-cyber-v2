import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, TtxSessionDetail, TtxScenarioDetail, TtxInject, TtxEvent, TtxParticipant } from '../api/client';
import { getAdminToken, getAdminUsername } from '../lib/adminSession';

export default function TtxConsole() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<TtxSessionDetail | null>(null);
  const [scenario, setScenario] = useState<TtxScenarioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Join participant form
  const [joinHandle, setJoinHandle] = useState('');
  const [joinRole, setJoinRole] = useState('');

  // Log event form
  const [eventType, setEventType] = useState<'decision' | 'note' | 'action'>('decision');
  const [eventActor, setEventActor] = useState('');
  const [eventBody, setEventBody] = useState('');
  const [eventLinkedInject, setEventLinkedInject] = useState('');

  const [sseConnected, setSseConnected] = useState(false);
  const eventLogRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    load();
    return () => esRef.current?.close();
  }, [id]);

  useEffect(() => {
    // Auto-scroll event log
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [session?.events]);

  async function load() {
    try {
      const s = await api.ttx.sessions.get(id!);
      setSession(s);
      const sc = await api.ttx.scenarios.get(s.scenarioId);
      setScenario(sc);
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

  function handleSseEvent(data: Record<string, unknown>) {
    switch (data.type) {
      case 'state': {
        const s = data.session as TtxSessionDetail;
        setSession(prev => prev ? { ...prev, ...s, participants: s.participants, events: s.events } : s);
        break;
      }
      case 'session_started':
      case 'session_ended': {
        const s = data.session as TtxSessionDetail;
        setSession(prev => prev ? { ...prev, ...s } : prev);
        break;
      }
      case 'inject_advanced': {
        const { currentInjectId, event: ev } = data as { currentInjectId: string; event: TtxEvent };
        setSession(prev => {
          if (!prev) return prev;
          const alreadyHas = prev.events.find(e => e.id === ev.id);
          return {
            ...prev,
            currentInjectId,
            events: alreadyHas ? prev.events : [...prev.events, ev],
          };
        });
        break;
      }
      case 'participant_joined': {
        const p = data.participant as TtxParticipant;
        setSession(prev => {
          if (!prev) return prev;
          const exists = prev.participants.find(x => x.handle === p.handle);
          return {
            ...prev,
            participants: exists
              ? prev.participants.map(x => x.handle === p.handle ? p : x)
              : [...prev.participants, p],
          };
        });
        break;
      }
      case 'event_logged': {
        const ev = data.event as TtxEvent;
        setSession(prev => {
          if (!prev) return prev;
          const alreadyHas = prev.events.find(e => e.id === ev.id);
          return alreadyHas ? prev : { ...prev, events: [...prev.events, ev] };
        });
        break;
      }
    }
  }

  async function startSession() {
    setBusy(true);
    try {
      await api.ttx.sessions.start(id!);
      // SSE session_started will update status
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function endSession() {
    if (!confirm('End this session? This cannot be undone.')) return;
    setBusy(true);
    try {
      await api.ttx.sessions.end(id!);
      // SSE session_ended will update status
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function advanceInject(inject: TtxInject) {
    setBusy(true);
    try {
      await api.ttx.sessions.advance(id!, inject.id);
      // SSE inject_advanced will update currentInjectId and events
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function joinParticipant() {
    if (!joinHandle) return;
    setBusy(true);
    try {
      await api.ttx.sessions.join(id!, joinHandle, joinRole);
      setJoinHandle('');
      setJoinRole('');
      // SSE participant_joined will update participants list
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function logEvent() {
    if (!eventActor || !eventBody) return;
    setBusy(true);
    try {
      await api.ttx.sessions.submitEvent(id!, {
        eventType,
        actorHandle: eventActor,
        body: eventBody,
        linkedInjectId: eventLinkedInject || undefined,
      });
      setEventBody('');
      // SSE event_logged will update events list
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // Flatten all injects in scenario order for the inject panel
  const allInjects: Array<{ inject: TtxInject; stepPrompt: string; sectionTitle: string }> = [];
  if (scenario) {
    for (const section of scenario.sections) {
      for (const step of section.steps) {
        for (const inject of step.injects) {
          allInjects.push({ inject, stepPrompt: step.prompt, sectionTitle: section.title });
        }
      }
    }
  }

  const currentInject = allInjects.find(x => x.inject.id === session?.currentInjectId);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!session) return <div className="p-6 text-red-600">{error ?? 'Not found'}</div>;

  const isActive = session.status === 'active';
  const isEnded = session.status === 'ended';

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Link to="/ttx/sessions" className="text-gray-400 hover:underline text-sm">← Sessions</Link>
          <h1 className="text-xl font-bold">{session.title}</h1>
          <span className={`px-2 py-0.5 rounded text-xs font-mono ${isActive ? 'bg-green-100 text-green-800' : isEnded ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'}`}>
            {session.status}
          </span>
          <span
            title={sseConnected ? 'Live' : 'Click to reconnect'}
            onClick={() => { if (!sseConnected) connectSse(); }}
            className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-400' : 'bg-yellow-400 animate-pulse cursor-pointer'}`} />
        </div>
        <div className="flex gap-3 text-sm items-center">
          {isEnded && (
            <Link to={`/ttx/sessions/${id}/aar`} className="px-3 py-1 bg-blue-600 text-white rounded">
              View AAR
            </Link>
          )}
          {!isActive && !isEnded && (
            <button onClick={startSession} disabled={busy} className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50">
              Start Session
            </button>
          )}
          {isActive && (
            <button onClick={endSession} disabled={busy} className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50">
              End Session
            </button>
          )}
          <span className="text-gray-400">{getAdminUsername()}</span>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* Participant join URL */}
      {!isEnded && (
        <div className="flex items-center gap-2 mb-4 border rounded px-3 py-2 bg-gray-50 text-sm">
          <span className="text-gray-500 shrink-0">Participant URL:</span>
          <a
            href={`${window.location.origin}/ttx/sessions/${id}/participate`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-blue-600 hover:underline flex-1 truncate"
          >
            {window.location.origin}/ttx/sessions/{id}/participate
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/ttx/sessions/${id}/participate`)}
            className="text-xs text-gray-500 hover:text-blue-600 shrink-0 border rounded px-2 py-0.5">
            Copy
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* Left: inject delivery */}
        <div className="col-span-2 space-y-4">

          {/* Current inject */}
          {currentInject && (
            <div className="border-2 border-blue-300 rounded p-4 bg-blue-50">
              <p className="text-xs text-blue-500 mb-1 font-medium">CURRENT INJECT — {currentInject.sectionTitle}</p>
              <p className="text-xs text-gray-500 mb-2 italic">{currentInject.stepPrompt}</p>
              <p className="font-medium">{currentInject.inject.body}</p>
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <span className="bg-white border px-1 rounded">{currentInject.inject.injectType}</span>
                {currentInject.inject.targetRoles.length > 0 && <span>→ {currentInject.inject.targetRoles.join(', ')}</span>}
                {currentInject.inject.suggestedTimingMinutes && <span>{currentInject.inject.suggestedTimingMinutes} min</span>}
              </div>
            </div>
          )}

          {/* Inject list */}
          <div className="border rounded">
            <div className="px-4 py-2 border-b bg-gray-50 text-sm font-medium">
              Injects ({allInjects.length})
            </div>
            <div className="max-h-64 overflow-y-auto divide-y text-sm">
              {allInjects.length === 0 && (
                <p className="p-3 text-gray-400">No injects in this scenario.</p>
              )}
              {allInjects.map(({ inject, sectionTitle, stepPrompt }) => {
                const isCurrent = inject.id === session.currentInjectId;
                const wasDelivered = session.events.some(e => e.linkedInjectId === inject.id && e.eventType === 'inject_delivered');
                return (
                  <div key={inject.id} className={`flex justify-between items-start px-3 py-2 ${isCurrent ? 'bg-blue-50' : wasDelivered ? 'bg-gray-50 opacity-60' : ''}`}>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">{sectionTitle}</p>
                      <p className="line-clamp-2">{inject.body}</p>
                      <span className="text-xs font-mono bg-gray-100 px-1 rounded">{inject.injectType}</span>
                    </div>
                    {isActive && (
                      <button
                        onClick={() => advanceInject(inject)}
                        disabled={busy || isCurrent}
                        className="ml-3 px-2 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-40 shrink-0"
                      >
                        {isCurrent ? 'Active' : 'Deliver'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Log event */}
          {isActive && (
            <div className="border rounded p-4">
              <h3 className="font-medium text-sm mb-3">Log Event</h3>
              <div className="flex gap-2 mb-2">
                {(['decision', 'note', 'action'] as const).map(t => (
                  <button key={t} onClick={() => setEventType(t)}
                    className={`px-2 py-1 rounded text-xs ${eventType === t ? 'bg-blue-600 text-white' : 'border text-gray-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-2">
                <input className="border flex-1 px-2 py-1 rounded text-sm" placeholder="Actor handle"
                  value={eventActor} onChange={e => setEventActor(e.target.value)} />
                <select className="border px-2 py-1 rounded text-sm" value={eventLinkedInject}
                  onChange={e => setEventLinkedInject(e.target.value)}>
                  <option value="">Link inject (opt)</option>
                  {allInjects.map(({ inject }) => (
                    <option key={inject.id} value={inject.id}>{inject.body.slice(0, 50)}</option>
                  ))}
                </select>
              </div>
              <textarea className="border w-full px-2 py-1 rounded text-sm mb-2" rows={2} placeholder="Event body *"
                value={eventBody} onChange={e => setEventBody(e.target.value)} />
              <button onClick={logEvent} disabled={busy || !eventActor || !eventBody}
                className="px-3 py-1 bg-gray-800 text-white rounded text-sm disabled:opacity-50"
                title={!eventActor ? 'Enter actor handle' : !eventBody ? 'Enter event body' : ''}>
                {busy ? '…' : 'Log event'}
              </button>
            </div>
          )}
        </div>

        {/* Right: participants + event log */}
        <div className="space-y-4">
          {/* Participants */}
          <div className="border rounded">
            <div className="px-3 py-2 border-b bg-gray-50 text-sm font-medium">
              Participants ({session.participants.length})
            </div>
            {!isEnded && (
              <div className="px-3 py-2 border-b flex gap-1">
                <input className="border flex-1 px-1 py-0.5 rounded text-xs" placeholder="Handle"
                  value={joinHandle} onChange={e => setJoinHandle(e.target.value)} />
                <input className="border w-24 px-1 py-0.5 rounded text-xs" placeholder="Role"
                  value={joinRole} onChange={e => setJoinRole(e.target.value)} />
                <button onClick={joinParticipant} disabled={busy || !joinHandle}
                  className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs disabled:opacity-50">
                  Join
                </button>
              </div>
            )}
            <div className="divide-y text-sm max-h-40 overflow-y-auto">
              {session.participants.length === 0 && <p className="p-2 text-gray-400 text-xs">None yet.</p>}
              {session.participants.map(p => (
                <div key={p.id} className="flex justify-between px-3 py-1.5 text-xs">
                  <span className="font-medium">{p.handle}</span>
                  <span className="text-gray-500">{p.role || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Event log */}
          <div className="border rounded flex flex-col" style={{ maxHeight: '400px' }}>
            <div className="px-3 py-2 border-b bg-gray-50 text-sm font-medium shrink-0">
              Event Log ({session.events.length})
            </div>
            <div ref={eventLogRef} className="overflow-y-auto divide-y text-xs flex-1">
              {session.events.length === 0 && <p className="p-2 text-gray-400">No events yet.</p>}
              {session.events.map(ev => (
                <div key={ev.id} className="px-3 py-2">
                  <div className="flex justify-between mb-0.5">
                    <span className={`font-mono px-1 rounded text-xs ${ev.eventType === 'inject_delivered' ? 'bg-blue-100 text-blue-700' : ev.eventType === 'decision' ? 'bg-green-100 text-green-700' : ev.eventType === 'action' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}>
                      {ev.eventType}
                    </span>
                    <span className="text-gray-400">{ev.actorHandle}</span>
                  </div>
                  <p className="text-gray-700 leading-snug">{ev.body}</p>
                  <p className="text-gray-300 mt-0.5">{new Date(ev.occurredAt).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
