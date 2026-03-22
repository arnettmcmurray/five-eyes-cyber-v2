import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { eq, asc, count, sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import {
  ttxScenarios,
  ttxExerciseRuns,
  ttxRunParticipants,
  ttxRunEvents,
  ttxActionItems,
  ttxInjects,
  ttxScenarioSections,
  ttxScenarioSteps,
} from '../../db/schema/ttx.js';
import { adminUsers } from '../../db/schema/admin-auth.js';
import { addClient, broadcast } from '../../lib/ttx-sse.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router();
type AdminReq = Request & { adminUsername: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getSession(id: string) {
  const [session] = await db.select().from(ttxExerciseRuns).where(eq(ttxExerciseRuns.id, id)).limit(1);
  return session ?? null;
}

async function getSessionDetail(id: string) {
  const session = await getSession(id);
  if (!session) return null;
  const [participants, events] = await Promise.all([
    db.select().from(ttxRunParticipants).where(eq(ttxRunParticipants.runId, id)).orderBy(asc(ttxRunParticipants.joinedAt)),
    db.select().from(ttxRunEvents).where(eq(ttxRunEvents.runId, id)).orderBy(asc(ttxRunEvents.occurredAt)),
  ]);
  return { ...session, participants, events };
}

// ---------------------------------------------------------------------------
// SSE stream — admin only (requireAdmin middleware runs first in app.ts)
// Token accepted via ?token= query param or Authorization header, both
// handled by requireAdmin before this handler runs.
// ---------------------------------------------------------------------------

router.get('/:id/stream', async (req, res) => {
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  addClient(req.params.id, res as unknown as Response);
  // Send current state as first event
  const detail = await getSessionDetail(req.params.id);
  res.write(`data: ${JSON.stringify({ type: 'state', session: detail })}\n\n`);
});

// ---------------------------------------------------------------------------
// Admin/facilitator routes
// ---------------------------------------------------------------------------

// GET /ttx/sessions
router.get('/', async (_req, res) => {
  const rows = await db.select().from(ttxExerciseRuns).orderBy(asc(ttxExerciseRuns.createdAt));
  const counts = await db
    .select({ runId: ttxRunParticipants.runId, n: count(ttxRunParticipants.id) })
    .from(ttxRunParticipants)
    .groupBy(ttxRunParticipants.runId);
  const countMap = Object.fromEntries(counts.map(c => [c.runId, c.n]));
  res.json(rows.map(r => ({ ...r, participantCount: countMap[r.id] ?? 0 })));
});

// POST /ttx/sessions — create (status: planned)
router.post('/', async (req, res) => {
  const { scenarioId, title, scheduledAt } = req.body ?? {};
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  if (!scenarioId) { res.status(400).json({ error: 'scenarioId is required' }); return; }

  let scheduledAtDate: Date | null = null;
  if (scheduledAt !== undefined && scheduledAt !== null) {
    scheduledAtDate = new Date(scheduledAt);
    if (isNaN(scheduledAtDate.getTime())) {
      res.status(400).json({ error: 'scheduledAt must be a valid ISO date string' });
      return;
    }
  }

  const [admin] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.username, adminUsername)).limit(1);
  if (!admin) { res.status(400).json({ error: 'Facilitator admin account not found' }); return; }

  const [scenario] = await db.select().from(ttxScenarios).where(eq(ttxScenarios.id, scenarioId)).limit(1);
  if (!scenario) { res.status(404).json({ error: 'Scenario not found' }); return; }

  // Snapshot the scenario content at creation time
  const sections = await db.select().from(ttxScenarioSections).where(eq(ttxScenarioSections.scenarioId, scenarioId)).orderBy(asc(ttxScenarioSections.order));
  const allSteps: (typeof ttxScenarioSteps.$inferSelect)[] = [];
  for (const s of sections) {
    const steps = await db.select().from(ttxScenarioSteps).where(eq(ttxScenarioSteps.sectionId, s.id)).orderBy(asc(ttxScenarioSteps.order));
    allSteps.push(...steps);
  }
  const allInjects: (typeof ttxInjects.$inferSelect)[] = [];
  for (const st of allSteps) {
    const injects = await db.select().from(ttxInjects).where(eq(ttxInjects.stepId, st.id)).orderBy(asc(ttxInjects.order));
    allInjects.push(...injects);
  }

  const snapshot = {
    ...scenario,
    sections: sections.map(sec => ({
      ...sec,
      steps: allSteps.filter(step => step.sectionId === sec.id).map(step => ({
        ...step,
        injects: allInjects.filter(inj => inj.stepId === step.id)
      }))
    }))
  };

  const [row] = await db.insert(ttxExerciseRuns).values({
    id: uuid(),
    scenarioId,
    title: title ?? scenario.title,
    snapshot,
    scheduledAt: scheduledAtDate,
    status: 'planned',
    facilitatorId: admin.id,
  }).returning();
  res.status(201).json(row);
});

