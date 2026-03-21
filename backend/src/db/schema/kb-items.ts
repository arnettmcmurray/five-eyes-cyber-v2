import { pgTable, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';

export const kbItemTypeEnum = pgEnum('kb_item_type', [
  'training-content', 'threat-brief', 'policy', 'faq', 'glossary-term'
]);
export const kbItemStatusEnum = pgEnum('kb_item_status', [
  'draft', 'under-review', 'published', 'archived'
]);
export const sourceTrustEnum = pgEnum('source_trust', [
  'internal', 'external-curated', 'raw-upload'
]);

export const kbItems = pgTable('kb_items', {
  id:                text('id').primaryKey(),
  slug:              text('slug').notNull().unique(),
  title:             text('title').notNull(),
  type:              kbItemTypeEnum('type').notNull(),
  tags:              text('tags').array().notNull().default([]),
  status:            kbItemStatusEnum('status').notNull().default('draft'),
  sourceTrust:       sourceTrustEnum('source_trust').notNull(),
  createdBy:         text('created_by').notNull(),
  currentRevisionId: text('current_revision_id'),   // nullable initially
  searchVector:      text('search_vector'),          // tsvector stored as text for FTS
  // Governance / freshness tracking
  freshnessCycle:    text('freshness_cycle'),        // 'high' | 'medium' | 'low' | 'regulatory' | 'framework' | null
  publishedAt:       timestamp('published_at'),      // set when first moved to published status
  lastReviewedAt:    timestamp('last_reviewed_at'),  // set by admin on each review
  // Source governance overlay (nullable for backwards compat with existing 88 items)
  sourceId:          text('source_id'),              // FK → sources.id (soft ref, no constraint to avoid circular)
  sourceUrl:         text('source_url'),             // direct URL of source material
  sourceTrustLevelId: text('source_trust_level_id'), // FK → source_trust_levels.id (soft ref)
  reviewStatus:      text('review_status'),          // 'pending' | 'in_review' | 'approved' | 'rejected' | 'deferred'
  freshnessStatus:   text('freshness_status'),       // 'current' | 'stale' | 'expired'
  nextReviewAt:      timestamp('next_review_at'),    // when this item should next be reviewed
  learnerVisible:    boolean('learner_visible').notNull().default(false),  // false = hidden from learner API
  createdAt:         timestamp('created_at').notNull().defaultNow(),
  updatedAt:         timestamp('updated_at').notNull().defaultNow(),
});
