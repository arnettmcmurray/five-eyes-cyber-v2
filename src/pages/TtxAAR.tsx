import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, TtxAARSummary, TtxExport, RubricResult, RubricCategoryResult, CorrectivePriority } from '../api/client';
import { getAdminToken, getAdminUsername } from '../lib/adminSession';

export default function TtxAAR() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exportData, setExportData] = useState<TtxExport | null>(null);
  const [aar, setAar] = useState<TtxAARSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [summary, setSummary] = useState('');
  const [editingAAR, setEditingAAR] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', body: '', owner: '', dueAt: '' });
  const [addingItem, setAddingItem] = useState(false);
  const [rubric, setRubric] = useState<RubricResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return; }
    load();
  }, [id]);

  async function load() {
    try {
      const [exp, aarData] = await Promise.all([
        api.ttx.sessions.export(id!),
        api.ttx.sessions.aar.get(id!)
      ]);
      setExportData(exp);
      setAar(aarData);
      setSummary(aarData.summary || '');
      if (aarData.rubric) setRubric(aarData.rubric);
      if (!aarData.summary) setEditingAAR(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function saveAAR() {
    setSaving(true);
    try {
      await api.ttx.sessions.aar.save(id!, { summary });
      setAar(prev => prev ? { ...prev, summary } : prev);
      setEditingAAR(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function finalizeAAR() {
    if (!confirm('Finalize After-Action Report? This will mark the session as complete.')) return;
    setSaving(true);
    try {
      const saved = await api.ttx.sessions.aar.finalize(id!);
      setExportData(prev => prev ? { ...prev, session: { ...prev.session, status: saved.status } } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function addActionItem() {
    if (!newItem.body) return;
    setSaving(true);
    try {
      const item = await api.ttx.sessions.aar.addActionItem(id!, newItem);
      setAar(prev => prev ? { ...prev, actionItems: [...prev.actionItems, item] } : prev);
      setNewItem({ title: '', body: '', owner: '', dueAt: '' });
      setAddingItem(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function runEvaluation() {
    setEvaluating(true);
    try {
      const result = await api.ttx.sessions.evaluate(id!);
      setRubric(result.rubric);
      setAar(prev => prev ? { ...prev, rubric: result.rubric } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setEvaluating(false);
    }
  }

  async function updateItemStatus(itemId: string, status: string) {
    try {
      const updated = await api.ttx.sessions.aar.updateActionItem(id!, itemId, { status });
      setAar(prev => prev ? { ...prev, actionItems: prev.actionItems.map(x => x.id === itemId ? updated : x) } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-dim)' }}>
      <span className="text-xs font-bold uppercase tracking-widest">Generating Report…</span>
    </div>
  );

  if (!exportData || !aar) return (
    <div className="p-8 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
      {error || 'Session failed to export'}
    </div>
  );

  const session = exportData.session;
  const isFinal = session.status === 'complete';
  const durationMin = session.startedAt && session.endedAt
    ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
    : null;
  const observationCount = exportData.events.filter(e => ['decision', 'action'].includes(e.eventType)).length;
  const timelineEvents = exportData.events.filter(e => ['decision', 'action', 'narrative_delivered', 'inject_delivered'].includes(e.eventType));

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    borderRadius: '0.75rem',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">

      {/* Status bar */}
      <div
        className="h-1 rounded-full"
        style={{ background: isFinal ? '#10b981' : 'var(--gold-accent)' }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/ttx/sessions"
              className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-dim)' }}
            >
              ← Sessions
            </Link>
            <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>|</span>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
              Post-Exercise Documentation
            </span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            After-Action <span style={{ color: 'var(--gold-accent)' }}>Report</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{session.title}</p>
          {session.startedAt && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
              Conducted: {new Date(session.startedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
            style={isFinal
              ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
              : { background: 'rgba(245,158,11,0.12)', color: 'var(--gold-accent)', border: '1px solid rgba(245,158,11,0.3)' }
            }
          >
            {isFinal ? 'Official Record' : 'Draft Report'}
          </span>
          {!isFinal && (
            <button
              onClick={finalizeAAR}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40"
              style={{ background: 'var(--gold-accent)', color: '#000' }}
            >
              Finalize Report
            </button>
          )}
          <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{getAdminUsername()}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'rgb(244,63,94)' }}>
          {error}
        </div>
      )}

      {/* Session Context */}
      {(() => {
        const snap = session.snapshot as Record<string, unknown>;
        const objective = (snap.objective as string | undefined) || '';
        const theme = (snap.signatureTheme as string | undefined) || '';
        const execSummary = (snap.executiveSummary as string | undefined) || '';
        const goals = Array.isArray(snap.goals) ? snap.goals as string[] : [];
        const audience = Array.isArray(snap.targetAudience) ? snap.targetAudience as string[] : [];
        if (!objective && !theme && !execSummary) return null;
        return (
          <section className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="px-6 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Scenario Brief</p>
              {theme && (
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--gold-accent)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  {theme}
                </span>
              )}
            </div>
            <div className="px-6 py-4 space-y-3">
              {objective && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>Exercise Objective</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{objective}</p>
                </div>
              )}
              {execSummary && !objective && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{execSummary}</p>
              )}
              {(goals.length > 0 || audience.length > 0) && (
                <div className="flex flex-wrap gap-4 pt-1">
                  {audience.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-dim)' }}>Target Roles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {audience.map((r, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {goals.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-dim)' }}>Goals</p>
                      <div className="flex flex-wrap gap-1.5">
                        {goals.map((g, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Duration', value: durationMin !== null ? `${durationMin} min` : '—' },
          { label: 'Participants', value: exportData.participants.length },
          { label: 'Observations', value: observationCount },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl p-5 text-center"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <p className="font-display font-black text-2xl mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Rubric Evaluation ── */}
      <section className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Standards-Based Rubric Evaluation</p>
            {rubric && (
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
                Profile: {PROFILE_LABELS[rubric.scenarioProfile] ?? rubric.scenarioProfile} · Rubric {rubric.rubricVersion} · Scored {new Date(rubric.scoredAt).toLocaleDateString()}
              </p>
            )}
          </div>
          {!isFinal && (
            <button
              onClick={runEvaluation}
              disabled={evaluating}
              className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40"
              style={{ background: evaluating ? 'var(--bg-elevated)' : 'var(--gold-accent)', color: evaluating ? 'var(--text-muted)' : '#000', border: evaluating ? '1px solid var(--border-subtle)' : 'none' }}
            >
              {evaluating ? 'Scoring…' : rubric ? 'Re-Score Session' : 'Score This Session'}
            </button>
          )}
        </div>

        {!rubric ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>No evaluation yet</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              Score this session against the Five Eyes TTX rubric to generate a category breakdown, gap analysis, and leadership-ready recommendations.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-8">

            {/* Overall band + score */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p
                    className="font-display font-black text-4xl leading-none"
                    style={{ color: BAND_COLORS[rubric.overallBand].text }}
                  >
                    {rubric.insufficientData ? '—' : `${rubric.overallScore}`}
                  </p>
                  {!rubric.insufficientData && (
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-dim)' }}>/ 100</p>
                  )}
                </div>
                <div>
                  <span
                    className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg inline-block"
                    style={{ background: BAND_COLORS[rubric.overallBand].bg, color: BAND_COLORS[rubric.overallBand].text, border: `1px solid ${BAND_COLORS[rubric.overallBand].border}` }}
                  >
                    {BAND_LABELS[rubric.overallBand]}
                  </span>
                  <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-dim)' }}>
                    {rubric.observationCount} observation{rubric.observationCount !== 1 ? 's' : ''} · {rubric.participantCount} participant{rubric.participantCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {rubric.insufficientData && (
                <div className="rounded-lg px-4 py-2.5 flex-1" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <p className="text-xs font-bold" style={{ color: '#f59e0b' }}>Insufficient session data</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{rubric.operationalRiskNote}</p>
                </div>
              )}
            </div>

            {/* Executive Leadership Summary */}
            {!rubric.insufficientData && rubric.executiveSummary && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--gold-accent)' }}>Leadership Brief</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>— for executive and board review</span>
                </div>
                <div className="p-5 space-y-5">

                  {/* Bottom line callout */}
                  <div className="rounded-lg px-4 py-3" style={{ background: `${BAND_COLORS[rubric.overallBand].bg}`, border: `1px solid ${BAND_COLORS[rubric.overallBand].border}` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: BAND_COLORS[rubric.overallBand].text }}>Bottom Line</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{rubric.leadershipBottomLine}</p>
                  </div>

                  {/* Executive summary + business risk in two cells */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Exercise Summary</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rubric.executiveSummary}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Business Risk Statement</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rubric.businessRiskStatement}</p>
                    </div>
                  </div>

                  {/* Top 3 corrective priorities */}
                  {rubric.correctivePriorities.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Top Corrective Priorities</p>
                      <div className="space-y-2">
                        {rubric.correctivePriorities.map(p => (
                          <CorrectivePriorityRow key={p.rank} priority={p} />
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Category breakdown */}
            {!rubric.insufficientData && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>Category Breakdown</p>
                <div className="space-y-3">
                  {rubric.categories.map(cat => (
                    <RubricCategoryRow key={cat.id} cat={cat} />
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {rubric.strengths.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#10b981' }}>▲ Strengths</p>
                <div className="space-y-2">
                  {rubric.strengths.map((s, i) => (
                    <div key={i} className="flex gap-3 text-xs leading-relaxed px-4 py-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>
                      <p style={{ color: 'var(--text-secondary)' }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Misses */}
            {rubric.misses.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>◆ Concerns</p>
                <div className="space-y-2">
                  {rubric.misses.map((m, i) => (
                    <div key={i} className="flex gap-3 text-xs leading-relaxed px-4 py-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <span style={{ color: '#f59e0b', flexShrink: 0 }}>!</span>
                      <p style={{ color: 'var(--text-secondary)' }}>{m}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Critical gaps */}
            {rubric.criticalGaps.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgb(244,63,94)' }}>▼ Critical Gaps</p>
                <div className="space-y-2">
                  {rubric.criticalGaps.map((g, i) => (
                    <div key={i} className="flex gap-3 text-xs leading-relaxed px-4 py-3 rounded-lg" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.25)' }}>
                      <span style={{ color: 'rgb(244,63,94)', flexShrink: 0 }}>✕</span>
                      <p style={{ color: 'var(--text-secondary)' }}>{g}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scenario-specific findings */}
            {!rubric.insufficientData && (rubric.scenarioSpecificFindings.length > 0 || rubric.criticalMissTriggers.length > 0) && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>
                  Scenario Expectation Pack · <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{rubric.scenarioExpectationPackId}</span>
                </p>
                {rubric.criticalMissTriggers.length > 0 && (
                  <div className="mb-2 space-y-1.5">
                    {rubric.criticalMissTriggers.map((f, i) => (
                      <div key={i} className="flex gap-2.5 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.18)' }}>
                        <span style={{ color: 'rgb(244,63,94)', flexShrink: 0 }}>✗</span>
                        <p style={{ color: 'var(--text-secondary)' }}>{f}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-1.5">
                  {rubric.scenarioSpecificFindings.map((f, i) => {
                    const isGap = f.startsWith('Gap:');
                    return (
                      <div key={i} className="flex gap-2.5 text-xs px-3 py-2 rounded-lg" style={{
                        background: isGap ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)',
                        border: isGap ? '1px solid rgba(245,158,11,0.18)' : '1px solid rgba(16,185,129,0.18)',
                      }}>
                        <span style={{ color: isGap ? '#f59e0b' : '#10b981', flexShrink: 0 }}>{isGap ? '△' : '✓'}</span>
                        <p style={{ color: 'var(--text-secondary)' }}>{f}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Operational risk note */}
            {!rubric.insufficientData && (
              <div className="rounded-xl px-5 py-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>Operational Risk Assessment</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rubric.operationalRiskNote}</p>
              </div>
            )}

            {/* Recommendations: 3-column */}
            {(rubric.recommendedActions.length > 0 || rubric.trainingRecommendations.length > 0 || rubric.policyRecommendations.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RecommendationColumn
                  label="Recommended Actions"
                  accentColor="var(--gold-accent)"
                  items={rubric.recommendedActions}
                />
                <RecommendationColumn
                  label="Training Recommendations"
                  accentColor="#60a5fa"
                  items={rubric.trainingRecommendations}
                />
                <RecommendationColumn
                  label="Policy & Process"
                  accentColor="#a78bfa"
                  items={rubric.policyRecommendations}
                />
              </div>
            )}

            {/* Protocol overlay notice */}
            {rubric.protocolComparisonPending && (
              <div className="rounded-lg px-4 py-3 flex items-start gap-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span className="text-[10px] font-black uppercase tracking-widest shrink-0 mt-0.5 px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-dim)' }}>Coming</span>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  Company-protocol overlay: when your organisation uploads documented procedures, this evaluation will compare actual responses against your specific protocols — not just the baseline best-practice standard. Rubric ID: <span className="font-mono">{rubric.baselineRubricId}</span>
                </p>
              </div>
            )}

          </div>
        )}
      </section>

      {/* Executive Summary */}
      <section className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Executive Summary</p>
          {!isFinal && !editingAAR && (
            <button
              onClick={() => setEditingAAR(true)}
              className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: 'var(--gold-accent)' }}
            >
              Edit
            </button>
          )}
        </div>
        <div className="p-6">
          {editingAAR ? (
            <div className="space-y-4">
              <textarea
                style={{ ...inputStyle, minHeight: '160px', resize: 'vertical' }}
                placeholder="Draft the executive summary of exercise outcomes…"
                value={summary}
                onChange={e => setSummary(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={saveAAR}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40"
                  style={{ background: 'var(--gold-accent)', color: '#000' }}
                >
                  Save Narrative
                </button>
                <button
                  onClick={() => setEditingAAR(false)}
                  className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:opacity-70"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: aar.summary ? 'var(--text-secondary)' : 'var(--text-dim)', fontStyle: aar.summary ? 'normal' : 'italic' }}>
              {aar.summary || 'No narrative summary drafted yet.'}
            </p>
          )}
        </div>
      </section>

      {/* Remediation Action Catalog */}
      <section className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Remediation Action Catalog</p>
          {!isFinal && (
            <button
              onClick={() => setAddingItem(v => !v)}
              className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: addingItem ? 'var(--text-dim)' : 'var(--gold-accent)' }}
            >
              {addingItem ? 'Close' : '+ New Finding'}
            </button>
          )}
        </div>

        {addingItem && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-4"
            style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Finding Heading</label>
              <input style={inputStyle} placeholder="e.g. Identity Management Gap" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Required Action</label>
              <textarea style={{ ...inputStyle, minHeight: '96px', resize: 'vertical' }} placeholder="Detail the remedial steps required…" value={newItem.body} onChange={e => setNewItem(p => ({ ...p, body: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Owner</label>
                <input style={inputStyle} placeholder="e.g. SOC_MANAGER" value={newItem.owner} onChange={e => setNewItem(p => ({ ...p, owner: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Due Date</label>
                <input type="date" style={inputStyle} value={newItem.dueAt} onChange={e => setNewItem(p => ({ ...p, dueAt: e.target.value }))} />
              </div>
            </div>
            <button
              onClick={addActionItem}
              disabled={saving || !newItem.body}
              className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-ultra transition-all hover:brightness-110 disabled:opacity-40"
              style={{ background: 'var(--gold-accent)', color: '#000' }}
            >
              Confirm Finding
            </button>
          </motion.div>
        )}

        {aar.actionItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm italic" style={{ color: 'var(--text-dim)' }}>No remediation items identified.</p>
          </div>
        ) : (
          <div>
            {aar.actionItems.map((item, i) => (
              <div
                key={item.id}
                className="px-6 py-5"
                style={{ borderBottom: i < aar.actionItems.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title || 'Untitled Finding'}</p>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                      <span>Owner: <span style={{ color: 'var(--gold-accent)' }}>{item.owner || 'UNASSIGNED'}</span></span>
                      {item.dueAt && <span>Due: {new Date(item.dueAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={
                        item.status === 'open'
                          ? { background: 'rgba(244,63,94,0.12)', color: 'rgb(244,63,94)' }
                          : item.status === 'retesting'
                            ? { background: 'rgba(245,158,11,0.12)', color: 'var(--gold-accent)' }
                            : { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                      }
                    >
                      {item.status}
                    </span>
                    {!isFinal && item.status !== 'closed' && (
                      <button
                        onClick={() => updateItemStatus(item.id, 'closed')}
                        className="text-[10px] font-bold uppercase tracking-widest transition-colors"
                        style={{ color: 'var(--text-dim)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#10b981')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Participating Roles */}
      {exportData.participants.length > 0 && (
        <section className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="px-6 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Participating Roles</p>
          </div>
          <div className="px-6 py-4 flex flex-wrap gap-3">
            {exportData.participants.map(p => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{p.handle}</span>
                {p.role && (
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-dim)' }}>· {p.role}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tactical Timeline */}
      <section className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Tactical Timeline Snapshot</p>
        </div>
        {timelineEvents.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm italic" style={{ color: 'var(--text-dim)' }}>No timeline events recorded.</p>
          </div>
        ) : (
          <div>
            {timelineEvents.map((ev, i) => (
              <div
                key={ev.id}
                className="flex items-start gap-4 px-6 py-3"
                style={{ borderBottom: i < timelineEvents.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
              >
                <span className="font-mono text-[10px] shrink-0 pt-0.5 w-20" style={{ color: 'var(--text-dim)' }}>
                  {new Date(ev.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                  style={ev.eventType.includes('delivered')
                    ? { background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-dim)' }
                  }
                >
                  {ev.eventType.replace('_delivered', '')}
                </span>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{ev.actorHandle} </span>
                  {ev.body.slice(0, 140)}{ev.body.length > 140 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Export */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `five-eyes-aar-${id}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-dim)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export JSON Intelligence Packet
        </button>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Rubric display constants
// ---------------------------------------------------------------------------

const BAND_LABELS: Record<string, string> = {
  strong:           'Strong',
  acceptable:       'Acceptable',
  needs_attention:  'Needs Attention',
  critical_gaps:    'Critical Gaps',
};

const BAND_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  strong:          { text: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.30)' },
  acceptable:      { text: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.30)' },
  needs_attention: { text: '#f97316', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.30)' },
  critical_gaps:   { text: 'rgb(244,63,94)', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.30)' },
};

const CAT_BAND_COLORS: Record<string, { text: string; bg: string }> = {
  pass:          { text: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  concern:       { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  critical_miss: { text: 'rgb(244,63,94)', bg: 'rgba(244,63,94,0.12)' },
};

const CAT_BAND_LABELS: Record<string, string> = {
  pass:          'Pass',
  concern:       'Concern',
  critical_miss: 'Critical Miss',
};

const PROFILE_LABELS: Record<string, string> = {
  bec:          'BEC / Payment Fraud',
  ransomware:   'Ransomware / Operational',
  ceo_fraud:    'CEO Fraud / Impersonation',
  supply_chain: 'Supply Chain / Cargo',
  general:      'General Threat',
};

// ---------------------------------------------------------------------------
// Rubric sub-components
// ---------------------------------------------------------------------------

function RubricCategoryRow({ cat }: { cat: RubricCategoryResult }) {
  const bandStyle = CAT_BAND_COLORS[cat.band] ?? CAT_BAND_COLORS.concern;
  const [expanded, setExpanded] = useState(false);
  const hasDetail = cat.evidence.length > 0 || cat.gaps.length > 0;

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => hasDetail && setExpanded(v => !v)}
        style={{ cursor: hasDetail ? 'pointer' : 'default' }}
      >
        {/* Band pill */}
        <span
          className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 w-24 text-center"
          style={{ background: bandStyle.bg, color: bandStyle.text }}
        >
          {CAT_BAND_LABELS[cat.band]}
        </span>

        {/* Category name */}
        <span className="text-xs font-semibold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
          {cat.label}
        </span>

        {/* Score bar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-24 h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${cat.rawScore}%`, background: bandStyle.text }}
            />
          </div>
          <span className="text-[10px] font-bold w-8 text-right" style={{ color: bandStyle.text }}>
            {cat.rawScore}
          </span>
        </div>

        {/* Weight */}
        <span className="text-[9px] w-12 text-right shrink-0" style={{ color: 'var(--text-dim)' }}>
          ×{(cat.weight * 100).toFixed(0)}%
        </span>

        {hasDetail && (
          <span className="text-[10px] shrink-0" style={{ color: 'var(--text-dim)' }}>
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </button>

      {expanded && hasDetail && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="px-4 pb-4 space-y-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          {cat.evidence.map((e, i) => (
            <p key={`e-${i}`} className="text-xs leading-relaxed pt-2" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: '#10b981' }}>✓ </span>{e}
            </p>
          ))}
          {cat.gaps.map((g, i) => (
            <p key={`g-${i}`} className="text-xs leading-relaxed pt-2" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: bandStyle.text }}>▸ </span>{g}
            </p>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function CorrectivePriorityRow({ priority }: { priority: CorrectivePriority }) {
  const rankColors: Record<number, string> = { 1: 'rgb(244,63,94)', 2: '#f59e0b', 3: 'var(--gold-accent)' };
  const color = rankColors[priority.rank] ?? 'var(--text-muted)';
  return (
    <div className="flex gap-3 items-start px-4 py-3 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <span className="text-xs font-black w-5 shrink-0 text-center mt-0.5" style={{ color }}>{priority.rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{priority.categoryLabel}</span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-dim)' }}>Owner: {priority.ownerFunction}</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{priority.action}</p>
      </div>
    </div>
  );
}

function RecommendationColumn({ label, accentColor, items }: { label: string; accentColor: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: accentColor }}>{label}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <p key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: accentColor }}>›</span> {item}
          </p>
        ))}
      </div>
    </div>
  );
}
