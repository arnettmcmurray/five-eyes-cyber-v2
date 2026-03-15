import { Router } from 'express';
import { KBRevisionService } from '../../services/kb/revision.service.js';

const router = Router({ mergeParams: true });
const svc = new KBRevisionService();

// GET /kb/items/:itemId/revisions
router.get('/', async (req, res) => {
  try {
    const revisions = await svc.listRevisions((req.params as any).itemId);
    res.json(revisions);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /kb/items/:itemId/revisions
router.post('/', async (req, res) => {
  try {
    const { content, createdBy } = req.body;
    const rev = await svc.createRevision((req.params as any).itemId, content, createdBy);
    res.status(201).json(rev);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/items/:itemId/revisions/:revisionId
router.get('/:revisionId', async (req, res) => {
  try {
    const rev = await svc.getRevision(req.params.revisionId);
    if (!rev) return res.status(404).json({ error: 'Not found' });
    res.json(rev);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /kb/items/:itemId/revisions/:revisionId/rollback
router.post('/:revisionId/rollback', async (req, res) => {
  try {
    const { performedBy } = req.body;
    const rev = await svc.rollback((req.params as any).itemId, req.params.revisionId, performedBy);
    res.status(201).json(rev);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
