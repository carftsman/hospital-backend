// import prisma from "../../../../prisma/client.js";
// import { Prisma } from "@prisma/client";

// export const getCategoriesByMode = async (
//   mode = "BOTH",
//   page = 1,
//   limit = 20
// ) => {
//   const offset = (page - 1) * limit;
 
//   const modeCondition =
//     mode === "BOTH"
//       ? Prisma.sql``   // NO FILTER
//       : Prisma.sql`
//           AND (
//             h."consultationMode" = ${mode}::"ConsultationMode"
//             OR h."consultationMode" = 'BOTH'::"ConsultationMode"
//           )
//         `;
//   const hospitalModeCondition =
//     mode === "BOTH"
//       ? Prisma.sql`h."consultationMode" = 'BOTH'::"ConsultationMode"`
//       : Prisma.sql`(
//           h."consultationMode" = ${mode}::"ConsultationMode"
//           OR h."consultationMode" = 'BOTH'::"ConsultationMode"
//         )`;

//   const timeslotModeCondition =
//     mode === "BOTH"
//       ? Prisma.sql`t."consultationMode" = 'BOTH'::"ConsultationMode"`
//       : Prisma.sql`(
//           t."consultationMode" = ${mode}::"ConsultationMode"
//           OR t."consultationMode" = 'BOTH'::"ConsultationMode"
//         )`;

//   const rows = await prisma.$queryRaw`
//   SELECT DISTINCT
//     c.id,
//     c.name,
//     c."imageUrl",
//     c.description
//   FROM "Category" c
//   JOIN "Hospital" h ON h.id = c."hospitalId"
//   LEFT JOIN "Doctor" d ON d."categoryId" = c.id
//   LEFT JOIN "TimeSlot" t ON t."doctorId" = d.id
//   WHERE
//     h.status = 'APPROVED'
//     AND h."isListed" = true
//     AND ${hospitalModeCondition}
//     AND (
//       d.id IS NULL
//       OR (
//         t.id IS NULL
//         OR (
//           t."isActive" = true
//           AND ${timeslotModeCondition}
//         )
//       )
//     )
//   ORDER BY c.name ASC
// `;


//   const countRows = await prisma.$queryRaw`
//   SELECT COUNT(DISTINCT c.id)::int AS count
//   FROM "Category" c
//   JOIN "Hospital" h ON h.id = c."hospitalId"
//   LEFT JOIN "Doctor" d ON d."categoryId" = c.id
//   LEFT JOIN "TimeSlot" t ON t."doctorId" = d.id
//   WHERE
//     h.status = 'APPROVED'
//     AND h."isListed" = true
//     AND ${hospitalModeCondition}
//     AND (
//       d.id IS NULL
//       OR (
//         t.id IS NULL
//         OR (
//           t."isActive" = true
//           AND ${timeslotModeCondition}
//         )
//       )
//     );
// `;

// return {
//     categories: rows,
//     total: countRows?.[0]?.count || 0
//   };
// };

import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

export const getCategoriesByMode = async (
  mode = "BOTH",
  page = 1,
  limit = 20
) => {
  const offset = (page - 1) * limit;

  // Base filter (always applied)
  const baseWhere = Prisma.sql`
    FROM "Category" c
    JOIN "Hospital" h ON h.id = c."hospitalId"
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
  `;

  //  Mode filter (ONLY for ONLINE / OFFLINE)
  const modeFilter =
    mode === "BOTH"
      ? Prisma.sql`` //  NO FILTER
      : Prisma.sql`
          AND (
            h."consultationMode" = ${mode}::"ConsultationMode"
            OR h."consultationMode" = 'BOTH'::"ConsultationMode"
          )
        `;

  //  DATA QUERY
  const rows = await prisma.$queryRaw`
    SELECT
      c.id,
      c.name,
      c."imageUrl",
      c.description
    ${baseWhere}
    ${modeFilter}
    ORDER BY c.name ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;

  //  COUNT QUERY (IDENTICAL FILTERS)
  const countRows = await prisma.$queryRaw`
    SELECT COUNT(c.id)::int AS count
    ${baseWhere}
    ${modeFilter};
  `;

  return {
    categories: rows,
    total: countRows?.[0]?.count || 0
  };
};
