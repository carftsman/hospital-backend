import { searchEntities } from "../services/search.service.js";
import { getFromCache, setToCache } from "../../../../utils/simpleCache.js";

/**
 * POST /api/user/search
 * body: {
 *   q: "cardio",
 *   type: "doctor" | "hospital" | "category" | "all" (default: all),
 *   latitude?: number,
 *   longitude?: number,
 *   page?: number,
 *   limit?: number
 * }
 */
export const search = async (req, res) => {
  try {
    const {
      q,
      type = "all",
      latitude,
      longitude,
      page = 1,
      limit = 20
    } = req.body;

    if (!q || typeof q !== "string" || !q.trim()) {
      return res.status(400).json({ message: "query 'q' is required" });
    }

    const t = String(type).toLowerCase();
    if (!["doctor", "hospital", "category", "all"].includes(t)) {
      return res.status(400).json({ message: "type must be doctor|hospital|category|all" });
    }

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const lat = (typeof latitude === "number") ? Number(latitude) : null;
    const lng = (typeof longitude === "number") ? Number(longitude) : null;

    const cacheKey = `search:${t}:${q.trim().toLowerCase()}:${lat??"nil"}:${lng??"nil"}:p${p}:l${l}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });

    const result = await searchEntities(q.trim(), t, lat, lng, p, l);

    setToCache(cacheKey, result, 8);
    return res.json(result);
  } catch (err) {
    console.error("search error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
