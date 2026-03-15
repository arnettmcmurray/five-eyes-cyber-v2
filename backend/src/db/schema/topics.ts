import { pgTable, text, timestamp, real } from 'drizzle-orm/pg-core';
import { kbItems } from './kb-items.js';

export const topics = pgTable('topics', {
  id:            text('id').primaryKey(),
  slug:          text('slug').notNull().unique(),
  name:          text('name').notNull(),
  description:   text('description').notNull().default(''),
  parentTopicId: text('parent_topic_id'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
});

export const topicRelationships = pgTable('topic_relationships', {
  id:          text('id').primaryKey(),
  itemId:      text('item_id').notNull().references(() => kbItems.id, { onDelete: 'cascade' }),
  topicId:     text('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  weight:      real('weight').notNull().default(1.0),
  assignedBy:  text('assigned_by').notNull(), // 'admin' | 'pipeline'
  assignedAt:  timestamp('assigned_at').notNull().defaultNow(),
});
