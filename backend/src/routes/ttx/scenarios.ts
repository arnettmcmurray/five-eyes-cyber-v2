import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { eq, asc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import {
  ttxScenarios,
  ttxScenarioSections,
  ttxScenarioSteps,
  ttxInjects,
} from '../../db/schema/ttx.js';
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
  const { slug, title, description, objective } = req.body ?? {};
  const createdBy = (req as unknown as Request & { adminUsername: string }).adminUsername;
  if (!slug || !title) {
    res.status(400).json({ error: 'slug and title are required' });
    return;
  }
  try {
    const [row] = await db
      .insert(ttxScenarios)
      .values({ id: uuid(), slug, title, description: description ?? '', objective: objective ?? '', createdBy })
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
        injects: allInjects.filter(i => i.stepId === step.id).map(inj => ({
          ...inj,
          targetRoles: JSON.parse(inj.targetRoles ?? '[]'),
        })),
      })),
  }));

  res.json({ ...scenario, sections: sectionsWithSteps });
});

// PATCH /ttx/scenarios/:id
router.patch('/:id', async (req, res) => {
  const { title, description, objective } = req.body ?? {};
  const [existing] = await db
    .select({ id: ttxScenarios.id })
    .from(ttxScenarios)
    .where(eq(ttxScenarios.id, req.params.id))
    .limit(1);
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

  const [row] = await db
    .update(ttxScenarios)
    .set({ ...(title && { title }), ...(description !== undefined && { description }), ...(objective !== undefined && { objective }), updatedAt: new Date() })
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
  const { title, order } = req.body ?? {};
  if (!title) { res.status(400).json({ error: 'title is required' }); return; }
  const [existing] = await db.select({ id: ttxScenarios.id }).from(ttxScenarios).where(eq(ttxScenarios.id, req.params.id)).limit(1);
  if (!existing) { res.status(404).json({ error: 'Scenario not found' }); return; }
  const [row] = await db
    .insert(ttxScenarioSections)
    .values({ id: uuid(), scenarioId: req.params.id, title, order: order ?? 0 })
    .returning();
  res.status(201).json(row);
});

// PATCH /ttx/scenarios/:id/sections/:sectionId
router.patch('/:id/sections/:sectionId', async (req, res) => {
  const { title, order } = req.body ?? {};
  const [row] = await db
    .update(ttxScenarioSections)
    .set({ ...(title && { title }), ...(order !== undefined && { order }) })
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
  const { prompt, facilitatorNotes, order } = req.body ?? {};
  if (!prompt) { res.status(400).json({ error: 'prompt is required' }); return; }
  // Verify section belongs to this scenario
  const [section] = await db
    .select({ id: ttxScenarioSections.id })
    .from(ttxScenarioSections)
    .where(eq(ttxScenarioSections.id, req.params.sectionId))
    .limit(1);
  if (!section) { res.status(404).json({ error: 'Section not found' }); return; }
  const [row] = await db
    .insert(ttxScenarioSteps)
    .values({ id: uuid(), sectionId: req.params.sectionId, prompt, facilitatorNotes: facilitatorNotes ?? '', order: order ?? 0 })
    .returning();
  res.status(201).json(row);
});

// PATCH /ttx/scenarios/:id/sections/:sectionId/steps/:stepId
router.patch('/:id/sections/:sectionId/steps/:stepId', async (req, res) => {
  const { prompt, facilitatorNotes, order } = req.body ?? {};
  const [row] = await db
    .update(ttxScenarioSteps)
    .set({ ...(prompt && { prompt }), ...(facilitatorNotes !== undefined && { facilitatorNotes }), ...(order !== undefined && { order }) })
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
  const { body, injectType, targetRoles, suggestedTimingMinutes, order } = req.body ?? {};
  if (!body) { res.status(400).json({ error: 'body is required' }); return; }
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
      stepId: req.params.stepId,
      body,
      injectType: resolvedType,
      targetRoles: JSON.stringify(targetRoles ?? []),
      suggestedTimingMinutes: suggestedTimingMinutes ?? null,
      order: order ?? 0,
    })
    .returning();
  res.status(201).json({ ...row, targetRoles: JSON.parse(row.targetRoles) });
});

// PATCH /ttx/scenarios/:id/sections/:sectionId/steps/:stepId/injects/:injectId
router.patch('/:id/sections/:sectionId/steps/:stepId/injects/:injectId', async (req, res) => {
  const { body, injectType, targetRoles, suggestedTimingMinutes, order } = req.body ?? {};
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
      ...(body && { body }),
      ...(injectType && { injectType }),
      ...(targetRoles !== undefined && { targetRoles: JSON.stringify(targetRoles) }),
      ...(suggestedTimingMinutes !== undefined && { suggestedTimingMinutes }),
      ...(order !== undefined && { order }),
    })
    .where(eq(ttxInjects.id, req.params.injectId))
    .returning();
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ ...row, targetRoles: JSON.parse(row.targetRoles) });
});

// DELETE /ttx/scenarios/:id/sections/:sectionId/steps/:stepId/injects/:injectId
router.delete('/:id/sections/:sectionId/steps/:stepId/injects/:injectId', async (req, res) => {
  await db.delete(ttxInjects).where(eq(ttxInjects.id, req.params.injectId));
  res.status(204).end();
});

export default router;
