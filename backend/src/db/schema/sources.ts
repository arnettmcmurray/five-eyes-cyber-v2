import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { sourceTrustLevels } from './source-trust-levels.js';

export const sourceTypeEnum = pgEnum('source_type', [
  'government', 'regulator', 'insurer', 'industry_association',
  'vendor', 'internal_curated', 'news', 'blog', 'partner', 'unknown',
]);

export const ingestModeEnum = pgEnum('ingest_mode', [
  'manual', 'scheduled', 'monitor_only',
]);

export const sourceStatusEnum = pgEnum('source_status', [
  'active', 'inactive', 'blocked',
]);

export const sources = pgTable('sources', {
  id:           text('id').primaryKey(),
  name:         text('name').notNull(),
  sourceType:   sourceTypeEnum('source_type').notNull().default('unknown'),
  domain:       text('domain').notNull(),            // e.g. 'nist.gov'
  baseUrl:      text('base_url'),
  trustLevelId: text('trust_level_id').notNull().references(() => sourceTrustLevels.id),
  status:       sourceStatusEnum('status').notNull().default('active'),
  ingestMode:   ingestModeEnum('ingest_mode').notNull().default('manual'),
  ownerUserId:  text('owner_user_id'),               // admin who owns this source
  notes:        text('notes'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});
