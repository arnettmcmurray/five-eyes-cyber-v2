import type { IngestionJob, IngestionStatus } from '../../models/kb/source.js';

/**
 * Orchestrates the full ingestion flow:
 * accepts a source, runs the pipeline, creates a draft KB item.
 */
export class KBIngestionService {
  /** Ingests manually-entered text content. */
  async ingestManual(
    content: string,
    label: string,
    createdBy: string,
  ): Promise<IngestionJob> {
    throw new Error('Not implemented: KBIngestionService.ingestManual');
  }

  /** Ingests a file upload via its raw text content. */
  async ingestFile(
    rawContent: string,
    filename: string,
    mimeType: string,
    uploadedBy: string,
  ): Promise<IngestionJob> {
    throw new Error('Not implemented: KBIngestionService.ingestFile');
  }

  /**
   * Ingests content from a URL.
   * Stub — URL fetch is not yet implemented.
   */
  async ingestUrl(url: string, fetchedBy: string): Promise<IngestionJob> {
    throw new Error('Not implemented: KBIngestionService.ingestUrl');
  }

  /** Returns the current status of an ingestion job by ID. */
  async getJobStatus(jobId: string): Promise<IngestionJob> {
    throw new Error('Not implemented: KBIngestionService.getJobStatus');
  }

  /** Lists ingestion jobs, optionally filtered by status or creator. */
  async listJobs(filters?: {
    status?: IngestionStatus;
    createdBy?: string;
  }): Promise<IngestionJob[]> {
    throw new Error('Not implemented: KBIngestionService.listJobs');
  }
}
