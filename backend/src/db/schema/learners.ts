import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const learners = pgTable('learners', {
  id:        text('id').primaryKey(),
  handle:    text('handle').notNull().unique(),
  /** Original email address as submitted (un-normalized). Null for legacy rows. */
  rawEmail:  text('raw_email'),
  /** Display name collected at registration. */
  fullName:  text('full_name'),
  /** Company / organisation name. */
  company:   text('company'),
  /** Job title or role. */
  role:      text('role'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
});
