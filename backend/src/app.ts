import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { sql } from 'drizzle-orm';
import { db } from './db/client.js';
import itemsRouter from './routes/kb/items.js';
import revisionsRouter from './routes/kb/revisions.js';
import searchRouter from './routes/kb/search.js';
import topicsRouter from './routes/kb/topics.js';
import ingestionRouter from './routes/kb/ingestion.js';
import quizCandidatesRouter, { quizCandidateActions } from './routes/kb/quiz-candidates.js';
import lessonsRouter from './routes/kb/lessons.js';
import workflowRouter from './routes/kb/workflow.js';
import modulesRouter from './routes/kb/modules.js';
import learnModulesRouter from './routes/learn/modules.js';
import adminProgressRouter from './routes/admin/progress.js';
import adminAssignmentsRouter from './routes/admin/assignments.js';
import adminPackagesRouter from './routes/admin/packages.js';
import adminProfileRouter from './routes/admin/profile.js';
import adminContentBlocksRouter from './routes/admin/content-blocks.js';
import accessRouter from './routes/access/access.js';
import adminAccessOverridesRouter from './routes/admin/access-overrides.js';
import authRouter from './routes/auth/auth.js';
import ttxScenariosRouter from './routes/ttx/scenarios.js';
import ttxSessionsRouter from './routes/ttx/sessions.js';
import ttxParticipateRouter from './routes/ttx/participate.js';
import ttxAssistRouter from './routes/ttx/assist.js';
import { requireAdmin } from './middleware/requireAdmin.js';
import {
  authRateLimit,
  assessmentRateLimit,
  ingestRateLimit,
  participateRateLimit,
  assistRateLimit,
} from './middleware/ratelimit.js';

export const app = express();

// Security headers — must come before route handlers.
// CSP is set to default-src 'none' because this is a JSON API (no HTML/resources served).
// HSTS is enabled now; it will only be meaningful once TLS is in place at the reverse proxy.
// Helmet removes X-Powered-By automatically.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,   // not applicable for a JSON API
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

app.use(cors({
  origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
}));

// Global body limit: 100kb covers all routes except KB ingest (handled separately below)
app.use(express.json({ limit: '100kb' }));

// Request logger — logs method, path, and status code (no body or query params to avoid secret leakage)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${ms}ms`);
  });
  next();
});

// API key guard (skip health check)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health') return next();
  const apiKey = process.env['API_KEY'];
  if (apiKey && req.headers['x-api-key'] !== apiKey && req.query['x-api-key'] !== apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

// Health + readiness — checks DB connectivity
app.get('/health', async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok', db: 'ok', ts: new Date().toISOString() });
  } catch {
    // DB down — return 503 so load balancers/orchestrators can route around this instance
    res.status(503).json({ status: 'degraded', db: 'unreachable', ts: new Date().toISOString() });
  }
});

app.use('/kb/items', requireAdmin, itemsRouter);
app.use('/kb/items/:itemId/revisions', requireAdmin, revisionsRouter);
app.use('/kb/items/:itemId/quiz-candidates', requireAdmin, quizCandidatesRouter);
app.use('/kb/items/:itemId/workflow', requireAdmin, workflowRouter);
app.use('/kb/search', requireAdmin, searchRouter);
app.use('/kb/topics', requireAdmin, topicsRouter);
// KB ingest: larger body limit (raw content up to ~2MB) + rate limit
app.use('/kb/ingest', express.json({ limit: '2mb' }), requireAdmin, ingestRateLimit, ingestionRouter);
app.use('/kb/quiz-candidates', requireAdmin, quizCandidateActions);
app.use('/kb/modules', requireAdmin, modulesRouter);
app.use('/admin/progress', requireAdmin, adminProgressRouter);
app.use('/admin/assignments', requireAdmin, adminAssignmentsRouter);
app.use('/admin/packages', requireAdmin, adminPackagesRouter);
app.use('/admin/profile', requireAdmin, adminProfileRouter);
app.use('/admin/content-blocks', requireAdmin, adminContentBlocksRouter);
app.use('/admin/access', requireAdmin, adminAccessOverridesRouter);
// TTX — facilitator/admin routes (all require admin auth)
app.use('/ttx/scenarios', requireAdmin, ttxScenariosRouter);
app.use('/ttx/sessions', requireAdmin, ttxSessionsRouter);
// TTX — participant routes (learner Bearer auth, no admin required)
app.use('/ttx/participate', participateRateLimit, ttxParticipateRouter);
// TTX — AI assist (admin only, expensive Anthropic calls)
app.use('/ttx/assist', requireAdmin, assistRateLimit, ttxAssistRouter);

app.use('/access', accessRouter);
app.use('/auth', authRateLimit, authRouter);
app.use('/learn/modules', learnModulesRouter);
app.use('/kb', requireAdmin, lessonsRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? err.statusCode ?? 500;
  if (status === 413) {
    res.status(413).json({ error: 'Request body too large' });
    return;
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
