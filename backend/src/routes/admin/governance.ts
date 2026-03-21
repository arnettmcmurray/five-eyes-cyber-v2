import { Router, type Request } from 'express';
import { GovernanceService } from '../../services/kb/governance.service.js';

type AdminReq = Request & { adminUsername: string };

const router = Router();
const svc = new GovernanceService();

// ── Trust Levels ──────────────────────────────────────────────────────────────

// GET /admin/source-trust-levels
router.get('/source-trust-levels', async (_req, res) => {
  try {
    res.json(await svc.listTrustLevels());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ── Sources ───────────────────────────────────────────────────────────────────

// GET /admin/sources
router.get('/sources', async (_req, res) => {
  try {
    res.json(await svc.listSources());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/sources/:id
router.get('/sources/:id', async (req, res) => {
  try {
    const src = await svc.getSourceById(req.params.id);
    if (!src) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(src);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/sources
router.post('/sources', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const { name, sourceType, domain, baseUrl, trustLevelId, status, ingestMode, notes } = req.body ?? {};
  if (!name || !domain || !trustLevelId) {
    res.status(400).json({ error: 'name, domain, and trustLevelId are required' });
    return;
  }
  try {
    res.status(201).json(await svc.createSource({
      name, sourceType, domain, baseUrl, trustLevelId, status, ingestMode, ownerUserId: adminUsername, notes,
    }));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// PATCH /admin/sources/:id
router.patch('/sources/:id', async (req, res) => {
  try {
    const updated = await svc.updateSource(req.params.id, req.body ?? {});
    if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ── Freshness Rules ───────────────────────────────────────────────────────────

// GET /admin/freshness-rules
router.get('/freshness-rules', async (_req, res) => {
  try {
    res.json(await svc.listFreshnessRules());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/freshness-rules
router.post('/freshness-rules', async (req, res) => {
  const { appliesToType, appliesToValue, reviewAfterDays, expireAfterDays, alertBeforeDays, active } = req.body ?? {};
  if (!appliesToType || !appliesToValue || reviewAfterDays == null || expireAfterDays == null) {
    res.status(400).json({ error: 'appliesToType, appliesToValue, reviewAfterDays, expireAfterDays are required' });
    return;
  }
  try {
    res.status(201).json(await svc.createFreshnessRule({
      appliesToType, appliesToValue, reviewAfterDays, expireAfterDays, alertBeforeDays, active,
    }));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// PATCH /admin/freshness-rules/:id
router.patch('/freshness-rules/:id', async (req, res) => {
  try {
    const updated = await svc.updateFreshnessRule(req.params.id, req.body ?? {});
    if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ── Review Queue ──────────────────────────────────────────────────────────────

// GET /admin/review-queue
router.get('/review-queue', async (req, res) => {
  try {
    const { status, priority } = req.query;
    res.json(await svc.listReviewQueue({
      status: typeof status === 'string' ? status : undefined,
      priority: typeof priority === 'string' ? priority : undefined,
    }));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/review-queue/:id
router.get('/review-queue/:id', async (req, res) => {
  try {
    const item = await svc.getReviewQueueItem(req.params.id);
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/review-queue/:id/decision
router.post('/review-queue/:id/decision', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const { status, resolutionNotes } = req.body ?? {};
  if (!status || !['approved', 'rejected', 'deferred'].includes(status)) {
    res.status(400).json({ error: 'status must be approved, rejected, or deferred' });
    return;
  }
  try {
    const resolved = await svc.resolveReviewQueueItem(req.params.id, {
      status, resolutionNotes, resolvedByUserId: adminUsername,
    });
    if (!resolved) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(resolved);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.startsWith('CONFLICT:')) {
      res.status(409).json({ error: msg.replace('CONFLICT: ', '') });
    } else {
      res.status(400).json({ error: msg });
    }
  }
});

// ── Content Alerts ────────────────────────────────────────────────────────────

// GET /admin/content-alerts
router.get('/content-alerts', async (req, res) => {
  try {
    const { status, severity } = req.query;
    res.json(await svc.listAlerts({
      status: typeof status === 'string' ? status : undefined,
      severity: typeof severity === 'string' ? severity : undefined,
    }));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// PATCH /admin/content-alerts/:id
router.patch('/content-alerts/:id', async (req, res) => {
  const { status } = req.body ?? {};
  try {
    const updated = await svc.updateAlert(req.params.id, {
      status,
      resolvedAt: status === 'resolved' ? new Date() : undefined,
    });
    if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.startsWith('CONFLICT:')) {
      res.status(409).json({ error: msg.replace('CONFLICT: ', '') });
    } else {
      res.status(400).json({ error: msg });
    }
  }
});

// ── KB Governance ─────────────────────────────────────────────────────────────

// GET /admin/kb/governance-summary
router.get('/kb/governance-summary', async (_req, res) => {
  try {
    res.json(await svc.getAdminGovernanceSummary());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/kb/items/:id/governance
router.get('/kb/items/:id/governance', async (req, res) => {
  try {
    const summary = await svc.getGovernanceSummary(req.params.id);
    if (!summary) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/kb/governance/backfill
router.post('/kb/governance/backfill', async (_req, res) => {
  try {
    res.json(await svc.backfillGovernanceDefaults());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /admin/kb/governance/stale-scan
router.get('/kb/governance/stale-scan', async (_req, res) => {
  try {
    res.json(await svc.scanForStaleItems());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/kb/governance/run-scan — full scan: sets nextReviewAt, updates freshnessStatus, enqueues reviews, creates alerts
router.post('/kb/governance/run-scan', async (_req, res) => {
  try {
    res.json(await svc.runGovernanceScan());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// PATCH /admin/kb/items/:id/governance — update governance fields on a KB item
router.patch('/kb/items/:id/governance', async (req, res) => {
  const { sourceId, sourceUrl, sourceTrustLevelId, reviewStatus, freshnessStatus,
          freshnessCycle, nextReviewAt, lastReviewedAt, learnerVisible } = req.body ?? {};
  try {
    const patch: Record<string, unknown> = {};
    if (sourceId !== undefined)          patch['sourceId'] = sourceId;
    if (sourceUrl !== undefined)         patch['sourceUrl'] = sourceUrl;
    if (sourceTrustLevelId !== undefined) patch['sourceTrustLevelId'] = sourceTrustLevelId;
    if (reviewStatus !== undefined)      patch['reviewStatus'] = reviewStatus;
    if (freshnessStatus !== undefined)   patch['freshnessStatus'] = freshnessStatus;
    if (freshnessCycle !== undefined)    patch['freshnessCycle'] = freshnessCycle;
    if (nextReviewAt !== undefined)      patch['nextReviewAt'] = nextReviewAt ? new Date(nextReviewAt as string) : null;
    if (lastReviewedAt !== undefined)    patch['lastReviewedAt'] = lastReviewedAt ? new Date(lastReviewedAt as string) : null;
    if (learnerVisible !== undefined)    patch['learnerVisible'] = Boolean(learnerVisible);

    const updated = await svc.updateItemGovernance(req.params.id, patch as Parameters<typeof svc.updateItemGovernance>[1]);
    if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/kb/items/:id/governance/enqueue — manually enqueue an item for review
router.post('/kb/items/:id/governance/enqueue', async (req, res) => {
  const { reasonCode = 'manual', priority } = req.body ?? {};
  try {
    res.status(201).json(await svc.enqueueForReview({
      contentItemId: req.params.id,
      reasonCode,
      priority,
    }));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/kb/items/:id/governance/alert — create an alert on a KB item
router.post('/kb/items/:id/governance/alert', async (req, res) => {
  const { alertType, severity, message } = req.body ?? {};
  if (!alertType || !message) {
    res.status(400).json({ error: 'alertType and message are required' });
    return;
  }
  try {
    res.status(201).json(await svc.createAlert({
      contentItemId: req.params.id,
      alertType,
      severity,
      message,
    }));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/kb/items/:id/governance/publish-decision
router.post('/kb/items/:id/governance/publish-decision', async (req, res) => {
  const adminUsername = (req as unknown as AdminReq).adminUsername;
  const { decision, reasonCode, notes } = req.body ?? {};
  if (!decision || !['approved', 'rejected', 'deferred'].includes(decision)) {
    res.status(400).json({ error: 'decision must be approved, rejected, or deferred' });
    return;
  }
  try {
    res.status(201).json(await svc.recordPublishDecision({
      contentItemId: req.params.id,
      decision,
      reasonCode,
      notes,
      decidedByUserId: adminUsername,
    }));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
