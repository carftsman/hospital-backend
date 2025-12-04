-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Doctor_hospitalId_idx" ON "Doctor"("hospitalId");

-- CreateIndex
CREATE INDEX "Doctor_categoryId_idx" ON "Doctor"("categoryId");

-- CreateIndex
CREATE INDEX "TimeSlot_doctorId_start_idx" ON "TimeSlot"("doctorId", "start");

-- CreateIndex
CREATE INDEX "TimeSlot_doctorId_isActive_idx" ON "TimeSlot"("doctorId", "isActive");

-- CreateIndex
CREATE INDEX "TimeSlot_start_idx" ON "TimeSlot"("start");

-- CreateIndex
CREATE INDEX "TimeSlot_doctorId_start_end_idx" ON "TimeSlot"("doctorId", "start", "end");
