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
    },
    _sum: {
      durationMinutes: true,
    },
  });

  return aggregate._sum.durationMinutes ?? 0;
}

export async function calculateFocusStreak(
  prisma: PrismaClient,
  userId: string,
  dailyGoalMinutes: number,
  rangeDays = 30,
): Promise<number> {
  let streak = 0;
  const today = dayjs().startOf("day");

  for (let dayOffset = 0; dayOffset < rangeDays; dayOffset += 1) {
    const dayStart = today.subtract(dayOffset, "day");
    const dayEnd = dayStart.endOf("day");
    const minutes = await getWorkDurationInRange(
      prisma,
      userId,
      dayStart.toDate(),
      dayEnd.add(1, "millisecond").toDate(),
    );

    if (minutes >= dailyGoalMinutes) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
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
      where: { userId, durationMinutes: { not: null } },
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

