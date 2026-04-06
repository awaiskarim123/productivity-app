import type { PrismaClient } from "../generated/prisma/client";
export interface DailySummary {
    tasksCompletedToday: number;
    focusMinutesToday: number;
    habitsLoggedToday: number;
    dailyGoalMinutes: number;
    focusStreak: number;
    goalProgressPercent: number;
}
/** Pure: focus progress toward daily goal as 0–100. */
export declare function goalProgressPercent(focusMinutes: number, dailyGoalMinutes: number): number;
export declare function getDailySummary(prisma: PrismaClient, userId: string): Promise<DailySummary>;
//# sourceMappingURL=daily-summary.service.d.ts.map