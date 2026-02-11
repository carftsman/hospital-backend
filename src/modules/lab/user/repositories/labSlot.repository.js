import prisma from "../../../../prisma/client.js";

export const findSlotsByLabAndDate = async (labId, date) => {
  return prisma.labSlot.findMany({
    where: {
      labId,
      slotDate: new Date(date)
    },
    orderBy: {
      startTime: "asc"
    }
  });
};
