import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { AdminProgressService } from '../../services/learn/admin-progress.service.js';
import { db } from '../../db/client.js';
import { practiceAttempts } from '../../db/schema/practice-attempts.js';
import { learners } from '../../db/schema/learners.js';

const router = Router();
const svc = new AdminProgressService();

// GET /admin/progress/overview — aggregate analytics (one call)
router.get('/overview', async (_req, res) => {
  try {
    res.json(await svc.getOverview());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/progress/learners
router.get('/learners', async (_req, res) => {
  try {
    res.json(await svc.listLearners());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/progress/groups
router.get('/groups', async (_req, res) => {
  try {
    res.json(await svc.listGroups());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/progress/groups/:groupId
router.get('/groups/:groupId', async (req, res) => {
  try {
    res.json(await svc.getGroupProgress(req.params.groupId));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/progress/learners/:learnerId
router.get('/learners/:learnerId', async (req, res) => {
  try {
    res.json(await svc.getLearnerProgress(req.params.learnerId));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/progress/modules/:moduleId
router.get('/modules/:moduleId', async (req, res) => {
  try {
    res.json(await svc.getModuleProgress(req.params.moduleId));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/progress/attempts?moduleId=xxx  — all attempts for a module (admin, includes per-Q results)
router.get('/attempts', async (req, res) => {
  const { moduleId, learnerId } = req.query as Record<string, string | undefined>;
  try {
    let rows = await db
      .select()
      .from(practiceAttempts)
      .orderBy(desc(practiceAttempts.attemptedAt));

    if (moduleId) rows = rows.filter(r => r.moduleId === moduleId);
    if (learnerId) rows = rows.filter(r => r.learnerId === learnerId);

    const learnerIds = [...new Set(rows.map(r => r.learnerId))];
    const learnerRows = learnerIds.length > 0
      ? await db.select().from(learners)
      : [];
    const handleMap = new Map(learnerRows.map(l => [l.id, l.handle]));

    res.json(rows.map(r => ({
      id: r.id,
      learnerId: r.learnerId,
      handle: handleMap.get(r.learnerId) ?? r.learnerId,
      moduleId: r.moduleId,
      score: r.score,
      total: r.total,
      percentage: r.percentage,
      passed: r.passed,
      results: r.results,  // full detail — admin only
      attemptedAt: r.attemptedAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
