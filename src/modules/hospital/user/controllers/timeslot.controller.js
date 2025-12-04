import { fetchTimeslots } from "../services/timeslot.service.js";
import { getFromCache, setToCache } from "../../../../utils/simpleCache.js";

export const getTimeslots = async (req, res) => {
  try {
    // accept doctorIds csv OR hospitalId
    const { doctorIds, hospitalId } = req.query;
    const {
      mode = "BOTH",
      from = null,
      to = null,
      limitPerDoctor = 5
    } = req.query;

    if (!doctorIds && !hospitalId) {
      return res.status(400).json({ message: "Provide doctorIds (csv) or hospitalId" });
    }

    const m = String(mode || "BOTH").toUpperCase();
    if (!["ONLINE", "OFFLINE", "BOTH"].includes(m)) {
      return res.status(400).json({ message: "mode must be ONLINE|OFFLINE|BOTH" });
    }

    const parsedDoctorIds = doctorIds
      ? String(doctorIds).split(",").map(s => Number(s.trim())).filter(n => Number.isInteger(n) && n > 0)
      : null;

    const hid = hospitalId ? Number(hospitalId) : null;
    if (hospitalId && (!hid || hid <= 0)) {
      return res.status(400).json({ message: "invalid hospitalId" });
    }

    const fromDt = from ? new Date(from) : null;
    const toDt = to ? new Date(to) : null;
    if (from && isNaN(fromDt)) return res.status(400).json({ message: "invalid from datetime" });
    if (to && isNaN(toDt)) return res.status(400).json({ message: "invalid to datetime" });

    const perDoc = Math.max(1, Math.min(50, parseInt(limitPerDoctor, 10) || 5));

    // cache key (optional)
    const cacheKey = `TIMESLOTS:${hid ?? (parsedDoctorIds || []).join("_")}:${m}:from${from ?? "nil"}:to${to ?? "nil"}:l${perDoc}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });

    const result = await fetchTimeslots({
      doctorIds: parsedDoctorIds,
      hospitalId: hid,
      mode: m,
      from: fromDt,
      to: toDt,
      limitPerDoctor: perDoc
    });

    setToCache(cacheKey, result, 8); // short TTL
    return res.json(result);
  } catch (err) {
    console.error("getTimeslots error:", err);
    return res.status(500).json({ message: "Internal server error", error: String(err) });
  }
};
