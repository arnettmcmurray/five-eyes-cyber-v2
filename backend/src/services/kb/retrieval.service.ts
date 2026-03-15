import { sql } from 'drizzle-orm';
import { db } from '../../db/client.js';

export interface RetrievalQuery {
  text: string;
  userId: string;
  topK?: number;
}

export interface RetrievalHit {
  itemId: string;
  slug: string;
  title: string;
  excerpt: string;
  score: number;
  topics: Array<{ topicId: string; topicSlug: string; topicName: string; weight: number }>;
}

export interface RetrievalResponse {
  query: string;
  confidence: number;
  band: 'high' | 'medium' | 'low';
  hits: RetrievalHit[];
}

function scoreBand(score: number): RetrievalResponse['band'] {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

function excerpt(text: string, maxLen = 200): string {
  return text.length <= maxLen ? text : text.slice(0, maxLen).trimEnd() + '…';
}

export class KBRetrievalService {
  async retrieve(query: RetrievalQuery): Promise<RetrievalResponse> {
    const topK = query.topK ?? 5;

    // FTS with topics joined
    const rows = await db.execute(sql`
      SELECT
        ki.id          AS item_id,
        ki.slug,
        ki.title,
        cc.content     AS chunk_content,
        ts_rank(
          to_tsvector('english', cc.content),
          plainto_tsquery('english', ${query.text})
        )              AS rank,
        COALESCE(
          json_agg(
            json_build_object(
              'topicId',   t.id,
              'topicSlug', t.slug,
              'topicName', t.name,
              'weight',    tr.weight
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) AS topics
      FROM content_chunks cc
      JOIN kb_items ki ON ki.id = cc.item_id
      LEFT JOIN topic_relationships tr ON tr.item_id = ki.id
      LEFT JOIN topics t ON t.id = tr.topic_id
      WHERE
        ki.status = 'published'
        AND to_tsvector('english', cc.content)
            @@ plainto_tsquery('english', ${query.text})
      GROUP BY ki.id, ki.slug, ki.title, cc.content, rank
      ORDER BY rank DESC
      LIMIT ${topK}
    `);

    const hits: RetrievalHit[] = (rows.rows as Array<{
      item_id: string;
      slug: string;
      title: string;
      chunk_content: string;
      rank: string;
      topics: Array<{ topicId: string; topicSlug: string; topicName: string; weight: number }>;
    }>).map((r) => ({
      itemId: r.item_id,
      slug: r.slug,
      title: r.title,
      excerpt: excerpt(r.chunk_content),
      score: parseFloat(r.rank),
      topics: r.topics ?? [],
    }));

    const topScore = hits[0]?.score ?? 0;

    return {
      query: query.text,
      confidence: topScore,
      band: scoreBand(topScore),
      hits,
    };
  }

  async embedChunk(_chunk: { content: string }): Promise<never> {
    throw new Error('embedChunk: embedding API not configured');
  }

  async embedQuery(_text: string): Promise<never> {
    throw new Error('embedQuery: embedding API not configured');
  }
}
