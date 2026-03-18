import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { eq, asc, count, sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import {
  ttxScenarios,
  ttxSessions,
  ttxSessionParticipants,
  ttxSessionEvents,
  ttxAfterActionReviews,
  ttxActionItems,
  ttxInjects,
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
  const [session] = await db.select().from(ttxSessions).where(eq(ttxSessions.id, id)).limit(1);
  return session ?? null;
}

async function getSessionDetail(id: string) {
  const session = await getSession(id);
  if (!session) return null;
  const [participants, events] = await Promise.all([
    db.select().from(ttxSessionParticipants).where(eq(ttxSessionParticipants.sessionId, id)).orderBy(asc(ttxSessionParticipants.joinedAt)),
    db.select().from(ttxSessionEvents).where(eq(ttxSessionEvents.sessionId, id)).orderBy(asc(ttxSessionEvents.occurredAt)),
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
  const rows = await db.select().from(ttxSessions).orderBy(asc(ttxSessions.createdAt));
  const counts = await db
    .select({ sessionId: ttxSessionParticipants.sessionId, n: count(ttxSessionParticipants.id) })
    .from(ttxSessionParticipants)
    .groupBy(ttxSessionParticipants.sessionId);
  const countMap = Object.fromEntries(counts.map(c => [c.sessionId, c.n]));
  res.json(rows.map(r => ({ ...r, participantCount: countMap[r.id] ?? 0 })));
});

// POST /ttx/sessions — create (status: planned)
router.post('/', async (req, res) => {
  const { scenarioId, title, scheduledAt } = req.body ?? {};
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  if (!scenarioId || !title) { res.status(400).json({ error: 'scenarioId and title are required' }); return; }

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

  const [scenario] = await db.select({ id: ttxScenarios.id }).from(ttxScenarios).where(eq(ttxScenarios.id, scenarioId)).limit(1);
  if (!scenario) { res.status(404).json({ error: 'Scenario not found' }); return; }

  const [row] = await db.insert(ttxSessions).values({
    id: uuid(), scenarioId, title,
    scheduledAt: scheduledAtDate,
    status: 'planned', facilitatorId: admin.id,
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

  const [row] = await db.update(ttxSessions).set({ status: 'active', startedAt: new Date() }).where(eq(ttxSessions.id, req.params.id)).returning();
  broadcast(req.params.id, { type: 'session_started', session: row });
  res.json(row);
});

// POST /ttx/sessions/:id/end — active → ended
router.post('/:id/end', async (req, res) => {
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Not found' }); return; }
  if (session.status !== 'active') { res.status(400).json({ error: `Cannot end: session is ${session.status}` }); return; }

  const [row] = await db.update(ttxSessions).set({ status: 'ended', endedAt: new Date() }).where(eq(ttxSessions.id, req.params.id)).returning();
  broadcast(req.params.id, { type: 'session_ended', session: row });
  res.json(row);
});

// POST /ttx/sessions/:id/advance — deliver inject, set currentInjectId
router.post('/:id/advance', async (req, res) => {
  const { injectId } = req.body ?? {};
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Not found' }); return; }
  if (session.status !== 'active') { res.status(400).json({ error: 'Session is not active' }); return; }
  if (!injectId) { res.status(400).json({ error: 'injectId is required' }); return; }

  const [inject] = await db.select().from(ttxInjects).where(eq(ttxInjects.id, injectId)).limit(1);
  if (!inject) { res.status(404).json({ error: 'Inject not found' }); return; }

  await db.update(ttxSessions).set({ currentInjectId: injectId }).where(eq(ttxSessions.id, session.id));
  const [event] = await db.insert(ttxSessionEvents).values({
    id: uuid(), sessionId: session.id, eventType: 'inject_delivered',
    actorHandle: adminUsername, body: inject.body, linkedInjectId: injectId,
  }).returning();

  const data = { type: 'inject_advanced', currentInjectId: injectId, inject: { ...inject, targetRoles: JSON.parse(inject.targetRoles ?? '[]') }, event };
  broadcast(req.params.id, data);
  res.json({ currentInjectId: injectId, event });
});

// POST /ttx/sessions/:id/join — admin force-add participant
router.post('/:id/join', async (req, res) => {
  const { handle, role } = req.body ?? {};
  if (!handle) { res.status(400).json({ error: 'handle is required' }); return; }

  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  if (session.status === 'ended') { res.status(400).json({ error: 'Session has ended' }); return; }

  const all = await db.select().from(ttxSessionParticipants).where(eq(ttxSessionParticipants.sessionId, session.id));
  const match = all.find(p => p.handle === handle);

  if (match) {
    const [row] = await db.update(ttxSessionParticipants).set({ role: role ?? match.role }).where(eq(ttxSessionParticipants.id, match.id)).returning();
    broadcast(req.params.id, { type: 'participant_joined', participant: row });
    res.json(row);
  } else {
    const [row] = await db.insert(ttxSessionParticipants).values({ id: uuid(), sessionId: session.id, handle, role: role ?? '' }).returning();
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

  const [event] = await db.insert(ttxSessionEvents).values({
    id: uuid(), sessionId: session.id, eventType, actorHandle, body,
    linkedInjectId: linkedInjectId ?? null,
  }).returning();
  broadcast(req.params.id, { type: 'event_logged', event });
  res.status(201).json(event);
});

// ---------------------------------------------------------------------------
// AAR — facilitator only
// ---------------------------------------------------------------------------

router.post('/:id/aar', async (req, res) => {
  const { summary, strengths, improvements } = req.body ?? {};
  const adminUsername = (req as unknown as AdminReq).adminUsername;

  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  const [existing] = await db.select().from(ttxAfterActionReviews).where(eq(ttxAfterActionReviews.sessionId, session.id)).limit(1);
  if (existing) {
    const [row] = await db.update(ttxAfterActionReviews).set({
      ...(summary !== undefined && { summary }),
      ...(strengths !== undefined && { strengths }),
      ...(improvements !== undefined && { improvements }),
      updatedAt: new Date(),
    }).where(eq(ttxAfterActionReviews.id, existing.id)).returning();
    res.json(row);
  } else {
    const [row] = await db.insert(ttxAfterActionReviews).values({
      id: uuid(), sessionId: session.id,
      summary: summary ?? '', strengths: strengths ?? '', improvements: improvements ?? '',
      status: 'draft', createdBy: adminUsername,
    }).returning();
    res.status(201).json(row);
  }
});

router.get('/:id/aar', async (req, res) => {
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  const [aar] = await db.select().from(ttxAfterActionReviews).where(eq(ttxAfterActionReviews.sessionId, session.id)).limit(1);
  if (!aar) { res.status(404).json({ error: 'No AAR yet' }); return; }

  const actionItems = await db.select().from(ttxActionItems).where(eq(ttxActionItems.aarId, aar.id)).orderBy(asc(ttxActionItems.dueAt));
  res.json({ ...aar, actionItems });
});

router.patch('/:id/aar/finalize', async (req, res) => {
  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  const [aar] = await db.select().from(ttxAfterActionReviews).where(eq(ttxAfterActionReviews.sessionId, session.id)).limit(1);
  if (!aar) { res.status(404).json({ error: 'No AAR to finalize' }); return; }
  if (aar.status === 'final') { res.status(400).json({ error: 'Already finalized' }); return; }

  const [row] = await db.update(ttxAfterActionReviews).set({ status: 'final', updatedAt: new Date() }).where(eq(ttxAfterActionReviews.id, aar.id)).returning();
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
  const { body, owner, dueAt } = req.body ?? {};
  if (!body) { res.status(400).json({ error: 'body is required' }); return; }

  const { date: dueAtDate, error: dueAtErr } = parseDateField(dueAt, 'dueAt');
  if (dueAtErr) { res.status(400).json({ error: dueAtErr }); return; }

  const session = await getSession(req.params.id);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  const [aar] = await db.select({ id: ttxAfterActionReviews.id, status: ttxAfterActionReviews.status }).from(ttxAfterActionReviews).where(eq(ttxAfterActionReviews.sessionId, session.id)).limit(1);
  if (!aar) { res.status(404).json({ error: 'Create the AAR first' }); return; }
  if (aar.status === 'final') { res.status(400).json({ error: 'AAR is finalized' }); return; }

  const [row] = await db.insert(ttxActionItems).values({
    id: uuid(), aarId: aar.id, body, owner: owner ?? '',
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

  const [scenario] = await db.select().from(ttxScenarios).where(eq(ttxScenarios.id, session.scenarioId)).limit(1);
  const [participants, events] = await Promise.all([
    db.select().from(ttxSessionParticipants).where(eq(ttxSessionParticipants.sessionId, session.id)).orderBy(asc(ttxSessionParticipants.joinedAt)),
    db.select().from(ttxSessionEvents).where(eq(ttxSessionEvents.sessionId, session.id)).orderBy(asc(ttxSessionEvents.occurredAt)),
  ]);
  const [aar] = await db.select().from(ttxAfterActionReviews).where(eq(ttxAfterActionReviews.sessionId, session.id)).limit(1);
  const actionItems = aar ? await db.select().from(ttxActionItems).where(eq(ttxActionItems.aarId, aar.id)).orderBy(asc(ttxActionItems.dueAt)) : [];

  res.json({ session, scenario: scenario ?? null, participants, events, aar: aar ? { ...aar, actionItems } : null });
});

export default router;
