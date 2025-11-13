import { z } from "zod";
export declare const startFocusSchema: z.ZodObject<{
    mode: z.ZodDefault<z.ZodEnum<{
        readonly FOCUS: "FOCUS";
        readonly BREAK: "BREAK";
    }>>;
    targetMinutes: z.ZodCoercedNumber<unknown>;
    startedAt: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const endFocusSchema: z.ZodObject<{
    sessionId: z.ZodString;
    endedAt: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    completed: z.ZodOptional<z.ZodBoolean>;
    distractions: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const focusStatsQuerySchema: z.ZodObject<{
    rangeDays: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=focus.schema.d.ts.map