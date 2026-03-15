import { Router } from 'express';
import { KBRetrievalService } from '../../services/kb/retrieval.service.js';
import { validateQuery } from '../../validation/middleware.js';
import { searchQuerySchema } from '../../validation/kb.schemas.js';
import type { RetrievalResponse } from '../../services/kb/retrieval.service.js';

const router = Router();
const svc = new KBRetrievalService();

/**
 * Quiz-aid mode wraps standard FTS results with learner-facing hints.
 * KB is the authoritative source — if confidence is high/medium, we return
 * structured KB-backed hints rather than raw excerpts.
 */
function toQuizAidResponse(result: RetrievalResponse) {
  return {
    query: result.query,
    confidence: result.confidence,
    band: result.band,
    kbBacked: result.hits.length > 0 && result.band !== 'low',
    hint: result.hits[0]
      ? {
          itemId: result.hits[0].itemId,
          slug: result.hits[0].slug,
          title: result.hits[0].title,
          // Return excerpt as the learning hint, not raw answer
          learningHint: result.hits[0].excerpt,
          referenceScore: result.hits[0].score,
        }
      : null,
    relatedTopics: result.hits.slice(1).map((h) => ({
      itemId: h.itemId,
      slug: h.slug,
      title: h.title,
    })),
  };
}

// GET /kb/search?q=...&mode=fts|quiz-aid&topK=5
router.get('/', validateQuery(searchQuerySchema), async (req, res) => {
  const { q, userId, topK, mode } = res.locals["query"] as {
    q: string;
    userId: string;
    topK: number;
    mode: 'fts' | 'quiz-aid';
  };

  try {
    const result = await svc.retrieve({ text: q, userId, topK });

    if (mode === 'quiz-aid') {
      return res.json(toQuizAidResponse(result));
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
