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
  ttxSessions,
  ttxSessionParticipants,
  ttxSessionEvents,
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
  const sessionId = req.params['sessionId'] as string;
  const all = await db.select().from(ttxSessionParticipants).where(eq(ttxSessionParticipants.sessionId, sessionId));
  const isMember = all.some(p => p.handle === handle);
  if (!isMember) { res.status(403).json({ error: 'Not a participant in this session' }); return; }
  next();
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// POST /ttx/participate/:sessionId/join { role }
// Learner joins using their authenticated handle. Role is their org role for the exercise.
router.post('/:sessionId/join', requireLearner, async (req, res) => {
  const handle = (req as unknown as ParticipantReq).learnerHandle;
  const { role } = req.body ?? {};
  const sessionId = req.params['sessionId'] as string;

  const [session] = await db.select({ id: ttxSessions.id, status: ttxSessions.status }).from(ttxSessions).where(eq(ttxSessions.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  if (session.status === 'ended') { res.status(400).json({ error: 'Session has ended — cannot join' }); return; }

  const all = await db.select().from(ttxSessionParticipants).where(eq(ttxSessionParticipants.sessionId, sessionId));
  const existing = all.find(p => p.handle === handle);

  if (existing) {
    const [row] = await db.update(ttxSessionParticipants)
      .set({ role: role ?? existing.role })
      .where(eq(ttxSessionParticipants.id, existing.id))
      .returning();
    broadcast(sessionId, { type: 'participant_joined', participant: row });
    res.json(row);
  } else {
    const [row] = await db.insert(ttxSessionParticipants).values({
      id: uuid(), sessionId, handle, role: role ?? '',
    }).returning();
    broadcast(sessionId, { type: 'participant_joined', participant: row });
    res.status(201).json(row);
  }
});

// GET /ttx/participate/:sessionId/view
// Returns current session state for participant. Must be a member.
router.get('/:sessionId/view', requireLearner, requireParticipant, async (req, res) => {
  const sessionId = req.params['sessionId'] as string;
  const handle = (req as unknown as ParticipantReq).learnerHandle;

  const [session] = await db.select().from(ttxSessions).where(eq(ttxSessions.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: 'Not found' }); return; }

  const [participants, events] = await Promise.all([
    db.select().from(ttxSessionParticipants).where(eq(ttxSessionParticipants.sessionId, sessionId)).orderBy(asc(ttxSessionParticipants.joinedAt)),
    db.select().from(ttxSessionEvents).where(eq(ttxSessionEvents.sessionId, sessionId)).orderBy(asc(ttxSessionEvents.occurredAt)),
  ]);

  // Resolve current inject if any
  let currentInject = null;
  if (session.currentInjectId) {
    const [inject] = await db.select().from(ttxInjects).where(eq(ttxInjects.id, session.currentInjectId)).limit(1);
    if (inject) {
      // Get step prompt for context
      const [step] = await db.select({ prompt: ttxScenarioSteps.prompt }).from(ttxScenarioSteps).where(eq(ttxScenarioSteps.id, inject.stepId)).limit(1);
      currentInject = { ...inject, targetRoles: JSON.parse(inject.targetRoles ?? '[]'), stepPrompt: step?.prompt ?? '' };
    }
  }

  // Scenario title
  const [scenario] = await db.select({ title: ttxScenarios.title }).from(ttxScenarios).where(eq(ttxScenarios.id, session.scenarioId)).limit(1);

  res.json({ session, scenarioTitle: scenario?.title ?? '', participants, events, currentInject, myHandle: handle });
});

// POST /ttx/participate/:sessionId/respond { eventType, body }
// Participant submits a decision/note/action. Linked to current inject automatically.
router.post('/:sessionId/respond', requireLearner, requireParticipant, async (req, res) => {
  const handle = (req as unknown as ParticipantReq).learnerHandle;
  const { eventType, body } = req.body ?? {};
  const sessionId = req.params['sessionId'] as string;

  if (!eventType || !body) { res.status(400).json({ error: 'eventType and body are required' }); return; }
  if (!['decision', 'note', 'action'].includes(eventType)) { res.status(400).json({ error: 'eventType must be decision, note, or action' }); return; }

  const [session] = await db.select({ id: ttxSessions.id, status: ttxSessions.status, currentInjectId: ttxSessions.currentInjectId })
    .from(ttxSessions).where(eq(ttxSessions.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  if (session.status !== 'active') { res.status(400).json({ error: `Session is ${session.status} — cannot respond` }); return; }

  const [event] = await db.insert(ttxSessionEvents).values({
    id: uuid(), sessionId, eventType, actorHandle: handle, body,
    linkedInjectId: session.currentInjectId ?? null,
  }).returning();

  broadcast(sessionId, { type: 'event_logged', event });
  res.status(201).json(event);
});

// GET /ttx/participate/:sessionId/stream — SSE for participant
// Token passed as ?token= query param (EventSource cannot set headers)
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

  const sessionId = req.params['sessionId'] as string;
  const [ttxSession] = await db.select({ id: ttxSessions.id }).from(ttxSessions).where(eq(ttxSessions.id, sessionId)).limit(1);
  if (!ttxSession) { res.status(404).json({ error: 'Session not found' }); return; }

  // Must be a participant
  const all = await db.select().from(ttxSessionParticipants).where(eq(ttxSessionParticipants.sessionId, sessionId));
  if (!all.some(p => p.handle === learner.handle)) {
    res.status(403).json({ error: 'Not a participant in this session' }); return;
  }

  addClient(sessionId, res as unknown as Response);

  // Send initial state
  const [sess] = await db.select().from(ttxSessions).where(eq(ttxSessions.id, sessionId)).limit(1);
  const [participants, events] = await Promise.all([
    db.select().from(ttxSessionParticipants).where(eq(ttxSessionParticipants.sessionId, sessionId)).orderBy(asc(ttxSessionParticipants.joinedAt)),
    db.select().from(ttxSessionEvents).where(eq(ttxSessionEvents.sessionId, sessionId)).orderBy(asc(ttxSessionEvents.occurredAt)),
  ]);
  res.write(`data: ${JSON.stringify({ type: 'state', session: { ...sess, participants, events } })}\n\n`);
});

export default router;
