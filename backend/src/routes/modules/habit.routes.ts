import type { FastifyInstance } from "fastify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import {
  createHabitSchema,
  updateHabitSchema,
  logHabitSchema,
  habitsQuerySchema,
} from "../../schemas/habit.schema";

/**
 * Calculate habit streak with proper timezone handling and date boundaries.
 * A streak is consecutive days with at least one log entry.
 * The current streak starts from today or yesterday if logged today.
 */
async function calculateHabitStreak(
  prisma: any,
  habitId: string,
): Promise<{ streak: number; bestStreak: number }> {
  const logs = await prisma.habitLog.findMany({
    where: { habitId },
    orderBy: { date: "desc" },
  });

  if (logs.length === 0) {
    return { streak: 0, bestStreak: 0 };
  }

  // Use UTC to avoid timezone issues - normalize all dates to start of day in UTC
  const now = dayjs.utc();
  const today = now.startOf("day");
  
  // Track unique dates (normalized to UTC start of day)
  const loggedDates = new Set<string>();
  logs.forEach((log: { date: Date }) => {
    const dateKey = dayjs.utc(log.date).startOf("day").toISOString();
    loggedDates.add(dateKey);
  });

  // Calculate current streak (consecutive days from today backwards)
  let currentStreak = 0;
  let checkDate = today;
  
  while (true) {
    const dateKey = checkDate.toISOString();
    if (loggedDates.has(dateKey)) {
      currentStreak++;
      checkDate = checkDate.subtract(1, "day");
    } else {
      // If today has no log, check yesterday
      if (currentStreak === 0 && checkDate.isSame(today, "day")) {
        checkDate = checkDate.subtract(1, "day");
        continue;
      }
      break;
    }
  }

  // Calculate best streak (longest consecutive sequence)
  const sortedDates = Array.from(loggedDates)
    .map((d) => dayjs.utc(d))
    .sort((a, b) => a.valueOf() - b.valueOf());

  let bestStreak = sortedDates.length > 0 ? 1 : 0;
  let tempStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = sortedDates[i - 1];
    const curr = sortedDates[i];
    if (!prev || !curr) continue;
    
    const daysDiff = curr.diff(prev, "day");
    if (daysDiff === 1) {
      tempStreak++;
    } else {
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      tempStreak = 1;
    }
  }
  
  // Check final streak
  if (tempStreak > bestStreak) {
    bestStreak = tempStreak;
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

    // Normalize date to start of day in UTC to ensure consistency
    const logDate = result.data.date ? dayjs.utc(result.data.date) : dayjs.utc();
    const dateStart = logDate.startOf("day").toDate();

    // Check for existing log with proper error handling for unique constraint
    try {
      const existingLog = await app.prisma.habitLog.findUnique({
        where: {
          habitId_date: {
            habitId: id,
            date: dateStart,
          },
        },
      });

      if (existingLog) {
        return reply.code(409).send({ 
          message: "Habit already logged for this date",
          existingLog 
        });
      }
    } catch (error: any) {
      // Handle unique constraint violation from database
      if (error.code === "P2002") {
        return reply.code(409).send({ 
          message: "Habit already logged for this date" 
        });
      }
      throw error;
    }

    // Create log with normalized date
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
    );

    // Preserve historical best streak - only update if new calculation is higher
    const newBestStreak = Math.max(habit.bestStreak, bestStreak);

    const updatedHabit = await app.prisma.habit.update({
      where: { id },
      data: {
        streak,
        bestStreak: newBestStreak,
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

    // Use UTC for consistent date boundaries
    const now = dayjs.utc();
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

