import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { kbItems } from './kb-items.js';

export const publishDecisionEnum = pgEnum('publish_decision', [
  'approved', 'rejected', 'deferred',
]);

export const publishDecisions = pgTable('publish_decisions', {
  id:             text('id').primaryKey(),
  contentItemId:  text('content_item_id').notNull().references(() => kbItems.id, { onDelete: 'cascade' }),
  decision:       publishDecisionEnum('decision').notNull(),
  reasonCode:     text('reason_code'),    // e.g. 'source_verified', 'accuracy_confirmed', 'ioc_present', 'stale'
  notes:          text('notes'),
  decidedByUserId: text('decided_by_user_id').notNull(),
  decidedAt:      timestamp('decided_at').notNull().defaultNow(),
});
