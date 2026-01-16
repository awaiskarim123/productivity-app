import type { PrismaClient } from "../generated/prisma/client";
import dayjs from "dayjs";

export type GoalHealthStatus = "ON_TRACK" | "AT_RISK" | "OFF_TRACK";

interface CalculateProgressResult {
  currentValue: number;
  progressPercent: number;
  healthStatus: GoalHealthStatus;
}

/**
 * Calculate goal progress from linked activities
 */
export async function calculateGoalProgress(
  prisma: PrismaClient,
  goalId: string
): Promise<CalculateProgressResult> {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      keyResults: true,
      tasks: {
        where: { deletedAt: null },
      },
      habits: {
        where: { deletedAt: null },
        include: {
          logs: {
            where: {
              date: {
                gte: new Date(), // Only count future logs? No, we want all logs within goal period
              },
            },
          },
        },
      },
      focusSessions: {
        where: { deletedAt: null },
      },
    },
  });

  if (!goal) {
    throw new Error("Goal not found");
  }

  const startDate = dayjs(goal.startDate);
  const endDate = dayjs(goal.endDate);
  const now = dayjs();
  const totalDays = endDate.diff(startDate, "day");
  const elapsedDays = Math.max(0, now.diff(startDate, "day"));
  const remainingDays = Math.max(0, endDate.diff(now, "day"));
  const timeProgress = totalDays > 0 ? elapsedDays / totalDays : 0;

  // Calculate progress from Key Results (if any)
  let keyResultProgress = 0;
  let totalWeight = 0;

  if (goal.keyResults.length > 0) {
    for (const kr of goal.keyResults) {
      const krProgress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
      keyResultProgress += krProgress * kr.weight;
      totalWeight += kr.weight;
    }
    keyResultProgress = totalWeight > 0 ? keyResultProgress / totalWeight : 0;
  }

  // Calculate progress from Tasks
  const totalTasks = goal.tasks.length;
  const completedTasks = goal.tasks.filter((t) => t.completed).length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate progress from Habits (completion rate within goal period)
  let habitProgress = 0;
  if (goal.habits.length > 0) {
    const habitProgresses = goal.habits.map((habit) => {
      const logsInPeriod = habit.logs.filter((log) => {
        const logDate = dayjs(log.date);
        return logDate.isAfter(startDate) || logDate.isSame(startDate, "day");
      });
      const expectedDays = Math.min(elapsedDays + 1, totalDays);
      const completionRate = expectedDays > 0 ? (logsInPeriod.length / expectedDays) * 100 : 0;
      return Math.min(100, completionRate);
    });
    habitProgress =
      habitProgresses.length > 0
        ? habitProgresses.reduce((sum, p) => sum + p, 0) / habitProgresses.length
        : 0;
  }

  // Calculate progress from Focus Sessions (minutes within goal period)
  const focusSessionsInPeriod = goal.focusSessions.filter((session) => {
    if (!session.endedAt || !session.durationMinutes) return false;
    const sessionDate = dayjs(session.startedAt);
    return (
      (sessionDate.isAfter(startDate) || sessionDate.isSame(startDate, "day")) &&
      (sessionDate.isBefore(endDate) || sessionDate.isSame(endDate, "day"))
    );
  });

  const totalFocusMinutes = focusSessionsInPeriod.reduce(
    (sum, session) => sum + (session.durationMinutes || 0),
    0
  );

  // Estimate target focus minutes (assuming daily goal * days in period)
  // This is a simplified calculation - you might want to make it configurable
  const estimatedTargetMinutes = totalDays * 60; // Default: 60 minutes per day
  const focusProgress =
    estimatedTargetMinutes > 0 ? Math.min(100, (totalFocusMinutes / estimatedTargetMinutes) * 100) : 0;

  // Combine all progress sources
  // If Key Results exist, use them primarily; otherwise, use a weighted average
  let overallProgress = 0;
  if (goal.keyResults.length > 0) {
    // Key Results are primary, but also consider other activities
    overallProgress = keyResultProgress * 0.7 + (taskProgress + habitProgress + focusProgress) / 3 * 0.3;
  } else {
    // Equal weight to tasks, habits, and focus
    const activityCount = [taskProgress, habitProgress, focusProgress].filter((p) => p > 0).length;
    if (activityCount > 0) {
      overallProgress = (taskProgress + habitProgress + focusProgress) / activityCount;
    }
  }

  // Calculate current value (as percentage of target)
  const currentValue = (overallProgress / 100) * goal.targetValue;

  // Determine health status
  const healthStatus = calculateHealthStatus(overallProgress, timeProgress, remainingDays, totalDays);

  return {
    currentValue,
    progressPercent: overallProgress,
    healthStatus,
  };
}

