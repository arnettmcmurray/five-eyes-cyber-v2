import { pgTable, text, integer, timestamp, customType } from 'drizzle-orm/pg-core';
import { kbItems } from './kb-items.js';
import { kbRevisions } from './kb-revisions.js';

const vector = customType<{ data: number[]; driverData: string }>({
  dataType() { return 'vector(1536)'; },
  toDriver(value: number[]): string { return `[${value.join(',')}]`; },
  fromDriver(value: string): number[] {
    return value.replace(/^\[|\]$/g, '').split(',').map(Number);
  },
});

export const contentChunks = pgTable('content_chunks', {
  id:             text('id').primaryKey(),
  itemId:         text('item_id').notNull().references(() => kbItems.id, { onDelete: 'cascade' }),
  revisionId:     text('revision_id').notNull().references(() => kbRevisions.id, { onDelete: 'cascade' }),
  chunkIndex:     integer('chunk_index').notNull(),
  content:        text('content').notNull(),
  tokenCount:     integer('token_count').notNull(),
  embedding:      vector('embedding'),              // nullable, filled when embedded
  embeddedAt:     timestamp('embedded_at'),
  embeddingModel: text('embedding_model'),
});
