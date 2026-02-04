import type { PrismaClient } from "../generated/prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { FocusSessionMode } from "../generated/prisma/enums";

dayjs.extend(utc);

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export interface FocusSessionForHeatmap {
  startedAt: Date;
  durationMinutes: number | null;
  mode: "FOCUS" | "BREAK";
}

export interface HeatmapCell {
  dayIndex: number;
  hour: number;
  minutes: number;
}

export interface FocusHeatmap {
  days: string[];
  hours: number[];
  cells: HeatmapCell[];
}

/** Pure: build focus-by-hour/day heatmap from session list. */
export function buildFocusHeatmap(
  sessions: FocusSessionForHeatmap[],
  _daysBack: number,
): FocusHeatmap {
  const grid = new Map<string, number>();

  for (const session of sessions) {
    if (session.mode !== FocusSessionMode.FOCUS || session.durationMinutes == null) continue;
    const d = dayjs(session.startedAt).utc();
    const dayIndex = (d.day() + 6) % 7;
    const hour = d.hour();
    const key = `${dayIndex}-${hour}`;
    grid.set(key, (grid.get(key) ?? 0) + session.durationMinutes);
  }

  const cells: HeatmapCell[] = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    for (const hour of HOURS) {
      const key = `${dayIndex}-${hour}`;
      cells.push({
        dayIndex,
        hour,
        minutes: grid.get(key) ?? 0,
      });
    }
  }

  return {
    days: [...DAY_LABELS],
    hours: [...HOURS],
    cells,
  };
}

export interface FocusSessionForBurnout {
  durationMinutes: number | null;
  completed: boolean;
  mode: "FOCUS" | "BREAK";
}

export interface BurnoutOptions {
  longSessionMinutes: number;
  lowCompletionThreshold: number;
}

export interface BurnoutSignal {
  atRisk: boolean;
  longSessionsCount: number;
  completionRate: number;
  message?: string;
}

/** Pure: detect burnout from long sessions + low completion. */
export function detectBurnout(
  sessions: FocusSessionForBurnout[],
  options: BurnoutOptions = { longSessionMinutes: 60, lowCompletionThreshold: 0.5 },
): BurnoutSignal {
  const focusSessions = sessions.filter((s) => s.mode === FocusSessionMode.FOCUS);
  const longSessionsCount = focusSessions.filter(
    (s) => (s.durationMinutes ?? 0) >= options.longSessionMinutes,
  ).length;
  const completed = focusSessions.filter((s) => s.completed).length;
  const completionRate =
    focusSessions.length === 0 ? 1 : completed / focusSessions.length;

  const atRisk =
    longSessionsCount >= 2 &&
    completionRate < options.lowCompletionThreshold;

  const message = atRisk
    ? "Multiple long focus sessions with low completion. Consider shorter blocks and more breaks."
    : undefined;

  return {
    atRisk,
    longSessionsCount,
    completionRate,
    ...(message !== undefined && { message }),
  };
}

export interface ProductivityScoreParams {
  focusMinutes: number;
  dailyGoalMinutes: number;
  focusCompletionRate: number;
  streak: number;
  taskCompletionRate: number;
  workDaysInPeriod: number;
}

export interface ProductivityScoreBreakdown {
  focusTime: number;
  completionRate: number;
  consistency: number;
  taskCompletion: number;
}

export interface ProductivityScoreResult {
  score: number;
  breakdown: ProductivityScoreBreakdown;
}

/** Pure: weighted productivity score 0–100. */
export function computeProductivityScore(
  params: ProductivityScoreParams,
): ProductivityScoreResult {
  const {
    focusMinutes,
    dailyGoalMinutes,
    focusCompletionRate,
    streak,
    taskCompletionRate,
    workDaysInPeriod,
  } = params;

  const focusRatio =
    dailyGoalMinutes > 0
      ? Math.min(1, focusMinutes / (dailyGoalMinutes * Math.max(1, workDaysInPeriod)))
      : 0;
  const focusTime = Math.round(focusRatio * 100);

  const completionRate = Math.round(focusCompletionRate * 100);
  const consistency = Math.min(100, Math.round((streak / 7) * 100));
  const taskCompletion = Math.round(taskCompletionRate * 100);

  const weights = { focusTime: 0.3, completionRate: 0.25, consistency: 0.25, taskCompletion: 0.2 };
  const score = Math.round(
    focusTime * weights.focusTime +
      completionRate * weights.completionRate +
      consistency * weights.consistency +
      taskCompletion * weights.taskCompletion,
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: {
      focusTime,
      completionRate,
      consistency,
      taskCompletion,
    },
  };
}

export interface PeriodAggregate {
  focusMinutes: number;
  completedSessions: number;
  totalSessions: number;
  taskCompleted: number;
  taskTotal: number;
}

export interface PeriodComparisonDelta {
  focusMinutes: number;
  focusMinutesPercent: number;
  completionRateChange: number;
  taskCompletionChange: number;
}

export interface PeriodComparison {
  thisWeek: PeriodAggregate;
  lastWeek: PeriodAggregate;
  delta: PeriodComparisonDelta;
}

