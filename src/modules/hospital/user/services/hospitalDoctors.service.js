import prisma from "../../../../prisma/client.js";

/* ---------------- FETCH DOCTORS (GLOBAL LIST) ---------------- */
export const fetchDoctors = async (filters, page, limit) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (filters.specialization) {
    where.specialization = filters.specialization;
  }

  const rows = await prisma.doctor.findMany({
    skip,
    take: limit,
    where,
    orderBy: {
      rating: "desc", // ⭐ Top rated first
    },
    select: {
      id: true,
      name: true,
      specialization: true,
      experience: true,
      consultationFee: true,
      languages: true,
      rating: true, // ⭐
      hospital: {
        select: {
          id: true,
          name: true,
          place: true,
          isOpen: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({ where });

  return { rows, total };
};

/* ---------------- HOSPITAL DOCTORS ---------------- */
export const fetchHospitalDoctors = async (hospitalId, mode, distance, page, limit) => {
  const skip = (page - 1) * limit;

  const doctors = await prisma.doctor.findMany({
    where: { hospitalId },
    skip,
    take: limit,
    orderBy: { rating: "desc" }, // ⭐
    select: {
      id: true,
      name: true,
      imageUrl: true,
      specialization: true,
      experience: true,
      consultationFee: true,
      rating: true, // ⭐
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
    select: {
      id: true,
      name: true,
      imageUrl: true,
      specialization: true,
      qualification: true,
      experience: true,
      about: true,
      languages: true,
      consultationFee: true,
      rating: true, // ⭐
      createdAt: true,
      hospital: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          location: true,
          place: true,
          latitude: true,
          longitude: true,
          isOpen: true,
        },
      },
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
    slots: slots.map(s => ({
      id: s.id,
      startTime: s.start.toISOString().substring(11, 16),
      endTime: s.end.toISOString().substring(11, 16),
      isBooked: !s.isActive,
    })),
  };
};
