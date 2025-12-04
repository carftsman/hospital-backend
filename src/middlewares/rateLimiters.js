// src/middlewares/rateLimiters.js
import rateLimit from "express-rate-limit";

export const nearbyLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 8,              // max 8 requests per IP per window
  message: { message: "Too many requests, please slow down." },
  standardHeaders: true,
  legacyHeaders: false
});
