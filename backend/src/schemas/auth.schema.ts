import { z } from "zod";

const PASSWORD_MAX_LENGTH = 128;

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(PASSWORD_MAX_LENGTH, "Password must be at most 128 characters"),
  name: z.string().max(200).optional(),
  dailyGoalMinutes: z.coerce.number().int().min(30).max(1440).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(PASSWORD_MAX_LENGTH),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10).max(200),
});

