import prisma from "../../../../prisma/client.js";

export const getCategoriesByMode = async (
  mode,
  page,
  limit,
  isWomen,
  search = ""
) => {
  /* ---------------- BASE FILTER ---------------- */
  const where = {};

  // ✅ MODE FILTER (safe Prisma way)
  if (mode !== "BOTH") {
    where.hospital = {
      consultationMode: { in: [mode, "BOTH"] }
    };
  }

  // ✅ WOMEN FILTER
  if (isWomen) {
    where.isWomenSpecific = true;
  }

  // ✅ SEARCH FILTER (heart → cardiology)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }

  /* ---------------- QUERY ---------------- */
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            consultationMode: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" } // nice UX
    }),
    prisma.category.count({ where })
  ]);

  return { categories, total };
};