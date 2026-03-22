import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { learners } from './learners';
import { learningModules } from './modules';

/** One full practice attempt for a module. */
export const practiceAttempts = pgTable('practice_attempts', {
  id:         text('id').primaryKey(),
  learnerId:  text('learner_id').notNull().references(() => learners.id, { onDelete: 'cascade' }),
  moduleId:   text('module_id').notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
  score:      integer('score').notNull(),
  total:      integer('total').notNull(),
  percentage: integer('percentage').notNull(),
  passed:     boolean('passed').notNull(),
  /** Per-question results — stored as JSON, admin-only; includes correctIndex + explanation */
  results:    jsonb('results').notNull(),
  attemptedAt: timestamp('attempted_at').notNull().defaultNow(),
});
