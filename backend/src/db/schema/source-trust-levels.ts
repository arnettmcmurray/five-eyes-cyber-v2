import { pgTable, text, integer, boolean } from 'drizzle-orm/pg-core';

// Trust tiers: canonical (T0) → approved (T1) → monitored (T2) → blocked
export const sourceTrustLevels = pgTable('source_trust_levels', {
  id:                       text('id').primaryKey(),
  code:                     text('code').notNull().unique(),   // 'canonical' | 'approved' | 'monitored' | 'blocked'
  name:                     text('name').notNull(),
  description:              text('description').notNull().default(''),
  rank:                     integer('rank').notNull(),          // lower = more trusted (canonical=0)
  learnerAutoPublishAllowed: boolean('learner_auto_publish_allowed').notNull().default(false),
  reviewRequired:           boolean('review_required').notNull().default(true),
  freshnessDefaultDays:     integer('freshness_default_days').notNull().default(365),
});
