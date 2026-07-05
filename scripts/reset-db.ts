import "./load-env";

import path from "node:path";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db, pool } from "../src/lib/db/client";
import { seed } from "./seed";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://haina_bian:haina_bian@localhost:5432/haina_bian";
const hostname = new URL(databaseUrl).hostname;

if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) {
  throw new Error("db:reset is restricted to a local PostgreSQL server.");
}

async function reset() {
  await pool.query("drop schema public cascade; create schema public;");
  await migrate(db, {
    migrationsFolder: path.resolve(process.cwd(), "drizzle"),
  });
  await seed();
  console.log("Reset, migrated, and seeded the local database.");
}

reset().finally(() => pool.end());
