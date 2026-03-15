/** Lifecycle status of a quiz candidate question extracted from KB content. */
export type QuizCandidateStatus =
  | 'pending-review'
  | 'approved'
  | 'rejected'
  | 'promoted'; // promoted = converted into an actual QuizQuestion on a Module

/** A quiz question candidate extracted from a KnowledgeItem revision. */
export interface QuizCandidate {
  id: string;
  /** FK to KnowledgeItem. */
  kbItemId: string;
  /** FK to KnowledgeRevision — which revision this was extracted from. */
  revisionId: string;
  questionText: string;
  /** Four answer options. */
  options: string[];
  suggestedCorrectIndex: number;
  explanation: string;
  status: QuizCandidateStatus;
  /** Extraction confidence in the range 0.0–1.0. */
  confidence: number;
  /** Admin user id who reviewed this candidate. */
  reviewedBy?: string;
  reviewedAt?: string;
  /** FK to Module — set when status is 'promoted'. */
  promotedToModuleId?: string;
  createdAt: string;
}
