import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../../drizzle/schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | undefined;

function getDb(): DrizzleDb {
  if (_db) return _db;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  /**
   * postgres-js connection.
   * In serverless environments (Vercel / Supabase Edge), use a pooled
   * connection string (port 6543) with `prepare: false` to avoid
   * prepared-statement conflicts across short-lived connections.
   */
  const client = postgres(process.env.DATABASE_URL, {
    prepare: false,
  });

  _db = drizzle(client, { schema });
  return _db;
}

/**
 * Created lazily on first use so a missing DATABASE_URL doesn't fail
 * the build — only actual queries at runtime.
 */
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export type DB = typeof db;
