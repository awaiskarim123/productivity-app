"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.importPayloadSchema = void 0;
const zod_1 = require("zod");
const taskExportItem = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    completed: zod_1.z.boolean().optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    dueDate: zod_1.z.string().nullable().optional(),
    category: zod_1.z.string().nullable().optional(),
});
const habitExportItem = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    color: zod_1.z.string(),
    targetDays: zod_1.z.number(),
});
const habitLogExportItem = zod_1.z.object({
    habitIndex: zod_1.z.number().int().min(0),
    date: zod_1.z.string(),
});
const noteExportItem = zod_1.z.object({
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()),
    isPinned: zod_1.z.boolean().optional(),
});
const workSessionExportItem = zod_1.z.object({
    startedAt: zod_1.z.string(),
    endedAt: zod_1.z.string().nullable().optional(),
    durationMinutes: zod_1.z.number().nullable().optional(),
    notes: zod_1.z.string().nullable().optional(),
});
const focusSessionExportItem = zod_1.z.object({
    mode: zod_1.z.enum(["FOCUS", "BREAK"]),
    startedAt: zod_1.z.string(),
    endedAt: zod_1.z.string().nullable().optional(),
    targetMinutes: zod_1.z.number(),
    durationMinutes: zod_1.z.number().nullable().optional(),
    completed: zod_1.z.boolean().optional(),
    distractions: zod_1.z.number().optional(),
    notes: zod_1.z.string().nullable().optional(),
});
const keyResultExportItem = zod_1.z.object({
    title: zod_1.z.string(),
    targetValue: zod_1.z.number(),
    weight: zod_1.z.number().optional(),
});
const goalExportItem = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    type: zod_1.z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    targetValue: zod_1.z.number().optional(),
    keyResults: zod_1.z.array(keyResultExportItem).optional(),
});
exports.importPayloadSchema = zod_1.z.object({
    version: zod_1.z.number().int().positive(),
    exportedAt: zod_1.z.string().optional(),
    profile: zod_1.z.object({ name: zod_1.z.string().nullable().optional(), dailyGoalMinutes: zod_1.z.number().optional() }).optional(),
    tasks: zod_1.z.array(taskExportItem).default([]),
    habits: zod_1.z.array(habitExportItem).default([]),
    habitLogs: zod_1.z.array(habitLogExportItem).default([]),
    notes: zod_1.z.array(noteExportItem).default([]),
    workSessions: zod_1.z.array(workSessionExportItem).default([]),
    focusSessions: zod_1.z.array(focusSessionExportItem).default([]),
    goals: zod_1.z.array(goalExportItem).default([]),
});
exports.updateProfileSchema = zod_1.z
    .object({
    name: zod_1.z.string().optional(),
    dailyGoalMinutes: zod_1.z.coerce.number().int().min(30).max(1440).optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(8, "Current password must be at least 8 characters"),
    newPassword: zod_1.z.string().min(8, "New password must be at least 8 characters"),
})
    .refine((data) => {
    const password = data.newPassword;
    // At least one uppercase letter
    if (!/[A-Z]/.test(password))
        return false;
    // At least one lowercase letter
    if (!/[a-z]/.test(password))
        return false;
    // At least one digit
    if (!/[0-9]/.test(password))
        return false;
    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
        return false;
    return true;
}, {
    message: "New password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
    path: ["newPassword"],
})
    .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
});
//# sourceMappingURL=profile.schema.js.map