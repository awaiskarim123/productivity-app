import type { FastifyInstance } from "fastify";
import dayjs from "dayjs";
import { FocusSessionMode } from "../../generated/prisma/enums";
import { getTimeSummary } from "../../services/statistics.service";
import { getOrGenerateWeeklyInsights } from "../../services/insights.service";

function buildBuckets(
  start: dayjs.Dayjs,
  count: number,
  unit: "day" | "week" | "month",
): Map<string, number> {
  const buckets = new Map<string, number>();
  for (let i = 0; i < count; i += 1) {
    const bucketStart = start.add(i, unit).startOf(unit).toISOString();
    buckets.set(bucketStart, 0);
  }
  return buckets;
}

function getSuggestedActions({
  focusCompletionRate,
  averageFocusMinutes,
  dailyGoalMinutes,
  streak,
}: {
  focusCompletionRate: number;
  averageFocusMinutes: number;
  dailyGoalMinutes: number;
  streak: number;
}): string[] {
  const suggestions: string[] = [];

  if (focusCompletionRate < 0.6) {
    suggestions.push("Try shorter focus intervals to build consistency.");
  } else if (focusCompletionRate > 0.9) {
    suggestions.push("Great streak! Consider increasing your daily goal slightly.");
  }

  if (averageFocusMinutes < dailyGoalMinutes * 0.5) {
    suggestions.push("Schedule a dedicated focus block early in your day.");
  }

  if (streak < 3) {
    suggestions.push("Log your next session to start building a focus streak.");
  } else {
    suggestions.push("Maintain your momentum by planning tomorrow's focus sessions.");
  }

  return suggestions;
}

export default async function analyticsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/overview", async (request, reply) => {
    const user = await app.prisma.user.findUnique({ where: { id: request.user.id } });

    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    const [summary, workSessions, focusSessions] = await Promise.all([
      getTimeSummary(app.prisma, user.id),
      app.prisma.workSession.findMany({
        where: {
          userId: user.id,
          durationMinutes: { not: null },
          startedAt: {
            gte: dayjs().startOf("day").subtract(6, "day").toDate(),
          },
          deletedAt: null, 
        },
        select: {
          startedAt: true,
          durationMinutes: true,
        },
      }),
      app.prisma.focusSession.findMany({
        where: {
          userId: user.id,
          durationMinutes: { not: null },
          startedAt: {
            gte: dayjs().startOf("day").subtract(29, "day").toDate(),
          },
          deletedAt: null, 
        },
        select: {
          startedAt: true,
          durationMinutes: true,
          completed: true,
          distractions: true,
          mode: true,
        },
      }),
    ]);

    const trendBuckets = buildBuckets(dayjs().startOf("day").subtract(6, "day"), 7, "day");
    workSessions.forEach((session) => {
      const bucketKey = dayjs(session.startedAt).startOf("day").toISOString();
      const current = trendBuckets.get(bucketKey) ?? 0;
      trendBuckets.set(bucketKey, current + (session.durationMinutes ?? 0));
    });

    const focusStats = focusSessions.reduce(
      (acc, session) => {
        if (session.mode === FocusSessionMode.FOCUS) {
          acc.focusMinutes += session.durationMinutes ?? 0;
          acc.focusSessions += 1;
          if (session.completed) {
            acc.completedSessions += 1;
          }
        } else {
          acc.breakMinutes += session.durationMinutes ?? 0;
        }
        acc.distractions += session.distractions ?? 0;
        return acc;
      },
      {
        focusMinutes: 0,
        breakMinutes: 0,
        focusSessions: 0,
        completedSessions: 0,
        distractions: 0,
      },
    );

    const focusCompletionRate =
      focusStats.focusSessions === 0 ? 0 : focusStats.completedSessions / focusStats.focusSessions;
    const averageFocusMinutes =
      focusStats.focusSessions === 0 ? 0 : focusStats.focusMinutes / focusStats.focusSessions;

    const suggestions = getSuggestedActions({
      focusCompletionRate,
      averageFocusMinutes,
      dailyGoalMinutes: user.dailyGoalMinutes,
      streak: user.focusStreak,
    });

    return {
      summary,
      focus: {
        totalMinutes: focusStats.focusMinutes,
        breakMinutes: focusStats.breakMinutes,
        completionRate: focusCompletionRate,
        averageFocusMinutes,
        totalSessions: focusStats.focusSessions,
        completedSessions: focusStats.completedSessions,
        distractions: focusStats.distractions,
      },
      streak: user.focusStreak,
      productivityTrend: Array.from(trendBuckets.entries()).map(([date, minutes]) => ({
        date,
        minutes,
      })),
      suggestions,
    };
  });

  app.get("/weekly-insights", async (request, reply) => {
    const user = await app.prisma.user.findUnique({ where: { id: request.user.id } });

    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    const query = request.query as { weekStart?: string } | undefined;
    const weekStart = query?.weekStart
      ? dayjs(query.weekStart).startOf("week").toDate()
      : dayjs().startOf("week").toDate();

    const insights = await getOrGenerateWeeklyInsights(app.prisma, user.id, weekStart);

    return {
      weekStart: weekStart.toISOString(),
      weekEnd: dayjs(weekStart).endOf("week").toISOString(),
      ...insights,
    };
  });

  app.get("/recommendations", async (request, reply) => {
    const user = await app.prisma.user.findUnique({ where: { id: request.user.id } });

    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    const weekStart = dayjs().startOf("week").toDate();
    const insights = await getOrGenerateWeeklyInsights(app.prisma, user.id, weekStart);

    return {
      recommendations: insights.recommendations,
      habitCorrelations: insights.habitCorrelations || [],
    };
  });
}

