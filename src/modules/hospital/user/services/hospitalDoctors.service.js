import prisma from "../../../../prisma/client.js";

/* ---------------- DISTANCE ---------------- */
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
};

export const fetchDoctorsNearby = async (filters, page, limit) => {
  const skip = (page - 1) * limit;
  const where = {};

  /* ---------------- SEARCH ---------------- */
  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }

  /* ---------------- SPECIALIZATION ---------------- */
  if (filters.specialization) {
    where.specialization = {
      equals: filters.specialization,
      mode: "insensitive"
    };
  }

  /* ---------------- CATEGORY ---------------- */
  if (filters.categoryIds?.length) {
    where.categoryId = { in: filters.categoryIds };
  }

  /* ---------------- EXPERIENCE ---------------- */
  if (filters.minExp) {
    where.experience = { gte: filters.minExp };
  }

  /* ---------------- FEE ---------------- */
  if (filters.maxFee) {
    where.consultationFee = { lte: filters.maxFee };
  }

  /* ---------------- WOMEN SAFE ---------------- */
  if (filters.women) {
    where.category = { is: { isWomenSpecific: true } };
  }

  const doctors = await prisma.doctor.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      hospital: true,
      timeSlots: true
    }
  });

  const now = new Date();

  let rows = doctors.map(doc => {
    if (!doc.hospital?.latitude || !doc.hospital?.longitude) return null;

    const dist = distanceKm(
      filters.lat,
      filters.lng,
      doc.hospital.latitude,
      doc.hospital.longitude
    );

    const slots = doc.timeSlots || [];

    const availableNow = slots.some(s => {
      const start = new Date(s.start);
      const end = new Date(s.end);
      return start <= now && end >= now && s.isActive;
    });

    const availableToday = slots.some(
      s => new Date(s.start).toDateString() === now.toDateString()
    );

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const availableTomorrow = slots.some(
      s => new Date(s.start).toDateString() === tomorrow.toDateString()
    );

    const nextSlot = slots
      .filter(s => new Date(s.start) > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))[0];

    return {
      id: doc.id,
      name: doc.name,
      imageUrl: doc.imageUrl,
      experience: doc.experience,
      specialization: doc.specialization,
      consultationFee: Number(doc.consultationFee || 0),
      rating: Number(doc.rating || 0),
      languages: doc.languages,
      distanceKm: dist,

      availability: {
        availableNow,
        availableToday,
        availableTomorrow,
        nextAvailableSlot: nextSlot?.start || null
      },

      category: doc.category,
      hospital: {
        id: doc.hospital.id,
        name: doc.hospital.name,
        imageUrl: doc.hospital.imageUrl,
        location: doc.hospital.location,
        latitude: doc.hospital.latitude,
        longitude: doc.hospital.longitude,
        isOpen: doc.hospital.isOpen
      }
    };
  }).filter(Boolean);

  /* ---------- DISTANCE FILTER ---------- */
  const maxDistance = Math.min(filters.distance || 10, 50);
  rows = rows.filter(d => d.distanceKm <= maxDistance);

  /* ---------- AVAILABILITY FILTER ---------- */
  if (filters.availability === "today")
    rows = rows.filter(d => d.availability.availableToday);

  if (filters.availability === "tomorrow")
    rows = rows.filter(d => d.availability.availableTomorrow);

  if (filters.availability === "now")
    rows = rows.filter(d => d.availability.availableNow);

  /* ================= SORT FIX ================= */
  switch (filters.sort) {
    case "experience_desc":
    case "exp_desc":
      rows.sort((a, b) => b.experience - a.experience);
      break;
case "rating_desc":
    rows.sort((a, b) => b.rating - a.rating); // ⭐ HIGH → LOW
    break;

  case "rating_asc":
    rows.sort((a, b) => a.rating - b.rating); // ⭐ LOW → HIGH
    break;
    case "fee_asc":
      rows.sort((a, b) => a.consultationFee - b.consultationFee);
      break;

    case "fee_desc":
      rows.sort((a, b) => b.consultationFee - a.consultationFee);
      break;

    case "rating_desc":
      rows.sort((a, b) => b.rating - a.rating);
      break;

    case "rating_asc":
      rows.sort((a, b) => a.rating - b.rating);
      break;

    case "distance":
    default:
      rows.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  const total = rows.length;
  return { rows: rows.slice(skip, skip + limit), total };
};

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
    latitude: true,
    longitude: true,
    consultationMode: true,
    isOpen: true,
    rating: true,           // ⭐ ADD
    monSatTiming: true,     // ⭐ ADD
    sundayTiming: true      // ⭐ ADD
  }
}
    }
  });

  const total = await prisma.doctor.count({ where });

  return { rows, total };
};
// services/doctor.service.js



/* ---------------- HOSPITAL DOCTORS ---------------- */
/* ---------------- DOCTOR PROFILE ---------------- */
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

          // ⭐ NEW FIELDS
          rating: true,
          monSatTiming: true,
          sundayTiming: true,
          contactName: true,
          contactNumber: true,
          open24x7: true,
          establishedYear: true,
          city: true,
          state: true
        }
      },

      timeSlots: true,
      availabilities: true,
      Review: true // optional (if showing reviews)
    }
  });
};

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
