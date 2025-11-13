"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = profileRoutes;
const profile_schema_1 = require("../../schemas/profile.schema");
const statistics_service_1 = require("../../services/statistics.service");
async function profileRoutes(app) {
    app.addHook("preHandler", app.authenticate);
    app.get("/", async (request, reply) => {
        const userId = request.user.id;
        const user = await app.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }
        const [summary, streak] = await Promise.all([
            (0, statistics_service_1.getTimeSummary)(app.prisma, userId),
            (0, statistics_service_1.calculateFocusStreak)(app.prisma, userId, user.dailyGoalMinutes),
        ]);
        if (streak !== user.focusStreak) {
            await app.prisma.user.update({
                where: { id: userId },
                data: { focusStreak: streak },
            });
        }
        return {
            profile: {
                id: user.id,
                email: user.email,
                name: user.name,
                dailyGoalMinutes: user.dailyGoalMinutes,
                focusStreak: streak,
                createdAt: user.createdAt,
            },
            summary,
        };
    });
    app.patch("/", async (request, reply) => {
        const result = profile_schema_1.updateProfileSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const userId = request.user.id;
        const updateData = {};
        if (result.data.name !== undefined) {
            updateData.name = result.data.name;
        }
        if (result.data.dailyGoalMinutes !== undefined) {
            updateData.dailyGoalMinutes = result.data.dailyGoalMinutes;
        }
        const updated = await app.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        return {
            profile: {
                id: updated.id,
                email: updated.email,
                name: updated.name,
                dailyGoalMinutes: updated.dailyGoalMinutes,
                focusStreak: updated.focusStreak,
                createdAt: updated.createdAt,
            },
        };
    });
}
//# sourceMappingURL=profile.routes.js.map