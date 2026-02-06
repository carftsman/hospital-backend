import  prisma  from "../../../../prisma/client.js";

export const findSymptoms = async (
  search, 
  offset, 
  limit, 
  isWomen = false , 
  isCritical = false) => {
  return prisma.symptom.findMany({
    where: {
      AND: [
        {
          name: {
            contains: search,
            mode: "insensitive"
          }
        },
        ...(isWomen ? [{ isWomenSpecific: true }] : []),
        ...(isCritical ? [{ isCritical: true }] : [])
      ]
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      Category: {              // MUST MATCH SCHEMA
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { name: "asc" },
    skip: offset,
    take: limit
  });
};

export const countSymptoms = async (
  search,
  isWomen = false,
  isCritical = false) => {
  return prisma.symptom.count({
    where: {
      AND: [
        {
          name: {
            contains: search,
            mode: "insensitive"
          }
        },
        ...(isWomen ? [{ isWomenSpecific: true }] : []),
        ...(isCritical ? [{ isCritical: true }] : [])
      ]
      }
    });
  };
