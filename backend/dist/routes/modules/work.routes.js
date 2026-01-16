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
            where: { userId, endedAt: null, deletedAt: null },
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
        const session = await app.prisma.workSession.findFirst({
            where: { id: sessionId, userId: request.user.id, deletedAt: null },
            include: { user: true },
        });
        if (!session) {
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
                deletedAt: null, // Only show non-deleted sessions
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
    app.get("/:id", async (request, reply) => {
        const { id } = request.params;
        const session = await app.prisma.workSession.findFirst({
            where: {
                id,
                userId: request.user.id,
                deletedAt: null, // Only return non-deleted sessions
            },
        });
        if (!session) {
            return reply.code(404).send({ message: "Work session not found" });
        }
        return { session };
    });
    app.patch("/:id", async (request, reply) => {
        const { id } = request.params;
        const result = work_schema_1.updateWorkSessionSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const existingSession = await app.prisma.workSession.findFirst({
            where: { id, userId: request.user.id, deletedAt: null },
        });
        if (!existingSession) {
            return reply.code(404).send({ message: "Work session not found" });
        }
        const updateData = {};
        if (result.data.notes !== undefined)
            updateData.notes = result.data.notes;
        // Track if we need to recalculate duration
        const startedAtChanged = result.data.startedAt !== undefined;
        const endedAtChanged = result.data.endedAt !== undefined;
        if (startedAtChanged) {
            updateData.startedAt = result.data.startedAt;
        }
        if (endedAtChanged) {
            updateData.endedAt = result.data.endedAt;
        }
        // Recalculate durationMinutes whenever startedAt or endedAt changes
        if (startedAtChanged || endedAtChanged) {
            const startTime = (0, dayjs_1.default)(result.data.startedAt ?? existingSession.startedAt);
            const endTime = result.data.endedAt !== undefined
                ? (result.data.endedAt ? (0, dayjs_1.default)(result.data.endedAt) : null)
                : (existingSession.endedAt ? (0, dayjs_1.default)(existingSession.endedAt) : null);
            if (endTime) {
                updateData.durationMinutes = Math.max(1, Math.round(endTime.diff(startTime, "minute", true)));
            }
            else {
                // If endedAt is null or being set to null, clear duration
                updateData.durationMinutes = null;
            }
        }
        const session = await app.prisma.workSession.update({
            where: { id },
            data: updateData,
        });
        return { session };
    });
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        // Soft delete: set deletedAt timestamp instead of actually deleting
        const updateResult = await app.prisma.workSession.updateMany({
            where: { id, userId: request.user.id, deletedAt: null },
            data: { deletedAt: new Date() },
        });
        if (updateResult.count === 0) {
            return reply.code(404).send({ message: "Work session not found" });
        }
        return reply.code(204).send();
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
                deletedAt: null, // Only include non-deleted sessions
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