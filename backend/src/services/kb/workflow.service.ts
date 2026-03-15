import { eq, asc } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { workflowEvents } from '../../db/schema/workflow.js';
import { kbItems } from '../../db/schema/kb-items.js';
import type { WorkflowEvent } from '../../models/kb/workflow.js';

type KBStatus = 'draft' | 'under-review' | 'published' | 'archived';
type WorkflowAction = WorkflowEvent['action'];

const STATUS_TRANSITIONS: Record<WorkflowAction, { from: KBStatus[]; to: KBStatus }> = {
  'submit-for-review': { from: ['draft'], to: 'under-review' },
  'approve':           { from: ['under-review'], to: 'under-review' },
  'reject':            { from: ['under-review'], to: 'draft' },
  'request-changes':   { from: ['under-review'], to: 'draft' },
  'publish':           { from: ['under-review'], to: 'published' },
  'unpublish':         { from: ['published'], to: 'under-review' },
  'archive':           { from: ['draft', 'under-review', 'published'], to: 'archived' },
};

function toModel(row: typeof workflowEvents.$inferSelect): WorkflowEvent {
  return {
    id: row.id,
    itemId: row.itemId,
    action: row.action as WorkflowAction,
    performedBy: row.performedBy,
    note: row.note ?? undefined,
    fromStatus: row.fromStatus as KBStatus,
    toStatus: row.toStatus as KBStatus,
    performedAt: row.performedAt.toISOString(),
  };
}

async function transition(
  itemId: string,
  action: WorkflowAction,
  performedBy: string,
  note?: string,
): Promise<WorkflowEvent> {
  const [item] = await db.select().from(kbItems).where(eq(kbItems.id, itemId)).limit(1);
  if (!item) throw new Error(`KBItem not found: ${itemId}`);

  const rule = STATUS_TRANSITIONS[action];
  const currentStatus = item.status as KBStatus;

  if (!rule.from.includes(currentStatus)) {
    throw new Error(
      `Cannot perform '${action}' on item in status '${currentStatus}'. Expected: ${rule.from.join(' or ')}`,
    );
  }

  // Update item status
  await db
    .update(kbItems)
    .set({ status: rule.to })
    .where(eq(kbItems.id, itemId));

  // Record audit event
  const [event] = await db
    .insert(workflowEvents)
    .values({
      id: uuid(),
      itemId,
      action,
      performedBy,
      note: note ?? null,
      fromStatus: currentStatus,
      toStatus: rule.to,
    })
    .returning();

  return toModel(event);
}

export class KBWorkflowService {
  async submitForReview(itemId: string, requestedBy: string, note?: string): Promise<WorkflowEvent> {
    return transition(itemId, 'submit-for-review', requestedBy, note);
  }

  async approve(itemId: string, adminId: string, note?: string): Promise<WorkflowEvent> {
    return transition(itemId, 'approve', adminId, note);
  }

  async reject(itemId: string, adminId: string, note: string): Promise<WorkflowEvent> {
    return transition(itemId, 'reject', adminId, note);
  }

  async requestChanges(itemId: string, adminId: string, note: string): Promise<WorkflowEvent> {
    return transition(itemId, 'request-changes', adminId, note);
  }

  async publish(itemId: string, adminId: string): Promise<WorkflowEvent> {
    return transition(itemId, 'publish', adminId);
  }

  async unpublish(itemId: string, adminId: string, note?: string): Promise<WorkflowEvent> {
    return transition(itemId, 'unpublish', adminId, note);
  }

  async archive(itemId: string, adminId: string): Promise<WorkflowEvent> {
    return transition(itemId, 'archive', adminId);
  }

  async getHistory(itemId: string): Promise<WorkflowEvent[]> {
    const rows = await db
      .select()
      .from(workflowEvents)
      .where(eq(workflowEvents.itemId, itemId))
      .orderBy(asc(workflowEvents.performedAt));
    return rows.map(toModel);
  }
}
