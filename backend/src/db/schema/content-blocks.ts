import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

/**
 * Admin-managed content blocks for landing page, library links, and news/announcements.
 * kind: 'landing' | 'library-link' | 'news'
 */
export const contentBlocks = pgTable('content_blocks', {
  id:          text('id').primaryKey(),
  kind:        text('kind').notNull(),             // 'landing' | 'library-link' | 'news'
  slug:        text('slug').notNull().unique(),    // machine identifier
  title:       text('title').notNull(),
  body:        text('body').notNull().default(''), // markdown or plain text
  /** For library-link kind: the URL being linked. */
  linkUrl:     text('link_url'),
  /** Display order within a kind. */
  displayOrder: integer('display_order').notNull().default(0),
  published:   boolean('published').notNull().default(false),
  createdBy:   text('created_by').notNull(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
});
