import type { FastifyInstance } from "fastify";
import dayjs from "dayjs";
import {
  startWorkSchema,
  endWorkSchema,
  workSummaryQuerySchema,
  workSessionsQuerySchema,
  updateWorkSessionSchema,
} from "../../schemas/work.schema";
import { calculateFocusStreak, getTimeSummary } from "../../services/statistics.service";
import { logAudit } from "../../services/audit.service";

function getPeriodConfig(period: "daily" | "weekly" | "monthly") {
  switch (period) {
    case "weekly":
      return { unit: "week" as const, count: 8 };
    case "monthly":
      return { unit: "month" as const, count: 6 };
    case "daily":
    default:
      return { unit: "day" as const, count: 7 };
  }
}

export default async function workRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.post("/start", async (request, reply) => {
    const result = startWorkSchema.safeParse(request.body ?? {});
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

    await logAudit(app.prisma, request.user.id, "work_session", session.id, "create", { startedAt: session.startedAt }, request);
    return reply.code(201).send({ session });
  });

  app.post("/end", async (request, reply) => {
    const result = endWorkSchema.safeParse(request.body ?? {});
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
    const durationMinutes = Math.max(
      1,
      Math.round(dayjs(endTime).diff(dayjs(session.startedAt), "minute", true)),
    );

    const updatedSession = await app.prisma.workSession.update({
      where: { id: session.id },
      data: {
        endedAt: endTime,
        durationMinutes,
        notes: notes ?? session.notes ?? null,
      },
    });

    await logAudit(app.prisma, request.user.id, "work_session", session.id, "update", { action: "end", durationMinutes }, request);
    const streak = await calculateFocusStreak(
      app.prisma,
      request.user.id,
      session.user.dailyGoalMinutes,
    );

    await app.prisma.user.update({
      where: { id: request.user.id },
      data: { focusStreak: streak },
    });

    const summary = await getTimeSummary(app.prisma, request.user.id);

    return {
      session: updatedSession,
      summary,
      focusStreak: streak,
    };
  });

  app.get("/sessions", async (request, reply) => {
    const result = workSessionsQuerySchema.safeParse(request.query ?? {});
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

  app.get("/summary", async (request, reply) => {
    const result = workSummaryQuerySchema.safeParse(request.query ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
    }

    const { period } = result.data;
    const config = getPeriodConfig(period);
    const buckets = new Map<string, number>();
    const now = dayjs();
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
      const bucketKey = dayjs(session.startedAt).startOf(config.unit).toISOString();
      const current = buckets.get(bucketKey) ?? 0;
      buckets.set(bucketKey, current + (session.durationMinutes ?? 0));
    });

    const summary = Array.from(buckets.entries()).map(([periodStart, minutes]) => ({
      periodStart,
      minutes,
    }));

    return { period, summary };
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
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
    const { id } = request.params as { id: string };
    const result = updateWorkSessionSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const existingSession = await app.prisma.workSession.findFirst({
      where: { id, userId: request.user.id, deletedAt: null },
    });

    if (!existingSession) {
      return reply.code(404).send({ message: "Work session not found" });
    }

    const updateData: any = {};
    if (result.data.notes !== undefined) updateData.notes = result.data.notes;
    
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
      const startTime = dayjs(result.data.startedAt ?? existingSession.startedAt);
      const endTime = result.data.endedAt !== undefined 
        ? (result.data.endedAt ? dayjs(result.data.endedAt) : null)
        : (existingSession.endedAt ? dayjs(existingSession.endedAt) : null);
      
      if (endTime) {
        updateData.durationMinutes = Math.max(1, Math.round(endTime.diff(startTime, "minute", true)));
      } else {
        // If endedAt is null or being set to null, clear duration
        updateData.durationMinutes = null;
      }
    }

    const session = await app.prisma.workSession.update({
      where: { id },
      data: updateData,
    });

    await logAudit(app.prisma, request.user.id, "work_session", id, "update", { updatedFields: Object.keys(updateData) }, request);
    return { session };
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // Soft delete: set deletedAt timestamp instead of actually deleting
    const updateResult = await app.prisma.workSession.updateMany({
      where: { id, userId: request.user.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (updateResult.count === 0) {
      return reply.code(404).send({ message: "Work session not found" });
    }

    await logAudit(app.prisma, request.user.id, "work_session", id, "delete", {}, request);
    return reply.code(204).send();
  });
}

