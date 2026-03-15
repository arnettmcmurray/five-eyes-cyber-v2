import { Router } from 'express';
import { KBTopicService } from '../../services/kb/topic.service.js';
import { validateBody } from '../../validation/middleware.js';
import { createTopicSchema } from '../../validation/kb.schemas.js';

const router = Router();
const svc = new KBTopicService();

router.get('/', async (_req, res) => {
  try {
    res.json(await svc.listTopics());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/', validateBody(createTopicSchema), async (req, res) => {
  try {
    res.status(201).json(await svc.createTopic(req.body));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const topic = await svc.getTopic(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/:id/items', async (req, res) => {
  try {
    res.json(await svc.getItemsForTopic(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;

import { z } from 'zod';

const assignSchema = z.object({
  itemId: z.string().min(1),
  weight: z.number().min(0).max(1).default(1.0),
  assignedBy: z.enum(['admin', 'pipeline']).default('admin'),
});

// POST /kb/topics/:id/assign
router.post('/:id/assign', validateBody(assignSchema), async (req, res) => {
  try {
    const { itemId, weight, assignedBy } = req.body;
    res.status(201).json(
      await svc.assignTopic(itemId, String(req.params.id), weight, assignedBy),
    );
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