/** Pure: build period comparison with deltas. */
export function buildPeriodComparison(
  thisWeek: PeriodAggregate,
  lastWeek: PeriodAggregate,
): PeriodComparison {
  const completionThis =
    thisWeek.totalSessions > 0
      ? thisWeek.completedSessions / thisWeek.totalSessions
      : 0;
  const completionLast =
    lastWeek.totalSessions > 0
      ? lastWeek.completedSessions / lastWeek.totalSessions
      : 0;
  const taskRateThis =
    thisWeek.taskTotal > 0 ? thisWeek.taskCompleted / thisWeek.taskTotal : 0;
  const taskRateLast =
    lastWeek.taskTotal > 0 ? lastWeek.taskCompleted / lastWeek.taskTotal : 0;

  const focusMinutesPercent =
    lastWeek.focusMinutes > 0
      ? ((thisWeek.focusMinutes - lastWeek.focusMinutes) / lastWeek.focusMinutes) * 100
      : 0;

  return {
    thisWeek,
    lastWeek,
    delta: {
      focusMinutes: thisWeek.focusMinutes - lastWeek.focusMinutes,
      focusMinutesPercent,
      completionRateChange: (completionThis - completionLast) * 100,
      taskCompletionChange: (taskRateThis - taskRateLast) * 100,
    },
  };
}

// --- Data-fetching functions (used by routes) ---

export async function getFocusHeatmapData(
  prisma: PrismaClient,
  userId: string,
  daysBack: number = 14,
): Promise<FocusHeatmap> {
  const start = dayjs().utc().subtract(daysBack, "day").startOf("day").toDate();
  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      startedAt: { gte: start },
      deletedAt: null,
      durationMinutes: { not: null },
    },
    select: {
      startedAt: true,
      durationMinutes: true,
      mode: true,
    },
  });
  return buildFocusHeatmap(
    sessions as FocusSessionForHeatmap[],
    daysBack,
  );
}

export async function getBurnoutSignalData(
  prisma: PrismaClient,
  userId: string,
  windowDays: number = 7,
): Promise<BurnoutSignal> {
  const start = dayjs().utc().subtract(windowDays, "day").startOf("day").toDate();
  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      startedAt: { gte: start },
      deletedAt: null,
      mode: FocusSessionMode.FOCUS,
    },
    select: {
      durationMinutes: true,
      completed: true,
      mode: true,
    },
  });
  return detectBurnout(sessions as FocusSessionForBurnout[]);
}

export async function getProductivityScoreData(
  prisma: PrismaClient,
  userId: string,
  periodDays: number = 7,
): Promise<ProductivityScoreResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return computeProductivityScore({
      focusMinutes: 0,
      dailyGoalMinutes: 300,
      focusCompletionRate: 0,
      streak: 0,
      taskCompletionRate: 0,
      workDaysInPeriod: periodDays,
    });
  }

  const start = dayjs().utc().subtract(periodDays, "day").startOf("day").toDate();

  const [focusSessions, tasks] = await Promise.all([
    prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: start },
        deletedAt: null,
        mode: FocusSessionMode.FOCUS,
      },
      select: {
        durationMinutes: true,
        completed: true,
      },
    }),
    prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: start },
        deletedAt: null,
      },
      select: { completed: true },
    }),
  ]);

  const focusMinutes = focusSessions.reduce(
    (sum, s) => sum + (s.durationMinutes ?? 0),
    0,
  );
  const focusTotal = focusSessions.length;
  const focusCompletionRate =
    focusTotal === 0 ? 0 : focusSessions.filter((t) => t.completed).length / focusTotal;
  const taskTotal = tasks.length;
  const taskCompletionRate =
    taskTotal === 0 ? 0 : tasks.filter((t) => t.completed).length / taskTotal;

  return computeProductivityScore({
    focusMinutes,
    dailyGoalMinutes: user.dailyGoalMinutes,
    focusCompletionRate,
    streak: user.focusStreak,
    taskCompletionRate,
    workDaysInPeriod: periodDays,
  });
}

export async function getPeriodComparisonData(
  prisma: PrismaClient,
  userId: string,
): Promise<PeriodComparison> {
  const now = dayjs().utc();
  const thisWeekStart = now.startOf("week").toDate();
  const thisWeekEnd = now.endOf("week").add(1, "ms").toDate();
  const lastWeekStart = now.subtract(1, "week").startOf("week").toDate();
  const lastWeekEnd = now.subtract(1, "week").endOf("week").add(1, "ms").toDate();

  const [
    thisFocus,
    lastFocus,
    thisTasks,
    lastTasks,
  ] = await Promise.all([
    prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: thisWeekStart, lt: thisWeekEnd },
        deletedAt: null,
        mode: FocusSessionMode.FOCUS,
      },
      select: { durationMinutes: true, completed: true },
    }),
    prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: lastWeekStart, lt: lastWeekEnd },
        deletedAt: null,
        mode: FocusSessionMode.FOCUS,
      },
      select: { durationMinutes: true, completed: true },
    }),
    prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: thisWeekStart, lt: thisWeekEnd },
        deletedAt: null,
      },
      select: { completed: true },
    }),
    prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: lastWeekStart, lt: lastWeekEnd },
        deletedAt: null,
      },
      select: { completed: true },
    }),
  ]);

  const thisWeek: PeriodAggregate = {
    focusMinutes: thisFocus.reduce((s, x) => s + (x.durationMinutes ?? 0), 0),
    completedSessions: thisFocus.filter((x) => x.completed).length,
    totalSessions: thisFocus.length,
    taskCompleted: thisTasks.filter((x) => x.completed).length,
    taskTotal: thisTasks.length,
  };
  const lastWeek: PeriodAggregate = {
    focusMinutes: lastFocus.reduce((s, x) => s + (x.durationMinutes ?? 0), 0),
    completedSessions: lastFocus.filter((x) => x.completed).length,
    totalSessions: lastFocus.length,
    taskCompleted: lastTasks.filter((x) => x.completed).length,
    taskTotal: lastTasks.length,
  };

  return buildPeriodComparison(thisWeek, lastWeek);
}
