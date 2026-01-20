import { 
  getHospitalsByMode,
  getHospitalsByCategory 
} from "../services/hospital.service.js";

import { getFromCache, setToCache } from "../../../../utils/simpleCache.js";

export const listHospitalsByCategory = async (req, res) => {
  try {
    const {
      categoryId,
      mode = "ONLINE",
      latitude,
      longitude,
      page = 1,
      limit = 20
    } = req.body;

    if (!categoryId || typeof categoryId !== "number") {
      return res.status(400).json({ message: "categoryId is required and must be a number" });
    }

    const m = String(mode).toUpperCase();
    if (!["ONLINE", "OFFLINE"].includes(m)) {
      return res.status(400).json({ message: "mode must be ONLINE or OFFLINE" });
    }

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ message: "latitude and longitude must be numbers" });
    }

    const p = Math.max(1, parseInt(page));
    const l = Math.min(100, Math.max(1, parseInt(limit)));

    const cacheKey =
      `hospByCat:${categoryId}:${m}:${latitude.toFixed(5)}:${longitude.toFixed(5)}:p${p}:l${l}`;

    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });

    const { hospitals, total } = await getHospitalsByCategory(
      categoryId,
      m,
      latitude,
      longitude,
      p,
      l
    );

    const payload = {
      categoryId,
      mode: m,
      page: p,
      limit: l,
      total,
      count: hospitals.length,
      data: hospitals.map(h => ({
        id: h.id,
        name: h.name,
        imageUrl: h.imageUrl,
        speciality: h.speciality,
        location: h.location,
        place: h.place,
        latitude: Number(h.latitude),
        longitude: Number(h.longitude),
        isOpen: h.isOpen,
        distance: Number(h.distance)
      }))
    };

    setToCache(cacheKey, payload, 10);

    return res.json(payload);
  } catch (err) {
    console.error("listHospitalsByCategory error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

export const listHospitalsByMode = async (req, res) => {
  try {
    const {
      mode = "ONLINE",
      latitude,
      longitude,
      page = 1,
      limit = 20
    } = req.body;

    if (!["ONLINE", "OFFLINE", "BOTH"].includes(String(mode).toUpperCase())) {
      return res.status(400).json({ message: "Invalid consultation mode" });
    }

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ message: "latitude and longitude must be numbers" });
    }

    const p = Math.max(1, parseInt(page, 10));
    const l = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const cacheKey =
      `hospitalsByMode:${mode}:${latitude.toFixed(5)}:${longitude.toFixed(5)}:p${p}:l${l}`;

    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ cached: true, ...cached });
    }

    const { hospitals, total } = await getHospitalsByMode(
      mode.toUpperCase(),
      latitude,
      longitude,
      p,
      l
    );

    const payload = {
      mode,
      page: p,
      limit: l,
      total,
      count: hospitals.length,
      data: hospitals.map(h => ({
        id: h.id,
        name: h.name,
        imageUrl: h.imageUrl || null,
        speciality: h.speciality,
        location: h.location,
        place: h.place,
        latitude: Number(h.latitude),
        longitude: Number(h.longitude),
        distance: Number(h.distance),
        isOpen: h.isOpen,
      }))
    };

    setToCache(cacheKey, payload, 10); // 10 second cache

    return res.json(payload);
  } catch (err) {
    console.error("listHospitalsByMode error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

export const listHospitalsByModeGet = async (req, res) => {
  try {
    const {
      mode = "ONLINE",
      latitude,
      longitude,
      page = 1,
      limit = 20
    } = req.query;

    const m = String(mode).toUpperCase();

    if (!["ONLINE", "OFFLINE", "BOTH"].includes(m)) {
      return res.status(400).json({ message: "Invalid consultation mode" });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        message: "latitude and longitude are required numbers"
      });
    }

    const p = Math.max(1, parseInt(page));
    const l = Math.min(100, Math.max(1, parseInt(limit)));

    const cacheKey =
      `hospByMode:${m}:${lat.toFixed(5)}:${lng.toFixed(5)}:p${p}:l${l}`;

    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });

    const { hospitals, total } = await getHospitalsByMode(
      m,
      lat,
      lng,
      p,
      l
    );

    const payload = {
      mode: m,
      page: p,
      limit: l,
      total,
      count: hospitals.length,
      data: hospitals.map(h => ({
        id: h.id,
        name: h.name,
        imageUrl: h.imageUrl || null,
        speciality: h.speciality,
        location: h.location,
        place: h.place,
        latitude: Number(h.latitude),
        longitude: Number(h.longitude),
        distance: Number(h.distance),
        isOpen: h.isOpen
      }))
    };

    setToCache(cacheKey, payload, 10);
    return res.json(payload);

  } catch (err) {
    console.error("listHospitalsByModeGet error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listHospitalsByCategoryGet = async (req, res) => {
  try {
    const {
      categoryId,
      mode = "ONLINE",
      latitude,
      longitude,
      page = 1,
      limit = 20
    } = req.query;

    const catId = Number(categoryId);
    if (!catId) {
      return res.status(400).json({
        message: "categoryId is required and must be a number"
      });
    }

    const m = String(mode).toUpperCase();
    if (!["ONLINE", "OFFLINE"].includes(m)) {
      return res.status(400).json({
        message: "mode must be ONLINE or OFFLINE"
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        message: "latitude and longitude must be numbers"
      });
    }

    const p = Math.max(1, parseInt(page));
    const l = Math.min(100, Math.max(1, parseInt(limit)));

    const cacheKey =
      `hospByCat:${catId}:${m}:${lat.toFixed(5)}:${lng.toFixed(5)}:p${p}:l${l}`;

    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });

    const { hospitals, total } = await getHospitalsByCategory(
      catId,
      m,
      lat,
      lng,
      p,
      l
    );

    const payload = {
      categoryId: catId,
      mode: m,
      page: p,
      limit: l,
      total,
      count: hospitals.length,
      data: hospitals.map(h => ({
        id: h.id,
        name: h.name,
        imageUrl: h.imageUrl,
        speciality: h.speciality,
        location: h.location,
        place: h.place,
        latitude: Number(h.latitude),
        longitude: Number(h.longitude),
        distance: Number(h.distance),
        isOpen: h.isOpen
      }))
    };

    setToCache(cacheKey, payload, 10);
    return res.json(payload);

  } catch (err) {
    console.error("listHospitalsByCategoryGet error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
