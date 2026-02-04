import { z } from "zod";

export const heatmapQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(90).default(14),
});

export const burnoutQuerySchema = z.object({
  windowDays: z.coerce.number().int().min(3).max(30).default(7),
});

export const productivityScoreQuerySchema = z.object({
  periodDays: z.coerce.number().int().min(1).max(90).default(7),
});
