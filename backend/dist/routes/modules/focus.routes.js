"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = focusRoutes;
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../../generated/prisma/enums");
const focus_schema_1 = require("../../schemas/focus.schema");
async function focusRoutes(app) {
    app.addHook("preHandler", app.authenticate);
    app.get("/active", async (request) => {
        const activeSession = await app.prisma.focusSession.findFirst({
            where: {
                userId: request.user.id,
                endedAt: null,
                deletedAt: null, // Only show non-deleted sessions
            },
            orderBy: { startedAt: "desc" },
        });
        return { activeSession };
    });
    app.post("/start", async (request, reply) => {
        const result = focus_schema_1.startFocusSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const existingSession = await app.prisma.focusSession.findFirst({
            where: {
                userId: request.user.id,
                endedAt: null,
                deletedAt: null,
            },
        });
        if (existingSession) {
            return reply.code(400).send({ message: "An active focus session already exists" });
        }
        const session = await app.prisma.focusSession.create({
            data: {
                userId: request.user.id,
                mode: result.data.mode,
                targetMinutes: result.data.targetMinutes,
                notes: result.data.notes ?? null,
                startedAt: result.data.startedAt ?? new Date(),
            },
        });
        return reply.code(201).send({ session });
    });
    app.post("/end", async (request, reply) => {
        const result = focus_schema_1.endFocusSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const session = await app.prisma.focusSession.findFirst({
            where: { id: result.data.sessionId, userId: request.user.id, deletedAt: null },
        });
        if (!session) {
            return reply.code(404).send({ message: "Session not found" });
        }
        if (session.endedAt) {
            return reply.code(400).send({ message: "Session already ended" });
        }
        const endTime = result.data.endedAt ?? new Date();
        const durationMinutes = Math.max(1, Math.round((0, dayjs_1.default)(endTime).diff((0, dayjs_1.default)(session.startedAt), "minute", true)));
        const updated = await app.prisma.focusSession.update({
            where: { id: session.id },
            data: {
                endedAt: endTime,
                durationMinutes,
                completed: result.data.completed ??
                    (session.mode === enums_1.FocusSessionMode.FOCUS && durationMinutes >= session.targetMinutes),
                distractions: result.data.distractions ?? session.distractions,
                notes: result.data.notes ?? session.notes ?? null,
            },
        });
        return { session: updated };
    });
    app.get("/sessions", async (request, reply) => {
        const result = focus_schema_1.focusSessionsQuerySchema.safeParse(request.query ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
        }
        const { from, to, mode, limit, offset } = result.data;
        const userId = request.user.id;
        const where = {
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
            ...(mode ? { mode } : {}),
        };
        const [sessions, total] = await Promise.all([
            app.prisma.focusSession.findMany({
                where,
                orderBy: { startedAt: "desc" },
                take: limit,
                skip: offset,
            }),
            app.prisma.focusSession.count({ where }),
        ]);
        return { sessions, total, limit, offset };
    });
    app.get("/stats", async (request, reply) => {
        const result = focus_schema_1.focusStatsQuerySchema.safeParse(request.query ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
        }
        const { rangeDays } = result.data;
        const start = (0, dayjs_1.default)().startOf("day").subtract(rangeDays - 1, "day");
        const sessions = await app.prisma.focusSession.findMany({
            where: {
                userId: request.user.id,
                startedAt: { gte: start.toDate() },
                durationMinutes: { not: null },
                deletedAt: null, // Only include non-deleted sessions
            },
            select: {
                startedAt: true,
                durationMinutes: true,
                mode: true,
                distractions: true,
                completed: true,
            },
        });
        const buckets = new Map();
        for (let i = 0; i < rangeDays; i += 1) {
            const day = start.add(i, "day").startOf("day").toISOString();
            buckets.set(day, { focusMinutes: 0, breakMinutes: 0, distractions: 0 });
        }
        let totalFocusMinutes = 0;
        let completedSessions = 0;
        let totalDistractions = 0;
        sessions.forEach((session) => {
            const bucketKey = (0, dayjs_1.default)(session.startedAt).startOf("day").toISOString();
            const bucket = buckets.get(bucketKey);
            if (!bucket) {
                return;
            }
            if (session.mode === enums_1.FocusSessionMode.FOCUS) {
                bucket.focusMinutes += session.durationMinutes ?? 0;
                totalFocusMinutes += session.durationMinutes ?? 0;
                if (session.completed) {
                    completedSessions += 1;
                }
            }
            else {
                bucket.breakMinutes += session.durationMinutes ?? 0;
            }
            bucket.distractions += session.distractions ?? 0;
            totalDistractions += session.distractions ?? 0;
        });
        return {
            rangeDays,
            totalFocusMinutes,
            completedSessions,
            totalDistractions,
            daily: Array.from(buckets.entries()).map(([date, data]) => ({
                date,
                ...data,
            })),
        };
    });
    app.get("/:id", async (request, reply) => {
        const { id } = request.params;
        const session = await app.prisma.focusSession.findFirst({
            where: {
                id,
                userId: request.user.id,
                deletedAt: null, // Only return non-deleted sessions
            },
        });
        if (!session) {
            return reply.code(404).send({ message: "Focus session not found" });
        }
        return { session };
    });
    app.patch("/:id", async (request, reply) => {
        const { id } = request.params;
        const result = focus_schema_1.updateFocusSessionSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const existingSession = await app.prisma.focusSession.findFirst({
            where: { id, userId: request.user.id, deletedAt: null },
        });
        if (!existingSession) {
            return reply.code(404).send({ message: "Focus session not found" });
        }
        const updateData = {};
        if (result.data.notes !== undefined)
            updateData.notes = result.data.notes;
        if (result.data.distractions !== undefined)
            updateData.distractions = result.data.distractions;
        if (result.data.completed !== undefined)
            updateData.completed = result.data.completed;
        const session = await app.prisma.focusSession.update({
            where: { id },
            data: updateData,
        });
        return { session };
    });
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        // Soft delete: set deletedAt timestamp instead of actually deleting
        const updateResult = await app.prisma.focusSession.updateMany({
            where: { id, userId: request.user.id, deletedAt: null },
            data: { deletedAt: new Date() },
        });
        if (updateResult.count === 0) {
            return reply.code(404).send({ message: "Focus session not found" });
        }
        return reply.code(204).send();
    });
}
//# sourceMappingURL=focus.routes.js.map