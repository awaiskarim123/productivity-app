import type { FastifyInstance } from "fastify";
import authRoutes from "./modules/auth.routes";
import profileRoutes from "./modules/profile.routes";
import workRoutes from "./modules/work.routes";
import focusRoutes from "./modules/focus.routes";
import analyticsRoutes from "./modules/analytics.routes";
import motivationRoutes from "./modules/motivation.routes";
import taskRoutes from "./modules/task.routes";
import habitRoutes from "./modules/habit.routes";
import noteRoutes from "./modules/note.routes";

export default async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));

  app.register(authRoutes, { prefix: "/auth" });
  app.register(profileRoutes, { prefix: "/profile" });
  app.register(workRoutes, { prefix: "/work" });
  app.register(focusRoutes, { prefix: "/focus" });
  app.register(analyticsRoutes, { prefix: "/analytics" });
  app.register(motivationRoutes, { prefix: "/motivation" });
  app.register(taskRoutes, { prefix: "/tasks" });
  app.register(habitRoutes, { prefix: "/habits" });
  app.register(noteRoutes, { prefix: "/notes" });
}

