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
    emContactName,
    emContactNumber
  } = body;

  // ✅ Convert UI value (+ve/-ve) → DB enum
  if (bloodGroup) {
    if (!BloodGroupValue[bloodGroup]) {
      throw new Error("INVALID_BLOOD_GROUP");
    }
    bloodGroup = BloodGroupValue[bloodGroup];
  }

  const user = await updateUserProfile(userId, {
    fullName,
    email: email?.toLowerCase(),
    bloodGroup,
    emContactName,
    emContactNumber,
    onboardingStage: "COMPLETED"
  });

  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    bloodGroup: BloodGroupLabel[user.bloodGroup],
    emContactName: user.emContactName,
    emContactNumber: user.emContactNumber,
    onboardingStage: user.onboardingStage
  };
};

export const getProfileService = async (userId) => {
    const user = await getUserProflileById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    return{
        ...user,
        bloodGroup: BloodGroupLabel[user.bloodGroup]
    }
};