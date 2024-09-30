import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

import { env } from "@/env";
import * as schema from "./schema";
import { DATABASE_URL } from "@/server/consts";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Database.Database | undefined;
};

export const client = globalForDb.client ?? new Database(DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
