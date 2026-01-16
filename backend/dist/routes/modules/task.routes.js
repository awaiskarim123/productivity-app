"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = taskRoutes;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const task_schema_1 = require("../../schemas/task.schema");
dayjs_1.default.extend(utc_1.default);
async function taskRoutes(app) {
    app.addHook("preHandler", app.authenticate);
    app.post("/", async (request, reply) => {
        const result = task_schema_1.createTaskSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const task = await app.prisma.task.create({
            data: {
                userId: request.user.id,
                title: result.data.title,
                description: result.data.description ?? null,
                priority: result.data.priority ?? "MEDIUM",
                dueDate: result.data.dueDate ? dayjs_1.default.utc(result.data.dueDate).startOf("day").toDate() : null,
                category: result.data.category ?? null,
            },
        });
        return reply.code(201).send({ task });
    });
    app.get("/", async (request, reply) => {
        const result = task_schema_1.tasksQuerySchema.safeParse(request.query ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
        }
        const { completed, priority, category, limit, offset } = result.data;
        const where = {
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
    app.get("/:id", async (request, reply) => {
        const { id } = request.params;
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
        const { id } = request.params;
        const result = task_schema_1.updateTaskSchema.safeParse(request.body ?? {});
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
        const updateData = {};
        if (result.data.title !== undefined)
            updateData.title = result.data.title;
        if (result.data.description !== undefined)
            updateData.description = result.data.description;
        if (result.data.priority !== undefined)
            updateData.priority = result.data.priority;
        if (result.data.category !== undefined)
            updateData.category = result.data.category;
        if (result.data.dueDate !== undefined) {
            updateData.dueDate = result.data.dueDate ? dayjs_1.default.utc(result.data.dueDate).startOf("day").toDate() : null;
        }
        if (result.data.completed !== undefined) {
            updateData.completed = result.data.completed;
            // Only set completedAt when transitioning from false to true (preserve original if already completed)
            if (result.data.completed && !existingTask.completed) {
                updateData.completedAt = new Date();
            }
            else if (!result.data.completed) {
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
            return { task };
        }
        catch (error) {
            // Handle Prisma not-found errors
            if (error.code === "P2025") {
                return reply.code(404).send({ message: "Task not found" });
            }
            throw error;
        }
    });
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        // Soft delete: set deletedAt timestamp instead of actually deleting
        const updateResult = await app.prisma.task.updateMany({
            where: { id, userId: request.user.id, deletedAt: null },
            data: { deletedAt: new Date() },
        });
        if (updateResult.count === 0) {
            return reply.code(404).send({ message: "Task not found" });
        }
        return reply.code(204).send();
    });
    app.get("/stats/summary", async (request) => {
        const userId = request.user.id;
        const now = dayjs_1.default.utc();
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
//# sourceMappingURL=task.routes.js.map