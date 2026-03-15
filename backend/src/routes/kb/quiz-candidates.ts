import { Router } from 'express';
import { KBQuizCandidateService } from '../../services/kb/quiz-candidate.service.js';

const router = Router({ mergeParams: true });
const svc = new KBQuizCandidateService();

// GET /kb/items/:itemId/quiz-candidates
router.get('/', async (req, res) => {
  try {
    res.json(await svc.listForItem((req.params as any).itemId));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /kb/items/:itemId/quiz-candidates
router.post('/', async (req, res) => {
  try {
    const candidate = await svc.create({
      ...req.body,
      kbItemId: (req.params as any).itemId,
      status: req.body.status ?? 'pending-review',
    });
    res.status(201).json(candidate);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /kb/quiz-candidates/:id/approve
// POST /kb/quiz-candidates/:id/reject
// POST /kb/quiz-candidates/:id/promote
const standalone = Router();

standalone.post('/:id/approve', async (req, res) => {
  try {
    res.json(await svc.approve(req.params.id, req.body.reviewedBy));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

standalone.post('/:id/reject', async (req, res) => {
  try {
    res.json(await svc.reject(req.params.id, req.body.reviewedBy));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

standalone.post('/:id/promote', async (req, res) => {
  try {
    res.json(await svc.promote(req.params.id, req.body.moduleId));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export { standalone as quizCandidateActions };
export default router;
