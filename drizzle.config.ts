import { readConfig } from "./src/config.ts"
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "src/lib/db/schema.ts",
  out: "src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: readConfig().dbUrl,
  },
});