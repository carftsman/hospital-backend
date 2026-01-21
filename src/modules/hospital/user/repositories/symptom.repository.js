// import prisma from "../../../../prisma/client.js";

// export const findSymptoms = async (search, offset, limit) => {
//   return prisma.symptom.findMany({
//     where: search
//       ? {
//           name: {
//             contains: search,
//             mode: "insensitive"
//           }
//         }
//       : undefined,

//     select: {
//       id: true,
//       name: true,
//       imageUrl: true,
//       category: {
//         select: {
//           id: true,
//           name: true
//         }
//       }
//     },

//     orderBy: {
//       name: "asc"
//     },

//     skip: offset,
//     take: limit
//   });
// };

// export const countSymptoms = async (search) => {
//   return prisma.symptom.count({
//     where: search
//       ? {
//           name: {
//             contains: search,
//             mode: "insensitive"
//           }
//         }
//       : undefined
//   });
// };

import  prisma  from "../../../../prisma/client.js";

export const findSymptoms = async (search, offset, limit) => {
  return prisma.symptom.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      Category: {              // ✅ MUST MATCH SCHEMA
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

export const countSymptoms = async (search) => {
  return prisma.symptom.count({
    where: {
      name: {
        contains: search,
        mode: "insensitive"
      }
    }
  });
};
