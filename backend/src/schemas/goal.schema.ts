import { z } from "zod";

export const goalTypeSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]);

export const goalHealthStatusSchema = z.enum(["ON_TRACK", "AT_RISK", "OFF_TRACK"]);

export const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  type: goalTypeSchema,
  startDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.string().datetime(),
    z.date()
  ]),
  endDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.string().datetime(),
    z.date()
  ]),
  targetValue: z.number().positive("Target value must be positive").default(100),
  keyResults: z
    .array(
      z.object({
        title: z.string().min(1, "Key result title is required").max(200),
        description: z.string().max(500).optional(),
        targetValue: z.number().positive("Target value must be positive"),
        weight: z.number().min(0).max(1).default(1.0),
      })
    )
    .optional()
    .default([]),
}).refine(
  (data) => {
    const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate);
    const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate);
    return endDate > startDate;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  startDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.string().datetime(),
    z.date()
  ]).optional(),
  endDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.string().datetime(),
    z.date()
  ]).optional(),
  targetValue: z.number().positive().optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate);
      const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate);
      return endDate > startDate;
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const createKeyResultSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  targetValue: z.number().positive("Target value must be positive"),
  weight: z.number().min(0).max(1).default(1.0),
});

export const updateKeyResultSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().min(0).optional(),
  weight: z.number().min(0).max(1).optional(),
});

export const goalsQuerySchema = z.object({
  type: goalTypeSchema.optional(),
  isActive: z.string().transform((val) => val === "true").optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const linkToGoalSchema = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
});
