import type { PrismaClient } from "../generated/prisma/client";
export declare function getWorkDurationInRange(prisma: PrismaClient, userId: string, start: Date, end: Date): Promise<number>;
export declare function calculateFocusStreak(prisma: PrismaClient, userId: string, dailyGoalMinutes: number, rangeDays?: number): Promise<number>;
export declare function getTimeSummary(prisma: PrismaClient, userId: string): Promise<{
    todayMinutes: number;
    weeklyMinutes: number;
    monthlyMinutes: number;
    totalMinutes: number;
}>;
//# sourceMappingURL=statistics.service.d.ts.map