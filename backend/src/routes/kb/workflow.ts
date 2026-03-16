import { Router, type Request } from 'express';
import { KBWorkflowService } from '../../services/kb/workflow.service.js';
import { validateBody } from '../../validation/middleware.js';
import { workflowActionSchema } from '../../validation/kb.schemas.js';

type AdminReq = Request & { adminUsername: string };
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
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const { note } = req.body;

  try {
    let event;
    switch (action) {
      case 'submit':    event = await svc.submitForReview(itemId, adminUsername, note); break;
      case 'approve':   event = await svc.approve(itemId, adminUsername, note); break;
      case 'reject':    event = await svc.reject(itemId, adminUsername, note ?? ''); break;
      case 'changes':   event = await svc.requestChanges(itemId, adminUsername, note ?? ''); break;
      case 'publish':   event = await svc.publish(itemId, adminUsername); break;
      case 'unpublish': event = await svc.unpublish(itemId, adminUsername, note); break;
      case 'archive':   event = await svc.archive(itemId, adminUsername); break;
      default:
        return res.status(400).json({ error: `Unknown workflow action: ${action}` });
    }
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
