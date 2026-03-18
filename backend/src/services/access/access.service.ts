import { eq, and, gt, isNull, or, inArray } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { accessOverrides } from '../../db/schema/access-tiers.js';
import { moduleAssignments } from '../../db/schema/module-assignments.js';
import { groupMembers } from '../../db/schema/groups.js';
import { packageGroupAssignments } from '../../db/schema/packages.js';

export type AccessTier = 'free' | 'paid';

export class AccessService {
  /**
   * Determine a learner's access tier.
   *
   * Priority:
   *  1. Explicit override in access_overrides (with expiry check)
   *  2. If learner has any direct module assignment → paid
   *  3. If learner is in a group that has a package assignment → paid
   *  4. Default: free
   */
  async getLearnerTier(learnerId: string): Promise<AccessTier> {
    // 1. Explicit override
    const [override] = await db
      .select()
      .from(accessOverrides)
      .where(and(
        eq(accessOverrides.learnerId, learnerId),
        or(isNull(accessOverrides.expiresAt), gt(accessOverrides.expiresAt, new Date())),
      ))
      .limit(1);

    if (override) return override.tier as AccessTier;

    // 2. Direct module assignment
    const [direct] = await db
      .select({ id: moduleAssignments.id })
      .from(moduleAssignments)
      .where(eq(moduleAssignments.learnerId, learnerId))
      .limit(1);

    if (direct) return 'paid';

    // 3. Group → package assignment
    const groups = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.learnerId, learnerId));

    if (groups.length > 0) {
      const groupIds = groups.map(g => g.groupId);
      const [pkgAssignment] = await db
        .select({ id: packageGroupAssignments.id })
        .from(packageGroupAssignments)
        .where(inArray(packageGroupAssignments.groupId, groupIds))
        .limit(1);

      if (pkgAssignment) return 'paid';
    }

    return 'free';
  }
}
