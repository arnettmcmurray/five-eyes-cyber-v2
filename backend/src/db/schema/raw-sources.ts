import { pgTable, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const rawSourceTypeEnum = pgEnum('raw_source_type', [
  'manual-entry', 'file-upload', 'url-fetch'
]);

export const rawSources = pgTable('raw_sources', {
  id:             text('id').primaryKey(),
  type:           rawSourceTypeEnum('type').notNull(),
  label:          text('label').notNull(),
  origin:         text('origin').notNull(),
  rawContent:     text('raw_content').notNull(),
  mimeType:       text('mime_type').notNull(),
  byteSize:       integer('byte_size').notNull(),
  uploadedBy:     text('uploaded_by').notNull(),
  ingestionJobId: text('ingestion_job_id'),
  uploadedAt:     timestamp('uploaded_at').notNull().defaultNow(),
});
