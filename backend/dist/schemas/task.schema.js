"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksQuerySchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(1000).optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    category: zod_1.z.string().max(50).optional(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    completed: zod_1.z.boolean().optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: zod_1.z.string().datetime().optional().nullable(),
    category: zod_1.z.string().max(50).optional().nullable(),
});
exports.tasksQuerySchema = zod_1.z.object({
    completed: zod_1.z.string().transform((val) => val === "true").optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    category: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(50),
    offset: zod_1.z.coerce.number().int().nonnegative().default(0),
});
//# sourceMappingURL=task.schema.js.map