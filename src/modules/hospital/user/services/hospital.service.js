import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

const EARTH_RADIUS_KM = 6371;


export const getNearbyHospitalsWithFilters = async (
  lat,
  lng,
  radius,
  categoryIds = [],
  mode = "BOTH",
  openNow = false,
  page = 1,
  limit = 20
) => {
  const offset = (page - 1) * limit;

  // MODE
  const modeCondition =
    mode === "ONLINE"
      ? Prisma.sql`AND (h."consultationMode" = 'ONLINE' OR h."consultationMode" = 'BOTH')`
      : mode === "OFFLINE"
      ? Prisma.sql`AND (h."consultationMode" = 'OFFLINE' OR h."consultationMode" = 'BOTH')`
      : Prisma.sql``;

  // OPEN NOW
  const openCondition = openNow
    ? Prisma.sql`AND h."isOpen" = true`
    : Prisma.sql``;

  // CATEGORY (one hospital → many categories)
  const categoryJoin =
    categoryIds.length > 0
      ? Prisma.sql`
          JOIN "Category" c
            ON c."hospitalId" = h.id
           AND c.id IN (${Prisma.join(categoryIds)})
        `
      : Prisma.sql``;

  // DATA QUERY
  const hospitals = await prisma.$queryRaw`
    SELECT *
    FROM (
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

        (
          ${EARTH_RADIUS_KM} * acos(
            cos(radians(${lat}))
            * cos(radians(h.latitude))
            * cos(radians(h.longitude) - radians(${lng}))
            + sin(radians(${lat})) * sin(radians(h.latitude))
          )
        ) AS distance

      FROM "Hospital" h
      ${categoryJoin}
      WHERE
        h.status = 'APPROVED'
        AND h."isListed" = true
        AND h.latitude IS NOT NULL
        AND h.longitude IS NOT NULL
        ${modeCondition}
        ${openCondition}
    ) sub
    WHERE distance <= ${radius}
    ORDER BY distance ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;

  // COUNT QUERY (🔥 SAME FILTERS)
  const countRows = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT h.id)::int AS count
    FROM "Hospital" h
    ${categoryJoin}
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND h.latitude IS NOT NULL
      AND h.longitude IS NOT NULL
      ${modeCondition}
      ${openCondition}
      AND (
        ${EARTH_RADIUS_KM} * acos(
          cos(radians(${lat}))
          * cos(radians(h.latitude))
          * cos(radians(h.longitude) - radians(${lng}))
          + sin(radians(${lat})) * sin(radians(h.latitude))
        )
      ) <= ${radius};
  `;

  return {
    hospitals,
    total: countRows?.[0]?.count || 0
  };
};

export const getHospitalsByMode = async (
  mode,
  userLat,
  userLng,
  page,
  limit
) => {
  const offset = (page - 1) * limit;

  const hospitalModeCondition =
    mode === "ONLINE"
      ? Prisma.sql`(h."consultationMode" = 'ONLINE' OR h."consultationMode" = 'BOTH')`
      : mode === "OFFLINE"
      ? Prisma.sql`(h."consultationMode" = 'OFFLINE' OR h."consultationMode" = 'BOTH')`
      : Prisma.sql`h."consultationMode" IN ('ONLINE','OFFLINE','BOTH')`;

  const rows = await prisma.$queryRaw`
    SELECT *
    FROM (
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
        (
          ${EARTH_RADIUS_KM} * acos(
            cos(radians(${userLat}))
            * cos(radians(h.latitude))
            * cos(radians(h.longitude) - radians(${userLng}))
            + sin(radians(${userLat})) * sin(radians(h.latitude))
          )
        ) AS distance
      FROM "Hospital" h
      WHERE
        h.status = 'APPROVED'
        AND h."isListed" = true
        AND h.latitude IS NOT NULL
        AND h.longitude IS NOT NULL
        AND ${hospitalModeCondition}
    ) sub
    ORDER BY distance ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;

  return {
    hospitals: rows,
    total: rows.length
  };
};
