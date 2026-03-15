import type { ContentChunk } from '../../models/kb/chunk.js';

/** Input query for the KB retrieval service. */
export interface RetrievalQuery {
  text: string;
  userId: string;
  /** Number of top hits to return. Defaults to 5. */
  topK?: number;
}

/** A single retrieval result. */
export interface RetrievalHit {
  itemId: string;
  slug: string;
  title: string;
  excerpt: string;
  score: number;
}

/** Full retrieval response. */
export interface RetrievalResponse {
  query: string;
  confidence: number;
  /** Band thresholds: high >= 0.80, medium >= 0.50, low < 0.50 */
  band: 'high' | 'medium' | 'low';
  hits: RetrievalHit[];
  suggestedModuleSlug?: string;
}

/**
 * KB retrieval service.
 * Production: vector similarity search against ContentChunks.
 * Stub: always returns empty results with low confidence.
 */
export class KBRetrievalService {
  /**
   * Retrieves KB hits for a query.
   * Band thresholds: high >= 0.80, medium >= 0.50, low < 0.50.
   */
  async retrieve(query: RetrievalQuery): Promise<RetrievalResponse> {
    throw new Error('Not implemented: KBRetrievalService.retrieve');
  }

  /** Embeds a ContentChunk. Production: calls embedding API. */
  async embedChunk(chunk: ContentChunk): Promise<ContentChunk> {
    throw new Error('Not implemented: KBRetrievalService.embedChunk');
  }

  /** Embeds a query string. Production: calls embedding API. */
  async embedQuery(text: string): Promise<number[]> {
    throw new Error('Not implemented: KBRetrievalService.embedQuery');
  }
}
