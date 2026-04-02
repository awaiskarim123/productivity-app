"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalFocusSessionLinkParamsSchema = exports.goalHabitLinkParamsSchema = exports.goalTaskLinkParamsSchema = exports.habitLogParamsSchema = exports.goalIdParamSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
const cuidString = (0, zod_1.cuid)();
/** Route params where Prisma models use `@id @default(cuid())`. */
exports.idParamSchema = zod_1.z.object({ id: cuidString });
exports.goalIdParamSchema = zod_1.z.object({ goalId: cuidString });
exports.habitLogParamsSchema = zod_1.z.object({
    id: cuidString,
    logId: cuidString,
});
exports.goalTaskLinkParamsSchema = zod_1.z.object({
    goalId: cuidString,
    taskId: cuidString,
});
exports.goalHabitLinkParamsSchema = zod_1.z.object({
    goalId: cuidString,
    habitId: cuidString,
});
exports.goalFocusSessionLinkParamsSchema = zod_1.z.object({
    goalId: cuidString,
    sessionId: cuidString,
});
//# sourceMappingURL=common.schema.js.map