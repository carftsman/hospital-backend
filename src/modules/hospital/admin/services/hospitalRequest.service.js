// src/modules/hospital/admin/services/hospitalRequest.service.js
import {
  createHospitalRequest,
  findPendingRequests,
  updateHospitalStatus,
} from "../repositories/hospitalRequest.repository.js";

export const submitHospitalRequest = async (payload) => {
  const record = await createHospitalRequest(payload);
  return record;
};

export const getPendingRequests = async (skip = 0, take = 20) => {
  return await findPendingRequests(skip, take);
};

export const approveHospital = async (id) => {
  return await updateHospitalStatus(id, "APPROVED");
};

export const rejectHospital = async (id) => {
  return await updateHospitalStatus(id, "REJECTED");
};
