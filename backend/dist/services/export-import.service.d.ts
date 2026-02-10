import type { PrismaClient } from "../generated/prisma/client";
export interface ExportPayload {
    version: number;
    exportedAt: string;
    profile: {
        name: string | null;
        dailyGoalMinutes: number;
    };
    tasks: Array<{
        title: string;
        description: string | null;
        completed: boolean;
        priority: string;
        dueDate: string | null;
        category: string | null;
    }>;
    habits: Array<{
        name: string;
        description: string | null;
        color: string;
        targetDays: number;
    }>;
    habitLogs: Array<{
        habitIndex: number;
        date: string;
    }>;
    notes: Array<{
        title: string;
        content: string;
        tags: string[];
        isPinned: boolean;
    }>;
    workSessions: Array<{
        startedAt: string;
        endedAt: string | null;
        durationMinutes: number | null;
        notes: string | null;
    }>;
    focusSessions: Array<{
        mode: string;
        startedAt: string;
        endedAt: string | null;
        targetMinutes: number;
        durationMinutes: number | null;
        completed: boolean;
        distractions: number;
        notes: string | null;
    }>;
    goals: Array<{
        title: string;
        description: string | null;
        type: string;
        startDate: string;
        endDate: string;
        targetValue: number;
        keyResults: Array<{
            title: string;
            targetValue: number;
            weight?: number;
        }>;
    }>;
}
export declare function exportUserData(prisma: PrismaClient, userId: string): Promise<ExportPayload>;
export interface ImportResult {
    imported: {
        tasks: number;
        habits: number;
        habitLogs: number;
        notes: number;
        workSessions: number;
        focusSessions: number;
        goals: number;
    };
}
export declare function importUserData(prisma: PrismaClient, userId: string, payload: ExportPayload): Promise<ImportResult>;
export declare function exportTasksToCsv(tasks: ExportPayload["tasks"]): string;
export declare function exportNotesToCsv(notes: ExportPayload["notes"]): string;
//# sourceMappingURL=export-import.service.d.ts.map