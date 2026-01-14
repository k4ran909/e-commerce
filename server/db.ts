import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

let pool: Pool | null = null;
let db: any = null;

export function initDb(connectionString?: string) {
  const conn = connectionString || process.env.DATABASE_URL;
  if (!conn) throw new Error("DATABASE_URL not provided");
  if (!pool) {
    let ssl: any = undefined;
    try {
      const url = new URL(conn);
      const host = url.hostname || "";
      const hasSslParam = /(^|&)sslmode=require(&|$)/.test(url.searchParams.toString());
      const isKnownRemote = /(supabase\.co|neon\.tech|render\.com|aws\.com|rds\.amazonaws\.com|azure\.com|googleapis\.com)$/i.test(host);
      const forceSsl = String(process.env.DATABASE_SSL || "").toLowerCase() === "true";
      if (forceSsl || hasSslParam || isKnownRemote) {
        ssl = { rejectUnauthorized: false };
      }
    } catch {
    }

    pool = new Pool({ 
      connectionString: conn, 
      ssl,
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      acquireTimeoutMillis: 10000,
      allowExitOnIdle: false,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });
    
    pool.on('error', (err) => {
      console.error('[DB Pool] Unexpected error on idle client:', err);
    });
    
    pool.on('connect', () => {
    });
    
    pool.on('remove', () => {
    });
    
    db = drizzle(pool);
  }
  return db;
}

export function getDb() {
  if (!db) throw new Error("DB not initialized. Call initDb() first.");
  return db;
}

export function getPool() {
  return pool;
}

export async function getPoolStats() {
  if (!pool) return null;
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}
