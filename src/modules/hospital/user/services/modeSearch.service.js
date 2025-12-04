import * as repo from "../repositories/modeSearch.repository.js";

/**
 * q: raw user query
 * type: "doctor"|"hospital"|"category"|"all"
 * mode: "ONLINE"|"OFFLINE"|"ALL" (filters hospitals by mode unless ALL)
 * lat/lng: optional
 */
export const modeSearchEntities = async (q, type = "all", mode = "ALL", lat = null, lng = null, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const term = `%${q.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`; // basic sanitize
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

  // Doctor search
  if (type === "doctor" || type === "all") {
    const [doctorsRows, doctorsCount] = await Promise.all([
      repo.searchDoctors(term, mode, lat, lng, offset, limit),
      repo.countDoctors(term, mode)
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
        isOpen: Boolean(d.isOpen),
        mode: d.hospitalMode || null
      },
      distance: hasCoords ? Number(d.distance) : null
    }));

    result.totalDoctors = doctorsCount || 0;
  }

  // Hospital search
  if (type === "hospital" || type === "all") {
    const [hRows, hCount] = await Promise.all([
      repo.searchHospitals(term, mode, lat, lng, offset, limit),
      repo.countHospitals(term, mode)
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
      mode: h.mode || null,
      distance: hasCoords ? Number(h.distance) : null
    }));

    result.totalHospitals = hCount || 0;
  }

  // Category search (returns hospitals that have matching categories)
  if (type === "category" || type === "all") {
    const [catRows, catCount] = await Promise.all([
      repo.searchHospitalsByCategory(term, mode, lat, lng, offset, limit),
      repo.countHospitalsByCategory(term, mode)
    ]);

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
      mode: h.mode || null,
      distance: hasCoords ? Number(h.distance) : null
    }));

    if (type === "category") {
      result.hospitals = mapped;
      result.totalHospitals = catCount || 0;
    } else {
      // append (no dedupe)
      result.hospitals = result.hospitals.concat(mapped);
      result.totalHospitals = (result.totalHospitals || 0) + (catCount || 0);
    }
  }

  return result;
};
