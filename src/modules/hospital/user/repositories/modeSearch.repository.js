import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

const earthRadiusKm = 6371;

// helper: if mode !== 'ALL' produce SQL fragment, else Prisma.empty
// helper: if mode !== 'ALL' produce SQL fragment, else Prisma.empty
const modeFilterSql = (mode) => {
  if (!mode) return Prisma.empty;
  const mm = String(mode).toUpperCase();

  // treat ALL/BOTH as no-op (don't filter)
  if (mm === "ALL" || mm === "BOTH") return Prisma.empty;

  // for ONLINE or OFFLINE, include BOTH as a match too
  if (mm === "ONLINE" || mm === "OFFLINE") {
    return Prisma.sql`
      AND (
        h."consultationMode" = ${mm}::"ConsultationMode"
        OR h."consultationMode" = ${"BOTH"}::"ConsultationMode"
      )
    `;
  }

  // fallback - no filter
  return Prisma.empty;
};


// NOTE: caller is responsible for passing sanitized term like `%...%`
export const searchDoctors = async (term, mode = "ALL", lat, lng, offset, limit) => {
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  const modeSql = modeFilterSql(mode);

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
      h.id AS "hospitalId",
      h.name AS "hospitalName",
      h."imageUrl" AS "hospitalImage",
      h.location AS "hospitalLocation",
      h.place AS "hospitalPlace",
      h.latitude,
      h.longitude,
      h."isOpen",
      h."consultationMode" AS "hospitalMode"

      ${hasCoords ? Prisma.sql`, (${earthRadiusKm} * acos(
        cos(radians(${lat})) * cos(radians(h.latitude)) *
        cos(radians(h.longitude) - radians(${lng}))
        + sin(radians(${lat})) * sin(radians(h.latitude))
      )) AS distance` : Prisma.empty}
    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      AND (
        d.name ILIKE ${term}
        OR d.specialization ILIKE ${term}
        OR d.qualification ILIKE ${term}
      )
    ${hasCoords ? Prisma.sql`ORDER BY distance ASC` : Prisma.sql`ORDER BY d.name ASC`}
    LIMIT ${limit}
    OFFSET ${offset};
  `;
};

export const countDoctors = async (term, mode = "ALL") => {
  const modeSql = modeFilterSql(mode);

  const rows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      AND (
        d.name ILIKE ${term}
        OR d.specialization ILIKE ${term}
        OR d.qualification ILIKE ${term}
      );
  `;
  return rows?.[0]?.count || 0;
};

export const searchHospitals = async (term, mode = "ALL", lat, lng, offset, limit) => {
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  const modeSql = modeFilterSql(mode);

  if (hasCoords) {
    return prisma.$queryRaw`
      SELECT
        h.id,
        h.name,
        h."imageUrl",
        h.speciality,
        h.location,
        h.place,
        h.latitude,
        h.longitude,
        h."isOpen",
        h."consultationMode",
        (${earthRadiusKm} * acos(
          cos(radians(${lat})) * cos(radians(h.latitude)) *
          cos(radians(h.longitude) - radians(${lng}))
          + sin(radians(${lat})) * sin(radians(h.latitude))
        )) AS distance
      FROM "Hospital" h
      WHERE
        h.status = 'APPROVED'
        AND h."isListed" = true
        ${modeSql}
        AND (
          h.name ILIKE ${term}
          OR h.location ILIKE ${term}
          OR h.speciality ILIKE ${term}
        )
      ORDER BY distance ASC
      LIMIT ${limit} OFFSET ${offset};
    `;
  }

  return prisma.$queryRaw`
    SELECT
      h.id,
      h.name,
      h."imageUrl",
      h.speciality,
      h.location,
      h.place,
      h.latitude,
      h.longitude,
      h."isOpen",
      h."consultationMode"

    FROM "Hospital" h
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      AND (
        h.name ILIKE ${term}
        OR h.location ILIKE ${term}
        OR h.speciality ILIKE ${term}
      )
    ORDER BY h.name ASC
    LIMIT ${limit} OFFSET ${offset};
  `;
};

export const countHospitals = async (term, mode = "ALL") => {
  const modeSql = modeFilterSql(mode);

  const rows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM "Hospital" h
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      AND (
        h.name ILIKE ${term}
        OR h.location ILIKE ${term}
        OR h.speciality ILIKE ${term}
      );
  `;
  return rows?.[0]?.count || 0;
};

export const searchHospitalsByCategory = async (term, mode = "ALL", lat, lng, offset, limit) => {
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  const modeSql = modeFilterSql(mode);

  if (hasCoords) {
    return prisma.$queryRaw`
      SELECT DISTINCT
        h.id,
        h.name,
        h."imageUrl",
        h.speciality,
        h.location,
        h.place,
        h.latitude,
        h.longitude,
        h."isOpen",
        h."consultationMode",
        (${earthRadiusKm} * acos(
          cos(radians(${lat})) * cos(radians(h.latitude)) *
          cos(radians(h.longitude) - radians(${lng}))
          + sin(radians(${lat})) * sin(radians(h.latitude))
        )) AS distance
      FROM "Category" c
      JOIN "Hospital" h ON h.id = c."hospitalId"
      WHERE
        h.status = 'APPROVED'
        AND h."isListed" = true
        ${modeSql}
        AND c.name ILIKE ${term}
      ORDER BY distance ASC
      LIMIT ${limit} OFFSET ${offset};
    `;
  }

  return prisma.$queryRaw`
    SELECT DISTINCT
      h.id,
      h.name,
      h."imageUrl",
      h.speciality,
      h.location,
      h.place,
      h.latitude,
      h.longitude,
      h."isOpen",
      h."consultationMode"
    FROM "Category" c
    JOIN "Hospital" h ON h.id = c."hospitalId"
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      AND c.name ILIKE ${term}
    ORDER BY h.name ASC
    LIMIT ${limit} OFFSET ${offset};
  `;
};

export const countHospitalsByCategory = async (term, mode = "ALL") => {
  const modeSql = modeFilterSql(mode);

  const rows = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT h.id)::int AS count
    FROM "Category" c
    JOIN "Hospital" h ON h.id = c."hospitalId"
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      AND c.name ILIKE ${term};
  `;
  return rows?.[0]?.count || 0;
};

// SYMPTOM SEARCH

export const searchSymptoms = async (term, offset, limit) => {
  return prisma.$queryRaw`
    SELECT
      s.id,
      s.name,
      s."imageUrl",
      c.id AS "categoryId",
      c.name AS "categoryName"
    FROM "Symptom" s
    JOIN "Category" c ON c.id = s."categoryId"
    WHERE s.name ILIKE ${term}
    ORDER BY s.name ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;
};

export const countSymptoms = async (term) => {
  const rows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM "Symptom" s
    WHERE s.name ILIKE ${term};
  `;
  return rows?.[0]?.count || 0;
};
