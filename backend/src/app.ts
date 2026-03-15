import express from 'express';
import itemsRouter from './routes/kb/items.js';
import revisionsRouter from './routes/kb/revisions.js';
import searchRouter from './routes/kb/search.js';
import topicsRouter from './routes/kb/topics.js';
import ingestionRouter from './routes/kb/ingestion.js';

export const app = express();

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// KB routes
app.use('/kb/items', itemsRouter);
app.use('/kb/items/:itemId/revisions', revisionsRouter);
app.use('/kb/search', searchRouter);
app.use('/kb/topics', topicsRouter);
app.use('/kb/ingest', ingestionRouter);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
