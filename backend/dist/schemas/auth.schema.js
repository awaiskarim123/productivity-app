"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().optional(),
    dailyGoalMinutes: zod_1.z.coerce.number().int().min(30).max(1440).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(10),
});
//# sourceMappingURL=auth.schema.js.map