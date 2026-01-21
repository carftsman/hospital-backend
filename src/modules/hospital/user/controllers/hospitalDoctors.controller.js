import { fetchHospitalDoctors, fetchDoctors, fetchDoctorInfo, fetchDoctorAvailabilityByDate } from "../services/hospitalDoctors.service.js";
import { getFromCache, setToCache } from "../../../../utils/simpleCache.js";

/* ---------------- HOSPITAL DOCTORS ---------------- */

export const getHospitalDoctors = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { mode = "BOTH", distance = null, page = 1, limit = 50 } = req.query;

    const hid = Number(hospitalId);
    if (!hid) {
      return res.status(400).json({ message: "Invalid hospitalId" });
    }

    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(200, Math.max(1, parseInt(limit) || 50));

    const cacheKey = `HOSPITAL_DOCS:${hid}:${mode}:p${p}:l${l}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });

    const result = await fetchHospitalDoctors(hid, mode, distance, p, l);
    setToCache(cacheKey, result, 10);

    return res.json(result);
  } catch (err) {
    console.error("getHospitalDoctors error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ---------------- GLOBAL DOCTORS ---------------- */

export const getDoctors = async (req, res) => {
  try {
    const { lat, lng, distance, specialization, page = 1, limit = 20 } = req.query;

    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const filters = {
      lat: lat !== undefined ? Number(lat) : null,
      lng: lng !== undefined ? Number(lng) : null,
      distance: distance !== undefined ? Number(distance) : null,
      specialization
    };

    const { rows, total } = await fetchDoctors(filters, p, l);

    return res.json({
      page: p,
      limit: l,
      total,
      count: rows.length,
      doctors: rows
    });
  } catch (err) {
    console.error("getDoctors error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getDoctorInfo = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const did = Number(doctorId);
    if (!did || did <= 0) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }

    const doctor = await fetchDoctorInfo(did);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.json(doctor);
  } catch (err) {
    console.error("getDoctorInfo error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const did = Number(doctorId);
    if (!did || did <= 0) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }

    if (!date) {
      return res
        .status(400)
        .json({ message: "date query param is required (YYYY-MM-DD)" });
    }

    const availability = await fetchDoctorAvailabilityByDate(did, date);

    return res.json(availability);
  } catch (err) {
    console.error("getDoctorAvailability error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};