 
 import {
  sendOtpService,
  verifyStaticOtpService
} from "../services/otp.service.js";

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    const data = await sendOtpService(phone);

    return res.json({
      message: "OTP sent successfully",
      ...data // otp appears only in dev
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone & OTP required" });
    }

    const result = await verifyStaticOtpService(phone, otp);

    return res.json({
      message: "Login successful",
      token: result.token,
      isOnboardingCompleted: result.user.isOnboardingCompleted,
      user: {
        id: result.user.id,
        phone: result.user.phone
      }
    });

  } catch (err) {
    if (err.message === "INVALID_OTP") {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(500).json({ message: err.message });
  }
};
