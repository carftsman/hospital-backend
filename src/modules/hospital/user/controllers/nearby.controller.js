// src/modules/user/controllers/nearby.controller.js
import { findNearbyHospitals } from "../services/nearby.service.js";
import { getFromCache, setToCache } from "../../../../utils/simpleCache.js";

/**
 * POST /api/user/nearby-hospitals
 * body: { latitude, longitude, radiusKm?, page?, limit?, onlyOpen? }
 */
export const listNearbyHospitals = async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 10, page = 1, limit = 20, onlyOpen = false } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ message: "latitude and longitude are required and must be numbers" });
    }

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const r = Math.min(50, Math.max(0.5, Number(radiusKm) || 10)); // clamp radius: 0.5 - 50 km

    // Cache key: round coords to 5 decimals to reduce cache fragmentation
    const cacheKey = `nearby:${latitude.toFixed(5)}:${longitude.toFixed(5)}:r${r}:p${p}:l${l}:open${onlyOpen ? 1 : 0}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ cached: true, ...cached });
    }

    const { hospitals, total } = await findNearbyHospitals(Number(latitude), Number(longitude), r, p, l, Boolean(onlyOpen));


    const payload = {
      page: p,
      limit: l,
      total,
      count: hospitals.length,
      data: hospitals.map(h => {
        const consultationMode = String(h.consultationMode || h["consultationMode"] || "BOTH").toUpperCase();
        return {
          id: h.id,
          name: h.name,
          imageUrl: h.imageUrl || null,
          location: h.location,
          place: h.place || null,
          speciality: h.speciality || null,
          consultationMode,                       // "ONLINE" | "OFFLINE" | "BOTH"
          supportsOnline: consultationMode === "ONLINE" || consultationMode === "BOTH",
          supportsOffline: consultationMode === "OFFLINE" || consultationMode === "BOTH",
          latitude: Number(h.latitude),
          longitude: Number(h.longitude),
          isOpen: Boolean(h.isOpen),
          distance: Number(h.distance) // km
        };
      })
    };


    // short TTL to keep fresh while reducing DB hits
    setToCache(cacheKey, payload, 8);

    return res.json(payload);
  } catch (err) {
    console.error("listNearbyHospitals error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
