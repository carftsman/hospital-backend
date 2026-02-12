import { updateUserProfile , getUserProflileById} from "../repositories/user.repository.js";
import {
  BloodGroupLabel,
  BloodGroupValue
} from "../../../../utils/bloodGroup.mapper.js";

export const completeMedicalProfileService = async (userId, body) => {
  let {
    fullName,
    email,
    bloodGroup,
    gender,
    emContactName,
    emContactNumber
  } = body;

  //  Convert UI value (+ve/-ve) → DB enum
  if (bloodGroup) {
    if (!BloodGroupValue[bloodGroup]) {
      throw new Error("INVALID_BLOOD_GROUP");
    }
    bloodGroup = BloodGroupValue[bloodGroup];
  }

  // Validate gender (if provided)
  if (gender) {
    const allowedGenders = ["MALE", "FEMALE", "OTHER"];
    if (!allowedGenders.includes(gender)) {
      throw new Error("INVALID_GENDER");
    }
  }

  const user = await updateUserProfile(userId, {
    fullName,
    email: email?.toLowerCase(),
    bloodGroup,
    gender,
    emContactName,
    emContactNumber,
    // onboardingStage: "COMPLETED"
    isOnboardingCompleted: true
  });

  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    gender: user.gender,
    bloodGroup: BloodGroupLabel[user.bloodGroup],
    emContactName: user.emContactName,
    emContactNumber: user.emContactNumber,
    // onboardingStage: user.onboardingStage
    isOnboardingCompleted: user.isOnboardingCompleted
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