import { verifyToken } from "../utils/auth.js";

export default function userAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = header.split(" ")[1];
    const payload = verifyToken(token);

    // Expect payload to contain user id (or fallback to id)
    const userId = payload?.userId ?? payload?.id;
    if (!payload || !userId) {
      return res.status(403).json({ message: "Unauthorized token" });
    }

    req.user = {
      id: Number(userId),
      email: payload.email,
      role: payload.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
}
