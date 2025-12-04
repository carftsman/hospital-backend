import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

export const getCategoriesByMode = async (mode = "ONLINE", page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const timeslotModeCondition =
    mode === "ONLINE"
      ? Prisma.sql`(t."consultationMode" = 'ONLINE' OR t."consultationMode" = 'BOTH')`
      : Prisma.sql`(t."consultationMode" = 'OFFLINE' OR t."consultationMode" = 'BOTH')`;

  const hospitalModeCondition =
    mode === "ONLINE"
      ? Prisma.sql`(h."consultationMode" = 'ONLINE' OR h."consultationMode" = 'BOTH')`
      : Prisma.sql`(h."consultationMode" = 'OFFLINE' OR h."consultationMode" = 'BOTH')`;

  const rows = await prisma.$queryRaw`
    SELECT DISTINCT
      c.id,
      c.name,
      c."imageUrl",
      c.description
    FROM "Category" c
    JOIN "Hospital" h ON h.id = c."hospitalId"
    JOIN "Doctor" d ON d."categoryId" = c.id
    JOIN "TimeSlot" t ON t."doctorId" = d.id
    WHERE 
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND ${hospitalModeCondition}
      AND ${timeslotModeCondition}
      AND t."isActive" = true
    ORDER BY c.name ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;

  const countRows = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT c.id)::int AS count
    FROM "Category" c
    JOIN "Hospital" h ON h.id = c."hospitalId"
    JOIN "Doctor" d ON d."categoryId" = c.id
    JOIN "TimeSlot" t ON t."doctorId" = d.id
    WHERE 
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND ${hospitalModeCondition}
      AND ${timeslotModeCondition}
      AND t."isActive" = true;
  `;

  const total = countRows?.[0]?.count || 0;
  return { categories: rows, total };
};
