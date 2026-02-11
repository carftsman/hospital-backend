import prisma from "../../../../prisma.js";
import { uploadToAzure } from "../../../../utils/azureBlob.js";
import { randomUUID } from "crypto";

export const uploadPrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files; // 👈 MULTIPLE FILES

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "At least one file is required" });
    }

    // Group all uploaded files together
    const groupId = randomUUID();

    const uploadedFiles = [];

    for (const file of files) {
      const fileUrl = await uploadToAzure(file);

      const record = await prisma.labPrescription.create({
        data: {
          userId,
          labBookingId: null,
          groupId,
          fileUrl,
          fileType: file.mimetype,
          status: "UPLOADED"
        }
      });

      uploadedFiles.push({
        id: record.id,
        fileUrl: record.fileUrl,
        fileType: record.fileType
      });
    }

    return res.status(201).json({
      message: "Prescription files uploaded successfully",
      data: {
        groupId,
        files: uploadedFiles
      }
    });

  } catch (error) {
    console.error("uploadPrescription error:", error);
    return res.status(500).json({ message: "Failed to upload prescriptions" });
  }
};

/**
 * Attach prescription to lab booking (post-booking)
 */
export const attachLabBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const prescriptionId = Number(req.params.id);
    const { labBookingId } = req.body;

    if (!labBookingId) {
      return res.status(400).json({ message: "labBookingId is required" });
    }

    // Ensure prescription belongs to user
    const prescription = await prisma.labPrescription.findFirst({
      where: { id: prescriptionId, userId }
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    const updated = await prisma.labPrescription.update({
      where: { id: prescriptionId },
      data: { labBookingId: Number(labBookingId) }
    });

    return res.json({
      message: "Lab booking attached successfully",
      data: updated
    });

  } catch (error) {
    console.error("attachLabBooking error:", error);
    return res.status(500).json({ message: "Failed to attach lab booking" });
  }
};