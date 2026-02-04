
import {
  sendOtpService,
  verifyStaticOtpService
} from "../services/otp.service.js";

/**
 * SEND OTP
 * Supports: phone OR email
 */
export const sendOtp = async (req, res) => {
  try {
    const { phone, email } = req.body;

    // 🔴 Validation
    if (!phone && !email) {
      return res.status(400).json({
        message: "Phone or Email is required"
      });
    }

    if (phone && email) {
      return res.status(400).json({
        message: "Use either phone or email, not both"
      });
    }

    const data = await sendOtpService({ phone, email });

    return res.json({
      message: "OTP sent successfully",
      ...data // static OTP (dev + prod as per your current setup)
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


/**
 * VERIFY OTP
 * Supports: phone OR email
 */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, email, otp } = req.body;

    //  Validation
    if ((!phone && !email) || !otp) {
      return res.status(400).json({
        message: "Phone or Email and OTP required"
      });
    }

    if (phone && email) {
      return res.status(400).json({
        message: "Use either phone or email, not both"
      });
    }

    const result = await verifyStaticOtpService({ phone, email, otp });

    return res.json({
      message: "Login successful",
      token: result.token,
      isOnboardingCompleted: result.user.isOnboardingCompleted,
      user: {
        id: result.user.id,
        phone: result.user.phone || null,
        email: result.user.email || null
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
