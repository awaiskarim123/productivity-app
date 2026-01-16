"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkToGoalSchema = exports.goalsQuerySchema = exports.updateKeyResultSchema = exports.createKeyResultSchema = exports.updateGoalSchema = exports.createGoalSchema = exports.goalHealthStatusSchema = exports.goalTypeSchema = void 0;
const zod_1 = require("zod");
exports.goalTypeSchema = zod_1.z.enum(["QUARTERLY", "MONTHLY"]);
exports.goalHealthStatusSchema = zod_1.z.enum(["ON_TRACK", "AT_RISK", "OFF_TRACK"]);
exports.createGoalSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    description: zod_1.z.string().max(1000, "Description must be less than 1000 characters").optional(),
    type: exports.goalTypeSchema,
    startDate: zod_1.z.string().datetime().or(zod_1.z.date()),
    endDate: zod_1.z.string().datetime().or(zod_1.z.date()),
    targetValue: zod_1.z.number().positive("Target value must be positive").default(100),
    keyResults: zod_1.z
        .array(zod_1.z.object({
        title: zod_1.z.string().min(1, "Key result title is required").max(200),
        description: zod_1.z.string().max(500).optional(),
        targetValue: zod_1.z.number().positive("Target value must be positive"),
        weight: zod_1.z.number().min(0).max(1).default(1.0),
    }))
        .optional()
        .default([]),
}).refine((data) => {
    const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate);
    const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate);
    return endDate > startDate;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});
exports.updateGoalSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    startDate: zod_1.z.string().datetime().or(zod_1.z.date()).optional(),
    endDate: zod_1.z.string().datetime().or(zod_1.z.date()).optional(),
    targetValue: zod_1.z.number().positive().optional(),
    isActive: zod_1.z.boolean().optional(),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate);
        const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate);
        return endDate > startDate;
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});
exports.createKeyResultSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(200),
    description: zod_1.z.string().max(500).optional(),
    targetValue: zod_1.z.number().positive("Target value must be positive"),
    weight: zod_1.z.number().min(0).max(1).default(1.0),
});
exports.updateKeyResultSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().max(500).optional(),
    targetValue: zod_1.z.number().positive().optional(),
    currentValue: zod_1.z.number().min(0).optional(),
    weight: zod_1.z.number().min(0).max(1).optional(),
});
exports.goalsQuerySchema = zod_1.z.object({
    type: exports.goalTypeSchema.optional(),
    isActive: zod_1.z.string().transform((val) => val === "true").optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
exports.linkToGoalSchema = zod_1.z.object({
    goalId: zod_1.z.string().min(1, "Goal ID is required"),
});
//# sourceMappingURL=goal.schema.js.map