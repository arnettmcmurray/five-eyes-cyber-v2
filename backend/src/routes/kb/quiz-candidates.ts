import { Router, type Request } from 'express';
import { KBQuizCandidateService } from '../../services/kb/quiz-candidate.service.js';
import { validateBody } from '../../validation/middleware.js';
import { createQuizCandidateSchema } from '../../validation/kb.schemas.js';
import { z } from 'zod';

type AdminReq = Request & { adminUsername: string };
const router = Router({ mergeParams: true });
const svc = new KBQuizCandidateService();

router.get('/', async (req, res) => {
  try {
    res.json(await svc.listForItem((req.params as any).itemId));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/', validateBody(createQuizCandidateSchema), async (req, res) => {
  try {
    res.status(201).json(await svc.create({ ...req.body, kbItemId: (req.params as any).itemId }));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

const promoteSchema = z.object({ moduleId: z.string().min(1) });

const standalone = Router();

standalone.post('/:id/approve', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  try {
    res.json(await svc.approve(String(req.params.id), adminUsername));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

standalone.post('/:id/reject', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  try {
    res.json(await svc.reject(String(req.params.id), adminUsername));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

standalone.post('/:id/promote', validateBody(promoteSchema), async (req, res) => {
  try {
    res.json(await svc.promote(String(req.params.id), req.body.moduleId as string));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export { standalone as quizCandidateActions };
export default router;
