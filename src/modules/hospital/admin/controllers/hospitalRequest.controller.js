import prisma from "../../../../prisma/client.js";
import { hashPassword } from "../../../../utils/auth.js";
import {
  submitHospitalRequest,
  getPendingRequests,
  approveHospital,
  rejectHospital,
} from "../services/hospitalRequest.service.js";

import { geocodeAddress } from "../../../../utils/geocode.js";

// Simple in-memory idempotency cache (Resets when server restarts)
const requestCache = new Map();

export const submitRequest = async (req, res) => {
  try {
    let {
      name,
      location,
      place,
      imageUrl,
      pinCode,
      contactName,
      contactNumber,
      ownerEmail,
      ownerPassword,
      confirmPassword,
      speciality,
      consultationMode
    } = req.body;

    // --- NORMALIZATION ---
    if (ownerEmail) ownerEmail = ownerEmail.trim().toLowerCase();

    // --- BASIC VALIDATION ---
    if (!name || !location || !pinCode || !ownerEmail || !ownerPassword || !confirmPassword) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    if (ownerPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Pincode validation (India)
    if (!/^[1-9][0-9]{5}$/.test(pinCode)) {
      return res.status(400).json({ message: "Invalid pin code" });
    }

    // Allowed consultation modes
    const allowedModes = ["ONLINE", "OFFLINE", "BOTH"];
    if (consultationMode && !allowedModes.includes(consultationMode)) {
      return res.status(400).json({ message: "Invalid consultationMode" });
    }

    // --- IDEMPOTENCY (Anti-duplicate click protection) ---
    if (requestCache.has(ownerEmail)) {
      return res.status(409).json({ message: "Request already being processed" });
    }
    requestCache.set(ownerEmail, true);

    // --- PERFORMANCE: Check email existence BEFORE hashing ---
    const existing = await prisma.hospital.findUnique({
      where: { ownerEmail },
      select: { id: true }  // field-level select optimization
    });

    if (existing) {
      requestCache.delete(ownerEmail);
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(ownerPassword);

    // --- GEOCODING (non-blocking) ---
    let geo = null;
    try {
      geo = await geocodeAddress({ location, place, pinCode });
    } catch (err) {
      console.error("Geocode failed:", err.message);
    }

    const payload = {
      name,
      location,
      place: place || null,
      imageUrl: imageUrl || null,
      pinCode,
      contactName: contactName || null,
      contactNumber: contactNumber || null,
      ownerEmail,
      ownerPassword: hashedPassword,
      speciality: speciality || null,
      isOpen: true,
      isListed: true,
      ...(consultationMode ? { consultationMode } : {}),
      ...(geo ? { latitude: geo.latitude, longitude: geo.longitude } : {})
    };

    const record = await submitHospitalRequest(payload);
    requestCache.delete(ownerEmail); // clear idempotency lock

    return res.status(201).json({
      message: "Hospital registration request submitted.",
      data: record
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};



// 2️⃣ Marketing Team → Get Pending Requests
export const getPending = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const requests = await getPendingRequests(skip, limit);

    return res.json({
      page,
      limit,
      data: requests
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// 3️⃣ Marketing Team → Approve a Hospital
export const approve = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await approveHospital(id);

    return res.json({
      message: "Hospital approved successfully",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// 4️⃣ Marketing Team → Reject a Hospital
export const reject = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await rejectHospital(id);

    return res.json({
      message: "Hospital rejected",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
