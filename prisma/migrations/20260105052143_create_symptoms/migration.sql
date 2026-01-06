-- CreateTable
CREATE TABLE "Symptom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Symptom_name_idx" ON "Symptom"("name");

-- CreateIndex
CREATE INDEX "Symptom_categoryId_idx" ON "Symptom"("categoryId");

-- AddForeignKey
ALTER TABLE "Symptom" ADD CONSTRAINT "Symptom_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
