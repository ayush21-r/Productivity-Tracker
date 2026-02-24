-- CreateTable
CREATE TABLE "ShiftSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "shiftStart" DATETIME NOT NULL,
    "shiftEnd" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShiftSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ShiftSession_userId_idx" ON "ShiftSession"("userId");

-- CreateIndex
CREATE INDEX "ShiftSession_shiftEnd_idx" ON "ShiftSession"("shiftEnd");

-- CreateIndex
CREATE INDEX "ShiftSession_userId_shiftEnd_idx" ON "ShiftSession"("userId", "shiftEnd");
