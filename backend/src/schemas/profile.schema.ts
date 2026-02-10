import { z } from "zod";

const taskExportItem = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  completed: z.boolean().optional(),
  priority: z.string(),
  dueDate: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
});
const habitExportItem = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  color: z.string(),
  targetDays: z.number(),
});
const habitLogExportItem = z.object({ habitIndex: z.number(), date: z.string() });
const noteExportItem = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  isPinned: z.boolean().optional(),
});
const workSessionExportItem = z.object({
  startedAt: z.string(),
  endedAt: z.string().nullable().optional(),
  durationMinutes: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});
const focusSessionExportItem = z.object({
  mode: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable().optional(),
  targetMinutes: z.number(),
  durationMinutes: z.number().nullable().optional(),
  completed: z.boolean().optional(),
  distractions: z.number().optional(),
  notes: z.string().nullable().optional(),
});
const keyResultExportItem = z.object({
  title: z.string(),
  targetValue: z.number(),
  weight: z.number().optional(),
});
const goalExportItem = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  type: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  targetValue: z.number().optional(),
  keyResults: z.array(keyResultExportItem).optional(),
});

export const importPayloadSchema = z.object({
  version: z.number().int().positive(),
  exportedAt: z.string().optional(),
  profile: z.object({ name: z.string().nullable().optional(), dailyGoalMinutes: z.number().optional() }).optional(),
  tasks: z.array(taskExportItem).default([]),
  habits: z.array(habitExportItem).default([]),
  habitLogs: z.array(habitLogExportItem).default([]),
  notes: z.array(noteExportItem).default([]),
  workSessions: z.array(workSessionExportItem).default([]),
  focusSessions: z.array(focusSessionExportItem).default([]),
  goals: z.array(goalExportItem).default([]),
});

export const updateProfileSchema = z
  .object({
    name: z.string().optional(),
    dailyGoalMinutes: z.coerce.number().int().min(30).max(1440).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  })
  .refine(
    (data) => {
      const password = data.newPassword;
      // At least one uppercase letter
      if (!/[A-Z]/.test(password)) return false;
      // At least one lowercase letter
      if (!/[a-z]/.test(password)) return false;
      // At least one digit
      if (!/[0-9]/.test(password)) return false;
      // At least one special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
      return true;
    },
    {
      message:
        "New password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }
  );

