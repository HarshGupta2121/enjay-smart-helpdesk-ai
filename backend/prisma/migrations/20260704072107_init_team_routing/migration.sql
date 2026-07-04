-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('MANAGER', 'LEAD', 'ENGINEER', 'AGENT');

-- CreateEnum
CREATE TYPE "AssignmentStrategy" AS ENUM ('MANUAL', 'ROUND_ROBIN', 'LEAST_ACTIVE', 'LEAST_OPEN');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "queueId" TEXT,
ADD COLUMN     "teamId" TEXT;

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_settings" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "assignmentStrategy" "AssignmentStrategy" NOT NULL DEFAULT 'MANUAL',
    "firstResponseSlaHrs" DOUBLE PRECISION NOT NULL DEFAULT 4,
    "resolutionSlaHrs" DOUBLE PRECISION NOT NULL DEFAULT 24,

    CONSTRAINT "team_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("teamId","userId")
);

-- CreateTable
CREATE TABLE "queues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "team_settings_teamId_key" ON "team_settings"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "queues_teamId_name_key" ON "queues"("teamId", "name");

-- CreateIndex
CREATE INDEX "tickets_teamId_idx" ON "tickets"("teamId");

-- CreateIndex
CREATE INDEX "tickets_queueId_idx" ON "tickets"("queueId");

-- AddForeignKey
ALTER TABLE "team_settings" ADD CONSTRAINT "team_settings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "queues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
