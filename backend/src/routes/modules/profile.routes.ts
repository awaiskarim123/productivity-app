import type { FastifyInstance } from "fastify";
import { updateProfileSchema, changePasswordSchema, importPayloadSchema, exportQuerySchema } from "../../schemas/profile.schema";
import type { Prisma } from "../../generated/prisma/client";
import { calculateFocusStreak, getTimeSummary } from "../../services/statistics.service";
import { verifyPassword, hashPassword } from "../../utils/password";
import {
  exportUserData,
  importUserData,
  exportTasksToCsv,
  exportNotesToCsv,
  type ExportPayload,
} from "../../services/export-import.service";

const IMPORT_BODY_LIMIT_BYTES = 5 * 1024 * 1024; // 5 MB
const IMPORT_MAX_TASKS = 10_000;
const IMPORT_MAX_HABITS = 5_000;
const IMPORT_MAX_HABIT_LOGS = 100_000;
const IMPORT_MAX_NOTES = 10_000;
const IMPORT_MAX_WORK_SESSIONS = 50_000;
const IMPORT_MAX_FOCUS_SESSIONS = 50_000;
const IMPORT_MAX_GOALS = 2_000;

export default async function profileRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async (request, reply) => {
    const userId = request.user.id;
    const user = await app.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    const [summary, streak] = await Promise.all([
      getTimeSummary(app.prisma, userId),
      calculateFocusStreak(app.prisma, userId, user.dailyGoalMinutes),
    ]);

    if (streak !== user.focusStreak) {
      await app.prisma.user.update({
        where: { id: userId },
        data: { focusStreak: streak },
      });
    }

    return {
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        dailyGoalMinutes: user.dailyGoalMinutes,
        focusStreak: streak,
        createdAt: user.createdAt,
      },
      summary,
    };
  });

  app.patch("/", async (request, reply) => {
    const result = updateProfileSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const userId = request.user.id;
    const updateData: Prisma.UserUpdateInput = {};
    if (result.data.name !== undefined) {
      updateData.name = result.data.name;
    }
    if (result.data.dailyGoalMinutes !== undefined) {
      updateData.dailyGoalMinutes = result.data.dailyGoalMinutes;
    }

    const updated = await app.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      profile: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        dailyGoalMinutes: updated.dailyGoalMinutes,
        focusStreak: updated.focusStreak,
        createdAt: updated.createdAt,
      },
    };
  });

  app.patch("/password", async (request, reply) => {
    const result = changePasswordSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const userId = request.user.id;
    const user = await app.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    const { currentPassword, newPassword } = result.data;

    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return reply.code(401).send({ message: "Current password is incorrect" });
    }

    // Reject if new password is the same as current password
    if (currentPassword === newPassword) {
      return reply.code(400).send({ message: "New password must be different from current password" });
    }

    const newPasswordHash = await hashPassword(newPassword);
    await app.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return reply.send({ message: "Password updated successfully" });
  });

  app.get("/export", async (request, reply) => {
    const parsed = exportQuerySchema.safeParse(request.query ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid export parameters", errors: parsed.error.flatten() });
    }
    const { format, entity } = parsed.data;

    const payload = await exportUserData(app.prisma, request.user.id);

    if (format === "csv") {
      if (entity === "tasks") {
        reply.header("Content-Type", "text/csv; charset=utf-8");
        reply.header("Content-Disposition", "attachment; filename=tasks.csv");
        return reply.send(exportTasksToCsv(payload.tasks));
      }
      if (entity === "notes") {
        reply.header("Content-Type", "text/csv; charset=utf-8");
        reply.header("Content-Disposition", "attachment; filename=notes.csv");
        return reply.send(exportNotesToCsv(payload.notes));
      }
      return reply.code(400).send({ message: "CSV export requires entity=tasks or entity=notes" });
    }

    reply.header("Content-Type", "application/json");
    reply.header("Content-Disposition", "attachment; filename=productivity-backup.json");
    return reply.send(payload);
  });

  app.post("/import", { bodyLimit: IMPORT_BODY_LIMIT_BYTES }, async (request, reply) => {
    const result = importPayloadSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid backup payload", errors: result.error.flatten() });
    }

    const payload = result.data as unknown as ExportPayload;

    if (payload.tasks.length > IMPORT_MAX_TASKS) {
      return reply.code(400).send({
        message: `Import rejected: tasks count (${payload.tasks.length}) exceeds maximum (${IMPORT_MAX_TASKS})`,
      });
    }
    if (payload.habits.length > IMPORT_MAX_HABITS) {
      return reply.code(400).send({
        message: `Import rejected: habits count (${payload.habits.length}) exceeds maximum (${IMPORT_MAX_HABITS})`,
      });
    }
    if (payload.habitLogs.length > IMPORT_MAX_HABIT_LOGS) {
      return reply.code(400).send({
        message: `Import rejected: habitLogs count (${payload.habitLogs.length}) exceeds maximum (${IMPORT_MAX_HABIT_LOGS})`,
      });
    }
    if (payload.notes.length > IMPORT_MAX_NOTES) {
      return reply.code(400).send({
        message: `Import rejected: notes count (${payload.notes.length}) exceeds maximum (${IMPORT_MAX_NOTES})`,
      });
    }
    if (payload.workSessions.length > IMPORT_MAX_WORK_SESSIONS) {
      return reply.code(400).send({
        message: `Import rejected: workSessions count (${payload.workSessions.length}) exceeds maximum (${IMPORT_MAX_WORK_SESSIONS})`,
      });
    }
    if (payload.focusSessions.length > IMPORT_MAX_FOCUS_SESSIONS) {
      return reply.code(400).send({
        message: `Import rejected: focusSessions count (${payload.focusSessions.length}) exceeds maximum (${IMPORT_MAX_FOCUS_SESSIONS})`,
      });
    }
    if (payload.goals.length > IMPORT_MAX_GOALS) {
      return reply.code(400).send({
        message: `Import rejected: goals count (${payload.goals.length}) exceeds maximum (${IMPORT_MAX_GOALS})`,
      });
    }

    const { imported } = await importUserData(app.prisma, request.user.id, payload);
    return reply.send({ message: "Import completed", imported });
  });
}

