// src/modules/hospital/admin/routes/upload.routes.js
import express from "express";
import multer from "multer";
import cloudinary from "../../../../cloud/cloudinary.js";
import streamifier from "streamifier";

/* ----------------------- UPLOAD SAFETY CONFIG ----------------------- */

// 5MB limit (production friendly)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1
  },
  fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  }
});

// Track duplicate uploads (dev idempotency)
const uploadLocks = new Map();

/* --------------------------- CLOUDINARY UPLOAD --------------------------- */
const uploadToCloudinary = (buffer, folder = "app") => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Upload timeout"));
    }, 10000); // 10 sec timeout

    const cld_upload_stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        unique_filename: true,
        use_filename: false,
        overwrite: false,
        transformation: [
          { quality: "auto" },     // auto compression
          { fetch_format: "auto" } // auto convert to webp/webm etc
        ]
      },
      (error, result) => {
        clearTimeout(timeout);
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
};

/* ------------------------------- ROUTER ------------------------------- */

const router = express.Router();

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // IDEMPOTENCY (avoid double-click duplicates)
    const idKey = req.file.buffer.toString("base64").slice(0, 50);
    if (uploadLocks.has(idKey)) {
      return res.status(409).json({ message: "Duplicate upload detected" });
    }
    uploadLocks.set(idKey, true);
    setTimeout(() => uploadLocks.delete(idKey), 8000); // clear after 8s

    // EXTRA SAFETY: MIME type re-check
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(req.file.mimetype)) {
      uploadLocks.delete(idKey);
      return res.status(400).json({ message: "Invalid file type" });
    }

    // Upload
    const result = await uploadToCloudinary(req.file.buffer, "hospitals");

    // Return CDN URL
    return res.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);

    return res.status(500).json({
      message: "Upload failed",
      error: err.message || "Unknown error"
    });
  }
});

export default router;
