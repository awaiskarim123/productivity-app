"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = goalRoutes;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const goal_schema_1 = require("../../schemas/goal.schema");
const goal_service_1 = require("../../services/goal.service");
dayjs_1.default.extend(utc_1.default);
async function goalRoutes(app) {
    app.addHook("preHandler", app.authenticate);
    // ========== Goal CRUD ==========
    app.post("/", async (request, reply) => {
        const result = goal_schema_1.createGoalSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const { keyResults, startDate, endDate, ...goalData } = result.data;
        const goal = await app.prisma.goal.create({
            data: {
                userId: request.user.id,
                ...goalData,
                description: goalData.description ?? null,
                startDate: startDate instanceof Date ? startDate : (typeof startDate === 'string' && startDate.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(startDate + 'T00:00:00Z') : new Date(startDate)),
                endDate: endDate instanceof Date ? endDate : (typeof endDate === 'string' && endDate.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(endDate + 'T23:59:59Z') : new Date(endDate)),
                keyResults: {
                    create: (keyResults || []).map(kr => ({
                        ...kr,
                        description: kr.description ?? null,
                    })),
                },
            },
            include: {
                keyResults: true,
            },
        });
        // Calculate initial progress
        await (0, goal_service_1.updateGoalProgress)(app.prisma, goal.id);
        // Re-fetch the goal to get updated progress values
        const updatedGoal = await app.prisma.goal.findUnique({
            where: { id: goal.id },
            include: {
                keyResults: true,
            },
        });
        return reply.code(201).send({ goal: updatedGoal });
    });
    app.get("/", async (request, reply) => {
        const result = goal_schema_1.goalsQuerySchema.safeParse(request.query ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid query", errors: result.error.flatten() });
        }
        const { type, isActive, limit, offset } = result.data;
        const where = {
            userId: request.user.id,
            deletedAt: null,
        };
        if (type) {
            where.type = type;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [goals, total] = await Promise.all([
            app.prisma.goal.findMany({
                where,
                include: {
                    keyResults: true,
                    _count: {
                        select: {
                            tasks: true,
                            habits: true,
                            focusSessions: true,
                        },
                    },
                },
                orderBy: [
                    { isActive: "desc" },
                    { createdAt: "desc" },
                ],
                take: limit,
                skip: offset,
            }),
            app.prisma.goal.count({ where }),
        ]);
        return { goals, total, limit, offset };
    });
    app.get("/:id", async (request, reply) => {
        const { id } = request.params;
        const goal = await app.prisma.goal.findFirst({
            where: {
                id,
                userId: request.user.id,
                deletedAt: null,
            },
            include: {
                keyResults: {
                    orderBy: { createdAt: "asc" },
                },
                _count: {
                    select: {
                        tasks: true,
                        habits: true,
                        focusSessions: true,
                    },
                },
            },
        });
        if (!goal) {
            return reply.code(404).send({ message: "Goal not found" });
        }
        return { goal };
    });
    app.patch("/:id", async (request, reply) => {
        const { id } = request.params;
        const result = goal_schema_1.updateGoalSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const existingGoal = await app.prisma.goal.findFirst({
            where: {
                id,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!existingGoal) {
            return reply.code(404).send({ message: "Goal not found" });
        }
        const updateData = {};
        if (result.data.title !== undefined) {
            updateData.title = result.data.title;
        }
        if (result.data.description !== undefined) {
            updateData.description = result.data.description ?? null;
        }
        if (result.data.startDate !== undefined) {
            const startDate = result.data.startDate;
            updateData.startDate =
                startDate instanceof Date
                    ? startDate
                    : (typeof startDate === 'string' && startDate.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(startDate + 'T00:00:00Z') : new Date(startDate));
        }
        if (result.data.endDate !== undefined) {
            const endDate = result.data.endDate;
            updateData.endDate =
                endDate instanceof Date
                    ? endDate
                    : (typeof endDate === 'string' && endDate.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(endDate + 'T23:59:59Z') : new Date(endDate));
        }
        if (result.data.targetValue !== undefined) {
            updateData.targetValue = result.data.targetValue;
        }
        if (result.data.isActive !== undefined) {
            updateData.isActive = result.data.isActive;
        }
        await app.prisma.goal.update({
            where: { id },
            data: updateData,
        });
        // Recalculate progress after update
        await (0, goal_service_1.updateGoalProgress)(app.prisma, id);
        // Re-fetch the goal to get updated progress values
        const updatedGoal = await app.prisma.goal.findUnique({
            where: { id },
            include: {
                keyResults: true,
            },
        });
        return { goal: updatedGoal };
    });
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        const goal = await app.prisma.goal.findFirst({
            where: {
                id,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!goal) {
            return reply.code(404).send({ message: "Goal not found" });
        }
        // Soft delete
        await app.prisma.goal.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return reply.code(204).send();
    });
    // ========== Key Results CRUD ==========
    app.post("/:goalId/key-results", async (request, reply) => {
        const { goalId } = request.params;
        const result = goal_schema_1.createKeyResultSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const goal = await app.prisma.goal.findFirst({
            where: {
                id: goalId,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!goal) {
            return reply.code(404).send({ message: "Goal not found" });
        }
        const keyResult = await app.prisma.keyResult.create({
            data: {
                goalId,
                ...result.data,
                description: result.data.description ?? null,
            },
        });
        // Recalculate goal progress
        await (0, goal_service_1.updateGoalProgress)(app.prisma, goalId);
        return reply.code(201).send({ keyResult });
    });
    app.patch("/key-results/:id", async (request, reply) => {
        const { id } = request.params;
        const result = goal_schema_1.updateKeyResultSchema.safeParse(request.body ?? {});
        if (!result.success) {
            return reply.code(400).send({ message: "Invalid input", errors: result.error.flatten() });
        }
        const keyResult = await app.prisma.keyResult.findUnique({
            where: { id },
            include: { goal: true },
        });
        if (!keyResult || keyResult.goal.userId !== request.user.id || keyResult.goal.deletedAt) {
            return reply.code(404).send({ message: "Key result not found" });
        }
        // Build update data, converting undefined to null for optional fields
        const updateData = {};
        if (result.data.title !== undefined) {
            updateData.title = result.data.title;
        }
        if (result.data.description !== undefined) {
            updateData.description = result.data.description ?? null;
        }
        if (result.data.targetValue !== undefined) {
            updateData.targetValue = result.data.targetValue;
        }
        if (result.data.currentValue !== undefined) {
            updateData.currentValue = result.data.currentValue;
        }
        if (result.data.weight !== undefined) {
            updateData.weight = result.data.weight;
        }
        // Calculate progress if currentValue or targetValue changed
        if (result.data.currentValue !== undefined || result.data.targetValue !== undefined) {
            const newCurrentValue = result.data.currentValue ?? keyResult.currentValue;
            const newTargetValue = result.data.targetValue ?? keyResult.targetValue;
            updateData.progressPercent =
                newTargetValue > 0 ? (newCurrentValue / newTargetValue) * 100 : 0;
        }
        const updated = await app.prisma.keyResult.update({
            where: { id },
            data: updateData,
        });
        // Recalculate goal progress
        await (0, goal_service_1.updateGoalProgress)(app.prisma, keyResult.goalId);
        return { keyResult: updated };
    });
    app.delete("/key-results/:id", async (request, reply) => {
        const { id } = request.params;
        const keyResult = await app.prisma.keyResult.findUnique({
            where: { id },
            include: { goal: true },
        });
        if (!keyResult || keyResult.goal.userId !== request.user.id || keyResult.goal.deletedAt) {
            return reply.code(404).send({ message: "Key result not found" });
        }
        await app.prisma.keyResult.delete({
            where: { id },
        });
        // Recalculate goal progress
        await (0, goal_service_1.updateGoalProgress)(app.prisma, keyResult.goalId);
        return reply.code(204).send();
    });
    // ========== Linking Activities to Goals ==========
    app.post("/:goalId/link/task/:taskId", async (request, reply) => {
        const { goalId, taskId } = request.params;
        const goal = await app.prisma.goal.findFirst({
            where: {
                id: goalId,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!goal) {
            return reply.code(404).send({ message: "Goal not found" });
        }
        const task = await app.prisma.task.findFirst({
            where: {
                id: taskId,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!task) {
            return reply.code(404).send({ message: "Task not found" });
        }
        await app.prisma.task.update({
            where: { id: taskId },
            data: { goalId },
        });
        // Recalculate progress
        await (0, goal_service_1.updateGoalProgress)(app.prisma, goalId);
        return reply.code(200).send({ message: "Task linked to goal" });
    });
    app.post("/:goalId/link/habit/:habitId", async (request, reply) => {
        const { goalId, habitId } = request.params;
        const goal = await app.prisma.goal.findFirst({
            where: {
                id: goalId,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!goal) {
            return reply.code(404).send({ message: "Goal not found" });
        }
        const habit = await app.prisma.habit.findFirst({
            where: {
                id: habitId,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!habit) {
            return reply.code(404).send({ message: "Habit not found" });
        }
        await app.prisma.habit.update({
            where: { id: habitId },
            data: { goalId },
        });
        // Recalculate progress
        await (0, goal_service_1.updateGoalProgress)(app.prisma, goalId);
        return reply.code(200).send({ message: "Habit linked to goal" });
    });
    app.post("/:goalId/link/focus-session/:sessionId", async (request, reply) => {
        const { goalId, sessionId } = request.params;
        const goal = await app.prisma.goal.findFirst({
            where: {
                id: goalId,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!goal) {
            return reply.code(404).send({ message: "Goal not found" });
        }
        const session = await app.prisma.focusSession.findFirst({
            where: {
                id: sessionId,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!session) {
            return reply.code(404).send({ message: "Focus session not found" });
        }
        await app.prisma.focusSession.update({
            where: { id: sessionId },
            data: { goalId },
        });
        // Recalculate progress
        await (0, goal_service_1.updateGoalProgress)(app.prisma, goalId);
        return reply.code(200).send({ message: "Focus session linked to goal" });
    });
    app.delete("/:goalId/unlink/task/:taskId", async (request, reply) => {
        const { goalId, taskId } = request.params;
        const task = await app.prisma.task.findFirst({
            where: {
                id: taskId,
                userId: request.user.id,
                goalId,
                deletedAt: null,
            },
        });
        if (!task) {
            return reply.code(404).send({ message: "Task not found or not linked to this goal" });
        }
        await app.prisma.task.update({
            where: { id: taskId },
            data: { goalId: null },
        });
        // Recalculate progress
        await (0, goal_service_1.updateGoalProgress)(app.prisma, goalId);
        return reply.code(200).send({ message: "Task unlinked from goal" });
    });
    app.delete("/:goalId/unlink/habit/:habitId", async (request, reply) => {
        const { goalId, habitId } = request.params;
        const habit = await app.prisma.habit.findFirst({
            where: {
                id: habitId,
                userId: request.user.id,
                goalId,
                deletedAt: null,
            },
        });
        if (!habit) {
            return reply.code(404).send({ message: "Habit not found or not linked to this goal" });
        }
        await app.prisma.habit.update({
            where: { id: habitId },
            data: { goalId: null },
        });
        // Recalculate progress
        await (0, goal_service_1.updateGoalProgress)(app.prisma, goalId);
        return reply.code(200).send({ message: "Habit unlinked from goal" });
    });
    app.delete("/:goalId/unlink/focus-session/:sessionId", async (request, reply) => {
        const { goalId, sessionId } = request.params;
        const session = await app.prisma.focusSession.findFirst({
            where: {
                id: sessionId,
                userId: request.user.id,
                goalId,
                deletedAt: null,
            },
        });
        if (!session) {
            return reply.code(404).send({ message: "Focus session not found or not linked to this goal" });
        }
        await app.prisma.focusSession.update({
            where: { id: sessionId },
            data: { goalId: null },
        });
        // Recalculate progress
        await (0, goal_service_1.updateGoalProgress)(app.prisma, goalId);
        return reply.code(200).send({ message: "Focus session unlinked from goal" });
    });
    // ========== Analysis Endpoints ==========
    app.get("/:id/contributions", async (request, reply) => {
        const { id } = request.params;
        const goal = await app.prisma.goal.findFirst({
            where: {
                id,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!goal) {
            return reply.code(404).send({ message: "Goal not found" });
        }
        const contributions = await (0, goal_service_1.getGoalContributions)(app.prisma, id);
        return { contributions };
    });
    app.get("/:id/timeline", async (request, reply) => {
        const { id } = request.params;
        const goal = await app.prisma.goal.findFirst({
            where: {
                id,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!goal) {
            return reply.code(404).send({ message: "Goal not found" });
        }
        const timeline = await (0, goal_service_1.getGoalTimeline)(app.prisma, id);
        return { timeline };
    });
    // ========== Recalculate Progress ==========
    app.post("/:id/recalculate", async (request, reply) => {
        const { id } = request.params;
        const goal = await app.prisma.goal.findFirst({
            where: {
                id,
                userId: request.user.id,
                deletedAt: null,
            },
        });
        if (!goal) {
            return reply.code(404).send({ message: "Goal not found" });
        }
        await (0, goal_service_1.updateGoalProgress)(app.prisma, id);
        const updated = await app.prisma.goal.findUnique({
            where: { id },
            include: {
                keyResults: true,
            },
        });
        return { goal: updated };
    });
}
//# sourceMappingURL=goal.routes.js.map