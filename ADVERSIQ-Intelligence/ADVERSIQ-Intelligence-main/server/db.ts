import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Postgres is optional — the app can serve the frontend and AI features without a database.
// When DATABASE_URL or POSTGRES_PASSWORD is set, the pool is created; otherwise DB calls
// return empty results and the app continues to function.
const dbConfigured = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_PASSWORD || (process.env.NODE_ENV !== 'production' && process.env.POSTGRES_HOST));

let pool: Pool | null = null;

if (dbConfigured) {
  pool = new Pool(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
          max: Number(process.env.POSTGRES_POOL_SIZE || 10),
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        }
      : {
          host: process.env.POSTGRES_HOST || 'localhost',
          database: process.env.POSTGRES_DB || 'bw_nexus_ai',
          user: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          port: Number(process.env.POSTGRES_PORT || 5432),
          max: Number(process.env.POSTGRES_POOL_SIZE || 10),
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        }
  );

  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL client error', err);
    // Don't crash the whole server — just log the error
    console.error('Database connection lost. DB features will be unavailable.');
    pool = null;
  });

  console.log('[DB] PostgreSQL pool created');
} else {
  console.warn('[DB] No database configured (POSTGRES_PASSWORD / DATABASE_URL not set). DB features disabled — app will run without persistence.');
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (!pool) return [];
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === 'true') {
    console.log('Postgres query', { text: text.substring(0, 120), duration, rows: result.rowCount });
  }
  return result.rows;
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  if (!pool) return null;
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export function getPool(): Pool | null {
  return pool;
}

export function isDbAvailable(): boolean {
  return pool !== null;
}
