import { z } from 'zod';

const kbItemType = z.enum(['training-content', 'threat-brief', 'policy', 'faq', 'glossary-term']);
const kbItemStatus = z.enum(['draft', 'under-review', 'published']);
const sourceTrust = z.enum(['internal', 'external-curated', 'raw-upload']);

export const createItemSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(500),
  type: kbItemType,
  tags: z.array(z.string()).default([]),
  status: kbItemStatus.default('draft'),
  sourceTrust,
  currentRevisionId: z.string().nullable().default(null),
});

export const updateItemSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).max(500).optional(),
  type: kbItemType.optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'under-review', 'published', 'archived']).optional(),
  sourceTrust: sourceTrust.optional(),
  currentRevisionId: z.string().nullable().optional(),
});

export const createRevisionSchema = z.object({
  content: z.string().min(1),
});

export const rollbackSchema = z.object({
  note: z.string().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  userId: z.string().default('anonymous'),
  topK: z.coerce.number().int().min(1).max(50).default(5),
  mode: z.enum(['fts', 'quiz-aid']).default('fts'),
});

export const ingestManualSchema = z.object({
  content: z.string().min(1).max(500_000),
  label: z.string().min(1).max(300),
});

export const ingestFileSchema = z.object({
  rawContent: z.string().min(1).max(1_000_000),
  filename: z.string().min(1).max(300),
  mimeType: z.enum(['text/plain', 'text/html', 'application/pdf', 'text/markdown']).default('text/plain'),
});

export const ingestUrlSchema = z.object({
  url: z.string().url(),
});

export const createTopicSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().default(''),
  parentTopicId: z.string().optional(),
});

export const workflowActionSchema = z.object({
  note: z.string().optional(),
});

export const createQuizCandidateSchema = z.object({
  revisionId: z.string().min(1),
  questionText: z.string().min(1),
  options: z.array(z.string()).length(4, 'Must provide exactly 4 options'),
  suggestedCorrectIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0),
  status: z.enum(['pending-review', 'approved', 'rejected', 'promoted']).default('pending-review'),
});
