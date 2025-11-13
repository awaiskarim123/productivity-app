"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workSessionsQuerySchema = exports.workSummaryQuerySchema = exports.endWorkSchema = exports.startWorkSchema = void 0;
const zod_1 = require("zod");
exports.startWorkSchema = zod_1.z.object({
    notes: zod_1.z.string().max(500).optional(),
    startedAt: zod_1.z.coerce.date().optional(),
});
exports.endWorkSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1),
    endedAt: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.workSummaryQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(["daily", "weekly", "monthly"]).default("daily"),
});
exports.workSessionsQuerySchema = zod_1.z.object({
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .transform((value) => value ?? 50),
});
//# sourceMappingURL=work.schema.js.map