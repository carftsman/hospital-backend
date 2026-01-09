/*
  Warnings:

  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "isOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "onboardingStage" DROP NOT NULL,
ALTER COLUMN "onboardingStage" DROP DEFAULT;
