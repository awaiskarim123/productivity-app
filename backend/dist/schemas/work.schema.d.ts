import { z } from "zod";
export declare const startWorkSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export declare const endWorkSchema: z.ZodObject<{
    sessionId: z.ZodString;
    endedAt: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const workSummaryQuerySchema: z.ZodObject<{
    period: z.ZodDefault<z.ZodEnum<{
        daily: "daily";
        weekly: "weekly";
        monthly: "monthly";
    }>>;
}, z.core.$strip>;
export declare const workSessionsQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    to: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodCoercedNumber<unknown>>, z.ZodTransform<number, number | undefined>>;
}, z.core.$strip>;
export declare const updateWorkSessionSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    endedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
}, z.core.$strip>;
//# sourceMappingURL=work.schema.d.ts.map