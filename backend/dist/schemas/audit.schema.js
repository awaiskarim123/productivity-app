"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogsQuerySchema = void 0;
const zod_1 = require("zod");
exports.auditLogsQuerySchema = zod_1.z.object({
    resource: zod_1.z.enum(["task", "habit", "note", "work_session", "focus_session"]).optional(),
    action: zod_1.z.enum(["create", "update", "delete"]).optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(50),
    offset: zod_1.z.coerce.number().int().nonnegative().default(0),
});
//# sourceMappingURL=audit.schema.js.map