"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = auditRoutes;
const audit_schema_1 = require("../../schemas/audit.schema");
async function auditRoutes(app) {
    app.addHook("preHandler", app.authenticate);
    app.get("/", async (request, reply) => {
        const result = audit_schema_1.auditLogsQuerySchema.safeParse(request.query ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
        }
        const { resource, action, limit, offset } = result.data;
        const where = {
            userId: request.user.id,
        };
        if (resource)
            where.resource = resource;
        if (action)
            where.action = action;
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
//# sourceMappingURL=audit.routes.js.map