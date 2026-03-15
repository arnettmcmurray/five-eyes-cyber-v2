import { sql, eq, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { kbItems } from '../../db/schema/kb-items.js';
import { contentChunks } from '../../db/schema/content-chunks.js';

export interface RetrievalQuery {
  text: string;
  userId: string;
  /** Number of top hits to return. Defaults to 5. */
  topK?: number;
}

export interface RetrievalHit {
  itemId: string;
  slug: string;
  title: string;
  excerpt: string;
  score: number;
}

export interface RetrievalResponse {
  query: string;
  confidence: number;
  /** Band thresholds: high >= 0.80, medium >= 0.50, low < 0.50 */
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
  /**
   * Full-text keyword search against content_chunks.
   * Uses PostgreSQL plainto_tsquery + ts_rank for scoring.
   * Falls back to empty results if no published chunks exist.
   */
  async retrieve(query: RetrievalQuery): Promise<RetrievalResponse> {
    const topK = query.topK ?? 5;

    // plainto_tsquery handles multi-word queries safely (no injection risk)
    const rows = await db.execute(sql`
      SELECT
        ki.id        AS item_id,
        ki.slug,
        ki.title,
        cc.content   AS chunk_content,
        ts_rank(
          to_tsvector('english', cc.content),
          plainto_tsquery('english', ${query.text})
        )            AS rank
      FROM content_chunks cc
      JOIN kb_items ki ON ki.id = cc.item_id
      WHERE
        ki.status = 'published'
        AND to_tsvector('english', cc.content)
            @@ plainto_tsquery('english', ${query.text})
      ORDER BY rank DESC
      LIMIT ${topK}
    `);

    const hits: RetrievalHit[] = (rows.rows as Array<{
      item_id: string;
      slug: string;
      title: string;
      chunk_content: string;
      rank: string;
    }>).map((r) => ({
      itemId: r.item_id,
      slug: r.slug,
      title: r.title,
      excerpt: excerpt(r.chunk_content),
      score: parseFloat(r.rank),
    }));

    const topScore = hits[0]?.score ?? 0;

    return {
      query: query.text,
      confidence: topScore,
      band: scoreBand(topScore),
      hits,
    };
  }

  /** Placeholder — will call embedding API when vector search is wired. */
  async embedChunk(_chunk: { content: string }): Promise<never> {
    throw new Error('embedChunk: embedding API not configured');
  }

  async embedQuery(_text: string): Promise<never> {
    throw new Error('embedQuery: embedding API not configured');
  }
}
