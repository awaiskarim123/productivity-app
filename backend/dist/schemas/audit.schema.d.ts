import { z } from "zod";
export declare const auditLogsQuerySchema: z.ZodObject<{
    resource: z.ZodOptional<z.ZodEnum<{
        task: "task";
        habit: "habit";
        note: "note";
        work_session: "work_session";
        focus_session: "focus_session";
    }>>;
    action: z.ZodOptional<z.ZodEnum<{
        delete: "delete";
        create: "create";
        update: "update";
    }>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=audit.schema.d.ts.map