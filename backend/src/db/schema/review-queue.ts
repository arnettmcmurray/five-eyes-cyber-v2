import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { kbItems } from './kb-items';
import { sources } from './sources';

export const reviewQueueStatusEnum = pgEnum('review_queue_status', [
  'pending', 'in_review', 'approved', 'rejected', 'deferred',
]);

export const reviewPriorityEnum = pgEnum('review_priority', [
  'low', 'normal', 'high', 'blocking',
]);

export const reviewQueue = pgTable('review_queue', {
  id:              text('id').primaryKey(),
  contentItemId:   text('content_item_id').notNull().references(() => kbItems.id, { onDelete: 'cascade' }),
  sourceId:        text('source_id').references(() => sources.id),   // nullable: not all items have a source
  reasonCode:      text('reason_code').notNull(),                     // e.g. 'freshness_expired', 'new_item', 'source_flag', 'manual'
  priority:        reviewPriorityEnum('priority').notNull().default('normal'),
  status:          reviewQueueStatusEnum('status').notNull().default('pending'),
  assignedToUserId: text('assigned_to_user_id'),
  openedAt:        timestamp('opened_at').notNull().defaultNow(),
  resolvedAt:      timestamp('resolved_at'),
  resolutionNotes: text('resolution_notes'),
});
