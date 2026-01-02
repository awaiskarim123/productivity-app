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
    const result = endWorkSchema.safeParse(request.body ?? {});
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
    const { id } = request.params as { id: string };
    const session = await app.prisma.workSession.findFirst({
      where: {
        id,
        userId: request.user.id,
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
      where: { id, userId: request.user.id },
    });

    if (!existingSession) {
      return reply.code(404).send({ message: "Work session not found" });
    }

    const updateData: any = {};
    if (result.data.notes !== undefined) updateData.notes = result.data.notes;
    if (result.data.startedAt !== undefined) updateData.startedAt = result.data.startedAt;
    if (result.data.endedAt !== undefined) {
      updateData.endedAt = result.data.endedAt;
      // Recalculate duration if endedAt is being updated
      if (result.data.endedAt) {
        const startTime = result.data.startedAt ? dayjs(result.data.startedAt) : dayjs(existingSession.startedAt);
        const endTime = dayjs(result.data.endedAt);
        updateData.durationMinutes = Math.max(1, Math.round(endTime.diff(startTime, "minute", true)));
      } else {
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
    const { id } = request.params as { id: string };
    const session = await app.prisma.workSession.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!session) {
      return reply.code(404).send({ message: "Work session not found" });
    }

    await app.prisma.workSession.delete({ where: { id } });
    return reply.code(204).send();
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
}

