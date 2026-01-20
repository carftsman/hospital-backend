import { searchEntities } from "../services/search.service.js";

/**
 * GET / POST
 * /api/hospital/user/HospitalHomesuggestions
 */
export const hospitalHomeSuggestions = async (req, res) => {
  try {
    // ✅ Support GET + POST
    const source = req.method === "GET" ? req.query : req.body;

    const {
      q,
      type = "all",
      limit = 10,
      latitude,
      longitude
    } = source;

    if (!q || typeof q !== "string" || !q.trim()) {
      return res.status(400).json({ message: "query 'q' is required" });
    }

    const t = String(type).toLowerCase();
    if (!["doctor", "hospital", "category", "symptom", "all"].includes(t)) {
      return res.status(400).json({ message: "type must be doctor|hospital|category|symptom|all" });
    }

    const l = Math.min(20, Math.max(1, parseInt(limit, 10) || 10));
    const lat = latitude ? Number(latitude) : null;
    const lng = longitude ? Number(longitude) : null;

    // 👇 Suggestions = page 1 only
    const result = await searchEntities(q.trim(), t, lat, lng, 1, l);

    return res.json({
      doctors: result.doctors || [],
      hospitals: result.hospitals || [],
      categories: result.categories || [],
      symptoms: result.symptoms || []
    });

  } catch (error) {
    console.error("HospitalHomesuggestions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
