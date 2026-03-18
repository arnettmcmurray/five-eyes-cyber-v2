import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { adminUsers, adminSessions } from '../../db/schema/admin-auth.js';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(derived, Buffer.from(hash, 'hex'));
}

export class AdminAuthService {
  /**
   * Seed a default admin if none exists.
   * Called on server startup when ADMIN_PASSWORD env var is set.
   */
  async seedDefault(username: string, password: string): Promise<void> {
    const [existing] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (existing) return; // already exists

    await db.insert(adminUsers).values({
      id: uuid(),
      username,
      passwordHash: hashPassword(password),
    });

    console.log(`[AdminAuth] Default admin '${username}' created.`);
  }

  /**
   * Authenticate with username + password.
   * Returns a session token on success.
   */
  async login(username: string, password: string): Promise<{ token: string; username: string }> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    // Always run verifyPassword to prevent timing-based username enumeration.
    // Use a stable dummy hash when admin not found so scrypt always runs.
    const DUMMY_HASH = '00000000000000000000000000000000:' + '0'.repeat(128);
    const valid = admin && verifyPassword(password, admin.passwordHash);
    if (!admin) verifyPassword(password, DUMMY_HASH); // constant-time dummy run
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8h session

    await db.insert(adminSessions).values({
      id: uuid(),
      adminId: admin.id,
      token,
      expiresAt,
    });

    return { token, username: admin.username };
  }

  /**
   * Validate an admin session token. Returns username or null if invalid/expired.
   */
  async validateSession(token: string): Promise<string | null> {
    const [row] = await db
      .select({ username: adminUsers.username })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminSessions.adminId, adminUsers.id))
      .where(and(
        eq(adminSessions.token, token),
        gt(adminSessions.expiresAt, new Date()),
      ))
      .limit(1);

    return row?.username ?? null;
  }

  /** Change password for an admin user and invalidate all existing sessions. */
  async changePassword(username: string, newPassword: string): Promise<void> {
    const [admin] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (!admin) throw new Error('Admin not found');

    await db
      .update(adminUsers)
      .set({ passwordHash: hashPassword(newPassword), updatedAt: new Date() })
      .where(eq(adminUsers.id, admin.id));

    // Invalidate all sessions after password change
    await db.delete(adminSessions).where(eq(adminSessions.adminId, admin.id));
  }

  /** Invalidate a single admin session token (logout). */
  async logout(token: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  }
}
