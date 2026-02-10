import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import env from "./config/env";
import prismaPlugin from "./plugins/prisma";
import authPlugin from "./plugins/auth";
import registerRoutes from "./routes";

export function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
  });

  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Per-IP rate limiting; in test use high limit to avoid flakiness
  const rateLimitMax = env.NODE_ENV === "test" ? 10000 : env.RATE_LIMIT_MAX;
  const rateLimitWindowMs = env.NODE_ENV === "test" ? 60000 : env.RATE_LIMIT_WINDOW_MS;
  app.register(rateLimit, {
    max: rateLimitMax,
    timeWindow: rateLimitWindowMs,
    keyGenerator: (request) => {
      const ip = request.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim()
        ?? request.headers["x-real-ip"]?.toString()
        ?? request.ip
        ?? "unknown";
      return ip;
    },
  });

  app.register(prismaPlugin);
  app.register(authPlugin);
  app.register(registerRoutes, { prefix: "/api" });

  return app;
}

