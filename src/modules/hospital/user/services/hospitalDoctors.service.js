import prisma from "../../../../prisma/client.js";

/* ---------------- FETCH DOCTORS (GLOBAL LIST) ---------------- */
export const fetchDoctors = async (filters, page, limit) => {
  const skip = (page - 1) * limit;

const where = {
    ...(filters.specialization
      ? {
          specialization: {
            contains: filters.specialization,
            mode: "insensitive"
          }
        }
      : {}),
    ...(filters.women
      ? {
          category: {
            isWomenSpecific: true
          }
        }
      : {})
  };
    

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
export const fetchHospitalDoctors = async (
  hospitalId,
  page = 1,
  limit = 10,
  mode = null,
  specialization = null,   // NEW
  search = null,      // NEW
  women = false,    // NEW
  symptomId = null   // NEW
) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (safePage - 1) * safeLimit;

  let modeFilter = {};

  if (mode === "ONLINE") {
    modeFilter = { in: ["ONLINE", "BOTH"] };
  } else if (mode === "OFFLINE") {
    modeFilter = { in: ["OFFLINE", "BOTH"] };
  } else if (mode === "BOTH") {
    modeFilter = { equals: "BOTH" };
  }

  /* ---------------- WHERE CONDITION ---------------- */
  const where = {
    hospitalId,
    ...(mode ? { consultationMode: modeFilter } : {}),
    ...(specialization
      ? {
          specialization: {
            contains: specialization,
            mode: "insensitive" //case-insensitive
          }
        }
      : {}),
      ...(search
    ? {
        name: {
          contains: search,
          mode: "insensitive" // doctor name search
        }
      }
    : {}),
    ...(women
      ? {
          category: {
            isWomenSpecific: true
          }
        }
      : {}),
    ...(symptomId
      ? {
          DoctorSymptom: {
            some: {
              symptomId: Number(symptomId)
            }
          }
        }
      : {}) 
  };

 /* ---------------- MAIN QUERY ---------------- */
  const doctors = await prisma.doctor.findMany({
    where,
    skip,
    take: safeLimit,
    orderBy: { rating: "desc" },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      },
      hospital: {
        select: {
          id: true,
          name: true,
          location: true,
          place: true, latitude: true,
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

  const total = await prisma.doctor.count({
    where
  });

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
