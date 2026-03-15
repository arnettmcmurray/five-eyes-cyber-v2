import { Router } from 'express';
import { KBIngestionService } from '../../services/kb/ingestion.service.js';
import { validateBody } from '../../validation/middleware.js';
import { ingestManualSchema, ingestFileSchema, ingestUrlSchema } from '../../validation/kb.schemas.js';

const router = Router();
const svc = new KBIngestionService();

router.post('/manual', validateBody(ingestManualSchema), async (req, res) => {
  try {
    const { content, label, createdBy } = req.body;
    res.status(201).json(await svc.ingestManual(content, label, createdBy));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/file', validateBody(ingestFileSchema), async (req, res) => {
  try {
    const { rawContent, filename, mimeType, uploadedBy } = req.body;
    res.status(201).json(await svc.ingestFile(rawContent, filename, mimeType, uploadedBy));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/url', validateBody(ingestUrlSchema), async (req, res) => {
  try {
    res.status(201).json(await svc.ingestUrl(req.body.url, req.body.fetchedBy));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const { status, createdBy } = req.query;
    res.json(await svc.listJobs({
      status: status as any,
      createdBy: createdBy as string | undefined,
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
