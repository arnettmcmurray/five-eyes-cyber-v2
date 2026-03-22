import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { kbItems } from './kb-items'; // eslint-disable-line

export const kbRevisions = pgTable('kb_revisions', {
  id:        text('id').primaryKey(),
  itemId:    text('item_id').notNull().references(() => kbItems.id, { onDelete: 'cascade' }),
  content:   text('content').notNull(),
  version:   integer('version').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
