import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { sql } from 'drizzle-orm';
import { db } from './client.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, '../../drizzle');

async function ensureMigrationBaseline() {
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS drizzle`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  const existingRows = await db.execute(sql`SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations`);
  const existingCount = Number((existingRows.rows[0] as { count: number | string } | undefined)?.count ?? 0);
  if (existingCount > 0) return;

  const migrations = readMigrationFiles({ migrationsFolder });

  const hasCoreSchemaRows = await db.execute(sql`SELECT to_regclass('public.admin_users') IS NOT NULL AS present`);
  const hasCoreSchema = Boolean((hasCoreSchemaRows.rows[0] as { present: boolean } | undefined)?.present);
  if (!hasCoreSchema) return;

  const baselineChecks = [
    {
      tag: '0000_heavy_redwing',
      probe: sql`SELECT to_regclass('public.admin_users') IS NOT NULL AS applied`,
    },
    {
      tag: '0001_learner_profile_fields',
      probe: sql`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'learners'
            AND column_name = 'updated_at'
        ) AS applied
      `,
    },
    {
      tag: '0002_admin_truth_flags',
      probe: sql`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'admin_users'
            AND column_name = 'is_top_admin'
        ) AS applied
      `,
    },
  ] as const;

  let inserted = 0;
  for (const check of baselineChecks) {
    const migration = migrations[baselineChecks.findIndex((entry) => entry.tag === check.tag)];
    if (!migration) continue;

    const probeRows = await db.execute(check.probe);
    const applied = Boolean((probeRows.rows[0] as { applied: boolean } | undefined)?.applied);
    if (!applied) continue;

    await db.execute(sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES (${migration.hash}, ${migration.folderMillis})
    `);
    inserted += 1;
  }

  if (inserted > 0) {
    console.log(`Migration baseline restored for ${inserted} existing migration(s).`);
  }
}

async function main() {
  await ensureMigrationBaseline();
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder });
  console.log('Migrations complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
