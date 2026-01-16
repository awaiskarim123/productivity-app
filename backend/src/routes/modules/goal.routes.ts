import type { FastifyInstance } from "fastify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  createGoalSchema,
  updateGoalSchema,
  createKeyResultSchema,
  updateKeyResultSchema,
  goalsQuerySchema,
  linkToGoalSchema,
} from "../../schemas/goal.schema";
import {
  calculateGoalProgress,
  updateGoalProgress,
  getGoalContributions,
  getGoalTimeline,
} from "../../services/goal.service";

dayjs.extend(utc);

export default async function goalRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  // ========== Goal CRUD ==========

  app.post("/", async (request, reply) => {
    const result = createGoalSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const { keyResults, startDate, endDate, ...goalData } = result.data;

    const goal = await app.prisma.goal.create({
      data: {
        userId: request.user.id,
        ...goalData,
        startDate: startDate instanceof Date ? startDate : new Date(startDate),
        endDate: endDate instanceof Date ? endDate : new Date(endDate),
        keyResults: {
          create: (keyResults || []).map(kr => ({
            ...kr,
            description: kr.description ?? null,
          })),
        },
      },
      include: {
        keyResults: true,
      },
    });

    // Calculate initial progress
    await updateGoalProgress(app.prisma, goal.id);

    return reply.code(201).send({ goal });
  });

  app.get("/", async (request, reply) => {
    const result = goalsQuerySchema.safeParse(request.query ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
    }

    const { type, isActive, limit, offset } = result.data;
    const where: any = {
      userId: request.user.id,
      deletedAt: null,
    };

    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [goals, total] = await Promise.all([
      app.prisma.goal.findMany({
        where,
        include: {
          keyResults: true,
          _count: {
            select: {
              tasks: true,
              habits: true,
              focusSessions: true,
            },
          },
        },
        orderBy: [
          { isActive: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      app.prisma.goal.count({ where }),
    ]);

    return { goals, total, limit, offset };
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const goal = await app.prisma.goal.findFirst({
      where: {
        id,
        userId: request.user.id,
        deletedAt: null,
      },
      include: {
        keyResults: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            tasks: true,
            habits: true,
            focusSessions: true,
          },
        },
      },
    });

    if (!goal) {
      return reply.code(404).send({ message: "Goal not found" });
    }

    return { goal };
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = updateGoalSchema.safeParse(request.body ?? {});

    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const existingGoal = await app.prisma.goal.findFirst({
      where: {
        id,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!existingGoal) {
      return reply.code(404).send({ message: "Goal not found" });
    }

    const updateData: any = { ...result.data };
    if (result.data.startDate) {
      updateData.startDate =
        result.data.startDate instanceof Date
          ? result.data.startDate
          : new Date(result.data.startDate);
    }
    if (result.data.endDate) {
      updateData.endDate =
        result.data.endDate instanceof Date ? result.data.endDate : new Date(result.data.endDate);
    }

    const goal = await app.prisma.goal.update({
      where: { id },
      data: updateData,
      include: {
        keyResults: true,
      },
    });

    // Recalculate progress after update
    await updateGoalProgress(app.prisma, goal.id);

    return { goal };
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const goal = await app.prisma.goal.findFirst({
      where: {
        id,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      return reply.code(404).send({ message: "Goal not found" });
    }

    // Soft delete
    await app.prisma.goal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return reply.code(204).send();
  });

  // ========== Key Results CRUD ==========

  app.post("/:goalId/key-results", async (request, reply) => {
    const { goalId } = request.params as { goalId: string };
    const result = createKeyResultSchema.safeParse(request.body ?? {});

    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const goal = await app.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      return reply.code(404).send({ message: "Goal not found" });
    }

    const keyResult = await app.prisma.keyResult.create({
      data: {
        goalId,
        ...result.data,
      },
    });

    // Recalculate goal progress
    await updateGoalProgress(app.prisma, goalId);

    return reply.code(201).send({ keyResult });
  });

  app.patch("/key-results/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = updateKeyResultSchema.safeParse(request.body ?? {});

    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const keyResult = await app.prisma.keyResult.findUnique({
      where: { id },
      include: { goal: true },
    });

    if (!keyResult || keyResult.goal.userId !== request.user.id || keyResult.goal.deletedAt) {
      return reply.code(404).send({ message: "Key result not found" });
    }

    // Calculate progress if currentValue or targetValue changed
    if (result.data.currentValue !== undefined || result.data.targetValue !== undefined) {
      const newCurrentValue = result.data.currentValue ?? keyResult.currentValue;
      const newTargetValue = result.data.targetValue ?? keyResult.targetValue;
      // Ensure progressPercent is added to the update data, even if it's not defined on the schema
      (result.data as any).progressPercent =
        newTargetValue > 0 ? (newCurrentValue / newTargetValue) * 100 : 0;
    }

    const updated = await app.prisma.keyResult.update({
      where: { id },
      data: result.data,
    });

    // Recalculate goal progress
    await updateGoalProgress(app.prisma, keyResult.goalId);

    return { keyResult: updated };
  });

  app.delete("/key-results/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const keyResult = await app.prisma.keyResult.findUnique({
      where: { id },
      include: { goal: true },
    });

    if (!keyResult || keyResult.goal.userId !== request.user.id || keyResult.goal.deletedAt) {
      return reply.code(404).send({ message: "Key result not found" });
    }

    await app.prisma.keyResult.delete({
      where: { id },
    });

    // Recalculate goal progress
    await updateGoalProgress(app.prisma, keyResult.goalId);

    return reply.code(204).send();
  });

  // ========== Linking Activities to Goals ==========

  app.post("/:goalId/link/task/:taskId", async (request, reply) => {
    const { goalId, taskId } = request.params as { goalId: string; taskId: string };

    const goal = await app.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      return reply.code(404).send({ message: "Goal not found" });
    }

    const task = await app.prisma.task.findFirst({
      where: {
        id: taskId,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!task) {
      return reply.code(404).send({ message: "Task not found" });
    }

    await app.prisma.task.update({
      where: { id: taskId },
      data: { goalId },
    });

    // Recalculate progress
    await updateGoalProgress(app.prisma, goalId);

    return reply.code(200).send({ message: "Task linked to goal" });
  });

  app.post("/:goalId/link/habit/:habitId", async (request, reply) => {
    const { goalId, habitId } = request.params as { goalId: string; habitId: string };

    const goal = await app.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      return reply.code(404).send({ message: "Goal not found" });
    }

    const habit = await app.prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!habit) {
      return reply.code(404).send({ message: "Habit not found" });
    }

    await app.prisma.habit.update({
      where: { id: habitId },
      data: { goalId },
    });

    // Recalculate progress
    await updateGoalProgress(app.prisma, goalId);

    return reply.code(200).send({ message: "Habit linked to goal" });
  });

  app.post("/:goalId/link/focus-session/:sessionId", async (request, reply) => {
    const { goalId, sessionId } = request.params as { goalId: string; sessionId: string };

    const goal = await app.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      return reply.code(404).send({ message: "Goal not found" });
    }

    const session = await app.prisma.focusSession.findFirst({
      where: {
        id: sessionId,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!session) {
      return reply.code(404).send({ message: "Focus session not found" });
    }

    await app.prisma.focusSession.update({
      where: { id: sessionId },
      data: { goalId },
    });

    // Recalculate progress
    await updateGoalProgress(app.prisma, goalId);

    return reply.code(200).send({ message: "Focus session linked to goal" });
  });

  app.delete("/:goalId/unlink/task/:taskId", async (request, reply) => {
    const { goalId, taskId } = request.params as { goalId: string; taskId: string };

    const task = await app.prisma.task.findFirst({
      where: {
        id: taskId,
        userId: request.user.id,
        goalId,
        deletedAt: null,
      },
    });

    if (!task) {
      return reply.code(404).send({ message: "Task not found or not linked to this goal" });
    }

    await app.prisma.task.update({
      where: { id: taskId },
      data: { goalId: null },
    });

    // Recalculate progress
    await updateGoalProgress(app.prisma, goalId);

    return reply.code(200).send({ message: "Task unlinked from goal" });
  });

  app.delete("/:goalId/unlink/habit/:habitId", async (request, reply) => {
    const { goalId, habitId } = request.params as { goalId: string; habitId: string };

    const habit = await app.prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: request.user.id,
        goalId,
        deletedAt: null,
      },
    });

    if (!habit) {
      return reply.code(404).send({ message: "Habit not found or not linked to this goal" });
    }

    await app.prisma.habit.update({
      where: { id: habitId },
      data: { goalId: null },
    });

    // Recalculate progress
    await updateGoalProgress(app.prisma, goalId);

    return reply.code(200).send({ message: "Habit unlinked from goal" });
  });

  app.delete("/:goalId/unlink/focus-session/:sessionId", async (request, reply) => {
    const { goalId, sessionId } = request.params as { goalId: string; sessionId: string };

    const session = await app.prisma.focusSession.findFirst({
      where: {
        id: sessionId,
        userId: request.user.id,
        goalId,
        deletedAt: null,
      },
    });

    if (!session) {
      return reply.code(404).send({ message: "Focus session not found or not linked to this goal" });
    }

    await app.prisma.focusSession.update({
      where: { id: sessionId },
      data: { goalId: null },
    });

    // Recalculate progress
    await updateGoalProgress(app.prisma, goalId);

    return reply.code(200).send({ message: "Focus session unlinked from goal" });
  });

  // ========== Analysis Endpoints ==========

  app.get("/:id/contributions", async (request, reply) => {
    const { id } = request.params as { id: string };

    const goal = await app.prisma.goal.findFirst({
      where: {
        id,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      return reply.code(404).send({ message: "Goal not found" });
    }

    const contributions = await getGoalContributions(app.prisma, id);

    return { contributions };
  });

  app.get("/:id/timeline", async (request, reply) => {
    const { id } = request.params as { id: string };

    const goal = await app.prisma.goal.findFirst({
      where: {
        id,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      return reply.code(404).send({ message: "Goal not found" });
    }

    const timeline = await getGoalTimeline(app.prisma, id);

    return { timeline };
  });

  // ========== Recalculate Progress ==========

  app.post("/:id/recalculate", async (request, reply) => {
    const { id } = request.params as { id: string };

    const goal = await app.prisma.goal.findFirst({
      where: {
        id,
        userId: request.user.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      return reply.code(404).send({ message: "Goal not found" });
    }

    await updateGoalProgress(app.prisma, id);

    const updated = await app.prisma.goal.findUnique({
      where: { id },
      include: {
        keyResults: true,
      },
    });

    return { goal: updated };
  });
}
