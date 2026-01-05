import type { PrismaClient } from "../generated/prisma/client";
import dayjs from "dayjs";
import { FocusSessionMode } from "../generated/prisma/enums";

export interface WeeklyInsightData {
  peakHours: number[];
  lowProductivityDays: string[];
  weekOverWeekTrend: "improving" | "declining" | "stable";
  averageDailyMinutes: number;
  totalSessions: number;
  completedFocusSessions: number;
  habitCorrelations?: Array<{
    habitId: string;
    habitName: string;
    impact: "positive" | "neutral" | "negative";
    correlationScore: number;
  }>;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    confidence: "low" | "medium" | "high";
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    confidence: "low" | "medium" | "high";
  }>;
}

export async function generateWeeklyInsights(
  prisma: PrismaClient,
  userId: string,
  weekStart: Date,
  weekEnd: Date,
): Promise<WeeklyInsightData> {
  // Fetch all work sessions for the week
  const workSessions = await prisma.workSession.findMany({
    where: {
      userId,
      startedAt: {
        gte: weekStart,
        lt: weekEnd,
      },
      durationMinutes: { not: null },
      deletedAt: null,
    },
    select: {
      startedAt: true,
      durationMinutes: true,
    },
  });

  // Fetch all focus sessions for the week
  const focusSessions = await prisma.focusSession.findMany({
    where: {
      userId,
      startedAt: {
        gte: weekStart,
        lt: weekEnd,
      },
      durationMinutes: { not: null },
      deletedAt: null,
    },
    select: {
      startedAt: true,
      durationMinutes: true,
      completed: true,
      mode: true,
    },
  });

  // Fetch habits and their logs for the week
  const habits = await prisma.habit.findMany({
    where: {
      userId,
      isActive: true,
      deletedAt: null,
    },
    include: {
      logs: {
        where: {
          date: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
      },
    },
  });

  // Calculate peak hours (hours with most productivity)
  const hourProductivity = new Map<number, number>();
  workSessions.forEach((session) => {
    const hour = dayjs(session.startedAt).hour();
    const current = hourProductivity.get(hour) ?? 0;
    hourProductivity.set(hour, current + (session.durationMinutes ?? 0));
  });

  const sortedHours = Array.from(hourProductivity.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => hour);

  // Calculate low productivity days
  const dayProductivity = new Map<string, number>();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  workSessions.forEach((session) => {
    const dayIdx = dayjs(session.startedAt).day();
    const dayName = dayNames[dayIdx !== undefined ? dayIdx : 0];
    if (typeof dayName === "string") {
      const current = dayProductivity.get(dayName) ?? 0;
      dayProductivity.set(dayName, current + (session.durationMinutes ?? 0));
    }
  });

  const averageDailyMinutes =
    Array.from(dayProductivity.values()).reduce((sum, val) => sum + val, 0) / 7;
  const lowProductivityDays = Array.from(dayProductivity.entries())
    .filter(([, minutes]) => minutes < averageDailyMinutes * 0.7)
    .map(([day]) => day);

  // Calculate week-over-week trend
  const previousWeekStart = dayjs(weekStart).subtract(1, "week").toDate();
  const previousWeekEnd = dayjs(weekEnd).subtract(1, "week").toDate();

  const previousWeekSessions = await prisma.workSession.findMany({
    where: {
      userId,
      startedAt: {
        gte: previousWeekStart,
        lt: previousWeekEnd,
      },
      durationMinutes: { not: null },
      deletedAt: null,
    },
    select: {
      durationMinutes: true,
    },
  });

  const currentWeekTotal = workSessions.reduce(
    (sum, s) => sum + (s.durationMinutes ?? 0),
    0,
  );
  const previousWeekTotal = previousWeekSessions.reduce(
    (sum, s) => sum + (s.durationMinutes ?? 0),
    0,
  );

  let weekOverWeekTrend: "improving" | "declining" | "stable" = "stable";
  const changePercent = previousWeekTotal > 0
    ? ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100
    : 0;

  if (changePercent > 10) {
    weekOverWeekTrend = "improving";
  } else if (changePercent < -10) {
    weekOverWeekTrend = "declining";
  }

  // Calculate habit correlations
  const habitCorrelations = habits.map((habit) => {
    const habitLogDays = new Set(
      habit.logs.map((log) => dayjs(log.date).format("YYYY-MM-DD")),
    );

    // Calculate productivity on days when habit was logged vs not logged
    let productivityWithHabit = 0;
    let productivityWithoutHabit = 0;
    let daysWithHabit = 0;
    let daysWithoutHabit = 0;

    workSessions.forEach((session) => {
      const sessionDate = dayjs(session.startedAt).format("YYYY-MM-DD");
      const minutes = session.durationMinutes ?? 0;

      if (habitLogDays.has(sessionDate)) {
        productivityWithHabit += minutes;
        daysWithHabit += 1;
      } else {
        productivityWithoutHabit += minutes;
        daysWithoutHabit += 1;
      }
    });

    const avgWithHabit = daysWithHabit > 0 ? productivityWithHabit / daysWithHabit : 0;
    const avgWithoutHabit = daysWithoutHabit > 0 ? productivityWithoutHabit / daysWithoutHabit : 0;

    let impact: "positive" | "neutral" | "negative" = "neutral";
    let correlationScore = 0;

    if (daysWithHabit > 0 && daysWithoutHabit > 0) {
      const difference = avgWithHabit - avgWithoutHabit;
      correlationScore = difference / Math.max(avgWithoutHabit, 1);

      if (correlationScore > 0.2) {
        impact = "positive";
      } else if (correlationScore < -0.2) {
        impact = "negative";
      }
    }

    return {
      habitId: habit.id,
      habitName: habit.name,
      impact,
      correlationScore: Math.round(correlationScore * 100) / 100,
    };
  });

  // Generate insights
  const insights: Array<{
    type: string;
    title: string;
    description: string;
    confidence: "low" | "medium" | "high";
  }> = [];

  if (sortedHours.length > 0) {
    const peakHourRange = sortedHours.length === 1
      ? `${sortedHours[0]}:00`
      : `${Math.min(...sortedHours)}:00 - ${Math.max(...sortedHours) + 1}:00`;
    insights.push({
      type: "peak_hours",
      title: "Peak Productivity Hours",
      description: `You focus best between ${peakHourRange}. Schedule important work during these times.`,
      confidence: sortedHours.length >= 2 ? "high" : "medium",
    });
  }

  if (lowProductivityDays.length > 0) {
    insights.push({
      type: "low_productivity_days",
      title: "Low Productivity Days",
      description: `${lowProductivityDays.join(", ")} tend to be less productive. Consider planning lighter tasks or breaks on these days.`,
      confidence: lowProductivityDays.length >= 2 ? "high" : "medium",
    });
  }

  if (weekOverWeekTrend !== "stable") {
    insights.push({
      type: "trend",
      title: weekOverWeekTrend === "improving" ? "Productivity Improving" : "Productivity Declining",
      description: weekOverWeekTrend === "improving"
        ? "Your productivity is up compared to last week. Keep up the momentum!"
        : "Your productivity is down compared to last week. Consider reviewing your schedule.",
      confidence: Math.abs(changePercent) > 20 ? "high" : "medium",
    });
  }

  // Generate recommendations
  const recommendations: Array<{
    type: string;
    title: string;
    description: string;
    confidence: "low" | "medium" | "high";
  }> = [];

  const completedFocusSessions = focusSessions.filter(
    (s) => s.mode === FocusSessionMode.FOCUS && s.completed,
  ).length;

  const focusCompletionRate =
    focusSessions.filter((s) => s.mode === FocusSessionMode.FOCUS).length > 0
      ? completedFocusSessions /
          focusSessions.filter((s) => s.mode === FocusSessionMode.FOCUS).length
      : 0;

  if (focusCompletionRate < 0.6 && focusSessions.length > 0) {
    recommendations.push({
      type: "focus_duration",
      title: "Shorter Focus Sessions",
      description: "Try 25-minute focus sessions instead of longer ones to improve completion rates.",
      confidence: "high",
    });
  }

  const averageFocusMinutes =
    focusSessions.filter((s) => s.mode === FocusSessionMode.FOCUS).length > 0
      ? focusSessions
          .filter((s) => s.mode === FocusSessionMode.FOCUS)
          .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0) /
          focusSessions.filter((s) => s.mode === FocusSessionMode.FOCUS).length
      : 0;

  if (averageFocusMinutes > 0 && averageFocusMinutes < 30) {
    recommendations.push({
      type: "focus_target",
      title: "Increase Focus Duration",
      description: `Your average focus session is ${Math.round(averageFocusMinutes)} minutes. Try aiming for 30-45 minutes.`,
      confidence: "medium",
    });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && averageDailyMinutes < user.dailyGoalMinutes * 0.7) {
    recommendations.push({
      type: "daily_goal",
      title: "Adjust Daily Goal",
      description: `You're averaging ${Math.round(averageDailyMinutes)} minutes per day. Consider setting a more achievable daily goal.`,
      confidence: "medium",
    });
  }

  // Break timing recommendation
  const breakSessions = focusSessions.filter((s) => s.mode === FocusSessionMode.BREAK);
  if (breakSessions.length === 0 && focusSessions.length > 3) {
    recommendations.push({
      type: "break_timing",
      title: "Schedule Regular Breaks",
      description: "You've completed several focus sessions without breaks. Regular breaks improve long-term productivity.",
      confidence: "high",
    });
  }

  return {
    peakHours: sortedHours,
    lowProductivityDays,
    weekOverWeekTrend,
    averageDailyMinutes: Math.round(averageDailyMinutes),
    totalSessions: workSessions.length,
    completedFocusSessions,
    habitCorrelations,
    insights,
    recommendations,
  };
}

