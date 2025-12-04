import { getCategoriesByMode } from "../services/category.service.js";
import { getFromCache, setToCache } from "../../../../utils/simpleCache.js";

export const listCategoriesByMode = async (req, res) => {
  try {
    const mode = String(req.query.mode || "ONLINE").toUpperCase();

    // Validate the consultation mode
    if (!["ONLINE", "OFFLINE"].includes(mode)) {
      return res.status(400).json({
        message: "mode must be either ONLINE or OFFLINE"
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Math.min(50, Number(req.query.limit) || 20);

    const cacheKey = `cats:${mode}:p${page}:l${limit}`;
    const cached = getFromCache(cacheKey);

    if (cached) {
      return res.json({ cached: true, ...cached });
    }

    const { categories, total } = await getCategoriesByMode(mode, page, limit);

    const payload = {
      mode,
      page,
      limit,
      total,
      count: categories.length,
      data: categories
    };

    // Cache for 10 seconds
    setToCache(cacheKey, payload, 10);

    return res.json(payload);
  } catch (err) {
    console.error("listCategoriesByMode error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
