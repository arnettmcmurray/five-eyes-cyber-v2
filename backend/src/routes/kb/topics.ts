import { Router } from 'express';
import { KBTopicService } from '../../services/kb/topic.service.js';

const router = Router();
const svc = new KBTopicService();

// GET /kb/topics
router.get('/', async (_req, res) => {
  try {
    res.json(await svc.listTopics());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /kb/topics
router.post('/', async (req, res) => {
  try {
    res.status(201).json(await svc.createTopic(req.body));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/topics/:id
router.get('/:id', async (req, res) => {
  try {
    const topic = await svc.getTopic(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/topics/:id/items — items assigned to this topic
router.get('/:id/items', async (req, res) => {
  try {
    res.json(await svc.getItemsForTopic(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
