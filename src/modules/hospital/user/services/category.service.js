import prisma from "../../../../prisma/client.js";

export const getCategoriesByMode = async (mode, page, limit, isWomen) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(isWomen && { isWomenSpecific: true }),

    // 🔥 IMPORTANT JOIN
    hospital: {
      consultationMode: mode === "BOTH"
        ? { in: ["ONLINE", "OFFLINE", "BOTH"] }
        : { in: [mode, "BOTH"] }
    }
  };

  const [total, categories] = await Promise.all([
    prisma.category.count({ where }),

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
      skip,
      take: limit,
      orderBy: { name: "asc" }
    })
  ]);

  return { categories, total };
};
