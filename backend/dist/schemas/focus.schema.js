"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusStatsQuerySchema = exports.endFocusSchema = exports.startFocusSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../generated/prisma/enums");
exports.startFocusSchema = zod_1.z.object({
    mode: zod_1.z.nativeEnum(enums_1.FocusSessionMode).default(enums_1.FocusSessionMode.FOCUS),
    targetMinutes: zod_1.z.coerce.number().int().min(5).max(120),
    startedAt: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.endFocusSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1),
    endedAt: zod_1.z.coerce.date().optional(),
    completed: zod_1.z.boolean().optional(),
    distractions: zod_1.z.coerce.number().int().min(0).max(99).optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.focusStatsQuerySchema = zod_1.z.object({
    rangeDays: zod_1.z.coerce.number().int().min(1).max(60).default(14),
});
//# sourceMappingURL=focus.schema.js.map