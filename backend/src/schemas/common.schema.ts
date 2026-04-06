import { z } from "zod";

/** Route params where Prisma models use `@id @default(cuid())`. */
export const idParamSchema = z.object({ id: z.cuid() });

export const goalIdParamSchema = z.object({ goalId: z.cuid() });

export const habitLogParamsSchema = z.object({
  id: z.cuid(),
  logId: z.cuid(),
});

export const goalTaskLinkParamsSchema = z.object({
  goalId: z.cuid(),
  taskId: z.cuid(),
});

export const goalHabitLinkParamsSchema = z.object({
  goalId: z.cuid(),
  habitId: z.cuid(),
});

export const goalFocusSessionLinkParamsSchema = z.object({
  goalId: z.cuid(),
  sessionId: z.cuid(),
});
