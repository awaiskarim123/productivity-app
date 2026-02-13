import type { PrismaClient } from "../generated/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface DailySummary {
  tasksCompletedToday: number;
  focusMinutesToday: number;
  habitsLoggedToday: number;
  dailyGoalMinutes: number;
  focusStreak: number;
  goalProgressPercent: number;
}

/** Pure: focus progress toward daily goal as 0–100. */
export function goalProgressPercent(
  focusMinutes: number,
  dailyGoalMinutes: number,
): number {
  if (dailyGoalMinutes <= 0) return 0;
  return Math.min(100, Math.round((focusMinutes / dailyGoalMinutes) * 100));
}

export async function getDailySummary(
  prisma: PrismaClient,
  userId: string,
): Promise<DailySummary> {
  const now = dayjs.utc();
  const todayStart = now.startOf("day").toDate();
  const todayEnd = now.endOf("day").toDate();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyGoalMinutes: true, focusStreak: true },
  });
  if (!user) {
    return {
      tasksCompletedToday: 0,
      focusMinutesToday: 0,
      habitsLoggedToday: 0,
      dailyGoalMinutes: 300,
      focusStreak: 0,
      goalProgressPercent: 0,
    };
  }

  const [tasksCompletedToday, focusResult, habitsLoggedToday] = await Promise.all([
    prisma.task.count({
      where: {
        userId,
        completed: true,
        completedAt: { gte: todayStart, lte: todayEnd },
        deletedAt: null,
      },
    }),
    prisma.focusSession.aggregate({
      where: {
        userId,
        mode: "FOCUS",
        startedAt: { gte: todayStart, lte: todayEnd },
        deletedAt: null,
      },
      _sum: { durationMinutes: true },
    }),
    prisma.habitLog.count({
      where: {
        habit: { userId },
        date: { gte: todayStart, lte: todayEnd },
      },
    }),
  ]);

  const focusMinutesToday = focusResult._sum.durationMinutes ?? 0;
  const progress = goalProgressPercent(focusMinutesToday, user.dailyGoalMinutes);

  return {
    tasksCompletedToday,
    focusMinutesToday,
    habitsLoggedToday,
    dailyGoalMinutes: user.dailyGoalMinutes,
    focusStreak: user.focusStreak,
    goalProgressPercent: progress,
  };
}
