import { Router } from 'express';
import { KBItemService } from '../../services/kb/item.service.js';

const router = Router();
const svc = new KBItemService();

// POST /kb/items
router.post('/', async (req, res) => {
  try {
    const item = await svc.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/items
router.get('/', async (req, res) => {
  try {
    const { status, type, tags } = req.query;
    const items = await svc.list({
      status: status as string | undefined,
      type: type as string | undefined,
      tags: tags ? String(tags).split(',') : undefined,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/items/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await svc.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/items/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const item = await svc.getBySlug(req.params.slug);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// PATCH /kb/items/:id
router.patch('/:id', async (req, res) => {
  try {
    const item = await svc.update(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /kb/items/:id
router.delete('/:id', async (req, res) => {
  try {
    await svc.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
