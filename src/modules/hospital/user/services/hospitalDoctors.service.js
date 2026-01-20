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


export const fetchDoctors = async (filters) => {
  const offset = (filters.page - 1) * filters.limit;

  const [rows, total] = await Promise.all([
    repo.getDoctors(filters, offset),
    repo.countDoctors(filters)
  ]);

  return {
    page: filters.page,
    limit: filters.limit,
    total,
    count: rows.length,
    doctors: rows.map(r => ({
      id: r.doctorId,
      name: r.doctorName,
      imageUrl: r.imageUrl,
      specialization: r.specialization,
      experience: r.experience,
      consultationFee: Number(r.consultationFee),
      languages: r.languages || [],
      distance: r.distance ? Number(r.distance.toFixed(2)) : null,
      hospital: {
        id: r.hospitalId,
        name: r.hospitalName,
        place: r.place,
        isOpen: r.isOpen,
        consultationMode: r.consultationMode
      }
    }))
  };
};