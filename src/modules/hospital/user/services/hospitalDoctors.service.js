import * as repo from "../repositories/hospitalDoctors.repository.js";

export const fetchHospitalDoctors = async (
  hospitalId,
  mode = "BOTH",
  hospitalDistance = null,
  page = 1,
  limit = 50
) => {
  const offset = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    repo.getDoctorsByHospital(hospitalId, mode, offset, limit),
    repo.countDoctorsByHospital(hospitalId, mode)
  ]);

  const doctors = rows.map(r => ({
    id: r.doctorId,
    name: r.doctorName,
    imageUrl: r.doctorImage,
    experience: r.experience,
    specialization: r.specialization,
    qualification: r.qualification,
    about: r.about,
    languages: r.languages || [],
    consultationFee: Number(r.consultationFee || 0),
    createdAt: r.createdAt,
    hospital: {
      id: r.hospitalId,
      name: r.hospitalName,
      imageUrl: r.hospitalImage,
      location: r.hospitalLocation,
      place: r.hospitalPlace,
      latitude: r.latitude ? Number(r.latitude) : null,
      longitude: r.longitude ? Number(r.longitude) : null,
      isOpen: Boolean(r.isOpen),
      consultationMode: r.hospitalMode
    }
  }));

  return {
    hospitalId,
    hospitalDistance: hospitalDistance ? Number(hospitalDistance) : null,
    page,
    limit,
    total,
    count: doctors.length,
    doctors
  };
};
