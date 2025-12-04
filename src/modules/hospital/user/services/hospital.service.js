import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

export const getHospitalsByCategory = async (
  categoryId,
  mode,
  userLat,
  userLng,
  page,
  limit
) => {
  const offset = (page - 1) * limit;
  const earthRadiusKm = 6371;

  const hospitalModeCondition =
    mode === "ONLINE"
      ? Prisma.sql`(h."consultationMode" = 'ONLINE' OR h."consultationMode" = 'BOTH')`
      : Prisma.sql`(h."consultationMode" = 'OFFLINE' OR h."consultationMode" = 'BOTH')`;

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
        h."isOpen",
        h.latitude,
        h.longitude,

        (
          ${earthRadiusKm} * acos(
            cos(radians(${userLat})) * cos(radians(h.latitude))
            * cos(radians(h.longitude) - radians(${userLng}))
            + sin(radians(${userLat})) * sin(radians(h.latitude))
          )
        ) AS distance

      FROM "Hospital" h
      JOIN "Category" c ON c."hospitalId" = h.id
      WHERE 
        c.id = ${categoryId}
        AND h.status = 'APPROVED'
        AND h."isListed" = true
        AND h.latitude IS NOT NULL
        AND h.longitude IS NOT NULL
        AND ${hospitalModeCondition}
    ) AS sub
    ORDER BY sub.distance ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;

  const countRows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM "Hospital" h
    JOIN "Category" c ON c."hospitalId" = h.id
    WHERE 
      c.id = ${categoryId}
      AND h.status = 'APPROVED'
      AND h."isListed" = true
      AND h.latitude IS NOT NULL
      AND h.longitude IS NOT NULL
      AND ${hospitalModeCondition};
  `;

  return {
    hospitals: rows,
    total: countRows?.[0]?.count || 0
  };
};


export const getHospitalsByMode = async (
  mode = "ONLINE",
  userLat,
  userLng,
  page = 1,
  limit = 20
) => {
  const offset = (page - 1) * limit;
  const earthRadiusKm = 6371;

  const hospitalModeCondition =
    mode === "ONLINE"
      ? Prisma.sql`(h."consultationMode" = 'ONLINE' OR h."consultationMode" = 'BOTH')`
      : mode === "OFFLINE"
      ? Prisma.sql`(h."consultationMode" = 'OFFLINE' OR h."consultationMode" = 'BOTH')`
      : Prisma.sql`h."consultationMode" IN ('ONLINE', 'OFFLINE', 'BOTH')`;

  const rows = await prisma.$queryRaw`
    SELECT *
    FROM (
      SELECT
        h.id,
        h.name,
        h."imageUrl",
        h.location,
        h.place,
        h.speciality,
        h.latitude,
        h.longitude,
        h."isOpen",

        (
          ${earthRadiusKm} * acos(
            cos(radians(${userLat}))
            * cos(radians(h.latitude))
            * cos(radians(h.longitude) - radians(${userLng}))
            + sin(radians(${userLat}))
            * sin(radians(h.latitude))
          )
        ) AS distance

      FROM "Hospital" h
      WHERE
        h.status = 'APPROVED'
        AND h."isListed" = true
        AND h.latitude IS NOT NULL
        AND h.longitude IS NOT NULL
        AND ${hospitalModeCondition}
    ) AS sub
    ORDER BY sub.distance ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;

  const totalRows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM "Hospital" h
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND h.latitude IS NOT NULL
      AND h.longitude IS NOT NULL
      AND ${hospitalModeCondition};
  `;

  return {
    hospitals: rows,
    total: totalRows?.[0]?.count || 0
  };
};
