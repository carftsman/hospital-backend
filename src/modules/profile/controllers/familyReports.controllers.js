import {
  addHealthReportService,
  getHealthReportByIdService,
  getAllHealthReportsService,
  deleteHealthReportService
} from "../services/familyReports.services.js";


// UPLOAD
export const addHealthReport = async (req, res) => {
  try {
    const { familyMemberId } = req.body;
    const userId = req.user.id;

    if (!familyMemberId) {
      return res.status(400).json({
        message: "familyMemberId is required"
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one file is required"
      });
    }

    const reports = await addHealthReportService(
      Number(familyMemberId),
      req.files,
      userId
    );

    return res.status(201).json(reports);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


// GET BY ID
export const getHealthReportById = async (req, res) => {
  try {

    const id = Number(req.params.id);

    const report = await getHealthReportByIdService(
      id,
      req.user.id
    );

    return res.json(report);

  } catch (err) {
    return res.status(404).json({
      message: err.message
    });
  }
};


// GET ALL
export const getAllHealthReports = async (req, res) => {
  try {

    const familyMemberId = Number(req.params.familyMemberId);

    const reports = await getAllHealthReportsService(
      familyMemberId,
      req.user.id
    );

    return res.json(reports);

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};


// DELETE
export const removeHealthReport = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const result = await deleteHealthReportService(id, userId);

    return res.status(200).json(result);

  } catch (error) {
    if (error.message === "Health report not found") {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};