"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = productivityRoutes;
const daily_summary_service_1 = require("../../services/daily-summary.service");
async function productivityRoutes(app) {
    app.addHook("preHandler", app.authenticate);
    app.get("/daily-summary", async (request, reply) => {
        const summary = await (0, daily_summary_service_1.getDailySummary)(app.prisma, request.user.id);
        return reply.send(summary);
    });
}
//# sourceMappingURL=productivity.routes.js.map