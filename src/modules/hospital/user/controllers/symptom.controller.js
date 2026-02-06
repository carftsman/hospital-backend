import { fetchSymptoms } from "../services/symptom.service.js";

export const getSymptoms = async (req, res) => {
  try {
    const { 
      search = "", 
      page = 1, 
      limit = 20, 
      women = "false", 
      critical = "false" 
    } = req.query;

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    
    //womens
    const isWomen = women === "true";
    const isCritical = critical === "true";

    const result = await fetchSymptoms(search.trim(), p, l, isWomen, isCritical);
    // return res.json(result);
    return res.json({
      women: isWomen,
      critical: isCritical,
      ...result
    });

  } catch (err) {
    console.error("getSymptoms error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
