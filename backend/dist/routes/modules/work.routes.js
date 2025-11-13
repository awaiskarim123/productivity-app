"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = workRoutes;
const dayjs_1 = __importDefault(require("dayjs"));
const work_schema_1 = require("../../schemas/work.schema");
const statistics_service_1 = require("../../services/statistics.service");
function getPeriodConfig(period) {
    switch (period) {
        case "weekly":
            return { unit: "week", count: 8 };
        case "monthly":
            return { unit: "month", count: 6 };
        case "daily":
        default:
            return { unit: "day", count: 7 };
    }
}
async function workRoutes(app) {
    app.addHook("preHandler", app.authenticate);
    app.post("/start", async (request, reply) => {
        const result = work_schema_1.startWorkSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const userId = request.user.id;
        const activeSession = await app.prisma.workSession.findFirst({
            where: { userId, endedAt: null },
        });
        if (activeSession) {
            return reply.code(400).send({ message: "An active work session already exists" });
        }
        const session = await app.prisma.workSession.create({
            data: {
                userId,
                notes: result.data.notes ?? null,
                startedAt: result.data.startedAt ?? new Date(),
            },
        });
        return reply.code(201).send({ session });
    });
    app.post("/end", async (request, reply) => {
        const result = work_schema_1.endWorkSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const { sessionId, endedAt, notes } = result.data;
        const session = await app.prisma.workSession.findUnique({
            where: { id: sessionId },
            include: { user: true },
        });
        if (!session || session.userId !== request.user.id) {
            return reply.code(404).send({ message: "Session not found" });
        }
        if (session.endedAt) {
            return reply.code(400).send({ message: "Session already ended" });
        }
        const endTime = endedAt ?? new Date();
        const durationMinutes = Math.max(1, Math.round((0, dayjs_1.default)(endTime).diff((0, dayjs_1.default)(session.startedAt), "minute", true)));
        const updatedSession = await app.prisma.workSession.update({
            where: { id: session.id },
            data: {
                endedAt: endTime,
                durationMinutes,
                notes: notes ?? session.notes ?? null,
            },
        });
        const streak = await (0, statistics_service_1.calculateFocusStreak)(app.prisma, request.user.id, session.user.dailyGoalMinutes);
        await app.prisma.user.update({
            where: { id: request.user.id },
            data: { focusStreak: streak },
        });
        const summary = await (0, statistics_service_1.getTimeSummary)(app.prisma, request.user.id);
        return {
            session: updatedSession,
            summary,
            focusStreak: streak,
        };
    });
    app.get("/sessions", async (request, reply) => {
        const result = work_schema_1.workSessionsQuerySchema.safeParse(request.query ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
        }
        const { from, to, limit } = result.data;
        const userId = request.user.id;
        const sessions = await app.prisma.workSession.findMany({
            where: {
                userId,
                ...(from || to
                    ? {
                        startedAt: {
                            ...(from ? { gte: from } : {}),
                            ...(to ? { lte: to } : {}),
                        },
                    }
                    : {}),
            },
            orderBy: { startedAt: "desc" },
            take: limit,
        });
        return { sessions };
    });
    app.get("/summary", async (request, reply) => {
        const result = work_schema_1.workSummaryQuerySchema.safeParse(request.query ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
        }
        const { period } = result.data;
        const config = getPeriodConfig(period);
        const buckets = new Map();
        const now = (0, dayjs_1.default)();
        const rangeStart = now.startOf(config.unit).subtract(config.count - 1, config.unit);
        for (let i = 0; i < config.count; i += 1) {
            const start = rangeStart.add(i, config.unit).startOf(config.unit);
            buckets.set(start.toISOString(), 0);
        }
        const sessions = await app.prisma.workSession.findMany({
            where: {
                userId: request.user.id,
                durationMinutes: { not: null },
                startedAt: { gte: rangeStart.toDate() },
            },
            select: {
                startedAt: true,
                durationMinutes: true,
            },
        });
        sessions.forEach((session) => {
            const bucketKey = (0, dayjs_1.default)(session.startedAt).startOf(config.unit).toISOString();
            const current = buckets.get(bucketKey) ?? 0;
            buckets.set(bucketKey, current + (session.durationMinutes ?? 0));
        });
        const summary = Array.from(buckets.entries()).map(([periodStart, minutes]) => ({
            periodStart,
            minutes,
        }));
        return { period, summary };
    });
}
//# sourceMappingURL=work.routes.js.map