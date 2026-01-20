/*
  Warnings:

  - You are about to drop the column `doctorName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `userEmail` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `userPhone` on the `Booking` table. All the data in the column will be lost.
  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `doctorId` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `end` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `start` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropIndex
DROP INDEX "Booking_status_idx";

-- DropIndex
DROP INDEX "Booking_userId_idx";

-- DropIndex
DROP INDEX "Doctor_categoryId_idx";

-- DropIndex
DROP INDEX "Doctor_hospitalId_idx";

-- DropIndex
DROP INDEX "Notification_hospitalId_idx";

-- DropIndex
DROP INDEX "Notification_userId_idx";

-- DropIndex
DROP INDEX "Symptom_categoryId_idx";

-- DropIndex
DROP INDEX "Symptom_name_idx";

-- DropIndex
DROP INDEX "TimeSlot_doctorId_isActive_idx";

-- DropIndex
DROP INDEX "TimeSlot_doctorId_start_end_idx";

-- DropIndex
DROP INDEX "TimeSlot_start_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_phone_idx";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "doctorName",
DROP COLUMN "hospitalId",
DROP COLUMN "hospitalName",
DROP COLUMN "userEmail",
DROP COLUMN "userName",
DROP COLUMN "userPhone",
ADD COLUMN     "patientProfileId" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
ALTER COLUMN "doctorId" SET NOT NULL,
ALTER COLUMN "end" SET NOT NULL,
ALTER COLUMN "start" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "PatientProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "isSelf" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientProfile_userId_idx" ON "PatientProfile"("userId");

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_patientProfileId_fkey" FOREIGN KEY ("patientProfileId") REFERENCES "PatientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
