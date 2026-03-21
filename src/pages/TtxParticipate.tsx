import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  api,
  TtxParticipateView,
  TtxEvent,
  TtxParticipant as TtxParticipantType,
  TtxStep,
  TtxInject
} from '../api/client';
import {
  getSessionToken,
  getStoredHandle,
  setSession as setLearnerSession,
  clearSession
} from '../lib/session';

type Screen = 'otp-request' | 'otp-verify' | 'join' | 'active';

export default function TtxParticipate() {
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
  const [sseConnected, setSseConnected] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [view?.events]);

  useEffect(() => () => { esRef.current?.close(); }, []);

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
        clearSession();
        setScreen('otp-request');
      } else {
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

  function handleSseEvent(data: any) {
    switch (data.type) {
      case 'state':
        setView(prev => prev ? { ...prev, session: data.session, participants: data.participants, events: data.events } : prev);
        break;
      case 'session_started':
      case 'session_ended':
        setView(prev => prev ? { ...prev, session: { ...prev.session, status: data.session.status } } : prev);
        break;
      case 'step_advanced':
        setView(prev => prev ? { 
          ...prev, 
          session: { ...prev.session, currentStepId: data.currentStepId },
          currentStep: data.step,
          events: [...prev.events, data.event]
        } : prev);
        break;
      case 'inject_advanced':
        setView(prev => prev ? { 
          ...prev, 
          events: [...prev.events, data.event]
        } : prev);
        break;
      case 'participant_joined':
        setView(prev => {
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
        setView(prev => {
          if (!prev) return prev;
          const alreadyHas = prev.events.find(e => e.id === data.event.id);
          return alreadyHas ? prev : { ...prev, events: [...prev.events, data.event] };
        });
        break;
    }
  }

  async function submitResponse() {
    if (!responseBody.trim()) return;
    setSubmitting(true);
    try {
      await api.ttx.participate.respond(id!, { eventType: responseType, body: responseBody });
      setResponseBody('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  // --- Auth Screens ---
  if (screen !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 font-sans text-gray-100 p-6">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
             <div className="bg-blue-600 p-3 rounded-lg shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
             </div>
          </div>

          {screen === 'otp-request' && (
            <>
              <h1 className="text-2xl font-bold mb-2 text-center">Five Eyes Gateway</h1>
              <p className="text-gray-500 text-sm text-center mb-8">Authorized Personnel Only. Enter your handle.</p>
              {authError && <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-500 text-xs text-center">{authError}</div>}
              <div className="space-y-4">
                <input 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Learner Handle"
                  value={otpHandle}
                  onChange={e => setOtpHandle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && requestOtp()}
                />
                <button 
                  onClick={requestOtp} 
                  disabled={authBusy || !otpHandle.trim()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {authBusy ? 'Transmitting Request...' : 'Request Access Code'}
                </button>
              </div>
            </>
          )}

          {screen === 'otp-verify' && (
            <>
              <h1 className="text-2xl font-bold mb-2 text-center">Identity Verification</h1>
              <p className="text-gray-500 text-sm text-center mb-8">Code sent to <span className="text-blue-400">{otpHandle}</span></p>
              {authError && <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-500 text-xs text-center">{authError}</div>}
              <div className="space-y-4">
                <input 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center font-mono tracking-[0.5em] text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000000"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                />
                <button 
                  onClick={verifyOtp} 
                  disabled={authBusy || !otpCode.trim()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {authBusy ? 'Authenticating...' : 'Verify Identity'}
                </button>
                <button onClick={() => setScreen('otp-request')} className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors">Abort and return</button>
              </div>
            </>
          )}

          {screen === 'join' && (
            <>
              <h1 className="text-2xl font-bold mb-2 text-center">Station Assignment</h1>
              <p className="text-gray-500 text-sm text-center mb-8">Logged in as <span className="text-blue-400">{getStoredHandle()}</span></p>
              {joinError && <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-500 text-xs text-center">{joinError}</div>}
              <div className="space-y-4">
                <input 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Designated Role (e.g. CEO, Lead Engineer)"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && join()}
                />
                <button 
                  onClick={join} 
                  disabled={joinBusy || !role.trim()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {joinBusy ? 'Deploying to Station...' : 'Join Situation Room'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- Active Session View ---
  if (!view) return <div className="h-screen bg-gray-950 flex items-center justify-center text-gray-500 font-mono text-xs uppercase tracking-widest">Initializing Feed...</div>;

  const { session: sess, scenarioTitle, participants, events, currentStep, myHandle } = view;
  const isActive = sess.status === 'active';
  const isEnded = sess.status === 'complete';
  const myParticipant = participants.find(p => p.handle === myHandle);
  
  // The situation room feed contains Narratives (from steps) and Injects (tactical triggers)
  const feedEvents = events.filter(e => ['narrative_delivered', 'inject_delivered'].includes(e.eventType));
  const myDecisions = events.filter(e => e.actorHandle === myHandle && ['decision', 'action', 'note'].includes(e.eventType));

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden font-sans">
      {/* HUD Header */}
      <header className="h-14 border-b border-gray-800 bg-gray-900/80 backdrop-blur flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
           <div className="bg-blue-600 p-1.5 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v8h8a10.003 10.003 0 00-9.573 9.447L10.33 20" />
              </svg>
           </div>
           <div>
              <h1 className="text-sm font-bold tracking-tight uppercase">{sess.title}</h1>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                 {scenarioTitle}
              </div>
           </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Station Role</div>
              <div className="text-xs text-blue-400 font-bold">{myParticipant?.role || "Observer"}</div>
           </div>
           <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${isActive ? 'bg-green-900/20 text-green-400 border border-green-800/50' : 'bg-gray-800 text-gray-500'}`}>
              {sess.status}
           </div>
           <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 pulse'}`} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Situation Room Feed */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-8 space-y-12 pb-40">
          {feedEvents.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center opacity-40">
               <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
               <p className="text-sm uppercase tracking-widest">Establishing Tactical Link...</p>
               <p className="text-xs mt-2 italic font-mono">Stand by for facilitator input</p>
            </div>
          )}

          {feedEvents.map((ev, idx) => (
            <div key={ev.id} className="max-w-3xl mx-auto scroll-mt-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
               {ev.eventType === 'narrative_delivered' ? (
                 <div className="bg-gray-900/30 border-l-4 border-blue-600 p-8 rounded-r-lg relative">
                    <div className="absolute -left-12 top-2 text-[10px] font-bold text-gray-600 font-mono">0{idx+1}</div>
                    <div className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-4">Situation Room Update</div>
                    <div className="text-lg text-gray-100 leading-relaxed font-serif whitespace-pre-wrap">
                       {ev.body}
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                       <span className="text-[10px] text-gray-600 font-mono">{new Date(ev.occurredAt).toLocaleTimeString()}</span>
                       <div className="h-px bg-gray-800 flex-1 mx-4" />
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest">Alpha-Prime Narrative</span>
                    </div>
                 </div>
               ) : (
                 <div className="bg-orange-950/10 border-l-4 border-orange-600 p-8 rounded-r-lg relative ring-1 ring-orange-900/30">
                    <div className="absolute -left-12 top-2 text-[10px] font-bold text-gray-600 font-mono">0{idx+1}</div>
                    <div className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-4 flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                       </svg>
                       Tactical Inject Received
                    </div>
                    <div className="text-md text-orange-100 leading-relaxed font-mono">
                       {ev.body}
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                       <span className="text-[10px] text-orange-900 font-mono">{new Date(ev.occurredAt).toLocaleTimeString()}</span>
                       <div className="h-px bg-orange-900/20 flex-1 mx-4" />
                       <span className="text-[10px] text-orange-700 uppercase tracking-widest">Flash Directive</span>
                    </div>
                 </div>
               )}
            </div>
          ))}
        </main>

        {/* Input & HUD Side Panel */}
        <aside className="w-96 border-l border-gray-800 flex flex-col shrink-0 bg-gray-900/40 backdrop-blur-xl">
           {/* Decision Input Area */}
           <div className="border-b border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Decision Input</h2>
                 <div className="flex gap-1">
                    {(['decision', 'note', 'action'] as const).map(t => (
                      <button 
                        key={t}
                        onClick={() => setResponseType(t)}
                        className={`text-[9px] uppercase font-bold tracking-tight px-2 py-0.5 rounded border ${
                          responseType === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
              </div>

              <textarea 
                className="w-full h-32 bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none mb-3"
                placeholder={`Draft your ${responseType} statement...`}
                value={responseBody}
                onChange={e => setResponseBody(e.target.value)}
                disabled={!isActive || isEnded}
              />

              <button 
                onClick={submitResponse}
                disabled={submitting || !responseBody.trim() || !isActive || isEnded}
                className="w-full py-3 bg-gray-100 hover:bg-white text-gray-900 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {submitting ? 'Transmitting...' : 'Commit to Record'}
                {!submitting && (
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l7-7-7-7" />
                   </svg>
                )}
              </button>
              
              {!isActive && !isEnded && <p className="mt-3 text-[9px] text-gray-600 text-center uppercase tracking-tighter italic">Input locked until exercise initialization</p>}
              {isEnded && <p className="mt-3 text-[9px] text-orange-600 text-center uppercase tracking-tighter italic font-bold">Exercise Terminated - Record Finalized</p>}
           </div>

           {/* Personal Activity Log */}
           <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between shrink-0">
                 <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">My Comm Logs</h2>
                 <span className="text-[9px] font-mono text-gray-600">{myDecisions.length} entries</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {myDecisions.length === 0 && <div className="text-xs text-gray-700 italic text-center py-8">No personal logs committed.</div>}
                 {myDecisions.slice().reverse().map(ev => (
                   <div key={ev.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg group hover:border-gray-700 transition-colors">
                      <div className="flex justify-between items-center mb-1.5">
                         <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                            ev.eventType === 'decision' ? 'bg-green-900/40 text-green-400' :
                            ev.eventType === 'action' ? 'bg-orange-900/40 text-orange-400' :
                            'bg-gray-800 text-gray-500'
                         }`}>
                            {ev.eventType}
                         </span>
                         <span className="text-[8px] text-gray-600 font-mono">{new Date(ev.occurredAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-snug">{ev.body}</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Intelligence Network */}
           <div className="h-40 border-t border-gray-800 bg-gray-950 p-4 shrink-0">
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Net Topology</h2>
              <div className="flex flex-wrap gap-2 overflow-y-auto max-h-24">
                 {participants.map(p => (
                   <div key={p.id} className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 border border-gray-800 rounded text-[9px] text-gray-400">
                      <div className={`w-1 h-1 rounded-full ${p.handle === myHandle ? 'bg-blue-500' : 'bg-green-500 opacity-40'}`} />
                      {p.handle}
                   </div>
                 ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
