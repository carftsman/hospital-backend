import * as repo from "../repositories/modeSuggestion.repository.js";

export const modeSuggestionEntities = async (
  q,
  mode = "BOTH",
  limit = 10
) => {
  if (!q || q.length < 1) {
    return { doctors: [], hospitals: [], categories: [] };
  }

  const clean = q.replace(/%/g, "").replace(/_/g, "");

  const [doctors, hospitals, categories] = await Promise.all([
    repo.suggestDoctorsByMode(clean, limit, mode),
    repo.suggestHospitalsByMode(clean, limit, mode),
    repo.suggestCategoriesByMode(clean, limit, mode)
  ]);

 return {
  doctors: doctors.map(d => ({
    id: d.id,
    name: d.name,
    imageUrl: d.imageUrl,
    type: "doctor"
  })),

  hospitals: hospitals.map(h => ({
    id: h.id,
    name: h.name,
    imageUrl: h.imageUrl,
    type: "hospital"
  })),

  categories: categories.map(c => ({
    id: c.id,
    name: c.name,
    imageUrl: c.imageUrl,
    type: "category"
  }))
};
};