import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { kbItems } from './kb-items';

export const workflowActionEnum = pgEnum('workflow_action', [
  'submit-for-review', 'approve', 'reject', 'request-changes', 'publish', 'unpublish', 'archive'
]);
export const kbStatusTransitionEnum = pgEnum('kb_status_transition', [
  'draft', 'under-review', 'published', 'archived'
]);

export const workflowEvents = pgTable('workflow_events', {
  id:          text('id').primaryKey(),
  itemId:      text('item_id').notNull().references(() => kbItems.id, { onDelete: 'cascade' }),
  action:      workflowActionEnum('action').notNull(),
  performedBy: text('performed_by').notNull(),
  note:        text('note'),
  fromStatus:  kbStatusTransitionEnum('from_status').notNull(),
  toStatus:    kbStatusTransitionEnum('to_status').notNull(),
  performedAt: timestamp('performed_at').notNull().defaultNow(),
});

export const reviewRequests = pgTable('review_requests', {
  id:          text('id').primaryKey(),
  itemId:      text('item_id').notNull().references(() => kbItems.id, { onDelete: 'cascade' }),
  requestedBy: text('requested_by').notNull(),
  assignedTo:  text('assigned_to'),
  dueAt:       timestamp('due_at'),
  priority:    text('priority').notNull().default('normal'), // 'low' | 'normal' | 'high'
  note:        text('note'),
  requestedAt: timestamp('requested_at').notNull().defaultNow(),
});
