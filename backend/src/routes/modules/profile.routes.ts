import type { FastifyInstance } from "fastify";
import { updateProfileSchema, changePasswordSchema, importPayloadSchema } from "../../schemas/profile.schema";
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
    const format = (request.query as { format?: string })?.format ?? "json";
    const entity = (request.query as { entity?: string })?.entity;

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

  app.post("/import", async (request, reply) => {
    const result = importPayloadSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid backup payload", errors: result.error.flatten() });
    }

    const payload = result.data as unknown as ExportPayload;
    const { imported } = await importUserData(app.prisma, request.user.id, payload);
    return reply.send({ message: "Import completed", imported });
  });
}

