import { z } from "zod";
export declare const heatmapQuerySchema: z.ZodObject<{
    days: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const burnoutQuerySchema: z.ZodObject<{
    windowDays: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const productivityScoreQuerySchema: z.ZodObject<{
    periodDays: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=analytics.schema.d.ts.map