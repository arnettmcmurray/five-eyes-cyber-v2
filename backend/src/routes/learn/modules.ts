import { Router, type Request, type Response, type NextFunction } from 'express';
import OpenAI from 'openai';
import { LearnService } from '../../services/learn/learn.service.js';
import { ModuleService } from '../../services/kb/module.service.js';
import { LearnProgressService } from '../../services/learn/progress.service.js';
import { LearnerAuthService } from '../../services/auth/learner-auth.service.js';
import { AssignmentService } from '../../services/learn/assignment.service.js';
import { KBRetrievalService } from '../../services/kb/retrieval.service.js';
import { AccessService } from '../../services/access/access.service.js';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { modulePrerequisites, learningModules } from '../../db/schema/modules.js';
import { practiceAttempts } from '../../db/schema/practice-attempts.js';

const router = Router();
const svc = new LearnService();
const moduleSvc = new ModuleService();
const progressSvc = new LearnProgressService();
const authSvc = new LearnerAuthService();
const accessSvc = new AccessService();
const assignmentSvc = new AssignmentService();
const retrievalSvc = new KBRetrievalService();

/** Middleware: require a valid learner session (Bearer token from /auth/otp/verify). */
async function requireLearner(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const token = authHeader.slice(7);
  const learnerId = await authSvc.validateSession(token);
  if (!learnerId) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }
  (req as unknown as Request & { learnerId: string }).learnerId = learnerId;
  next();
}

/** Middleware: require Individual+ access tier (runs after requireLearner has set req.learnerId). */
async function requirePaidAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  const learnerId = (req as unknown as Request & { learnerId: string }).learnerId;
  const tier = await accessSvc.getLearnerTier(learnerId);
  if (tier === 'free') {
    res.status(403).json({ error: 'A training package is required to access modules. Contact your administrator to request access.', tier: 'free' });
    return;
  }
  next();
}

router.use(requireLearner, requirePaidAccess);

