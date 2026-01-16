import { z } from "zod";
export declare const goalTypeSchema: z.ZodEnum<{
    DAILY: "DAILY";
    WEEKLY: "WEEKLY";
    MONTHLY: "MONTHLY";
    QUARTERLY: "QUARTERLY";
    YEARLY: "YEARLY";
}>;
export declare const goalHealthStatusSchema: z.ZodEnum<{
    ON_TRACK: "ON_TRACK";
    AT_RISK: "AT_RISK";
    OFF_TRACK: "OFF_TRACK";
}>;
export declare const createGoalSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        DAILY: "DAILY";
        WEEKLY: "WEEKLY";
        MONTHLY: "MONTHLY";
        QUARTERLY: "QUARTERLY";
        YEARLY: "YEARLY";
    }>;
    startDate: z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodDate]>;
    endDate: z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodDate]>;
    targetValue: z.ZodDefault<z.ZodNumber>;
    keyResults: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        targetValue: z.ZodNumber;
        weight: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
export declare const updateGoalSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodDate]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodDate]>>;
    targetValue: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createKeyResultSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    targetValue: z.ZodNumber;
    weight: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateKeyResultSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    targetValue: z.ZodOptional<z.ZodNumber>;
    currentValue: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const goalsQuerySchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        DAILY: "DAILY";
        WEEKLY: "WEEKLY";
        MONTHLY: "MONTHLY";
        QUARTERLY: "QUARTERLY";
        YEARLY: "YEARLY";
    }>>;
    isActive: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const linkToGoalSchema: z.ZodObject<{
    goalId: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=goal.schema.d.ts.map