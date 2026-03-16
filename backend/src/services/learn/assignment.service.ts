import { eq, and, or, inArray } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { moduleAssignments } from '../../db/schema/module-assignments.js';
import { groupMembers } from '../../db/schema/groups.js';
import { learningModules } from '../../db/schema/modules.js';

export interface Assignment {
  id: string;
  moduleId: string;
  moduleTitle: string;
  learnerId: string | null;
  groupId: string | null;
  assignedBy: string;
  assignedAt: string;
  dueAt: string | null;
}

export class AssignmentService {
  /** Assign a module to a learner or group. */
  async assign(input: {
    moduleId: string;
    learnerId?: string;
    groupId?: string;
    assignedBy: string;
    dueAt?: string;
  }): Promise<Assignment> {
    if (!input.learnerId && !input.groupId) throw new Error('Must specify learnerId or groupId');
    if (input.learnerId && input.groupId) throw new Error('Cannot specify both learnerId and groupId');

    const [mod] = await db.select().from(learningModules).where(eq(learningModules.id, input.moduleId)).limit(1);
    if (!mod) throw new Error(`Module not found: ${input.moduleId}`);

    const [row] = await db
      .insert(moduleAssignments)
      .values({
        id: uuid(),
        moduleId: input.moduleId,
        learnerId: input.learnerId ?? null,
        groupId: input.groupId ?? null,
        assignedBy: input.assignedBy,
        dueAt: input.dueAt ? new Date(input.dueAt) : null,
      })
      .returning();

    return this.toModel(row, mod.title);
  }

  /** Revoke an assignment. */
  async remove(assignmentId: string): Promise<void> {
    await db.delete(moduleAssignments).where(eq(moduleAssignments.id, assignmentId));
  }

  /** All assignments for a specific module (admin). */
  async forModule(moduleId: string): Promise<Assignment[]> {
    const rows = await db
      .select()
      .from(moduleAssignments)
      .where(eq(moduleAssignments.moduleId, moduleId));

    const [mod] = await db.select().from(learningModules).where(eq(learningModules.id, moduleId)).limit(1);
    return rows.map(r => this.toModel(r, mod?.title ?? moduleId));
  }

  /**
   * All module IDs assigned to a learner, either directly or via group membership.
   * Used by learner flow to filter the module list.
   */
  async assignedModuleIds(learnerId: string): Promise<Set<string>> {
    // Groups the learner belongs to
    const memberships = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.learnerId, learnerId));
    const groupIds = memberships.map(m => m.groupId);

    // Direct + group assignments
    const conditions = [eq(moduleAssignments.learnerId, learnerId)];
    if (groupIds.length > 0) {
      conditions.push(inArray(moduleAssignments.groupId, groupIds));
    }

    const rows = await db
      .select({ moduleId: moduleAssignments.moduleId })
      .from(moduleAssignments)
      .where(or(...conditions));

    return new Set(rows.map(r => r.moduleId));
  }

  private toModel(row: typeof moduleAssignments.$inferSelect, moduleTitle: string): Assignment {
    return {
      id: row.id,
      moduleId: row.moduleId,
      moduleTitle,
      learnerId: row.learnerId ?? null,
      groupId: row.groupId ?? null,
      assignedBy: row.assignedBy,
      assignedAt: row.assignedAt.toISOString(),
      dueAt: row.dueAt ? row.dueAt.toISOString() : null,
    };
  }
}
