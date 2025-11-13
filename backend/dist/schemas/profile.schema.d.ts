import { z } from "zod";
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    dailyGoalMinutes: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=profile.schema.d.ts.map