// src/modules/user/services/search.service.js
import * as repo from "../repositories/search.repository.js";

/**
 * q: raw user query (not percent-wrapped)
 * type: "doctor"|"hospital"|"category"|"all"
 * lat/lng: optional
 */
export const searchEntities = async (q, type = "all", lat = null, lng = null, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const term = `%${q.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`; // sanitize basic wildcards
  const hasCoords = typeof lat === "number" && typeof lng === "number";

  const result = {
    page,
    limit,
    query: q,
    type,
    doctors: [],
    hospitals: [],
    totalDoctors: 0,
    totalHospitals: 0
  };

  if (type === "doctor" || type === "all") {
    const [doctorsRows, doctorsCount] = await Promise.all([
      repo.searchDoctors(term, lat, lng, offset, limit),
      repo.countDoctors(term)
    ]);

    result.doctors = (doctorsRows || []).map(d => ({
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
        isOpen: Boolean(d.isOpen)
      },
      distance: hasCoords ? Number(d.distance) : null
    }));

    result.totalDoctors = doctorsCount || 0;
  }

  if (type === "hospital" || type === "all") {
    const [hRows, hCount] = await Promise.all([
      repo.searchHospitals(term, lat, lng, offset, limit),
      repo.countHospitals(term)
    ]);

    result.hospitals = (hRows || []).map(h => ({
      id: h.id,
      name: h.name,
      imageUrl: h.imageUrl,
      speciality: h.speciality,
      location: h.location,
      place: h.place,
      latitude: h.latitude ? Number(h.latitude) : null,
      longitude: h.longitude ? Number(h.longitude) : null,
      isOpen: Boolean(h.isOpen),
      distance: hasCoords ? Number(h.distance) : null
    }));

    result.totalHospitals = hCount || 0;
  }

  if (type === "category" || type === "all") {
    const [catRows, catCount] = await Promise.all([
      repo.searchHospitalsByCategory(term, lat, lng, offset, limit),
      repo.countHospitalsByCategory(term)
    ]);

    // merge into hospitals array (if type === 'all' we may append)
    const mapped = (catRows || []).map(h => ({
      id: h.id,
      name: h.name,
      imageUrl: h.imageUrl,
      speciality: h.speciality,
      location: h.location,
      place: h.place,
      latitude: h.latitude ? Number(h.latitude) : null,
      longitude: h.longitude ? Number(h.longitude) : null,
      isOpen: Boolean(h.isOpen),
      distance: hasCoords ? Number(h.distance) : null
    }));

    // if searching only category, replace hospitals; if all, append (dedup not handled here)
    if (type === "category") {
      result.hospitals = mapped;
      result.totalHospitals = catCount || 0;
    } else {
      // append and update total (basic)
      result.hospitals = result.hospitals.concat(mapped);
      result.totalHospitals = (result.totalHospitals || 0) + (catCount || 0);
    }
  }

  return result;
};
