import { Router, type Request } from 'express';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { accessOverrides } from '../../db/schema/access-tiers.js';

type AdminReq = Request & { adminUsername: string };
const router = Router();

// GET /admin/access — list all overrides
router.get('/', async (_req, res) => {
  try {
    res.json(await db.select().from(accessOverrides).orderBy(accessOverrides.createdAt));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/access — grant explicit tier to a learner
// Body: { learnerId, tier: 'free'|'paid', reason?, expiresAt? }
router.post('/', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const { learnerId, tier, reason, expiresAt } = req.body ?? {};
  if (!learnerId || !tier) {
    res.status(400).json({ error: 'learnerId and tier are required' });
    return;
  }
  const validTiers = ['free', 'individual', 'professional', 'paid'];
  if (!validTiers.includes(tier)) {
    res.status(400).json({ error: `tier must be one of: ${validTiers.join(', ')}` });
    return;
  }
  let expiresAtDate: Date | null = null;
  if (expiresAt !== undefined && expiresAt !== null) {
    expiresAtDate = new Date(expiresAt);
    if (isNaN(expiresAtDate.getTime())) {
      res.status(400).json({ error: 'expiresAt must be a valid ISO date string' });
      return;
    }
  }
  try {
    const [row] = await db
      .insert(accessOverrides)
      .values({
        id: uuid(),
        learnerId,
        tier,
        reason: reason ?? '',
        grantedBy: adminUsername,
        expiresAt: expiresAtDate,
      })
      .onConflictDoUpdate({
        target: accessOverrides.learnerId,
        set: { tier, reason: reason ?? '', grantedBy: adminUsername, expiresAt: expiresAtDate },
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /admin/access/:learnerId — revoke override
router.delete('/:learnerId', async (req, res) => {
  try {
    await db.delete(accessOverrides).where(eq(accessOverrides.learnerId, req.params.learnerId));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
