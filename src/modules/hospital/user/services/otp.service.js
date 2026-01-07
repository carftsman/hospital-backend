import jwt from "jsonwebtoken";
import {
  findUserByPhone,
  updateUserById
} from "../repositories/user.repository.js";

const STATIC_OTP = "007007";

export const sendStaticOtpService = async (phone) => {
  const user = await findUserByPhone(phone);

  if (!user) throw new Error("USER_NOT_FOUND");

  await updateUserById(user.id, {
    otpCode: STATIC_OTP,
    otpExpiresAt: new Date(Date.now() + 5 * 60000)
  });

  return { phone, otp: STATIC_OTP };
};

export const verifyStaticOtpService = async (phone, otp) => {
  const user = await findUserByPhone(phone);

  if (!user) throw new Error("USER_NOT_FOUND");
  if (otp !== STATIC_OTP) throw new Error("INVALID_OTP");

  const token = jwt.sign(
    { id: user.id, role: "USER" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  await updateUserById(user.id, {
    isPhoneVerified: true,
    otpCode: null,
    otpExpiresAt: null
  });

  return {
    token,
    user
  };
};