// GET /ttx/sessions/:id — full detail
router.get('/:id', async (req, res) => {
  const detail = await getSessionDetail(req.params.id);
  if (!detail) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(detail);
});

// POST /ttx/sessions/:id/start — planned → active
router.post('/:id/start', async (req, res) => {
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Not found' }); return; }
  if (session.status !== 'planned') { res.status(400).json({ error: `Cannot start: session is ${session.status}` }); return; }

  const [row] = await db.update(ttxExerciseRuns).set({ status: 'active', startedAt: new Date() }).where(eq(ttxExerciseRuns.id, req.params.id)).returning();
  broadcast(req.params.id, { type: 'session_started', session: row });
  res.json(row);
});

// POST /ttx/sessions/:id/end — active → ended
router.post('/:id/end', async (req, res) => {
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Not found' }); return; }
  if (session.status !== 'active') { res.status(400).json({ error: `Cannot end: session is ${session.status}` }); return; }

  const [row] = await db.update(ttxExerciseRuns).set({ status: 'complete', endedAt: new Date() }).where(eq(ttxExerciseRuns.id, req.params.id)).returning();
  broadcast(req.params.id, { type: 'session_ended', session: row });
  res.json(row);
});

// POST /ttx/sessions/:id/advance — deliver step or inject
router.post('/:id/advance', async (req, res) => {
  const { stepId, injectId } = req.body ?? {};
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Not found' }); return; }
  if (session.status !== 'active') { res.status(400).json({ error: 'Session is not active' }); return; }

  if (stepId) {
    const [step] = await db.select().from(ttxScenarioSteps).where(eq(ttxScenarioSteps.id, stepId)).limit(1);
    if (!step) { res.status(404).json({ error: 'Step not found' }); return; }
    await db.update(ttxExerciseRuns).set({ currentStepId: stepId }).where(eq(ttxExerciseRuns.id, session.id));
    const [event] = await db.insert(ttxRunEvents).values({
      id: uuid(), runId: session.id, eventType: 'narrative_delivered',
      actorHandle: adminUsername, body: step.participantSituationRoom,
    }).returning();
    broadcast(req.params.id, { type: 'step_advanced', currentStepId: stepId, step, event });
    res.json({ currentStepId: stepId, event });
    return;
  }

  if (injectId) {
    const [inject] = await db.select().from(ttxInjects).where(eq(ttxInjects.id, injectId)).limit(1);
    if (!inject) { res.status(404).json({ error: 'Inject not found' }); return; }
    // Do NOT overwrite currentStepId — injects are events ON the current step, not step transitions.
    const [event] = await db.insert(ttxRunEvents).values({
      id: uuid(), runId: session.id, eventType: 'inject_delivered',
      actorHandle: adminUsername, body: inject.content, linkedInjectId: injectId,
    }).returning();
    broadcast(req.params.id, { type: 'inject_advanced', currentStepId: session.currentStepId, inject, event });
    res.json({ currentStepId: session.currentStepId, event });
    return;
  }

  res.status(400).json({ error: 'stepId or injectId is required' });
});

// POST /ttx/sessions/:id/join — admin force-add participant
router.post('/:id/join', async (req, res) => {
  const { handle, role } = req.body ?? {};
  if (!handle) { res.status(400).json({ error: 'handle is required' }); return; }

  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  if (session.status === 'complete') { res.status(400).json({ error: 'Session has ended' }); return; }

  const all = await db.select().from(ttxRunParticipants).where(eq(ttxRunParticipants.runId, session.id));
  const match = all.find(p => p.handle === handle);

  if (match) {
    const [row] = await db.update(ttxRunParticipants).set({ role: role ?? match.role }).where(eq(ttxRunParticipants.id, match.id)).returning();
    broadcast(req.params.id, { type: 'participant_joined', participant: row });
    res.json(row);
  } else {
    const [row] = await db.insert(ttxRunParticipants).values({ id: uuid(), runId: session.id, handle, role: role ?? '' }).returning();
    broadcast(req.params.id, { type: 'participant_joined', participant: row });
    res.status(201).json(row);
  }
});

