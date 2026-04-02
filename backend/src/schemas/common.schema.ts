import { z, cuid } from "zod";

const cuidString = cuid();

/** Route params where Prisma models use `@id @default(cuid())`. */
export const idParamSchema = z.object({ id: cuidString });

export const goalIdParamSchema = z.object({ goalId: cuidString });

export const habitLogParamsSchema = z.object({
  id: cuidString,
  logId: cuidString,
});

export const goalTaskLinkParamsSchema = z.object({
  goalId: cuidString,
  taskId: cuidString,
});

export const goalHabitLinkParamsSchema = z.object({
  goalId: cuidString,
  habitId: cuidString,
});

export const goalFocusSessionLinkParamsSchema = z.object({
  goalId: cuidString,
  sessionId: cuidString,
});
