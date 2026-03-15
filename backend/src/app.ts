import express, { type Request, type Response, type NextFunction } from 'express';
import itemsRouter from './routes/kb/items.js';
import revisionsRouter from './routes/kb/revisions.js';
import searchRouter from './routes/kb/search.js';
import topicsRouter from './routes/kb/topics.js';
import ingestionRouter from './routes/kb/ingestion.js';
import quizCandidatesRouter, { quizCandidateActions } from './routes/kb/quiz-candidates.js';
import lessonsRouter from './routes/kb/lessons.js';
import workflowRouter from './routes/kb/workflow.js';

export const app = express();

app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.use('/kb/items', itemsRouter);
app.use('/kb/items/:itemId/revisions', revisionsRouter);
app.use('/kb/items/:itemId/quiz-candidates', quizCandidatesRouter);
app.use('/kb/items/:itemId/workflow', workflowRouter);
app.use('/kb/search', searchRouter);
app.use('/kb/topics', topicsRouter);
app.use('/kb/ingest', ingestionRouter);
app.use('/kb/quiz-candidates', quizCandidateActions);
app.use('/kb', lessonsRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
