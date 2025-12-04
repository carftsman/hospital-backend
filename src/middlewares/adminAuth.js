import { verifyToken } from "../utils/auth.js";

export default function adminAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = header.split(" ")[1];
    const payload = verifyToken(token);

    // Prefer explicit hospitalId, fallback to id (older tokens)
    const hospitalId = payload?.hospitalId ?? payload?.id;

    if (!payload || !hospitalId) {
      return res.status(403).json({ message: "Unauthorized token" });
    }

    req.admin = {
      id: payload.id,
      hospitalId: Number(hospitalId),
      role: payload.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
}
