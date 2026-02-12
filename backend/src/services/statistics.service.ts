import type { PrismaClient } from "../generated/prisma/client";
import dayjs from "dayjs";

export async function getWorkDurationInRange(
  prisma: PrismaClient,
  userId: string,
  start: Date,
  end: Date,
): Promise<number> {
  const aggregate = await prisma.workSession.aggregate({
    where: {
      userId,
      startedAt: {
        gte: start,
        lt: end,
      },
      durationMinutes: {
        not: null,
      },
      deletedAt: null, // Only include non-deleted sessions
    },
    _sum: {
      durationMinutes: true,
    },
  });

  return aggregate._sum.durationMinutes ?? 0;
}

/**
 * Compute focus streak from per-day minutes (consecutive days meeting daily goal from today backward).
 */
function streakFromDailyMinutes(
  dailyMinutes: Map<string, number>,
  today: dayjs.Dayjs,
  dailyGoalMinutes: number,
  rangeDays: number,
): number {
  let streak = 0;
  for (let dayOffset = 0; dayOffset < rangeDays; dayOffset += 1) {
    const dayStart = today.subtract(dayOffset, "day");
    const key = dayStart.format("YYYY-MM-DD");
    const minutes = dailyMinutes.get(key) ?? 0;
    if (minutes >= dailyGoalMinutes) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export async function calculateFocusStreak(
  prisma: PrismaClient,
  userId: string,
  dailyGoalMinutes: number,
  rangeDays = 30,
): Promise<number> {
  const today = dayjs().startOf("day");
  const rangeStart = today.subtract(rangeDays, "day").toDate();

  const sessions = await prisma.workSession.findMany({
    where: {
      userId,
      startedAt: { gte: rangeStart },
      durationMinutes: { not: null },
      deletedAt: null,
    },
    select: { startedAt: true, durationMinutes: true },
  });

  const dailyMinutes = new Map<string, number>();
  for (const s of sessions) {
    const d = dayjs(s.startedAt).startOf("day").format("YYYY-MM-DD");
    const current = dailyMinutes.get(d) ?? 0;
    dailyMinutes.set(d, current + (s.durationMinutes ?? 0));
  }

  return streakFromDailyMinutes(dailyMinutes, today, dailyGoalMinutes, rangeDays);
}

export async function getTimeSummary(
  prisma: PrismaClient,
  userId: string,
): Promise<{
  todayMinutes: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  totalMinutes: number;
}> {
  const now = dayjs();
  const todayStart = now.startOf("day");
  const weekStart = now.startOf("week");
  const monthStart = now.startOf("month");

  const [todayMinutes, weeklyMinutes, monthlyMinutes, totalAggregate] = await Promise.all([
    getWorkDurationInRange(prisma, userId, todayStart.toDate(), todayStart.add(1, "day").toDate()),
    getWorkDurationInRange(prisma, userId, weekStart.toDate(), weekStart.add(1, "week").toDate()),
    getWorkDurationInRange(prisma, userId, monthStart.toDate(), monthStart.add(1, "month").toDate()),
    prisma.workSession.aggregate({
      where: { userId, durationMinutes: { not: null }, deletedAt: null },
      _sum: { durationMinutes: true },
    }),
  ]);

  return {
    todayMinutes,
    weeklyMinutes,
    monthlyMinutes,
    totalMinutes: totalAggregate._sum.durationMinutes ?? 0,
  };
}

