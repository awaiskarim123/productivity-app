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

