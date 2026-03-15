import type { WorkflowEvent } from '../../models/kb/workflow.js';

/** Admin review and publish workflow for KnowledgeItems. */
export class KBWorkflowService {
  async submitForReview(
    itemId: string,
    requestedBy: string,
    note?: string,
  ): Promise<WorkflowEvent> {
    throw new Error('Not implemented: KBWorkflowService.submitForReview');
  }

  async approve(itemId: string, adminId: string, note?: string): Promise<WorkflowEvent> {
    throw new Error('Not implemented: KBWorkflowService.approve');
  }

  async reject(itemId: string, adminId: string, note: string): Promise<WorkflowEvent> {
    throw new Error('Not implemented: KBWorkflowService.reject');
  }

  async requestChanges(itemId: string, adminId: string, note: string): Promise<WorkflowEvent> {
    throw new Error('Not implemented: KBWorkflowService.requestChanges');
  }

  async publish(itemId: string, adminId: string): Promise<WorkflowEvent> {
    throw new Error('Not implemented: KBWorkflowService.publish');
  }

  async unpublish(itemId: string, adminId: string, note?: string): Promise<WorkflowEvent> {
    throw new Error('Not implemented: KBWorkflowService.unpublish');
  }

  async archive(itemId: string, adminId: string): Promise<WorkflowEvent> {
    throw new Error('Not implemented: KBWorkflowService.archive');
  }

  async getHistory(itemId: string): Promise<WorkflowEvent[]> {
    throw new Error('Not implemented: KBWorkflowService.getHistory');
  }
}
