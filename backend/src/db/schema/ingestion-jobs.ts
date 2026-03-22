import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { rawSources } from './raw-sources.js';

export const ingestionStatusEnum = pgEnum('ingestion_status', [
  'pending', 'extracting', 'processing', 'review-ready', 'failed', 'completed'
]);

export const ingestionJobs = pgTable('ingestion_jobs', {
  id:             text('id').primaryKey(),
  sourceId:       text('source_id').notNull().references(() => rawSources.id),
  status:         ingestionStatusEnum('status').notNull().default('pending'),
  errorMessage:   text('error_message'),
  resultItemId:   text('result_item_id'),
  createdBy:      text('created_by').notNull(),
  startedAt:      timestamp('started_at'),
  completedAt:    timestamp('completed_at'),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
});
