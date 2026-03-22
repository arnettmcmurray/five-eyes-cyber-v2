import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { learners } from './learners.js';

/** A group (team, class, company, cohort). */
export const groups = pgTable('groups', {
  id:          text('id').primaryKey(),
  slug:        text('slug').notNull().unique(),
  name:        text('name').notNull(),
  description: text('description').notNull().default(''),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

/** Membership: a learner belongs to a group. */
export const groupMembers = pgTable('group_members', {
  id:        text('id').primaryKey(),
  groupId:   text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  learnerId: text('learner_id').notNull().references(() => learners.id, { onDelete: 'cascade' }),
  addedAt:   timestamp('added_at').notNull().defaultNow(),
});
