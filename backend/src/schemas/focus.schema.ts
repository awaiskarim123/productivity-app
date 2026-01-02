import { z } from "zod";
import { FocusSessionMode } from "../generated/prisma/enums";

export const startFocusSchema = z.object({
  mode: z.nativeEnum(FocusSessionMode).default(FocusSessionMode.FOCUS),
  targetMinutes: z.coerce.number().int().min(5).max(120),
  startedAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

export const endFocusSchema = z.object({
  sessionId: z.string().min(1),
  endedAt: z.coerce.date().optional(),
  completed: z.boolean().optional(),
  distractions: z.coerce.number().int().min(0).max(99).optional(),
  notes: z.string().max(500).optional(),
});

export const focusStatsQuerySchema = z.object({
  rangeDays: z.coerce.number().int().min(1).max(60).default(14),
});

export const focusSessionsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  mode: z.nativeEnum(FocusSessionMode).optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .transform((value) => value ?? 50),
  offset: z.coerce.number().int().min(0).optional().transform((value) => value ?? 0),
});

export const updateFocusSessionSchema = z.object({
  notes: z.string().max(500).optional().nullable(),
  distractions: z.coerce.number().int().min(0).max(99).optional(),
  completed: z.boolean().optional(),
});

