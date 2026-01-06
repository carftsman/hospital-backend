import { completeMedicalProfileService , getProfileService } from "../services/profile.service.js";

export const completeMedicalProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware

    const user = await completeMedicalProfileService(userId, req.body);

    return res.json({
      message: "Medical profile updated successfully",
      user
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id; // from JWT middleware
        const user = await getProfileService(userId);
        return res.json({
            message: "User profile fetched successfully",
            user
        });
    } catch (err) {
    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
        return res.status(500).json({ message: err.message });
    }           
};
