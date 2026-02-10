import type { PrismaClient } from "../generated/prisma/client";
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
export declare function buildFocusHeatmap(sessions: FocusSessionForHeatmap[], _daysBack: number): FocusHeatmap;
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
export declare function detectBurnout(sessions: FocusSessionForBurnout[], options?: BurnoutOptions): BurnoutSignal;
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
export declare function computeProductivityScore(params: ProductivityScoreParams): ProductivityScoreResult;
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
export declare function buildPeriodComparison(thisWeek: PeriodAggregate, lastWeek: PeriodAggregate): PeriodComparison;
export declare function getFocusHeatmapData(prisma: PrismaClient, userId: string, daysBack?: number): Promise<FocusHeatmap>;
export declare function getBurnoutSignalData(prisma: PrismaClient, userId: string, windowDays?: number): Promise<BurnoutSignal>;
export declare function getProductivityScoreData(prisma: PrismaClient, userId: string, periodDays?: number): Promise<ProductivityScoreResult>;
export declare function getPeriodComparisonData(prisma: PrismaClient, userId: string): Promise<PeriodComparison>;
//# sourceMappingURL=advanced-analytics.service.d.ts.map