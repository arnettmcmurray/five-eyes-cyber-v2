import { eq, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { quizCandidates } from '../../db/schema/quiz-candidates.js';
import type { QuizCandidate } from '../../models/kb/quiz-candidate.js';

function toModel(row: typeof quizCandidates.$inferSelect): QuizCandidate {
  return {
    id: row.id,
    kbItemId: row.kbItemId,
    revisionId: row.revisionId,
    questionText: row.questionText,
    options: row.options,
    suggestedCorrectIndex: row.suggestedCorrectIndex,
    explanation: row.explanation,
    status: row.status as QuizCandidate['status'],
    confidence: row.confidence ?? 0,
    reviewedBy: row.reviewedBy ?? undefined,
    reviewedAt: row.reviewedAt?.toISOString(),
    promotedToModuleId: row.promotedToModuleId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export class KBQuizCandidateService {
  async create(data: Omit<QuizCandidate, 'id' | 'createdAt'>): Promise<QuizCandidate> {
    const [row] = await db
      .insert(quizCandidates)
      .values({
        id: uuid(),
        kbItemId: data.kbItemId,
        revisionId: data.revisionId,
        questionText: data.questionText,
        options: data.options,
        suggestedCorrectIndex: data.suggestedCorrectIndex,
        explanation: data.explanation,
        status: data.status,
        confidence: data.confidence,
        reviewedBy: data.reviewedBy ?? null,
        reviewedAt: data.reviewedAt ? new Date(data.reviewedAt) : null,
        promotedToModuleId: data.promotedToModuleId ?? null,
      })
      .returning();
    return toModel(row);
  }

  async listForItem(kbItemId: string): Promise<QuizCandidate[]> {
    const rows = await db
      .select()
      .from(quizCandidates)
      .where(eq(quizCandidates.kbItemId, kbItemId));
    return rows.map(toModel);
  }

  async approve(candidateId: string, reviewedBy: string): Promise<QuizCandidate> {
    const [row] = await db
      .update(quizCandidates)
      .set({ status: 'approved', reviewedBy, reviewedAt: sql`now()` })
      .where(eq(quizCandidates.id, candidateId))
      .returning();
    if (!row) throw new Error(`QuizCandidate not found: ${candidateId}`);
    return toModel(row);
  }

  async reject(candidateId: string, reviewedBy: string): Promise<QuizCandidate> {
    const [row] = await db
      .update(quizCandidates)
      .set({ status: 'rejected', reviewedBy, reviewedAt: sql`now()` })
      .where(eq(quizCandidates.id, candidateId))
      .returning();
    if (!row) throw new Error(`QuizCandidate not found: ${candidateId}`);
    return toModel(row);
  }

  async promote(candidateId: string, moduleId: string): Promise<QuizCandidate> {
    const [row] = await db
      .update(quizCandidates)
      .set({ status: 'promoted', promotedToModuleId: moduleId, reviewedAt: sql`now()` })
      .where(eq(quizCandidates.id, candidateId))
      .returning();
    if (!row) throw new Error(`QuizCandidate not found: ${candidateId}`);
    return toModel(row);
  }
}
