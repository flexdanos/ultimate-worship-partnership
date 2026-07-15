import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit doesn't load .env.local automatically — load it explicitly
config({ path: ".env.local" });

export default {
  schema: "./drizzle/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Use the direct connection (port 5432) for migrations — drizzle-kit
    // needs a persistent session, not a transaction pooler connection.
    // Set DIRECT_URL in .env.local to your Supabase direct connection string.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
