-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('NEW', 'ONGOING', 'RESOLVED');

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "incidentId" TEXT;

-- AlterTable
ALTER TABLE "StatusCheckConfig" ADD COLUMN     "incidentThreshold" INTEGER DEFAULT 1;

-- CreateTable
CREATE TABLE "Incident" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT E'ONGOING',
    "statusCheckId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Result" ADD FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD FOREIGN KEY ("statusCheckId") REFERENCES "StatusCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
