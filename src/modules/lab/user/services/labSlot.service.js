import { findSlotsByLabAndDate } from "../repositories/labSlot.repository.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLabSlotsService = async (labId, date) => {
  const slots = await findSlotsByLabAndDate(labId, date);

  return slots.map(slot => ({
    id: slot.id,
    startTime: slot.startTime.toISOString().slice(11, 16),
    endTime: slot.endTime.toISOString().slice(11, 16),
    isBooked: slot.isBooked
  }));
};

export const generate14DaysSlots = async (labId) => {

  const lab = await prisma.lab.findUnique({
    where: { id: labId }
  });

  if (!lab || !lab.openTime || !lab.closeTime) {
    throw new Error("Lab working hours not configured");
  }

  const today = new Date();
  let createdSlots = 0;

  for (let i = 0; i < 14; i++) {

    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    let start = new Date(`1970-01-01T${lab.openTime.toISOString().substring(11,19)}`);
    const close = new Date(`1970-01-01T${lab.closeTime.toISOString().substring(11,19)}`);

    while (start < close) {

      const end = new Date(start.getTime() + lab.slotDuration * 60000);

      try {
        await prisma.labSlot.create({
          data: {
            labId,
            slotDate: currentDate,
            startTime: start,
            endTime: end
          }
        });

        createdSlots++;

      } catch (error) {
        // Ignore duplicate unique constraint errors
      }

      start = end;
    }
  }

  return {
    message: "Slots generated successfully",
    totalCreated: createdSlots
  };
};
