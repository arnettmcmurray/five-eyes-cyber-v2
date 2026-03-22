import { pgTable, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { kbItems } from './kb-items';

export const lessonRoleEnum = pgEnum('lesson_role', [
  'primary', 'supplementary', 'prerequisite-reading'
]);

export const lessonContentLinks = pgTable('lesson_content_links', {
  id:        text('id').primaryKey(),
  moduleId:  text('module_id').notNull(),
  kbItemId:  text('kb_item_id').notNull().references(() => kbItems.id, { onDelete: 'cascade' }),
  role:      lessonRoleEnum('role').notNull().default('primary'),
  order:     integer('order').notNull().default(0),
  addedBy:   text('added_by').notNull(),
  addedAt:   timestamp('added_at').notNull().defaultNow(),
});
