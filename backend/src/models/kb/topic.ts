/** A hierarchical topic node used to organise KB content. */
export interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** FK to parent Topic — enables topic hierarchy. */
  parentTopicId?: string;
  createdAt: string;
}

/** An association between a KnowledgeItem and a Topic with relevance weight. */
export interface TopicRelationship {
  id: string;
  /** FK to KnowledgeItem. */
  itemId: string;
  /** FK to Topic. */
  topicId: string;
  /** Relevance of this item to this topic, in the range 0.0–1.0. */
  weight: number;
  /** Whether the relationship was assigned by an admin or the pipeline. */
  assignedBy: 'admin' | 'pipeline';
  assignedAt: string;
}
