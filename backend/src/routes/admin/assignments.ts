import { Router, type Request } from 'express';
import { AssignmentService } from '../../services/learn/assignment.service.js';

type AdminReq = Request & { adminUsername: string };
const router = Router();
const svc = new AssignmentService();

// POST /admin/assignments — assign module to learner or group
router.post('/', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const { moduleId, learnerId, groupId, dueAt } = req.body ?? {};
  if (!moduleId) {
    res.status(400).json({ error: 'moduleId is required' });
    return;
  }
  try {
    res.status(201).json(await svc.assign({ moduleId, learnerId, groupId, assignedBy: adminUsername, dueAt }));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /admin/assignments/:id
router.delete('/:id', async (req, res) => {
  try {
    await svc.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/assignments/module/:moduleId — all assignments for a module
router.get('/module/:moduleId', async (req, res) => {
  try {
    res.json(await svc.forModule(req.params.moduleId));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
