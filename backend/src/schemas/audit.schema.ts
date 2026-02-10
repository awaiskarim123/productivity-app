import { z } from "zod";

export const auditLogsQuerySchema = z.object({
  resource: z.enum(["task", "habit", "note", "work_session", "focus_session"]).optional(),
  action: z.enum(["create", "update", "delete"]).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});
