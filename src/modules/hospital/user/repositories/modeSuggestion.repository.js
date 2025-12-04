import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

const modeFilterSql = (mode) => {
  const m = String(mode).toUpperCase();

  if (m === "ALL" || m === "BOTH") return Prisma.empty;

  return Prisma.sql`
    AND (
      h."consultationMode" = ${m}::"ConsultationMode"
      OR h."consultationMode" = 'BOTH'::"ConsultationMode"
    )
  `;
};
export const suggestDoctorsByMode = async (term, limit = 10, mode = "BOTH") => {
  const like = `%${term}%`;
  const modeSql = modeFilterSql(mode);

  return prisma.$queryRaw`
    SELECT DISTINCT d.name
    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    WHERE 
      h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      AND d.name ILIKE ${like}
    ORDER BY d.name ASC
    LIMIT ${limit};
  `;
};
export const suggestHospitalsByMode = async (term, limit = 10, mode = "BOTH") => {
  const like = `${term}%`;
  const modeSql = modeFilterSql(mode);

  return prisma.$queryRaw`
    SELECT DISTINCT h.name
    FROM "Hospital" h
    WHERE 
      h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      AND h.name ILIKE ${like}
    ORDER BY h.name ASC
    LIMIT ${limit};
  `;
};
export const suggestCategoriesByMode = async (term, limit = 10, mode = "BOTH") => {
  const like = `${term}%`;
  const modeSql = modeFilterSql(mode);

  return prisma.$queryRaw`
    SELECT DISTINCT c.name
    FROM "Category" c
    JOIN "Hospital" h ON h.id = c."hospitalId"
    WHERE 
      h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
      AND c.name ILIKE ${like}
    ORDER BY c.name ASC
    LIMIT ${limit};
  `;
};
