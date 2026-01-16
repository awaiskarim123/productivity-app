import type { PrismaClient } from "../generated/prisma/client";
export type GoalHealthStatus = "ON_TRACK" | "AT_RISK" | "OFF_TRACK";
interface CalculateProgressResult {
    currentValue: number;
    progressPercent: number;
    healthStatus: GoalHealthStatus;
}
/**
 * Calculate goal progress from linked activities
 */
export declare function calculateGoalProgress(prisma: PrismaClient, goalId: string): Promise<CalculateProgressResult>;
/**
 * Update goal progress and health status
 */
export declare function updateGoalProgress(prisma: PrismaClient, goalId: string): Promise<void>;
/**
 * Get contribution breakdown for a goal
 */
export declare function getGoalContributions(prisma: PrismaClient, goalId: string): Promise<{
    tasks: {
        total: number;
        completed: number;
        contribution: number;
        items: {
            id: string;
            title: string;
            completed: boolean;
            completedAt: Date | null;
            priority: import("../generated/prisma/enums").TaskPriority;
        }[];
    };
    habits: {
        total: number;
        logs: number;
        contribution: number;
        items: {
            id: string;
            name: string;
            logCount: number;
        }[];
    };
    focusSessions: {
        total: number;
        totalMinutes: number;
        contribution: number;
        items: {
            id: string;
            startedAt: Date;
            durationMinutes: number | null;
            completed: boolean;
        }[];
    };
    keyResults: {
        id: string;
        title: string;
        currentValue: number;
        targetValue: number;
        progressPercent: number;
    }[];
}>;
/**
 * Get timeline data for a goal
 */
export declare function getGoalTimeline(prisma: PrismaClient, goalId: string): Promise<{
    goal: {
        id: string;
        title: string;
        startDate: Date;
        endDate: Date;
        currentProgress: number;
    };
    timeline: {
        date: string;
        progress: number;
        tasksCompleted: number;
        habitLogs: number;
        focusMinutes: number;
    }[];
}>;
export {};
//# sourceMappingURL=goal.service.d.ts.map