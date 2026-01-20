import { modeSearchEntities } from "../services/modeSearch.service.js";
import { getFromCache, setToCache } from "../../../../utils/simpleCache.js";

/**
 * POST /api/user/modeSearch
 * body:
 * {
 *   q: "cardio",
 *   type: "doctor" | "hospital" | "category" | "symptom" | "all" (default: all),
 *   mode: "ONLINE" | "OFFLINE" | "ALL" (default: ALL),
 *   latitude?: number,
 *   longitude?: number,
 *   page?: number,
 *   limit?: number
 * }
 */
// src/modules/user/controllers/modeSearch.controller.js

export const modeSearch = async (req, res) => {
  try {
    // 👇 works for POST (body) and GET (query)
    const source = req.method === "GET" ? req.query : req.body;

    const {
      q,
      type = "all",
      mode = "BOTH",
      latitude,
      longitude,
      page = 1,
      limit = 20
    } = source;

    if (!q || typeof q !== "string" || !q.trim()) {
      return res.status(400).json({ message: "query 'q' is required" });
    }

    const t = String(type).toLowerCase();
    if (!["doctor", "hospital", "category", "symptom", "all"].includes(t)) {
      return res.status(400).json({ message: "type must be doctor|hospital|category|symptom|all" });
    }

    const m = String(mode || "ALL").toUpperCase();
    if (!["ONLINE", "OFFLINE", "BOTH"].includes(m)) {
      return res.status(400).json({ message: "mode must be ONLINE|OFFLINE|BOTH" });
    }

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const lat = latitude !== undefined ? Number(latitude) : null;
    const lng = longitude !== undefined ? Number(longitude) : null;

    const cacheKey = `modeSearch:${m}:${t}:${q.trim().toLowerCase()}:${lat ?? "nil"}:${lng ?? "nil"}:p${p}:l${l}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });

    const result = await modeSearchEntities(q.trim(), t, m, lat, lng, p, l);

    setToCache(cacheKey, result, 8);
    return res.json(result);

  } catch (err) {
    console.error("modeSearch error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
