import type { RawSource, ExtractedContent, ProcessedContent } from '../models/kb/source.js';
import type { ContentChunk } from '../models/kb/chunk.js';
import { readSource } from './stages/01-read-source.js';
import { extractContent } from './stages/02-extract.js';
import { processContent } from './stages/03-process.js';
import { chunkContent } from './stages/04-chunk.js';

export interface PipelineResult {
  jobId: string;
  sourceId: string;
  extracted: ExtractedContent;
  processed: ProcessedContent;
  chunks: ContentChunk[];
  completedAt: string;
  errors: string[];
}

export async function runPipeline(
  source: RawSource,
  jobId: string,
  itemId: string,
  revisionId: string,
): Promise<PipelineResult> {
  const errors: string[] = [];

  // --- Stage 01: Read Source ---
  let sourceResult;
  try {
    sourceResult = await readSource(source);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Stage 01 (readSource): ${message}`);
    return {
      jobId,
      sourceId: source.id,
      extracted: { jobId, rawText: '', detectedLanguage: 'en', wordCount: 0, sections: [] },
      processed: {
        jobId, proposedTitle: '', proposedSlug: '', proposedType: 'training-content',
        proposedTags: [], markdownBody: '', qualityScore: 0, reviewNotes: [],
      },
      chunks: [],
      completedAt: new Date().toISOString(),
      errors,
    };
  }

  // --- Stage 02: Extract ---
  let extracted: ExtractedContent;
  try {
    extracted = extractContent(sourceResult, source);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Stage 02 (extractContent): ${message}`);
    extracted = {
      jobId, rawText: sourceResult.content, detectedLanguage: 'en', wordCount: 0, sections: [],
    };
  }

  // --- Stage 03: Process ---
  let processed: ProcessedContent;
  try {
    processed = processContent(extracted, jobId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Stage 03 (processContent): ${message}`);
    processed = {
      jobId, proposedTitle: extracted.title ?? 'Untitled Content', proposedSlug: '',
      proposedType: 'training-content', proposedTags: [], markdownBody: extracted.rawText,
      qualityScore: 0, reviewNotes: [],
    };
  }

  // --- Stage 04: Chunk ---
  let chunks: ContentChunk[];
  try {
    chunks = chunkContent(processed, itemId, revisionId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Stage 04 (chunkContent): ${message}`);
    chunks = [];
  }

  return {
    jobId, sourceId: source.id, extracted, processed, chunks,
    completedAt: new Date().toISOString(), errors,
  };
}
