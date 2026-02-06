import * as repo from "../repositories/symptom.repository.js";
export const fetchSymptoms = async (
  search = "", 
  page = 1,
  limit = 20,
  isWomen = false,
  isCritical = false) => {
  const offset = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    repo.findSymptoms(search, offset, limit, isWomen, isCritical),
    repo.countSymptoms(search, isWomen, isCritical)
  ]);

  const symptoms = rows.map(s => ({
    id: s.id,
    name: s.name,
    imageUrl: s.imageUrl,
    category: s.Category   // rename for API
  }));

  return {
    page,
    limit,
    total,
    count: symptoms.length,
    symptoms
  };
};
