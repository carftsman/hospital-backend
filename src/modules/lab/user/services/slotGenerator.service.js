import prisma from "../../../../prisma/client.js";

export const generateSlotsForLab = async (labId) => {
  const lab = await prisma.lab.findUnique({
    where: { id: labId }
  });

  if (!lab.openTime || !lab.closeTime) {
    throw new Error("Lab working hours not configured");
  }

  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    let start = new Date(`1970-01-01T${lab.openTime.toISOString().substring(11,19)}`);
    const end = new Date(`1970-01-01T${lab.closeTime.toISOString().substring(11,19)}`);

    while (start < end) {
      const slotEnd = new Date(start.getTime() + lab.slotDuration * 60000);

      await prisma.labSlot.create({
        data: {
          labId,
          slotDate: date,
          startTime: start,
          endTime: slotEnd
        }
      });

      start = slotEnd;
    }
  }
};
