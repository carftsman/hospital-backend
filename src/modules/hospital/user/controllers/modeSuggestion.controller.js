import { modeSuggestionEntities } from "../services/modeSuggestion.service.js";

export const modeSuggestions = async (req, res) => {
  try {
    // ✅ Works for both GET & POST
    const source = req.method === "GET" ? req.query : req.body;

    const {
      q,
      mode = "BOTH",
      limit = 10
    } = source;

    if (!q || typeof q !== "string" || !q.trim()) {
      return res.status(400).json({ message: "query 'q' is required" });
    }

    const m = String(mode).toUpperCase();
    if (!["ONLINE", "OFFLINE", "BOTH"].includes(m)) {
      return res.status(400).json({ message: "mode must be ONLINE|OFFLINE|BOTH" });
    }

    const l = Math.min(20, Math.max(1, parseInt(limit, 10) || 10));

    const result = await modeSuggestionEntities(q.trim(), m, l);
    return res.json(result);

  } catch (err) {
    console.error("modeSuggestions error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
