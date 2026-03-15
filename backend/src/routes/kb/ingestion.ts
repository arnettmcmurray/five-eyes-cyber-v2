import { Router } from 'express';
import { KBIngestionService } from '../../services/kb/ingestion.service.js';

const router = Router();
const svc = new KBIngestionService();

// POST /kb/ingest/manual
router.post('/manual', async (req, res) => {
  try {
    const { content, label, createdBy } = req.body;
    if (!content || !label || !createdBy) {
      return res.status(400).json({ error: 'content, label, createdBy required' });
    }
    res.status(201).json(await svc.ingestManual(content, label, createdBy));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /kb/ingest/file
router.post('/file', async (req, res) => {
  try {
    const { rawContent, filename, mimeType, uploadedBy } = req.body;
    if (!rawContent || !filename || !uploadedBy) {
      return res.status(400).json({ error: 'rawContent, filename, uploadedBy required' });
    }
    res.status(201).json(
      await svc.ingestFile(rawContent, filename, mimeType ?? 'text/plain', uploadedBy),
    );
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /kb/ingest/url
router.post('/url', async (req, res) => {
  try {
    const { url, fetchedBy } = req.body;
    if (!url || !fetchedBy) {
      return res.status(400).json({ error: 'url, fetchedBy required' });
    }
    res.status(201).json(await svc.ingestUrl(url, fetchedBy));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/ingest/jobs
router.get('/jobs', async (req, res) => {
  try {
    const { status, createdBy } = req.query;
    res.json(
      await svc.listJobs({
        status: status as string | undefined as any,
        createdBy: createdBy as string | undefined,
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /kb/ingest/jobs/:jobId
router.get('/jobs/:jobId', async (req, res) => {
  try {
    res.json(await svc.getJobStatus(req.params.jobId));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
