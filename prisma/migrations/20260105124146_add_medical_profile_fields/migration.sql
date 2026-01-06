-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bloodGroup" "BloodGroup",
ADD COLUMN     "emContactName" TEXT,
ADD COLUMN     "emContactNumber" TEXT;
