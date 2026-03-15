/** The type of input channel used to ingest a raw source document. */
export type RawSourceType = 'manual-entry' | 'file-upload' | 'url-fetch';

/** A raw source document before any KB processing has occurred. */
export interface RawSource {
  id: string;
  type: RawSourceType;
  /** Human-readable identifier. */
  label: string;
  /** URL, filename, or "manual". */
  origin: string;
  /** Raw text extracted before any processing. */
  rawContent: string;
  /** MIME type of the source content. */
  mimeType: 'text/plain' | 'text/html' | 'application/pdf' | 'text/markdown';
  byteSize: number;
  /** User id of the uploader. */
  uploadedBy: string;
  uploadedAt: string;
  /** FK to IngestionJob. */
  ingestionJobId: string;
}

/** Lifecycle status of a source ingestion job. */
export type IngestionStatus =
  | 'pending'
  | 'extracting'
  | 'processing'
  | 'review-ready'
  | 'failed'
  | 'completed';

/** A job that tracks the ingestion pipeline for a single RawSource. */
export interface IngestionJob {
  id: string;
  /** FK to RawSource. */
  sourceId: string;
  status: IngestionStatus;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  /** FK to KnowledgeItem — set when the job completes. */
  resultItemId?: string;
  /** User id of the creator. */
  createdBy: string;
  createdAt: string;
}

/** The cleaned and structured text extracted from a RawSource. */
export interface ExtractedContent {
  jobId: string;
  /** Cleaned plain text from raw source. */
  rawText: string;
  /** Extracted or inferred title. */
  title?: string;
  /** ISO language code, e.g. 'en'. */
  detectedLanguage: string;
  wordCount: number;
  sections: Array<{
    heading?: string;
    body: string;
    order: number;
  }>;
}

/** The pipeline-proposed KB item content ready for admin review. */
export interface ProcessedContent {
  jobId: string;
  proposedSlug: string;
  proposedTitle: string;
  proposedType: 'training-content' | 'threat-brief' | 'policy' | 'faq' | 'glossary-term';
  proposedTags: string[];
  /** Final structured markdown for KB item content. */
  markdownBody: string;
  /** Rough readiness estimate in the range 0.0–1.0. */
  qualityScore: number;
  /** Flags or suggestions for the admin reviewer. */
  reviewNotes: string[];
}
