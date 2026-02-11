-- CreateEnum
CREATE TYPE "ConsultationMode" AS ENUM ('ONLINE', 'OFFLINE', 'BOTH');

-- CreateEnum
CREATE TYPE "HospitalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'SAMPLE_COLLECTED', 'COMPLETED', 'CANCELLED', 'CONFIRMED', 'HOLD', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LabBookingStatus" AS ENUM ('PENDING', 'SAMPLE_COLLECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'READY');

-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('FEMALE', 'MALE', 'ALL');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('MEDICINE', 'APPOINTMENT', 'TEST', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReminderRepeat" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'SKIPPED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');

-- CreateEnum
CREATE TYPE "LabReportStatus" AS ENUM ('NORMAL', 'BORDERLINE', 'ABNORMAL');

-- CreateEnum
CREATE TYPE "OnboardingStage" AS ENUM ('PHONE_VERIFICATION', 'PROFILE_SETUP', 'COMPLETED');

-- CreateEnum
CREATE TYPE "report_status_enum" AS ENUM ('NORMAL', 'BORDERLINE', 'ABNORMAL');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "password" TEXT,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "acceptedAt" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStage" "OnboardingStage",
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "refreshToken" TEXT,
    "bloodGroup" "BloodGroup",
    "emContactName" TEXT,
    "emContactNumber" TEXT,
    "fullName" TEXT,
    "isOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "place" TEXT,
    "imageUrl" TEXT,
    "pinCode" TEXT NOT NULL,
    "contactName" TEXT,
    "contactNumber" TEXT,
    "ownerEmail" TEXT NOT NULL,
    "ownerPassword" TEXT NOT NULL,
    "speciality" TEXT,
    "consultationMode" "ConsultationMode" NOT NULL DEFAULT 'BOTH',
    "status" "HospitalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isListed" BOOLEAN NOT NULL DEFAULT true,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "establishedYear" INTEGER,
    "state" TEXT,
    "city" TEXT,
    "open24x7" BOOLEAN DEFAULT false,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "popularity" INTEGER DEFAULT 0,
    "isWomenFriendly" BOOLEAN DEFAULT false,
    "hasMaternityCare" BOOLEAN DEFAULT false,
    "isEmergencySupported" BOOLEAN DEFAULT false,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "hospitalId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isWomenSpecific" BOOLEAN DEFAULT false,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symptom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isWomenSpecific" BOOLEAN DEFAULT false,
    "isCritical" BOOLEAN DEFAULT false,

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorSymptom" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "symptomId" INTEGER NOT NULL,

    CONSTRAINT "DoctorSymptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "experience" INTEGER NOT NULL,
    "specialization" TEXT,
    "qualification" TEXT,
    "about" TEXT,
    "categoryId" INTEGER NOT NULL,
    "hospitalId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consultationFee" INTEGER NOT NULL DEFAULT 0,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rating" DECIMAL(2,1) DEFAULT 0,
    "isfavorite" BOOLEAN DEFAULT false,
    "consultationMode" "ConsultationMode" NOT NULL DEFAULT 'BOTH',
    "genderPreference" "GenderPreference" DEFAULT 'ALL',

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorAvailability" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DoctorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "consultationMode" "ConsultationMode" NOT NULL DEFAULT 'BOTH',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doctorId" INTEGER NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "patientProfileId" INTEGER,
    "status" "BookingStatus" NOT NULL,
    "expiresAt" TIMESTAMP(6),
    "reason" TEXT,
    "timeSlotId" INTEGER,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "hospitalId" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "doctorName" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "userName" TEXT,
    "userPhone" TEXT,
    "slotStart" TIMESTAMP(3) NOT NULL,
    "slotEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "dob" TIMESTAMP(6),

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lab" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "labId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,

    CONSTRAINT "LabCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" SERIAL NOT NULL,
    "labId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "reportTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "imageUrl" TEXT,

    CONSTRAINT "LabTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabBooking" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "labId" INTEGER NOT NULL,
    "labTestId" INTEGER NOT NULL,
    "status" "LabBookingStatus" NOT NULL DEFAULT 'PENDING',
    "sampleDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectedAt" TIMESTAMP(6),
    "reportIssuedAt" TIMESTAMP(6),

    CONSTRAINT "LabBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabReport" (
    "id" SERIAL NOT NULL,
    "labBookingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportStatus" TEXT,
    "summary" TEXT,
    "reportUrls" JSONB,
    "samples" TEXT[],
    "collectedAt" TIMESTAMP(3),

    CONSTRAINT "LabReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabFeedback" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabCart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "labId" INTEGER NOT NULL,
    "labTestId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabPrescription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "labBookingId" INTEGER,

    CONSTRAINT "LabPrescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "ReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "reminderAt" TIMESTAMP(3) NOT NULL,
    "repeat" "ReminderRepeat" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabPackage" (
    "id" SERIAL NOT NULL,
    "labId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "reportTime" TEXT,
    "originalPrice" INTEGER NOT NULL DEFAULT 0,
    "finalPrice" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabPackageItem" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "labTestId" INTEGER NOT NULL,

    CONSTRAINT "LabPackageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LabCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_ownerEmail_key" ON "Hospital"("ownerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorSymptom_unique" ON "DoctorSymptom"("doctorId", "symptomId");

-- CreateIndex
CREATE INDEX "DoctorAvailability_doctorId_date_idx" ON "DoctorAvailability"("doctorId", "date");

-- CreateIndex
CREATE INDEX "TimeSlot_doctorId_start_idx" ON "TimeSlot"("doctorId", "start");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_doctor_slot" ON "TimeSlot"("doctorId", "start", "end");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_timeSlotId_key" ON "Booking"("timeSlotId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_bookingId_key" ON "Notification"("bookingId");

-- CreateIndex
CREATE INDEX "PatientProfile_userId_idx" ON "PatientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_lab_category_test" ON "LabTest"("labId", "categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "LabReport_labBookingId_key" ON "LabReport"("labBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "LabFeedback_bookingId_key" ON "LabFeedback"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "LabCart_user_labTest_unique" ON "LabCart"("userId", "labTestId");

-- CreateIndex
CREATE INDEX "Reminder_userId_reminderAt_idx" ON "Reminder"("userId", "reminderAt");

-- CreateIndex
CREATE UNIQUE INDEX "LabPackageItem_unique" ON "LabPackageItem"("packageId", "labTestId");

-- CreateIndex
CREATE UNIQUE INDEX "_LabCategories_AB_unique" ON "_LabCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_LabCategories_B_index" ON "_LabCategories"("B");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Symptom" ADD CONSTRAINT "Symptom_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorSymptom" ADD CONSTRAINT "DoctorSymptom_doctor_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DoctorSymptom" ADD CONSTRAINT "DoctorSymptom_symptom_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorAvailability" ADD CONSTRAINT "DoctorAvailability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_patientProfileId_fkey" FOREIGN KEY ("patientProfileId") REFERENCES "PatientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabCategory" ADD CONSTRAINT "LabCategory_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LabCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabBooking" ADD CONSTRAINT "LabBooking_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabBooking" ADD CONSTRAINT "LabBooking_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabBooking" ADD CONSTRAINT "LabBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabReport" ADD CONSTRAINT "LabReport_labBookingId_fkey" FOREIGN KEY ("labBookingId") REFERENCES "LabBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabFeedback" ADD CONSTRAINT "LabFeedback_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "LabBooking"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LabCart" ADD CONSTRAINT "LabCart_labTest_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LabCart" ADD CONSTRAINT "LabCart_lab_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LabCart" ADD CONSTRAINT "LabCart_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LabPrescription" ADD CONSTRAINT "LabPrescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabCategories" ADD CONSTRAINT "_LabCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabCategories" ADD CONSTRAINT "_LabCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "LabCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

