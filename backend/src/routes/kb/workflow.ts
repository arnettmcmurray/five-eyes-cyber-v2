import { Router } from 'express';
import { KBWorkflowService } from '../../services/kb/workflow.service.js';
import { validateBody } from '../../validation/middleware.js';
import { workflowActionSchema } from '../../validation/kb.schemas.js';

const router = Router({ mergeParams: true });
const svc = new KBWorkflowService();

router.get('/', async (req, res) => {
  try {
    res.json(await svc.getHistory((req.params as any).itemId));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/:action', validateBody(workflowActionSchema), async (req, res) => {
  const { action } = req.params;
  const itemId = (req.params as any).itemId;
  const { performedBy, note } = req.body;

  try {
    let event;
    switch (action) {
      case 'submit':    event = await svc.submitForReview(itemId, performedBy, note); break;
      case 'approve':   event = await svc.approve(itemId, performedBy, note); break;
      case 'reject':    event = await svc.reject(itemId, performedBy, note ?? ''); break;
      case 'changes':   event = await svc.requestChanges(itemId, performedBy, note ?? ''); break;
      case 'publish':   event = await svc.publish(itemId, performedBy); break;
      case 'unpublish': event = await svc.unpublish(itemId, performedBy, note); break;
      case 'archive':   event = await svc.archive(itemId, performedBy); break;
      default:
        return res.status(400).json({ error: `Unknown workflow action: ${action}` });
    }
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
