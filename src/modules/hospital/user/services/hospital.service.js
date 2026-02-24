// services/hospital.service.js
import prisma from "../../../../prisma/client.js";

/* ==============================
   DISTANCE HELPER
================================ */
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
};

/* =========================================
   NEARBY HOSPITALS WITH ALL FILTERS
========================================= */
export const getNearbyHospitalsWithFilters = async (filters) => {
  const {
    lat,
    lng,
    radius = 10,
    categoryIds = [],
    mode = "BOTH",
    state,
    city,
    openNow,
    open24x7,
    women,
    sort = "distance",
    page = 1,
    limit = 20
  } = filters;

  const skip = (page - 1) * limit;

  const where = {};

  // LOCATION FILTERS
  if (state) where.state = { contains: state, mode: "insensitive" };
  if (city) where.city = { contains: city, mode: "insensitive" };

  // MODE FILTER
  if (mode !== "BOTH") {
    where.consultationMode = { in: [mode, "BOTH"] };
  }

  // AVAILABILITY FILTERS
  if (openNow) where.isOpen = true;
  if (open24x7) where.open24x7 = true;
if (women) {
  where.OR = [
    { isWomenFriendly: true },
    { hasMaternityCare: true }
  ];
}
  // CATEGORY FILTER
  if (categoryIds.length) {
    where.categories = {
      some: { id: { in: categoryIds } }
    };
  }

  // FETCH FROM DB
  const hospitals = await prisma.hospital.findMany({
    where,
    include: {
      categories: {
        select: { id: true, name: true, imageUrl: true }
      }
    }
  });

  // MAP + DISTANCE
  let rows = hospitals.map(h => {
    const dist = distanceKm(lat, lng, h.latitude, h.longitude);

    return {
      id: h.id,
      name: h.name,
      imageUrl: h.imageUrl,
      location: h.location,
      city: h.city,
      state: h.state,
      latitude: h.latitude,
      longitude: h.longitude,
      speciality: h.speciality,
      consultationMode: h.consultationMode,
      isOpen: h.isOpen,
      open24x7: h.open24x7,
      rating: Number(h.rating || 0),
      popularity: Number(h.popularity || 0),
      distance: dist,
      categories: h.categories,
      primaryCategory: h.categories?.[0] || null
    };
  });

  // RADIUS FILTER
  rows = rows.filter(r => r.distance <= radius);

  // SORTING
  if (sort === "rating") {
    rows.sort((a, b) => b.rating - a.rating);
  } else if (sort === "popularity") {
    rows.sort((a, b) => b.popularity - a.popularity);
  } else {
    rows.sort((a, b) => a.distance - b.distance);
  }

  const total = rows.length;
  const paginated = rows.slice(skip, skip + limit);

  return { hospitals: paginated, total };
};

/* ======================================================
   HOSPITALS BY CATEGORY
====================================================== */
export const getHospitalsByCategory = async (
  categoryId,
  mode,
  lat,
  lng,
  page,
  limit
) => {
  const skip = (page - 1) * limit;

  const hospitals = await prisma.hospital.findMany({
    where: {
      consultationMode: { in: [mode, "BOTH"] },
      categories: {
        some: { id: categoryId }
      }
    },
    include: {
      categories: {
        select: { id: true, name: true }
      }
    }
  });

  const mapped = hospitals.map(h => ({
    ...h,
    distance: distanceKm(lat, lng, h.latitude, h.longitude)
  }));

  mapped.sort((a, b) => a.distance - b.distance);

  const total = mapped.length;
  const paginated = mapped.slice(skip, skip + limit);

  return { hospitals: paginated, total };
};

/* ======================================================
   HOSPITALS BY MODE
====================================================== */
export const getHospitalsByMode = async (mode, lat, lng, page, limit) => {
  const skip = (page - 1) * limit;

  const hospitals = await prisma.hospital.findMany({
    where: {
      consultationMode: { in: [mode, "BOTH"] }
    }
  });

  const mapped = hospitals.map(h => ({
    ...h,
    distance: distanceKm(lat, lng, h.latitude, h.longitude)
  }));

  mapped.sort((a, b) => a.distance - b.distance);

  const total = mapped.length;
  const paginated = mapped.slice(skip, skip + limit);

  return { hospitals: paginated, total };
};