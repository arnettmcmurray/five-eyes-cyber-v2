import { eq, desc, inArray } from 'drizzle-orm';

export interface GroupProgressDetail {
  group: { id: string; name: string; slug: string };
  memberCount: number;
  completionRate: number;
  avgScore: number | null;
  passRate: number | null;
  totalCompletions: number;
  atRiskCount: number;
  moduleStats: Array<{
    moduleId: string;
    moduleTitle: string;
    completedCount: number;
    memberCount: number;
    avgScore: number | null;
    passRate: number | null;
  }>;
  learners: Array<{
    learnerId: string;
    handle: string;
    rawEmail: string | null;
    fullName: string | null;
    company: string | null;
    totalStarted: number;
    totalCompleted: number;
    avgScore: number | null;
    lastActivityAt: string | null;
    riskFlags: string[];
  }>;
}

export interface ModuleStatSummary {
  moduleId: string;
  moduleTitle: string;
  totalLearners: number;
  totalCompleted: number;
  passRate: number | null;
  avgScore: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearnerStatSummary {
  learnerId: string;
  handle: string;
  fullName: string | null;
  rawEmail: string | null;
  company: string | null;
  totalCompleted: number;
  totalStarted: number;
  avgScore: number | null;
  lastActivityAt: string | null;
  riskFlags: Array<'inactive' | 'failing' | 'stuck' | 'no_activity'>;
}

export interface OverviewStats {
  moduleStats: ModuleStatSummary[];
  learnerStats: LearnerStatSummary[];
  groupStats: Array<{
    groupId: string;
    name: string;
    memberCount: number;
    totalCompleted: number;
    avgPercentage: number | null;
    completionRate: number;
  }>;
  globalStats: {
    totalLearners: number;
    totalWithActivity: number;
    avgCompletionRate: number;
    avgScore: number | null;
    passRate: number | null;
    totalCompletions: number;
  };
}
import { db } from '../../db/client.js';
import { learners } from '../../db/schema/learners.js';
import { learnerProgress } from '../../db/schema/learner-progress.js';
import { learningModules } from '../../db/schema/modules.js';
import { groups, groupMembers } from '../../db/schema/groups.js';

export interface LearnerSummary {
  learnerId: string;
  handle: string;
  /** Profile fields — null for learners who registered before profile fields were added. */
  rawEmail: string | null;
  fullName: string | null;
  company: string | null;
  role: string | null;
  totalStarted: number;
  totalCompleted: number;
  lastActivityAt: string | null;
}

export interface LearnerProgressDetail {
  learnerId: string;
  handle: string;
  rawEmail: string | null;
  fullName: string | null;
  company: string | null;
  role: string | null;
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

  /** Full group progress detail: per-member stats, per-module breakdown, risk flags. */
  async getGroupProgress(groupId: string): Promise<GroupProgressDetail> {
    const PASS_THRESHOLD = 80;
    const INACTIVE_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
    if (!group) throw new Error(`Group not found: ${groupId}`);

    const [members, allModuleRows] = await Promise.all([
      db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId)),
      db.select().from(learningModules),
    ]);

    const memberIds = members.map(m => m.learnerId);
    if (memberIds.length === 0) {
      return {
        group: { id: group.id, name: group.name, slug: group.slug },
        memberCount: 0, completionRate: 0, avgScore: null, passRate: null,
        totalCompletions: 0, atRiskCount: 0, moduleStats: [], learners: [],
      };
    }

    const [memberLearners, allProgress] = await Promise.all([
      db.select().from(learners).where(inArray(learners.id, memberIds)),
      db.select().from(learnerProgress).where(inArray(learnerProgress.learnerId, memberIds)),
    ]);

    const totalModules = allModuleRows.length;
    const maxPossible = memberIds.length * totalModules;

