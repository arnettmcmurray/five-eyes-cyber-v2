import { Router } from 'express';
import { KBRetrievalService } from '../../services/kb/retrieval.service.js';

const router = Router();
const svc = new KBRetrievalService();

// GET /kb/search?q=...&topK=5
router.get('/', async (req, res) => {
  const { q, topK, userId } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'q is required' });
  }
  try {
    const result = await svc.retrieve({
      text: q,
      userId: (userId as string) || 'anonymous',
      topK: topK ? parseInt(topK as string, 10) : 5,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
