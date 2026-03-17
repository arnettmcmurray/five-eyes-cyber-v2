import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// Freshness rules: define review and expiry windows by content dimension
// appliesToType: 'kb_item_type' | 'tag' | 'source_trust_code' | 'topic_slug'
// appliesToValue: the actual value (e.g., 'threat-brief', 'canonical', 'double-brokering')
export const freshnessRules = pgTable('freshness_rules', {
  id:               text('id').primaryKey(),
  appliesToType:    text('applies_to_type').notNull(),
  appliesToValue:   text('applies_to_value').notNull(),
  reviewAfterDays:  integer('review_after_days').notNull(),
  expireAfterDays:  integer('expire_after_days').notNull(),
  alertBeforeDays:  integer('alert_before_days').notNull().default(30),
  active:           boolean('active').notNull().default(true),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow(),
});
