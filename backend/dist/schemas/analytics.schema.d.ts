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
/** Optional weekStart (date string YYYY-MM-DD) to fetch insights for a specific week (e.g. last week). */
export declare const weeklyInsightsQuerySchema: z.ZodObject<{
    weekStart: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=analytics.schema.d.ts.map