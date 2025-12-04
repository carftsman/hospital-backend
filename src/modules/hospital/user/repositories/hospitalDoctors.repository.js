import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

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

export const getDoctorsByHospital = async (hospitalId, mode, offset, limit) => {
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
    WHERE
      h.id = ${hospitalId}
      AND h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql}
    ORDER BY d.name ASC
    LIMIT ${limit} OFFSET ${offset};
  `;
};

export const countDoctorsByHospital = async (hospitalId, mode) => {
  const modeSql = modeFilterSql(mode);

  const rows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    WHERE
      h.id = ${hospitalId}
      AND h.status = 'APPROVED'
      AND h."isListed" = true
      ${modeSql};
  `;
  return rows?.[0]?.count || 0;
};