    // Per-learner stats + risk flags
    const learnerDetails = memberLearners.map(l => {
      const rows = allProgress.filter(p => p.learnerId === l.id);
      const completed = rows.filter(r => r.status === 'completed');
      const pcts = completed.map(r => r.percentage).filter((p): p is number => p !== null);
      const avgScore = pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
      const lastRow = [...rows].sort((a, b) => b.lastAttemptAt.getTime() - a.lastAttemptAt.getTime())[0];
      const lastActivityAt = lastRow?.lastAttemptAt.toISOString() ?? null;

      const riskFlags: string[] = [];
      if (rows.length === 0) riskFlags.push('no_activity');
      else if (completed.length === 0) riskFlags.push('stuck');
      if (avgScore !== null && avgScore < 60) riskFlags.push('failing');
      if (lastActivityAt && rows.length > 0 && (now - new Date(lastActivityAt).getTime()) > INACTIVE_MS) {
        riskFlags.push('inactive');
      }

      return {
        learnerId: l.id, handle: l.handle, rawEmail: l.rawEmail ?? null,
        fullName: l.fullName ?? null, company: l.company ?? null,
        totalStarted: rows.length, totalCompleted: completed.length,
        avgScore, lastActivityAt, riskFlags,
      };
    });

    // Per-module stats for this group
    const moduleStats = allModuleRows.map(m => {
      const rows = allProgress.filter(p => p.moduleId === m.id);
      const completed = rows.filter(r => r.status === 'completed');
      const pcts = completed.map(r => r.percentage).filter((p): p is number => p !== null);
      const avgScore = pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
      const passRate = completed.length > 0
        ? Math.round(pcts.filter(p => p >= PASS_THRESHOLD).length / completed.length * 100)
        : null;
      return {
        moduleId: m.id, moduleTitle: m.title,
        completedCount: completed.length,
        memberCount: memberIds.length,
        avgScore, passRate,
      };
    });

    // Group-level aggregates
    const allCompleted = allProgress.filter(p => p.status === 'completed');
    const allPcts = allCompleted.map(p => p.percentage).filter((p): p is number => p !== null);
    const avgScore = allPcts.length > 0 ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : null;
    const passRate = allCompleted.length > 0
      ? Math.round(allCompleted.filter(p => (p.percentage ?? 0) >= PASS_THRESHOLD).length / allCompleted.length * 100)
      : null;
    const completionRate = maxPossible > 0 ? Math.round(allCompleted.length / maxPossible * 100) : 0;
    const atRiskCount = learnerDetails.filter(l => l.riskFlags.length > 0).length;

    return {
      group: { id: group.id, name: group.name, slug: group.slug },
      memberCount: memberIds.length,
      completionRate, avgScore, passRate,
      totalCompletions: allCompleted.length,
      atRiskCount, moduleStats, learners: learnerDetails,
    };
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
        rawEmail: l.rawEmail ?? null,
        fullName: l.fullName ?? null,
        company: l.company ?? null,
        role: l.role ?? null,
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
      rawEmail: learner.rawEmail ?? null,
      fullName: learner.fullName ?? null,
      company: learner.company ?? null,
      role: learner.role ?? null,
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

