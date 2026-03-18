import { eq, and } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { rawSources } from '../../db/schema/raw-sources.js';
import { ingestionJobs } from '../../db/schema/ingestion-jobs.js';
import { runPipeline } from '../../pipeline/orchestrator.js';
import { KBItemService } from './item.service.js';
import { KBRevisionService } from './revision.service.js';
import { KBChunkService } from './chunk.service.js';
import type { IngestionJob, IngestionStatus, RawSource } from '../../models/kb/source.js';

const itemSvc = new KBItemService();
const revSvc = new KBRevisionService();
const chunkSvc = new KBChunkService();

export interface IngestionJobWithSource extends IngestionJob {
  label: string;
  sourceType: RawSource['type'];
}

function toJob(row: typeof ingestionJobs.$inferSelect): IngestionJob {
  return {
    id: row.id,
    sourceId: row.sourceId,
    status: row.status as IngestionStatus,
    errorMessage: row.errorMessage ?? undefined,
    startedAt: row.startedAt?.toISOString(),
    completedAt: row.completedAt?.toISOString(),
    resultItemId: row.resultItemId ?? undefined,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  };
}

async function createSourceAndJob(
  type: RawSource['type'],
  label: string,
  origin: string,
  rawContent: string,
  mimeType: RawSource['mimeType'],
  createdBy: string,
): Promise<{ source: typeof rawSources.$inferSelect; job: typeof ingestionJobs.$inferSelect }> {
  const sourceId = uuid();
  const jobId = uuid();

  const [source] = await db
    .insert(rawSources)
    .values({
      id: sourceId, type, label, origin, rawContent,
      mimeType, byteSize: Buffer.byteLength(rawContent, 'utf8'),
      uploadedBy: createdBy, ingestionJobId: jobId,
    })
    .returning();

  const [job] = await db
    .insert(ingestionJobs)
    .values({ id: jobId, sourceId, status: 'pending', createdBy })
    .returning();

  return { source, job };
}

async function runJob(
  source: typeof rawSources.$inferSelect,
  job: typeof ingestionJobs.$inferSelect,
): Promise<IngestionJob> {
  await db
    .update(ingestionJobs)
    .set({ status: 'extracting', startedAt: new Date() })
    .where(eq(ingestionJobs.id, job.id));

  try {
    const kbItem = await itemSvc.create({
      slug: `draft-${job.id}`,
      title: source.label,
      type: 'training-content',
      tags: [],
      status: 'draft',
      sourceTrust: source.type === 'manual-entry' ? 'internal' : 'raw-upload',
      createdBy: job.createdBy,
      currentRevisionId: null,
    });

    const revision = await revSvc.createRevision(kbItem.id, source.rawContent || source.label, job.createdBy);

    const sourceModel: RawSource = {
      id: source.id,
      type: source.type,
      label: source.label,
      origin: source.origin,
      rawContent: source.rawContent,
      mimeType: source.mimeType as RawSource['mimeType'],
      byteSize: source.byteSize,
      uploadedBy: source.uploadedBy,
      uploadedAt: source.uploadedAt.toISOString(),
      ingestionJobId: job.id,
    };

    await db
      .update(ingestionJobs)
      .set({ status: 'processing' })
      .where(eq(ingestionJobs.id, job.id));

    const result = await runPipeline(sourceModel, job.id, kbItem.id, revision.id);

    // For URL fetch, update the revision content with the fetched text
    if (source.type === 'url-fetch' && result.extracted.rawText) {
      await revSvc.createRevision(kbItem.id, result.extracted.rawText, job.createdBy);
    }

    await chunkSvc.saveChunks(result.chunks);

    // Guard against slug collisions by appending job ID prefix
    const baseSlug = result.processed.proposedSlug || `item-${kbItem.id.slice(0, 8)}`;
    const safeSlug = `${baseSlug}-${job.id.slice(0, 8)}`;

    await itemSvc.update(kbItem.id, {
      slug: safeSlug,
      title: result.processed.proposedTitle || source.label,
      type: result.processed.proposedType,
      tags: result.processed.proposedTags,
    });

    const finalStatus: IngestionStatus = 'review-ready';

    const [updated] = await db
      .update(ingestionJobs)
      .set({
        status: finalStatus,
        resultItemId: kbItem.id,
        completedAt: new Date(),
        errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null,
      })
      .where(eq(ingestionJobs.id, job.id))
      .returning();

    return toJob(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const [updated] = await db
      .update(ingestionJobs)
      .set({ status: 'failed', errorMessage: message, completedAt: new Date() })
      .where(eq(ingestionJobs.id, job.id))
      .returning();
    return toJob(updated);
  }
}

export class KBIngestionService {
  async ingestManual(content: string, label: string, createdBy: string): Promise<IngestionJob> {
    const { source, job } = await createSourceAndJob(
      'manual-entry', label, 'manual', content, 'text/plain', createdBy,
    );
    return runJob(source, job);
  }

  async ingestFile(
    rawContent: string,
    filename: string,
    mimeType: string,
    uploadedBy: string,
  ): Promise<IngestionJob> {
    const { source, job } = await createSourceAndJob(
      'file-upload', filename, filename, rawContent,
      mimeType as RawSource['mimeType'], uploadedBy,
    );
    return runJob(source, job);
  }

  async ingestUrl(url: string, fetchedBy: string): Promise<IngestionJob> {
    // rawContent starts empty — stage 01 fetches it live
    const { source, job } = await createSourceAndJob(
      'url-fetch', url, url, '', 'text/html', fetchedBy,
    );
    return runJob(source, job);
  }

  async getJobStatus(jobId: string): Promise<IngestionJob> {
    const [row] = await db
      .select()
      .from(ingestionJobs)
      .where(eq(ingestionJobs.id, jobId))
      .limit(1);
    if (!row) throw new Error(`IngestionJob not found: ${jobId}`);
    return toJob(row);
  }

  async listJobs(filters?: { status?: IngestionStatus; createdBy?: string }): Promise<IngestionJobWithSource[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(ingestionJobs.status, filters.status));
    if (filters?.createdBy) conditions.push(eq(ingestionJobs.createdBy, filters.createdBy));

    const rows = await db
      .select({
        job: ingestionJobs,
        sourceLabel: rawSources.label,
        sourceType: rawSources.type,
      })
      .from(ingestionJobs)
      .leftJoin(rawSources, eq(rawSources.id, ingestionJobs.sourceId))
      .where(conditions.length ? and(...conditions) : undefined);

    return rows.map(({ job: row, sourceLabel, sourceType }) => ({
      ...toJob(row),
      label: sourceLabel ?? '',
      sourceType: (sourceType ?? 'manual-entry') as RawSource['type'],
    }));
  }
}
