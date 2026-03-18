import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api, TtxParticipateView, TtxEvent, TtxParticipant as TtxParticipantType } from '../api/client';
import { getSessionToken, getStoredHandle, setSession as setLearnerSession, clearSession } from '../lib/session';

type Screen = 'otp-request' | 'otp-verify' | 'join' | 'active';

export default function TtxParticipant() {
  const { id } = useParams<{ id: string }>();

  const [screen, setScreen] = useState<Screen>(() =>
    getSessionToken() ? 'join' : 'otp-request'
  );

  // OTP auth
  const [otpHandle, setOtpHandle] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Join
  const [role, setRole] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Session view
  const [view, setView] = useState<TtxParticipateView | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Response form
  const [responseType, setResponseType] = useState<'decision' | 'note' | 'action'>('decision');
  const [responseBody, setResponseBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [sseConnected, setSseConnected] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [view?.events]);

  useEffect(() => () => { esRef.current?.close(); }, []);

  // On mount, if we already have a token, try to load view directly
  useEffect(() => {
    if (screen === 'join') checkAlreadyJoined();
  }, []);

  async function checkAlreadyJoined() {
    try {
      const v = await api.ttx.participate.view(id!);
      setView(v);
      connectSse();
      setScreen('active');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('Invalid or expired') || msg.includes('Unauthorized')) {
        // Token expired — force re-auth
        clearSession();
        setScreen('otp-request');
      } else {
        // Not a participant yet → show join form
        setScreen('join');
      }
    }
  }

  async function requestOtp() {
    if (!otpHandle.trim()) return;
    setAuthBusy(true);
    setAuthError(null);
    try {
      await api.auth.requestOtp(otpHandle.trim());
      setScreen('otp-verify');
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : String(e));
    } finally {
      setAuthBusy(false);
    }
  }

  async function verifyOtp() {
    if (!otpCode.trim()) return;
    setAuthBusy(true);
    setAuthError(null);
    try {
      const result = await api.auth.verifyOtp(otpHandle.trim(), otpCode.trim());
      setLearnerSession(result.token, result.handle);
      await checkAlreadyJoined();
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : String(e));
    } finally {
      setAuthBusy(false);
    }
  }

  async function join() {
    if (!role.trim()) { setJoinError('Role is required.'); return; }
    setJoinBusy(true);
    setJoinError(null);
    try {
      await api.ttx.participate.join(id!, role.trim());
      const v = await api.ttx.participate.view(id!);
      setView(v);
      connectSse();
      setScreen('active');
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : String(e));
    } finally {
      setJoinBusy(false);
    }
  }

  function connectSse() {
    esRef.current?.close();
    const es = new EventSource(api.ttx.participate.streamUrl(id!));
    esRef.current = es;
    es.onopen = () => setSseConnected(true);
    es.onerror = () => setSseConnected(false);
    es.onmessage = (evt) => {
      setSseConnected(true);
      try { handleSseEvent(JSON.parse(evt.data)); } catch {}
    };
  }

  function handleSseEvent(data: Record<string, unknown>) {
    switch (data.type) {
      case 'state': {
        const s = data.session as TtxParticipateView['session'] & {
          participants: TtxParticipateView['participants'];
          events: TtxParticipateView['events'];
        };
        setView(prev => prev ? {
          ...prev,
          session: { ...prev.session, ...s },
          participants: s.participants,
          events: s.events,
        } : prev);
        break;
      }
      case 'session_started':
      case 'session_ended': {
        const s = data.session as TtxParticipateView['session'];
        setView(prev => prev ? { ...prev, session: { ...prev.session, ...s } } : prev);
        break;
      }
      case 'inject_advanced': {
        const { currentInjectId, inject } = data as {
          currentInjectId: string;
          inject: TtxParticipateView['currentInject'];
        };
        setView(prev => prev ? {
          ...prev,
          session: { ...prev.session, currentInjectId },
          currentInject: inject,
        } : prev);
        break;
      }
      case 'participant_joined': {
        const p = data.participant as TtxParticipantType;
        setView(prev => {
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
        setView(prev => {
          if (!prev) return prev;
          const alreadyHas = prev.events.find(e => e.id === ev.id);
          return alreadyHas ? prev : { ...prev, events: [...prev.events, ev] };
        });
        break;
      }
    }
  }

  async function submitResponse() {
    if (!responseBody.trim()) return;
    setSubmitting(true);
    try {
      const ev = await api.ttx.participate.respond(id!, { eventType: responseType, body: responseBody });
      setRecentIds(p => [ev.id, ...p]);
      setResponseBody('');
      // SSE event_logged will update events list
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  // --- OTP request screen ---
  if (screen === 'otp-request') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border rounded-lg p-8 w-full max-w-sm shadow-sm">
          <h1 className="text-xl font-bold mb-1">Join TTX Session</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your learner handle to receive a one-time code.</p>
          {authError && <p className="text-red-600 text-sm mb-3">{authError}</p>}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Handle *</label>
              <input className="border w-full px-3 py-2 rounded text-sm" placeholder="e.g. alice"
                value={otpHandle} onChange={e => setOtpHandle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && requestOtp()} />
            </div>
            <button onClick={requestOtp} disabled={authBusy || !otpHandle.trim()}
              className="w-full py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50">
              {authBusy ? 'Sending…' : 'Send Code'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- OTP verify screen ---
  if (screen === 'otp-verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border rounded-lg p-8 w-full max-w-sm shadow-sm">
          <h1 className="text-xl font-bold mb-1">Enter Code</h1>
          <p className="text-sm text-gray-500 mb-6">Code sent to <strong>{otpHandle}</strong>. Enter it below.</p>
          {authError && <p className="text-red-600 text-sm mb-3">{authError}</p>}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">6-digit code *</label>
              <input className="border w-full px-3 py-2 rounded text-sm font-mono tracking-widest"
                placeholder="000000" maxLength={6}
                value={otpCode} onChange={e => setOtpCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()} />
            </div>
            <button onClick={verifyOtp} disabled={authBusy || !otpCode.trim()}
              className="w-full py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50">
              {authBusy ? 'Verifying…' : 'Verify'}
            </button>
            <button onClick={() => { setScreen('otp-request'); setAuthError(null); setOtpCode(''); }}
              className="w-full py-1 text-sm text-gray-500 hover:underline">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Role / join screen ---
  if (screen === 'join') {
    const handle = getStoredHandle() ?? '';
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border rounded-lg p-8 w-full max-w-sm shadow-sm">
          <h1 className="text-xl font-bold mb-1">Join Session</h1>
          <p className="text-sm text-gray-500 mb-6">Joining as <strong>{handle}</strong>. Enter the role you are playing in this exercise.</p>
          {joinError && <p className="text-red-600 text-sm mb-3">{joinError}</p>}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Role *</label>
              <input className="border w-full px-3 py-2 rounded text-sm" placeholder="e.g. CEO, Legal Counsel, Security Lead"
                value={role} onChange={e => setRole(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && join()} />
            </div>
            <button onClick={join} disabled={joinBusy}
              className="w-full py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50">
              {joinBusy ? 'Joining…' : 'Join Session'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Active session view ---
  if (!view) return <div className="p-6">Loading…</div>;

  const { session: sess, scenarioTitle, participants, events, currentInject, myHandle } = view;
  const isActive = sess.status === 'active';
  const isEnded = sess.status === 'ended';
  const myRole = participants.find(p => p.handle === myHandle)?.role ?? '';
  const myEvents = events.filter(e => e.actorHandle === myHandle && e.eventType !== 'inject_delivered');

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">{sess.title}</h1>
          <p className="text-sm text-gray-500">{scenarioTitle} · {myHandle} — <span className="font-medium">{myRole}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-mono ${isActive ? 'bg-green-100 text-green-800' : isEnded ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'}`}>
            {sess.status}
          </span>
          <span
            title={sseConnected ? 'Live' : 'Click to reconnect'}
            onClick={() => { if (!sseConnected) connectSse(); }}
            className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-400' : 'bg-yellow-400 animate-pulse cursor-pointer'}`} />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {sess.status === 'planned' && (
        <div className="border rounded p-6 text-center text-gray-500 mb-4">
          <p className="text-lg">Waiting for session to start…</p>
          <p className="text-sm mt-1">The facilitator will start the session shortly.</p>
        </div>
      )}

      {isActive && currentInject && (
        <div className="border-2 border-blue-300 rounded p-4 bg-blue-50 mb-4">
          <p className="text-xs font-medium text-blue-500 mb-2">CURRENT INJECT</p>
          <p className="text-base font-medium mb-2">{currentInject.body}</p>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="bg-white border px-1 rounded">{currentInject.injectType}</span>
            {currentInject.targetRoles.length > 0 && (
              <span className={currentInject.targetRoles.includes(myRole) ? 'font-bold text-blue-600' : ''}>
                → {currentInject.targetRoles.join(', ')}
                {currentInject.targetRoles.includes(myRole) && ' (you)'}
              </span>
            )}
            {currentInject.suggestedTimingMinutes && <span>{currentInject.suggestedTimingMinutes} min</span>}
          </div>
        </div>
      )}

      {isActive && !currentInject && (
        <div className="border rounded p-4 bg-gray-50 text-center text-gray-500 mb-4 text-sm">
          {events.some(e => e.eventType === 'inject_delivered')
            ? 'Waiting for next inject from facilitator…'
            : 'Waiting for facilitator to deliver first inject…'}
        </div>
      )}

      {isActive && (
        <div className="border rounded p-4 mb-4">
          <h3 className="font-medium text-sm mb-3">Submit Response</h3>
          <div className="flex gap-2 mb-2">
            {(['decision', 'note', 'action'] as const).map(t => (
              <button key={t} onClick={() => setResponseType(t)}
                className={`px-2 py-1 rounded text-xs ${responseType === t ? 'bg-blue-600 text-white' : 'border text-gray-600'}`}>
                {t}
              </button>
            ))}
          </div>
          <textarea className="border w-full px-2 py-1 rounded text-sm mb-2" rows={3}
            placeholder={`Enter your ${responseType}…`}
            value={responseBody} onChange={e => setResponseBody(e.target.value)} />
          {currentInject && (
            <p className="text-xs text-gray-400 mb-2">Linked to: {currentInject.body.slice(0, 60)}…</p>
          )}
          <button onClick={submitResponse} disabled={submitting || !responseBody.trim()}
            className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      )}

      {myEvents.length > 0 && (
        <div className="border rounded mb-4">
          <div className="px-4 py-2 border-b bg-gray-50 text-sm font-medium">My Responses ({myEvents.length})</div>
          <div className="divide-y text-sm max-h-48 overflow-y-auto">
            {myEvents.map(ev => (
              <div key={ev.id} className="px-4 py-2">
                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                  <span className={`font-mono px-1 rounded ${ev.eventType === 'decision' ? 'bg-green-100 text-green-700' : ev.eventType === 'action' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}>
                    {ev.eventType}
                  </span>
                  <span>{new Date(ev.occurredAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-700">{ev.body}</p>
                {recentIds.includes(ev.id) && <span className="text-xs text-green-600">submitted</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded">
        <div className="px-4 py-2 border-b bg-gray-50 text-sm font-medium">
          Session Log ({events.length})
        </div>
        <div ref={logRef} className="divide-y text-xs max-h-64 overflow-y-auto">
          {events.length === 0 && <p className="p-3 text-gray-400">No activity yet.</p>}
          {events.map(ev => (
            <div key={ev.id} className={`flex gap-2 px-4 py-2 ${ev.actorHandle === myHandle ? 'bg-blue-50' : ''}`}>
              <span className="text-gray-300 w-20 shrink-0">{new Date(ev.occurredAt).toLocaleTimeString()}</span>
              <span className={`font-mono px-1 rounded shrink-0 ${ev.eventType === 'inject_delivered' ? 'bg-blue-100 text-blue-700' : ev.eventType === 'decision' ? 'bg-green-100 text-green-700' : ev.eventType === 'action' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}>
                {ev.eventType}
              </span>
              <span className="font-medium">{ev.actorHandle}</span>
              <span className="text-gray-600 flex-1">{ev.body}</span>
            </div>
          ))}
        </div>
      </div>

      {isEnded && (
        <div className="mt-6 p-4 border rounded bg-gray-50 text-center text-gray-600">
          <p className="font-medium">Session has ended.</p>
          <p className="text-sm mt-1">Thank you for participating. The facilitator will prepare the after-action review.</p>
        </div>
      )}
    </div>
  );
}