  /** Aggregate analytics overview — all data in one call. */
  async getOverview(): Promise<OverviewStats> {
    const PASS_THRESHOLD = 80;
    const INACTIVE_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const [allLearnerRows, allProgress, allModuleRows, allGroups, allMembers] = await Promise.all([
      db.select().from(learners),
      db.select().from(learnerProgress),
      db.select().from(learningModules),
      db.select().from(groups),
      db.select().from(groupMembers),
    ]);

    const totalModules = allModuleRows.length;

    // ── Module stats ───────────────────────────────────────────
    const moduleStats: ModuleStatSummary[] = allModuleRows.map(m => {
      const rows = allProgress.filter(p => p.moduleId === m.id);
      const completed = rows.filter(r => r.status === 'completed');
      const pcts = completed.map(r => r.percentage).filter((p): p is number => p !== null);
      const passRate = completed.length > 0
        ? Math.round(pcts.filter(p => p >= PASS_THRESHOLD).length / completed.length * 100)
        : null;
      const avgScore = pcts.length > 0
        ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
        : null;
      const difficulty: 'easy' | 'medium' | 'hard' =
        passRate === null ? 'medium'
        : passRate >= 75 ? 'easy'
        : passRate >= 50 ? 'medium'
        : 'hard';
      return { moduleId: m.id, moduleTitle: m.title, totalLearners: rows.length, totalCompleted: completed.length, passRate, avgScore, difficulty };
    });

    // ── Learner stats with risk flags ──────────────────────────
    const learnerStats: LearnerStatSummary[] = allLearnerRows.map(l => {
      const rows = allProgress.filter(p => p.learnerId === l.id);
      const completed = rows.filter(r => r.status === 'completed');
      const pcts = completed.map(r => r.percentage).filter((p): p is number => p !== null);
      const avgScore = pcts.length > 0
        ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
        : null;
      const lastRow = [...rows].sort((a, b) => b.lastAttemptAt.getTime() - a.lastAttemptAt.getTime())[0];
      const lastActivityAt = lastRow?.lastAttemptAt.toISOString() ?? null;

      const riskFlags: LearnerStatSummary['riskFlags'] = [];
      if (rows.length === 0) riskFlags.push('no_activity');
      else if (completed.length === 0) riskFlags.push('stuck');
      if (avgScore !== null && avgScore < 60) riskFlags.push('failing');
      if (lastActivityAt && rows.length > 0 && (now - new Date(lastActivityAt).getTime()) > INACTIVE_MS) {
        riskFlags.push('inactive');
      }

      return {
        learnerId: l.id,
        handle: l.handle,
        fullName: l.fullName ?? null,
        rawEmail: l.rawEmail ?? null,
        company: l.company ?? null,
        totalCompleted: completed.length,
        totalStarted: rows.length,
        avgScore,
        lastActivityAt,
        riskFlags,
      };
    });

    // ── Group stats ────────────────────────────────────────────
    const groupStats = allGroups.map(g => {
      const members = allMembers.filter(m => m.groupId === g.id);
      const memberIds = new Set(members.map(m => m.learnerId));
      const memberProgress = allProgress.filter(p => memberIds.has(p.learnerId));
      const completed = memberProgress.filter(p => p.status === 'completed');
      const pcts = completed.map(p => p.percentage).filter((p): p is number => p !== null);
      const maxPossible = members.length * totalModules;
      return {
        groupId: g.id,
        name: g.name,
        memberCount: members.length,
        totalCompleted: completed.length,
        avgPercentage: pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null,
        completionRate: maxPossible > 0 ? Math.round(completed.length / maxPossible * 100) : 0,
      };
    });

    // ── Global stats ───────────────────────────────────────────
    const allCompleted = allProgress.filter(p => p.status === 'completed');
    const allPcts = allCompleted.map(p => p.percentage).filter((p): p is number => p !== null);
    const perLearnerRates = allLearnerRows.map(l => {
      const cnt = allProgress.filter(p => p.learnerId === l.id && p.status === 'completed').length;
      return totalModules > 0 ? cnt / totalModules : 0;
    });

    return {
      moduleStats,
      learnerStats,
      groupStats,
      globalStats: {
        totalLearners: allLearnerRows.length,
        totalWithActivity: allLearnerRows.filter(l => allProgress.some(p => p.learnerId === l.id)).length,
        avgCompletionRate: perLearnerRates.length > 0
          ? Math.round(perLearnerRates.reduce((a, b) => a + b, 0) / perLearnerRates.length * 100)
          : 0,
        avgScore: allPcts.length > 0 ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : null,
        passRate: allCompleted.length > 0
          ? Math.round(allCompleted.filter(p => (p.percentage ?? 0) >= PASS_THRESHOLD).length / allCompleted.length * 100)
          : null,
        totalCompletions: allCompleted.length,
      },
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
    const learnerMap = new Map(learnerRows.map(l => [l.id, l]));

    return {
      moduleId: mod.id,
      moduleTitle: mod.title,
      learners: rows.map(r => {
        const learner = learnerMap.get(r.learnerId);
        return {
          learnerId: r.learnerId,
          handle: learner?.handle ?? r.learnerId,
          fullName: learner?.fullName ?? null,
          rawEmail: learner?.rawEmail ?? null,
          status: r.status,
          score: r.score ?? null,
          total: r.total ?? null,
          percentage: r.percentage ?? null,
          lastAttemptAt: r.lastAttemptAt.toISOString(),
          completedAt: r.completedAt ? r.completedAt.toISOString() : null,
        };
      }),
    };
  }
}
