// src/modules/hospital/admin/services/doctor.service.js
import * as repo from "../repositories/doctor.repository.js";
import prisma from "../../../../prisma/client.js";
export const createDoctorForCategory = async (hospitalId, categoryId, payload) => {

  // 1️⃣ Verify that category belongs to this hospital
  const category = await prisma.category.findFirst({
    where: {
      id: Number(categoryId),
      hospitalId: Number(hospitalId)
    }
  });

  if (!category) {
    throw new Error("Invalid category: This category does not belong to your hospital.");
  }

  // 2️⃣ Create doctor after validation
  return repo.createDoctor({
    ...payload,
    categoryId: Number(categoryId),
    hospitalId: Number(hospitalId),
  });
};


export const listDoctorsForCategory = async (hospitalId, categoryId, skip = 0, take = 20) => {
  return repo.getDoctorsByCategory(categoryId, hospitalId, skip, take);
};

export const updateDoctorForHospital = async (id, hospitalId, changes) => {
  const result = await repo.updateDoctor(id, hospitalId, changes);
  if (result.count === 0) throw new Error("Doctor not found or not allowed.");

  return repo.getDoctor(id, hospitalId);
};

export const deleteDoctorForHospital = async (id, hospitalId) => {
  const result = await repo.deleteDoctor(id, hospitalId);
  if (result.count === 0) throw new Error("Doctor not found or not allowed.");

  return { success: true };
};
