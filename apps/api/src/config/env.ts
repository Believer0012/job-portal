import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../../.env"),
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  REFRESH_COOKIE_NAME: z.string().default("jobportal_refresh_token"),
  REFRESH_COOKIE_MAX_AGE_MS: z.coerce.number().int().positive().default(604800000),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  throw new Error(`Invalid environment configuration: ${result.error.message}`);
}

export const env = result.data;