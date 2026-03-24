import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { eq, asc, and, inArray, sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import {
  ttxScenarios,
  ttxScenarioSections,
  ttxScenarioSteps,
  ttxInjects,
  ttxScenarioKbRefs,
} from '../../db/schema/ttx.js';
import { kbItems } from '../../db/schema/kb-items.js';
import { kbRevisions } from '../../db/schema/kb-revisions.js';
import { topicRelationships, topics } from '../../db/schema/topics.js';
import type { Request } from 'express';

const router = Router();

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

// GET /ttx/scenarios
router.get('/', async (_req, res) => {
  const rows = await db
    .select()
    .from(ttxScenarios)
    .orderBy(asc(ttxScenarios.createdAt));
  res.json(rows);
});

// POST /ttx/scenarios
router.post('/', async (req, res) => {
  const { slug, title, executiveSummary, description, objective, goals, targetAudience, signatureTheme } = req.body ?? {};
  const createdBy = (req as unknown as Request & { adminUsername: string }).adminUsername;
  if (!slug || !title) {
    res.status(400).json({ error: 'slug and title are required' });
    return;
  }
  try {
    const [row] = await db
      .insert(ttxScenarios)
      .values({
        id: uuid(),
        slug,
        title,
        executiveSummary: executiveSummary ?? '',
        description: description ?? '',
        objective: objective ?? '',
        goals: goals ?? [],
        targetAudience: targetAudience ?? [],
        signatureTheme: signatureTheme ?? '',
        createdBy
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /ttx/scenarios/:id — includes sections, steps, injects
router.get('/:id', async (req, res) => {
  const [scenario] = await db
    .select()
    .from(ttxScenarios)
    .where(eq(ttxScenarios.id, req.params.id))
    .limit(1);
  if (!scenario) { res.status(404).json({ error: 'Not found' }); return; }

  const sections = await db
    .select()
    .from(ttxScenarioSections)
    .where(eq(ttxScenarioSections.scenarioId, scenario.id))
    .orderBy(asc(ttxScenarioSections.order));

  // Fetch all steps for all sections
  const allSteps: (typeof ttxScenarioSteps.$inferSelect)[] = [];
  for (const section of sections) {
    const sSteps = await db
      .select()
      .from(ttxScenarioSteps)
      .where(eq(ttxScenarioSteps.sectionId, section.id))
      .orderBy(asc(ttxScenarioSteps.order));
    allSteps.push(...sSteps);
  }

  const allInjects: (typeof ttxInjects.$inferSelect)[] = [];
  for (const step of allSteps) {
    const injects = await db
      .select()
      .from(ttxInjects)
      .where(eq(ttxInjects.stepId, step.id))
      .orderBy(asc(ttxInjects.order));
    allInjects.push(...injects);
  }

  // Nest for response
  const sectionsWithSteps = sections.map(section => ({
    ...section,
    steps: allSteps
      .filter(s => s.sectionId === section.id)
      .map(step => ({
        ...step,
        injects: allInjects.filter(i => i.stepId === step.id),
      })),
  }));

  res.json({ ...scenario, sections: sectionsWithSteps });
});

// PATCH /ttx/scenarios/:id
router.patch('/:id', async (req, res) => {
  const { title, executiveSummary, description, objective, goals, targetAudience, signatureTheme } = req.body ?? {};
  const [existing] = await db
    .select({ id: ttxScenarios.id })
    .from(ttxScenarios)
    .where(eq(ttxScenarios.id, req.params.id))
    .limit(1);
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

  const [row] = await db
    .update(ttxScenarios)
    .set({
      ...(title !== undefined && { title }),
      ...(executiveSummary !== undefined && { executiveSummary }),
      ...(description !== undefined && { description }),
      ...(objective !== undefined && { objective }),
      ...(goals !== undefined && { goals }),
      ...(targetAudience !== undefined && { targetAudience }),
      ...(signatureTheme !== undefined && { signatureTheme }),
      updatedAt: new Date()
    })
    .where(eq(ttxScenarios.id, req.params.id))
    .returning();
  res.json(row);
});

// DELETE /ttx/scenarios/:id
router.delete('/:id', async (req, res) => {
  await db.delete(ttxScenarios).where(eq(ttxScenarios.id, req.params.id));
  res.status(204).end();
});

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

// POST /ttx/scenarios/:id/sections
router.post('/:id/sections', async (req, res) => {
  const { title, background, order } = req.body ?? {};
  if (!title) { res.status(400).json({ error: 'title is required' }); return; }
  const [existing] = await db.select({ id: ttxScenarios.id }).from(ttxScenarios).where(eq(ttxScenarios.id, req.params.id)).limit(1);
  if (!existing) { res.status(404).json({ error: 'Scenario not found' }); return; }
  const [row] = await db
    .insert(ttxScenarioSections)
    .values({ id: uuid(), scenarioId: req.params.id, title, background: background ?? '', order: order ?? 0 })
    .returning();
  res.status(201).json(row);
});

// PATCH /ttx/scenarios/:id/sections/:sectionId
router.patch('/:id/sections/:sectionId', async (req, res) => {
  const { title, background, order } = req.body ?? {};
  const [row] = await db
    .update(ttxScenarioSections)
    .set({
      ...(title !== undefined && { title }),
      ...(background !== undefined && { background }),
      ...(order !== undefined && { order })
    })
    .where(eq(ttxScenarioSections.id, req.params.sectionId))
    .returning();
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(row);
});

// DELETE /ttx/scenarios/:id/sections/:sectionId
router.delete('/:id/sections/:sectionId', async (req, res) => {
  await db.delete(ttxScenarioSections).where(eq(ttxScenarioSections.id, req.params.sectionId));
  res.status(204).end();
});

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

// POST /ttx/scenarios/:id/sections/:sectionId/steps
router.post('/:id/sections/:sectionId/steps', async (req, res) => {
  const { title, facilitatorNarrative, participantSituationRoom, prompts, whatGoodLooksLike, consequenceNote, order } = req.body ?? {};
  // Verify section belongs to this scenario
  const [section] = await db
    .select({ id: ttxScenarioSections.id })
    .from(ttxScenarioSections)
    .where(eq(ttxScenarioSections.id, req.params.sectionId))
    .limit(1);
  if (!section) { res.status(404).json({ error: 'Section not found' }); return; }
  const [row] = await db
    .insert(ttxScenarioSteps)
    .values({
      id: uuid(),
      sectionId: req.params.sectionId,
      title: title ?? '',
      facilitatorNarrative: facilitatorNarrative ?? '',
      participantSituationRoom: participantSituationRoom ?? '',
      prompts: prompts ?? [],
      whatGoodLooksLike: whatGoodLooksLike ?? '',
      consequenceNote: consequenceNote ?? '',
      order: order ?? 0
    })
    .returning();
  res.status(201).json(row);
});

// PATCH /ttx/scenarios/:id/sections/:sectionId/steps/:stepId
router.patch('/:id/sections/:sectionId/steps/:stepId', async (req, res) => {
  const { title, facilitatorNarrative, participantSituationRoom, prompts, whatGoodLooksLike, consequenceNote, order } = req.body ?? {};
  const [row] = await db
    .update(ttxScenarioSteps)
    .set({
      ...(title !== undefined && { title }),
      ...(facilitatorNarrative !== undefined && { facilitatorNarrative }),
      ...(participantSituationRoom !== undefined && { participantSituationRoom }),
      ...(prompts !== undefined && { prompts }),
      ...(whatGoodLooksLike !== undefined && { whatGoodLooksLike }),
      ...(consequenceNote !== undefined && { consequenceNote }),
      ...(order !== undefined && { order })
    })
    .where(eq(ttxScenarioSteps.id, req.params.stepId))
    .returning();
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(row);
});

// DELETE /ttx/scenarios/:id/sections/:sectionId/steps/:stepId
router.delete('/:id/sections/:sectionId/steps/:stepId', async (req, res) => {
  await db.delete(ttxScenarioSteps).where(eq(ttxScenarioSteps.id, req.params.stepId));
  res.status(204).end();
});

// ---------------------------------------------------------------------------
// Injects
// ---------------------------------------------------------------------------

const VALID_INJECT_TYPES = ['legal', 'media', 'technical', 'customer', 'other'] as const;

// POST /ttx/scenarios/:id/sections/:sectionId/steps/:stepId/injects
router.post('/:id/sections/:sectionId/steps/:stepId/injects', async (req, res) => {
  const { content, injectType, targetRoles, consequenceLogic, order } = req.body ?? {};
  if (!content) { res.status(400).json({ error: 'content is required' }); return; }
  const resolvedType = injectType ?? 'other';
  if (!VALID_INJECT_TYPES.includes(resolvedType)) {
    res.status(400).json({ error: `injectType must be one of: ${VALID_INJECT_TYPES.join(', ')}` });
    return;
  }
  if (targetRoles !== undefined && !Array.isArray(targetRoles)) {
    res.status(400).json({ error: 'targetRoles must be an array' });
    return;
  }
  // Verify step belongs to this section
  const [step] = await db
    .select({ id: ttxScenarioSteps.id })
    .from(ttxScenarioSteps)
    .where(eq(ttxScenarioSteps.id, req.params.stepId))
    .limit(1);
  if (!step) { res.status(404).json({ error: 'Step not found' }); return; }
  const [row] = await db
    .insert(ttxInjects)
    .values({
      id: uuid(),
      scenarioId: req.params.id,
      stepId: req.params.stepId,
      content,
      injectType: resolvedType,
      targetRoles: targetRoles ?? [],
      consequenceLogic: consequenceLogic ?? '',
      order: order ?? 0,
    })
    .returning();
  res.status(201).json(row);
});

// PATCH /ttx/scenarios/:id/sections/:sectionId/steps/:stepId/injects/:injectId
router.patch('/:id/sections/:sectionId/steps/:stepId/injects/:injectId', async (req, res) => {
  const { content, injectType, targetRoles, consequenceLogic, order } = req.body ?? {};
  if (injectType !== undefined && !VALID_INJECT_TYPES.includes(injectType)) {
    res.status(400).json({ error: `injectType must be one of: ${VALID_INJECT_TYPES.join(', ')}` });
    return;
  }
  if (targetRoles !== undefined && !Array.isArray(targetRoles)) {
    res.status(400).json({ error: 'targetRoles must be an array' });
    return;
  }
  const [row] = await db
    .update(ttxInjects)
    .set({
      ...(content !== undefined && { content }),
      ...(injectType !== undefined && { injectType }),
      ...(targetRoles !== undefined && { targetRoles }),
      ...(consequenceLogic !== undefined && { consequenceLogic }),
      ...(order !== undefined && { order }),
    })
    .where(eq(ttxInjects.id, req.params.injectId))
    .returning();
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(row);
});

// DELETE /ttx/scenarios/:id/sections/:sectionId/steps/:stepId/injects/:injectId
router.delete('/:id/sections/:sectionId/steps/:stepId/injects/:injectId', async (req, res) => {
  await db.delete(ttxInjects).where(eq(ttxInjects.id, req.params.injectId));
  res.status(204).end();
});

// ---------------------------------------------------------------------------
// KB References — link KB items to a scenario (with optional step/inject scope)
// ---------------------------------------------------------------------------

type KbRefRow = typeof ttxScenarioKbRefs.$inferSelect;

async function enrichKbRefs(refs: KbRefRow[]) {
  if (refs.length === 0) return [];
  const itemIds = refs.map(r => r.kbItemId);

  const items = await db
    .select({ id: kbItems.id, title: kbItems.title, currentRevisionId: kbItems.currentRevisionId })
    .from(kbItems)
    .where(and(inArray(kbItems.id, itemIds), eq(kbItems.status, 'published')));

  const revIds = items.map(i => i.currentRevisionId).filter((id): id is string => id !== null);
  const revRows = revIds.length > 0
    ? await db.select({ id: kbRevisions.id, content: kbRevisions.content }).from(kbRevisions).where(inArray(kbRevisions.id, revIds))
    : [];
  const revMap = new Map(revRows.map(r => [r.id, r.content]));

  const topicRels = await db
    .select()
    .from(topicRelationships)
    .where(inArray(topicRelationships.itemId, itemIds));
  const topicIds = [...new Set(topicRels.map(r => r.topicId))];
  const topicRows = topicIds.length > 0
    ? await db.select().from(topics).where(inArray(topics.id, topicIds))
    : [];
  const topicMap = new Map(topicRows.map(t => [t.id, { slug: t.slug, name: t.name }]));

  const itemMap = new Map(items.map(i => [i.id, i]));

  return refs.map(ref => {
    const item = itemMap.get(ref.kbItemId);
    if (!item) return null;
    const content = item.currentRevisionId ? (revMap.get(item.currentRevisionId) ?? '') : '';
    const itemTopics = topicRels
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
      topics: itemTopics,
      addedBy: ref.addedBy,
      addedAt: ref.addedAt.toISOString(),
    };
  }).filter(Boolean);
}

// GET /ttx/scenarios/:id/kb-refs — all KB refs for this scenario (with enrichment)
router.get('/:id/kb-refs', async (req, res) => {
  try {
    const refs = await db
      .select()
      .from(ttxScenarioKbRefs)
      .where(eq(ttxScenarioKbRefs.scenarioId, req.params.id));
    res.json(await enrichKbRefs(refs));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /ttx/scenarios/:id/kb-refs — add a KB ref to this scenario
router.post('/:id/kb-refs', async (req, res) => {
  const { kbItemId, stepId, injectId, addedBy } = req.body ?? {};
  if (!kbItemId) { res.status(400).json({ error: 'kbItemId is required' }); return; }
  if (!addedBy) { res.status(400).json({ error: 'addedBy is required' }); return; }

  // Verify the KB item exists and is published
  const [item] = await db
    .select({ id: kbItems.id })
    .from(kbItems)
    .where(and(eq(kbItems.id, kbItemId), eq(kbItems.status, 'published')))
    .limit(1);
  if (!item) { res.status(404).json({ error: 'KB item not found or not published' }); return; }

  try {
    const [row] = await db
      .insert(ttxScenarioKbRefs)
      .values({ id: uuid(), scenarioId: req.params.id, kbItemId, stepId: stepId ?? null, injectId: injectId ?? null, addedBy })
      .returning();
    const enriched = await enrichKbRefs([row]);
    res.status(201).json(enriched[0]);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /ttx/scenarios/:id/kb-refs/:refId — remove a KB ref
router.delete('/:id/kb-refs/:refId', async (req, res) => {
  await db
    .delete(ttxScenarioKbRefs)
    .where(and(eq(ttxScenarioKbRefs.id, req.params.refId), eq(ttxScenarioKbRefs.scenarioId, req.params.id)));
  res.status(204).end();
});

export default router;
