import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

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
  searchVector:      text('search_vector'),          // tsvector stored as text for FTS (updated by trigger or app)
  createdAt:         timestamp('created_at').notNull().defaultNow(),
  updatedAt:         timestamp('updated_at').notNull().defaultNow(),
});
