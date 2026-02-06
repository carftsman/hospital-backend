import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

/* ---------------- MODE FILTER ---------------- */

const modeFilterSql = (mode) => {
  const m = String(mode).toUpperCase();

  if (m === "BOTH") return Prisma.empty;

  if (m === "ONLINE" || m === "OFFLINE") {
    return Prisma.sql`
      AND (
        h."consultationMode" = ${m}::"ConsultationMode"
        OR h."consultationMode" = 'BOTH'::"ConsultationMode"
      )
    `;
  }

  return Prisma.empty;
};

/* ---------------- WOMEN FILTER ---------------- */

const womenFilterSql = (women) => {
  if (women === true) {
    return Prisma.sql`AND c."isWomenSpecific" = true`;
  }
  return Prisma.empty;
};

/* ---------------- DOCTORS BY HOSPITAL ---------------- */

export const getDoctorsByHospital = async (hospitalId, mode, offset, limit,  women = false,
  symptomId = null) => {
  const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const modeSql = modeFilterSql(mode);
  const womenSql = womenFilterSql(women);

const symptomJoinSql = symptomId
  ? Prisma.sql`JOIN "DoctorSymptom" ds ON ds."doctorId" = d.id`
  : Prisma.empty;

const symptomWhereSql = symptomId
  ? Prisma.sql`AND ds."symptomId" = ${symptomId}`
  : Prisma.empty;   

  return prisma.$queryRaw`
    SELECT
      d.id AS "doctorId",
      d.name AS "doctorName",
      d."imageUrl" AS "doctorImage",
      d.experience,
      d.specialization,
      d.qualification,
      d.about,
      d.languages,
      d."consultationFee",
      d."createdAt",
      h.id AS "hospitalId",
      h.name AS "hospitalName",
      h."imageUrl" AS "hospitalImage",
      h.location AS "hospitalLocation",
      h.place AS "hospitalPlace",
      h.latitude,
      h.longitude,
      h."isOpen",
      h."consultationMode" AS "hospitalMode"
    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    ${symptomJoinSql}
    WHERE
      h.id = ${hospitalId}
      AND h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      ${womenSql}                     //NEW
      ${symptomWhereSql}              //new
    ORDER BY d.name ASC
    LIMIT ${safeLimit}
    OFFSET ${safeOffset};
  `;
};


export const countDoctorsByHospital = async (hospitalId, mode, women = false, symptomId = null) => {
  const modeSql = modeFilterSql(mode);
  const womenSql = womenFilterSql(women);

  const symptomJoinSql = symptomId
  ? Prisma.sql`JOIN "DoctorSymptom" ds ON ds."doctorId" = d.id`
  : Prisma.empty;

  const symptomWhereSql = symptomId
  ? Prisma.sql`AND ds."symptomId" = ${symptomId}`
  : Prisma.empty;

  const rows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    JOIN "Category" c ON c."hospitalId" = h.id
    ${symptomJoinSql}
    WHERE
      h.id = ${hospitalId}
      AND h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      ${womenSql}
      ${symptomWhereSql}
  `;

  return rows?.[0]?.count ?? 0;
};


/* ---------------- GLOBAL DOCTORS ---------------- */

export const getDoctors = async (filters, offset, limit) => {
  const safeOffset = Math.max(0, offset);
  const safeLimit = Math.max(1, limit);

  const { lat, lng, distance, specialization } = filters;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const specializationFilter = specialization
    ? Prisma.sql`AND d.specialization ILIKE ${'%' + specialization + '%'}`
    : Prisma.empty;

  const distanceFilter =
    hasCoords && Number.isFinite(distance)
      ? Prisma.sql`
          AND (
            6371 * acos(
              cos(radians(${lat}))
              * cos(radians(h.latitude))
              * cos(radians(h.longitude) - radians(${lng}))
              + sin(radians(${lat}))
              * sin(radians(h.latitude))
            )
          ) <= ${distance}
        `
      : Prisma.empty;

  return prisma.$queryRaw`
    SELECT
      d.id AS "doctorId",
      d.name AS "doctorName",
      d.specialization,
      d.experience,
      d."consultationFee",
      d.languages,
      h.id AS "hospitalId",
      h.name AS "hospitalName",
      h.place,
      h."consultationMode",
      h."isOpen"
      ${hasCoords ? Prisma.sql`, (
        6371 * acos(
          cos(radians(${lat}))
          * cos(radians(h.latitude))
          * cos(radians(h.longitude) - radians(${lng}))
          + sin(radians(${lat}))
          * sin(radians(h.latitude))
        )
      ) AS distance` : Prisma.empty}
    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND h.latitude IS NOT NULL
      AND h.longitude IS NOT NULL
      ${specializationFilter}
      ${distanceFilter}
    ORDER BY ${hasCoords ? Prisma.sql`distance ASC` : Prisma.sql`d.name ASC`}
    LIMIT ${safeLimit}
    OFFSET ${safeOffset};
  `;
};

export const countDoctors = async (filters) => {
  const { lat, lng, distance, specialization } = filters;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const specializationFilter = specialization
    ? Prisma.sql`AND d.specialization ILIKE ${'%' + specialization + '%'}`
    : Prisma.empty;

  const distanceFilter =
    hasCoords && Number.isFinite(distance)
      ? Prisma.sql`
          AND (
            6371 * acos(
              cos(radians(${lat}))
              * cos(radians(h.latitude))
              * cos(radians(h.longitude) - radians(${lng}))
              + sin(radians(${lat}))
              * sin(radians(h.latitude))
            )
          ) <= ${distance}
        `
      : Prisma.empty;

  const rows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND h.latitude IS NOT NULL
      AND h.longitude IS NOT NULL
      ${specializationFilter}
      ${distanceFilter};
  `;

  return rows?.[0]?.count ?? 0;
};

export const getDoctorById = async (doctorId) => {
  const rows = await prisma.$queryRaw`
    SELECT
      d.id AS "doctorId",
      d.name AS "doctorName",
      d."imageUrl",
      d.specialization,
      d.qualification,
      d.experience,
      d.about,
      d.languages,
      d."consultationFee",
      d."createdAt",

      h.id AS "hospitalId",
      h.name AS "hospitalName",
      h."imageUrl" AS "hospitalImage",
      h.location,
      h.place,
      h.latitude,
      h.longitude,
      h."consultationMode",
      h."isOpen"

    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    WHERE
      d.id = ${doctorId}
      AND h.status = 'APPROVED'
      AND h."isListed" = true
    LIMIT 1;
  `;

  return rows?.[0] ?? null;
};

export const getDoctorAvailabilityByDate = async (doctorId, date) => {
  return prisma.$queryRaw`
    SELECT
      id,
      "startTime",
      "endTime",
      "isBooked"
    FROM "DoctorAvailability"
    WHERE
      "doctorId" = ${doctorId}
      AND DATE("date") = DATE(${date})
    ORDER BY "startTime" ASC;
  `;
};