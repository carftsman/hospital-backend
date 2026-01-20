import { fetchHospitalDoctors, fetchDoctors } from "../services/hospitalDoctors.service.js";
import { getFromCache, setToCache } from "../../../../utils/simpleCache.js";

export const getHospitalDoctors = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const {
      mode = "BOTH",
      distance = null,      // FRONTEND sends this now
      page = 1,
      limit = 50
    } = req.query;

    const hid = Number(hospitalId);
    if (!hid || hid <= 0) {
      return res.status(400).json({ message: "invalid hospitalId" });
    }

    const m = String(mode).toUpperCase();
    if (!["ONLINE", "OFFLINE", "BOTH"].includes(m)) {
      return res.status(400).json({ message: "mode must be ONLINE|OFFLINE|BOTH" });
    }

    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(200, Math.max(1, parseInt(limit) || 50));

    // cache key (distance is included)
    const cacheKey = `HOSPITAL_DOCS:${hid}:${m}:p${p}:l${l}:dist${distance ?? "nil"}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });

    const result = await fetchHospitalDoctors(hid, m, distance, p, l);

    setToCache(cacheKey, result, 10);
    return res.json(result);

  } catch (err) {
    console.error("getHospitalDoctors error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


export const getDoctors = async (req, res) => {
  try {
    const {
      lat,
      lng,
      distance,
      search,
      specialization,
      minFee,
      maxFee,
      mode = "BOTH",
      availability = "ALL",
      page = 1,
      limit = 20
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const result = await fetchDoctors({
      lat: Number(lat),
      lng: Number(lng),
      distance: distance ? Number(distance) : null,
      search,
      specialization,
      minFee: minFee ? Number(minFee) : null,
      maxFee: maxFee ? Number(maxFee) : null,
      mode,
      availability,
      page: Number(page),
      limit: Number(limit)
    });

    res.json(result);
  } catch (err) {
    console.error("getDoctors error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};