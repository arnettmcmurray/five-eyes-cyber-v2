import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { kbItems } from './kb-items.js';
import { sources } from './sources.js';

export const alertSeverityEnum = pgEnum('alert_severity', [
  'info', 'warning', 'critical',
]);

export const alertStatusEnum = pgEnum('alert_status', [
  'open', 'acknowledged', 'resolved',
]);

export const contentAlerts = pgTable('content_alerts', {
  id:            text('id').primaryKey(),
  contentItemId: text('content_item_id').notNull().references(() => kbItems.id, { onDelete: 'cascade' }),
  sourceId:      text('source_id').references(() => sources.id),
  alertType:     text('alert_type').notNull(),     // e.g. 'freshness_expired', 'source_blocked', 'review_overdue', 'ioc_detected'
  severity:      alertSeverityEnum('severity').notNull().default('warning'),
  status:        alertStatusEnum('status').notNull().default('open'),
  message:       text('message').notNull(),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  resolvedAt:    timestamp('resolved_at'),
});
