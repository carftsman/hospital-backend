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

//get lab prescription
export const getUserPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const prescriptions = await prisma.labPrescription.findMany({
      where: {
        userId,
        labBookingId: null
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!prescriptions.length) {
      return res.json({
        message: "No prescriptions found",
        data: null
      });
    }

    // Group by groupId
    const groupedMap = {};

    prescriptions.forEach((item) => {
      const groupKey = item.groupId ?? `single-${item.id}`;

      if (!groupedMap[groupKey]) {
        groupedMap[groupKey] = {
          groupId: groupKey,
          createdAt: item.createdAt,
          files: []
        };
      }

      groupedMap[groupKey].files.push({
        id: item.id,
        fileUrl: item.fileUrl,
        fileType: item.fileType,
        status: item.status
      });
    });

    const groupedArray = Object.values(groupedMap);

    // 👇 Only latest group (already sorted by createdAt desc)
    const latestGroup = groupedArray[0];

    return res.json({
      message: "Latest prescription fetched successfully",
      data: latestGroup
    });

  } catch (error) {
    console.error("getUserPrescriptions error:", error);
    return res.status(500).json({
      message: "Failed to fetch prescriptions"
    });
  }
};

/**
 * Attach prescription to lab booking (post-booking)
 */
export const attachLabBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, labBookingId } = req.body;

    if (!groupId || !labBookingId) {
      return res.status(400).json({
        message: "groupId and labBookingId are required"
      });
    }

    // Check if prescriptions exist for this user + group
    const prescriptions = await prisma.labPrescription.findMany({
      where: {
        groupId,
        userId,
        labBookingId: null
      }
    });

    if (prescriptions.length === 0) {
      return res.status(404).json({
        message: "Prescription group not found"
      });
    }

    // Attach ALL files in group
    await prisma.labPrescription.updateMany({
      where: {
        groupId,
        userId
      },
      data: {
        labBookingId: Number(labBookingId),
        status: "SENT"
      }
    });

    return res.json({
      message: "Prescription group attached successfully"
    });

  } catch (error) {
    console.error("attachLabBooking error:", error);
    return res.status(500).json({
      message: "Failed to attach lab booking"
    });
  }
};