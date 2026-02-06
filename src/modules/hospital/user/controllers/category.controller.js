import { getCategoriesByMode } from "../services/category.service.js";
import { getFromCache, setToCache } from "../../../../utils/simpleCache.js";

export const listCategoriesByMode = async (req, res) => {
  try {
    const mode = String(req.query.mode || "BOTH").toUpperCase();
    const isWomen = req.query.women === "true"; //ADDED newly for womens 

    if (!["ONLINE", "OFFLINE", "BOTH"].includes(mode)) {
      return res.status(400).json({
        message: "mode must be ONLINE, OFFLINE or BOTH"
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Math.min(50, Number(req.query.limit) || 20);

    const { categories, total } = await getCategoriesByMode(mode, page, limit,isWomen);

    return res.json({
      mode,
      women: isWomen,
      page,
      limit,
      total,
      count: categories.length,
      data: categories
    });

  } catch (err) {
    console.error("listCategoriesByMode error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message
    });
  }
};
