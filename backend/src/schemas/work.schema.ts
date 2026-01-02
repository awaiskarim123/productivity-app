import { z } from "zod";

export const startWorkSchema = z.object({
  notes: z.string().max(500).optional(),
  startedAt: z.coerce.date().optional(),
});

export const endWorkSchema = z.object({
  sessionId: z.string().min(1),
  endedAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

export const workSummaryQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
});

export const workSessionsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .transform((value) => value ?? 50),
});

export const updateWorkSessionSchema = z.object({
  notes: z.string().max(500).optional(),
  startedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
});

