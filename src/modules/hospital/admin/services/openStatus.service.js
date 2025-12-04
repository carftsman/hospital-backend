// src/modules/hospital/admin/services/openStatus.service.js

import {
  updateHospitalOpenStatus,
  fetchHospitalOpenStatus
} from "../repositories/openStatus.repository.js";

export const setHospitalOpenStatus = async (id, isOpen) => {
  return await updateHospitalOpenStatus(id, isOpen);
};

export const getHospitalOpenStatus = async (id) => {
  const record = await fetchHospitalOpenStatus(id);
  return record?.isOpen;
};
