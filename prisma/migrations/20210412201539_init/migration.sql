-- CreateEnum
CREATE TYPE "StatusCheckType" AS ENUM ('HTTP');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('DOWN', 'UP');

-- CreateTable
CREATE TABLE "StatusCheck" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "configId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusCheckConfig" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB NOT NULL,
    "id" TEXT NOT NULL,
    "type" "StatusCheckType" NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "statusCheckId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB NOT NULL,
    "id" TEXT NOT NULL,
    "rtt" INTEGER,
    "status" "ResultStatus" NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StatusCheck.label_unique" ON "StatusCheck"("label");

-- CreateIndex
CREATE UNIQUE INDEX "StatusCheck_configId_unique" ON "StatusCheck"("configId");

-- AddForeignKey
ALTER TABLE "StatusCheck" ADD FOREIGN KEY ("configId") REFERENCES "StatusCheckConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD FOREIGN KEY ("statusCheckId") REFERENCES "StatusCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
