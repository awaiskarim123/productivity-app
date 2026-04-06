"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const PASSWORD_MAX_LENGTH = 128;
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters").max(PASSWORD_MAX_LENGTH, "Password must be at most 128 characters"),
    name: zod_1.z.string().max(200).optional(),
    dailyGoalMinutes: zod_1.z.coerce.number().int().min(30).max(1440).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    password: zod_1.z.string().min(8).max(PASSWORD_MAX_LENGTH),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(10).max(200),
});
//# sourceMappingURL=auth.schema.js.map