export async function getOrGenerateWeeklyInsights(
  prisma: PrismaClient,
  userId: string,
  weekStart?: Date,
): Promise<WeeklyInsightData> {
  const weekStartDate = weekStart ?? dayjs().startOf("week").toDate();
  const weekEndDate = dayjs(weekStartDate).endOf("week").toDate();

  // Try to get existing insight
  const existing = await prisma.weeklyInsight.findUnique({
    where: {
      userId_weekStart: {
        userId,
        weekStart: weekStartDate,
      },
    },
  });

  if (existing) {
    return {
      peakHours: existing.peakHours,
      lowProductivityDays: existing.lowProductivityDays,
      weekOverWeekTrend: existing.weekOverWeekTrend as "improving" | "declining" | "stable",
      averageDailyMinutes: existing.averageDailyMinutes,
      totalSessions: existing.totalSessions,
      completedFocusSessions: existing.completedFocusSessions,
      habitCorrelations: existing.habitCorrelations as any,
      insights: existing.insights as any,
      recommendations: existing.recommendations as any,
    };
  }

  // Generate new insights
  const insights = await generateWeeklyInsights(prisma, userId, weekStartDate, weekEndDate);

  // Store in database
  await prisma.weeklyInsight.upsert({
    where: {
      userId_weekStart: {
        userId,
        weekStart: weekStartDate,
      },
    },
    create: {
      userId,
      weekStart: weekStartDate,
      weekEnd: weekEndDate,
      peakHours: insights.peakHours,
      lowProductivityDays: insights.lowProductivityDays,
      weekOverWeekTrend: insights.weekOverWeekTrend,
      averageDailyMinutes: insights.averageDailyMinutes,
      totalSessions: insights.totalSessions,
      completedFocusSessions: insights.completedFocusSessions,
      habitCorrelations: insights.habitCorrelations as any,
      insights: insights.insights as any,
      recommendations: insights.recommendations as any,
    },
    update: {
      peakHours: insights.peakHours,
      lowProductivityDays: insights.lowProductivityDays,
      weekOverWeekTrend: insights.weekOverWeekTrend,
      averageDailyMinutes: insights.averageDailyMinutes,
      totalSessions: insights.totalSessions,
      completedFocusSessions: insights.completedFocusSessions,
      habitCorrelations: insights.habitCorrelations as any,
      insights: insights.insights as any,
      recommendations: insights.recommendations as any,
      updatedAt: new Date(),
    },
  });

  return insights;
}