// GET /learn/modules?learnerId=xxx
router.get('/', async (req, res) => {
  const learnerId = (req as unknown as Request & { learnerId: string }).learnerId;
  try {
    const [allPublished, assignedIds, progressMap, allPrereqs] = await Promise.all([
      moduleSvc.listPublished(),
      assignmentSvc.assignedModuleIds(learnerId),
      progressSvc.getProgress(learnerId),
      db.select().from(modulePrerequisites),
    ]);

    // Show assigned modules (if any assignments exist); else all published (open catalog mode)
    const modules = assignedIds.size > 0
      ? allPublished.filter(m => assignedIds.has(m.id))
      : allPublished;

    const prereqMap = new Map<string, string[]>();
    for (const row of allPrereqs) {
      const list = prereqMap.get(row.moduleId) ?? [];
      list.push(row.prerequisiteModuleId);
      prereqMap.set(row.moduleId, list);
    }

    const completedIds = new Set(
      [...progressMap.values()]
        .filter(p => p.status === 'completed')
        .map(p => p.moduleId),
    );

    const enriched = modules.map(m => {
      const prereqs = prereqMap.get(m.id) ?? [];
      const locked = prereqs.some(pid => !completedIds.has(pid));
      const progress = progressMap.get(m.id);
      const completed = progress?.status === 'completed' === true;
      const inProgress = !completed && progress?.status === 'started';
      return {
        ...m,
        locked,
        inProgress: inProgress === true,
        completed,
        score: progress?.score ?? null,
        total: progress?.total ?? null,
        percentage: progress?.percentage ?? null,
      };
    });

    // Next recommended: prefer admin's nextModuleId off the most recently completed module,
    // then first in-progress unlocked, then first unlocked not-started — all by displayOrder.
    let nextRecommendedId: string | null = null;

    const completedEntries = [...progressMap.values()]
      .filter(p => p.status === 'completed')
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

    for (const entry of completedEntries) {
      const mod = modules.find(m => m.id === entry.moduleId);
      if (mod?.nextModuleId) {
        const target = enriched.find(m => m.id === mod.nextModuleId);
        if (target && !target.locked && !target.completed) {
          nextRecommendedId = target.id;
          break;
        }
      }
    }

    if (!nextRecommendedId) {
      const candidate =
        enriched.find(m => !m.locked && m.inProgress) ??
        enriched.find(m => !m.locked && !m.completed && !m.inProgress);
      nextRecommendedId = candidate?.id ?? null;
    }

    res.json({ modules: enriched, nextRecommendedId });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /learn/modules/:id?learnerId=xxx
router.get('/:id', async (req, res) => {
  const learnerId = (req as unknown as Request & { learnerId: string }).learnerId;
  try {
    const data = await svc.getModuleStudy(req.params.id, learnerId);
    progressSvc.recordStart(learnerId, req.params.id).catch(() => {});
    res.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg === 'Prerequisites not completed' ? 403 : 404;
    res.status(status).json({ error: msg });
  }
});

// POST /learn/modules/:id/practice
router.post('/:id/practice', async (req, res) => {
  const learnerId = (req as unknown as Request & { learnerId: string }).learnerId;
  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    res.status(400).json({ error: 'answers must be an array' });
    return;
  }
  if (answers.length > 100) {
    res.status(400).json({ error: 'answers array exceeds maximum length of 100' });
    return;
  }
  try {
    res.json(await svc.checkPractice(req.params.id, answers, learnerId));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /learn/modules/:id/prerequisites?learnerId=xxx — prereq status for locked screen
router.get('/:id/prerequisites', async (req, res) => {
  const learnerId = (req as unknown as Request & { learnerId: string }).learnerId;
  try {
    const prereqs = await db.select().from(modulePrerequisites).where(eq(modulePrerequisites.moduleId, req.params.id));
    if (prereqs.length === 0) { res.json([]); return; }
    const prereqIds = prereqs.map(p => p.prerequisiteModuleId);
    const mods = await db.select().from(learningModules).where(inArray(learningModules.id, prereqIds));
    const completed = await progressSvc.getCompletedSet(learnerId);
    res.json(mods.map(m => ({ id: m.id, slug: m.slug, title: m.title, completed: completed.has(m.id) })));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /learn/modules/:id/help?q=xxx — learner-safe KB search, scoped to this module's context
router.get('/:id/help', async (req, res) => {
  const learnerId = (req as unknown as Request & { learnerId: string }).learnerId;
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) { res.status(400).json({ error: 'q is required' }); return; }
  try {
    const result = await retrievalSvc.retrieve({ text: q, userId: learnerId, topK: 5, moduleId: req.params.id });
    // Return learner-safe shape: title, excerpt, topics — no admin fields
    res.json({
      query: result.query,
      confidence: result.confidence,
      band: result.band,
      hits: result.hits.map(h => ({
        title: h.title,
        excerpt: h.excerpt,
        topics: h.topics.map(t => ({ slug: t.topicSlug, name: t.topicName })),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /learn/modules/kb-search?q=xxx — global learner KB search (no module scope)
router.get('/kb-search', async (req, res) => {
  const learnerId = (req as unknown as Request & { learnerId: string }).learnerId;
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) { res.status(400).json({ error: 'q is required' }); return; }
  try {
    const result = await retrievalSvc.retrieve({ text: q, userId: learnerId, topK: 8 });
    res.json({
      query: result.query,
      confidence: result.confidence,
      band: result.band,
      hits: result.hits.map(h => ({
        title: h.title,
        excerpt: h.excerpt,
        topics: h.topics.map(t => ({ slug: t.topicSlug, name: t.topicName })),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /learn/modules/:id/attempts?learnerId=xxx — learner's own attempt history (scores only, no answers)
router.get('/:id/attempts', async (req, res) => {
  const learnerId = (req as unknown as Request & { learnerId: string }).learnerId;
  try {
    const rows = await db
      .select({
        id: practiceAttempts.id,
        score: practiceAttempts.score,
        total: practiceAttempts.total,
        percentage: practiceAttempts.percentage,
        passed: practiceAttempts.passed,
        attemptedAt: practiceAttempts.attemptedAt,
      })
      .from(practiceAttempts)
      .where(and(
        eq(practiceAttempts.learnerId, learnerId),
        eq(practiceAttempts.moduleId, req.params.id),
      ))
      .orderBy(desc(practiceAttempts.attemptedAt));

    res.json(rows.map(r => ({ ...r, attemptedAt: r.attemptedAt.toISOString() })));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /learn/modules/chat — learner AI assistant, KB-grounded
router.post('/chat', async (req, res) => {
  const learnerId = (req as unknown as Request & { learnerId: string }).learnerId;
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  const key = process.env['OPENAI_API_KEY'];

  // Get KB context from last user message (always attempt, even without AI key)
  const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
  let kbSnippet = '';
  if (lastUserMsg?.content) {
    try {
      const ctx = await retrievalSvc.retrieve({ text: String(lastUserMsg.content), userId: learnerId, topK: 4 });
      kbSnippet = ctx.hits.map(h => `${h.title}: ${h.excerpt}`).join('\n\n');
    } catch { /* retrieval is best-effort */ }
  }

  if (!key) {
    if (kbSnippet) {
      res.json({ content: `Based on your training materials:\n\n${kbSnippet}\n\nFor deeper AI-assisted analysis, an active AI subscription is required.` });
    } else {
      res.status(503).json({ error: 'AI unavailable' });
    }
    return;
  }

  const systemPrompt = [
    'You are a Study Assistant for the Five Eyes cybersecurity training platform — a professional security education programme for freight and logistics teams.',
    'Your role: help learners understand cybersecurity threats, policies, best practices, and how to apply them in logistics operations.',
    '',
    'RESPONSE STYLE:',
    '- Be direct and practical. Use plain language a logistics professional will understand.',
    '- Lead with the most useful answer, then provide context or examples.',
    '- Use concrete logistics examples (freight brokers, carriers, TMS, load boards, invoice fraud) when explaining concepts.',
    '- Format responses clearly: use short paragraphs or numbered/bulleted steps for procedures.',
    '- Keep responses under 250 words unless the topic genuinely requires more depth.',
    '- Do not give direct answers to quiz questions — instead explain the underlying concept.',
    '- If KB reference material is provided below, ground your answer in it. Cite it naturally ("according to your training material", "the KB notes that...").',
    '- If you are not confident about something, say so rather than speculating.',
    kbSnippet ? `\nKNOWLEDGE BASE REFERENCE (grounded, authoritative):\n${kbSnippet}` : '',
  ].filter(Boolean).join('\n');

  try {
    const client = new OpenAI({ apiKey: key });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 700,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
          content: String(m.content),
        })),
      ],
    });
    const text = completion.choices[0]?.message?.content ?? null;
    res.json({ content: text ?? 'Unable to respond at this time.' });
  } catch (err) {
    res.status(503).json({ error: err instanceof Error ? err.message : 'AI unavailable' });
  }
});

export default router;
