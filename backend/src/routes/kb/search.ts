import { Router } from 'express';
import { KBRetrievalService } from '../../services/kb/retrieval.service.js';
import { validateQuery } from '../../validation/middleware.js';
import { searchQuerySchema } from '../../validation/kb.schemas.js';
import type { RetrievalResponse } from '../../services/kb/retrieval.service.js';

const router = Router();
const svc = new KBRetrievalService();

function toQuizAidResponse(result: RetrievalResponse) {
  const top = result.hits[0];
  return {
    query: result.query,
    confidence: result.confidence,
    band: result.band,
    kbBacked: result.hits.length > 0 && result.band !== 'low',
    hint: top
      ? {
          itemId: top.itemId,
          slug: top.slug,
          title: top.title,
          learningHint: top.excerpt,
          referenceScore: top.score,
          topics: top.topics,
        }
      : null,
    relatedItems: result.hits.slice(1).map((h) => ({
      itemId: h.itemId,
      slug: h.slug,
      title: h.title,
      topics: h.topics,
    })),
  };
}

router.get('/', validateQuery(searchQuerySchema), async (req, res) => {
  const { q, userId, topK, mode } = res.locals['query'] as {
    q: string;
    userId: string;
    topK: number;
    mode: 'fts' | 'quiz-aid';
  };

  try {
    const result = await svc.retrieve({ text: q, userId, topK });
    res.json(mode === 'quiz-aid' ? toQuizAidResponse(result) : result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
