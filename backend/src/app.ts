import express from 'express';
import itemsRouter from './routes/kb/items.js';
import revisionsRouter from './routes/kb/revisions.js';
import searchRouter from './routes/kb/search.js';
import topicsRouter from './routes/kb/topics.js';
import ingestionRouter from './routes/kb/ingestion.js';
import quizCandidatesRouter, { quizCandidateActions } from './routes/kb/quiz-candidates.js';
import lessonsRouter from './routes/kb/lessons.js';

export const app = express();

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// KB core
app.use('/kb/items', itemsRouter);
app.use('/kb/items/:itemId/revisions', revisionsRouter);
app.use('/kb/items/:itemId/quiz-candidates', quizCandidatesRouter);
app.use('/kb/search', searchRouter);
app.use('/kb/topics', topicsRouter);
app.use('/kb/ingest', ingestionRouter);

// Quiz candidate actions (approve / reject / promote)
app.use('/kb/quiz-candidates', quizCandidateActions);

// Module ↔ KB item links
app.use('/kb', lessonsRouter);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
