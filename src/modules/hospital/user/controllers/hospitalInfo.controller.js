import prisma from "../../../../prisma/client.js";

/**
 * Get full hospital details (UI READY – SINGLE API)
 */
export const getHospitalFullInfo = async (req, res) => {
  try {
    const hospitalId = Number(req.params.hospitalId);

    if (!hospitalId) {
      return res.status(400).json({ message: "Invalid hospitalId" });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: {
        categories: {
          select: { name: true }
        }
      }
    });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Doctors count
    const doctorsCount = await prisma.doctor.count({
      where: { hospitalId }
    });

    // Experience in years
   const experienceYears = hospital.establishedYear
  ? new Date().getFullYear() - hospital.establishedYear
  : null;


    // Temporary static reviews count
    const reviewsCount = 284;

    return res.status(200).json({
      // 🔹 HEADER INFO
      id: hospital.id,
      name: hospital.name,
      imageUrl: hospital.imageUrl,
      location: hospital.location,
      place: hospital.place,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      isOpen: hospital.isOpen,

      // 🔹 STATS (TOP ROW)
      doctorsCount,
      experienceYears,
      reviewsCount,

      // 🔹 ABOUT
      about: hospital.speciality ?? null,

      // 🔹 SPECIALIZED FOR
      specializedFor: hospital.categories.map(c => c.name)
    });
  } catch (error) {
    console.error("getHospitalFullInfo error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
