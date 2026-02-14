import type { FastifyInstance } from "fastify";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import env from "./config/env";
import prismaPlugin from "./plugins/prisma";
import authPlugin from "./plugins/auth";
import registerRoutes from "./routes";

function getCorsOrigin(app: FastifyInstance): boolean | string | string[] {
  if (env.CORS_ORIGIN === undefined || env.CORS_ORIGIN === "") {
    if (process.env.NODE_ENV === "production") {
      app.log.error(
        "CORS_ORIGIN is not set in production; refusing to allow all origins. Set CORS_ORIGIN to your frontend origin(s).",
      );
      return false;
    }
    return true;
  }

  const origins = env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);
  if (origins.length === 0) {
    app.log.warn(
      "CORS_ORIGIN is empty or whitespace-only after parsing; denying all origins. Check env CORS_ORIGIN.",
    );
    return false;
  }

  return origins.length === 1 ? origins[0]! : origins;
}

export function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
    trustProxy: true,
  });

  app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: false,
  });

  app.register(cors, {
    origin: getCorsOrigin(app),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Per-IP rate limiting (uses Fastify request.ip; trustProxy ensures correct client IP when behind a proxy)
  const rateLimitMax = env.NODE_ENV === "test" ? 10000 : env.RATE_LIMIT_MAX;
  const rateLimitWindowMs = env.NODE_ENV === "test" ? 60000 : env.RATE_LIMIT_WINDOW_MS;
  app.register(rateLimit, {
    max: rateLimitMax,
    timeWindow: rateLimitWindowMs,
  });

  app.register(prismaPlugin);
  app.register(authPlugin);
  app.register(registerRoutes, { prefix: "/api" });

  return app;
}