// POST /ttx/sessions/:id/events — facilitator logs event (for any actor)
router.post('/:id/events', async (req, res) => {
  const { eventType, actorHandle, body, linkedInjectId } = req.body ?? {};
  if (!eventType || !actorHandle || !body) { res.status(400).json({ error: 'eventType, actorHandle, and body are required' }); return; }
  if (!['decision', 'note', 'action'].includes(eventType)) { res.status(400).json({ error: 'eventType must be decision, note, or action' }); return; }

  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  if (session.status !== 'active') { res.status(400).json({ error: 'Session is not active' }); return; }

  const [event] = await db.insert(ttxRunEvents).values({
    id: uuid(), runId: session.id, eventType, actorHandle, body,
    linkedInjectId: linkedInjectId ?? null,
  }).returning();
  broadcast(req.params.id, { type: 'event_logged', event });
  res.status(201).json(event);
});

// ---------------------------------------------------------------------------
// AAR — facilitator only
// ---------------------------------------------------------------------------

router.post('/:id/aar', async (req, res) => {
  // In v1 Executive Standard, AAR data is stored in the ExerciseRun 'decisions' or 'snapshot'
  // and Action Items. This endpoint can be used to update the Run summary.
  const { summary } = req.body ?? {};
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  const [row] = await db.update(ttxExerciseRuns)
    .set({ decisions: { ...(session.decisions as object), summary: summary ?? '' } })
    .where(eq(ttxExerciseRuns.id, session.id))
    .returning();
  res.json(row);
});

router.get('/:id/aar', async (req, res) => {
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  const actionItems = await db.select().from(ttxActionItems).where(eq(ttxActionItems.runId, session.id)).orderBy(asc(ttxActionItems.dueAt));
  res.json({ ...(session.decisions as object), actionItems });
});

router.patch('/:id/aar/finalize', async (req, res) => {
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  if (session.status === 'complete') { res.status(400).json({ error: 'Already finalized' }); return; }

  const [row] = await db.update(ttxExerciseRuns).set({ status: 'complete', endedAt: new Date() }).where(eq(ttxExerciseRuns.id, session.id)).returning();
  res.json(row);
});

const VALID_ACTION_ITEM_STATUSES = ['open', 'closed', 'retesting'] as const;

function parseDateField(value: unknown, fieldName: string): { date: Date | null; error?: string } {
  if (value === undefined || value === null) return { date: null };
  const d = new Date(value as string);
  if (isNaN(d.getTime())) return { date: null, error: `${fieldName} must be a valid ISO date string` };
  return { date: d };
}

router.post('/:id/aar/action-items', async (req, res) => {
  const { title, body, owner, dueAt } = req.body ?? {};
  if (!body) { res.status(400).json({ error: 'body is required' }); return; }

  const { date: dueAtDate, error: dueAtErr } = parseDateField(dueAt, 'dueAt');
  if (dueAtErr) { res.status(400).json({ error: dueAtErr }); return; }

  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  const [row] = await db.insert(ttxActionItems).values({
    id: uuid(), runId: session.id, title: title ?? '', body, owner: owner ?? '',
    dueAt: dueAtDate, status: 'open',
  }).returning();
  res.status(201).json(row);
});

router.patch('/:id/aar/action-items/:itemId', async (req, res) => {
  const { body, owner, dueAt, status, evidence } = req.body ?? {};
  if (status !== undefined && !VALID_ACTION_ITEM_STATUSES.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${VALID_ACTION_ITEM_STATUSES.join(', ')}` });
    return;
  }
  if (dueAt !== undefined) {
    const { error: dueAtErr } = parseDateField(dueAt, 'dueAt');
    if (dueAtErr) { res.status(400).json({ error: dueAtErr }); return; }
  }
  const [row] = await db.update(ttxActionItems).set({
    ...(body && { body }),
    ...(owner !== undefined && { owner }),
    ...(dueAt !== undefined && { dueAt: dueAt ? new Date(dueAt) : null }),
    ...(status && { status }),
    ...(evidence !== undefined && { evidence }),
    ...(status === 'closed' && { closedAt: new Date() }),
  }).where(eq(ttxActionItems.id, req.params.itemId)).returning();
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(row);
});

// GET /ttx/sessions/:id/export
router.get('/:id/export', async (req, res) => {
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Not found' }); return; }

  const participants = await db.select().from(ttxRunParticipants).where(eq(ttxRunParticipants.runId, session.id)).orderBy(asc(ttxRunParticipants.joinedAt));
  const events = await db.select().from(ttxRunEvents).where(eq(ttxRunEvents.runId, session.id)).orderBy(asc(ttxRunEvents.occurredAt));
  const actionItems = await db.select().from(ttxActionItems).where(eq(ttxActionItems.runId, session.id)).orderBy(asc(ttxActionItems.dueAt));

  res.json({ session, participants, events, actionItems });
});

export default router;
