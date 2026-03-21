/**
 * TTX participant routes — authenticated via learner Bearer token (OTP session).
 * Completely separate from facilitator/admin routes.
 *
 * Routes:
 *   POST /ttx/participate/:id/join  { role }  — join session with learner identity
 *   GET  /ttx/participate/:id/view            — current session state for participant
 *   POST /ttx/participate/:id/respond         — submit decision/note/action
 */
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { eq, asc, gt, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { learnerSessions } from '../../db/schema/auth.js';
import { learners } from '../../db/schema/learners.js';
import {
  ttxExerciseRuns,
  ttxRunParticipants,
  ttxRunEvents,
  ttxInjects,
  ttxScenarioSteps,
  ttxScenarioSections,
  ttxScenarios,
} from '../../db/schema/ttx.js';
import { addClient, broadcast } from '../../lib/ttx-sse.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router({ mergeParams: true });

// ---------------------------------------------------------------------------
// Auth middleware — validates learner Bearer token, attaches learnerId + handle
// ---------------------------------------------------------------------------

type ParticipantReq = Request & { learnerId: string; learnerHandle: string };

async function requireLearner(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Learner authentication required' });
    return;
  }
  const token = authHeader.slice(7);
  const now = new Date();
  const [session] = await db
    .select({ learnerId: learnerSessions.learnerId })
    .from(learnerSessions)
    .where(and(eq(learnerSessions.token, token), gt(learnerSessions.expiresAt, now)))
    .limit(1);
  if (!session) { res.status(401).json({ error: 'Invalid or expired session' }); return; }

  const [learner] = await db
    .select({ handle: learners.handle })
    .from(learners)
    .where(eq(learners.id, session.learnerId))
    .limit(1);
  if (!learner) { res.status(401).json({ error: 'Learner not found' }); return; }

  (req as unknown as ParticipantReq).learnerId = session.learnerId;
  (req as unknown as ParticipantReq).learnerHandle = learner.handle;
  next();
}

// ---------------------------------------------------------------------------
// Participant membership check — must be in the session to view/respond
// ---------------------------------------------------------------------------

