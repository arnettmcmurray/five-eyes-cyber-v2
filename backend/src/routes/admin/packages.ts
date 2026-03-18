import { Router, type Request } from 'express';
import { eq, and } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { packages, packageModules, packageGroupAssignments } from '../../db/schema/packages.js';

type AdminReq = Request & { adminUsername: string };
const router = Router();

// GET /admin/packages
router.get('/', async (_req, res) => {
  try {
    res.json(await db.select().from(packages).orderBy(packages.name));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/packages
router.post('/', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const { slug, name, description, priceCents, tier, public: isPublic } = req.body ?? {};
  if (!slug || !name) {
    res.status(400).json({ error: 'slug and name are required' });
    return;
  }
  try {
    const [row] = await db
      .insert(packages)
      .values({
        id: uuid(), slug, name,
        description: description ?? '',
        priceCents: typeof priceCents === 'number' ? priceCents : null,
        tier: tier ?? null,
        public: isPublic === true,
        createdBy: adminUsername,
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// PATCH /admin/packages/:id
router.patch('/:id', async (req, res) => {
  const { name, description, priceCents, tier, public: isPublic } = req.body ?? {};
  try {
    const updates: Partial<typeof packages.$inferInsert> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (priceCents !== undefined) updates.priceCents = typeof priceCents === 'number' ? priceCents : null;
    if (tier !== undefined) updates.tier = tier ?? null;
    if (isPublic !== undefined) updates.public = isPublic === true;
    const [row] = await db.update(packages).set(updates).where(eq(packages.id, req.params.id)).returning();
    if (!row) { res.status(404).json({ error: 'Package not found' }); return; }
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/packages/:id/modules — modules in this package
router.get('/:id/modules', async (req, res) => {
  try {
    res.json(await db.select().from(packageModules).where(eq(packageModules.packageId, req.params.id)));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/packages/:id/modules — add a module
router.post('/:id/modules', async (req, res) => {
  const { moduleId, displayOrder } = req.body ?? {};
  if (!moduleId) { res.status(400).json({ error: 'moduleId required' }); return; }
  try {
    const [row] = await db.insert(packageModules)
      .values({ id: uuid(), packageId: req.params.id, moduleId, displayOrder: String(displayOrder ?? 0) })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /admin/packages/:id/modules/:moduleId
router.delete('/:id/modules/:moduleId', async (req, res) => {
  try {
    await db.delete(packageModules)
      .where(and(
        eq(packageModules.packageId, req.params.id),
        eq(packageModules.moduleId, req.params.moduleId),
      ));
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/packages/:id/groups — assign package to a group
router.post('/:id/groups', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const { groupId } = req.body ?? {};
  if (!groupId) { res.status(400).json({ error: 'groupId is required' }); return; }
  try {
    const [row] = await db.insert(packageGroupAssignments)
      .values({ id: uuid(), packageId: req.params.id, groupId, assignedBy: adminUsername })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
