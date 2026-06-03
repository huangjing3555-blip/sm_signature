import { defineConfig } from "drizzle-kit";
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  dialect: "mysql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
});
