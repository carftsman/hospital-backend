import {
  listApprovedHospitals,
  listRejectedHospitals,
  listPendingHospitals
} from "../services/hospitalStatus.service.js";

// ---- helper to validate pagination ----
const normalizePagination = (req) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 20;

  if (page < 1) page = 1;
  if (limit < 1) limit = 20;
  if (limit > 100) limit = 100; // prevent overload

  return { page, limit, skip: (page - 1) * limit };
};

// -----------------------

export const getApprovedHospitals = async (req, res) => {
  try {
    const { page, limit, skip } = normalizePagination(req);
    const data = await listApprovedHospitals(skip, limit);

    return res.json({
      status: "success",
      count: data.length,
      page,
      limit,
      data
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getRejectedHospitals = async (req, res) => {
  try {
    const { page, limit, skip } = normalizePagination(req);
    const data = await listRejectedHospitals(skip, limit);

    return res.json({
      status: "success",
      count: data.length,
      page,
      limit,
      data
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPendingHospitals = async (req, res) => {
  try {
    const { page, limit, skip } = normalizePagination(req);
    const data = await listPendingHospitals(skip, limit);

    return res.json({
      status: "success",
      count: data.length,
      page,
      limit,
      data
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
