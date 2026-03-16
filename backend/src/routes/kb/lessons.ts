import { Router } from 'express';
import { KBLessonService } from '../../services/kb/lesson.service.js';

const router = Router();
const svc = new KBLessonService();

// GET /kb/modules/:moduleId/content  — enriched view for learner UI
router.get('/modules/:moduleId/content', async (req, res) => {
  try {
    res.json(await svc.getModuleContent(req.params.moduleId));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/modules/:moduleId/links
router.get('/modules/:moduleId/links', async (req, res) => {
  try {
    res.json(await svc.getLinksForModule(req.params.moduleId));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /kb/modules/:moduleId/links
router.post('/modules/:moduleId/links', async (req, res) => {
  try {
    const link = await svc.linkToModule({ ...req.body, moduleId: req.params.moduleId });
    res.status(201).json(link);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/items/:itemId/module-links
router.get('/items/:itemId/module-links', async (req, res) => {
  try {
    res.json(await svc.getLinksForItem(req.params.itemId));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /kb/links/:id
router.delete('/links/:id', async (req, res) => {
  try {
    await svc.removeLink(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
