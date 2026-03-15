import { eq, and, arrayContains, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { kbItems } from '../../db/schema/kb-items.js';

export interface KnowledgeItemRecord {
  id: string;
  slug: string;
  title: string;
  type: 'training-content' | 'threat-brief' | 'policy' | 'faq' | 'glossary-term';
  tags: string[];
  status: 'draft' | 'under-review' | 'published';
  sourceTrust: 'internal' | 'external-curated' | 'raw-upload';
  createdBy: string;
  currentRevisionId: string | null;
  createdAt: string;
  updatedAt: string;
}

function toRecord(row: typeof kbItems.$inferSelect): KnowledgeItemRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    tags: row.tags,
    status: row.status as KnowledgeItemRecord['status'],
    sourceTrust: row.sourceTrust,
    createdBy: row.createdBy,
    currentRevisionId: row.currentRevisionId ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class KBItemService {
  async create(
    data: Omit<KnowledgeItemRecord, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<KnowledgeItemRecord> {
    const [row] = await db
      .insert(kbItems)
      .values({
        id: uuid(),
        slug: data.slug,
        title: data.title,
        type: data.type,
        tags: data.tags,
        status: data.status,
        sourceTrust: data.sourceTrust,
        createdBy: data.createdBy,
        currentRevisionId: data.currentRevisionId ?? null,
      })
      .returning();
    return toRecord(row);
  }

  async getById(id: string): Promise<KnowledgeItemRecord | null> {
    const [row] = await db.select().from(kbItems).where(eq(kbItems.id, id)).limit(1);
    return row ? toRecord(row) : null;
  }

  async getBySlug(slug: string): Promise<KnowledgeItemRecord | null> {
    const [row] = await db.select().from(kbItems).where(eq(kbItems.slug, slug)).limit(1);
    return row ? toRecord(row) : null;
  }

  async list(filters?: {
    status?: string;
    type?: string;
    tags?: string[];
  }): Promise<KnowledgeItemRecord[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(kbItems.status, filters.status as typeof kbItems.status._.data));
    if (filters?.type) conditions.push(eq(kbItems.type, filters.type as typeof kbItems.type._.data));
    if (filters?.tags?.length) conditions.push(arrayContains(kbItems.tags, filters.tags));

    const rows = conditions.length
      ? await db.select().from(kbItems).where(and(...conditions))
      : await db.select().from(kbItems);

    return rows.map(toRecord);
  }

  async update(id: string, data: Partial<KnowledgeItemRecord>): Promise<KnowledgeItemRecord> {
    const [row] = await db
      .update(kbItems)
      .set({
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.sourceTrust !== undefined && { sourceTrust: data.sourceTrust }),
        ...(data.currentRevisionId !== undefined && { currentRevisionId: data.currentRevisionId }),
        updatedAt: sql`now()`,
      })
      .where(eq(kbItems.id, id))
      .returning();
    if (!row) throw new Error(`KBItem not found: ${id}`);
    return toRecord(row);
  }

  async delete(id: string): Promise<void> {
    await db.delete(kbItems).where(eq(kbItems.id, id));
  }
}
