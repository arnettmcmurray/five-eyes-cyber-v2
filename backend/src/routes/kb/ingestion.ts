import { Router, type Request } from 'express';
import { KBIngestionService } from '../../services/kb/ingestion.service.js';
import { validateBody } from '../../validation/middleware.js';
import { ingestManualSchema, ingestFileSchema, ingestUrlSchema } from '../../validation/kb.schemas.js';

type AdminReq = Request & { adminUsername: string };
const router = Router();
const svc = new KBIngestionService();

router.post('/manual', validateBody(ingestManualSchema), async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  try {
    const { content, label } = req.body;
    res.status(201).json(await svc.ingestManual(content, label, adminUsername));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/file', validateBody(ingestFileSchema), async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  try {
    const { rawContent, filename, mimeType } = req.body;
    res.status(201).json(await svc.ingestFile(rawContent, filename, mimeType, adminUsername));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/url', validateBody(ingestUrlSchema), async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  try {
    res.status(201).json(await svc.ingestUrl(req.body.url, adminUsername));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/jobs', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  try {
    const { status } = req.query;
    res.json(await svc.listJobs({
      status: status as any,
      createdBy: adminUsername,
    }));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/jobs/:jobId', async (req, res) => {
  try {
    res.json(await svc.getJobStatus(req.params.jobId));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