async function requireParticipant(req: Request, res: Response, next: NextFunction): Promise<void> {
  const handle = (req as unknown as ParticipantReq).learnerHandle;
  const runId = req.params['sessionId'] as string;
  const all = await db.select().from(ttxRunParticipants).where(eq(ttxRunParticipants.runId, runId));
  const isMember = all.some(p => p.handle === handle);
  if (!isMember) { res.status(403).json({ error: 'Not a participant in this run' }); return; }
  next();
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// POST /ttx/participate/:sessionId/join { role }
router.post('/:sessionId/join', requireLearner, async (req, res) => {
  const handle = (req as unknown as ParticipantReq).learnerHandle;
  const { role } = req.body ?? {};
  const runId = req.params['sessionId'] as string;

  const [session] = await db.select({ id: ttxExerciseRuns.id, status: ttxExerciseRuns.status }).from(ttxExerciseRuns).where(eq(ttxExerciseRuns.id, runId)).limit(1);
  if (!session) { res.status(404).json({ error: 'Run not found' }); return; }
  if (session.status === 'complete') { res.status(400).json({ error: 'Run has ended — cannot join' }); return; }

  const all = await db.select().from(ttxRunParticipants).where(eq(ttxRunParticipants.runId, runId));
  const existing = all.find(p => p.handle === handle);

  if (existing) {
    const [row] = await db.update(ttxRunParticipants)
      .set({ role: role ?? existing.role })
      .where(eq(ttxRunParticipants.id, existing.id))
      .returning();
    broadcast(runId, { type: 'participant_joined', participant: row });
    res.json(row);
  } else {
    const [row] = await db.insert(ttxRunParticipants).values({
      id: uuid(), runId, handle, role: role ?? '',
    }).returning();
    broadcast(runId, { type: 'participant_joined', participant: row });
    res.status(201).json(row);
  }
});

// GET /ttx/participate/:sessionId/view
router.get('/:sessionId/view', requireLearner, requireParticipant, async (req, res) => {
  const runId = req.params['sessionId'] as string;
  const handle = (req as unknown as ParticipantReq).learnerHandle;

  const [session] = await db.select().from(ttxExerciseRuns).where(eq(ttxExerciseRuns.id, runId)).limit(1);
  if (!session) { res.status(404).json({ error: 'Not found' }); return; }

  const [participants, events] = await Promise.all([
    db.select().from(ttxRunParticipants).where(eq(ttxRunParticipants.runId, runId)).orderBy(asc(ttxRunParticipants.joinedAt)),
    db.select().from(ttxRunEvents).where(eq(ttxRunEvents.runId, runId)).orderBy(asc(ttxRunEvents.occurredAt)),
  ]);

  res.json({ session, participants, events, myHandle: handle });
});

// POST /ttx/participate/:sessionId/respond { eventType, body }
router.post('/:sessionId/respond', requireLearner, requireParticipant, async (req, res) => {
  const handle = (req as unknown as ParticipantReq).learnerHandle;
  const { eventType, body } = req.body ?? {};
  const runId = req.params['sessionId'] as string;

  if (!eventType || !body) { res.status(400).json({ error: 'eventType and body are required' }); return; }
  if (!['decision', 'note', 'action'].includes(eventType)) { res.status(400).json({ error: 'eventType must be decision, note, or action' }); return; }

  const [session] = await db.select({ id: ttxExerciseRuns.id, status: ttxExerciseRuns.status, currentStepId: ttxExerciseRuns.currentStepId })
    .from(ttxExerciseRuns).where(eq(ttxExerciseRuns.id, runId)).limit(1);
  if (!session) { res.status(404).json({ error: 'Run not found' }); return; }
  if (session.status !== 'active') { res.status(400).json({ error: `Run is ${session.status} — cannot respond` }); return; }

  const [event] = await db.insert(ttxRunEvents).values({
    id: uuid(), runId, eventType, actorHandle: handle, body,
    linkedInjectId: session.currentStepId ?? null,
  }).returning();

  broadcast(runId, { type: 'event_logged', event });
  res.status(201).json(event);
});

// GET /ttx/participate/:sessionId/stream — SSE for participant
router.get('/:sessionId/stream', async (req, res) => {
  const token = req.query['token'] as string | undefined;
  if (!token) { res.status(401).json({ error: 'token query param required' }); return; }

  const now = new Date();
  const [session_row] = await db.select({ learnerId: learnerSessions.learnerId })
    .from(learnerSessions)
    .where(and(eq(learnerSessions.token, token), gt(learnerSessions.expiresAt, now)))
    .limit(1);
  if (!session_row) { res.status(401).json({ error: 'Invalid or expired session' }); return; }

  const [learner] = await db.select({ handle: learners.handle }).from(learners).where(eq(learners.id, session_row.learnerId)).limit(1);
  if (!learner) { res.status(401).json({ error: 'Learner not found' }); return; }

  const runId = req.params['sessionId'] as string;
  const [ttxSession] = await db.select({ id: ttxExerciseRuns.id }).from(ttxExerciseRuns).where(eq(ttxExerciseRuns.id, runId)).limit(1);
  if (!ttxSession) { res.status(404).json({ error: 'Run not found' }); return; }

  // Must be a participant
  const all = await db.select().from(ttxRunParticipants).where(eq(ttxRunParticipants.runId, runId));
  if (!all.some(p => p.handle === learner.handle)) {
    res.status(403).json({ error: 'Not a participant in this run' }); return;
  }

  addClient(runId, res as unknown as Response);

  // Send initial state
  const detail = await db.select().from(ttxExerciseRuns).where(eq(ttxExerciseRuns.id, runId)).limit(1);
  const participants = await db.select().from(ttxRunParticipants).where(eq(ttxRunParticipants.runId, runId)).orderBy(asc(ttxRunParticipants.joinedAt));
  const events = await db.select().from(ttxRunEvents).where(eq(ttxRunEvents.runId, runId)).orderBy(asc(ttxRunEvents.occurredAt));
  
  res.write(`data: ${JSON.stringify({ type: 'state', session: { ...detail[0], participants, events } })}\n\n`);
});

export default router;
