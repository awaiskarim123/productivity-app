-- Add soft delete support: Add deletedAt columns to Task and Habit tables

-- AlterTable
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateIndex (only if column was just added)
CREATE INDEX IF NOT EXISTS "Task_userId_deletedAt_idx" ON "Task"("userId", "deletedAt");

-- CreateIndex (only if column was just added)
CREATE INDEX IF NOT EXISTS "Habit_userId_deletedAt_idx" ON "Habit"("userId", "deletedAt");
