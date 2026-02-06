import multer from "multer";

const storage = multer.memoryStorage();

export const uploadPrescription = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // ✅ 500 MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, PDF allowed"));
    }
    cb(null, true);
  },
});
