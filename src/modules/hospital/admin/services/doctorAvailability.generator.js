import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateDoctorAvailabilityNext14Days() {
  const START_HOUR = 9;   // 9 AM
  const END_HOUR = 21;    // 9 PM
  const SLOT_MINUTES = 30;
  const DAYS = 14;

  const doctors = await prisma.doctor.findMany({
    select: { id: true }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalSlotsCreated = 0;

  for (const doctor of doctors) {
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);

      for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        for (let min = 0; min < 60; min += SLOT_MINUTES) {
          const startTime = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
          const endMinutes = min + SLOT_MINUTES;
          const endHour = hour + Math.floor(endMinutes / 60);
          const endMin = endMinutes % 60;
          const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

          // ⛔ Skip after 9 PM
          if (endHour > END_HOUR || (endHour === END_HOUR && endMin > 0)) {
            continue;
          }

          // 🔍 Check if slot already exists
          const exists = await prisma.doctorAvailability.findFirst({
            where: {
              doctorId: doctor.id,
              date,
              startTime,
              endTime
            }
          });

          if (exists) continue;

          await prisma.doctorAvailability.create({
            data: {
              doctorId: doctor.id,
              date,
              startTime,
              endTime,
              isBooked: false
            }
          });

          totalSlotsCreated++;
        }
      }
    }
  }

  console.log(`✅ DoctorAvailability generated: ${totalSlotsCreated} slots`);
}
