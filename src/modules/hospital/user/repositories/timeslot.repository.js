import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

/**
 * mode filter for timeslots:
 * - BOTH -> no filter
 * - ONLINE -> t.consultationMode = ONLINE OR BOTH
 * - OFFLINE -> t.consultationMode = OFFLINE OR BOTH
 */
const timeslotModeFilterSql = (mode) => {
  const m = String(mode || "BOTH").toUpperCase();
  if (m === "BOTH" || m === "ALL") return Prisma.empty;

  return Prisma.sql`
    AND (
      t."consultationMode" = ${m}::"ConsultationMode"
      OR t."consultationMode" = 'BOTH'::"ConsultationMode"
    )
  `;
};

/**
 * Return doctor ids for a hospital (used when caller passes hospitalId)
 */
export const getDoctorIdsByHospital = async (hospitalId) => {
  const rows = await prisma.$queryRaw`
    SELECT id
    FROM "Doctor"
    WHERE "hospitalId" = ${hospitalId}
  `;
  return (rows || []).map(r => Number(r.id));
};

/**
 * Get timeslots for multiple doctorIds with limit-per-doctor using one query.
 * Uses ROW_NUMBER() OVER (PARTITION BY doctorId ORDER BY start ASC) and filters rn <= limitPerDoctor.
 *
 * Parameters:
 *  - doctorIds: number[]
 *  - mode: string ("ONLINE"|"OFFLINE"|"BOTH")
 *  - from: Date | null
 *  - to: Date | null
 *  - limitPerDoctor: number
 *
 * Returns rows: { id, doctorId, start, end, consultationMode, isActive, createdAt }
 */
export const getTimeslotsForDoctors = async (doctorIds, mode = "BOTH", from = null, to = null, limitPerDoctor = 5) => {
  if (!Array.isArray(doctorIds) || doctorIds.length === 0) return [];

  // build doctor list for IN clause
  const doctorList = Prisma.join(doctorIds.map(id => Prisma.sql`${id}`));

  const modeSql = timeslotModeFilterSql(mode);

  // time bounds
  const fromSql = from ? Prisma.sql`AND t.start >= ${from}` : Prisma.empty;
  const toSql = to ? Prisma.sql`AND t.start <= ${to}` : Prisma.empty;

  // Only return slots for doctors in APPROVED + listed hospitals
  // Use a subquery with row_number per doctor so we can limit per doctor.
  // Note: row_number/filter approach is efficient with proper indexes (doctorId, start).
  return prisma.$queryRaw`
    SELECT
      sub.id,
      sub."doctorId",
      sub.start,
      sub.end,
      sub."consultationMode",
      sub."isActive",
      sub."createdAt"
    FROM (
      SELECT
        t.id,
        t."doctorId",
        t.start,
        t.end,
        t."consultationMode",
        t."isActive",
        t."createdAt",
        ROW_NUMBER() OVER (PARTITION BY t."doctorId" ORDER BY t.start ASC) AS rn
      FROM "TimeSlot" t
      JOIN "Doctor" d ON d.id = t."doctorId"
      JOIN "Hospital" h ON h.id = d."hospitalId"
      WHERE
        t."isActive" = true
        AND t."doctorId" IN (${doctorList})
        ${modeSql}
        ${fromSql}
        ${toSql}
        AND h.status = 'APPROVED'
        AND h."isListed" = true
    ) sub
    WHERE sub.rn <= ${limitPerDoctor}
    ORDER BY sub."doctorId" ASC, sub.start ASC;
  `;
};
