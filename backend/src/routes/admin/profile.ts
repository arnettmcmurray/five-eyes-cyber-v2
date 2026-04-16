import { Router, type Request } from 'express';
import { AdminAuthService } from '../../services/auth/admin-auth.service.js';

const router = Router();
const adminAuthSvc = new AdminAuthService();

/**
 * GET /admin/profile
 * Returns the current admin's username.
 */
router.get('/', (req, res) => {
  const username = (req as unknown as Request & { adminUsername: string }).adminUsername;
  adminAuthSvc.getAdminProfile(username)
    .then((profile) => res.json(profile ?? { username, isTopAdmin: false, isBreakGlass: false }))
    .catch(() => res.json({ username, isTopAdmin: false, isBreakGlass: false }));
});

/**
 * POST /admin/profile/change-password
 * Body: { newPassword: string }
 * Changes the admin's password. Old password not required (session already proves identity).
 */
router.post('/change-password', async (req, res) => {
  const username = (req as unknown as Request & { adminUsername: string }).adminUsername;
  const { newPassword } = req.body ?? {};
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    res.status(400).json({ error: 'newPassword must be at least 8 characters' });
    return;
  }
  try {
    await adminAuthSvc.changePassword(username, newPassword);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/**
 * POST /admin/profile/logout
 * Invalidates the current admin session token.
 */
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.slice(7) ?? '';
  await adminAuthSvc.logout(token);
  res.status(204).end();
});

export default router;
