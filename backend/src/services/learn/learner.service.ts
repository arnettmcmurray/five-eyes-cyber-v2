import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { learners } from '../../db/schema/learners.js';

export interface LearnerRecord {
  learnerId: string;
  handle: string;
}

export interface LearnerProfile {
  rawEmail?: string;
  fullName?: string;
  company?: string;
  role?: string;
}

export class LearnerService {
  /** Find or create a learner by handle. Returns server-issued learnerId. */
  async findOrCreate(handle: string): Promise<LearnerRecord> {
    const trimmed = handle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!trimmed) throw new Error('Handle must contain at least one alphanumeric character');

    const [existing] = await db
      .select()
      .from(learners)
      .where(eq(learners.handle, trimmed))
      .limit(1);

    if (existing) return { learnerId: existing.id, handle: existing.handle };

    const [created] = await db
      .insert(learners)
      .values({ id: uuid(), handle: trimmed })
      .returning();

    return { learnerId: created.id, handle: created.handle };
  }

  /**
   * Persist profile fields (name, company, role, rawEmail) for a learner.
   * Only updates fields that are provided (non-null/non-undefined).
   * Safe to call on existing learners — does not overwrite with blanks.
   */
  async updateProfile(learnerId: string, profile: LearnerProfile): Promise<void> {
    const patch: Record<string, string | Date> = { updatedAt: new Date() };
    if (profile.rawEmail !== undefined && profile.rawEmail !== '') patch['rawEmail'] = profile.rawEmail;
    if (profile.fullName !== undefined && profile.fullName !== '') patch['fullName'] = profile.fullName;
    if (profile.company !== undefined && profile.company !== '') patch['company'] = profile.company;
    if (profile.role !== undefined && profile.role !== '') patch['role'] = profile.role;

    if (Object.keys(patch).length > 1) {
      await db.update(learners).set(patch).where(eq(learners.id, learnerId));
    }
  }

  /** Returns true if this learnerId was issued by the server (exists in learners table). */
  async validate(learnerId: string): Promise<boolean> {
    const [row] = await db
      .select({ id: learners.id })
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);
    return !!row;
  }
}
