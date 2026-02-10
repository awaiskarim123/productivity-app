import type { FastifyInstance } from "fastify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  createTaskSchema,
  updateTaskSchema,
  tasksQuerySchema,
} from "../../schemas/task.schema";
import { logAudit } from "../../services/audit.service";

dayjs.extend(utc);

export default async function taskRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.post("/", async (request, reply) => {
    const result = createTaskSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    const task = await app.prisma.task.create({
      data: {
        userId: request.user.id,
        title: result.data.title,
        description: result.data.description ?? null,
        priority: result.data.priority ?? "MEDIUM",
        dueDate: result.data.dueDate ? dayjs.utc(result.data.dueDate).startOf("day").toDate() : null,
        category: result.data.category ?? null,
      },
    });

    await logAudit(app.prisma, request.user.id, "task", task.id, "create", { title: task.title }, request);
    return reply.code(201).send({ task });
  });

  app.get("/", async (request, reply) => {
    const result = tasksQuerySchema.safeParse(request.query ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
    }

    const { completed, priority, category, limit, offset } = result.data;
    const where: any = {
      userId: request.user.id,
      deletedAt: null, // Only show non-deleted tasks
    };

    if (completed !== undefined) {
      where.completed = completed;
    }
    if (priority) {
      where.priority = priority;
    }
    if (category) {
      where.category = category;
    }

    const [tasks, total] = await Promise.all([
      app.prisma.task.findMany({
        where,
        orderBy: [
          { dueDate: "asc" },
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      app.prisma.task.count({ where }),
    ]);

    return { tasks, total, limit, offset };
  });

  app.get("/categories", async (request) => {
    const tasks = await app.prisma.task.findMany({
      where: { userId: request.user.id, deletedAt: null },
      select: { category: true },
      distinct: ["category"],
    });
    const categories = tasks
      .map((t) => t.category)
      .filter((c): c is string => c != null && c.trim() !== "")
      .sort();
    return { categories };
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const task = await app.prisma.task.findFirst({
      where: {
        id,
        userId: request.user.id,
        deletedAt: null, // Only return non-deleted tasks
      },
    });

    if (!task) {
      return reply.code(404).send({ message: "Task not found" });
    }

    return { task };
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = updateTaskSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
    }

    // Read existing task to check ownership and get current completed state
    const existingTask = await app.prisma.task.findFirst({
      where: { id, userId: request.user.id, deletedAt: null },
    });

    if (!existingTask) {
      return reply.code(404).send({ message: "Task not found" });
    }

    const updateData: any = {};
    if (result.data.title !== undefined) updateData.title = result.data.title;
    if (result.data.description !== undefined) updateData.description = result.data.description;
    if (result.data.priority !== undefined) updateData.priority = result.data.priority;
    if (result.data.category !== undefined) updateData.category = result.data.category;
    if (result.data.dueDate !== undefined) {
      updateData.dueDate = result.data.dueDate ? dayjs.utc(result.data.dueDate).startOf("day").toDate() : null;
    }
    if (result.data.completed !== undefined) {
      updateData.completed = result.data.completed;
      // Only set completedAt when transitioning from false to true (preserve original if already completed)
      if (result.data.completed && !existingTask.completed) {
        updateData.completedAt = new Date();
      } else if (!result.data.completed) {
        updateData.completedAt = null;
      }
      // If already completed and staying completed, don't update completedAt (preserve original)
    }

    try {
      // Use updateMany with userId and deletedAt to ensure authorization and avoid race conditions
      const updateResult = await app.prisma.task.updateMany({
        where: { id, userId: request.user.id, deletedAt: null },
        data: updateData,
      });

      if (updateResult.count === 0) {
        return reply.code(404).send({ message: "Task not found" });
      }

      // Fetch the updated task to return
      const task = await app.prisma.task.findFirst({
        where: { id, deletedAt: null },
      });

      if (!task) {
        return reply.code(404).send({ message: "Task not found" });
      }

      const updatedFields = Object.keys(updateData).filter((k) => k !== "completedAt");
      await logAudit(app.prisma, request.user.id, "task", id, "update", { updatedFields }, request);
      return { task };
    } catch (error: any) {
      // Handle Prisma not-found errors
      if (error.code === "P2025") {
        return reply.code(404).send({ message: "Task not found" });
      }
      throw error;
    }
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // Soft delete: set deletedAt timestamp instead of actually deleting
    const updateResult = await app.prisma.task.updateMany({
      where: { id, userId: request.user.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (updateResult.count === 0) {
      return reply.code(404).send({ message: "Task not found" });
    }

    await logAudit(app.prisma, request.user.id, "task", id, "delete", {}, request);
    return reply.code(204).send();
  });

  app.get("/stats/summary", async (request) => {
    const userId = request.user.id;
    const now = dayjs.utc();
    // Note: Currently using UTC. If per-user timezones are added later,
    // adjust startOf("day") boundaries to user's timezone for accurate "today" and "overdue" calculations.

    const [total, completed, overdue, today, thisWeek] = await Promise.all([
      app.prisma.task.count({ where: { userId, completed: false, deletedAt: null } }),
      app.prisma.task.count({ where: { userId, completed: true, deletedAt: null } }),
      app.prisma.task.count({
        where: {
          userId,
          completed: false,
          deletedAt: null,
          // Overdue means before today (not including today) - ensures no overlap with "today" bucket
          dueDate: { lt: now.startOf("day").toDate() },
        },
      }),
      app.prisma.task.count({
        where: {
          userId,
          completed: false,
          deletedAt: null,
          dueDate: {
            gte: now.startOf("day").toDate(),
            lte: now.endOf("day").toDate(),
          },
        },
      }),
      app.prisma.task.count({
        where: {
          userId,
          completed: false,
          deletedAt: null,
          dueDate: {
            gte: now.startOf("week").toDate(),
            lte: now.endOf("week").toDate(),
          },
        },
      }),
    ]);

    return {
      total,
      completed,
      overdue,
      today,
      thisWeek,
    };
  });
}

