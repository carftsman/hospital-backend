import * as repo from "../repositories/symptom.repository.js";

// export const fetchSymptoms = async (search = "", page = 1, limit = 20) => {
//   const offset = (page - 1) * limit;

//   const [rows, total] = await Promise.all([
//     repo.findSymptoms(search, offset, limit),
//     repo.countSymptoms(search)
//   ]);

//   return {
//     page,
//     limit,
//     total,
//     count: rows.length,
//     symptoms: rows
//   };
// };
export const fetchSymptoms = async (search = "", page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    repo.findSymptoms(search, offset, limit),
    repo.countSymptoms(search)
  ]);

  const symptoms = rows.map(s => ({
    id: s.id,
    name: s.name,
    imageUrl: s.imageUrl,
    category: s.Category   // ✅ rename for API
  }));

  return {
    page,
    limit,
    total,
    count: symptoms.length,
    symptoms
  };
};
