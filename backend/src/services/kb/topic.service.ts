import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { topics, topicRelationships } from '../../db/schema/topics.js';
import type { Topic, TopicRelationship } from '../../models/kb/topic.js';

function toTopic(row: typeof topics.$inferSelect): Topic {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    parentTopicId: row.parentTopicId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function toRelationship(row: typeof topicRelationships.$inferSelect): TopicRelationship {
  return {
    id: row.id,
    itemId: row.itemId,
    topicId: row.topicId,
    weight: row.weight ?? 1.0,
    assignedBy: row.assignedBy as 'admin' | 'pipeline',
    assignedAt: row.assignedAt.toISOString(),
  };
}

export class KBTopicService {
  async createTopic(data: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
    const [row] = await db
      .insert(topics)
      .values({
        id: uuid(),
        slug: data.slug,
        name: data.name,
        description: data.description,
        parentTopicId: data.parentTopicId ?? null,
      })
      .returning();
    return toTopic(row);
  }

  async getTopic(id: string): Promise<Topic | null> {
    const [row] = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
    return row ? toTopic(row) : null;
  }

  async listTopics(): Promise<Topic[]> {
    const rows = await db.select().from(topics);
    return rows.map(toTopic);
  }

  async assignTopic(
    itemId: string,
    topicId: string,
    weight: number,
    assignedBy: 'admin' | 'pipeline',
  ): Promise<TopicRelationship> {
    const [row] = await db
      .insert(topicRelationships)
      .values({ id: uuid(), itemId, topicId, weight, assignedBy })
      .returning();
    return toRelationship(row);
  }

  async getTopicsForItem(itemId: string): Promise<TopicRelationship[]> {
    const rows = await db
      .select()
      .from(topicRelationships)
      .where(eq(topicRelationships.itemId, itemId));
    return rows.map(toRelationship);
  }

  async getItemsForTopic(topicId: string): Promise<TopicRelationship[]> {
    const rows = await db
      .select()
      .from(topicRelationships)
      .where(eq(topicRelationships.topicId, topicId));
    return rows.map(toRelationship);
  }
}
