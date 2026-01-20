// import prisma from "../../../../prisma/client.js";
// import { Prisma } from "@prisma/client";

// const modeFilterSql = (mode) => {
//   const m = String(mode).toUpperCase();
//   if (m === "BOTH") return Prisma.empty;

//   if (m === "ONLINE" || m === "OFFLINE") {
//     return Prisma.sql`
//       AND (
//         h."consultationMode" = ${m}::"ConsultationMode"
//         OR h."consultationMode" = 'BOTH'::"ConsultationMode"
//       )
//     `;
//   }

//   return Prisma.empty;
// };

// export const getDoctorsByHospital = async (hospitalId, mode, offset, limit) => {
//   const modeSql = modeFilterSql(mode);

//   return prisma.$queryRaw`
//     SELECT
//       d.id AS "doctorId",
//       d.name AS "doctorName",
//       d."imageUrl" AS "doctorImage",
//       d.experience,
//       d.specialization,
//       d.qualification,
//       d.about,
//       d.languages,
//       d."consultationFee",
//       d."createdAt",
//       h.id AS "hospitalId",
//       h.name AS "hospitalName",
//       h."imageUrl" AS "hospitalImage",
//       h.location AS "hospitalLocation",
//       h.place AS "hospitalPlace",
//       h.latitude,
//       h.longitude,
//       h."isOpen",
//       h."consultationMode" AS "hospitalMode"
//     FROM "Doctor" d
//     JOIN "Hospital" h ON h.id = d."hospitalId"
//     WHERE
//       h.id = ${hospitalId}
//       AND h.status = 'APPROVED'
//       AND h."isListed" = true
//       ${modeSql}
//     ORDER BY d.name ASC
//     LIMIT ${limit} OFFSET ${offset};
//   `;
// };

// export const countDoctorsByHospital = async (hospitalId, mode) => {
//   const modeSql = modeFilterSql(mode);

//   const rows = await prisma.$queryRaw`
//     SELECT COUNT(*)::int AS count
//     FROM "Doctor" d
//     JOIN "Hospital" h ON h.id = d."hospitalId"
//     WHERE
//       h.id = ${hospitalId}
//       AND h.status = 'APPROVED'
//       AND h."isListed" = true
//       ${modeSql};
//   `;
//   return rows?.[0]?.count || 0;
// };

// const distanceSql = Prisma.sql`
//   (6371 * acos(
//     cos(radians(${Prisma.raw("lat")})) *
//     cos(radians(h.latitude)) *
//     cos(radians(h.longitude) - radians(${Prisma.raw("lng")})) +
//     sin(radians(${Prisma.raw("lat")})) *
//     sin(radians(h.latitude))
//   ))
// `;

// export const getDoctors = async (f, offset) => {
//   const { lat, lng, distance, limit } = f;

//   return prisma.$queryRaw`
//     SELECT
//       d.id AS "doctorId",
//       d.name AS "doctorName",
//       d.specialization,
//       d.experience,
//       d."consultationFee",
//       d.languages,
//       h.id AS "hospitalId",
//       h.name AS "hospitalName",
//       h.place,
//       h.latitude,
//       h.longitude,
//       h."consultationMode",
//       h."isOpen",

//       --  distance calculation (lat/lng are VALUES)
//       (
//         6371 * acos(
//           cos(radians(${lat}))
//           * cos(radians(h.latitude))
//           * cos(radians(h.longitude) - radians(${lng}))
//           + sin(radians(${lat}))
//           * sin(radians(h.latitude))
//         )
//       ) AS distance

//     FROM "Doctor" d
//     JOIN "Hospital" h ON h.id = d."hospitalId"

//     WHERE
//       h.status = 'APPROVED'
//       AND h."isListed" = true
//       AND h.latitude IS NOT NULL
//       AND h.longitude IS NOT NULL

//       -- distance filter
//       AND (
//         ${distance} IS NULL OR
//         (
//           6371 * acos(
//             cos(radians(${lat}))
//             * cos(radians(h.latitude))
//             * cos(radians(h.longitude) - radians(${lng}))
//             + sin(radians(${lat}))
//             * sin(radians(h.latitude))
//           )
//         ) <= ${distance}
//       )

//     ORDER BY distance ASC
//     LIMIT ${limit}
//     OFFSET ${offset};
//   `;
// };
import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

/* ---------------- MODE FILTER (USED BY HOSPITAL API) ---------------- */

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

/* ---------------- DOCTORS BY HOSPITAL ---------------- */

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

/* ---------------- GLOBAL DOCTORS (LOCATION BASED) ---------------- */

export const getDoctors = async (f, offset) => {
  const { lat, lng, distance, limit } = f;

  //  Conditionally add distance filter
  const distanceFilter = distance
    ? Prisma.sql`
        AND (
          6371 * acos(
            cos(radians(${lat}))
            * cos(radians(h.latitude))
            * cos(radians(h.longitude) - radians(${lng}))
            + sin(radians(${lat}))
            * sin(radians(h.latitude))
          )
        ) <= ${distance}
      `
    : Prisma.empty;

  return prisma.$queryRaw`
    SELECT
      d.id AS "doctorId",
      d.name AS "doctorName",
      d.specialization,
      d.experience,
      d."consultationFee",
      d.languages,
      h.id AS "hospitalId",
      h.name AS "hospitalName",
      h.place,
      h.latitude,
      h.longitude,
      h."consultationMode",
      h."isOpen",

      --  distance calculation
      (
        6371 * acos(
          cos(radians(${lat}))
          * cos(radians(h.latitude))
          * cos(radians(h.longitude) - radians(${lng}))
          + sin(radians(${lat}))
          * sin(radians(h.latitude))
        )
      ) AS distance

    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"

    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND h.latitude IS NOT NULL
      AND h.longitude IS NOT NULL
      ${distanceFilter}

    ORDER BY distance ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;
};
export const countDoctors = async (f) => {
  const { lat, lng, distance } = f;

  // same distance condition as getDoctors
  const distanceFilter = distance
    ? Prisma.sql`
        AND (
          6371 * acos(
            cos(radians(${lat}))
            * cos(radians(h.latitude))
            * cos(radians(h.longitude) - radians(${lng}))
            + sin(radians(${lat}))
            * sin(radians(h.latitude))
          )
        ) <= ${distance}
      `
    : Prisma.empty;

  const rows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM "Doctor" d
    JOIN "Hospital" h ON h.id = d."hospitalId"
    WHERE
      h.status = 'APPROVED'
      AND h."isListed" = true
      AND h.latitude IS NOT NULL
      AND h.longitude IS NOT NULL
      ${distanceFilter};
  `;

  return rows?.[0]?.count || 0;
};
