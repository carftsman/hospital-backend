// src/modules/user/services/nearby.service.js
import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

export const findNearbyHospitals = async (
  userLat,
  userLng,
  radiusKm = 10,
  page = 1,
  limit = 20,
  onlyOpen = false
) => {
  const offset = (page - 1) * limit;
  const earthRadiusKm = 6371;

  const latDelta = radiusKm / 111.32;
  const lngDelta = Math.abs(radiusKm / (111.32 * Math.cos((userLat * Math.PI) / 180)));

  const minLat = userLat - latDelta;
  const maxLat = userLat + latDelta;
  const minLng = userLng - lngDelta;
  const maxLng = userLng + lngDelta;

  const hospitals = await prisma.$queryRaw`
    SELECT *
    FROM (
      SELECT 
        id,
        name,
        location,
        place,
        "imageUrl",
        "speciality",
        "consultationMode",
        latitude,
        longitude,
        "isOpen",
        (
          ${earthRadiusKm} * acos(
            cos(radians(${userLat})) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(${userLng}))
            + sin(radians(${userLat})) * sin(radians(latitude))
          )
        ) AS distance
      FROM "Hospital"
      WHERE 
        "isListed" = true
        AND "status" = 'APPROVED'
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND latitude BETWEEN ${minLat} AND ${maxLat}
        AND longitude BETWEEN ${minLng} AND ${maxLng}
        ${onlyOpen ? Prisma.sql`AND "isOpen" = true` : Prisma.empty}
    ) AS sub
    WHERE sub.distance <= ${radiusKm}
    ORDER BY sub.distance ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;

  const totalCountRows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM (
      SELECT 
        (
          ${earthRadiusKm} * acos(
            cos(radians(${userLat})) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(${userLng}))
            + sin(radians(${userLat})) * sin(radians(latitude))
          )
        ) AS distance
      FROM "Hospital"
      WHERE 
        "isListed" = true
        AND "status" = 'APPROVED'
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND latitude BETWEEN ${minLat} AND ${maxLat}
        AND longitude BETWEEN ${minLng} AND ${maxLng}
        ${onlyOpen ? Prisma.sql`AND "isOpen" = true` : Prisma.empty}
    ) AS sub2
    WHERE sub2.distance <= ${radiusKm};
  `;

  const total = totalCountRows && totalCountRows[0] ? Number(totalCountRows[0].count) : 0;

  return { hospitals, total };
};
