import { findHospitalsByStatus } from "../repositories/hospitalStatus.repository.js";

export const listApprovedHospitals = (skip = 0, take = 20) => {
  return findHospitalsByStatus("APPROVED", skip, take);
};

export const listRejectedHospitals = (skip = 0, take = 20) => {
  return findHospitalsByStatus("REJECTED", skip, take);
};

export const listPendingHospitals = (skip = 0, take = 20) => {
  return findHospitalsByStatus("PENDING", skip, take);
};
