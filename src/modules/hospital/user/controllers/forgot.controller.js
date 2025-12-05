import { findUserByPhone, findUserByEmail, updateUserPassword } from "../repositories/user.repository.js";
import { sendOtpTwilio, verifyOtpTwilio } from "../../../../utils/twilio.js";
import { hashPassword } from "../../../../utils/auth.js";
import { signShortToken } from "../../../../utils/auth.js";
import jwt from "jsonwebtoken";  

// 1️⃣ Step 1: User requests OTP for forgot password
export const requestForgotPassword = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({
        message: "Please enter phone or email"
      });
    }

    let user = null;

    if (phone) {
      user = await findUserByPhone(phone);
    }

    if (!user && email) {
      user = await findUserByEmail(email.toLowerCase());
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found with provided phone or email"
      });
    }

    // Always send OTP to the user's phone (NOT email)
    await sendOtpTwilio(user.phone);

    return res.json({
      message: "OTP sent successfully to your registered phone number"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// 2️⃣ Step 2: Verify OTP → return resetToken
export const verifyForgotOtp = async (req, res) => {
  try {
    const { phone, email, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    let user = null;

    if (phone) user = await findUserByPhone(phone);
    if (!user && email) user = await findUserByEmail(email.toLowerCase());

    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify OTP using phone
    const check = await verifyOtpTwilio(user.phone, otp);

    if (!check || check.status !== "approved") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Create a short-lived reset token
    const resetToken = signShortToken(
      { id: user.id, purpose: "FORGOT_PASSWORD" },
      "15m"
    );

    return res.json({
      message: "OTP verified",
      resetToken
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 3️⃣ Step 3: User resets password
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    // Verify token
    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (payload.purpose !== "FORGOT_PASSWORD") {
      return res.status(403).json({ message: "Invalid token purpose" });
    }

    const hashed = await hashPassword(newPassword);
    await updateUserPassword(payload.id, hashed);

    return res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

