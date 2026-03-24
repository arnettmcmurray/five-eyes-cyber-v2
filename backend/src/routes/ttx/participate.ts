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
import { eq, asc, gt, and, inArray } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { learnerSessions } from '../../db/schema/auth.js';
import { learners } from '../../db/schema/learners.js';
import { AccessService } from '../../services/access/access.service.js';
import {
  ttxExerciseRuns,
  ttxRunParticipants,
  ttxRunEvents,
  ttxInjects,
  ttxScenarioSteps,
  ttxScenarioSections,
  ttxScenarios,
  ttxScenarioKbRefs,
} from '../../db/schema/ttx.js';
import { kbItems } from '../../db/schema/kb-items.js';
import { kbRevisions } from '../../db/schema/kb-revisions.js';
import { topicRelationships, topics } from '../../db/schema/topics.js';
import { addClient, broadcast } from '../../lib/ttx-sse.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router({ mergeParams: true });
const accessSvc = new AccessService();

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
// TTX access gate — Individual tier does not include TTX
// ---------------------------------------------------------------------------

async function requireTtxAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  const learnerId = (req as unknown as ParticipantReq).learnerId;
  const tier = await accessSvc.getLearnerTier(learnerId);
  if (tier === 'individual') {
    res.status(403).json({
      error: 'TTX access requires Professional package or group-based TTX entitlement. Your current package (Individual) does not include TTX.',
      tier: 'individual',
    });
    return;
  }
  next();
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// POST /ttx/participate/:sessionId/join { role }
router.post('/:sessionId/join', requireLearner, requireTtxAccess, async (req, res) => {
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

  const [participants, events, allKbRefs] = await Promise.all([
    db.select().from(ttxRunParticipants).where(eq(ttxRunParticipants.runId, runId)).orderBy(asc(ttxRunParticipants.joinedAt)),
    db.select().from(ttxRunEvents).where(eq(ttxRunEvents.runId, runId)).orderBy(asc(ttxRunEvents.occurredAt)),
    db.select().from(ttxScenarioKbRefs).where(eq(ttxScenarioKbRefs.scenarioId, session.scenarioId)),
  ]);

  // Derive scenarioTitle and currentStep from the snapshot
  const snap = session.snapshot as any;
  const scenarioTitle: string = snap?.title ?? '';
  let currentStep: any = null;
  if (session.currentStepId) {
    const allSteps = (snap?.sections ?? []).flatMap((s: any) => s.steps ?? []);
    currentStep = allSteps.find((st: any) => st.id === session.currentStepId) ?? null;
  }

  // Enrich KB refs: scenario-level refs + refs scoped to the current step
  const relevantRefs = allKbRefs.filter(r =>
    r.stepId === null && r.injectId === null ||
    (session.currentStepId !== null && r.stepId === session.currentStepId)
  );

  let kbRefs: Array<{
    id: string; kbItemId: string; stepId: string | null; injectId: string | null;
    title: string; excerpt: string; topics: Array<{ slug: string; name: string }>;
  }> = [];
  if (relevantRefs.length > 0) {
    const itemIds = relevantRefs.map(r => r.kbItemId);
    const items = await db
      .select({ id: kbItems.id, title: kbItems.title, currentRevisionId: kbItems.currentRevisionId })
      .from(kbItems)
      .where(and(inArray(kbItems.id, itemIds), eq(kbItems.status, 'published')));

    const revIds = items.map(i => i.currentRevisionId).filter((id): id is string => id !== null);
    const revRows = revIds.length > 0
      ? await db.select({ id: kbRevisions.id, content: kbRevisions.content }).from(kbRevisions).where(inArray(kbRevisions.id, revIds))
      : [];
    const revMap = new Map(revRows.map(r => [r.id, r.content]));

    const topicRels = await db.select().from(topicRelationships).where(inArray(topicRelationships.itemId, itemIds));
    const topicIds = [...new Set(topicRels.map(r => r.topicId))];
    const topicRows = topicIds.length > 0
      ? await db.select().from(topics).where(inArray(topics.id, topicIds))
      : [];
    const topicMap = new Map(topicRows.map(t => [t.id, { slug: t.slug, name: t.name }]));
    const itemMap = new Map(items.map(i => [i.id, i]));

    kbRefs = relevantRefs.map(ref => {
      const item = itemMap.get(ref.kbItemId);
      if (!item) return null;
      const content = item.currentRevisionId ? (revMap.get(item.currentRevisionId) ?? '') : '';
      const refTopics = topicRels
        .filter(r => r.itemId === ref.kbItemId)
        .map(r => topicMap.get(r.topicId))
        .filter((t): t is { slug: string; name: string } => t !== undefined);
      return {
        id: ref.id,
        kbItemId: ref.kbItemId,
        stepId: ref.stepId ?? null,
        injectId: ref.injectId ?? null,
        title: item.title,
        excerpt: content.slice(0, 300) + (content.length > 300 ? '…' : ''),
        topics: refTopics,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }

  res.json({ session, scenarioTitle, participants, events, currentStep, myHandle: handle, kbRefs });
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
