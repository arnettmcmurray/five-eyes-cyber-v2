import { Router, type Request } from 'express';
import { KBItemService } from '../../services/kb/item.service.js';
import { validateBody, validateQuery } from '../../validation/middleware.js';
import { createItemSchema, updateItemSchema } from '../../validation/kb.schemas.js';
import { z } from 'zod';

type AdminReq = Request & { adminUsername: string };
const router = Router();
const svc = new KBItemService();

const listQuerySchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  tags: z.string().optional(),
});

router.post('/', validateBody(createItemSchema), async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  try {
    res.status(201).json(await svc.create({ ...req.body, createdBy: adminUsername }));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/', validateQuery(listQuerySchema), async (req, res) => {
  try {
    const { status, type, tags } = res.locals["query"] as z.infer<typeof listQuerySchema>;
    res.json(await svc.list({
      status: status as string | undefined,
      type: type as string | undefined,
      tags: tags ? (Array.isArray(tags) ? tags : String(tags).split(',')) : undefined,
    }));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const item = await svc.getBySlug(String(req.params.slug));
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await svc.getById(String(req.params.id));
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.patch('/:id', validateBody(updateItemSchema), async (req, res) => {
  try {
    res.json(await svc.update(String(req.params.id), req.body));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await svc.delete(String(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
