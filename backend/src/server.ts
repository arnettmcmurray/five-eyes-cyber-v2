import 'dotenv/config';
import { app } from './app.js';
import { AdminAuthService } from './services/auth/admin-auth.service.js';
import { db } from './db/client.js';
import { adminUsers } from './db/schema/admin-auth.js';
import { eq } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Env audit — runs before anything else
// ---------------------------------------------------------------------------

// REQUIRED — hard fail if missing
if (!process.env['API_KEY']) {
  console.error('[FATAL] API_KEY is not set — server will not start. Set it in backend/.env.');
  process.exit(1);
}
// DATABASE_URL is validated in db/client.ts at module load — if we get here it was set.

// OPTIONAL — warn clearly if production-unsafe defaults are in use
if (!process.env['CORS_ORIGIN']) {
  console.warn('[WARN] CORS_ORIGIN is not set — defaulting to http://localhost:5173. Set CORS_ORIGIN to the production frontend domain before deploying.');
}
if (!process.env['ADMIN_PASSWORD']) {
  console.warn('[WARN] ADMIN_PASSWORD is not set — admin accounts will not be seeded on startup.');
}
if (!process.env['ANTHROPIC_API_KEY']) {
  console.warn('[WARN] ANTHROPIC_API_KEY is not set — TTX AI assist endpoints will return 500.');
}

// TRUST_PROXY — must be set correctly behind a load balancer/reverse proxy.
// Set to '1' for a single proxy layer (e.g., Nginx, ALB), '2' for two layers, etc.
// Defaults to false (direct connection, no proxy). Required for correct IP detection in rate limiters.
const trustProxy = process.env['TRUST_PROXY'];
if (trustProxy) {
  const val = Number(trustProxy);
  app.set('trust proxy', isNaN(val) ? trustProxy : val);
  console.log(`[CONFIG] trust proxy = ${trustProxy}`);
} else {
  console.warn('[WARN] TRUST_PROXY is not set — rate limiter IP detection may be incorrect behind a load balancer. Set TRUST_PROXY=1 for a single proxy layer.');
}

// ---------------------------------------------------------------------------
// Admin accounts
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

const ADMIN_ACCOUNTS = [
  'arnettmcmurray@gmail.com',
  'mike@fiveeyesltd.com',
  'darren.mott@fiveeyesltd.com',
  'support@fiveeyesltd.com',
];

async function start() {
  const adminPassword = process.env['ADMIN_PASSWORD'];

  if (adminPassword) {
    // Remove stale generic 'admin' user if it exists (leftover from earlier dev seed)
    await db.delete(adminUsers).where(eq(adminUsers.username, 'admin')).catch(() => {});

    const adminAuth = new AdminAuthService();
    for (const username of ADMIN_ACCOUNTS) {
      await adminAuth.seedDefault(username, adminPassword).catch(err => {
        console.error(`[AdminAuth] Seed failed for ${username}:`, err instanceof Error ? err.message : String(err));
      });
    }
  } else {
    // Check if any admin accounts exist — if not, the system is locked out
    const existingAdmins = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1).catch(() => []);
    if (existingAdmins.length === 0) {
      console.error('[FATAL] ADMIN_PASSWORD is not set and no admin accounts exist in the database. The system will be inaccessible. Set ADMIN_PASSWORD to seed admin accounts.');
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`[START] five-eyes-v2 backend listening on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('[FATAL] Startup failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
