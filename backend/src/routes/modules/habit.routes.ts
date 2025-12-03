import type { FastifyInstance } from "fastify";
import dayjs from "dayjs";
import {
  createHabitSchema,
  updateHabitSchema,
  logHabitSchema,
  habitsQuerySchema,
} from "../../schemas/habit.schema";

async function calculateHabitStreak(
  prisma: any,
  habitId: string,
  targetDays: number,
): Promise<{ streak: number; bestStreak: number }> {
  const logs = await prisma.habitLog.findMany({
    where: { habitId },
    orderBy: { date: "desc" },
  });

  if (logs.length === 0) {
    return { streak: 0, bestStreak: 0 };
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  const today = dayjs().startOf("day");
  let expectedDate = today;

  for (const log of logs) {
    const logDate = dayjs(log.date).startOf("day");
    const daysDiff = expectedDate.diff(logDate, "day");

    if (daysDiff === 0) {
      tempStreak += 1;
      expectedDate = expectedDate.subtract(1, "day");
    } else if (daysDiff === 1 && currentStreak === 0) {
      currentStreak = tempStreak + 1;
      tempStreak = currentStreak;
      expectedDate = logDate.subtract(1, "day");
    } else {
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      if (currentStreak === 0 && daysDiff <= targetDays) {
        tempStreak = 1;
        expectedDate = logDate.subtract(1, "day");
      } else {
        break;
      }
    }
  }

  if (currentStreak === 0 && tempStreak > 0) {
    const firstLogDate = dayjs(logs[0].date).startOf("day");
    if (today.diff(firstLogDate, "day") <= 1) {
      currentStreak = tempStreak;
    }
  }

  if (tempStreak > bestStreak) {
    bestStreak = tempStreak;
  }
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  return { streak: currentStreak, bestStreak };
}

export default async function habitRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.post("/", async (request, reply) => {
    const result = createHabitSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const habit = await app.prisma.habit.create({
      data: {
        userId: request.user.id,
        name: result.data.name,
        description: result.data.description ?? null,
        color: result.data.color ?? "#34d399",
        icon: result.data.icon ?? null,
        targetDays: result.data.targetDays ?? 7,
      },
    });

    return reply.code(201).send({ habit });
  });

  app.get("/", async (request, reply) => {
    const result = habitsQuerySchema.safeParse(request.query ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
    }

    const where: any = { userId: request.user.id };
    if (result.data.isActive !== undefined) {
      where.isActive = result.data.isActive;
    }

    const habits = await app.prisma.habit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        logs: {
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });

    return { habits };
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const habit = await app.prisma.habit.findFirst({
      where: { id, userId: request.user.id },
      include: {
        logs: {
          orderBy: { date: "desc" },
          take: 100,
        },
      },
    });

    if (!habit) {
      return reply.code(404).send({ message: "Habit not found" });
    }

    return { habit };
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = updateHabitSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const existingHabit = await app.prisma.habit.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!existingHabit) {
      return reply.code(404).send({ message: "Habit not found" });
    }

    const updateData: any = {};
    if (result.data.name !== undefined) updateData.name = result.data.name;
    if (result.data.description !== undefined) updateData.description = result.data.description;
    if (result.data.color !== undefined) updateData.color = result.data.color;
    if (result.data.icon !== undefined) updateData.icon = result.data.icon;
    if (result.data.targetDays !== undefined) updateData.targetDays = result.data.targetDays;
    if (result.data.isActive !== undefined) updateData.isActive = result.data.isActive;

    const habit = await app.prisma.habit.update({
      where: { id },
      data: updateData,
    });

    return { habit };
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const habit = await app.prisma.habit.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!habit) {
      return reply.code(404).send({ message: "Habit not found" });
    }

    await app.prisma.habit.delete({ where: { id } });
    return reply.code(204).send();
  });

  app.post("/:id/log", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = logHabitSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const habit = await app.prisma.habit.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!habit) {
      return reply.code(404).send({ message: "Habit not found" });
    }

    const logDate = result.data.date ? dayjs(result.data.date).toDate() : new Date();
    const dateStart = dayjs(logDate).startOf("day").toDate();

    const existingLog = await app.prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: dateStart,
        },
      },
    });

    if (existingLog) {
      return reply.code(400).send({ message: "Habit already logged for this date" });
    }

    const log = await app.prisma.habitLog.create({
      data: {
        habitId: id,
        date: dateStart,
        notes: result.data.notes ?? null,
      },
    });

    const { streak, bestStreak } = await calculateHabitStreak(
      app.prisma,
      id,
      habit.targetDays,
    );

    const updatedHabit = await app.prisma.habit.update({
      where: { id },
      data: {
        streak,
        bestStreak: Math.max(habit.bestStreak, bestStreak),
      },
    });

    return { log, habit: updatedHabit };
  });

  app.delete("/:id/log/:logId", async (request, reply) => {
    const { id, logId } = request.params as { id: string; logId: string };
    const habit = await app.prisma.habit.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!habit) {
      return reply.code(404).send({ message: "Habit not found" });
    }

    const log = await app.prisma.habitLog.findFirst({
      where: { id: logId, habitId: id },
    });

    if (!log) {
      return reply.code(404).send({ message: "Log not found" });
    }

    await app.prisma.habitLog.delete({ where: { id: logId } });

    const { streak, bestStreak } = await calculateHabitStreak(
      app.prisma,
      id,
      habit.targetDays,
    );

    const updatedHabit = await app.prisma.habit.update({
      where: { id },
      data: {
        streak,
        bestStreak,
      },
    });

    return { habit: updatedHabit };
  });

  app.get("/:id/stats", async (request, reply) => {
    const { id } = request.params as { id: string };
    const habit = await app.prisma.habit.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!habit) {
      return reply.code(404).send({ message: "Habit not found" });
    }

    const now = dayjs();
    const startOfWeek = now.startOf("week");
    const startOfMonth = now.startOf("month");
    const startOfYear = now.startOf("year");

    const [totalLogs, weekLogs, monthLogs, yearLogs] = await Promise.all([
      app.prisma.habitLog.count({ where: { habitId: id } }),
      app.prisma.habitLog.count({
        where: {
          habitId: id,
          date: { gte: startOfWeek.toDate() },
        },
      }),
      app.prisma.habitLog.count({
        where: {
          habitId: id,
          date: { gte: startOfMonth.toDate() },
        },
      }),
      app.prisma.habitLog.count({
        where: {
          habitId: id,
          date: { gte: startOfYear.toDate() },
        },
      }),
    ]);

    return {
      totalLogs,
      weekLogs,
      monthLogs,
      yearLogs,
      streak: habit.streak,
      bestStreak: habit.bestStreak,
    };
  });
}

