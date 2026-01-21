import * as repo from "../repositories/hospitalDoctors.repository.js";

export const fetchHospitalDoctors = async (
  hospitalId,
  mode = "BOTH",
  hospitalDistance = null,
  page = 1,
  limit = 50
) => {
  const p = page > 0 ? page : 1;
  const l = limit > 0 ? limit : 50;
  const offset = (p - 1) * l;

  const [rows, total] = await Promise.all([
    repo.getDoctorsByHospital(hospitalId, mode, offset, l),
    repo.countDoctorsByHospital(hospitalId, mode)
  ]);

  return {
    hospitalId,
    hospitalDistance: hospitalDistance ? Number(hospitalDistance) : null,
    page: p,
    limit: l,
    total,
    count: rows.length,
    doctors: rows
  };
};

export const fetchDoctors = async (filters, page = 1, limit = 20) => {
  const p = page > 0 ? page : 1;
  const l = limit > 0 ? limit : 20;
  const offset = (p - 1) * l;

  const [rows, total] = await Promise.all([
    repo.getDoctors(filters, offset, l),
    repo.countDoctors(filters)
  ]);

  return { rows, total, page: p, limit: l };
};

export const fetchDoctorInfo = async (doctorId) => {
  const row = await repo.getDoctorById(doctorId);

  if (!row) return null;

  return {
    id: row.doctorId,
    name: row.doctorName,
    imageUrl: row.imageUrl,
    specialization: row.specialization,
    qualification: row.qualification,
    experience: row.experience,
    about: row.about,
    languages: row.languages || [],
    consultationFee: Number(row.consultationFee || 0),
    createdAt: row.createdAt,
    hospital: {
      id: row.hospitalId,
      name: row.hospitalName,
      imageUrl: row.hospitalImage,
      location: row.location,
      place: row.place,
      latitude: row.latitude ? Number(row.latitude) : null,
      longitude: row.longitude ? Number(row.longitude) : null,
      consultationMode: row.consultationMode,
      isOpen: Boolean(row.isOpen)
    }
  };
};

export const fetchDoctorAvailabilityByDate = async (doctorId, date) => {
  const slots = await repo.getDoctorAvailabilityByDate(doctorId, date);

  return {
    doctorId,
    date,
    totalSlots: slots.length,
    availableSlots: slots.filter(s => !s.isBooked).length,
    slots: slots.map(s => ({
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      isBooked: s.isBooked
    }))
  };
};