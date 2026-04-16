import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { eq, and, gt, ne } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/client.js';
import { adminUsers, adminSessions } from '../../db/schema/admin-auth.js';
import type { SeedAdminAccount } from '../../config/admin-accounts.js';

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

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
  async seedAccounts(accounts: SeedAdminAccount[], password: string): Promise<void> {
    for (const account of accounts) {
      await this.seedDefault(account.username, password, {
        isTopAdmin: account.isTopAdmin === true,
        isBreakGlass: account.isBreakGlass === true,
      });
    }

    const topAdmin = accounts.find((account) => account.isTopAdmin);
    if (topAdmin) {
      await db
        .update(adminUsers)
        .set({ isTopAdmin: false, updatedAt: new Date() })
        .where(ne(adminUsers.username, normalizeUsername(topAdmin.username)));
    }

    const breakGlassAdmin = accounts.find((account) => account.isBreakGlass);
    if (breakGlassAdmin) {
      await db
        .update(adminUsers)
        .set({ isBreakGlass: false, updatedAt: new Date() })
        .where(ne(adminUsers.username, normalizeUsername(breakGlassAdmin.username)));
    }
  }

  /**
   * Seed a default admin if none exists.
   * Called on server startup when ADMIN_PASSWORD env var is set.
   */
  async seedDefault(
    username: string,
    password: string,
    flags: { isTopAdmin?: boolean; isBreakGlass?: boolean } = {},
  ): Promise<void> {
    const normalizedUsername = normalizeUsername(username);
    const [existing] = await db
      .select({ id: adminUsers.id, isTopAdmin: adminUsers.isTopAdmin, isBreakGlass: adminUsers.isBreakGlass })
      .from(adminUsers)
      .where(eq(adminUsers.username, normalizedUsername))
      .limit(1);

    if (existing) {
      if (
        existing.isTopAdmin !== (flags.isTopAdmin === true) ||
        existing.isBreakGlass !== (flags.isBreakGlass === true)
      ) {
        await db
          .update(adminUsers)
          .set({
            isTopAdmin: flags.isTopAdmin === true,
            isBreakGlass: flags.isBreakGlass === true,
            updatedAt: new Date(),
          })
          .where(eq(adminUsers.id, existing.id));
      }
      return;
    }

    await db.insert(adminUsers).values({
      id: uuid(),
      username: normalizedUsername,
      passwordHash: hashPassword(password),
      isTopAdmin: flags.isTopAdmin === true,
      isBreakGlass: flags.isBreakGlass === true,
    });

    console.log(`[AdminAuth] Seeded admin '${normalizedUsername}'.`);
  }

  /**
   * Authenticate with username + password.
   * Returns a session token on success.
   */
  async login(username: string, password: string): Promise<{ token: string; username: string }> {
    const normalizedUsername = normalizeUsername(username);
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, normalizedUsername))
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

  async isPasswordAdmin(username: string): Promise<boolean> {
    const normalizedUsername = normalizeUsername(username);
    const [admin] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.username, normalizedUsername))
      .limit(1);

    return Boolean(admin);
  }

  async getAdminProfile(username: string): Promise<{ username: string; isTopAdmin: boolean; isBreakGlass: boolean } | null> {
    const normalizedUsername = normalizeUsername(username);
    const [admin] = await db
      .select({
        username: adminUsers.username,
        isTopAdmin: adminUsers.isTopAdmin,
        isBreakGlass: adminUsers.isBreakGlass,
      })
      .from(adminUsers)
      .where(eq(adminUsers.username, normalizedUsername))
      .limit(1);

    return admin ?? null;
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
    const normalizedUsername = normalizeUsername(username);
    const [admin] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.username, normalizedUsername))
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
