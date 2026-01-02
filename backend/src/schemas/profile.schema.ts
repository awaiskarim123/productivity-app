import { z } from "zod";

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

