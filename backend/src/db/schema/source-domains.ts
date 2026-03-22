import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sources } from './sources';
import { sourceTrustLevels } from './source-trust-levels';

export const sourceDomains = pgTable('source_domains', {
  id:              text('id').primaryKey(),
  domain:          text('domain').notNull().unique(),    // e.g. 'nist.gov'
  sourceId:        text('source_id').references(() => sources.id),          // nullable: unlinked domains allowed
  allowSubdomains: boolean('allow_subdomains').notNull().default(true),
  trustLevelId:    text('trust_level_id').references(() => sourceTrustLevels.id), // nullable: inherits from source
  status:          text('status').notNull().default('active'),               // 'active' | 'inactive'
  notes:           text('notes'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
  updatedAt:       timestamp('updated_at').notNull().defaultNow(),
});
