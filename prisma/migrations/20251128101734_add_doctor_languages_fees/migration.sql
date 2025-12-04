-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "consultationFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[];
