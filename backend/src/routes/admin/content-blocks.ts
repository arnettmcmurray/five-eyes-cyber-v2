import { Router, type Request } from 'express';
import { eq, asc } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { contentBlocks } from '../../db/schema/content-blocks.js';

type AdminReq = Request & { adminUsername: string };
const router = Router();

const VALID_KINDS = ['landing', 'library-link', 'news'];

// GET /admin/content-blocks?kind=...
router.get('/', async (req, res) => {
  try {
    const kind = req.query['kind'] as string | undefined;
    const rows = kind
      ? await db.select().from(contentBlocks).where(eq(contentBlocks.kind, kind)).orderBy(asc(contentBlocks.displayOrder))
      : await db.select().from(contentBlocks).orderBy(asc(contentBlocks.kind), asc(contentBlocks.displayOrder));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/content-blocks
router.post('/', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const { kind, slug, title, body, linkUrl, displayOrder, published } = req.body ?? {};
  if (!kind || !VALID_KINDS.includes(kind)) {
    res.status(400).json({ error: `kind must be one of: ${VALID_KINDS.join(', ')}` });
    return;
  }
  if (!slug || !title) {
    res.status(400).json({ error: 'slug and title are required' });
    return;
  }
  try {
    const [row] = await db
      .insert(contentBlocks)
      .values({
        id: uuid(), kind, slug, title,
        body: body ?? '',
        linkUrl: linkUrl ?? null,
        displayOrder: displayOrder ?? 0,
        published: published === true,
        createdBy: adminUsername,
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// PATCH /admin/content-blocks/:id
router.patch('/:id', async (req, res) => {
  const { title, body, linkUrl, displayOrder, published } = req.body ?? {};
  try {
    const updates: Partial<typeof contentBlocks.$inferInsert> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (body !== undefined) updates.body = body;
    if (linkUrl !== undefined) updates.linkUrl = linkUrl ?? null;
    if (displayOrder !== undefined) updates.displayOrder = displayOrder;
    if (published !== undefined) updates.published = published === true;
    const [row] = await db.update(contentBlocks).set(updates).where(eq(contentBlocks.id, req.params.id)).returning();
    if (!row) { res.status(404).json({ error: 'Block not found' }); return; }
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /admin/content-blocks/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.delete(contentBlocks).where(eq(contentBlocks.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
