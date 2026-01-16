import type { PrismaClient } from "../generated/prisma/client";
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
export declare function generateWeeklyInsights(prisma: PrismaClient, userId: string, weekStart: Date, weekEnd: Date): Promise<WeeklyInsightData>;
export declare function getOrGenerateWeeklyInsights(prisma: PrismaClient, userId: string, weekStart?: Date): Promise<WeeklyInsightData>;
//# sourceMappingURL=insights.service.d.ts.map