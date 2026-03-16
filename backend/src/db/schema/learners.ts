import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const learners = pgTable('learners', {
  id:        text('id').primaryKey(),
  handle:    text('handle').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
