// import 'dotenv/config'; // Redundant in Node 20 with --env-file and ECS environment injection
import { app } from './app.js';
import { AdminAuthService } from './services/auth/admin-auth.service.js';
import { db } from './db/client.js';
import { adminUsers } from './db/schema/admin-auth.js';
import { sourceTrustLevels } from './db/schema/source-trust-levels.js';
import {
  SEEDED_ADMIN_ACCOUNTS,
  CANONICAL_TOP_ADMIN_USERNAME,
  BREAK_GLASS_ADMIN_USERNAME,
  LEGACY_ADMIN_USERNAMES_TO_REMOVE,
} from './config/admin-accounts.js';
import { v4 as uuidv4 } from 'uuid';
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
if (!process.env['OPENAI_API_KEY']) {
  console.warn('[WARN] OPENAI_API_KEY is not set — KB chat and TTX AI assist endpoints will return 503.');
}
if (!process.env['SES_FROM_ADDRESS']) {
  console.warn('[WARN] SES_FROM_ADDRESS is not set — OTP and assessment emails will be printed to stdout only (dev mode).');
}
if (!process.env['APP_BASE_URL']) {
  console.warn('[WARN] APP_BASE_URL is not set — assessment links will use http://localhost:5173 as base URL.');
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

async function start() {
  const adminPassword = process.env['ADMIN_PASSWORD'];

  if (adminPassword) {
    // Remove stale generic 'admin' user if it exists (leftover from earlier dev seed)
    await db.delete(adminUsers).where(eq(adminUsers.username, 'admin')).catch(() => {});
    for (const username of LEGACY_ADMIN_USERNAMES_TO_REMOVE) {
      await db.delete(adminUsers).where(eq(adminUsers.username, username)).catch(() => {});
    }

    const adminAuth = new AdminAuthService();
    await adminAuth.seedAccounts(SEEDED_ADMIN_ACCOUNTS, adminPassword).catch(err => {
      console.error('[AdminAuth] Seed reconciliation failed:', err instanceof Error ? err.message : String(err));
      throw err;
    });
  } else {
    // Check if any admin accounts exist — if not, the system is locked out
    const existingAdmins = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1).catch(() => []);
    if (existingAdmins.length === 0) {
      console.error('[FATAL] ADMIN_PASSWORD is not set and no admin accounts exist in the database. The system will be inaccessible. Set ADMIN_PASSWORD to seed admin accounts.');
      process.exit(1);
    }
  }

  const existingTrust = await db.select({ id: sourceTrustLevels.id }).from(sourceTrustLevels).limit(1).catch(() => []);
  if (existingTrust.length === 0) {
    await db.insert(sourceTrustLevels).values({
      id: uuidv4(),
      code: 'monitored',
      name: 'Default AI Ingestion (Monitored)',
      description: 'System default trust level for newly ingested content.',
      rank: 2,
    }).catch(err => {
      console.error('[Bootstrap] Failed to seed default source trust level:', err instanceof Error ? err.message : String(err));
    });
    console.log('[Bootstrap] Seeded default source trust level.');
  }

  app.listen(PORT, () => {
    const smtpHost = process.env['SMTP_HOST'];
    const sesFrom  = process.env['SES_FROM_ADDRESS'];
    const emailMode = smtpHost
      ? `SMTP → ${smtpHost}:${process.env['SMTP_PORT'] ?? 1025}  (Mailpit UI: http://localhost:8025)`
      : sesFrom
        ? `SES   (from: ${sesFrom})`
        : 'stdout (set SMTP_HOST=localhost or SES_FROM_ADDRESS to deliver email)';

    console.log('');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│  Five Eyes Backend — dev startup summary                    │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log(`│  API      http://localhost:${PORT}`);
    console.log(`│  Health   http://localhost:${PORT}/health`);
    console.log(`│  DB       ${process.env['DATABASE_URL'] ? 'postgresql://localhost:5433/five_eyes_v2' : '⚠  DATABASE_URL not set'}`);
    console.log(`│  Email    ${emailMode}`);
    console.log(`│  AI       ${process.env['OPENAI_API_KEY'] ? 'OPENAI_API_KEY set ✓' : '⚠  OPENAI_API_KEY not set — KB chat + TTX AI assist disabled'}`);
    console.log(`│  CORS     ${process.env['CORS_ORIGIN'] ?? 'http://localhost:5173 (default)'}`);
    console.log(`│  Top admin ${CANONICAL_TOP_ADMIN_USERNAME}`);
    console.log(`│  Recovery  ${BREAK_GLASS_ADMIN_USERNAME}`);
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('');
  });
}

start().catch(err => {
  console.error('[FATAL] Startup failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
