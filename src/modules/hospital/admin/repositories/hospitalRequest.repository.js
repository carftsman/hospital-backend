// src/modules/hospital/admin/repositories/hospitalRequest.repository.js
import prisma from "../../../../prisma/client.js";

export const createHospitalRequest = (data) => {
  return prisma.hospital.create({
    data: data,
  });
};

export const findPendingRequests = (skip = 0, take = 20) => {
  return prisma.hospital.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    skip,
    take
  });
};

export const updateHospitalStatus = (id, status) => {
  return prisma.hospital.update({
    where: { id: Number(id) },
    data: { status },
  });
};
