import {
  fetchHospitalDoctors,
  fetchDoctors,
  fetchDoctorInfo,
  fetchDoctorAvailabilityByDate,
} from "../services/hospitalDoctors.service.js";

/* ---------------- HOSPITAL DOCTORS ---------------- */
export const getHospitalDoctors = async (req, res) => {
  try {
    const hospitalId = Number(req.params.hospitalId);
    if (!hospitalId) return res.status(400).json({ message: "Invalid hospitalId" });

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const result = await fetchHospitalDoctors(
      hospitalId,
      page,
      limit,
      req.query.mode || null,
      req.query.specialization || null,
      req.query.search || null,
      req.query.women === "true",
      req.query.symptomId ? Number(req.query.symptomId) : null
    );

    res.json(result);
  } catch (err) {
    console.error("getHospitalDoctors error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ---------------- GLOBAL DOCTORS ---------------- */
export const getDoctors = async (req, res) => {
  try {
    const { specialization, women = "false", page = 1, limit = 20 } = req.query;

    const { rows, total } = await fetchDoctors(
      { specialization, women: women === "true" },
      Number(page),
      Number(limit)
    );

    res.json({ page: Number(page), limit: Number(limit), total, count: rows.length, doctors: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ---------------- DOCTOR PROFILE ---------------- */
export const getDoctorInfo = async (req, res) => {
  try {
    const doctorId = Number(req.params.doctorId);
    const { latitude, longitude } = req.query;

    if (!doctorId) return res.status(400).json({ message: "Invalid doctorId" });

    const doctor = await fetchDoctorInfo(
      doctorId,
      latitude ? Number(latitude) : null,
      longitude ? Number(longitude) : null
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ---------------- DOCTOR AVAILABILITY ---------------- */
export const getDoctorAvailability = async (req, res) => {
  try {
    const doctorId = Number(req.params.doctorId);
    const { date } = req.query;

    if (!doctorId || !date) return res.status(400).json({ message: "Invalid input" });

    const availability = await fetchDoctorAvailabilityByDate(doctorId, date);
    res.json(availability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};