import { z } from "zod";
export declare const createHabitSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    targetDays: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateHabitSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    targetDays: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const logHabitSchema: z.ZodObject<{
    date: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const habitsQuerySchema: z.ZodObject<{
    isActive: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
}, z.core.$strip>;
export declare const habitLogsQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    to: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodCoercedNumber<unknown>>, z.ZodTransform<number, number | undefined>>;
    offset: z.ZodPipe<z.ZodOptional<z.ZodCoercedNumber<unknown>>, z.ZodTransform<number, number | undefined>>;
}, z.core.$strip>;
//# sourceMappingURL=habit.schema.d.ts.map