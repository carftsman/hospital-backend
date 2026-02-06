import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

export const getCategoriesByMode = async (
  mode = "BOTH",
  page = 1,
  limit = 20,
  isWomen = false // Added newly women
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
  // Women filter (OPTIONAL)
  const womenFilter = isWomen
  ? Prisma.sql`AND c."isWomenSpecific" = true`
  : Prisma.sql``;

  //  DATA QUERY
  const rows = await prisma.$queryRaw`
    SELECT
      c.id,
      c.name,
      c."imageUrl",
      c.description
    ${baseWhere}
    ${modeFilter}
    ${womenFilter}
    ORDER BY c.name ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;

  //  COUNT QUERY (IDENTICAL FILTERS)
  const countRows = await prisma.$queryRaw`
    SELECT COUNT(c.id)::int AS count
    ${baseWhere}
    ${modeFilter}
    ${womenFilter};
  `;

  return {
    categories: rows,
    total: countRows?.[0]?.count || 0
  };
};
