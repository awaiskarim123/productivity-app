import type { FastifyInstance } from "fastify";
import { getDailySummary } from "../../services/daily-summary.service";

export default async function productivityRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/daily-summary", async (request, reply) => {
    const summary = await getDailySummary(app.prisma, request.user.id);
    return reply.send(summary);
  });
}
