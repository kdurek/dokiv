import { type Config } from "drizzle-kit";

import { DATABASE_URL } from "@/server/consts";

export default {
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: DATABASE_URL,
  },
} satisfies Config;
