import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { contentChunks } from '../../db/schema/content-chunks.js';
import type { ContentChunk } from '../../models/kb/chunk.js';

function toModel(row: typeof contentChunks.$inferSelect): ContentChunk {
  return {
    id: row.id,
    itemId: row.itemId,
    revisionId: row.revisionId,
    chunkIndex: row.chunkIndex,
    content: row.content,
    tokenCount: row.tokenCount,
    embedding: row.embedding ?? undefined,
    embeddedAt: row.embeddedAt?.toISOString(),
    embeddingModel: row.embeddingModel ?? undefined,
  };
}

export class KBChunkService {
  async saveChunks(chunks: ContentChunk[]): Promise<ContentChunk[]> {
    if (chunks.length === 0) return [];
    const rows = await db
      .insert(contentChunks)
      .values(
        chunks.map((c) => ({
          id: c.id,
          itemId: c.itemId,
          revisionId: c.revisionId,
          chunkIndex: c.chunkIndex,
          content: c.content,
          tokenCount: c.tokenCount,
          embedding: c.embedding ?? null,
          embeddedAt: c.embeddedAt ? new Date(c.embeddedAt) : null,
          embeddingModel: c.embeddingModel ?? null,
        })),
      )
      .returning();
    return rows.map(toModel);
  }

  async getChunksForRevision(revisionId: string): Promise<ContentChunk[]> {
    const rows = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.revisionId, revisionId));
    return rows.map(toModel);
  }

  async getChunksForItem(itemId: string): Promise<ContentChunk[]> {
    const rows = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.itemId, itemId));
    return rows.map(toModel);
  }
}
