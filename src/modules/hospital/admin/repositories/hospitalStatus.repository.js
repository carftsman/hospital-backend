import prisma from "../../../../prisma/client.js";

export const findHospitalsByStatus = (status, skip = 0, take = 20) => {
  return prisma.hospital.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    select: {
      id: true,
      name: true,
      location: true,
      place: true,
      imageUrl: true,
      speciality: true,
      isOpen: true,
      isListed: true,
      latitude: true,
      longitude: true,
      createdAt: true,
    }
  });
};
