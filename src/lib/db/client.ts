import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://haina_bian:haina_bian@localhost:5432/haina_bian";

const globalForDatabase = globalThis as unknown as {
  portalPool?: Pool;
};

export const pool =
  globalForDatabase.portalPool ??
  new Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.portalPool = pool;
}

export const db = drizzle(pool, { schema });
