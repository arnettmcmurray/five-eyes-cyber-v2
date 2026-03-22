import { Router } from 'express';
import { LearnerAuthService } from '../../services/auth/learner-auth.service.js';
import { AdminAuthService } from '../../services/auth/admin-auth.service.js';

const router = Router();
const authSvc = new LearnerAuthService();
const adminAuthSvc = new AdminAuthService();

/**
 * POST /auth/otp/request
 * Body: { handle: string }
 * Generates a 6-digit OTP for the learner handle (creates learner if new).
 * Code is logged to stdout for now; plug in email/SMS delivery here.
 */
// Admin accounts are password-only and must never enter the learner OTP flow.
const ADMIN_EMAILS = new Set([
  'arnettmcmurray@gmail.com',
  'michaelm@fiveyesltd.com',
  'dmott@fiveyesltd.com',
  'support@fiveyesltd.com',
]);

router.post('/otp/request', async (req, res) => {
  const { handle } = req.body ?? {};
  if (typeof handle !== 'string' || !handle.trim() || handle.length > 200) {
    res.status(400).json({ error: 'handle is required and must be under 200 characters' });
    return;
  }
  if (ADMIN_EMAILS.has(handle.trim().toLowerCase())) {
    res.status(400).json({ error: 'This account uses password-based login. Use /auth/admin/login.' });
    return;
  }
  try {
    await authSvc.requestOtp(handle);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/**
 * POST /auth/otp/verify
 * Body: { handle: string; code: string }
 * Validates the OTP; returns { token, learnerId, handle } on success.
 */
router.post('/otp/verify', async (req, res) => {
  const { handle, code } = req.body ?? {};
  if (typeof handle !== 'string' || !handle.trim() || handle.length > 200) {
    res.status(400).json({ error: 'handle is required and must be under 200 characters' });
    return;
  }
  if (typeof code !== 'string' || !code.trim() || code.length > 10) {
    res.status(400).json({ error: 'code is required' });
    return;
  }
  try {
    const result = await authSvc.verifyOtp(handle, code);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/**
 * POST /auth/admin/login
 * Body: { username: string; password: string }
 * Returns { token, username } on success.
 */
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string' || username.length > 100 || password.length > 200) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }
  try {
    const result = await adminAuthSvc.login(username, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/**
 * POST /auth/logout
 * Invalidates the current learner session (Bearer token).
 */
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.slice(7) ?? '';
  await authSvc.logout(token);
  res.status(204).end();
});

/**
 * POST /auth/register — stub (deferred)
 * POST /auth/login/password — stub (deferred)
 * POST /auth/password/reset — stub (deferred)
 */
router.post('/register', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/login/password', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/password/reset', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

export default router;
