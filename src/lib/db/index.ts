import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../../drizzle/schema";

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

export const db = drizzle(client, { schema });

export type DB = typeof db;
