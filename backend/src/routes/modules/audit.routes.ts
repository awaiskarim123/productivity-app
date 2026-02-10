import type { FastifyInstance } from "fastify";
import { auditLogsQuerySchema } from "../../schemas/audit.schema";

export default async function auditRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async (request, reply) => {
    const result = auditLogsQuerySchema.safeParse(request.query ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
    }

    const { resource, action, limit, offset } = result.data;
    const where: { userId: string; resource?: string; action?: string } = {
      userId: request.user.id,
    };
    if (resource) where.resource = resource;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      app.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      app.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
  });
}
