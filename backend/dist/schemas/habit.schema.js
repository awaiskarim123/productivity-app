"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.habitLogsQuerySchema = exports.habitsQuerySchema = exports.logHabitSchema = exports.updateHabitSchema = exports.createHabitSchema = void 0;
const zod_1 = require("zod");
exports.createHabitSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: zod_1.z.string().max(50).optional(),
    targetDays: zod_1.z.number().int().positive().max(365).optional(),
});
exports.updateHabitSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(500).optional().nullable(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: zod_1.z.string().max(50).optional().nullable(),
    targetDays: zod_1.z.number().int().positive().max(365).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.logHabitSchema = zod_1.z.object({
    date: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.habitsQuerySchema = zod_1.z.object({
    isActive: zod_1.z.string().transform((val) => val === "true").optional(),
});
exports.habitLogsQuerySchema = zod_1.z.object({
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .transform((value) => value ?? 50),
    offset: zod_1.z.coerce.number().int().min(0).optional().transform((value) => value ?? 0),
});
//# sourceMappingURL=habit.schema.js.map