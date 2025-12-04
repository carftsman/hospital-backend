import { getModeSuggestions } from "../services/modeSuggestion.service.js";

export const modeSuggestions = async (req, res) => {
  try {
    const {
      query,
      mode = "BOTH",
      limit = 10
    } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "query must be a string" });
    }

    const m = String(mode).toUpperCase();
    if (!["ONLINE", "OFFLINE", "BOTH"].includes(m)) {
      return res.status(400).json({ message: "mode must be ONLINE|OFFLINE|BOTH" });
    }

    const suggestions = await getModeSuggestions(query.trim(), Number(limit), m);

    return res.json({
      query,
      mode: m,
      limit,
      suggestions
    });

  } catch (err) {
    console.error("modeSuggestions error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
