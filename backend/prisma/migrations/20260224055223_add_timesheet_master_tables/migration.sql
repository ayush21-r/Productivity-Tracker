-- AlterTable
ALTER TABLE "WorkSession" ADD COLUMN "comment" TEXT;

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Process" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SubProcess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubProcess_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "expectedDuration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "assignedToId" TEXT NOT NULL,
    "activityId" TEXT,
    "processId" TEXT,
    "subProcessId" TEXT,
    "jobTypeId" TEXT,
    "actualDuration" INTEGER NOT NULL DEFAULT 0,
    "productivity" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_subProcessId_fkey" FOREIGN KEY ("subProcessId") REFERENCES "SubProcess" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "JobType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("actualDuration", "assignedToId", "createdAt", "description", "expectedDuration", "id", "productivity", "status", "title", "updatedAt") SELECT "actualDuration", "assignedToId", "createdAt", "description", "expectedDuration", "id", "productivity", "status", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt");
CREATE INDEX "Task_assignedToId_status_idx" ON "Task"("assignedToId", "status");
CREATE INDEX "Task_activityId_idx" ON "Task"("activityId");
CREATE INDEX "Task_processId_idx" ON "Task"("processId");
CREATE INDEX "Task_subProcessId_idx" ON "Task"("subProcessId");
CREATE INDEX "Task_jobTypeId_idx" ON "Task"("jobTypeId");
CREATE INDEX "Task_activityId_processId_subProcessId_jobTypeId_idx" ON "Task"("activityId", "processId", "subProcessId", "jobTypeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Activity_name_key" ON "Activity"("name");

-- CreateIndex
CREATE INDEX "Activity_name_idx" ON "Activity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Process_name_key" ON "Process"("name");

-- CreateIndex
CREATE INDEX "Process_name_idx" ON "Process"("name");

-- CreateIndex
CREATE INDEX "SubProcess_processId_idx" ON "SubProcess"("processId");

-- CreateIndex
CREATE INDEX "SubProcess_name_idx" ON "SubProcess"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubProcess_processId_name_key" ON "SubProcess"("processId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "JobType_name_key" ON "JobType"("name");

-- CreateIndex
CREATE INDEX "JobType_name_idx" ON "JobType"("name");
