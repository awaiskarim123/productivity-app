import type { FastifyInstance } from "fastify";
import dayjs from "dayjs";
import {
  createTaskSchema,
  updateTaskSchema,
  tasksQuerySchema,
} from "../../schemas/task.schema";

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
        dueDate: result.data.dueDate ? dayjs(result.data.dueDate).toDate() : null,
        category: result.data.category ?? null,
      },
    });

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

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const task = await app.prisma.task.findFirst({
      where: {
        id,
        userId: request.user.id,
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

    const existingTask = await app.prisma.task.findFirst({
      where: { id, userId: request.user.id },
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
      updateData.dueDate = result.data.dueDate ? dayjs(result.data.dueDate).toDate() : null;
    }
    if (result.data.completed !== undefined) {
      updateData.completed = result.data.completed;
      updateData.completedAt = result.data.completed ? new Date() : null;
    }

    const task = await app.prisma.task.update({
      where: { id },
      data: updateData,
    });

    return { task };
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const task = await app.prisma.task.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!task) {
      return reply.code(404).send({ message: "Task not found" });
    }

    await app.prisma.task.delete({ where: { id } });
    return reply.code(204).send();
  });

  app.get("/stats/summary", async (request) => {
    const userId = request.user.id;
    const now = dayjs();

    const [total, completed, overdue, today, thisWeek] = await Promise.all([
      app.prisma.task.count({ where: { userId, completed: false } }),
      app.prisma.task.count({ where: { userId, completed: true } }),
      app.prisma.task.count({
        where: {
          userId,
          completed: false,
          dueDate: { lt: now.toDate() },
        },
      }),
      app.prisma.task.count({
        where: {
          userId,
          completed: false,
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

