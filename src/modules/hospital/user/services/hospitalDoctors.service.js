import prisma from "../../../../prisma/client.js";

/* ---------------- FETCH DOCTORS (GLOBAL LIST) ---------------- */
export const fetchDoctors = async (filters, page, limit) => {
  const skip = (page - 1) * limit;

  const where = {};

  // Category-based specialization
  if (filters.specialization || filters.women) {
    where.category = {
      is: {
        ...(filters.specialization && {
          name: {
            contains: filters.specialization,
            mode: "insensitive"
          }
        }),
        ...(filters.women && {
          isWomenSpecific: true
        })
      }
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
          isOpen: true
        }
      }
    }
  });

  const total = await prisma.doctor.count({ where });

  return { rows, total };
};


/* ---------------- HOSPITAL DOCTORS ---------------- */
export const fetchHospitalDoctors = async (
  hospitalId,
  page = 1,
  limit = 10,
  mode = null,
  specialization = null,
  search = null,
  women = false,
  symptomId = null
) => {
  const safePage = Math.max(1, Number(page));
  const safeLimit = Math.min(50, Math.max(1, Number(limit)));
  const skip = (safePage - 1) * safeLimit;

  const where = { hospitalId };

  // 🔍 Doctor name search
  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive"
    };
  }

  // 👩 Category filters
  if (specialization || women) {
    where.category = {
      is: {
        ...(specialization && {
          name: {
            contains: specialization,
            mode: "insensitive"
          }
        }),
        ...(women && {
          isWomenSpecific: true
        })
      }
    };
  }

  // 🧬 Symptom filter
  if (symptomId) {
    where.DoctorSymptom = {
      some: {
        symptomId: Number(symptomId)
      }
    };
  }

  // 🏥 Mode filter (IMPORTANT – now actually used)
  if (mode === "ONLINE") {
    where.hospital = {
      consultationMode: { in: ["ONLINE", "BOTH"] }
    };
  } else if (mode === "OFFLINE") {
    where.hospital = {
      consultationMode: { in: ["OFFLINE", "BOTH"] }
    };
  }

  const doctors = await prisma.doctor.findMany({
    where,
    skip,
    take: safeLimit,
    orderBy: { rating: "desc" },
    include: {
      category: {
        select: { id: true, name: true }
      },
      hospital: {
        select: {
          id: true,
          name: true,
          location: true,
          place: true,
          latitude: true,
          longitude: true,
          consultationMode: true,
          city: true,
          contactName: true,
          contactNumber: true,
          imageUrl: true,
          rating: true
        }
      }
    }
  });

  const total = await prisma.doctor.count({ where });

  return {
    total,
    count: doctors.length,
    page: safePage,
    limit: safeLimit,
    data: doctors
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
      availabilities: true,
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
