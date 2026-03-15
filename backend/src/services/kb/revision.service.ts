import { eq, asc, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { kbRevisions } from '../../db/schema/kb-revisions.js';
import { kbItems } from '../../db/schema/kb-items.js';

export interface KnowledgeRevisionRecord {
  id: string;
  itemId: string;
  content: string;
  version: number;
  createdBy: string;
  createdAt: string;
}

function toRecord(row: typeof kbRevisions.$inferSelect): KnowledgeRevisionRecord {
  return {
    id: row.id,
    itemId: row.itemId,
    content: row.content,
    version: row.version,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  };
}

export class KBRevisionService {
  async createRevision(
    itemId: string,
    content: string,
    createdBy: string,
  ): Promise<KnowledgeRevisionRecord> {
    const existing = await db
      .select({ version: kbRevisions.version })
      .from(kbRevisions)
      .where(eq(kbRevisions.itemId, itemId))
      .orderBy(sql`${kbRevisions.version} desc`)
      .limit(1);

    const nextVersion = existing.length ? existing[0].version + 1 : 1;
    const revId = uuid();

    const [rev] = await db
      .insert(kbRevisions)
      .values({ id: revId, itemId, content, version: nextVersion, createdBy })
      .returning();

    // Point item to the new revision
    await db
      .update(kbItems)
      .set({ currentRevisionId: revId, updatedAt: sql`now()` })
      .where(eq(kbItems.id, itemId));

    return toRecord(rev);
  }

  async getRevision(revisionId: string): Promise<KnowledgeRevisionRecord | null> {
    const [row] = await db
      .select()
      .from(kbRevisions)
      .where(eq(kbRevisions.id, revisionId))
      .limit(1);
    return row ? toRecord(row) : null;
  }

  async listRevisions(itemId: string): Promise<KnowledgeRevisionRecord[]> {
    const rows = await db
      .select()
      .from(kbRevisions)
      .where(eq(kbRevisions.itemId, itemId))
      .orderBy(asc(kbRevisions.version));
    return rows.map(toRecord);
  }

  async rollback(
    itemId: string,
    targetRevisionId: string,
    performedBy: string,
  ): Promise<KnowledgeRevisionRecord> {
    const target = await this.getRevision(targetRevisionId);
    if (!target || target.itemId !== itemId) {
      throw new Error(`Revision ${targetRevisionId} not found for item ${itemId}`);
    }
    // Create a new revision with the same content as the target
    return this.createRevision(itemId, target.content, performedBy);
  }
}
