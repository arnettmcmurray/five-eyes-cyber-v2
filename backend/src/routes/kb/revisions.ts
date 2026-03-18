import { Router, type Request } from 'express';
import { KBRevisionService } from '../../services/kb/revision.service.js';
import { validateBody } from '../../validation/middleware.js';
import { createRevisionSchema, rollbackSchema } from '../../validation/kb.schemas.js';

type AdminReq = Request & { adminUsername: string };
const router = Router({ mergeParams: true });
const svc = new KBRevisionService();

router.get('/', async (req, res) => {
  try {
    res.json(await svc.listRevisions((req.params as any).itemId));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/', validateBody(createRevisionSchema), async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  try {
    const { content } = req.body;
    res.status(201).json(await svc.createRevision((req.params as any).itemId, content, adminUsername));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/:revisionId', async (req, res) => {
  try {
    const rev = await svc.getRevision(String(req.params.revisionId));
    if (!rev) return res.status(404).json({ error: 'Not found' });
    res.json(rev);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/:revisionId/rollback', validateBody(rollbackSchema), async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  try {
    res.status(201).json(
      await svc.rollback((req.params as any).itemId, String(req.params.revisionId), adminUsername),
    );
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
