"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalFocusSessionLinkParamsSchema = exports.goalHabitLinkParamsSchema = exports.goalTaskLinkParamsSchema = exports.habitLogParamsSchema = exports.goalIdParamSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
/** Route params where Prisma models use `@id @default(cuid())`. */
exports.idParamSchema = zod_1.z.object({ id: zod_1.z.cuid() });
exports.goalIdParamSchema = zod_1.z.object({ goalId: zod_1.z.cuid() });
exports.habitLogParamsSchema = zod_1.z.object({
    id: zod_1.z.cuid(),
    logId: zod_1.z.cuid(),
});
exports.goalTaskLinkParamsSchema = zod_1.z.object({
    goalId: zod_1.z.cuid(),
    taskId: zod_1.z.cuid(),
});
exports.goalHabitLinkParamsSchema = zod_1.z.object({
    goalId: zod_1.z.cuid(),
    habitId: zod_1.z.cuid(),
});
exports.goalFocusSessionLinkParamsSchema = zod_1.z.object({
    goalId: zod_1.z.cuid(),
    sessionId: zod_1.z.cuid(),
});
//# sourceMappingURL=common.schema.js.map