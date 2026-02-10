import type { PrismaClient } from "../generated/prisma/client";

const EXPORT_VERSION = 1;

export interface ExportPayload {
  version: number;
  exportedAt: string;
  profile: { name: string | null; dailyGoalMinutes: number };
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
  habitLogs: Array<{ habitIndex: number; date: string }>;
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
    keyResults: Array<{ title: string; targetValue: number; weight?: number }>;
  }>;
}

export async function exportUserData(prisma: PrismaClient, userId: string): Promise<ExportPayload> {
  const [user, tasks, habits, notes, workSessions, focusSessions, goals] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, dailyGoalMinutes: true } }),
    prisma.task.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: {
        title: true,
        description: true,
        completed: true,
        priority: true,
        dueDate: true,
        category: true,
      },
    }),
    prisma.habit.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: { logs: { orderBy: { date: "asc" }, select: { date: true } } },
    }),
    prisma.note.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { title: true, content: true, tags: true, isPinned: true },
    }),
    prisma.workSession.findMany({
      where: { userId, deletedAt: null },
      orderBy: { startedAt: "asc" },
      select: { startedAt: true, endedAt: true, durationMinutes: true, notes: true },
    }),
    prisma.focusSession.findMany({
      where: { userId, deletedAt: null },
      orderBy: { startedAt: "asc" },
      select: {
        mode: true,
        startedAt: true,
        endedAt: true,
        targetMinutes: true,
        durationMinutes: true,
        completed: true,
        distractions: true,
        notes: true,
      },
    }),
    prisma.goal.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        keyResults: { select: { title: true, targetValue: true, weight: true } },
      },
    }),
  ]);

  const habitLogs: ExportPayload["habitLogs"] = [];
  habits.forEach((h, i) => {
    h.logs.forEach((log) => {
      habitLogs.push({ habitIndex: i, date: log.date.toISOString() });
    });
  });

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    profile: { name: user.name, dailyGoalMinutes: user.dailyGoalMinutes },
    tasks: tasks.map((t) => ({
      title: t.title,
      description: t.description,
      completed: t.completed,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString() ?? null,
      category: t.category,
    })),
    habits: habits.map((h) => ({
      name: h.name,
      description: h.description,
      color: h.color,
      targetDays: h.targetDays,
    })),
    habitLogs,
    notes: notes.map((n) => ({
      title: n.title,
      content: n.content,
      tags: n.tags,
      isPinned: n.isPinned,
    })),
    workSessions: workSessions.map((s) => ({
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt?.toISOString() ?? null,
      durationMinutes: s.durationMinutes,
      notes: s.notes,
    })),
    focusSessions: focusSessions.map((s) => ({
      mode: s.mode,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt?.toISOString() ?? null,
      targetMinutes: s.targetMinutes,
      durationMinutes: s.durationMinutes,
      completed: s.completed,
      distractions: s.distractions,
      notes: s.notes,
    })),
    goals: goals.map((g) => ({
      title: g.title,
      description: g.description,
      type: g.type,
      startDate: g.startDate.toISOString(),
      endDate: g.endDate.toISOString(),
      targetValue: g.targetValue,
      keyResults: g.keyResults.map((kr) => ({
        title: kr.title,
        targetValue: kr.targetValue,
        weight: kr.weight,
      })),
    })),
  };
}

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

export async function importUserData(prisma: PrismaClient, userId: string, payload: ExportPayload): Promise<ImportResult> {
  const imported = {
    tasks: 0,
    habits: 0,
    habitLogs: 0,
    notes: 0,
    workSessions: 0,
    focusSessions: 0,
    goals: 0,
  };

  await prisma.$transaction(async (tx) => {
    for (const t of payload.tasks) {
      await tx.task.create({
        data: {
          userId,
          title: t.title,
          description: t.description ?? null,
          completed: t.completed,
          priority: t.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
          dueDate: t.dueDate ? new Date(t.dueDate) : null,
          category: t.category ?? null,
        },
      });
      imported.tasks++;
    }

    const createdHabitIds: string[] = [];
    for (const h of payload.habits) {
      const created = await tx.habit.create({
        data: {
          userId,
          name: h.name,
          description: h.description ?? null,
          color: h.color,
          targetDays: h.targetDays,
        },
      });
      createdHabitIds.push(created.id);
      imported.habits++;
    }

    for (const log of payload.habitLogs) {
      if (log.habitIndex >= createdHabitIds.length) continue;
      const habitId = createdHabitIds[log.habitIndex];
      if (!habitId) continue;
      const date = new Date(log.date);
      try {
        await tx.habitLog.create({
          data: { habitId, date },
        });
        imported.habitLogs++;
      } catch (err: unknown) {
        const isP2002 =
          err &&
          typeof err === "object" &&
          "code" in err &&
          (err as { code: string }).code === "P2002";
        if (isP2002) {
          // Unique constraint (habitId + date) – skip duplicate
        } else {
          throw err;
        }
      }
    }

    for (const n of payload.notes) {
      await tx.note.create({
        data: {
          userId,
          title: n.title,
          content: n.content,
          tags: n.tags,
          isPinned: n.isPinned,
        },
      });
      imported.notes++;
    }

    for (const s of payload.workSessions) {
      await tx.workSession.create({
        data: {
          userId,
          startedAt: new Date(s.startedAt),
          endedAt: s.endedAt ? new Date(s.endedAt) : null,
          durationMinutes: s.durationMinutes ?? null,
          notes: s.notes ?? null,
        },
      });
      imported.workSessions++;
    }

    for (const s of payload.focusSessions) {
      await tx.focusSession.create({
        data: {
          userId,
          mode: s.mode as "FOCUS" | "BREAK",
          startedAt: new Date(s.startedAt),
          endedAt: s.endedAt ? new Date(s.endedAt) : null,
          targetMinutes: s.targetMinutes,
          durationMinutes: s.durationMinutes ?? null,
          completed: s.completed,
          distractions: s.distractions,
          notes: s.notes ?? null,
        },
      });
      imported.focusSessions++;
    }

    for (const g of payload.goals) {
      const goal = await tx.goal.create({
        data: {
          userId,
          title: g.title,
          description: g.description ?? null,
          type: g.type as "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY",
          startDate: new Date(g.startDate),
          endDate: new Date(g.endDate),
          targetValue: g.targetValue ?? 100,
        },
      });
      const keyResults = g.keyResults ?? [];
      for (const kr of keyResults) {
        await tx.keyResult.create({
          data: {
            goalId: goal.id,
            title: kr.title,
            targetValue: kr.targetValue,
            weight: kr.weight ?? 1,
          },
        });
      }
      imported.goals++;
    }
  });

  return { imported };
}

function escapeCsv(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportTasksToCsv(tasks: ExportPayload["tasks"]): string {
  const header = "title,description,completed,priority,dueDate,category";
  const rows = tasks.map(
    (t) =>
      [t.title, t.description ?? "", t.completed, t.priority, t.dueDate ?? "", t.category ?? ""]
        .map(escapeCsv)
        .join(",")
  );
  return [header, ...rows].join("\n");
}

export function exportNotesToCsv(notes: ExportPayload["notes"]): string {
  const header = "title,content,tags,isPinned";
  const rows = notes.map((n) =>
    [n.title, n.content, n.tags.join(";"), n.isPinned].map(escapeCsv).join(",")
  );
  return [header, ...rows].join("\n");
}
