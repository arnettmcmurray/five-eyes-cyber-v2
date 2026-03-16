import { randomBytes } from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { otpRequests, learnerSessions } from '../../db/schema/auth.js';
import { LearnerService } from '../learn/learner.service.js';

const learnerSvc = new LearnerService();

/** Normalize handle the same way LearnerService does. */
function normalizeHandle(handle: string): string {
  return handle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

export class LearnerAuthService {
  /**
   * Generate a 6-digit OTP for the given handle (creating the learner if needed).
   * The code is logged to stdout — plug in email/SMS delivery here.
   */
  async requestOtp(handle: string): Promise<void> {
    const normalized = normalizeHandle(handle);
    if (!normalized) throw new Error('Invalid handle');

    // Ensure learner record exists
    await learnerSvc.findOrCreate(normalized);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await db.insert(otpRequests).values({
      id: uuid(),
      handle: normalized,
      code,
      purpose: 'login',
      expiresAt,
    });

    // TODO: replace with real delivery (email/SMS)
    console.log(`[OTP] handle=${normalized} code=${code} expires=${expiresAt.toISOString()}`);
  }

  /**
   * Verify a login OTP. Returns a session token + learnerId on success.
   * Marks the OTP as used regardless of outcome.
   */
  async verifyOtp(handle: string, code: string): Promise<{ token: string; learnerId: string; handle: string }> {
    const normalized = normalizeHandle(handle);
    if (!normalized) throw new Error('Invalid handle');

    const now = new Date();

    const [otp] = await db
      .select()
      .from(otpRequests)
      .where(and(
        eq(otpRequests.handle, normalized),
        eq(otpRequests.code, code),
        eq(otpRequests.purpose, 'login'),
        eq(otpRequests.used, false),
        gt(otpRequests.expiresAt, now),
      ))
      .limit(1);

    if (!otp) throw new Error('Invalid or expired code');

    // Mark used
    await db.update(otpRequests).set({ used: true }).where(eq(otpRequests.id, otp.id));

    // Look up learner (must exist — requestOtp created it)
    const learner = await learnerSvc.findOrCreate(normalized);

    // Issue session token (64-char hex, 24h expiry)
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(learnerSessions).values({
      id: uuid(),
      learnerId: learner.learnerId,
      token,
      expiresAt,
    });

    return { token, learnerId: learner.learnerId, handle: learner.handle };
  }

  /** Invalidate a learner session token (logout). */
  async logout(token: string): Promise<void> {
    await db.delete(learnerSessions).where(eq(learnerSessions.token, token));
  }

  /**
   * Validate a session token. Returns the associated learnerId, or null if invalid/expired.
   */
  async validateSession(token: string): Promise<string | null> {
    const [session] = await db
      .select({ learnerId: learnerSessions.learnerId })
      .from(learnerSessions)
      .where(and(
        eq(learnerSessions.token, token),
        gt(learnerSessions.expiresAt, new Date()),
      ))
      .limit(1);

    return session?.learnerId ?? null;
  }
}
