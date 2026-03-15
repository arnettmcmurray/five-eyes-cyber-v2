// This file is for drizzle-kit only (schema push/generate).
// It re-exports schema without .js extensions so drizzle-kit's CJS loader can resolve them.
export * from './schema/kb-items';
export * from './schema/kb-revisions';
export * from './schema/raw-sources';
export * from './schema/ingestion-jobs';
export * from './schema/content-chunks';
export * from './schema/topics';
export * from './schema/lesson-links';
export * from './schema/quiz-candidates';
export * from './schema/workflow';
