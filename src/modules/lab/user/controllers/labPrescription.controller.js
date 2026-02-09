import prisma from "../../../../prisma.js";
import { uploadToAzure } from "../../../../utils/azureBlob.js";

/**
 * Upload lab prescription (pre-booking)
 */
export const uploadPrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const fileUrl = await uploadToAzure(file);

    const prescription = await prisma.labPrescription.create({
      data: {
        userId,
        fileUrl,
        fileType: file.mimetype,
        status: "UPLOADED",
        labBookingId: null
      }
    });

     const responseData = {
      id: prescription.id,
      userId: prescription.userId,
      labBookingId: prescription.labBookingId,
      fileUrl: prescription.fileUrl,
      fileType: prescription.fileType,
      status: prescription.status,
      createdAt: prescription.createdAt
    };

    return res.status(201).json({
      message: "Prescription uploaded successfully",
      data: responseData
    });

  } catch (error) {
    console.error("uploadPrescription error:", error);
    return res.status(500).json({ message: "Failed to upload prescription" });
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