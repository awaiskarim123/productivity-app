import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_ACCESS_TOKEN_TTL: z.string().default("15m"),
  JWT_REFRESH_TOKEN_TTL: z.string().default("30d"),
  PORT: z.coerce.number().default(4000),
});

const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_TOKEN_TTL: process.env.JWT_ACCESS_TOKEN_TTL ?? "15m",
  JWT_REFRESH_TOKEN_TTL: process.env.JWT_REFRESH_TOKEN_TTL ?? "30d",
  PORT: process.env.PORT ?? "4000",
});

export type Env = typeof env;

export default env;

