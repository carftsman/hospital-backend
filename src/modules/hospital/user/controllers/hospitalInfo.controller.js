// import prisma from "../../../../prisma/client.js";
// import { Prisma } from "@prisma/client";

// export const getHospitalFullInfo = async (req, res) => {
//   try {
//     const hospitalId = Number(req.params.hospitalId);
//     const lat = Number(req.query.latitude);
//     const lng = Number(req.query.longitude);

//     if (!hospitalId) {
//       return res.status(400).json({ message: "Invalid hospitalId" });
//     }

//     if (Number.isNaN(lat) || Number.isNaN(lng)) {
//       return res.status(400).json({
//         message: "latitude and longitude are required to calculate distance"
//       });
//     }

//     /* ---------------- HOSPITAL + DISTANCE ---------------- */

//     const hospitalData = await prisma.$queryRaw`
//       SELECT
//         h.*,
//         (
//           6371 * acos(
//             cos(radians(${lat}))
//             * cos(radians(h.latitude))
//             * cos(radians(h.longitude) - radians(${lng}))
//             + sin(radians(${lat}))
//             * sin(radians(h.latitude))
//           )
//         ) AS distance
//       FROM "Hospital" h
//       WHERE h.id = ${hospitalId}
//     `;

//     if (!hospitalData.length) {
//       return res.status(404).json({ message: "Hospital not found" });
//     }

//     const hospital = hospitalData[0];

//     /* ---------------- RELATED DATA ---------------- */

//     const categories = await prisma.category.findMany({
//       where: { hospitalId },
//       select: { name: true }
//     });

//     const doctors = await prisma.doctor.findMany({
//       where: { hospitalId },
//       select: {
//         id: true,
//         timeSlots: {
//           where: { isActive: true },
//           select: { start: true, end: true }
//         }
//       }
//     });

//     /* ---------------- STATS ---------------- */

//     const doctorsCount = doctors.length;

//     const patientsCount = await prisma.booking.count({
//       where: { doctorId: { in: doctors.map(d => d.id) } }
//     });

//     const experienceYears = hospital.establishedYear
//       ? new Date().getFullYear() - hospital.establishedYear
//       : null;

//     const reviewsCount = 284; // temporary

//     /* ---------------- AVAILABILITY ---------------- */

//     let availability = null;

//     const slots = doctors.flatMap(d => d.timeSlots);

//     if (slots.length > 0) {
//       const earliest = slots.reduce((a, b) => (a.start < b.start ? a : b));
//       const latest = slots.reduce((a, b) => (a.end > b.end ? a : b));

//       availability = {
//         days: "Mon - Sat",
//         startTime: earliest.start,
//         endTime: latest.end,
//         isOpen: hospital.isOpen
//       };
//     }

//     /* ---------------- RESPONSE ---------------- */

//     return res.status(200).json({
//       /* HEADER */
//       id: hospital.id,
//       name: hospital.name,
//       imageUrl: hospital.imageUrl,

//       /* LOCATION */
//       location: {
//         area: hospital.place,
//         city: hospital.location,
//         pincode: hospital.pinCode
//       },

//       latitude: hospital.latitude,
//       longitude: hospital.longitude,

//       /* ✅ DISTANCE */
//       distanceKm: Number(hospital.distance.toFixed(1)),

//       // /* ✅ DESCRIPTION */
//       // description:
//       //   hospital.speciality ??
//       //   "Specialized in multiple healthcare services with high recovery rates.",
//       /* ✅ DESCRIPTION (SHORT) */
// description:
//   hospital.categories?.length > 0
//     ? `Specialized in ${hospital.categories
//         .map(c => c.name)
//         .slice(0, 3)
//         .join(", ")}.`
//     : "Providing quality healthcare with experienced doctors.",

//       /* STATS */
//       stats: {
//         patients: patientsCount,
//         experienceYears,
//         reviews: reviewsCount
//       },

// // /* ABOUT */
// //       about: hospital.speciality ?? null, 
// /* ABOUT*/
// about:
//   hospital.speciality && hospital.speciality.trim().length > 0
//     ? hospital.speciality
//     : "This hospital provides comprehensive medical care with modern infrastructure, experienced specialists, and patient-focused treatment.",

