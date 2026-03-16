import { Router } from 'express';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { assessmentLeads } from '../../db/schema/access-tiers.js';
import { LearnerAuthService } from '../../services/auth/learner-auth.service.js';
import { AccessService } from '../../services/access/access.service.js';
import { assessmentRateLimit } from '../../middleware/ratelimit.js';

const router = Router();
const authSvc = new LearnerAuthService();
const accessSvc = new AccessService();

// ── Learner-facing tier check (requires learner Bearer token) ───────────────

/** GET /access/tier — { tier: 'free'|'paid', source: string } */
router.get('/tier', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const learnerId = await authSvc.validateSession(authHeader.slice(7));
  if (!learnerId) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }
  try {
    const tier = await accessSvc.getLearnerTier(learnerId);
    res.json({ tier, learnerId });
  } catch (err) {
    console.error('[Access] tier lookup error:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Assessment funnel (no learner session required) ─────────────────────────

/**
 * POST /access/assessment/start
 * Body: { email: string }
 * Creates or returns an existing assessment lead. Logs access link to console.
 */
router.post('/assessment/start', assessmentRateLimit, async (req, res) => {
  const { email } = req.body ?? {};
  if (typeof email !== 'string' || !email.includes('@') || email.length > 320) {
    res.status(400).json({ error: 'Valid email required' });
    return;
  }
  const normalized = email.trim().toLowerCase();

  try {
    // Idempotent — return existing if already started
    const [existing] = await db
      .select({ accessToken: assessmentLeads.accessToken, status: assessmentLeads.status })
      .from(assessmentLeads)
      .where(eq(assessmentLeads.email, normalized))
      .limit(1);

    if (existing) {
      // TODO: send email with link containing accessToken — currently stdout only
      console.log(`[Assessment] Re-send: email=${normalized} status=${existing.status}`);
      res.status(204).send();
      return;
    }

    const accessToken = randomBytes(24).toString('hex');
    await db.insert(assessmentLeads).values({
      id: uuid(),
      email: normalized,
      accessToken,
      status: 'pending',
    });

    // TODO: send email with link containing accessToken — currently stdout only
    console.log(`[Assessment] New lead: email=${normalized}`);
    res.status(204).send();
  } catch (err) {
    console.error('[Assessment] start error:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** Hardcoded qualification questions for the assessment. */
const ASSESSMENT_FORM = {
  title: 'Qualification Assessment',
  description: 'Help us understand your training needs.',
  questions: [
    { id: 'role', label: 'What is your primary role?', type: 'select', options: ['IT/Security', 'Management', 'Operations', 'Legal/Compliance', 'Other'] },
    { id: 'org_size', label: 'Organization size', type: 'select', options: ['1-10', '11-50', '51-200', '200+'] },
    { id: 'training_need', label: 'What training area is most urgent?', type: 'select', options: ['Cybersecurity basics', 'Incident response', 'Policy/compliance', 'Threat intelligence', 'Other'] },
    { id: 'timeline', label: 'When do you need to start?', type: 'select', options: ['Immediately', 'Within 30 days', 'Within 90 days', 'Exploring'] },
    { id: 'notes', label: 'Anything else to share?', type: 'text' },
  ],
};

/**
 * GET /access/assessment/:token
 * Returns the assessment form. Marks lead as 'started' on first access.
 */
router.get('/assessment/:token', async (req, res) => {
  try {
    const [lead] = await db
      .select()
      .from(assessmentLeads)
      .where(eq(assessmentLeads.accessToken, req.params.token))
      .limit(1);

    if (!lead) { res.status(404).json({ error: 'Invalid assessment link' }); return; }
    if (lead.status === 'pending') {
      await db.update(assessmentLeads)
        .set({ status: 'started' })
        .where(eq(assessmentLeads.id, lead.id));
    }

    res.json({ form: ASSESSMENT_FORM, email: lead.email, status: lead.status === 'pending' ? 'started' : lead.status });
  } catch (err) {
    console.error('[Assessment] get form error:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /access/assessment/:token
 * Body: { answers: Record<string, string> }
 * Saves answers and marks assessment completed.
 */
router.post('/assessment/:token', async (req, res) => {
  const { answers } = req.body ?? {};
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    res.status(400).json({ error: 'answers must be a plain object' });
    return;
  }
  if (Object.keys(answers).length > 20) {
    res.status(400).json({ error: 'answers object exceeds maximum allowed fields' });
    return;
  }
  try {
    const [lead] = await db
      .select()
      .from(assessmentLeads)
      .where(eq(assessmentLeads.accessToken, req.params.token))
      .limit(1);

    if (!lead) { res.status(404).json({ error: 'Invalid assessment link' }); return; }
    if (lead.status === 'completed') { res.status(409).json({ error: 'Assessment already completed' }); return; }

    await db.update(assessmentLeads)
      .set({ answers: JSON.stringify(answers), status: 'completed', completedAt: new Date() })
      .where(eq(assessmentLeads.id, lead.id));

    console.log(`[Assessment] Completed: email=${lead.email}`);
    res.json({ ok: true, message: 'Thank you. Our team will follow up with your access details.' });
  } catch (err) {
    console.error('[Assessment] submit error:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
