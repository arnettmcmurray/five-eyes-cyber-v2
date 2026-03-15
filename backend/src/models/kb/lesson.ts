/** A link between a training Module and a KnowledgeItem, with a role and display order. */
export interface LessonContentLink {
  id: string;
  /** FK to Module (from domain.ts). */
  moduleId: string;
  /** FK to KnowledgeItem. */
  kbItemId: string;
  /** The role this KB item plays within the module. */
  role: 'primary' | 'supplementary' | 'prerequisite-reading';
  /** Display order within the module. */
  order: number;
  addedBy: string;
  addedAt: string;
}
