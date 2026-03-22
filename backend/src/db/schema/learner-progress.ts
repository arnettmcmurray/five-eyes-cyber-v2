import { pgTable, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { learningModules } from './modules';

export const learnerProgress = pgTable('learner_progress', {
  id:            text('id').primaryKey(),
  learnerId:     text('learner_id').notNull(),
  moduleId:      text('module_id').notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
  status:        text('status').notNull().default('started'), // 'started' | 'completed'
  score:         integer('score'),
  total:         integer('total'),
  percentage:    integer('percentage'),
  lastAttemptAt: timestamp('last_attempt_at').notNull().defaultNow(),
  completedAt:   timestamp('completed_at'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
}, (t) => [
  uniqueIndex('learner_progress_learner_module_uniq').on(t.learnerId, t.moduleId),
]);
