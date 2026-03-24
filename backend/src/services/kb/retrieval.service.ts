import { sql } from 'drizzle-orm';
import { db } from '../../db/client.js';

export interface RetrievalQuery {
  text: string;
  userId: string;
  topK?: number;
  moduleId?: string; // when provided, scope results to items linked to this module first
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

type RawRow = {
  item_id: string;
  slug: string;
  title: string;
  chunk_content: string;
  rank: string;
  topics: Array<{ topicId: string; topicSlug: string; topicName: string; weight: number }>;
};

export class KBRetrievalService {
  async retrieve(query: RetrievalQuery): Promise<RetrievalResponse> {
    const topK = query.topK ?? 5;

    // When moduleId is provided, try scoped retrieval first.
    // Fall back to global if scoped returns no hits (e.g. cross-module questions).
    if (query.moduleId) {
      const scoped = await this._fetchHits(query.text, topK, query.moduleId);
      if (scoped.length > 0) {
        const topScore = scoped[0]?.score ?? 0;
        return { query: query.text, confidence: topScore, band: scoreBand(topScore), hits: scoped };
      }
    }

    const hits = await this._fetchHits(query.text, topK, undefined);
    const topScore = hits[0]?.score ?? 0;
    return { query: query.text, confidence: topScore, band: scoreBand(topScore), hits };
  }

  private async _fetchHits(text: string, topK: number, moduleId?: string): Promise<RetrievalHit[]> {
    // B3: learner_visible = true enforced here — learners must not see hidden content
    // B2: when moduleId present, scope to items linked via lesson_content_links
    const scopeClause = moduleId
      ? sql`AND ki.id IN (SELECT kb_item_id FROM lesson_content_links WHERE module_id = ${moduleId})`
      : sql``;

    const rows = await db.execute(sql`
      SELECT
        ki.id          AS item_id,
        ki.slug,
        ki.title,
        cc.content     AS chunk_content,
        ts_rank(
          to_tsvector('english', cc.content),
          plainto_tsquery('english', ${text})
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
        AND ki.learner_visible = true
        ${scopeClause}
        AND to_tsvector('english', cc.content)
            @@ plainto_tsquery('english', ${text})
      GROUP BY ki.id, ki.slug, ki.title, cc.content, rank
      ORDER BY rank DESC
      LIMIT ${topK}
    `);

    return (rows.rows as RawRow[]).map((r) => ({
      itemId: r.item_id,
      slug: r.slug,
      title: r.title,
      excerpt: excerpt(r.chunk_content),
      score: parseFloat(r.rank),
      topics: r.topics ?? [],
    }));
  }

  async embedChunk(_chunk: { content: string }): Promise<never> {
    throw new Error('embedChunk: embedding API not configured');
  }

  async embedQuery(_text: string): Promise<never> {
    throw new Error('embedQuery: embedding API not configured');
  }
}
