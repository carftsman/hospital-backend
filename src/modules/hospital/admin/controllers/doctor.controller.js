// src/modules/hospital/admin/controllers/doctor.controller.js
import * as service from "../services/doctor.service.js";

/* -------------------------------- OPTIMIZATION UTILITIES -------------------------------- */

// Lock used to prevent accidental double doctor creation (idempotency)
const doctorCreateLock = new Map();

// Cache for listDoctors (DEV-friendly caching)
const doctorListCache = new Map();

/* ----------------------------------------------------------------------------------------- */



/**
 * Create a doctor inside a category.
 * Optimized:
 *  - Prevent duplicate submissions (idempotency)
 *  - Clean inputs
 *  - Validate category doctor uniqueness
 */
export const createDoctor = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const { categoryId } = req.params;

    let {
      name,
      experience,
      specialization,
      imageUrl,
      qualification,
      about,
      languages,
      consultationFee
    } = req.body;


    if (!name || !experience) {
      return res.status(400).json({ message: "Name & experience required" });
    }

    // sanitize
    name = name.trim();
    if (!name) return res.status(400).json({ message: "Doctor name cannot be empty" });

    if (specialization) specialization = specialization.trim();
    if (qualification) qualification = qualification.trim();
    if (about) about = about.trim();
    // languages must be an array of strings
    if (!Array.isArray(languages)) {
      languages = [];
    } else {
      languages = languages.map(l => String(l).trim()).filter(Boolean);
    }

    // consultationFee must be int (paise)
    consultationFee = Number(consultationFee) || 0;


    // ----------------- IDEMPOTENCY (prevent accidental double-create) -----------------
    const lockKey = `${hospitalId}_${categoryId}_${name}`;
    if (doctorCreateLock.has(lockKey)) {
      return res.status(409).json({ message: "Duplicate request. Please wait." });
    }
    doctorCreateLock.set(lockKey, true);
    // ---------------------------------------------------------------------------------

    // Create doctor
    const doctor = await service.createDoctorForCategory(
      hospitalId,
      categoryId,
      {
        name,
        experience,
        specialization,
        imageUrl,
        qualification,
        about,
        languages,
        consultationFee
      }

    );

    doctorCreateLock.delete(lockKey);

    return res.status(201).json({ message: "Doctor added", data: doctor });

  } catch (err) {
    const hospitalId = req.admin?.hospitalId;
    if (hospitalId) {
      const key = `${hospitalId}_${req.params?.categoryId}_${req.body?.name}`;
      doctorCreateLock.delete(key);
    }
    return res.status(500).json({ message: err.message });
  }
};



/**
 * List doctors for category
 * Optimized:
 *  - Pagination limits
 *  - DEV caching
 */
export const listDoctors = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const { categoryId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // ---------------- CACHE ----------------
    const cacheKey = `${hospitalId}_${categoryId}_${page}_${limit}`;
    if (doctorListCache.has(cacheKey)) {
      return res.json({
        page,
        limit,
        data: doctorListCache.get(cacheKey),
        cached: true
      });
    }
    // --------------------------------------

    const doctors = await service.listDoctorsForCategory(
      hospitalId,
      categoryId,
      skip,
      limit
    );

    doctorListCache.set(cacheKey, doctors);
    setTimeout(() => doctorListCache.delete(cacheKey), 30000); // 30s DEV cache

    return res.json({ page, limit, data: doctors });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



/**
 * Update doctor
 * Optimized:
 *  - Input sanitization
 *  - Ownership enforced in service layer
 */
export const updateDoctor = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const { id } = req.params;

    let { name, experience, specialization, imageUrl, qualification, about } = req.body;

    if (name) {
      name = name.trim();
      if (!name) {
        return res.status(400).json({ message: "Doctor name cannot be empty" });
      }
    }

    if (specialization) specialization = specialization.trim();
    if (qualification) qualification = qualification.trim();
    if (about) about = about.trim();

    const updated = await service.updateDoctorForHospital(id, hospitalId, {
      name,
      experience,
      specialization,
      imageUrl,
      qualification,
      about
    });

    return res.json({ message: "Updated", data: updated });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};



/**
 * Delete doctor
 */
export const deleteDoctor = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const { id } = req.params;

    await service.deleteDoctorForHospital(id, hospitalId);

    return res.json({ message: "Doctor deleted" });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
