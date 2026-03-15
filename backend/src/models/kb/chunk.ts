/** A text chunk of a KnowledgeItem revision used for retrieval and embedding. */
export interface ContentChunk {
  id: string;
  /** FK to KnowledgeItem. */
  itemId: string;
  /** FK to KnowledgeRevision. */
  revisionId: string;
  chunkIndex: number;
  /** The chunk text. */
  content: string;
  tokenCount: number;
  /** Vector embedding — absent until the embedding pipeline has run. */
  embedding?: number[];
  embeddedAt?: string;
  /** Embedding model used, e.g. 'text-embedding-3-small'. */
  embeddingModel?: string;
}
