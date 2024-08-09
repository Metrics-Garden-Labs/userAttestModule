import "@/drizzle/envConfig";
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();
const POSTGRES_URL = process.env.POSTGRES_URL;

console.log("postgres", process.env.POSTGRES_URL);

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: POSTGRES_URL as string,
  },
  verbose: true,
  strict: true,
});
