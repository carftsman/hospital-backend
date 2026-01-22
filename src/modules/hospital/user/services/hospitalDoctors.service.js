import prisma from "../../../../prisma/client.js";

/* ---------------- FETCH DOCTORS (GLOBAL LIST) ---------------- */
export const fetchDoctors = async (filters, page, limit) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (filters.specialization) {
    where.specialization = {
      contains: filters.specialization,
      mode: "insensitive",
    };
  }

  const rows = await prisma.doctor.findMany({
    skip,
    take: limit,
    where,
    orderBy: { rating: "desc" },

    include: {
      category: true,
      hospital: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          location: true,
          place: true,
          latitude: true,
          longitude: true,
          consultationMode: true,
          isOpen: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({ where });

  return { rows, total };
};


/* ---------------- HOSPITAL DOCTORS ---------------- */
export const fetchHospitalDoctors = async (hospitalId, page, limit) => {
  const skip = (page - 1) * limit;

  const doctors = await prisma.doctor.findMany({
    where: { hospitalId },
    skip,
    take: limit,
    orderBy: { rating: "desc" },

    include: {
      category: true,
    },
  });

  const total = await prisma.doctor.count({ where: { hospitalId } });

  return {
    total,
    count: doctors.length,
    page,
    limit,
    data: doctors,
  };
};


/* ---------------- DOCTOR PROFILE ---------------- */
export const fetchDoctorInfo = async (doctorId) => {
  return prisma.doctor.findUnique({
    where: { id: doctorId },

    include: {
      category: true,

      hospital: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          location: true,
          place: true,
          latitude: true,
          longitude: true,
          consultationMode: true,
          isOpen: true,
        },
      },

      timeSlots: true,
      DoctorAvailability: true,
    },
  });
};


/* ---------------- DOCTOR AVAILABILITY ---------------- */
export const fetchDoctorAvailabilityByDate = async (doctorId, date) => {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  const slots = await prisma.timeSlot.findMany({
    where: {
      doctorId,
      start: { gte: start, lte: end },
    },
    orderBy: { start: "asc" },
  });

  return {
    doctorId,
    date,
    totalSlots: slots.length,
    availableSlots: slots.filter(s => s.isActive).length,
    slots,
  };
};