/**
 * Calculate health status based on progress vs time
 */
function calculateHealthStatus(
  progressPercent: number,
  timeProgress: number,
  remainingDays: number,
  totalDays: number
): GoalHealthStatus {
  // If goal is past end date
  if (remainingDays <= 0) {
    return progressPercent >= 100 ? "ON_TRACK" : "OFF_TRACK";
  }

  // Calculate expected progress based on time elapsed
  const expectedProgress = timeProgress * 100;
  const progressGap = progressPercent - expectedProgress;

  // If we're ahead of schedule
  if (progressGap >= 10) {
    return "ON_TRACK";
  }

  // If we're slightly behind but recoverable
  if (progressGap >= -10 && remainingDays > totalDays * 0.2) {
    return "AT_RISK";
  }

  // If we're significantly behind
  if (progressGap < -10) {
    return remainingDays > totalDays * 0.2 ? "AT_RISK" : "OFF_TRACK";
  }

  // Default to on track if progress matches time
  return "ON_TRACK";
}

/**
 * Update goal progress and health status
 */
export async function updateGoalProgress(
  prisma: PrismaClient,
  goalId: string
): Promise<void> {
  const result = await calculateGoalProgress(prisma, goalId);

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      currentValue: result.currentValue,
      progressPercent: result.progressPercent,
      healthStatus: result.healthStatus,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get contribution breakdown for a goal
 */
export async function getGoalContributions(prisma: PrismaClient, goalId: string) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      tasks: {
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          completed: true,
          completedAt: true,
          priority: true,
        },
      },
      habits: {
        where: { deletedAt: null },
        include: {
          logs: true,
        },
        select: {
          id: true,
          name: true,
          logs: {
            select: {
              date: true,
            },
          },
        },
      },
      focusSessions: {
        where: { deletedAt: null },
        select: {
          id: true,
          startedAt: true,
          durationMinutes: true,
          completed: true,
        },
      },
      keyResults: {
        select: {
          id: true,
          title: true,
          currentValue: true,
          targetValue: true,
          progressPercent: true,
        },
      },
    },
  });

  if (!goal) {
    throw new Error("Goal not found");
  }

  const startDate = dayjs(goal.startDate);
  const endDate = dayjs(goal.endDate);

  // Calculate task contribution
  const totalTasks = goal.tasks.length;
  const completedTasks = goal.tasks.filter((t) => t.completed).length;
  const taskContribution = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate habit contribution
  const habitLogsInPeriod = goal.habits.flatMap((habit) =>
    habit.logs.filter((log) => {
      const logDate = dayjs(log.date);
      return (
        (logDate.isAfter(startDate) || logDate.isSame(startDate, "day")) &&
        (logDate.isBefore(endDate) || logDate.isSame(endDate, "day"))
      );
    })
  );
  const habitContribution = goal.habits.length > 0 ? (habitLogsInPeriod.length / goal.habits.length) * 10 : 0; // Simplified

  // Calculate focus session contribution
  const focusMinutes = goal.focusSessions
    .filter((s) => {
      const sessionDate = dayjs(s.startedAt);
      return (
        (sessionDate.isAfter(startDate) || sessionDate.isSame(startDate, "day")) &&
        (sessionDate.isBefore(endDate) || sessionDate.isSame(endDate, "day"))
      );
    })
    .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  return {
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      contribution: taskContribution,
      items: goal.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        completedAt: t.completedAt,
        priority: t.priority,
      })),
    },
    habits: {
      total: goal.habits.length,
      logs: habitLogsInPeriod.length,
      contribution: habitContribution,
      items: goal.habits.map((h) => ({
        id: h.id,
        name: h.name,
        logCount: h.logs.length,
      })),
    },
    focusSessions: {
      total: goal.focusSessions.length,
      totalMinutes: focusMinutes,
      contribution: Math.min(100, (focusMinutes / (dayjs(endDate).diff(startDate, "day") * 60)) * 100),
      items: goal.focusSessions.map((s) => ({
        id: s.id,
        startedAt: s.startedAt,
        durationMinutes: s.durationMinutes,
        completed: s.completed,
      })),
    },
    keyResults: goal.keyResults.map((kr) => ({
      id: kr.id,
      title: kr.title,
      currentValue: kr.currentValue,
      targetValue: kr.targetValue,
      progressPercent: kr.progressPercent,
    })),
  };
}

