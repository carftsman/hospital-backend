import prisma from "../../../../prisma/client.js";

// Suggest doctor names
export const suggestDoctors = async (term, limit = 10) => {
  const like = `%${term}%`;

  return prisma.$queryRaw`
    SELECT DISTINCT d.name
    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    WHERE 
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND d.name ILIKE ${like}
    ORDER BY d.name ASC
    LIMIT ${limit};
  `;
};

// Suggest hospital names
export const suggestHospitals = async (term, limit = 10) => {
  const like = `${term}%`;

  return prisma.$queryRaw`
    SELECT DISTINCT h.name
    FROM "Hospital" h
    WHERE 
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND h.name ILIKE ${like}
    ORDER BY h.name ASC
    LIMIT ${limit};
  `;
};

// Suggest categories (departments)
export const suggestCategories = async (term, limit = 10) => {
  const like = `${term}%`;

  return prisma.$queryRaw`
    SELECT DISTINCT c.name
    FROM "Category" c
    JOIN "Hospital" h ON h.id = c."hospitalId"
    WHERE 
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND c.name ILIKE ${like}
    ORDER BY c.name ASC
    LIMIT ${limit};
  `;
};
