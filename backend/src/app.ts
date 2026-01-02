import Fastify from "fastify";
import cors from "@fastify/cors";
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

  app.register(prismaPlugin);
  app.register(authPlugin);
  app.register(registerRoutes, { prefix: "/api" });

  return app;
}

