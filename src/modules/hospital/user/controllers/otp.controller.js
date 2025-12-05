import { findUserByPhone } from "../repositories/user.repository.js";
import { sendOtpTwilio, verifyOtpTwilio } from "../../../../utils/twilio.js";
import { signToken } from "../../../../utils/auth.js";

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ message: "Phone is required" });

    const user = await findUserByPhone(phone);
    if (!user) return res.status(404).json({ message: "Phone not registered" });

    await sendOtpTwilio(phone);

    return res.json({ message: "OTP sent successfully" });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp)
      return res.status(400).json({ message: "Phone & OTP required" });

    const check = await verifyOtpTwilio(phone, otp);

    if (check.status !== "approved") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await findUserByPhone(phone);

    const token = signToken({ id: user.id, role: "USER" });

    return res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
