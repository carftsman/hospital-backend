import { updateUserProfile , getUserProflileById} from "../repositories/user.repository.js";
import prisma from "../../../../prisma/client.js";
import {
  BloodGroupLabel,
  BloodGroupValue
} from "../../../../utils/bloodGroup.mapper.js";

export const completeMedicalProfileService = async (userId, body) => {
  const {
    fullName,
    email,
    bloodGroup,
    gender,
    emContactName,
    emContactNumber
  } = body;
  // 1️⃣ Check user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  // 2️⃣ Prepare update data safely
  const updateData = {};

  if (fullName !== undefined) {
    updateData.fullName = fullName.trim();
  }

  // Email validation + uniqueness
  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase().trim();

    const emailExists = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        NOT: { id: userId }
      }
    });

    if (emailExists) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    updateData.email = normalizedEmail;
  }

  // Blood group validation
  if (bloodGroup !== undefined) {
    if (!BloodGroupValue[bloodGroup]) {
      throw new Error("INVALID_BLOOD_GROUP");
    }
    updateData.bloodGroup = BloodGroupValue[bloodGroup];
  }

  //  Gender validation
 if (gender !== undefined) {
  const normalizedGender = gender.trim().toUpperCase();

  const allowedGenders = ["MALE", "FEMALE", "OTHER"];

  if (!allowedGenders.includes(normalizedGender)) {
    throw new Error("INVALID_GENDER");
  }

  updateData.gender = normalizedGender;
}

  if (emContactName !== undefined) {
    updateData.emContactName = emContactName.trim();
  }

  if (emContactNumber !== undefined) {
    updateData.emContactNumber = emContactNumber.trim();
  }

  // 6️⃣ Mark onboarding complete
  updateData.isOnboardingCompleted = true;

  // 7️⃣ Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
  // 8️⃣ Clean response
  return {
    id: updatedUser.id,
    fullName: updatedUser.fullName,
    phone: updatedUser.phone,
    email: updatedUser.email,
    gender: updatedUser.gender,
    bloodGroup: BloodGroupLabel[updatedUser.bloodGroup],
    emContactName: updatedUser.emContactName,
    emContactNumber: updatedUser.emContactNumber,
    isOnboardingCompleted: updatedUser.isOnboardingCompleted
  };
};

export const getProfileService = async (userId) => {
    const user = await getUserProflileById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    return{
        ...user,
        bloodGroup: BloodGroupLabel[user.bloodGroup],
        gender: user.gender,
        isOnboardingCompleted: user.isOnboardingCompleted
    }
};