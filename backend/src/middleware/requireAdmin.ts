import { type Request, type Response, type NextFunction } from 'express';
import { AdminAuthService } from '../services/auth/admin-auth.service.js';

const adminAuthSvc = new AdminAuthService();

/** Middleware: require a valid admin session (Bearer token from /auth/admin/login). */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  // Accept token via Authorization header (primary) or ?token= query param (SSE EventSource fallback)
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query['token'] as string | undefined);
  if (!token) {
    res.status(401).json({ error: 'Admin authentication required' });
    return;
  }
  const username = await adminAuthSvc.validateSession(token);
  if (!username) {
    res.status(401).json({ error: 'Invalid or expired admin session' });
    return;
  }
  (req as unknown as Request & { adminUsername: string }).adminUsername = username;
  next();
}
