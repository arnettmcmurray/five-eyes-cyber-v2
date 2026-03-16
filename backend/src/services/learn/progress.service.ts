import { eq, inArray } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { learnerProgress } from '../../db/schema/learner-progress.js';

export interface ProgressEntry {
  moduleId: string;
  status: 'started' | 'completed';
  score: number | null;
  total: number | null;
  percentage: number | null;
  lastAttemptAt: string;
  completedAt: string | null;
}

export class LearnProgressService {
  async recordStart(learnerId: string, moduleId: string): Promise<void> {
    await db
      .insert(learnerProgress)
      .values({
        id: uuid(),
        learnerId,
        moduleId,
        status: 'started',
        lastAttemptAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [learnerProgress.learnerId, learnerProgress.moduleId],
        set: { lastAttemptAt: new Date() },
      });
  }

  async recordCompletion(
    learnerId: string,
    moduleId: string,
    score: number,
    total: number,
    percentage: number,
  ): Promise<void> {
    await db
      .insert(learnerProgress)
      .values({
        id: uuid(),
        learnerId,
        moduleId,
        status: 'completed',
        score,
        total,
        percentage,
        lastAttemptAt: new Date(),
        completedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [learnerProgress.learnerId, learnerProgress.moduleId],
        set: {
          status: 'completed',
          score,
          total,
          percentage,
          lastAttemptAt: new Date(),
          completedAt: new Date(),
        },
      });
  }

  async getProgress(learnerId: string): Promise<Map<string, ProgressEntry>> {
    const rows = await db
      .select()
      .from(learnerProgress)
      .where(eq(learnerProgress.learnerId, learnerId));

    return new Map(
      rows.map(r => [
        r.moduleId,
        {
          moduleId: r.moduleId,
          status: r.status as 'started' | 'completed',
          score: r.score ?? null,
          total: r.total ?? null,
          percentage: r.percentage ?? null,
          lastAttemptAt: r.lastAttemptAt.toISOString(),
          completedAt: r.completedAt ? r.completedAt.toISOString() : null,
        },
      ]),
    );
  }

  async getCompletedSet(learnerId: string): Promise<Set<string>> {
    const rows = await db
      .select()
      .from(learnerProgress)
      .where(eq(learnerProgress.learnerId, learnerId));

    const completed = new Set<string>();
    for (const r of rows) {
      if (r.status === 'completed') completed.add(r.moduleId);
    }
    return completed;
  }
}
