import { eq, desc, inArray } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { learners } from '../../db/schema/learners.js';
import { learnerProgress } from '../../db/schema/learner-progress.js';
import { learningModules } from '../../db/schema/modules.js';
import { groups, groupMembers } from '../../db/schema/groups.js';

export interface LearnerSummary {
  learnerId: string;
  handle: string;
  totalStarted: number;
  totalCompleted: number;
  lastActivityAt: string | null;
}

export interface LearnerProgressDetail {
  learnerId: string;
  handle: string;
  modules: Array<{
    moduleId: string;
    moduleTitle: string;
    status: string;
    score: number | null;
    total: number | null;
    percentage: number | null;
    lastAttemptAt: string;
    completedAt: string | null;
  }>;
}

export interface ModuleProgressDetail {
  moduleId: string;
  moduleTitle: string;
  learners: Array<{
    learnerId: string;
    handle: string;
    status: string;
    score: number | null;
    total: number | null;
    percentage: number | null;
    lastAttemptAt: string;
    completedAt: string | null;
  }>;
}

export interface GroupSummary {
  groupId: string;
  slug: string;
  name: string;
  memberCount: number;
  totalCompleted: number;
  avgPercentage: number | null;
}

export class AdminProgressService {
  async listGroups(): Promise<GroupSummary[]> {
    const allGroups = await db.select().from(groups).orderBy(groups.name);
    const allMembers = await db.select().from(groupMembers);
    const allProgress = await db.select().from(learnerProgress);

    return allGroups.map(g => {
      const members = allMembers.filter(m => m.groupId === g.id);
      const memberIds = new Set(members.map(m => m.learnerId));
      const memberProgress = allProgress.filter(p => memberIds.has(p.learnerId));
      const completed = memberProgress.filter(p => p.status === 'completed');
      const percentages = completed.map(p => p.percentage).filter((p): p is number => p !== null);
      return {
        groupId: g.id,
        slug: g.slug,
        name: g.name,
        memberCount: members.length,
        totalCompleted: completed.length,
        avgPercentage: percentages.length > 0
          ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
          : null,
      };
    });
  }

  /** All learner summaries scoped to a group. */
  async getGroupProgress(groupId: string): Promise<{ group: { id: string; name: string }; learners: LearnerSummary[] }> {
    const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
    if (!group) throw new Error(`Group not found: ${groupId}`);

    const members = await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
    const memberIds = members.map(m => m.learnerId);
    if (memberIds.length === 0) return { group: { id: group.id, name: group.name }, learners: [] };

    const memberLearners = await db.select().from(learners).where(inArray(learners.id, memberIds));
    const allProgress = await db.select().from(learnerProgress).where(inArray(learnerProgress.learnerId, memberIds));

    const summaries: LearnerSummary[] = memberLearners.map(l => {
      const rows = allProgress.filter(p => p.learnerId === l.id);
      const lastRow = [...rows].sort((a, b) => b.lastAttemptAt.getTime() - a.lastAttemptAt.getTime())[0];
      return {
        learnerId: l.id,
        handle: l.handle,
        totalStarted: rows.length,
        totalCompleted: rows.filter(r => r.status === 'completed').length,
        lastActivityAt: lastRow ? lastRow.lastAttemptAt.toISOString() : null,
      };
    });

    return { group: { id: group.id, name: group.name }, learners: summaries };
  }


  /** All learners with summary stats. */
  async listLearners(): Promise<LearnerSummary[]> {
    const allLearners = await db.select().from(learners).orderBy(learners.handle);
    const allProgress = await db.select().from(learnerProgress);

    return allLearners.map(l => {
      const rows = allProgress.filter(p => p.learnerId === l.id);
      const lastRow = rows.sort((a, b) =>
        b.lastAttemptAt.getTime() - a.lastAttemptAt.getTime(),
      )[0];
      return {
        learnerId: l.id,
        handle: l.handle,
        totalStarted: rows.length,
        totalCompleted: rows.filter(r => r.status === 'completed').length,
        lastActivityAt: lastRow ? lastRow.lastAttemptAt.toISOString() : null,
      };
    });
  }

  /** Full progress detail for one learner across all modules. */
  async getLearnerProgress(learnerId: string): Promise<LearnerProgressDetail> {
    const [learner] = await db.select().from(learners).where(eq(learners.id, learnerId)).limit(1);
    if (!learner) throw new Error(`Learner not found: ${learnerId}`);

    const rows = await db
      .select()
      .from(learnerProgress)
      .where(eq(learnerProgress.learnerId, learnerId))
      .orderBy(desc(learnerProgress.lastAttemptAt));

    const moduleIds = rows.map(r => r.moduleId);
    const mods = moduleIds.length > 0
      ? await db.select().from(learningModules)
      : [];
    const modMap = new Map(mods.map(m => [m.id, m.title]));

    return {
      learnerId: learner.id,
      handle: learner.handle,
      modules: rows.map(r => ({
        moduleId: r.moduleId,
        moduleTitle: modMap.get(r.moduleId) ?? r.moduleId,
        status: r.status,
        score: r.score ?? null,
        total: r.total ?? null,
        percentage: r.percentage ?? null,
        lastAttemptAt: r.lastAttemptAt.toISOString(),
        completedAt: r.completedAt ? r.completedAt.toISOString() : null,
      })),
    };
  }

  /** All learner progress on a specific module. */
  async getModuleProgress(moduleId: string): Promise<ModuleProgressDetail> {
    const [mod] = await db.select().from(learningModules).where(eq(learningModules.id, moduleId)).limit(1);
    if (!mod) throw new Error(`Module not found: ${moduleId}`);

    const rows = await db
      .select()
      .from(learnerProgress)
      .where(eq(learnerProgress.moduleId, moduleId))
      .orderBy(desc(learnerProgress.lastAttemptAt));

    const learnerIds = rows.map(r => r.learnerId);
    const learnerRows = learnerIds.length > 0
      ? await db.select().from(learners)
      : [];
    const learnerMap = new Map(learnerRows.map(l => [l.id, l.handle]));

    return {
      moduleId: mod.id,
      moduleTitle: mod.title,
      learners: rows.map(r => ({
        learnerId: r.learnerId,
        handle: learnerMap.get(r.learnerId) ?? r.learnerId,
        status: r.status,
        score: r.score ?? null,
        total: r.total ?? null,
        percentage: r.percentage ?? null,
        lastAttemptAt: r.lastAttemptAt.toISOString(),
        completedAt: r.completedAt ? r.completedAt.toISOString() : null,
      })),
    };
  }
}
