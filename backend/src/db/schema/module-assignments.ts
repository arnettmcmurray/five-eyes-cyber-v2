import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { learningModules } from './modules';

/**
 * Assigns a module to a learner OR a group.
 * Exactly one of learnerId / groupId must be non-null.
 * Enforced in the service layer.
 */
export const moduleAssignments = pgTable('module_assignments', {
  id:          text('id').primaryKey(),
  moduleId:    text('module_id').notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
  /** Assigned to a specific learner. Mutually exclusive with groupId. */
  learnerId:   text('learner_id'),
  /** Assigned to an entire group. Mutually exclusive with learnerId. */
  groupId:     text('group_id'),
  assignedBy:  text('assigned_by').notNull(),
  assignedAt:  timestamp('assigned_at').notNull().defaultNow(),
  /** Optional due date for the assignment. */
  dueAt:       timestamp('due_at'),
});
