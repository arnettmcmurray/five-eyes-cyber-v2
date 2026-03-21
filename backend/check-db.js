import pg from 'pg';
const { Pool } = pg;
const connectionString = 'postgresql://postgres:five_eyes_staging_secure!@five-eyes-staging-db.ce7i0was6bvk.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require';
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
async function check() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', res.rows.map(r => r.table_name).join(', '));
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
check();
