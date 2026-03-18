import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const learningModules = pgTable('learning_modules', {
  id:           text('id').primaryKey(),
  slug:         text('slug').notNull().unique(),
  title:        text('title').notNull(),
  description:  text('description').notNull().default(''),
  published:    boolean('published').notNull().default(false),
  displayOrder: integer('display_order').notNull().default(0),
  nextModuleId: text('next_module_id'),   // soft ref — no FK to avoid circular constraint
  /** Estimated completion time in minutes. Shown to learners before they start. */
  estimatedMinutes: integer('estimated_minutes'),
  createdBy:    text('created_by').notNull(),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

export const modulePrerequisites = pgTable('module_prerequisites', {
  id:                   text('id').primaryKey(),
  moduleId:             text('module_id').notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
  prerequisiteModuleId: text('prerequisite_module_id').notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
  createdAt:            timestamp('created_at').notNull().defaultNow(),
});
