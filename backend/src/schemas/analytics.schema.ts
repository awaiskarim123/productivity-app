import { z } from "zod";

function isValidYyyyMmDdUtc(s: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match?.[1] || !match[2] || !match[3]) return false;
  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

export const heatmapQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(90).default(14),
});

export const burnoutQuerySchema = z.object({
  windowDays: z.coerce.number().int().min(3).max(30).default(7),
});

export const productivityScoreQuerySchema = z.object({
  periodDays: z.coerce.number().int().min(1).max(90).default(7),
});

/** Optional weekStart (date string YYYY-MM-DD) to fetch insights for a specific week (e.g. last week). */
export const weeklyInsightsQuerySchema = z
  .object({
    weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .refine((data) => !data.weekStart || isValidYyyyMmDdUtc(data.weekStart), {
    message: "weekStart must be a valid calendar date",
    path: ["weekStart"],
  });
