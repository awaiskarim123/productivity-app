import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().optional(),
    dailyGoalMinutes: z.coerce.number().int().min(30).max(1440).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

