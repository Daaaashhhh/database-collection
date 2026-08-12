import { Pool, type QueryResult, type QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as {
  pgPool: Pool | undefined;
};

function getPool() {
  if (globalForDb.pgPool) {
    return globalForDb.pgPool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Postgres connection string.",
    );
  }

  const pool = new Pool({
    connectionString,
    // Local Postgres often runs without SSL; managed hosts usually require it.
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.pgPool = pool;
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}
