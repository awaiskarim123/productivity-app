-- AlterTable
ALTER TABLE "FocusSession" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorkSession" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "FocusSession_userId_deletedAt_idx" ON "FocusSession"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Note_userId_deletedAt_idx" ON "Note"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "WorkSession_userId_deletedAt_idx" ON "WorkSession"("userId", "deletedAt");
