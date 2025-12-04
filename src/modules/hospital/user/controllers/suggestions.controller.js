import { getSuggestions } from "../services/search.suggestions.service.js";

export const searchSuggestions = async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "query must be a string" });
    }

    const suggestions = await getSuggestions(query.trim(), Number(limit));

    return res.json({
      query,
      limit,
      suggestions
    });

  } catch (err) {
    console.error("searchSuggestions error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
