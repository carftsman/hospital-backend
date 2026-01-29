import prisma from "../../../../prisma/client.js";

export const generateSlotsIfMissing = async (doctorId, dateStr) => {
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  // 1️⃣ Check if TimeSlots already exist
  const existingCount = await prisma.timeSlot.count({
    where: {
      doctorId,
      start: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  if (existingCount > 0) return;

  // 2️⃣ FETCH AVAILABILITY USING DATE RANGE ✅ FIX
  const availability = await prisma.doctorAvailability.findMany({
    where: {
      doctorId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: { startTime: "asc" }
  });

  if (availability.length === 0) {
    console.log("No DoctorAvailability found for", dateStr);
    return;
  }

  // 3️⃣ Generate 30-min slots
  for (const a of availability) {
    const [startH, startM] = a.startTime.split(":").map(Number);
    const [endH, endM] = a.endTime.split(":").map(Number);

    let slotStart = new Date(startOfDay);
    slotStart.setHours(startH, startM, 0, 0);

    const endTime = new Date(startOfDay);
    endTime.setHours(endH, endM, 0, 0);

    while (slotStart < endTime) {
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      await prisma.timeSlot.create({
        data: {
          doctorId,
          start: slotStart,
          end: slotEnd,
          isActive: true
        }
      });

      slotStart = slotEnd;
    }
  }
};
