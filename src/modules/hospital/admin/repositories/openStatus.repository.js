// src/modules/hospital/admin/repositories/openStatus.repository.js

import prisma from "../../../../prisma/client.js";

// Read-only fetch of hospital open status
export const fetchHospitalOpenStatus = (id) => {
  return prisma.hospital.findUnique({
    where: { id },
    select: { isOpen: true }
  });
};

export const updateHospitalOpenStatus = (id, isOpen) => {
  return prisma.hospital.update({
    where: { id },
    data: { isOpen },
    select: {
      id: true,
      isOpen: true
    }
  });
};

