import { z } from "zod";
/** Route params where Prisma models use `@id @default(cuid())`. */
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodCUID;
}, z.core.$strip>;
export declare const goalIdParamSchema: z.ZodObject<{
    goalId: z.ZodCUID;
}, z.core.$strip>;
export declare const habitLogParamsSchema: z.ZodObject<{
    id: z.ZodCUID;
    logId: z.ZodCUID;
}, z.core.$strip>;
export declare const goalTaskLinkParamsSchema: z.ZodObject<{
    goalId: z.ZodCUID;
    taskId: z.ZodCUID;
}, z.core.$strip>;
export declare const goalHabitLinkParamsSchema: z.ZodObject<{
    goalId: z.ZodCUID;
    habitId: z.ZodCUID;
}, z.core.$strip>;
export declare const goalFocusSessionLinkParamsSchema: z.ZodObject<{
    goalId: z.ZodCUID;
    sessionId: z.ZodCUID;
}, z.core.$strip>;
//# sourceMappingURL=common.schema.d.ts.map