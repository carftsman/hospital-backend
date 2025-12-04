import prisma from "../../../../prisma/client.js";

export const createDoctor = (data) => {
  return prisma.doctor.create({
    data,
    select: {
      id: true,
      name: true,
      specialization: true,
      experience: true,
      qualification: true,
      about: true,
      imageUrl: true,
      createdAt: true,
      categoryId: true,
      languages: true,            // NEW
      consultationFee: true       // NEW
    }

  });
};

export const getDoctorsByCategory = (categoryId, hospitalId, skip = 0, take = 20) => {
  return prisma.doctor.findMany({
    where: {
      categoryId: Number(categoryId),
      hospitalId: Number(hospitalId)
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    select: {
      id: true,
      name: true,
      specialization: true,
      experience: true,
      qualification: true,
      about: true,
      imageUrl: true,
      createdAt: true,
      languages: true,           // NEW
      consultationFee: true      // NEW
    }

  });
};

export const updateDoctor = (id, hospitalId, data) => {
  return prisma.doctor.updateMany({
    where: { id: Number(id), hospitalId: Number(hospitalId) },
    data
  });
};

export const deleteDoctor = (id, hospitalId) => {
  return prisma.doctor.deleteMany({
    where: { id: Number(id), hospitalId: Number(hospitalId) }
  });
};

export const getDoctor = (id, hospitalId) => {
  return prisma.doctor.findFirst({
    where: { id: Number(id), hospitalId: Number(hospitalId) },
    select: {
      id: true,
      name: true,
      specialization: true,
      experience: true,
      qualification: true,
      about: true,
      imageUrl: true,
      createdAt: true,
      languages: true,           // NEW
      consultationFee: true      // NEW
    }

  });
};
