import prisma from "../../../../prisma/client.js";
import { comparePassword, signToken } from "../../../../utils/auth.js";


// --- SIMPLE DEV RATE LIMITER (no Redis needed) ---
const loginAttempts = new Map(); // email → { count, lastAttempt }

// --- Cleanup every 10 minutes (to avoid memory growth) ---
setInterval(() => loginAttempts.clear(), 10 * 60 * 1000);


export const loginHospitalOwner = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Normalize email
    email = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // --- RATE LIMITING (DEV-SAFE, NO REDIS) ---
    const now = Date.now();
    const attempt = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };

    // 5 attempts in last 5 minutes → block temporarily
    if (attempt.count >= 5 && now - attempt.lastAttempt < 5 * 60 * 1000) {
      return res.status(429).json({
        message: "Too many failed attempts. Try again after 5 minutes."
      });
    }

    attempt.count++;
    attempt.lastAttempt = now;
    loginAttempts.set(email, attempt);

    // Query only required fields
    const hospital = await prisma.hospital.findUnique({
      where: { ownerEmail: email },
      select: {
        id: true,
        name: true,
        ownerEmail: true,
        ownerPassword: true,
        status: true
      }
    });

    // Always generic error (security best practice)
    if (!hospital) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Approval status check
    if (hospital.status === "PENDING") {
      return res.status(403).json({
        message: "Your hospital application is still pending approval"
      });
    }

    if (hospital.status === "REJECTED") {
      return res.status(403).json({
        message: "Your hospital application was rejected"
      });
    }

    // Compare password
    const isMatch = await comparePassword(password, hospital.ownerPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // SUCCESS → Reset attempt counter
    loginAttempts.delete(email);

    // Generate JWT
    const token = signToken({
      id: hospital.id,
      hospitalId: hospital.id,
      ownerEmail: hospital.ownerEmail,
      role: "HOSPITAL_ADMIN",
    });

    return res.json({
      message: "Login successful",
      token,
      hospital: {
        id: hospital.id,
        name: hospital.name,
        ownerEmail: hospital.ownerEmail
      }
    });

  } catch (err) {
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
};
