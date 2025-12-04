import * as repo from "../repositories/search.suggestions.repository.js";

export const getSuggestions = async (term, limit = 10) => {
  if (!term || term.length < 1) {
    return { doctors: [], hospitals: [], categories: [] };
  }

  // sanitize
  const clean = term.replace(/%/g, "").replace(/_/g, "");

  const [doctors, hospitals, categories] = await Promise.all([
    repo.suggestDoctors(clean, limit),
    repo.suggestHospitals(clean, limit),
    repo.suggestCategories(clean, limit)
  ]);

  return {
    doctors: doctors.map(r => r.name),
    hospitals: hospitals.map(r => r.name),
    categories: categories.map(r => r.name)
  };
};