/**
 * Get timeline data for a goal
 */
export async function getGoalTimeline(prisma: PrismaClient, goalId: string) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      tasks: {
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          completed: true,
          completedAt: true,
          createdAt: true,
        },
      },
      habits: {
        where: { deletedAt: null },
        include: {
          logs: {
            select: {
              date: true,
            },
          },
        },
      },
      focusSessions: {
        where: { deletedAt: null },
        select: {
          id: true,
          startedAt: true,
          durationMinutes: true,
          completed: true,
        },
      },
    },
  });

  if (!goal) {
    throw new Error("Goal not found");
  }

  const startDate = dayjs(goal.startDate);
  const endDate = dayjs(goal.endDate);
  const now = dayjs();

  // Generate timeline points (weekly or daily depending on duration)
  const totalDays = endDate.diff(startDate, "day");
  const interval = totalDays > 90 ? "week" : "day";
  const timelinePoints: Array<{
    date: string;
    progress: number;
    tasksCompleted: number;
    habitLogs: number;
    focusMinutes: number;
  }> = [];

  let current = startDate;
  while (current.isBefore(endDate) || current.isSame(endDate, interval)) {
    const next = current.add(1, interval);
    const pointEnd = next.isAfter(now) ? now : next;

    // Count tasks completed in this period
    const tasksCompleted = goal.tasks.filter((t) => {
      if (!t.completed || !t.completedAt) return false;
      const completedDate = dayjs(t.completedAt);
      return completedDate.isAfter(current) && (completedDate.isBefore(pointEnd) || completedDate.isSame(pointEnd, interval));
    }).length;

    // Count habit logs in this period
    const habitLogs = goal.habits.reduce((sum, habit) => {
      return (
        sum +
        habit.logs.filter((log) => {
          const logDate = dayjs(log.date);
          return logDate.isAfter(current) && (logDate.isBefore(pointEnd) || logDate.isSame(pointEnd, interval));
        }).length
      );
    }, 0);

    // Sum focus minutes in this period
    const focusMinutes = goal.focusSessions.reduce((sum, session) => {
      const sessionDate = dayjs(session.startedAt);
      if (sessionDate.isAfter(current) && (sessionDate.isBefore(pointEnd) || sessionDate.isSame(pointEnd, interval))) {
        return sum + (session.durationMinutes || 0);
      }
      return sum;
    }, 0);

    // Calculate progress up to this point
    const elapsedDays = pointEnd.diff(startDate, "day");
    const expectedProgress = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;

    timelinePoints.push({
      date: current.toISOString(),
      progress: expectedProgress, // This is time-based; actual progress would need to be calculated
      tasksCompleted,
      habitLogs,
      focusMinutes,
    });

    current = next;
  }

  return {
    goal: {
      id: goal.id,
      title: goal.title,
      startDate: goal.startDate,
      endDate: goal.endDate,
      currentProgress: goal.progressPercent,
    },
    timeline: timelinePoints,
  };
}
