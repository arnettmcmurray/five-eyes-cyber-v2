/** An action that can be performed on a KnowledgeItem during the review/publish workflow. */
export type WorkflowAction =
  | 'submit-for-review'
  | 'approve'
  | 'reject'
  | 'request-changes'
  | 'publish'
  | 'unpublish'
  | 'archive';

/** An immutable audit-log entry recording a single workflow state transition. */
export interface WorkflowEvent {
  id: string;
  /** FK to KnowledgeItem. */
  itemId: string;
  action: WorkflowAction;
  /** Admin user id who performed the action. */
  performedBy: string;
  /** Reviewer note or rejection reason. */
  note?: string;
  fromStatus: 'draft' | 'under-review' | 'published' | 'archived';
  toStatus: 'draft' | 'under-review' | 'published' | 'archived';
  performedAt: string;
}

/** A request for an admin to review a KnowledgeItem. */
export interface ReviewRequest {
  id: string;
  /** FK to KnowledgeItem. */
  itemId: string;
  requestedBy: string;
  requestedAt: string;
  /** Admin reviewer assigned to handle this request. */
  assignedTo?: string;
  dueAt?: string;
  priority: 'low' | 'normal' | 'high';
  note?: string;
}
