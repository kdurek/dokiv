import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const betterSqlite = new Database("/app/data/dokiv.db");
const db = drizzle(betterSqlite);

migrate(db, { migrationsFolder: "./migrations" });

betterSqlite.close();
