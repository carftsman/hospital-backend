// src/modules/user/services/modeSearch.service.js
import * as repo from "../repositories/modeSearch.repository.js";

const sanitizeForLike = (s) => s.replace(/%/g, "\\%").replace(/_/g, "\\_");

const dedupeById = (arr) => {
  const map = new Map();
  for (const item of arr || []) if (!map.has(item.id)) map.set(item.id, item);
  return Array.from(map.values());
};

export const modeSearchEntities = async (q, type = "all", mode = "ALL", lat = null, lng = null, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const term = `${sanitizeForLike(q)}%`;
  const hasCoords = typeof lat === "number" && typeof lng === "number";

  const result = {
    page,
    limit,
    query: q,
    type,
    mode,
    doctors: [],
    hospitals: [],
    totalDoctors: 0,
    totalHospitals: 0
  };

  // ---------------- DOCTOR SEARCH ----------------
  if (type === "doctor" || type === "all") {
    const [rows, count] = await Promise.all([
      repo.searchDoctors(term, mode, lat, lng, offset, limit),
      repo.countDoctors(term, mode)
    ]);

    result.doctors = rows.map(d => ({
      id: d.doctorId,
      name: d.doctorName,
      imageUrl: d.doctorImage,
      experience: d.experience,
      specialization: d.specialization,
      qualification: d.qualification,
      about: d.about,
      languages: d.languages || [],
      consultationFee: Number(d.consultationFee || 0),
      hospital: {
        id: d.hospitalId,
        name: d.hospitalName,
        imageUrl: d.hospitalImage,
        location: d.hospitalLocation,
        place: d.hospitalPlace,
        latitude: d.latitude ? Number(d.latitude) : null,
        longitude: d.longitude ? Number(d.longitude) : null,
        isOpen: Boolean(d.isOpen),
        mode: d.hospitalMode
      },
      distance: hasCoords ? Number(d.distance) : null
    }));

    result.totalDoctors = count;
  }

  // ---------------- HOSPITAL SEARCH ----------------
  if (type === "hospital" || type === "all") {
    const [rows, count] = await Promise.all([
      repo.searchHospitals(term, mode, lat, lng, offset, limit),
      repo.countHospitals(term, mode)
    ]);

    const mapped = rows.map(h => ({
      id: h.id,
      name: h.name,
      imageUrl: h.imageUrl,
      speciality: h.speciality,
      location: h.location,
      place: h.place,
      latitude: h.latitude ? Number(h.latitude) : null,
      longitude: h.longitude ? Number(h.longitude) : null,
      isOpen: Boolean(h.isOpen),
      mode: h.consultationMode,
      distance: hasCoords ? Number(h.distance) : null
    }));

    result.hospitals = dedupeById(result.hospitals.concat(mapped));
    result.totalHospitals = result.hospitals.length;
  }

  // ---------------- CATEGORY SEARCH ----------------
  if (type === "category" || type === "all") {
    const [rows, count] = await Promise.all([
      repo.searchHospitalsByCategory(term, mode, lat, lng, offset, limit),
      repo.countHospitalsByCategory(term, mode)
    ]);

    const mapped = rows.map(h => ({
      id: h.id,
      name: h.name,
      imageUrl: h.imageUrl,
      speciality: h.speciality,
      location: h.location,
      place: h.place,
      latitude: h.latitude ? Number(h.latitude) : null,
      longitude: h.longitude ? Number(h.longitude) : null,
      isOpen: Boolean(h.isOpen),
      mode: h.consultationMode,
      distance: hasCoords ? Number(h.distance) : null
    }));

    result.hospitals = dedupeById(result.hospitals.concat(mapped));
    result.totalHospitals = result.hospitals.length;
  }

  return result;
};
