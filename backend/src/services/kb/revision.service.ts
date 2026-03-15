/** A persisted KnowledgeRevision record. */
export interface KnowledgeRevisionRecord {
  id: string;
  itemId: string;
  content: string;
  version: number;
  createdBy: string;
  createdAt: string;
}

/** Manages KnowledgeRevisions — creating new revisions and reading history. */
export class KBRevisionService {
  async createRevision(
    itemId: string,
    content: string,
    createdBy: string,
  ): Promise<KnowledgeRevisionRecord> {
    throw new Error('Not implemented: KBRevisionService.createRevision');
  }

  async getRevision(revisionId: string): Promise<KnowledgeRevisionRecord | null> {
    throw new Error('Not implemented: KBRevisionService.getRevision');
  }

  async listRevisions(itemId: string): Promise<KnowledgeRevisionRecord[]> {
    throw new Error('Not implemented: KBRevisionService.listRevisions');
  }

  async rollback(
    itemId: string,
    targetRevisionId: string,
    performedBy: string,
  ): Promise<KnowledgeRevisionRecord> {
    throw new Error('Not implemented: KBRevisionService.rollback');
  }
}
