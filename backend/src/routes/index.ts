import type { FastifyInstance } from "fastify";
import authRoutes from "./modules/auth.routes";
import profileRoutes from "./modules/profile.routes";
import workRoutes from "./modules/work.routes";
import focusRoutes from "./modules/focus.routes";
import analyticsRoutes from "./modules/analytics.routes";
import motivationRoutes from "./modules/motivation.routes";

export default async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));

  app.register(authRoutes, { prefix: "/auth" });
  app.register(profileRoutes, { prefix: "/profile" });
  app.register(workRoutes, { prefix: "/work" });
  app.register(focusRoutes, { prefix: "/focus" });
  app.register(analyticsRoutes, { prefix: "/analytics" });
  app.register(motivationRoutes, { prefix: "/motivation" });
}

