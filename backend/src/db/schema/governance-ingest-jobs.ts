import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { sources } from './sources.js';

// Separate from the existing ingestion_jobs table (which tracks raw-source processing).
// This tracks governance-layer source pulls: full refreshes, incremental checks, manual triggers.
export const governanceIngestJobs = pgTable('governance_ingest_jobs', {
  id:           text('id').primaryKey(),
  sourceId:     text('source_id').notNull().references(() => sources.id),
  jobType:      text('job_type').notNull().default('manual'),    // 'full' | 'incremental' | 'manual'
  status:       text('status').notNull().default('pending'),     // 'pending' | 'running' | 'completed' | 'failed'
  startedAt:    timestamp('started_at'),
  completedAt:  timestamp('completed_at'),
  itemsSeen:    integer('items_seen').notNull().default(0),
  itemsCreated: integer('items_created').notNull().default(0),
  itemsUpdated: integer('items_updated').notNull().default(0),
  itemsFlagged: integer('items_flagged').notNull().default(0),
  errorText:    text('error_text'),
  metadata:     text('metadata'),                                // JSON blob for extra context
  createdAt:    timestamp('created_at').notNull().defaultNow(),
});
