import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: process.env.DATABASE_URL 
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.SQL_HOST || "localhost",
        user: process.env.SQL_USER || "postgres",
        password: process.env.SQL_PASSWORD || "postgres",
        database: process.env.SQL_DB_NAME || "postgres",
      },
  out: "./src/db/migrations",
});
