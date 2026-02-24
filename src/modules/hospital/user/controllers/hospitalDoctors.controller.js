import {
  fetchHospitalDoctors,
  fetchDoctors,
  fetchDoctorInfo,
  fetchDoctorAvailabilityByDate,
  fetchDoctorsNearby,
} from "../services/hospitalDoctors.service.js";

export const getDoctors = async (req, res) => {
  try {
    const {
      lat, lng, search, specialization, women,
      categoryIds, minExp, maxFee,
      distance = 10, availability = "all",
      sort = "distance", page = 1, limit = 20
    } = req.query;

    if (!lat || !lng)
      return res.status(400).json({ message: "lat & lng required" });

    const categories = categoryIds
      ? categoryIds.split(",").map(Number)
      : [];

    const { rows, total } = await fetchDoctorsNearby({
      lat: Number(lat),
      lng: Number(lng),
      search,
      specialization,
      women: women === "true",
      categoryIds: categories,
      minExp: Number(minExp),
      maxFee: Number(maxFee),
      distance: Number(distance),
      availability,
      sort
    }, Number(page), Number(limit));

    res.json({ page: Number(page), limit: Number(limit), total, count: rows.length, doctors: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHospitalDoctors = async (req, res) => {
  try {
    const hospitalId = Number(req.params.hospitalId);
    if (!hospitalId) {
      return res.status(400).json({ message: "Invalid hospitalId" });
    }
     const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const mode = req.query.mode || null;
    const specialization = req.query.specialization || null; 
    const search = req.query.search || null;
    const women = req.query.women === "true" ; // added newly
    const symptomId = req.query.symptomId ? Number(req.query.symptomId) : null;


    const result = await fetchHospitalDoctors(
      hospitalId,
      page,
      limit,
      mode,
      specialization,
      search,
      women ,
      symptomId  );

    return res.json(result);
 } catch (err) {
    console.error("getHospitalDoctors error:", err);
    return res.status(500).json({ message: "Internal server error" });
    }
};

/* ---------------- DOCTOR PROFILE ---------------- */
export const getDoctorInfo = async (req, res) => {
  try {
    const doctorId = Number(req.params.doctorId);
    if (!doctorId) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }
    const doctor = await fetchDoctorInfo(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
     return res.json(doctor);
     } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
     }
};

/* ---------------- DOCTOR AVAILABILITY ---------------- */
export const getDoctorAvailability = async (req, res) => {
  try {
    const doctorId = Number(req.params.doctorId);
    const { date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const availability = await fetchDoctorAvailabilityByDate(doctorId, date);
    return res.json(availability);
      } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
      }
};