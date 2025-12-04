import * as repo from "../repositories/modeSuggestion.repository.js";

export const getModeSuggestions = async (term, limit = 10, mode = "BOTH") => {
  if (!term || term.length < 1) {
    return { doctors: [], hospitals: [], categories: [] };
  }

  const clean = term.replace(/%/g, "").replace(/_/g, "");

  const [doctors, hospitals, categories] = await Promise.all([
    repo.suggestDoctorsByMode(clean, limit, mode),
    repo.suggestHospitalsByMode(clean, limit, mode),
    repo.suggestCategoriesByMode(clean, limit, mode)
  ]);

  return {
    doctors: doctors.map(r => r.name),
    hospitals: hospitals.map(r => r.name),
    categories: categories.map(r => r.name)
  };
};
