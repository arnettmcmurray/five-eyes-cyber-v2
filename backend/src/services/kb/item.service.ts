/** A persisted KnowledgeItem record. */
export interface KnowledgeItemRecord {
  id: string;
  slug: string;
  title: string;
  type: 'training-content' | 'threat-brief' | 'policy' | 'faq' | 'glossary-term';
  tags: string[];
  status: 'draft' | 'under-review' | 'published';
  sourceTrust: 'internal' | 'external-curated' | 'raw-upload';
  createdBy: string;
  currentRevisionId: string;
  createdAt: string;
  updatedAt: string;
}

/** CRUD operations for KnowledgeItems. */
export class KBItemService {
  async create(
    data: Omit<KnowledgeItemRecord, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<KnowledgeItemRecord> {
    throw new Error('Not implemented: KBItemService.create');
  }

  async getById(id: string): Promise<KnowledgeItemRecord | null> {
    throw new Error('Not implemented: KBItemService.getById');
  }

  async getBySlug(slug: string): Promise<KnowledgeItemRecord | null> {
    throw new Error('Not implemented: KBItemService.getBySlug');
  }

  async list(filters?: {
    status?: string;
    type?: string;
    tags?: string[];
  }): Promise<KnowledgeItemRecord[]> {
    throw new Error('Not implemented: KBItemService.list');
  }

  async update(id: string, data: Partial<KnowledgeItemRecord>): Promise<KnowledgeItemRecord> {
    throw new Error('Not implemented: KBItemService.update');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented: KBItemService.delete');
  }
}
