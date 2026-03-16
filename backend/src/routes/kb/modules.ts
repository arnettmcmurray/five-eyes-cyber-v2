import { Router, type Request } from 'express';
import { ModuleService } from '../../services/kb/module.service.js';

type AdminReq = Request & { adminUsername: string };
const router = Router();
const svc = new ModuleService();

router.get('/', async (_req, res) => {
  try {
    res.json(await svc.list());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const { slug, title, description = '', displayOrder = 0 } = req.body;
  if (!slug || !title) {
    res.status(400).json({ error: 'slug and title are required' });
    return;
  }
  try {
    res.status(201).json(await svc.create({ slug, title, description, displayOrder, createdBy: adminUsername }));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    res.json(await svc.get(req.params.id));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.patch('/:id', async (req, res) => {
  const { title, description, displayOrder, nextModuleId, estimatedMinutes } = req.body;
  try {
    res.json(await svc.update(req.params.id, { title, description, displayOrder, nextModuleId, estimatedMinutes }));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/:id/publish', async (req, res) => {
  try {
    res.json(await svc.publish(req.params.id));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/:id/unpublish', async (req, res) => {
  try {
    res.json(await svc.unpublish(req.params.id));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/:id/prerequisites', async (req, res) => {
  try {
    res.json(await svc.getPrerequisites(req.params.id));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/** PUT replaces the full prerequisite list */
router.put('/:id/prerequisites', async (req, res) => {
  const { prerequisiteIds } = req.body;
  if (!Array.isArray(prerequisiteIds)) {
    res.status(400).json({ error: 'prerequisiteIds must be an array' });
    return;
  }
  try {
    res.json(await svc.setPrerequisites(req.params.id, prerequisiteIds));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await svc.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/modules/:id/dependents — modules that list this one as a prerequisite
router.get('/:id/dependents', async (req, res) => {
  try {
    res.json(await svc.getDependents(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
