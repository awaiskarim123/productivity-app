import { z } from "zod";

export const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  targetDays: z.number().int().positive().max(365).optional(),
});

export const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional().nullable(),
  targetDays: z.number().int().positive().max(365).optional(),
  isActive: z.boolean().optional(),
});

export const logHabitSchema = z.object({
  date: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export const habitsQuerySchema = z.object({
  isActive: z.string().transform((val) => val === "true").optional(),
});