//       /* SPECIALIZATIONS */
//       specializations: categories.map(c => c.name),

//       /* AVAILABILITY */
//       availability
//     });

//   } catch (error) {
//     console.error("getHospitalFullInfo error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

export const getHospitalFullInfo = async (req, res) => {
  try {
    const hospitalId = Number(req.params.hospitalId);

    // lat / lng are OPTIONAL
    const lat = req.query.latitude ? Number(req.query.latitude) : null;
    const lng = req.query.longitude ? Number(req.query.longitude) : null;

    if (!hospitalId) {
      return res.status(400).json({ message: "Invalid hospitalId" });
    }

    const hasCoordinates =
      lat !== null &&
      lng !== null &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng);

    /* ---------------- HOSPITAL (+ OPTIONAL DISTANCE) ---------------- */

    let hospitalData;

    if (hasCoordinates) {
      hospitalData = await prisma.$queryRaw`
        SELECT
          h.*,
          (
            6371 * acos(
              cos(radians(${lat}))
              * cos(radians(h.latitude))
              * cos(radians(h.longitude) - radians(${lng}))
              + sin(radians(${lat}))
              * sin(radians(h.latitude))
            )
          ) AS distance
        FROM "Hospital" h
        WHERE h.id = ${hospitalId}
      `;
    } else {
      hospitalData = await prisma.$queryRaw`
        SELECT h.*
        FROM "Hospital" h
        WHERE h.id = ${hospitalId}
      `;
    }

    if (!hospitalData.length) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const hospital = hospitalData[0];

    /* ---------------- RELATED DATA ---------------- */

    const categories = await prisma.category.findMany({
      where: { hospitalId },
      select: { name: true }
    });

    const doctors = await prisma.doctor.findMany({
      where: { hospitalId },
      select: {
        id: true,
        timeSlots: {
          where: { isActive: true },
          select: { start: true, end: true }
        }
      }
    });

    /* ---------------- STATS ---------------- */

    const doctorsCount = doctors.length;

    const patientsCount = await prisma.booking.count({
      where: { doctorId: { in: doctors.map(d => d.id) } }
    });

    const experienceYears = hospital.establishedYear
      ? new Date().getFullYear() - hospital.establishedYear
      : null;

    const reviewsCount = 284; // temporary

    /* ---------------- AVAILABILITY ---------------- */

    let availability = null;
    const slots = doctors.flatMap(d => d.timeSlots);

    if (slots.length > 0) {
      const earliest = slots.reduce((a, b) => (a.start < b.start ? a : b));
      const latest = slots.reduce((a, b) => (a.end > b.end ? a : b));

      availability = {
        days: "Mon - Sat",
        startTime: earliest.start,
        endTime: latest.end,
        isOpen: hospital.isOpen
      };
    }

    /* ---------------- RESPONSE ---------------- */

    return res.status(200).json({
      /* HEADER */
      id: hospital.id,
      name: hospital.name,
      imageUrl: hospital.imageUrl,

      /* LOCATION */
      location: {
        area: hospital.place,
        city: hospital.location,
        pincode: hospital.pinCode
      },

      latitude: hospital.latitude,
      longitude: hospital.longitude,

      /* DISTANCE (OPTIONAL) */
      distanceKm: hasCoordinates
        ? Number(hospital.distance.toFixed(1))
        : null,

      /* DESCRIPTION (SHORT) */
      description:
        categories.length > 0
          ? `Specialized in ${categories
              .map(c => c.name)
              .slice(0, 3)
              .join(", ")}.`
          : "Providing quality healthcare with experienced doctors.",

      /* STATS */
      stats: {
        patients: patientsCount,
        experienceYears,
        reviews: reviewsCount
      },

      /* ABOUT */
      about:
        hospital.speciality && hospital.speciality.trim().length > 0
          ? hospital.speciality
          : "This hospital provides comprehensive medical care with modern infrastructure, experienced specialists, and patient-focused treatment.",

      /* SPECIALIZATIONS */
      specializations: categories.map(c => c.name),

      /* AVAILABILITY */
      availability
    });

  } catch (error) {
    console.error("getHospitalFullInfo error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
